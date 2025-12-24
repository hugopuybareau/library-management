import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'lab_manager' | 'user';

export interface User {
  email: string;
  name: string;
  role: UserRole;
  labAccess: string[];
  interests?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

// Mock users for demonstration
const mockUsers: Record<string, { password: string; user: User }> = {
  'admin@ecl.fr': {
    password: 'admin123',
    user: {
      email: 'admin@ecl.fr',
      name: 'Admin User',
      role: 'admin',
      labAccess: ['LIRIS', 'AMPERE', 'LTDS', 'ICJ', 'LMFA'],
    },
  },
  'manager@ecl.fr': {
    password: 'manager123',
    user: {
      email: 'manager@ecl.fr',
      name: 'Lab Manager',
      role: 'lab_manager',
      labAccess: ['LIRIS', 'AMPERE'],
    },
  },
  'user@ecl.fr': {
    password: 'user123',
    user: {
      email: 'user@ecl.fr',
      name: 'Regular User',
      role: 'user',
      labAccess: ['LIRIS'],
      interests: ['computer science', 'algorithms', 'machine learning'],
    },
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const userData = mockUsers[email.toLowerCase()];
        
        if (!userData || userData.password !== password) {
          set({ isLoading: false });
          throw new Error('Invalid email or password');
        }

        set({
          user: userData.user,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
