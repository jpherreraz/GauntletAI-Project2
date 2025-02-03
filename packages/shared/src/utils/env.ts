export const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(
      `Environment variable ${key} is not defined. ` +
      'Please check your .env file and make sure it is properly configured.'
    );
  }
  return value;
};

export const env = {
  SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY'),
} as const; 