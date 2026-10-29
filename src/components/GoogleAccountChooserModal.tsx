'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  UserPlus,
  Settings,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  Trash2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAuth, StoredAccount } from '@/context/AuthContext';
import { UserRole } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

type ModalStep = 'chooser' | 'email' | 'password' | 'oauth_config';

const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-emerald-600',
  'bg-amber-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-indigo-600'
];

function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const GoogleAccountChooserModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const {
    loginWithGoogleAccount,
    googleClientId,
    setGoogleClientId,
    knownAccounts,
    removeKnownAccount
  } = useAuth();

  const [step, setStep] = useState<ModalStep>('chooser');
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempClientId, setTempClientId] = useState(googleClientId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep(knownAccounts.length > 0 ? 'chooser' : 'email');
      setFormError('');
      setPasswordInput('');
      setTempClientId(googleClientId || '');
    }
  }, [isOpen, knownAccounts.length, googleClientId]);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: StoredAccount) => {
    setIsSubmitting(true);
    try {
      const user = await loginWithGoogleAccount({
        email: account.email,
        name: account.name,
        avatar: account.avatar
      });
      onSuccess(user.role);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed) {
      setFormError('Hãy nhập một địa chỉ email hoặc số điện thoại.');
      return;
    }

    // If user typed username without @domain, default to @gmail.com like Google does
    const normalizedEmail = trimmed.includes('@') ? trimmed : `${trimmed}@gmail.com`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      setFormError('Không tìm thấy Tài khoản Google của bạn. Vui lòng kiểm tra lại email.');
      return;
    }

    setEmailInput(normalizedEmail);
    if (!nameInput.trim()) {
      const existing = knownAccounts.find((a) => a.email.toLowerCase() === normalizedEmail);
      if (existing) {
        setNameInput(existing.name);
      }
    }
    setStep('password');
  };

  const handlePasswordStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!passwordInput || passwordInput.length < 4) {
      setFormError('Nhập mật khẩu của bạn để tiếp tục.');
      return;
    }

    setIsSubmitting(true);
    try {
      const displayName =
        nameInput.trim() ||
        emailInput
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());

      const user = await loginWithGoogleAccount({
        email: emailInput,
        name: displayName
      });
      onSuccess(user.role);
      onClose();
    } catch {
      setFormError('Đã xảy ra lỗi xác thực. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleClientId(tempClientId.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRealOAuthRedirect = () => {
    const activeClientId = tempClientId.trim() || googleClientId;
    if (!activeClientId) return;
    setGoogleClientId(activeClientId);

    const redirectUri = `${window.location.origin}/auth/callback`;
    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      activeClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;

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
      window.location.href = targetUrl;
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="relative w-full max-w-[780px] bg-white rounded-[28px] shadow-2xl border border-slate-200/90 overflow-hidden">
        {/* Top bar: Official Google OAuth window header */}
        <div className="px-6 py-3.5 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
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
            <span className="text-[13px] font-medium text-slate-600">Đăng nhập bằng Google</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setStep(step === 'oauth_config' ? 'chooser' : 'oauth_config')}
              title="Cấu hình Google OAuth Client ID"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading Bar */}
        {isSubmitting && (
          <div className="h-1 w-full bg-blue-100 overflow-hidden">
            <div className="h-full bg-blue-600 animate-pulse w-2/3 rounded-r-full" />
          </div>
        )}

        {/* Main 2-Column Google Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 p-6 sm:p-9 gap-6 md:gap-8 items-start">
          {/* Left Column: App Identity & Step Title */}
          <div className="md:col-span-5 space-y-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>

            {step === 'chooser' && (
              <div>
                <h2 className="text-[26px] font-normal text-slate-900 leading-snug tracking-tight">
                  Chọn tài khoản
                </h2>
                <p className="text-sm text-slate-600 mt-1.5">
                  để tiếp tục tới{' '}
                  <span className="font-semibold text-indigo-600">UniStay Global</span>
                </p>
              </div>
            )}

            {step === 'email' && (
              <div>
                <h2 className="text-[26px] font-normal text-slate-900 leading-snug tracking-tight">
                  Đăng nhập
                </h2>
                <p className="text-sm text-slate-600 mt-1.5">
                  Sử dụng Tài khoản Google của bạn để tiếp tục tới{' '}
                  <span className="font-semibold text-indigo-600">UniStay Global</span>
                </p>
              </div>
            )}

            {step === 'password' && (
              <div className="space-y-3">
                <h2 className="text-[26px] font-normal text-slate-900 leading-snug tracking-tight">
                  Chào mừng
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('chooser')}
                  className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-slate-300 hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors max-w-full cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${getAvatarColor(
                      emailInput
                    )}`}
                  >
                    {emailInput[0]?.toUpperCase()}
                  </div>
                  <span className="truncate">{emailInput}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                </button>
              </div>
            )}

            {step === 'oauth_config' && (
              <div>
                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  Kết nối Google OAuth 2.0
                </h2>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Nhập Google Client ID từ Google Cloud Console để mở cửa sổ xác thực trực tiếp trên{' '}
                  <code className="text-slate-700">accounts.google.com</code>.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Content */}
          <div className="md:col-span-7">
            {step === 'chooser' && (
              <div>
                <div className="divide-y divide-slate-200/70 border-b border-slate-200/70">
                  {knownAccounts.map((account) => (
                    <div
                      key={account.email}
                      className="group flex items-center justify-between py-3 px-2 hover:bg-slate-50/90 rounded-xl transition-colors"
                    >
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleSelectAccount(account)}
                        className="flex-1 flex items-center gap-3.5 text-left min-w-0 cursor-pointer"
                      >
                        {account.avatar ? (
                          <img
                            src={account.avatar}
                            alt={account.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                          />
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 ${getAvatarColor(
                              account.email
                            )}`}
                          >
                            {account.name[0]?.toUpperCase() || 'U'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-medium text-slate-800 truncate">
                            {account.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{account.email}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeKnownAccount(account.email);
                        }}
                        title="Xóa tài khoản khỏi trình duyệt này"
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Use another account */}
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput('');
                      setNameInput('');
                      setPasswordInput('');
                      setFormError('');
                      setStep('email');
                    }}
                    className="w-full py-3.5 px-2 flex items-center gap-3.5 hover:bg-slate-50 rounded-xl transition-colors text-left cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 shrink-0">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <span className="text-[13px] font-medium text-slate-700">
                      Sử dụng một tài khoản khác
                    </span>
                  </button>
                </div>
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailStepSubmit} className="space-y-5 pt-1">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">
                      Email hoặc số điện thoại Google
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        setFormError('');
                      }}
                      placeholder="tenban@gmail.com"
                      className={`w-full px-3.5 py-3 text-sm bg-white border rounded-lg outline-none transition-all ${
                        formError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                      }`}
                    />
                    {formError && (
                      <p className="text-xs text-red-600 mt-1.5 font-medium">{formError}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-600 block mb-1">
                      Tên hiển thị (tùy chọn)
                    </label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Họ và tên của bạn"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  {knownAccounts.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setFormError('');
                        setStep('chooser');
                      }}
                      className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-full transition-colors cursor-pointer"
                    >
                      Chọn tài khoản có sẵn
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
                  >
                    Tiếp theo
                  </button>
                </div>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handlePasswordStepSubmit} className="space-y-5 pt-1">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1.5">
                    Nhập mật khẩu của bạn
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoFocus
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setFormError('');
                      }}
                      placeholder="Nhập mật khẩu Google"
                      className={`w-full px-3.5 py-3 pr-10 text-sm bg-white border rounded-lg outline-none transition-all ${
                        formError
                          ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formError && (
                    <p className="text-xs text-red-600 mt-1.5 font-medium">{formError}</p>
                  )}

                  <label className="inline-flex items-center gap-2 mt-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs text-slate-600">Hiện mật khẩu</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError('');
                      setStep('email');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-full transition-colors cursor-pointer"
                  >
                    Quay lại
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold rounded-full shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Tiếp theo</span>
                  </button>
                </div>
              </form>
            )}

            {step === 'oauth_config' && (
              <form onSubmit={handleSaveClientId} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Google OAuth 2.0 Client ID
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Thêm Authorized redirect URI:{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                      {typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/callback`
                        : '/auth/callback'}
                    </code>
                  </p>
                  <input
                    type="text"
                    value={tempClientId}
                    onChange={(e) => setTempClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
                    className="w-full text-xs font-mono px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {savedSuccess && <Check className="w-3.5 h-3.5" />}
                    <span>{savedSuccess ? 'Đã lưu cấu hình!' : 'Lưu Client ID'}</span>
                  </button>

                  {tempClientId.trim() && (
                    <button
                      type="button"
                      onClick={handleRealOAuthRedirect}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Mở cửa sổ Google OAuth thật</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setStep('chooser')}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Đóng cấu hình
                  </button>
                </div>
              </form>
            )}

            {/* Google Privacy & Terms Footer */}
            <p className="mt-6 pt-4 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100">
              Để tiếp tục, Google sẽ chia sẻ tên, địa chỉ email và ảnh hồ sơ của bạn với UniStay
              Global. Trước khi sử dụng ứng dụng này, bạn có thể xem{' '}
              <span className="text-blue-600 font-medium">Chính sách quyền riêng tư</span> và{' '}
              <span className="text-blue-600 font-medium">Điều khoản dịch vụ</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
