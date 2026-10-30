'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { GoogleAccountChooserModal } from '@/components/GoogleAccountChooserModal';
import {
  Building2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  MapPin,
  Receipt,
  Heart
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, loginWithGoogle } = useAuth();
  const { settings, wishlistIds } = useProperties();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const handleSwitchGoogleAccount = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    const res = await loginWithGoogle();
    if (res.requiresModal) {
      setShowAccountSwitcher(true);
    } else if (res.user?.role === 'admin') {
      window.location.href = '/admin';
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    {settings.brandName || 'UniStay'}
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 uppercase">
                    Việt Nam
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium -mt-0.5 truncate max-w-[190px]">
                  Phòng Trọ &amp; Căn Hộ Sinh Viên
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Khám phá phòng trọ
              </Link>
              <a href="#cities" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                <span>Trọ Cần Thơ &amp; Đại học</span>
              </a>
              <a href="#benefits" className="hover:text-indigo-600 transition-colors">
                Tiện ích &amp; An ninh
              </a>
              <Link
                href="/my-bookings"
                className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
              >
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Lịch Sử Đặt Phòng</span>
              </Link>
              {(user?.role === 'admin' || user?.role === 'staff') && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full border border-indigo-200 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>{user.role === 'admin' ? 'Quản Trị Phòng' : 'Kênh Nhân Viên (Staff)'}</span>
                </Link>
              )}
            </nav>

            {/* Right Action buttons */}
            <div className="hidden md:flex items-center gap-2.5">
              {/* Wishlist Quick Button */}
              <a
                href="/#listings"
                className="relative px-3 py-2 rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/90 hover:border-rose-200 text-slate-700 hover:text-rose-600 transition-all flex items-center gap-1.5 cursor-pointer group"
                title="Danh sách phòng trọ bạn đã thả tim lưu lại"
              >
                <Heart className={`w-4 h-4 transition-transform group-hover:scale-110 ${wishlistIds.length > 0 ? 'fill-rose-500 text-rose-500' : 'text-slate-500'}`} />
                <span className="text-xs font-bold">Đã lưu</span>
                {wishlistIds.length > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white leading-none">
                    {wishlistIds.length}
                  </span>
                )}
              </a>

              {/* User Profile Dropdown or Login Button */}
              {user ? (
                <div className="relative" ref={userDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {user.name[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium">
                        {user.role === 'admin'
                          ? 'Quản trị viên'
                          : user.role === 'staff'
                          ? 'Nhân viên (Staff)'
                          : 'Thành viên'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                      <div className="px-3 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {user.role === 'admin'
                            ? 'Tài khoản Quản trị (Admin)'
                            : user.role === 'staff'
                            ? 'Tài khoản Nhân viên (Staff)'
                            : 'Tài khoản Khách thuê'}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-indigo-600" />
                        <span>Hồ Sơ &amp; Tài Khoản</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-indigo-600" />
                          <span>Bảng điều khiển Admin</span>
                        </Link>
                      )}

                      <Link
                        href="/my-bookings"
                        onClick={() => setUserDropdownOpen(false)}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors"
                      >
                        <Receipt className="w-4 h-4 text-indigo-600" />
                        <span>Lịch Sử Giao Dịch &amp; Đặt Cọc</span>
                      </Link>

                      <button
                        type="button"
                        onClick={handleSwitchGoogleAccount}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-500" />
                        <span>Chuyển đổi tài khoản Google</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors mt-1 border-t border-slate-100 pt-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Đăng Nhập</span>
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
            >
              Khám phá phòng trọ
            </Link>
            <a
              href="#cities"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
            >
              Trọ Cần Thơ &amp; Đại học
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
            >
              Tiện ích &amp; An ninh
            </a>
            <Link
              href="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium text-indigo-700 border-b border-slate-100 flex items-center gap-1.5"
            >
              <Receipt className="w-4 h-4 text-indigo-600" />
              <span>Lịch Sử Đặt Cọc &amp; Giao Dịch</span>
            </Link>
            {(user?.role === 'admin' || user?.role === 'staff') && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-bold text-indigo-700 border-b border-slate-100 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>{user.role === 'admin' ? 'Trang Quản Trị (Admin)' : 'Kênh Nhân Viên (Staff)'}</span>
              </Link>
            )}
            {user ? (
              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-3 py-1">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                      {user.name[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2 px-3 text-center text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>Quản Lý Hồ Sơ Cá Nhân</span>
                </Link>
                <button
                  onClick={handleSwitchGoogleAccount}
                  className="w-full py-2 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Chuyển đổi tài khoản Google
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 text-center text-xs font-bold text-red-600 bg-red-50 rounded-lg"
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-2.5 text-center text-sm font-bold text-white bg-indigo-600 rounded-lg"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        )}
      </header>

      <GoogleAccountChooserModal
        isOpen={showAccountSwitcher}
        onClose={() => setShowAccountSwitcher(false)}
        onSuccess={(role) => {
          if (role === 'admin' || role === 'staff') {
            window.location.href = '/admin';
          }
        }}
      />
    </>
  );
};
