'use client';

import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  const { user, loading, login, logout } = useAuthContext();
  return {
    user,
    isAuthenticated: !!user,
    role: user?.role || null,
    loading,
    login,
    logout,
  };
}
