'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import {
  Home,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Building,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const { currency, toggleCurrency } = useProperties();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900">
                  Yuva<span className="text-orange-600">Stays</span>
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                  .IN
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-0.5">
                Student Housing & PGs
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-orange-600 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4 text-slate-400" />
              Explore PGs
            </Link>
            <a href="#cities" className="hover:text-orange-600 transition-colors">
              Campus Hubs
            </a>
            <a href="#benefits" className="hover:text-orange-600 transition-colors">
              Pure Veg & Safety
            </a>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-200 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Admin Portal
            </Link>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Currency Toggle */}
            <button
              onClick={toggleCurrency}
              title="Click to toggle Currency (INR ₹ / USD $)"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
            >
              <span className="text-orange-600 font-extrabold">{currency === 'INR' ? '₹ INR' : '$ USD'}</span>
              <span className="text-[10px] text-slate-400">Switch</span>
            </button>

            {/* Role Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Role: <strong className="capitalize text-slate-900">{user?.role || 'Guest'}</strong></span>
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 text-xs">
                  <div className="p-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-800">Quick Role Switch (Demo)</p>
                    <p className="text-slate-500 text-[11px]">Experience the site as a student or as the property admin</p>
                  </div>
                  <button
                    onClick={() => {
                      switchRole('student');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                      user?.role === 'student' ? 'bg-orange-50 text-orange-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>🎓 Student Mode</span>
                    {user?.role === 'student' && <span className="text-[10px] bg-orange-200 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                  <button
                    onClick={() => {
                      switchRole('admin');
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors ${
                      user?.role === 'admin' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>👑 Admin / Owner Mode</span>
                    {user?.role === 'admin' && <span className="text-[10px] bg-indigo-200 px-1.5 py-0.5 rounded">Active</span>}
                  </button>
                </div>
              )}
            </div>

            {/* User Profile or Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 rounded-xl shadow-sm transition-all"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleCurrency}
              className="px-2 py-1 text-xs font-bold rounded border border-slate-200 bg-slate-50 text-orange-600"
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
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-800 border-b border-slate-100"
          >
            Explore PGs & Hostels
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-bold text-indigo-700 border-b border-slate-100"
          >
            Admin Management Portal
          </Link>
          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-500">Current Role: <strong>{user?.role}</strong></span>
            <button
              onClick={() => switchRole(user?.role === 'admin' ? 'student' : 'admin')}
              className="text-xs font-bold text-orange-600 underline"
            >
              Switch to {user?.role === 'admin' ? 'Student' : 'Admin'}
            </button>
          </div>
          {user ? (
            <button
              onClick={logout}
              className="w-full mt-2 py-2 text-center text-sm font-bold text-red-600 bg-red-50 rounded-lg"
            >
              Log Out ({user.name})
            </button>
          ) : (
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full py-2.5 text-center text-sm font-bold text-white bg-orange-600 rounded-lg"
            >
              Sign In with Google / Email
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
