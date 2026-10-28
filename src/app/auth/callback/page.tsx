'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { isEmailAdmin } from '@/config/auth';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogleAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function processOAuthCallback() {
      try {
        // Parse Hash parameters (Google OAuth Implicit / ID Token flow)
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const accessToken = params.get('access_token');

        if (idToken) {
          // Decode JWT payload (standard Google id_token)
          const base64Url = idToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const parsed = JSON.parse(jsonPayload);

          const email = parsed.email || '';
          const name = parsed.name || email.split('@')[0];
          const picture = parsed.picture || '';

          const user = await loginWithGoogleAccount({
            email,
            name,
            avatar: picture
          });

          if (user.role === 'admin') {
            router.replace('/admin');
          } else {
            router.replace('/');
          }
          return;
        }

        // Check if access_token without id_token
        if (accessToken) {
          // Fetch user info from Google UserInfo endpoint
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            const user = await loginWithGoogleAccount({
              email: data.email,
              name: data.name || data.email.split('@')[0],
              avatar: data.picture
            });
            if (user.role === 'admin') {
              router.replace('/admin');
            } else {
              router.replace('/');
            }
            return;
          }
        }

        // If no tokens found, redirect back to login
        router.replace('/auth/login');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Không thể xử lý xác thực từ Google. Đang chuyển về trang đăng nhập...');
        setTimeout(() => router.replace('/auth/login'), 2000);
      }
    }

    processOAuthCallback();
  }, [loginWithGoogleAccount, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 max-w-sm w-full">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <h3 className="text-base font-bold text-slate-800">
          Đang hoàn tất đăng nhập Google...
        </h3>
        {error ? (
          <p className="text-xs text-red-600">{error}</p>
        ) : (
          <p className="text-xs text-slate-400">
            Hệ thống đang xác thực danh tính và phân quyền tài khoản của bạn.
          </p>
        )}
      </div>
    </div>
  );
}
