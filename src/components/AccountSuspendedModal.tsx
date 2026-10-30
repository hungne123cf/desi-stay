'use client';

import React from 'react';
import { ShieldAlert, Phone, ExternalLink, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  supportPhone?: string;
}

export const AccountSuspendedModal: React.FC<Props> = ({
  isOpen,
  onClose,
  supportPhone = '0901234567'
}) => {
  if (!isOpen) return null;

  const cleanPhone = supportPhone.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Glow & Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shadow-inner">
          <div className="absolute inset-0 rounded-3xl bg-rose-400/20 blur-xl animate-pulse" />
          <ShieldAlert className="w-10 h-10 relative z-10" />
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-100 text-rose-700">
            Thông Báo Hệ Thống
          </span>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Tài Khoản Đang Bị Tạm Khóa
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Quản trị viên đã tạm khóa quyền truy cập của tài khoản này để bảo đảm an toàn dữ liệu và tuân thủ chính sách hệ thống. Phiên làm việc trên trình duyệt đã kết thúc.
          </p>
        </div>

        {/* Support Box */}
        <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-left space-y-2.5">
          <p className="text-[11px] font-bold text-slate-700">
            Bạn cần mở khóa hoặc khiếu nại tài khoản?
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-0.5">
            <a
              href={`https://zalo.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Nhắn Zalo Quản Trị</span>
            </a>
            <a
              href={`tel:${cleanPhone}`}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi {supportPhone}</span>
            </a>
          </div>
        </div>

        {/* Close & Return Home */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 cursor-pointer transition-all"
        >
          <span>Đã hiểu & Quay về trang chủ</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

