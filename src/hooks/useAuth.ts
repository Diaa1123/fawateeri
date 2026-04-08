'use client';

import { useState, useEffect } from 'react';
import { UserRole, AuthUser } from '@/types/user';

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);

      // Parse stored user
      const parsedUser = JSON.parse(storedUser);

      // Migration: If old format with displayName, convert to display_name
      if ('displayName' in parsedUser && !('display_name' in parsedUser)) {
        parsedUser.display_name = parsedUser.displayName;
        delete parsedUser.displayName;
        // Update localStorage with new format
        localStorage.setItem('auth_user', JSON.stringify(parsedUser));
      }

      setUser(parsedUser);
    }

    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        // Save to localStorage
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));

        // Update state
        setToken(data.token);
        setUser(data.user);

        return data;
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'حدث خطأ أثناء الاتصال بالخادم',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
