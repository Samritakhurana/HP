import { queryClient } from './queryClient';
import type { User } from '@shared/schema';
import { useEffect, useState } from 'react';

// Authentication utility functions to replace Supabase auth
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

export const signIn = async (email: string, password: string) => {
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store user data in localStorage for session management
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'employee' = 'employee') => {
  try {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name: fullName, role }),
    });
    
    // Store user data in localStorage for session management
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const signOut = async () => {
  try {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    
    // Clear all queries in react-query cache
    queryClient.clear();
    
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    return user;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
};

// Hook for getting current user in components
export const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };
    
    loadUser();
  }, []);
  
  return user;
};