'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Building2, ArrowRight } from 'lucide-react';
import { GoogleAccountChooserModal } from '@/components/GoogleAccountChooserModal';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithGoogle, loginWithEmail, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await loginWithEmail(email, password);
      if (loggedInUser.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Email hoặc mật khẩu không chính xác.');
      }
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    try {
      const res = await loginWithGoogle();
      if (res.requiresModal) {
        setShowGoogleChooser(true);
      } else if (res.user) {
        if (res.user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể kết nối đến Google. Vui lòng thử lại.');
      }
    }
  };

  const handleGoogleChooserSuccess = (role: 'student' | 'admin') => {
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-3xl font-black tracking-tight text-slate-900">
            Uni<span className="text-indigo-600">Stay</span>
          </span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          Đăng Nhập Tài Khoản
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Sử dụng tài khoản Google hoặc Email của bạn
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/60 border border-slate-200 rounded-3xl space-y-6">
          {error && (
            <div className="p-3.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-2xl leading-relaxed">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-200 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-xs transition-all hover:border-slate-300 active:scale-[0.99] cursor-pointer"
          >
            {/* Google Multicolor SVG */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Đăng nhập bằng Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-xs font-semibold text-slate-400 relative">
              hoặc
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email đăng nhập</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                <a href="#" className="text-[11px] font-semibold text-indigo-600 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isLoading ? 'Đang xử lý...' : 'Đăng nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Admin Helper Tip */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 block">Tài khoản Admin quản trị:</span>
            <p>
              • Email: <code className="text-indigo-600 font-mono">truongvantuan43344@gmail.com</code>
            </p>
            <p>
              • Mật khẩu: <code className="text-indigo-600 font-mono">Admin@123456</code> (hoặc bấm Đăng nhập Google)
            </p>
          </div>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Chưa có tài khoản?{' '}
            <Link href="/auth/register" className="font-bold text-indigo-600 hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={showGoogleChooser}
        onClose={() => setShowGoogleChooser(false)}
        onSuccess={handleGoogleChooserSuccess}
      />
    </div>
  );
}
