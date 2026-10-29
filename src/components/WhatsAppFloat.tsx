'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Phone, ExternalLink } from 'lucide-react';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';

export const WhatsAppFloat: React.FC = () => {
  const { settings, messages, sendChatMessage } = useProperties();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sessionConvId, setSessionConvId] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      setSessionConvId(user.email);
      setGuestName(user.name);
      setGuestPhone(user.phone || '');
      setIsProfileSaved(true);
      return;
    }

    try {
      const savedGuest = localStorage.getItem('unistay_chat_guest');
      if (savedGuest) {
        const parsed = JSON.parse(savedGuest);
        setSessionConvId(parsed.convId);
        setGuestName(parsed.name);
        setGuestPhone(parsed.phone);
        setIsProfileSaved(true);
      } else {
        const newId = `guest-${Date.now().toString().slice(-6)}`;
        setSessionConvId(newId);
      }
    } catch {
      setSessionConvId(`guest-${Date.now().toString().slice(-6)}`);
    }
  }, [user]);

  const myMessages = messages.filter((m) => m.conversationId === sessionConvId);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [myMessages.length, isOpen]);

  const handleSaveGuestProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;
    const convId = user?.email || `khach-${guestPhone.replace(/[^0-9]/g, '')}`;
    setSessionConvId(convId);
    setIsProfileSaved(true);
    try {
      localStorage.setItem(
        'unistay_chat_guest',
        JSON.stringify({ convId, name: guestName.trim(), phone: guestPhone.trim() })
      );
    } catch {}
  };

  const handleSend = (textToSend?: string) => {
    const content = (textToSend ?? inputText).trim();
    if (!content || !sessionConvId) return;

    sendChatMessage({
      conversationId: sessionConvId,
      studentName: `${guestName || user?.name || 'Sinh viên'}${guestPhone ? ` (${guestPhone})` : ''}`,
      studentEmail: user?.email || guestPhone,
      senderRole: 'student',
      senderName: guestName || user?.name || 'Sinh viên',
      text: content,
      isReadByAdmin: false
    });

    if (!textToSend) setInputText('');
  };

  const handleOpenZalo = () => {
    const phone = (settings.supportWhatsApp || settings.supportHotline || '0901234567').replace(
      /[^0-9]/g,
      ''
    );
    window.open(`https://zalo.me/${phone}`, '_blank');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
      {/* Live Chat Popup Box */}
      {isOpen && (
        <div className="mb-3 w-[340px] sm:w-[370px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-black text-sm">
                  {(settings.brandName || 'U').charAt(0)}
                </div>
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700 absolute -bottom-0.5 -right-0.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold">Tư Vấn Phòng Trọ – {settings.brandName}</h4>
                <span className="text-[10px] text-indigo-100 block">
                  Trực tuyến • Hỗ trợ xem phòng &amp; giữ chỗ
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Zalo & Hotline Bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleOpenZalo}
              className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Chat qua App Zalo</span>
            </button>
            <a
              href={`tel:${(settings.supportHotline || '0901234567').replace(/[^0-9]/g, '')}`}
              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            >
              <Phone className="w-3 h-3" />
              <span>Gọi {settings.supportHotline}</span>
            </a>
          </div>

          {/* Chat Content */}
          {!isProfileSaved ? (
            <form onSubmit={handleSaveGuestProfile} className="p-4 space-y-3 text-xs bg-white">
              <p className="text-slate-600 leading-relaxed">
                👋 Chào bạn! Nhập tên và số điện thoại/Zalo để bắt đầu chat trực tiếp với Quản lý phòng trọ ngay trên web:
              </p>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên của bạn *</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Ví dụ: Minh Khôi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Số điện thoại / Zalo *</label>
                <input
                  type="text"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="0939 123 456"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
              >
                Bắt Đầu Chat Ngay
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 bg-slate-50/60 min-h-[230px] max-h-[290px] text-xs">
                {/* Welcome Message */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {(settings.brandName || 'U').charAt(0)}
                  </div>
                  <div className="bg-white p-2.5 rounded-2xl rounded-tl-xs border border-slate-200 text-slate-700 shadow-2xs max-w-[82%]">
                    Chào <strong>{guestName || user?.name}</strong>! Bạn đang tìm phòng trọ gần trường nào hoặc cần hỏi mã phòng nào, nhắn ngay bên dưới nhé!
                  </div>
                </div>

                {myMessages.map((msg) => {
                  const isMe = msg.senderRole === 'student';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[82%] leading-relaxed ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                        }`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">
                            Quản lý {settings.brandName}
                          </span>
                        )}
                        <span>{msg.text}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                        {msg.createdAt}
                      </span>
                    </div>
                  );
                })}

                {myMessages.length === 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] text-slate-400 block">Gợi ý câu hỏi nhanh:</span>
                    {[
                      'Mình cần tìm phòng trọ ở Ninh Kiều gần ĐH Cần Thơ',
                      'Cho mình đặt lịch hẹn chiều nay qua xem phòng nhé',
                      'Phòng trên web hiện còn trống không ạ?'
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="block w-full text-left px-2.5 py-1.5 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200/70 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        💬 {q}
                      </button>
                    ))}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Nhập tin nhắn hỏi phòng..."
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Bottom Floating Trigger */}
      <div className="flex items-end gap-3">
        {!isOpen && showTooltip && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-white text-slate-800 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200 text-xs font-semibold cursor-pointer hover:border-indigo-300 transition-colors"
          >
            <span>Cần tư vấn tìm trọ? Chat trực tuyến ngay!</span>
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

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-14 h-14 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 transition-all duration-300 cursor-pointer"
          title="Mở hộp chat tư vấn phòng trọ"
        >
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-7 h-7 fill-white text-indigo-600" />
          )}
        </button>
      </div>
    </div>
  );
};
