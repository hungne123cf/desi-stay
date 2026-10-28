'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string, role?: 'student' | 'admin') => Promise<boolean>;
  register: (name: string, email: string, pass: string, role?: 'student' | 'admin') => Promise<boolean>;
  logout: () => void;
  switchRole: (role: 'student' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STUDENT: User = {
  id: 'usr-student-1',
  name: 'Aarav Sharma',
  email: 'aarav.sharma@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  role: 'student',
  phone: '+91 98765 43210',
  college: 'Christ University (Central Campus)'
};

const DEMO_ADMIN: User = {
  id: 'usr-admin-1',
  name: 'Pooja Sharma (Property Admin)',
  email: 'admin@desistays.com',
  avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
  role: 'admin',
  phone: '+91 99887 76655'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('desi_stay_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        // Default to student demo user for great initial exploration experience
        setUser(DEMO_STUDENT);
        localStorage.setItem('desi_stay_user', JSON.stringify(DEMO_STUDENT));
      }
    } catch {
      setUser(DEMO_STUDENT);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    // Simulating Google OAuth redirect / popup flow
    await new Promise((r) => setTimeout(r, 600));
    const googleUser: User = {
      id: `usr-google-${Date.now()}`,
      name: 'Rohan Verma (Google User)',
      email: 'rohan.verma@student.ac.in',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'student',
      phone: '+91 98123 45678',
      college: 'Delhi University'
    };
    setUser(googleUser);
    localStorage.setItem('desi_stay_user', JSON.stringify(googleUser));
    setIsLoading(false);
  };

  const loginWithEmail = async (email: string, _pass: string, role: 'student' | 'admin' = 'student') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const targetUser = email.toLowerCase().includes('admin') || role === 'admin' ? DEMO_ADMIN : {
      ...DEMO_STUDENT,
      email,
      name: email.split('@')[0]
    };
    setUser(targetUser);
    localStorage.setItem('desi_stay_user', JSON.stringify(targetUser));
    setIsLoading(false);
    return true;
  };

  const register = async (name: string, email: string, _pass: string, role: 'student' | 'admin' = 'student') => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };
    setUser(newUser);
    localStorage.setItem('desi_stay_user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('desi_stay_user');
  };

  const switchRole = (newRole: 'student' | 'admin') => {
    const updated = newRole === 'admin' ? DEMO_ADMIN : DEMO_STUDENT;
    setUser(updated);
    localStorage.setItem('desi_stay_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
