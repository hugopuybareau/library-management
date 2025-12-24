import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useLoginMutation() {
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async () => {
      // Fetch full user data
      const fullUser = await authApi.getCurrentUser();
      setUser(fullUser);
      navigate('/dashboard');
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Login failed');
    },
  });
}

export function useLogoutMutation() {
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/auth');
      toast.success('Logged out successfully');
    },
  });
}
