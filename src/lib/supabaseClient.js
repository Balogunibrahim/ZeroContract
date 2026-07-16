import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jsvpkkvlnixehpixkkhs.supabase.co";
const supabaseAnonKey = "sb_publishable_kTlDNmur__vRGCes4ZwXkw_HPIsQ5KS";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);