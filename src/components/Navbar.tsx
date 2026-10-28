'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { CurrencyCode } from '@/types';
import {
  Building2,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Globe2,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { currency, setCurrency, settings } = useProperties();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);

  const currencies: { code: CurrencyCode; label: string; symbol: string }[] = [
    { code: 'VND', label: 'Việt Nam Đồng', symbol: '₫' },
    { code: 'USD', label: 'US Dollar', symbol: '$' },
    { code: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { code: 'EUR', label: 'Euro', symbol: '€' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
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
                  Global
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5 truncate max-w-[180px]">
                {settings.tagline || 'Student Housing & Co-Living'}
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Khám phá phòng trọ
            </Link>
            <a href="#cities" className="hover:text-indigo-600 transition-colors">
              Khu vực trường ĐH
            </a>
            <a href="#benefits" className="hover:text-indigo-600 transition-colors">
              Tiện ích &amp; An ninh
            </a>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-full border border-indigo-200 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Multi-Currency Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all cursor-pointer"
              >
                <Globe2 className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-indigo-600 font-black">{currency}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {currencyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chọn loại tiền tệ / Currency
                  </p>
                  {currencies.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setCurrencyDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                        currency === c.code
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{c.code} ({c.symbol})</span>
                      <span className="text-[10px] text-slate-400">{c.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[140px]">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {user.role === 'admin' ? '👑 Quản Trị Viên' : 'Khách Thuê'}
                  </p>
                </div>
                {user.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="px-2.5 py-1 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  title="Đăng xuất"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Đăng Nhập
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => {
                const next: CurrencyCode = currency === 'VND' ? 'USD' : currency === 'USD' ? 'INR' : 'VND';
                setCurrency(next);
              }}
              className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-indigo-600"
            >
              {currency}
            </button>
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
            Khu vực trường ĐH
          </a>
          <a
            href="#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 border-b border-slate-100"
          >
            Tiện ích &amp; An ninh
          </a>
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-indigo-700 border-b border-slate-100"
            >
              Trang Quản Trị (Admin Portal)
            </Link>
          )}
          {user ? (
            <div className="pt-2">
              <div className="flex items-center justify-between py-1">
                <span className="text-xs font-bold text-slate-800">{user.name}</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {user.role === 'admin' ? '👑 Admin' : 'Khách thuê'}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full mt-2 py-2 text-center text-sm font-bold text-red-600 bg-red-50 rounded-lg"
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
              Đăng nhập bằng Google / Email
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
