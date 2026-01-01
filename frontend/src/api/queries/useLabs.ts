import { useQuery } from '@tanstack/react-query';
import { labsApi } from '../endpoints/labs';

export function useLabs() {
  return useQuery({
    queryKey: ['labs'],
    queryFn: labsApi.getLabs,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
