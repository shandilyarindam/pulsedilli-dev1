import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gfmuovhotikrxurlihlr.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbXVvdmhvdGlrcnh1cmxpaGxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3Mzg3ODIsImV4cCI6MjA5ODMxNDc4Mn0.gXYWDwkP_0qzU_pIXDctwYi93vvi6N9ahGLfS5goeWU";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
