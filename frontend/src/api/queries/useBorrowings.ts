import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingsApi } from '../endpoints/borrowings';
import { toast } from 'sonner';

export function useBorrowings() {
  return useQuery({
    queryKey: ['borrowings'],
    queryFn: borrowingsApi.getBorrowings,
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

export function useReturnMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (borrowingId: number) => borrowingsApi.returnBorrowing(borrowingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['borrowings'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      toast.success('Book returned successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to return book');
    },
  });
}
