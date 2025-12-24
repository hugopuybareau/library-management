import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { borrowingsApi } from '../endpoints/borrowings';
import { toast } from 'sonner';

export function useBorrowings() {
  return useQuery({
    queryKey: ['borrowings'],
    queryFn: borrowingsApi.getBorrowings,
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
