import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export interface User {
  id: string;
  email: string;
  username?: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refetch: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await api.get('/auth/me');
        return res.data.user;
      } catch (error) {
        return null;
      }
    },
    retry: false,
  });

  return (
    <AuthContext.Provider value={{ user: data, isLoading, isAuthenticated: !!data, refetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
