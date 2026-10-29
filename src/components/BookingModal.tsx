'use client';

import React, { useState } from 'react';
import { Property, PaymentMethod } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  Copy,
  Check
} from 'lucide-react';

interface BookingModalProps {
  property: Property | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ property, onClose }) => {
  const { addBooking, formatPrice, settings } = useProperties();
  const { user } = useAuth();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('vietqr_bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Form fields
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [studentContact, setStudentContact] = useState(user?.phone || '');
  const [college, setCollege] = useState(user?.college || property?.nearbyUniversity || '');
  const [moveInDate, setMoveInDate] = useState('2026-11-15');

  if (!property) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentContact) {
      alert('Vui lòng điền họ tên và số điện thoại Zalo liên hệ.');
      return;
    }
    setStep('payment');
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 800));

    const ref = addBooking({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyCode: property.code,
      userId: user?.id || 'guest',
      studentName,
      studentEmail: studentEmail || 'sinhvien@gmail.com',
      studentContact,
      college,
      moveInDate,
      roomType: property.roomType,
      tokenAmountUSD: property.tokenDepositUSD,
      tokenAmountLocal: formatPrice(property.tokenDepositUSD, 'VND'),
      currency: 'VND',
      status: selectedMethod === 'pay_on_visit' ? 'pending' : 'token_paid',
      paymentMethod: selectedMethod,
      transactionReference: `VN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      adminNotes: `Đặt giữ chỗ từ website (${selectedMethod === 'vietqr_bank' ? 'Chuyển khoản VietQR' : 'Hẹn xem phòng trực tiếp'})`
    });

    setConfirmedBookingRef(ref);
    setIsProcessing(false);
    setStep('success');
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(settings.vietQrAccountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleOpenZaloOrCall = () => {
    const contact = property.landlordContact.replace(/[^0-9]/g, '');
    window.open(`https://zalo.me/${contact}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-100 font-semibold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Đặt Cọc Giữ Chỗ Phòng Trọ Trực Tuyến</span>
            </div>
            <h3 className="text-lg font-bold truncate max-w-[340px]">{property.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Price Banner */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Tiền cọc giữ chỗ 48h:</span>
                  <span className="text-xl font-black text-indigo-600">
                    {formatPrice(property.tokenDepositUSD, 'VND')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Giá thuê tháng:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatPrice(property.pricePerMonthUSD, 'VND')} / tháng
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Họ và tên người thuê *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Số điện thoại / Zalo *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentContact}
                      onChange={(e) => setStudentContact(e.target.value)}
                      placeholder="0901 234 567"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="sinhvien@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Trường Đại học / Cao đẳng đang học
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Ví dụ: ĐH Cần Thơ, ĐH FPT Cần Thơ, ĐH Y Dược..."
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Ngày dự kiến chuyển vào ở
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Tiền cọc giữ chỗ giúp khóa phòng trong 48h và được trừ thẳng vào tiền phòng tháng đầu tiên. Cam kết hoàn tiền 100% nếu phòng thực tế không đúng hình ảnh.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tiếp tục giữ chỗ ({formatPrice(property.tokenDepositUSD, 'VND')})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'payment' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">
                  Số tiền đặt cọc giữ chỗ
                </p>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatPrice(property.tokenDepositUSD, 'VND')}
                </div>
                <p className="text-xs text-emerald-600 font-semibold">
                  Chuyển khoản trực tiếp VietQR • 0đ phí môi giới
                </p>
              </div>

              {/* Payment Methods (Vietnam only) */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('vietqr_bank')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedMethod === 'vietqr_bank'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-800">Mã QR Ngân Hàng</span>
                  <span className="text-[10px] text-slate-500">VietQR Chuyển khoản 24/7</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('pay_on_visit')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedMethod === 'pay_on_visit'
                      ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-600/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-800">Hẹn Xem Phòng Trước</span>
                  <span className="text-[10px] text-slate-500">Cọc trực tiếp khi tới xem</span>
                </button>
              </div>

              {/* VietQR View */}
              {selectedMethod === 'vietqr_bank' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                    <img
                      src={`https://api.vietqr.io/image/970436-${settings.vietQrAccountNumber}-compact2.jpg?amount=${Math.round(
                        property.tokenDepositUSD * 25400
                      )}&addInfo=${encodeURIComponent(
                        `COC PHONG ${property.code}`
                      )}&accountName=${encodeURIComponent(settings.vietQrAccountHolder)}`}
                      alt="Mã VietQR Chuyển khoản"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-left text-xs bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ngân hàng:</span>
                      <span className="font-bold text-slate-800">{settings.vietQrBankName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Số tài khoản:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-indigo-700 font-mono">
                          {settings.vietQrAccountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyAccount}
                          className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          {copiedAccount ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Chủ tài khoản:</span>
                      <span className="font-bold text-slate-800">{settings.vietQrAccountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Nội dung CK:</span>
                      <span className="font-bold text-indigo-700 font-mono">
                        COC PHONG {property.code}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pay on Visit */}
              {selectedMethod === 'pay_on_visit' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Đặt lịch hẹn xem phòng trực tiếp:</p>
                  <p>
                    Hệ thống sẽ ghi nhận thông tin và chủ trọ sẽ liên hệ qua số điện thoại / Zalo của bạn để đón bạn xem phòng trực tiếp trước khi đặt cọc.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Đang xác nhận...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Xác nhận giữ chỗ</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">Đăng Ký Giữ Phòng Thành Công!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Mã đơn giữ chỗ: <strong className="font-mono text-indigo-600">{confirmedBookingRef}</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người thuê:</span>
                  <span className="font-bold text-slate-800">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phòng trọ:</span>
                  <span className="font-bold text-slate-800">
                    {property.code} - {property.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền cọc:</span>
                  <span className="font-bold text-emerald-700">
                    {formatPrice(property.tokenDepositUSD, 'VND')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày chuyển vào:</span>
                  <span className="font-bold text-slate-800">{moveInDate}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpenZaloOrCall}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Nhắn Zalo cho Chủ Trọ xác nhận lịch nhận phòng</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
