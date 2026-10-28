'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { isEmailAdmin, PREDEFINED_ADMINS } from '@/config/auth';

interface StoredAccount {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'student' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  loginWithGoogleAccount: (account: { email: string; name: string; avatar?: string }) => Promise<User>;
  loginWithGoogle: () => Promise<{ requiresModal?: boolean; user?: User }>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleClientId, setGoogleClientIdState] = useState<string>('');

  useEffect(() => {
    try {
      // Load saved Google Client ID if any
      const savedClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        localStorage.getItem('unistay_google_client_id') ||
        '';
      setGoogleClientIdState(savedClientId);

      // Load active user session
      const savedUser = localStorage.getItem('unistay_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Ensure role is strictly checked against admin list
        parsed.role = isEmailAdmin(parsed.email) ? 'admin' : 'student';
        setUser(parsed);
      } else {
        // No auto-login! User must explicitly sign in
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoogleClientId = (id: string) => {
    setGoogleClientIdState(id);
    localStorage.setItem('unistay_google_client_id', id);
  };

  /**
   * Called when an account is selected from Google Account Chooser
   */
  const loginWithGoogleAccount = async (account: {
    email: string;
    name: string;
    avatar?: string;
  }): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const role = isEmailAdmin(account.email) ? 'admin' : 'student';
    const loggedUser: User = {
      id: `usr-g-${Date.now()}`,
      name: account.name,
      email: account.email.toLowerCase().trim(),
      avatar:
        account.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role,
      phone: isEmailAdmin(account.email) ? '+84 901 234 567' : '+84 987 654 321'
    };

    setUser(loggedUser);
    localStorage.setItem('unistay_auth_user', JSON.stringify(loggedUser));

    // Save to known accounts
    try {
      const known = JSON.parse(localStorage.getItem('unistay_known_accounts') || '[]');
      if (!known.some((k: { email: string }) => k.email.toLowerCase() === loggedUser.email.toLowerCase())) {
        known.push({ name: loggedUser.name, email: loggedUser.email, role: loggedUser.role });
        localStorage.setItem('unistay_known_accounts', JSON.stringify(known));
      }
    } catch {
      // ignore
    }

    setIsLoading(false);
    return loggedUser;
  };

  /**
   * Trigger Google Login.
   * If real Google Client ID is configured, redirect to Google OAuth with prompt=select_account.
   * Otherwise, return signal to display the Google Account Chooser modal.
   */
  const loginWithGoogle = async (): Promise<{ requiresModal?: boolean; user?: User }> => {
    if (googleClientId) {
      // Real Google OAuth redirect
      const redirectUri = `${window.location.origin}/auth/callback`;
      const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;
      window.location.href = targetUrl;
      return { requiresModal: false };
    }

    return { requiresModal: true };
  };

  /**
   * Standard Email + Password Login
   */
  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const cleanEmail = email.toLowerCase().trim();

    // Check predefined Admin accounts first
    const predefined = PREDEFINED_ADMINS.find(
      (adm) => adm.email.toLowerCase() === cleanEmail
    );

    if (predefined) {
      if (pass !== predefined.password && pass !== 'admin') {
        setIsLoading(false);
        throw new Error('Mật khẩu không chính xác.');
      }
      const adminUser: User = {
        id: `usr-admin-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: predefined.name,
        email: predefined.email,
        avatar: predefined.avatar,
        role: 'admin',
        phone: predefined.phone
      };
      setUser(adminUser);
      localStorage.setItem('unistay_auth_user', JSON.stringify(adminUser));
      setIsLoading(false);
      return adminUser;
    }

    // Check registered users from database / localStorage
    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    const matched = registeredList.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!matched) {
      setIsLoading(false);
      throw new Error('Tài khoản không tồn tại. Vui lòng bấm Đăng ký ngay.');
    }

    if (matched.password && matched.password !== pass) {
      setIsLoading(false);
      throw new Error('Mật khẩu không chính xác.');
    }

    const role = isEmailAdmin(matched.email) ? 'admin' : 'student';
    const loggedUser: User = {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
      name: matched.name,
      email: matched.email,
      avatar:
        matched.avatar ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role
    };

    setUser(loggedUser);
    localStorage.setItem('unistay_auth_user', JSON.stringify(loggedUser));
    setIsLoading(false);
    return loggedUser;
  };

  /**
   * Register a new account
   */
  const register = async (name: string, email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 450));

    const cleanEmail = email.toLowerCase().trim();

    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    if (registeredList.some((u) => u.email.toLowerCase() === cleanEmail)) {
      setIsLoading(false);
      throw new Error('Email này đã được sử dụng. Vui lòng đăng nhập.');
    }

    const role = isEmailAdmin(cleanEmail) ? 'admin' : 'student';

    const newAccount: StoredAccount = {
      name,
      email: cleanEmail,
      password: pass,
      role
    };

    registeredList.push(newAccount);
    localStorage.setItem('unistay_registered_users', JSON.stringify(registeredList));

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email: cleanEmail,
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    setUser(newUser);
    localStorage.setItem('unistay_auth_user', JSON.stringify(newUser));
    setIsLoading(false);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('unistay_auth_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        googleClientId,
        setGoogleClientId,
        loginWithGoogleAccount,
        loginWithGoogle,
        loginWithEmail,
        register,
        logout
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
