import { useQuery } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';
import type { User } from '@crm/shared/types/user';

const PROFILES_QUERY_KEY = 'profiles';

export const useProfiles = () => {
  return useQuery({
    queryKey: [PROFILES_QUERY_KEY, 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          created_at,
          updated_at
        `);

      if (error) {
        throw error;
      }

      return data as User[];
    },
  });
}; 