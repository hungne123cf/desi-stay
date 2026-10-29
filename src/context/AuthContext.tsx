'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { isEmailAdmin, PREDEFINED_ADMINS } from '@/config/auth';

export interface StoredAccount {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  role: 'student' | 'admin';
  lastLoginAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
  knownAccounts: StoredAccount[];
  removeKnownAccount: (email: string) => void;
  loginWithGoogleAccount: (account: { email: string; name: string; avatar?: string }) => Promise<User>;
  loginWithGoogle: () => Promise<{ requiresModal?: boolean; user?: User }>;
  loginWithEmail: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string) => Promise<User>;
  resetPassword: (email: string, newPass: string) => Promise<void>;
  logout: () => void;
}

const DEFAULT_KNOWN_ACCOUNTS: StoredAccount[] = [
  {
    name: 'Trương Hùng',
    email: 'truongvantuan43344@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    role: 'admin'
  },
  {
    name: 'Truong Hung (K18 CT)',
    email: 'hungtce181568@fpt.edu.vn',
    role: 'student'
  }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleClientId, setGoogleClientIdState] = useState<string>('');
  const [knownAccounts, setKnownAccounts] = useState<StoredAccount[]>([]);

  // Load initial state from localStorage
  useEffect(() => {
    try {
      const savedClientId =
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
        localStorage.getItem('unistay_google_client_id') ||
        '';
      setGoogleClientIdState(savedClientId);

      // Load known Google accounts in browser
      const savedKnown = localStorage.getItem('unistay_known_accounts');
      if (savedKnown) {
        const parsedKnown = JSON.parse(savedKnown);
        if (Array.isArray(parsedKnown) && parsedKnown.length > 0) {
          setKnownAccounts(parsedKnown);
        } else {
          setKnownAccounts(DEFAULT_KNOWN_ACCOUNTS);
        }
      } else {
        setKnownAccounts(DEFAULT_KNOWN_ACCOUNTS);
        localStorage.setItem('unistay_known_accounts', JSON.stringify(DEFAULT_KNOWN_ACCOUNTS));
      }

      // Load active user session
      const savedUser = localStorage.getItem('unistay_auth_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        parsed.role = isEmailAdmin(parsed.email) ? 'admin' : 'student';
        setUser(parsed);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setGoogleClientId = (id: string) => {
    const clean = id.trim();
    setGoogleClientIdState(clean);
    if (clean) {
      localStorage.setItem('unistay_google_client_id', clean);
    } else {
      localStorage.removeItem('unistay_google_client_id');
    }
  };

  const saveKnownAccount = useCallback((acc: StoredAccount) => {
    setKnownAccounts((prev) => {
      const filtered = prev.filter((item) => item.email.toLowerCase() !== acc.email.toLowerCase());
      const updated = [{ ...acc, lastLoginAt: new Date().toISOString() }, ...filtered];
      try {
        localStorage.setItem('unistay_known_accounts', JSON.stringify(updated));
      } catch {
        // ignore storage quota errors
      }
      return updated;
    });
  }, []);

  const removeKnownAccount = useCallback((email: string) => {
    setKnownAccounts((prev) => {
      const updated = prev.filter((item) => item.email.toLowerCase() !== email.toLowerCase());
      try {
        localStorage.setItem('unistay_known_accounts', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  /**
   * Finalize Google sign-in with user profile details
   */
  const loginWithGoogleAccount = useCallback(
    async (account: { email: string; name: string; avatar?: string }): Promise<User> => {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 250));

      const cleanEmail = account.email.toLowerCase().trim();
      const role = isEmailAdmin(cleanEmail) ? 'admin' : 'student';
      const displayName =
        account.name?.trim() ||
        cleanEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

      const loggedUser: User = {
        id: `usr-g-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
        name: displayName,
        email: cleanEmail,
        avatar: account.avatar || undefined,
        role,
        phone: isEmailAdmin(cleanEmail) ? '+84 901 234 567' : undefined
      };

      setUser(loggedUser);
      localStorage.setItem('unistay_auth_user', JSON.stringify(loggedUser));

      saveKnownAccount({
        name: loggedUser.name,
        email: loggedUser.email,
        avatar: loggedUser.avatar,
        role: loggedUser.role
      });

      setIsLoading(false);
      return loggedUser;
    },
    [saveKnownAccount]
  );

  // Listen for OAuth popup callback messages
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'UNISTAY_GOOGLE_AUTH_SUCCESS' && event.data?.payload) {
        const { email, name, avatar } = event.data.payload;
        if (email) {
          await loginWithGoogleAccount({ email, name, avatar });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [loginWithGoogleAccount]);

  /**
   * Trigger Google Login.
   * If real Google Client ID is configured, opens Google OAuth 2.0 popup window (or redirects).
   * Otherwise, opens the realistic Google Account Chooser modal.
   */
  const loginWithGoogle = async (): Promise<{ requiresModal?: boolean; user?: User }> => {
    if (googleClientId) {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
        googleClientId
      )}&redirect_uri=${encodeURIComponent(
        redirectUri
      )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;

      // Open centered popup window for smooth OAuth experience
      const width = 500;
      const height = 620;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        targetUrl,
        'google_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
      );

      if (!popup) {
        // Fallback to full page redirect if popup blocked
        window.location.href = targetUrl;
        return { requiresModal: false };
      }

      // Wait for popup to complete authentication via postMessage
      return new Promise((resolve) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            const saved = localStorage.getItem('unistay_auth_user');
            if (saved) {
              try {
                resolve({ requiresModal: false, user: JSON.parse(saved) });
                return;
              } catch {
                // ignore
              }
            }
            resolve({ requiresModal: false });
          }
        }, 400);
      });
    }

    return { requiresModal: true };
  };

  /**
   * Standard Email + Password Login
   */
  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const cleanEmail = email.toLowerCase().trim();

    // Check registered users first (in case admin updated password)
    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    const matchedRegistered = registeredList.find((u) => u.email.toLowerCase() === cleanEmail);

    // Check predefined Admin accounts
    const predefined = PREDEFINED_ADMINS.find((adm) => adm.email.toLowerCase() === cleanEmail);

    if (predefined) {
      const expectedPassword = matchedRegistered?.password || predefined.password;
      if (pass !== expectedPassword) {
        setIsLoading(false);
        throw new Error('Email hoặc mật khẩu không chính xác.');
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
      saveKnownAccount({
        name: adminUser.name,
        email: adminUser.email,
        avatar: adminUser.avatar,
        role: 'admin'
      });
      setIsLoading(false);
      return adminUser;
    }

    if (!matchedRegistered) {
      setIsLoading(false);
      throw new Error('Tài khoản chưa được đăng ký. Vui lòng đăng ký tài khoản mới hoặc tiếp tục bằng Google.');
    }

    if (matchedRegistered.password && matchedRegistered.password !== pass) {
      setIsLoading(false);
      throw new Error('Email hoặc mật khẩu không chính xác.');
    }

    const role = isEmailAdmin(matchedRegistered.email) ? 'admin' : 'student';
    const loggedUser: User = {
      id: `usr-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '')}`,
      name: matchedRegistered.name,
      email: matchedRegistered.email,
      avatar: matchedRegistered.avatar,
      role
    };

    setUser(loggedUser);
    localStorage.setItem('unistay_auth_user', JSON.stringify(loggedUser));
    saveKnownAccount({
      name: loggedUser.name,
      email: loggedUser.email,
      avatar: loggedUser.avatar,
      role
    });
    setIsLoading(false);
    return loggedUser;
  };

  /**
   * Register a new account
   */
  const register = async (name: string, email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    if (pass.length < 6) {
      setIsLoading(false);
      throw new Error('Mật khẩu phải có tối thiểu 6 ký tự.');
    }

    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    if (
      registeredList.some((u) => u.email.toLowerCase() === cleanEmail) ||
      PREDEFINED_ADMINS.some((a) => a.email.toLowerCase() === cleanEmail)
    ) {
      setIsLoading(false);
      throw new Error('Địa chỉ email này đã được đăng ký. Vui lòng chuyển sang Đăng nhập.');
    }

    const role = isEmailAdmin(cleanEmail) ? 'admin' : 'student';

    const newAccount: StoredAccount = {
      name: cleanName,
      email: cleanEmail,
      password: pass,
      role
    };

    registeredList.push(newAccount);
    localStorage.setItem('unistay_registered_users', JSON.stringify(registeredList));

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role
    };

    setUser(newUser);
    localStorage.setItem('unistay_auth_user', JSON.stringify(newUser));
    saveKnownAccount({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    });
    setIsLoading(false);
    return newUser;
  };

  /**
   * Reset password for an existing email account
   */
  const resetPassword = async (email: string, newPass: string): Promise<void> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const cleanEmail = email.toLowerCase().trim();
    if (newPass.length < 6) {
      setIsLoading(false);
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    }

    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    const idx = registeredList.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    const predefined = PREDEFINED_ADMINS.find((a) => a.email.toLowerCase() === cleanEmail);

    if (idx === -1 && !predefined) {
      setIsLoading(false);
      throw new Error('Không tìm thấy tài khoản nào gắn với địa chỉ email này.');
    }

    if (idx !== -1) {
      registeredList[idx].password = newPass;
    } else if (predefined) {
      registeredList.push({
        name: predefined.name,
        email: predefined.email,
        password: newPass,
        avatar: predefined.avatar,
        role: 'admin'
      });
    }

    localStorage.setItem('unistay_registered_users', JSON.stringify(registeredList));
    setIsLoading(false);
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
        knownAccounts,
        removeKnownAccount,
        loginWithGoogleAccount,
        loginWithGoogle,
        loginWithEmail,
        register,
        resetPassword,
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
