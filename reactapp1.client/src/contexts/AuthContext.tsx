import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types/index';
import api from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (firstName: string, lastName: string, phoneNumber: string, password: string) => {
    const newUser = await api.register(firstName, lastName, phoneNumber, password);
    setUser(newUser);
  };

  const login = async (phoneNumber: string, password: string) => {
    const loggedInUser = await api.login(phoneNumber, password);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateUser = async (id: number, firstName: string, lastName: string, phoneNumber: string, password?: string, rowVersion?: string) => {
    const updatedUser = await api.updateUser(id, firstName, lastName, phoneNumber, password, rowVersion);
    // Only update the auth context if we're updating the current logged-in user
    if (id === user?.id) {
      setUser(updatedUser);
    }
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
