'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, isAccountSuspended } from '@/context/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogleAccount } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function finalizeUser(
      payload: { email: string; name: string; avatar?: string },
      isPopup: boolean
    ) {
      try {
        const cleanEmail = payload.email.toLowerCase().trim();

        // Xóa cờ xóa vĩnh viễn cũ nếu tài khoản Google này đăng nhập lại
        try {
          const rawPerm = localStorage.getItem('unistay_tombstone_permanent_deleted');
          if (rawPerm) {
            const parsed = JSON.parse(rawPerm);
            if (Array.isArray(parsed) && parsed.some((e: string) => e?.toLowerCase().trim() === cleanEmail)) {
              const next = parsed.filter((e: string) => e?.toLowerCase().trim() !== cleanEmail);
              localStorage.setItem('unistay_tombstone_permanent_deleted', JSON.stringify(next));
            }
          }
        } catch {}

        // Kiểm tra xem tài khoản có thực sự đang bị Quản trị viên khóa chủ động trong danh sách hay không
        const rawAccounts = typeof window !== 'undefined' ? localStorage.getItem('unistay_real_accounts_v4') : null;
        let isActivelySuspended = false;
        if (rawAccounts) {
          try {
            const accs = JSON.parse(rawAccounts);
            if (Array.isArray(accs)) {
              const found = accs.find((a: any) => a?.email?.toLowerCase().trim() === cleanEmail);
              if (found && Boolean(found.isSuspended)) {
                isActivelySuspended = true;
              }
            }
          } catch {}
        }

        if (!isActivelySuspended) {
          try {
            const rawSusp = localStorage.getItem('unistay_tombstone_suspended_accounts');
            if (rawSusp) {
              const parsed = JSON.parse(rawSusp);
              if (Array.isArray(parsed) && parsed.some((e: string) => e?.toLowerCase().trim() === cleanEmail)) {
                const next = parsed.filter((e: string) => e?.toLowerCase().trim() !== cleanEmail);
                localStorage.setItem('unistay_tombstone_suspended_accounts', JSON.stringify(next));
              }
            }
          } catch {}
        }

        if (isActivelySuspended || isAccountSuspended(cleanEmail)) {
          setError('Tài khoản này đã bị Quản trị viên tạm khóa. Không thể đăng nhập vào UniStay!');
          try {
            const channel = new BroadcastChannel('unistay_auth_channel');
            channel.postMessage({ type: 'UNISTAY_GOOGLE_AUTH_CANCEL' });
            channel.close();
          } catch {}
          setTimeout(() => {
            if (isPopup || (window.opener && window.opener !== window)) {
              window.close();
            } else {
              router.replace('/auth/login');
            }
          }, 2500);
          return;
        }

        const user = await loginWithGoogleAccount(payload);

        try {
          const channel = new BroadcastChannel('unistay_auth_channel');
          channel.postMessage({ type: 'UNISTAY_GOOGLE_AUTH_SUCCESS', user });
          channel.close();
        } catch {
          // ignore if BroadcastChannel unsupported
        }

        if (isPopup || (window.opener && window.opener !== window)) {
          window.close();
          return;
        }

        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      } catch (err: any) {
        console.error('Finalize user error:', err);
        setError(err.message || 'Lỗi xác thực tài khoản Google');
        setTimeout(() => {
          if (isPopup || (window.opener && window.opener !== window)) {
            window.close();
          } else {
            router.replace('/auth/login');
          }
        }, 2500);
      }
    }

    async function processOAuthCallback() {
      try {
        const hash = window.location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        const searchParams = new URLSearchParams(window.location.search);

        const isPopup =
          hashParams.get('state') === 'popup' ||
          searchParams.get('state') === 'popup' ||
          window.name === 'google_oauth_popup';

        const oauthError = hashParams.get('error') || searchParams.get('error');
        if (oauthError) {
          setError('Bạn đã hủy đăng nhập hoặc từ chối cấp quyền từ Google.');
          try {
            const channel = new BroadcastChannel('unistay_auth_channel');
            channel.postMessage({ type: 'UNISTAY_GOOGLE_AUTH_CANCEL' });
            channel.close();
          } catch {
            // ignore
          }
          setTimeout(() => {
            if (isPopup) {
              window.close();
            } else {
              router.replace('/auth/login');
            }
          }, 1200);
          return;
        }

        const idToken = hashParams.get('id_token');
        const accessToken = hashParams.get('access_token');

        // 1. Decode Google id_token JWT directly (instant, zero external fetch)
        if (idToken) {
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
          let picture = parsed.picture || '';

          // Nếu id_token không có ảnh (thường gặp ở tài khoản trường/Google Workspace) nhưng có accessToken
          if (!picture && accessToken) {
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${accessToken}` }
              });
              if (res.ok) {
                const data = await res.json();
                if (data.picture) picture = data.picture;
              }
            } catch {}
          }

          await finalizeUser(
            {
              email,
              name,
              avatar: picture || undefined
            },
            isPopup
          );
          return;
        }

        // 2. Fallback to Google UserInfo API if only access_token is present
        if (accessToken) {
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` }
            });
            if (res.ok) {
              const data = await res.json();
              await finalizeUser(
                {
                  email: data.email,
                  name: data.name || data.email.split('@')[0],
                  avatar: data.picture
                },
                isPopup
              );
              return;
            }
          } catch {
            // ignore network fetch failure
          }
        }

        router.replace('/auth/login');
      } catch (err) {
        console.error('OAuth callback error:', err);
        setError('Không thể xác thực tài khoản từ Google. Đang chuyển về trang đăng nhập...');
        setTimeout(() => router.replace('/auth/login'), 2000);
      }
    }

    processOAuthCallback();
  }, [loginWithGoogleAccount, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 max-w-sm w-full">
        {error ? (
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        ) : (
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        )}
        <h3 className="text-base font-bold text-slate-800">
          {error ? 'Xác thực chưa hoàn tất' : 'Đang đồng bộ tài khoản Google...'}
        </h3>
        <p className={`text-xs ${error ? 'text-red-600' : 'text-slate-500'}`}>
          {error || 'Vui lòng đợi trong giây lát để hệ thống hoàn tất đăng nhập.'}
        </p>
      </div>
    </div>
  );
}
