import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = "https://puwjprtxpmxwasjxdmyc.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "sb_publishable_M__kfpuACWVtGH3G2QLmCA_Ts_4ELwT";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith("https://") &&
    !supabaseUrl.includes("your-project")
  );
};

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createClient();

