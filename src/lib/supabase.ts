import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

/**
 * Fail fast if required public envs are missing.
 * This makes `supabase` always a SupabaseClient (non-nullable) for client code.
 */
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to .env.local (or ensure the deployment sets them).'
  );
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'gurusetu-app',
    },
  },
});

// Admin client (nullable because it's intended for server-side with service key)
export const supabaseAdmin: SupabaseClient | null =
  serviceKey && supabaseUrl
    ? createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
        global: { headers: { 'X-Client-Info': 'gurusetu-admin' } },
      })
    : null;

// Server-side client factory (returns null if service key missing)
export const createServerClient = () => {
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export const isDevMode = () => !supabaseUrl || !supabaseAnonKey;

/**
 * Optional helper: try an operation and fall back to provided fallback data
 * (keeps behaviour similar to what you had). Since supabase is non-nullable,
 * we don't need to check it here.
 */
export const withFallback = async <T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T
): Promise<{ data: T; error: null }> => {
  try {
    const result = await operation();
    if (result.error) {
      console.warn('Database operation failed, using fallback:', result.error);
      return { data: fallbackData, error: null };
    }
    return { data: (result.data ?? fallbackData) as T, error: null };
  } catch (error) {
    console.warn('Database connection failed, using fallback:', error);
    return { data: fallbackData, error: null };
  }
};

/* --- schema interfaces (keep/update as needed) --- */

export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: 'student' | 'faculty';
  roll_number?: string;
}

export interface Student {
  id: string;
  user_id: string;
  name: string;
  roll_number: string;
  department_id: string;
  year: number;
  area_of_interest?: string;
  resume_url?: string;
}

export interface Faculty {
  id: string;
  user_id: string;
  name: string;
  employee_id: string;
  department_id: string;
  designation?: string;
  cabin_block?: string;
  cabin_floor?: number;
  cabin_number?: string;
  area_of_interest?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
}
