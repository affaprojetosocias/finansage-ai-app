
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your own Supabase project URL and anon key.
// You can find these in your Supabase project settings -> API.
// It is recommended to use environment variables for these values.
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.warn("Supabase credentials are not set. Please update services/supabase.ts with your project's URL and anon key.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
