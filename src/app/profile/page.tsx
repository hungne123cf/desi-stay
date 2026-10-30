'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, isAccountSuspended } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { PropertyCard } from '@/components/PropertyCard';
import { ReviewModal } from '@/components/ReviewModal';
import { Property, Booking } from '@/types';
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
  Heart,
  Clock,
  AlertCircle,
  Eye,
  X,
  CreditCard,
  MessageSquare,
  QrCode,
  FileText
} from 'lucide-react';

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'
];

type ProfileTab = 'info' | 'wishlist' | 'bookings';

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawTab = searchParams.get('tab') as ProfileTab;
  const initialTab: ProfileTab = ['info', 'wishlist', 'bookings'].includes(rawTab) ? rawTab : 'info';

  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const { user, isLoading, updateProfile, resetPassword, logout } = useAuth();
  const {
    properties,
    bookings,
    reviews,
    wishlistIds,
    toggleWishlist,
    clearWishlist,
    settings,
    formatPrice,
    getReviewEligibility
  } = useProperties();

  // Đồng bộ tab khi URL thay đổi
  useEffect(() => {
    if (rawTab && ['info', 'wishlist', 'bookings'].includes(rawTab)) {
      setActiveTab(rawTab);
    }
  }, [rawTab]);

  const switchTab = (tab: ProfileTab) => {
    setActiveTab(tab);
    router.replace(`/profile?tab=${tab}`, { scroll: false });
  };

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

  // Bookings & Review state
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [reviewingProperty, setReviewingProperty] = useState<{
    property: Property;
    booking: Booking;
    eligibility: NonNullable<ReturnType<typeof getReviewEligibility>>;
  } | null>(null);

  useEffect(() => {
    if (user?.email && isAccountSuspended(user.email)) {
      logout();
      alert('Tài khoản của bạn đã bị Quản trị viên tạm khóa. Phiên làm việc đã kết thúc.');
      router.replace('/');
      return;
    }
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setCollege(user.college || '');
      setAvatar(user.avatar || '');
    }
  }, [user, logout, router]);

  // Lấy các mã đơn thuộc về trình duyệt hoặc tài khoản người dùng
  let savedLocalBookingIds: string[] = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('unistay_my_booking_ids') : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) savedLocalBookingIds = parsed;
    }
  } catch {}

  const cleanUserPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : '';

  const myBookings = (bookings || []).filter((b) => {
    if (!b) return false;
    const byLocalBrowser =
      savedLocalBookingIds.includes(b.id) || (b.reference ? savedLocalBookingIds.includes(b.reference) : false);
    const byUserId = Boolean(user?.id && user.id !== 'guest' && b.userId === user.id);
    const byEmail = Boolean(
      user?.email && b.studentEmail && b.studentEmail.toLowerCase() === user.email.toLowerCase()
    );
    const byPhone = Boolean(
      cleanUserPhone.length >= 8 &&
        b.studentContact &&
        b.studentContact.replace(/[^0-9]/g, '') === cleanUserPhone
    );
    const byName = Boolean(
      user?.name && b.studentName && b.studentName.trim().toLowerCase() === user.name.trim().toLowerCase()
    );

    return byLocalBrowser || byUserId || byEmail || byPhone || byName;
  });

  // Danh sách phòng trọ đã lưu yêu thích
  const wishlistProperties = (properties || []).filter(
    (p) => p && !p.isDeleted && wishlistIds.includes(p.id)
  );

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
              Vui lòng đăng nhập tài khoản để xem hồ sơ, phòng yêu thích và đơn cọc phòng của bạn.
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

  const getStatusBadge = (status: Booking['status'], method?: string) => {
    switch (status) {
      case 'token_paid':
        return {
          label: 'Đã nhận cọc VietQR 24/7',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        };
      case 'confirmed':
        return {
          label: 'Đã chốt giữ phòng thành công',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
        };
      case 'cancelled':
        return {
          label: 'Đã hủy',
          color: 'bg-red-50 text-red-700 border-red-200',
          icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />
        };
      default:
        return {
          label: method === 'vietqr_bank' ? 'Chờ kiểm tra sao kê VietQR' : 'Chờ xác nhận lịch hẹn',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />
        };
    }
  };

  const handleOpenZalo = (bookingRef: string, propCode: string) => {
    const adminZalo = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    const text = encodeURIComponent(
      `Chào UniStay, mình cần hỗ trợ đơn đặt phòng mã #${bookingRef} (Phòng ${propCode})`
    );
    window.open(`https://zalo.me/${adminZalo}?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-10 border-b border-slate-800">
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
                  {user.role === 'admin'
                    ? 'Admin'
                    : user.role === 'staff'
                    ? 'Staff'
                    : 'Khách thuê'}
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
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Vào Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => logout()}
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

          {/* Unified Tab Bar (3 Mục Chính Gom Gọn) */}
          <div className="mt-8 border-t border-slate-800/80 pt-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => switchTab('info')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'info'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>Hồ Sơ &amp; Mật Khẩu</span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('wishlist')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'wishlist'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span>Yêu Thích</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'wishlist'
                      ? 'bg-white text-rose-700'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {wishlistProperties.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => switchTab('bookings')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  activeTab === 'bookings'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Lịch Sử Đặt Cọc</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'bookings'
                      ? 'bg-white text-indigo-700'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}
                >
                  {myBookings.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB 1: THÔNG TIN HỒ SƠ & ĐỔI MẬT KHẨU */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cột Trái: Form Thông Tin Cá Nhân */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-indigo-600" />
                      <span>Hồ Sơ Cá Nhân</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Thông tin này giúp quản lý và chủ trọ liên hệ khi bạn giữ chỗ hoặc hẹn xem phòng.
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
              {/* Thẻ Thống Kê Yêu Thích & Cọc Phòng */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  <span>Tổng Quan Hoạt Động</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div
                    onClick={() => switchTab('wishlist')}
                    className="p-3.5 bg-rose-50/60 hover:bg-rose-100/70 rounded-2xl border border-rose-100 cursor-pointer transition-colors"
                  >
                    <span className="text-[11px] text-slate-500 block">Yêu thích:</span>
                    <span className="text-xl font-black text-rose-600">
                      {wishlistProperties.length} phòng
                    </span>
                  </div>

                  <div
                    onClick={() => switchTab('bookings')}
                    className="p-3.5 bg-indigo-50/60 hover:bg-indigo-100/70 rounded-2xl border border-indigo-100 cursor-pointer transition-colors"
                  >
                    <span className="text-[11px] text-slate-500 block">Vé đặt cọc:</span>
                    <span className="text-xl font-black text-indigo-700">
                      {myBookings.length} đơn
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => switchTab('wishlist')}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs rounded-xl flex items-center justify-between transition-colors border border-slate-200/60 cursor-pointer"
                  >
                    <span>Xem mục yêu thích</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => switchTab('bookings')}
                    className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs rounded-xl flex items-center justify-between transition-colors border border-slate-200/60 cursor-pointer"
                  >
                    <span>Xem lịch sử đặt cọc</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
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
        )}

        {/* TAB 2: PHÒNG TRỌ ĐÃ LƯU (YÊU THÍCH) */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Danh Sách Yêu Thích</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Những căn phòng bạn đã thả tim để tiện so sánh giá, vị trí và tiện nghi trước khi quyết định đặt cọc.
                </p>
              </div>

              {wishlistProperties.length > 0 && (
                <button
                  type="button"
                  onClick={() => clearWishlist()}
                  className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                >
                  Xóa tất cả ({wishlistProperties.length})
                </button>
              )}
            </div>

            {wishlistProperties.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
                  <Heart className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Bạn chưa lưu phòng trọ nào
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Trong khi xem phòng trọ, hãy bấm vào biểu tượng trái tim để lưu lại những căn phòng ưng ý vào mục này.
                  </p>
                </div>
                <Link
                  href="/#listings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <span>Khám phá phòng trọ ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LỊCH SỬ ĐẶT CỌC & GIỮ CHỖ */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-indigo-600" />
                  <span>Lịch Sử Đặt Cọc</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Biên lai VietQR 24/7 và thông tin người quản lý hỗ trợ cho các đơn giữ phòng của bạn.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
                  {myBookings.length} đơn đặt
                </span>
              </div>
            </div>

            {myBookings.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-2xs space-y-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">
                    Chưa có đơn đặt phòng hoặc lịch hẹn nào
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Khi bạn thực hiện đặt cọc giữ chỗ 500k hoặc đăng ký lịch hẹn xem phòng trực tiếp, thông tin vé cọc sẽ hiển thị tại đây.
                  </p>
                </div>
                <Link
                  href="/#listings"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  <span>Khám phá phòng trọ có sẵn</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b) => {
                  const statusInfo = getStatusBadge(b.status, b.paymentMethod);
                  const matchedProp = (properties || []).find(
                    (p) => p && (p.id === b.propertyId || p.code === b.propertyCode)
                  );
                  const eligibility = matchedProp
                    ? getReviewEligibility(matchedProp.id, matchedProp.code, user)
                    : null;

                  return (
                    <div
                      key={b.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                                #{b.reference || b.id.slice(0, 8)}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {new Date(b.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <h4 className="text-base font-black text-slate-900 mt-1">
                              {b.propertyTitle}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${statusInfo.color}`}
                          >
                            {statusInfo.icon}
                            <span>{statusInfo.label}</span>
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 text-xs">
                        <div>
                          <span className="text-slate-400 block mb-0.5">Tiền cọc giữ phòng:</span>
                          <span className="font-mono font-black text-base text-emerald-600">
                            {formatPrice(b.tokenAmountUSD, 'VND')}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Hình thức giữ phòng:</span>
                          <span className="font-bold text-slate-800">
                            {b.paymentMethod === 'vietqr_bank'
                              ? 'Chuyển khoản VietQR 24/7'
                              : 'Hẹn xem & đóng cọc tại phòng'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block mb-0.5">Khách thuê:</span>
                          <span className="font-bold text-slate-800">{b.studentName}</span>
                          <span className="text-slate-400 text-[11px] block">{b.studentContact}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(b.reference || b.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Xem Biên Lai Cọc</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenZalo(b.reference || b.id, b.propertyCode)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Hỗ trợ qua Zalo</span>
                          </button>
                        </div>

                        {matchedProp && (
                          <div className="flex items-center gap-2">
                            {eligibility && eligibility.remainingReviews > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewingProperty({
                                    property: matchedProp,
                                    booking: b,
                                    eligibility
                                  })
                                }
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                              >
                                <span>⭐ Viết Đánh Giá Phòng</span>
                              </button>
                            )}

                            <Link
                              href={`/properties/${matchedProp.id}`}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                            >
                              <span>Xem lại phòng</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewingProperty && (
        <ReviewModal
          isOpen={true}
          onClose={() => setReviewingProperty(null)}
          property={reviewingProperty.property}
          booking={reviewingProperty.booking}
          remainingQuota={reviewingProperty.eligibility.remainingReviews}
          totalPurchases={reviewingProperty.eligibility.totalPurchases}
          usedReviews={reviewingProperty.eligibility.usedReviews}
        />
      )}

      {/* Receipt Details Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const currentBooking = myBookings.find(
                (b) => b.reference === selectedReceipt || b.id === selectedReceipt
              );
              if (!currentBooking) return null;

              return (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Biên Nhận Giữ Chỗ Trực Tuyến
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Mã đơn: #{currentBooking.reference || currentBooking.id}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phòng trọ:</span>
                      <span className="font-bold text-slate-900 text-right">
                        {currentBooking.propertyTitle}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số tiền đặt cọc:</span>
                      <span className="font-mono font-black text-emerald-600 text-sm">
                        {formatPrice(currentBooking.tokenAmountUSD, 'VND')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Người đặt:</span>
                      <span className="font-bold text-slate-800">
                        {currentBooking.studentName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số điện thoại:</span>
                      <span className="font-bold text-slate-800">
                        {currentBooking.studentContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Phương thức:</span>
                      <span className="font-bold text-slate-800">
                        {currentBooking.paymentMethod === 'vietqr_bank'
                          ? 'VietQR 24/7'
                          : 'Xem phòng trực tiếp'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Thời gian tạo:</span>
                      <span className="font-mono text-slate-600">
                        {new Date(currentBooking.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>
                      Tiền cọc của bạn được bảo lưu 24/7 trên hệ thống UniStay. Chủ nhà cam kết giữ phòng theo đúng thỏa thuận.
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Đóng biên nhận
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
