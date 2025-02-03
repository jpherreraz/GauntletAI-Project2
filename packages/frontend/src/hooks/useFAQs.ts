import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@crm/shared/utils/api-client';
import { FAQ, FAQCreate, FAQUpdate } from '@crm/shared/types/faq';

const FAQ_QUERY_KEY = 'faqs';

export const useFAQs = () => {
  return useQuery<FAQ[]>({
    queryKey: [FAQ_QUERY_KEY],
    queryFn: async () => {
      console.log('🔍 useFAQs: Fetching FAQs');
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ useFAQs: Error fetching FAQs:', error);
        throw error;
      }

      console.log('✅ useFAQs: FAQs fetched:', data);
      return data;
    },
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (faq: FAQCreate) => {
      console.log('🔍 useCreateFAQ: Creating FAQ:', faq);
      const { data, error } = await supabase
        .from('faqs')
        .insert(faq)
        .select()
        .single();

      if (error) {
        console.error('❌ useCreateFAQ: Error creating FAQ:', error);
        throw error;
      }

      console.log('✅ useCreateFAQ: FAQ created:', data);
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
      console.log('🔍 useUpdateFAQ: Updating FAQ:', { id, update });
      const { data, error } = await supabase
        .from('faqs')
        .update(update)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ useUpdateFAQ: Error updating FAQ:', error);
        throw error;
      }

      console.log('✅ useUpdateFAQ: FAQ updated:', data);
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
      console.log('🔍 useDeleteFAQ: Deleting FAQ:', id);
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ useDeleteFAQ: Error deleting FAQ:', error);
        throw error;
      }

      console.log('✅ useDeleteFAQ: FAQ deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FAQ_QUERY_KEY] });
    },
  });
}; 