'use client';

import React, { useState } from 'react';
import { Property } from '@/types';
import { useProperties } from '@/context/PropertyContext';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  ShieldCheck,
  QrCode,
  CreditCard,
  Building,
  CheckCircle2,
  Calendar,
  Sparkles,
  Phone,
  ArrowRight,
  Lock
} from 'lucide-react';

interface BookingModalProps {
  property: Property | null;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ property, onClose }) => {
  const { addBooking, formatPrice, currency } = useProperties();
  const { user } = useAuth();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'offline'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  // Form fields
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentEmail, setStudentEmail] = useState(user?.email || '');
  const [studentWhatsApp, setStudentWhatsApp] = useState(user?.phone || '+91 98765 43210');
  const [college, setCollege] = useState(user?.college || property?.nearbyUniversity || '');
  const [moveInDate, setMoveInDate] = useState('2026-11-15');

  if (!property) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !studentWhatsApp) {
      alert('Please fill in your name and WhatsApp number.');
      return;
    }
    setStep('payment');
  };

  const handleCompletePayment = async () => {
    setIsProcessing(true);
    // Simulate payment gateway delay (Razorpay / UPI)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const methodMap = {
      upi: 'razorpay_upi' as const,
      card: 'card' as const,
      offline: 'offline_transfer' as const
    };

    const newId = addBooking({
      propertyId: property.id,
      propertyTitle: property.title,
      propertyCode: property.code,
      studentName,
      studentEmail,
      studentWhatsApp,
      universityOrCollege: college,
      moveInDate,
      sharingPreference: property.roomType,
      tokenPaidINR: property.tokenDepositINR,
      paymentStatus: paymentMethod === 'offline' ? 'pending' : 'token_paid',
      paymentMethod: methodMap[paymentMethod],
      transactionId: `TXN_${Math.random().toString(36).substring(2, 9).toUpperCase()}`
    });

    setConfirmedBookingId(newId);
    setIsProcessing(false);
    setStep('success');
  };

  const handleOpenWhatsAppConfirmation = () => {
    const phone = property.landlord.phoneWhatsApp.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello! I just placed a booking for "${property.title}" (Code: ${property.code}) on YuvaStays.
Booking ID: ${confirmedBookingId}
Name: ${studentName}
Token Amount: ${formatPrice(property.tokenDepositINR)}
Move-in: ${moveInDate}
Please confirm my room reservation!`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-orange-100 font-semibold uppercase tracking-wider mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Verified PG Token Booking</span>
            </div>
            <h3 className="text-lg font-bold truncate max-w-[340px]">{property.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Step 1: Student Details */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Pricing Summary Banner */}
              <div className="p-3.5 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Holding Token Deposit:</span>
                  <span className="text-xl font-black text-orange-600">
                    {formatPrice(property.tokenDepositINR)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Monthly Rent:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {formatPrice(property.pricePerMonthINR)} / mo
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentWhatsApp}
                      onChange={(e) => setStudentWhatsApp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      placeholder="student@gmail.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    College / University Enrolled
                  </label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="e.g. Christ University / CTUMP"
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Expected Move-in Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Token deposit holds your bed for 48 hours. 100% refundable if room condition does not match listing.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Pay Token ({formatPrice(property.tokenDepositINR)})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Payment Gateway Selection */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Select Payment Mode</p>
                <div className="text-2xl font-black text-slate-900 mt-0.5">
                  {formatPrice(property.tokenDepositINR)}
                </div>
                <p className="text-xs text-emerald-600 font-semibold">Zero Gateway Fees • Secured by 256-bit SSL</p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto text-orange-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-800">UPI Instant</span>
                  <span className="text-[10px] text-slate-400">GPay, PhonePe</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto text-indigo-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-800">Cards</span>
                  <span className="text-[10px] text-slate-400">RuPay, Visa, MC</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('offline')}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    paymentMethod === 'offline'
                      ? 'border-orange-500 bg-orange-50/60 ring-2 ring-orange-500/20'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto text-emerald-600 mb-1" />
                  <span className="text-xs font-bold block text-slate-800">Pay on Visit</span>
                  <span className="text-[10px] text-slate-400">Campus Check</span>
                </button>
              </div>

              {/* Payment Content Area */}
              {paymentMethod === 'upi' && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-3">
                  <div className="w-40 h-40 mx-auto bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                    {/* Simulated UPI QR Code SVG */}
                    <div className="w-full h-full bg-slate-900 rounded-lg flex items-center justify-center text-white p-2">
                      <div className="text-center">
                        <QrCode className="w-16 h-16 mx-auto text-white opacity-90" />
                        <span className="text-[10px] font-mono block mt-1">UPI ID: desistays@okhdfc</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    Scan with any UPI App: <strong>Google Pay, PhonePe, Paytm, BHIM</strong>
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="•••• •••• •••• 4242"
                      defaultValue="4242 4242 4242 4242"
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Expiry</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        defaultValue="12/28"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        defaultValue="888"
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'offline' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                  <p className="font-bold">Reserve for In-Person Visit:</p>
                  <p>Our student advisor will contact you via WhatsApp to coordinate an in-person room inspection before any payment.</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="w-1/3 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-2/3 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span className="animate-pulse">Authorizing Payment...</span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Authorize {formatPrice(property.tokenDepositINR)}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success Confirmation */}
          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">Bed Reservation Confirmed!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Booking Reference: <strong className="font-mono text-orange-600">{confirmedBookingId}</strong>
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">{studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-bold text-slate-800">{property.code} - {property.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Token Paid:</span>
                  <span className="font-bold text-emerald-700">{formatPrice(property.tokenDepositINR)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Move-in Date:</span>
                  <span className="font-bold text-slate-800">{moveInDate}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsAppConfirmation}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Phone className="w-4 h-4" />
                  <span>Send Confirmation to Warden on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
