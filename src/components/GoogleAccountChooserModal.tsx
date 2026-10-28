'use client';

import React, { useState } from 'react';
import { Building2, X, PlusCircle, Key, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isEmailAdmin } from '@/config/auth';

interface GoogleAccountItem {
  name: string;
  email: string;
  avatarText?: string;
  avatarBg?: string;
  avatarImg?: string;
}

const DEFAULT_BROWSER_ACCOUNTS: GoogleAccountItem[] = [
  {
    name: 'Trương Hùng',
    email: 'truongvantuan43344@gmail.com',
    avatarImg: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  },
  {
    name: 'Truong Hung (K18 CT)',
    email: 'hungtce181568@fpt.edu.vn',
    avatarBg: 'bg-amber-600',
    avatarText: 'T'
  },
  {
    name: 'Phạm Hưng',
    email: 'hungkgvl@gmail.com',
    avatarBg: 'bg-slate-400',
    avatarText: 'H'
  },
  {
    name: 'Pham Huu Hung (K18 CT)',
    email: 'hungphce181213@fpt.edu.vn',
    avatarBg: 'bg-emerald-700',
    avatarText: 'P'
  }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: 'student' | 'admin') => void;
}

export const GoogleAccountChooserModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { loginWithGoogleAccount, googleClientId, setGoogleClientId } = useAuth();
  const [showCustomEmail, setShowCustomEmail] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [tempClientId, setTempClientId] = useState(googleClientId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectAccount = async (account: GoogleAccountItem) => {
    const user = await loginWithGoogleAccount({
      email: account.email,
      name: account.name,
      avatar: account.avatarImg
    });
    onSuccess(user.role);
    onClose();
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;
    const user = await loginWithGoogleAccount({
      email: customEmail,
      name: customName || customEmail.split('@')[0]
    });
    onSuccess(user.role);
    onClose();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setGoogleClientId(tempClientId.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleRealOAuthRedirect = () => {
    if (!googleClientId) {
      setShowConfigClientId(true);
      return;
    }
    const redirectUri = `${window.location.origin}/auth/callback`;
    const targetUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token%20id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Date.now()}`;
    window.location.href = targetUrl;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top bar with Google logo */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            <span className="text-xs font-semibold text-slate-700">Đăng nhập bằng Google</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Left and Right Columns (Identical to Google SSO screen) */}
        <div className="grid grid-cols-1 md:grid-cols-5 p-6 sm:p-8 gap-8">
          {/* Left Column: Brand & Title */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Uni<span className="text-indigo-600">Stay</span>
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                Chọn tài khoản
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Tiếp tục tới <strong className="text-slate-700">UniStay Global</strong>
              </p>
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1 font-bold text-indigo-700">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Phân quyền tự động theo Role:</span>
              </div>
              <p>
                • <strong>truongvantuan43344@gmail.com</strong>: Được tự động cấp quyền <strong>Admin Quản trị</strong>.
              </p>
              <p>
                • Các tài khoản sinh viên/khách thuê khác: Vào trang khám phá phòng trọ.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowConfigClientId(!showConfigClientId)}
              className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              <Key className="w-3 h-3" />
              <span>{showConfigClientId ? 'Ẩn cấu hình Client ID' : 'Cấu hình Google Client ID thật'}</span>
            </button>
          </div>

          {/* Right Column: Account List */}
          <div className="md:col-span-3 space-y-1 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8">
            {showConfigClientId ? (
              <form onSubmit={handleSaveClientId} className="space-y-4 py-2">
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Google OAuth 2.0 Client ID
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Lấy từ Google Cloud Console (APIs & Services &gt; Credentials).
                  </p>
                  <input
                    type="text"
                    value={tempClientId}
                    onChange={(e) => setTempClientId(e.target.value)}
                    placeholder="xxxxxxxxxxxx.apps.googleusercontent.com"
                    className="w-full text-xs font-mono px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                  >
                    {savedSuccess ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{savedSuccess ? 'Đã lưu!' : 'Lưu Client ID'}</span>
                  </button>
                  {tempClientId && (
                    <button
                      type="button"
                      onClick={handleRealOAuthRedirect}
                      className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Mở Google Thật Ngay
                    </button>
                  )}
                </div>
              </form>
            ) : showCustomEmail ? (
              <form onSubmit={handleCustomSubmit} className="space-y-3 py-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tên hiển thị</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Địa chỉ Email Google *</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl outline-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1"
                  >
                    <span>Tiếp tục</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomEmail(false)}
                    className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Quay lại
                  </button>
                </div>
              </form>
            ) : (
              <div className="divide-y divide-slate-100">
                {DEFAULT_BROWSER_ACCOUNTS.map((account) => {
                  const isAdmin = isEmailAdmin(account.email);
                  return (
                    <button
                      key={account.email}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full py-3.5 px-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left group"
                    >
                      {/* Avatar */}
                      {account.avatarImg ? (
                        <img
                          src={account.avatarImg}
                          alt={account.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                      ) : (
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                            account.avatarBg || 'bg-slate-500'
                          }`}
                        >
                          {account.avatarText || account.name[0]}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600">
                            {account.name}
                          </p>
                          {isAdmin && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              👑 Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">{account.email}</p>
                      </div>
                    </button>
                  );
                })}

                {/* Use another account */}
                <button
                  type="button"
                  onClick={() => setShowCustomEmail(true)}
                  className="w-full py-3.5 px-3 rounded-2xl flex items-center gap-3.5 hover:bg-slate-50 transition-colors text-left group"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600">
                    Sử dụng một tài khoản khác
                  </span>
                </button>
              </div>
            )}

            {/* Bottom terms disclaimer (Matches Google screenshot) */}
            <p className="pt-4 text-[10px] text-slate-400 leading-relaxed border-t border-slate-100">
              Trước khi sử dụng UniStay Global, bạn có thể xem{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                Chính sách quyền riêng tư
              </a>{' '}
              và{' '}
              <a href="#" className="text-indigo-600 hover:underline">
                Điều khoản dịch vụ
              </a>{' '}
              của ứng dụng này.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
