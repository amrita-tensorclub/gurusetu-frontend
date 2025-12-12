import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Using mock client for development.');
}

// Create mock client for development when env vars are missing
const createMockClient = () => ({
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: () => ({ data: null, error: null }),
    update: () => ({ data: null, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: function(this: any) { return this; },
    neq: function(this: any) { return this; },
    single: function(this: any) { return { data: null, error: null }; }
  }),
  auth: {
    signUp: () => ({ data: null, error: null }),
    signInWithPassword: () => ({ data: null, error: null }),
    signOut: () => ({ error: null })
  }
});

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockClient();

export const supabaseAdmin = serviceKey && supabaseUrl
  ? createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : createMockClient() as any;

// Server-side client factory (for cases where you need to create multiple instances)
export const createServerClient = () => {
  if (!supabaseUrl || !serviceKey) {
    return createMockClient() as any;
  }
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Database types based on your schema
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