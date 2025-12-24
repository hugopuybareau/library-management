import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '../endpoints/proposals';
import { toast } from 'sonner';

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: proposalsApi.getProposals,
  });
}

export function useCreateProposalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: proposalsApi.createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit proposal');
    },
  });
}

export function useUpdateProposalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, comments }: { id: number; status: string; comments?: string }) =>
      proposalsApi.updateProposal(id, status, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      toast.success('Proposal updated!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update proposal');
    },
  });
}
