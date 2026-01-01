import { useAuthStore } from '@/stores/authStore';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * Simple fetch wrapper for API calls
 */
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Critical for session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized - clear auth and redirect to login
  if (response.status === 401) {
    // Clear the auth store to prevent redirect loops
    useAuthStore.getState().logout();

    // Only redirect if not already on auth page
    if (!window.location.pathname.includes('/auth')) {
      window.location.href = '/auth';
    }
    throw new Error('Unauthorized');
  }

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const apiClient = {
  get: (endpoint: string) => apiFetch(endpoint, { method: 'GET' }),

  post: (endpoint: string, data?: any) =>
    apiFetch(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any) =>
    apiFetch(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string) => apiFetch(endpoint, { method: 'DELETE' }),
};
