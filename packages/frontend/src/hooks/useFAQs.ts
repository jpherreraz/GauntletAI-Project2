import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';
import { FAQ, FAQCreate, FAQUpdate } from '@crm/shared/types/faq';

const FAQ_QUERY_KEY = 'faqs';

export const useFAQs = () => {
  return useQuery<FAQ[]>({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('createdAt', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faq: FAQCreate) => {
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...update }: FAQUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('faqs')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
    },
  });
}; 