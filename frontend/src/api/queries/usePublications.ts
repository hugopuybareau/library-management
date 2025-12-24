import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsApi } from '../endpoints/publications';
import { borrowingsApi } from '../endpoints/borrowings';
import { toast } from 'sonner';

export function usePublications(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ['publications', filters],
    queryFn: () => publicationsApi.getPublications(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function usePublication(id: number) {
  return useQuery({
    queryKey: ['publication', id],
    queryFn: () => publicationsApi.getById(id),
    enabled: !!id,
  });
}

export function useBorrowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ publicationId, labId }: { publicationId: number; labId: number }) =>
      borrowingsApi.createBorrowing(publicationId, labId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      toast.success('Book borrowed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to borrow book');
    },
  });
}
