import { useQuery } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';
import type { User } from '@crm/shared/types/user';

const PROFILE_QUERY_KEY = 'profile';

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) {
        console.log('useProfile: No userId provided');
        return null;
      }

      console.log('useProfile: Fetching profile for userId:', userId);

      // First try to get the profile from the edge function
      try {
        const { data: profileData, error: profileError } = await supabase.functions.invoke('get-user-profile', {
          body: { userId }
        });

        if (profileError) {
          console.error('useProfile: Error fetching profile from edge function:', profileError);
          throw profileError;
        }

        if (profileData) {
          console.log('useProfile: Profile data from edge function:', profileData);
          return [profileData]; // Wrap in array to match existing structure
        }
      } catch (error) {
        console.error('useProfile: Edge function call failed:', error);
      }

      // Fallback to direct RPC call if edge function fails
      console.log('useProfile: Falling back to RPC call');
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });

      if (error) {
        console.error('useProfile: Error fetching profile from RPC:', error);
        throw error;
      }

      console.log('useProfile: Profile data from RPC:', data);
      return data;
    },
    enabled: !!userId,
    retry: 2,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}; 