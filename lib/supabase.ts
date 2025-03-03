import { createClient } from '@supabase/supabase-js';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from './database.types';

// For client components
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  
  return createClient<Database>(supabaseUrl, supabaseKey);
};

// For server components
export const createServerSupabaseClient = () => {
  return createServerComponentClient<Database>({
    cookies,
  });
}; 