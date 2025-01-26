import { useQuery } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';

const PROFILE_QUERY_KEY = 'profile';

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });

      if (error) {
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
}; 