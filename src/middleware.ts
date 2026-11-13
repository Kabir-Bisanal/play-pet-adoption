import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.includes("auth-token") ||
        cookie.name.startsWith("sb-") ||
        cookie.name.includes("supabase")
    );
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const hasAuthToken = hasSupabaseAuthCookie(request);

  // Fast-path: Unauthenticated visitor visiting /admin/login has no session cookies.
  // Bypass external Supabase network call completely for instant page load.
  if (pathname === "/admin/login" && !hasAuthToken) {
    return response;
  }

  // Fast-path: Unauthenticated visitor attempting to access protected /admin/* routes.
  // Immediately redirect to login without an unnecessary remote network trip.
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !hasAuthToken) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Auth token cookie is present: verify session with Supabase SSR
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If visiting /admin/login while already logged in -> redirect to /admin
  if (pathname === "/admin/login" && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  // If visiting /admin or any /admin/* (except /admin/login) with invalid/expired token -> redirect to /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login" && !user) {
    const loginUrl = new URL("/admin/login", request.url);
    if (pathname !== "/admin") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
