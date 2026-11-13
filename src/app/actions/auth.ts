"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthState {
  success?: boolean;
  error?: string;
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signInAdmin(
  _prevState: AuthState | null,
  formData: FormData
): Promise<AuthState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase() || "";
  const password = (formData.get("password") as string)?.trim() || "";

  if (!email || !EMAIL_REGEX.test(email) || email.includes("..")) {
    return { success: false, error: "Please enter a valid admin email address.", email };
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Please enter your admin password (at least 6 characters).", email };
  }

  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: "Supabase connection is not configured yet. Please check environment variables.",
        email,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message === "Invalid login credentials"
          ? "Invalid email or password. Please verify your credentials or create the admin user in Supabase."
          : error.message,
        email,
      };
    }

    if (!data.user) {
      return { success: false, error: "Could not authenticate admin user.", email };
    }
  } catch (err: any) {
    // If redirect throws NEXT_REDIRECT, let Next.js handle it
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("Sign in exception:", err);
    return { success: false, error: "An unexpected error occurred during sign in.", email };
  }

  redirect("/admin");
}

export async function signOutAdmin(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
  } catch (err: any) {
    if (err?.digest?.startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("Sign out warning:", err);
  }

  redirect("/admin/login");
}

export async function getCurrentAdmin() {
  try {
    const supabase = await createServerSupabaseClient();
    if (!supabase) return null;

    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;

    return {
      id: user.id,
      email: user.email || "admin@havenpaws.org",
    };
  } catch (err) {
    console.warn("Notice: Auth session check error:", err);
    return null;
  }
}
