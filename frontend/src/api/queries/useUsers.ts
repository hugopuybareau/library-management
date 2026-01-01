import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../endpoints/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
