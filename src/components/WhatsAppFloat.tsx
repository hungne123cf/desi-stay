'use client';

import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useProperties } from '@/context/PropertyContext';

export const WhatsAppFloat: React.FC = () => {
  const { settings } = useProperties();
  const [showTooltip, setShowTooltip] = useState(true);

  const handleOpenContact = () => {
    const phone = (settings.supportHotline || '0901234567').replace(/[^0-9]/g, '');
    window.open(`https://zalo.me/${phone}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-semibold">
          <span>Cần tìm phòng trọ tại Cần Thơ? Nhắn Zalo ngay!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Zalo / Support Floating Button */}
      <button
        onClick={handleOpenContact}
        className="relative w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all duration-300 cursor-pointer"
        title="Nhắn tin Zalo hỗ trợ tìm phòng trọ"
      >
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        <MessageCircle className="w-7 h-7 fill-white text-indigo-600" />
      </button>
    </div>
  );
};
