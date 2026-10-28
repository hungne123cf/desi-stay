'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { Property, RoomType, GenderPreference, FoodPreference, CurrencyCode } from '@/types';
import {
  ShieldCheck,
  Building,
  Plus,
  Trash2,
  Phone,
  CheckCircle,
  Users,
  Settings,
  Layers,
  Lock,
  X,
  CreditCard,
  QrCode
} from 'lucide-react';

export default function AdminPage() {
  const { user, switchRole } = useAuth();
  const {
    properties,
    bookings,
    currency,
    settings,
    formatPrice,
    addProperty,
    deleteProperty,
    updateBookingStatus,
    updateSettings
  } = useProperties();

  const [activeTab, setActiveTab] = useState<'listings' | 'leads' | 'settings'>('listings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Settings form state
  const [brandName, setBrandName] = useState(settings.brandName);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(settings.defaultCurrency);
  const [vietQrBankName, setVietQrBankName] = useState(settings.vietQrBankName);
  const [vietQrAccountNumber, setVietQrAccountNumber] = useState(settings.vietQrAccountNumber);
  const [vietQrAccountHolder, setVietQrAccountHolder] = useState(settings.vietQrAccountHolder);
  const [supportWhatsApp, setSupportWhatsApp] = useState(settings.supportWhatsApp);
  const [supportHotline, setSupportHotline] = useState(settings.supportHotline);
  const [stripeKey, setStripeKey] = useState(settings.stripePublishableKey);
  const [razorpayKey, setRazorpayKey] = useState(settings.razorpayKeyId);

  // Add Property Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCountry, setNewCountry] = useState('Vietnam');
  const [newCity, setNewCity] = useState('TP. Hồ Chí Minh');
  const [newArea, setNewArea] = useState('Quận 10');
  const [newAddress, setNewAddress] = useState('');
  const [newUniversity, setNewUniversity] = useState('ĐH Bách Khoa TP.HCM');
  const [newDistance, setNewDistance] = useState('300m (4 phút đi bộ)');
  const [newRoomType, setNewRoomType] = useState<RoomType>('studio');
  const [newGender, setNewGender] = useState<GenderPreference>('all');
  const [newFoodPref, setNewFoodPref] = useState<FoodPreference>('self_cook');
  const [newPriceUSD, setNewPriceUSD] = useState(180); // ~4.500.000 VND
  const [newDepositUSD, setNewDepositUSD] = useState(180);
  const [newTokenUSD, setNewTokenUSD] = useState(20); // ~500.000 VND
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  );
  const [newDescription, setNewDescription] = useState('');
  const [newCurfew, setNewCurfew] = useState('Giờ giấc tự do 24/7 (Khóa vân tay)');

  const totalRevenueUSD = bookings
    .filter((b) => b.status === 'token_paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.tokenAmountUSD, 0);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    addProperty({
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      address: newAddress || `${newArea}, ${newCity}`,
      city: newCity,
      country: newCountry,
      area: newArea,
      nearbyUniversity: newUniversity,
      distanceToCampus: newDistance,
      roomType: newRoomType,
      gender: newGender,
      foodPreference: newFoodPref,
      pricePerMonthUSD: Number(newPriceUSD),
      securityDepositUSD: Number(newDepositUSD),
      tokenDepositUSD: Number(newTokenUSD),
      images: [newImageUrl],
      description: newDescription || 'Phòng trọ sinh viên tiện nghi, an ninh, giờ giấc tự do.',
      highlights: [
        '0% Phí môi giới làm việc trực tiếp',
        `Gần ${newUniversity}`,
        'Khóa cửa an ninh, wifi tốc độ cao'
      ],
      amenities: [
        'Wifi tốc độ cao',
        'Máy lạnh Inverter',
        'Vệ sinh khép kín',
        'Bếp riêng tự nấu',
        'Bãi đỗ xe an ninh'
      ],
      curfewTime: newCurfew,
      availableBeds: 2,
      isVerified: true,
      isZeroBrokerage: true,
      isPublished: true,
      landlordName: user?.name || 'Chủ trọ trực tiếp',
      landlordContact: supportWhatsApp || '0901234567'
    });

    setShowAddModal(false);
    setNewTitle('');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      brandName,
      defaultCurrency,
      vietQrBankName,
      vietQrAccountNumber,
      vietQrAccountHolder,
      supportWhatsApp,
      supportHotline,
      stripePublishableKey: stripeKey,
      razorpayKeyId: razorpayKey
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Yêu cầu quyền Quản Trị</h3>
            <p className="text-xs text-slate-500 mt-1">
              Bạn đang ở góc nhìn <strong>Khách thuê</strong> ({user?.name || 'Khách vãng lai'}).
              Bấm nút dưới để chuyển sang <strong>Chủ trọ / Admin</strong> để quản lý danh sách phòng và khách đặt cọc.
            </p>
          </div>
          <button
            onClick={() => switchRole('admin')}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all"
          >
            Chuyển Sang Quyền Admin Ngay
          </button>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
              Quay lại trang xem phòng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white pt-8 pb-14 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Bảng Điều Khiển Quản Trị • Admin Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Xin chào, {user?.name.split(' ')[0]} 👋
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Quản lý kho phòng trọ, theo dõi sinh viên đặt cọc giữ chỗ, và cấu hình thông tin ngân hàng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Phòng Mới</span>
              </button>
              <Link
                href="/"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Xem Website
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Tổng số phòng trọ</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {properties.length}
            </div>
            <span className="text-[11px] text-emerald-600 font-semibold">Đang hoạt động trực tuyến</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Khách đặt lịch &amp; Lead</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {bookings.length}
            </div>
            <span className="text-[11px] text-slate-400">Từ Web &amp; VietQR / Zalo</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Tiền cọc Token đã thu</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {formatPrice(totalRevenueUSD)}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Tự động quy đổi theo {currency}</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Tiền tệ mặc định</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              {currency}
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold">Đổi được trong Settings</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex border-b border-slate-200 gap-6 text-sm font-bold">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'listings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quản Lý Phòng Trọ ({properties.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'leads'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Khách Đặt Cọc &amp; Lịch Hẹn ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-3.5 border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Cấu Hình VietQR &amp; Cổng Thanh Toán</span>
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Phòng trọ</th>
                      <th className="p-4">Quốc gia / Thành phố</th>
                      <th className="p-4">Trường ĐH gần nhất</th>
                      <th className="p-4">Loại phòng</th>
                      <th className="p-4">Giá thuê / tháng</th>
                      <th className="p-4">Cọc giữ phòng</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.map((prop) => (
                      <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={prop.images[0]}
                            alt=""
                            className="w-12 h-10 object-cover rounded-xl shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block truncate max-w-[220px]">
                              {prop.title}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {prop.code}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {prop.city}, <span className="font-semibold text-slate-800">{prop.country}</span>
                        </td>
                        <td className="p-4 text-indigo-700 font-medium truncate max-w-[180px]">
                          {prop.nearbyUniversity}
                        </td>
                        <td className="p-4 uppercase font-semibold text-slate-700">{prop.roomType}</td>
                        <td className="p-4 font-bold text-slate-900">
                          {formatPrice(prop.pricePerMonthUSD)}
                        </td>
                        <td className="p-4 font-bold text-indigo-600">
                          {formatPrice(prop.tokenDepositUSD)}
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => deleteProperty(prop.id)}
                            title="Xóa phòng"
                            className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Leads */}
        {activeTab === 'leads' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Khách thuê</th>
                      <th className="p-4">Trường học / Công ty</th>
                      <th className="p-4">Mã phòng</th>
                      <th className="p-4">Ngày nhận phòng</th>
                      <th className="p-4">Cọc giữ chỗ</th>
                      <th className="p-4">Phương thức</th>
                      <th className="p-4">Trạng thái</th>
                      <th className="p-4 text-right">Liên hệ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4">
                          <span className="font-bold text-slate-900 block">{lead.studentName}</span>
                          <span className="text-[10px] text-slate-400">{lead.studentContact}</span>
                        </td>
                        <td className="p-4 text-slate-700 font-medium">{lead.college}</td>
                        <td className="p-4">
                          <span className="font-bold text-indigo-700 font-mono">{lead.propertyCode}</span>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{lead.moveInDate}</td>
                        <td className="p-4 font-bold text-emerald-700">
                          {lead.tokenAmountLocal || formatPrice(lead.tokenAmountUSD)}
                        </td>
                        <td className="p-4 capitalize text-slate-600 font-medium">
                          {lead.paymentMethod.replace('_', ' ')}
                        </td>
                        <td className="p-4">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateBookingStatus(
                                lead.id,
                                e.target.value as 'pending' | 'token_paid' | 'confirmed' | 'cancelled'
                              )
                            }
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                          >
                            <option value="token_paid">Đã cọc Token</option>
                            <option value="confirmed">Đã chốt phòng</option>
                            <option value="pending">Chờ thanh toán</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://wa.me/${lead.studentContact.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Chào ${lead.studentName}, tôi liên hệ từ ban quản trị phòng ${lead.propertyCode} để xác nhận lịch hẹn nhận phòng của bạn.`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Nhắn tin</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Settings */}
        {activeTab === 'settings' && (
          <div className="mt-6 max-w-3xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cấu Hình Ngân Hàng VietQR &amp; Thanh Toán Toàn Cầu</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập thông tin tài khoản ngân hàng để tự động tạo mã VietQR cho khách thuê tại Việt Nam, hoặc cổng thanh toán quốc tế.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu toàn bộ cấu hình thành công!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tên Thương Hiệu (Brand Name)</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiền tệ hiển thị mặc định</label>
                  <select
                    value={defaultCurrency}
                    onChange={(e) => setDefaultCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="VND">VND (₫) – Việt Nam</option>
                    <option value="USD">USD ($) – Quốc Tế</option>
                    <option value="INR">INR (₹) – Ấn Độ</option>
                    <option value="EUR">EUR (€) – Châu Âu</option>
                  </select>
                </div>
              </div>

              {/* VietQR Section */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>Cấu hình Chuyển khoản VietQR (Napas 24/7)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tên Ngân Hàng</label>
                    <input
                      type="text"
                      value={vietQrBankName}
                      onChange={(e) => setVietQrBankName(e.target.value)}
                      placeholder="Vietcombank, MB Bank,..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số Tài Khoản</label>
                    <input
                      type="text"
                      value={vietQrAccountNumber}
                      onChange={(e) => setVietQrAccountNumber(e.target.value)}
                      placeholder="1029384756"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tên Chủ Tài Khoản</label>
                    <input
                      type="text"
                      value={vietQrAccountHolder}
                      onChange={(e) => setVietQrAccountHolder(e.target.value)}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl uppercase font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* International Gateways */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stripe Publishable Key (Thẻ quốc tế)</label>
                  <input
                    type="text"
                    value={stripeKey}
                    onChange={(e) => setStripeKey(e.target.value)}
                    placeholder="pk_live_..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razorpay Key ID (Thị trường Ấn Độ)</label>
                  <input
                    type="text"
                    value={razorpayKey}
                    onChange={(e) => setRazorpayKey(e.target.value)}
                    placeholder="rzp_live_..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline / Zalo liên hệ</label>
                  <input
                    type="text"
                    value={supportHotline}
                    onChange={(e) => setSupportHotline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Chủ Trọ</label>
                  <input
                    type="text"
                    value={supportWhatsApp}
                    onChange={(e) => setSupportWhatsApp(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm transition-all"
              >
                Lưu Toàn Bộ Cấu Hình
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="text-base font-bold">Thêm Phòng Trọ Mới Vào Hệ Thống</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tiêu đề phòng trọ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Căn hộ Studio cao cấp gần ĐH Bách Khoa"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quốc gia</label>
                  <select
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="Vietnam">Việt Nam</option>
                    <option value="India">Ấn Độ</option>
                    <option value="Australia">Úc (Australia)</option>
                    <option value="United Kingdom">Vương Quốc Anh</option>
                    <option value="Global">Khác / Toàn Cầu</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Thành phố</label>
                  <input
                    type="text"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Quận / Khu vực</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={(e) => setNewArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Trường ĐH gần nhất</label>
                  <input
                    type="text"
                    value={newUniversity}
                    onChange={(e) => setNewUniversity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Khoảng cách (Đi bộ / Xe máy)</label>
                  <input
                    type="text"
                    value={newDistance}
                    onChange={(e) => setNewDistance(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại phòng</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="studio">Căn hộ Studio</option>
                    <option value="single">Phòng đơn / Sleepbox</option>
                    <option value="double">Phòng ở ghép 2 người</option>
                    <option value="triple">Phòng 3 người</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối tượng ở</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as GenderPreference)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="all">Nam / Nữ (Chung)</option>
                    <option value="boys">Chỉ Nam</option>
                    <option value="girls">Chỉ Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ giấc</label>
                  <input
                    type="text"
                    value={newCurfew}
                    onChange={(e) => setNewCurfew(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giá thuê (tương đương USD)</label>
                  <input
                    type="number"
                    value={newPriceUSD}
                    onChange={(e) => setNewPriceUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Hiển thị: {formatPrice(newPriceUSD)}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tiền cọc đảm bảo (USD)</label>
                  <input
                    type="number"
                    value={newDepositUSD}
                    onChange={(e) => setNewDepositUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Hiển thị: {formatPrice(newDepositUSD)}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cọc giữ phòng Token (USD)</label>
                  <input
                    type="number"
                    value={newTokenUSD}
                    onChange={(e) => setNewTokenUSD(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-700"
                  />
                  <span className="text-[10px] text-indigo-600 mt-0.5 block">
                    Hiển thị: {formatPrice(newTokenUSD)}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Link ảnh chụp phòng (URL)</label>
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả phòng trọ</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả nội thất, bếp, khu vực phơi đồ, camera an ninh..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md"
                >
                  Đăng Phòng Lên Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
