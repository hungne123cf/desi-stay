'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import {
  User as UserIcon,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Receipt,
  Save,
  LogOut,
  Camera,
  KeyRound,
  ExternalLink,
  Building2,
  Calendar
} from 'lucide-react';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile, resetPassword, logout } = useAuth();
  const { bookings } = useProperties();

  // Profile Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [avatar, setAvatar] = useState('');

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCollege(user.college || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Yêu cầu đăng nhập</h2>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng đăng nhập tài khoản để xem và quản lý hồ sơ thông tin sinh viên của bạn.
            </p>
          </div>
          <Link
            href="/auth/login?next=/profile"
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <span>Đăng nhập ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Lọc các đơn đặt phòng của user này
  const myUserBookings = bookings.filter(
    (b) =>
      b.userId === user.id ||
      (user.email && b.studentEmail?.toLowerCase() === user.email.toLowerCase())
  );

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Họ tên không được để trống.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSaveSuccess(false);

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        college: college.trim() || undefined,
        avatar: avatar.trim() || undefined
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Xác nhận mật khẩu mới không trùng khớp.');
      return;
    }

    setIsChangingPass(true);
    try {
      await resetPassword(user.email, newPassword);
      setPasswordSuccess('Đổi mật khẩu thành công! Bạn có thể dùng mật khẩu này cho các lần đăng nhập sau.');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 4000);
    } catch (err: unknown) {
      setPasswordError(err instanceof Error ? err.message : 'Không thể cập nhật mật khẩu');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar & Edit */}
            <div className="relative group shrink-0">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover ring-4 ring-indigo-500/30 shadow-xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-black text-3xl sm:text-4xl flex items-center justify-center ring-4 ring-indigo-500/30 shadow-xl">
                  {user.name[0]?.toUpperCase() || 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="absolute bottom-1 right-1 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-slate-900 cursor-pointer transition-transform active:scale-95"
                title="Thay đổi ảnh đại diện"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Title & Info */}
            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white truncate max-w-md">
                  {user.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {user.role === 'admin' ? 'Quản trị viên (Admin)' : 'Thành viên Sinh viên'}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{user.email}</span>
              </p>
              {user.college && (
                <p className="text-xs text-indigo-300 font-semibold mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{user.college}</span>
                </p>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/my-bookings"
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center gap-2 transition-all"
              >
                <Receipt className="w-4 h-4 text-indigo-300" />
                <span>Vé Đặt Cọc ({myUserBookings.length})</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout();
                }}
                className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all cursor-pointer"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Avatar Picker Dropdown */}
          {showAvatarPicker && (
            <div className="mt-5 p-4 bg-slate-800/90 rounded-2xl border border-slate-700 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-slate-300 block mb-2">
                Chọn ảnh đại diện sinh viên mẫu hoặc dán đường dẫn ảnh:
              </span>
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {SAMPLE_AVATARS.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Avatar ${idx + 1}`}
                    onClick={() => {
                      setAvatar(url);
                      setShowAvatarPicker(false);
                    }}
                    className={`w-12 h-12 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform ring-2 ${
                      avatar === url ? 'ring-indigo-500' : 'ring-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="url"
                  placeholder="Hoặc dán URL ảnh đại diện của bạn..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(false)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Chọn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cột Trái & Giữa: Form Thông Tin Cá Nhân */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-indigo-600" />
                    <span>Thông Tin Hồ Sơ Cá Nhân</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Thông tin này giúp quản trị viên và chủ trọ liên hệ khi bạn giữ chỗ hoặc hẹn xem phòng.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã cập nhật hồ sơ cá nhân thành công!</span>
                </div>
              )}

              {errorMessage && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {/* Họ tên */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Họ và tên của bạn *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Khôi"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Email (Readonly) */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                      <span>Email đăng nhập</span>
                      <span className="text-[10px] text-slate-400 font-normal">Cố định</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-100/80 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed outline-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>

                  {/* SĐT / Zalo */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Số điện thoại / Zalo liên hệ *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0939 123 456"
                      className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                    />
                  </div>
                </div>

                {/* Trường Đại học */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trường Đại học / Nơi làm việc
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Ví dụ: ĐH Cần Thơ (CTU), ĐH FPT Cần Thơ, ĐH Y Dược..."
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* Save button */}
                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Đổi Mật Khẩu */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    <span>Bảo Mật &amp; Đổi Mật Khẩu</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Cập nhật mật khẩu để đăng nhập bằng Email và bảo vệ tài khoản của bạn.
                  </p>
                </div>
              </div>

              {passwordSuccess && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs font-bold text-red-700">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Xác nhận lại mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPass ? 'Đang cập nhật...' : 'Cập Nhật Mật Khẩu'}</span>
                </button>
              </form>
            </div>
          </div>

          {/* Cột Phải: Thống Kê & Lối Tắt */}
          <div className="space-y-6">
            {/* Thẻ Thống Kê Giao Dịch */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Hoạt Động Cọc Phòng Của Bạn</span>
              </h4>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Tổng đơn đã đặt:</span>
                  <span className="text-2xl font-black text-indigo-700">
                    {myUserBookings.length} đơn
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>

              <Link
                href="/my-bookings"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-between transition-colors"
              >
                <span>Xem chi tiết danh sách vé cọc</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </Link>
            </div>

            {/* Thẻ Quyền Lợi Tài Khoản */}
            <div className="bg-gradient-to-br from-indigo-900 to-blue-950 text-white rounded-3xl p-6 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 block">
                Đặc quyền sinh viên UniStay
              </span>
              <h4 className="text-sm font-black">Tài khoản chính chủ đã xác thực</h4>
              <ul className="space-y-2 text-xs text-indigo-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Đồng bộ vé cọc và tin nhắn đa thiết bị</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Bảo lưu tiền cọc VietQR 24/7 an toàn</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Ưu tiên gửi lịch hẹn trực tiếp với chủ trọ</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

