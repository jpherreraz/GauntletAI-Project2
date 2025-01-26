import { useQuery } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';
import { User, UserRole } from '@crm/shared/types/user';

const WORKERS_QUERY_KEY = 'workers';

interface DbUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export const useWorkers = () => {
  return useQuery<User[]>({
    queryKey: [WORKERS_QUERY_KEY],
    queryFn: async () => {
      // Use RPC function to avoid RLS issues
      const { data, error } = await supabase
        .rpc('get_assignable_users');

      if (error) {
        console.error('Error fetching workers:', error);
        throw error;
      }

      console.log('Workers data from profiles:', data);

      const mappedUsers = (data || []).map((user: DbUser) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role as UserRole,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }));

      console.log('Mapped workers:', mappedUsers);

      return mappedUsers;
    },
  });
}; 