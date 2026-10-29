'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { DEFAULT_GOOGLE_CLIENT_ID, isEmailAdmin, PREDEFINED_ADMINS } from '@/config/auth';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [googleClientId, setGoogleClientIdState] = useState<string>(DEFAULT_GOOGLE_CLIENT_ID);
  const [knownAccounts, setKnownAccounts] = useState<StoredAccount[]>([]);

  useEffect(() => {
    try {
      const savedClientId =
        localStorage.getItem('unistay_google_client_id') || DEFAULT_GOOGLE_CLIENT_ID;
      setGoogleClientIdState(savedClientId);

      const savedKnown = localStorage.getItem('unistay_known_accounts');
      if (savedKnown) {
        const parsedKnown = JSON.parse(savedKnown);
        if (Array.isArray(parsedKnown)) {
          setKnownAccounts(parsedKnown);
        }
      }

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
    const clean = id.trim() || DEFAULT_GOOGLE_CLIENT_ID;
    setGoogleClientIdState(clean);
    localStorage.setItem('unistay_google_client_id', clean);
  };

  const saveKnownAccount = useCallback((acc: StoredAccount) => {
    setKnownAccounts((prev) => {
      const filtered = prev.filter((item) => item.email.toLowerCase() !== acc.email.toLowerCase());
      const updated = [{ ...acc, lastLoginAt: new Date().toISOString() }, ...filtered];
      try {
        localStorage.setItem('unistay_known_accounts', JSON.stringify(updated));
      } catch {
        // ignore
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

  const loginWithGoogleAccount = useCallback(
    async (account: { email: string; name: string; avatar?: string }): Promise<User> => {
      setIsLoading(true);

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

  // Sync user session across tabs/popups via BroadcastChannel and storage events
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('unistay_auth_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'UNISTAY_GOOGLE_AUTH_SUCCESS' && event.data?.user) {
          setUser(event.data.user);
          setIsLoading(false);
        }
      };
    } catch {
      // BroadcastChannel not supported in older environments
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'unistay_auth_user') {
        if (e.newValue) {
          try {
            setUser(JSON.parse(e.newValue));
          } catch {
            // ignore
          }
        } else {
          setUser(null);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  /**
   * Opens the real Google OAuth 2.0 Account Chooser (`accounts.google.com`)
   */
  const loginWithGoogle = async (): Promise<{ requiresModal?: boolean; user?: User }> => {
    const activeClientId = googleClientId || DEFAULT_GOOGLE_CLIENT_ID;
    if (!activeClientId) {
      return { requiresModal: true };
    }

    const redirectUri = `${window.location.origin}/auth/callback`;
    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      activeClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&state=popup&nonce=${Date.now()}`;

    const width = 500;
    const height = 640;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      targetUrl,
      'google_oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
    );

    if (!popup) {
      // Fallback to full page redirect if popup blocker prevented window.open
      const fullRedirectUrl = targetUrl.replace('&state=popup', '');
      window.location.href = fullRedirectUrl;
      return { requiresModal: false };
    }

    return new Promise((resolve) => {
      let resolved = false;
      let channel: BroadcastChannel | null = null;

      const finish = (loggedUser?: User) => {
        if (resolved) return;
        resolved = true;
        clearInterval(pollTimer);
        if (channel) channel.close();
        if (loggedUser) {
          setUser(loggedUser);
        }
        resolve({ requiresModal: false, user: loggedUser });
      };

      try {
        channel = new BroadcastChannel('unistay_auth_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'UNISTAY_GOOGLE_AUTH_SUCCESS' && event.data?.user) {
            finish(event.data.user);
          } else if (event.data?.type === 'UNISTAY_GOOGLE_AUTH_CANCEL') {
            finish(undefined);
          }
        };
      } catch {
        // ignore
      }

      const pollTimer = setInterval(() => {
        try {
          if (popup.closed) {
            const saved = localStorage.getItem('unistay_auth_user');
            if (saved) {
              const parsed = JSON.parse(saved);
              finish(parsed);
            } else {
              finish(undefined);
            }
          }
        } catch {
          // Cross-origin access while on accounts.google.com is normal
        }
      }, 400);
    });
  };

  const loginWithEmail = async (email: string, pass: string): Promise<User> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 350));

    const cleanEmail = email.toLowerCase().trim();

    let registeredList: StoredAccount[] = [];
    try {
      registeredList = JSON.parse(localStorage.getItem('unistay_registered_users') || '[]');
    } catch {
      registeredList = [];
    }

    const matchedRegistered = registeredList.find((u) => u.email.toLowerCase() === cleanEmail);
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
