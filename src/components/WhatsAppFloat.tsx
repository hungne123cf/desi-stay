'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Phone, ExternalLink, ArrowRight, BellRing } from 'lucide-react';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import { TRUONG_HUNG_ADMIN_AVATAR, TRUONG_HUNG_K18_AVATAR } from '@/config/auth';

export const WhatsAppFloat: React.FC = () => {
  const pathname = usePathname();
  const { settings, messages, sendChatMessage, migrateConversationId } = useProperties();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isProfileSaved, setIsProfileSaved] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sessionConvId, setSessionConvId] = useState('');
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    senderName: string;
    createdAt: string;
  } | null>(null);
  const [unreadFromAdmin, setUnreadFromAdmin] = useState(0);

  const prevMsgLengthRef = useRef<number>(0);
  const isInitialMountRef = useRef<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.email) {
      const oldGuestId = typeof window !== 'undefined' ? localStorage.getItem('unistay_chat_guest_id') : null;
      if (oldGuestId && oldGuestId !== user.email) {
        migrateConversationId(oldGuestId, user.email);
        try {
          localStorage.removeItem('unistay_chat_guest_id');
        } catch {}
      }
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
        let guestId = localStorage.getItem('unistay_chat_guest_id');
        if (!guestId) {
          guestId = `guest-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;
          localStorage.setItem('unistay_chat_guest_id', guestId);
        }
        setSessionConvId(guestId);
      }
    } catch {
      setSessionConvId(`guest-${Date.now().toString().slice(-6)}`);
    }
  }, [user]);

  const cleanGuestPhone = guestPhone.replace(/[^0-9]/g, '');
  const myMessages = messages.filter(
    (m) =>
      m.conversationId === sessionConvId ||
      (user?.email && (m.studentEmail === user.email || m.conversationId === user.email)) ||
      (cleanGuestPhone.length >= 8 && m.conversationId === `khach-${cleanGuestPhone}`)
  );

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadFromAdmin(0);
      setToastMessage(null);
    }
  }, [myMessages.length, isOpen]);

  // Thông báo tin nhắn mới dạng Toast chuẩn Zalo khi người dùng chưa mở khung chat
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevMsgLengthRef.current = myMessages.length;
      return;
    }

    if (myMessages.length > prevMsgLengthRef.current) {
      const latestMsg = myMessages[myMessages.length - 1];
      if (latestMsg && latestMsg.senderRole === 'admin' && !isOpen) {
        setUnreadFromAdmin((prev) => prev + 1);
        setToastMessage({
          text: latestMsg.text,
          senderName: latestMsg.senderName || 'Ban Quản Trị UniStay',
          createdAt: latestMsg.createdAt
        });

        // Âm thanh chuông báo tin nhắn Zalo mô phỏng Web Audio API
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(659.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          }
        } catch {}
      }
    }
    prevMsgLengthRef.current = myMessages.length;
  }, [myMessages, isOpen]);

  // Tự động tắt Toast thông báo sau 7 giây
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleSaveGuestProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim()) return;
    const cleanPhone = guestPhone.replace(/[^0-9]/g, '');
    const convId = user?.email || `khach-${cleanPhone}`;
    if (sessionConvId && sessionConvId !== convId) {
      migrateConversationId(sessionConvId, convId);
    }
    const oldGuestId = localStorage.getItem('unistay_chat_guest_id');
    if (oldGuestId && oldGuestId !== convId) {
      migrateConversationId(oldGuestId, convId);
    }
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

    const studentAvatar = user?.avatar || (user?.email === 'hungtce181568@fpt.edu.vn' ? TRUONG_HUNG_K18_AVATAR : undefined);

    sendChatMessage({
      conversationId: sessionConvId,
      studentName: `${guestName || user?.name || 'Sinh viên'}${guestPhone ? ` (${guestPhone})` : ''}`,
      studentEmail: user?.email || guestPhone,
      senderRole: 'student',
      senderName: guestName || user?.name || 'Sinh viên',
      senderAvatar: studentAvatar,
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

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isDetailPage = Boolean(pathname?.startsWith('/properties/'));

  return (
    <div
      className={`fixed ${
        isDetailPage ? 'bottom-24 lg:bottom-5' : 'bottom-5'
      } right-4 sm:right-5 z-40 flex flex-col items-end transition-all`}
    >
      {/* Live Chat Popup Box */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] sm:w-[370px] max-w-[380px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[520px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <img
                  src={TRUONG_HUNG_ADMIN_AVATAR}
                  alt="Admin UniStay"
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/60 shadow-xs"
                  referrerPolicy="no-referrer"
                />
                <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-indigo-700 absolute -bottom-0.5 -right-0.5 shadow-2xs" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Trương Hùng (Admin UniStay)</h4>
                <span className="text-[10px] text-indigo-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                  Trực tuyến • Tư vấn phòng &amp; cọc
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Zalo & Hotline Bar */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-[11px]">
            <button
              type="button"
              onClick={handleOpenZalo}
              className="flex-1 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Chat qua App Zalo</span>
            </button>
            <a
              href={`tel:${(settings.supportHotline || '0901234567').replace(/[^0-9]/g, '')}`}
              className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Phone className="w-3 h-3" />
              <span>Gọi {settings.supportHotline}</span>
            </a>
          </div>

          {/* Chat Content */}
          {!user ? (
            <div className="p-6 text-center flex flex-col items-center justify-center space-y-4 bg-white">
              <div className="w-14 h-14 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h5 className="font-bold text-slate-900 text-sm">Yêu cầu đăng nhập để Chat</h5>
                <p className="text-[11px] text-slate-500 leading-relaxed px-1">
                  Vui lòng đăng nhập tài khoản sinh viên để nhắn tin trực tiếp với Quản lý phòng trọ và lưu lại lịch sử tư vấn.
                </p>
              </div>
              <div className="w-full space-y-2 pt-1">
                <Link
                  href={`/auth/login?next=${encodeURIComponent(pathname || '/')}`}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <span>Đăng nhập ngay</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/auth/register?next=${encodeURIComponent(pathname || '/')}`}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center transition-all"
                >
                  <span>Tạo tài khoản mới</span>
                </Link>
              </div>
              <div className="text-[10px] text-slate-400 pt-1 leading-snug">
                💡 Cần hỏi gấp mà chưa có tài khoản? Bạn có thể bấm nút <strong>Chat qua App Zalo</strong> hoặc <strong>Gọi Hotline</strong> ở thanh trên nhé!
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/70 min-h-[230px] max-h-[290px] text-xs">
                {/* Welcome Message */}
                <div className="flex items-start gap-2">
                  <img
                    src={TRUONG_HUNG_ADMIN_AVATAR}
                    alt="Admin"
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-slate-200 shadow-2xs"
                    referrerPolicy="no-referrer"
                  />
                  <div className="bg-white p-2.5 rounded-2xl rounded-tl-xs border border-slate-200 text-slate-700 shadow-2xs max-w-[82%]">
                    <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">
                      Ban Quản Trị UniStay
                    </span>
                    Chào <strong>{guestName || user?.name}</strong>! Bạn đang tìm phòng trọ gần trường nào hoặc cần đặt lịch xem phòng, nhắn ngay cho mình nhé!
                  </div>
                </div>

                {myMessages.map((msg) => {
                  const isMe = msg.senderRole === 'student';
                  const myAvatar = user?.avatar || (user?.email === 'hungtce181568@fpt.edu.vn' ? TRUONG_HUNG_K18_AVATAR : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80');
                  const adminAvatar = msg.senderAvatar || TRUONG_HUNG_ADMIN_AVATAR;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMe && (
                        <img
                          src={adminAvatar}
                          alt="Admin"
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        <div
                          className={`px-3 py-2 rounded-2xl leading-relaxed ${
                            isMe
                              ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-2xs'
                          }`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-bold text-indigo-600 block mb-0.5">
                              {msg.senderName || 'Ban Quản Trị UniStay'}
                            </span>
                          )}
                          <span>{msg.text}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">
                          {msg.createdAt}
                        </span>
                      </div>
                      {isMe && (
                        <img
                          src={myAvatar}
                          alt="Me"
                          className="w-7 h-7 rounded-full object-cover shrink-0 border border-indigo-200 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                  );
                })}

                {myMessages.length === 0 && (
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Gợi ý câu hỏi nhanh:</span>
                    {[
                      'Mình cần tìm phòng trọ ở Ninh Kiều gần ĐH Cần Thơ',
                      'Cho mình đặt lịch hẹn chiều nay qua xem phòng nhé',
                      'Phòng trên web hiện còn trống không ạ?'
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="block w-full text-left px-2.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 hover:border-indigo-300 text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
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
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600 transition-colors"
                />
                <button
                  type="submit"
                  className="w-9 h-9 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Zalo-style Floating Notification Toast */}
      {toastMessage && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setToastMessage(null);
          }}
          className="mb-3 max-w-[340px] w-[calc(100vw-2rem)] sm:w-[320px] bg-white rounded-2xl shadow-2xl border border-indigo-100 p-3 flex items-start gap-3 cursor-pointer hover:border-indigo-300 hover:shadow-indigo-500/15 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300 group relative"
        >
          <div className="relative shrink-0">
            <img
              src={TRUONG_HUNG_ADMIN_AVATAR}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute -bottom-0.5 -right-0.5" />
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                {toastMessage.senderName}
              </span>
              <span className="text-[9px] text-indigo-600 font-semibold shrink-0">
                Vừa xong
              </span>
            </div>
            <p className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
              {toastMessage.text}
            </p>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 inline-flex items-center gap-1 group-hover:underline">
              <span>Bấm để trả lời</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setToastMessage(null);
            }}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Bottom Floating Trigger */}
      <div className="flex items-end gap-3">
        {!isOpen && showTooltip && !toastMessage && (
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
          {unreadFromAdmin > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-red-600 text-white text-[11px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-md animate-bounce">
              {unreadFromAdmin > 9 ? '9+' : unreadFromAdmin}
            </span>
          ) : (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          )}
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
