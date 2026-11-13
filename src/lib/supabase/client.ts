import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Database } from "./types";

let supabaseBrowserClient: SupabaseClient<Database> | null = null;

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  try {
    supabaseBrowserClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
    return supabaseBrowserClient;
  } catch (error) {
    console.warn("Failed to initialize Supabase browser client:", error);
    return null;
  }
}
