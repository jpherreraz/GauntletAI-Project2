import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new APIError(
      data.message || 'An error occurred',
      response.status,
      data
    );
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    }),
    
  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    
  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    
  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
}; 