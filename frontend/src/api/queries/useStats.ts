import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../endpoints/stats';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: statsApi.getStats,
    staleTime: 60 * 1000, // 1 minute
  });
}
