'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { Property, RoomType, GenderPreference, FoodPreference, CurrencyCode } from '@/types';
import {
  VIETNAM_LOCATIONS,
  DISTANCE_PRESETS,
  CURFEW_PRESETS,
  SAMPLE_ROOM_IMAGES
} from '@/data/locations';
import { uploadOrCompressImage } from '@/lib/supabase/storage';
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
  QrCode,
  MapPin,
  GraduationCap,
  Upload,
  Image as ImageIcon,
  Map,
  Eye,
  ExternalLink,
  Clock
} from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
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
  const [selectedDetailProp, setSelectedDetailProp] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [propertyCreatedToast, setPropertyCreatedToast] = useState(false);

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

  // Add Property Form State (100% Vietnam)
  const [newTitle, setNewTitle] = useState('');
  const [newCity, setNewCity] = useState('Cần Thơ');
  const [newArea, setNewArea] = useState('Quận Ninh Kiều');
  const [customArea, setCustomArea] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newUniversity, setNewUniversity] = useState('ĐH Cần Thơ (CTU - Khu II Đường 3/2)');
  const [customUniversity, setCustomUniversity] = useState('');
  const [newDistance, setNewDistance] = useState('300m (4 phút đi bộ)');
  const [newRoomType, setNewRoomType] = useState<RoomType>('studio');
  const [newGender, setNewGender] = useState<GenderPreference>('all');
  const [newFoodPref] = useState<FoodPreference>('self_cook');
  const [newPriceVND, setNewPriceVND] = useState(3000000);
  const [newDepositVND, setNewDepositVND] = useState(3000000);
  const [newTokenVND, setNewTokenVND] = useState(500000);
  const [newImageUrl, setNewImageUrl] = useState(
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  );
  const [newDescription, setNewDescription] = useState('');
  const [newCurfew, setNewCurfew] = useState('Giờ giấc tự do 24/7 (Khóa vân tay)');
  const [showMapPreview, setShowMapPreview] = useState(true);

  const currentCityData =
    VIETNAM_LOCATIONS.find((c) => c.city === newCity) || VIETNAM_LOCATIONS[0];

  const handleCityChange = (cityName: string) => {
    setNewCity(cityName);
    const foundCity = VIETNAM_LOCATIONS.find((c) => c.city === cityName);
    if (foundCity) {
      setNewArea(foundCity.districts[0] || '');
      setNewUniversity(foundCity.universities[0] || '');
      setCustomArea('');
      setCustomUniversity('');
    }
  };

  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const handleLocalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const { url } = await uploadOrCompressImage(file);
      setNewImageUrl(url);
    } catch {
      // fallback
    } finally {
      setIsUploadingImage(false);
    }
  };

  const totalRevenueUSD = bookings
    .filter((b) => b.status === 'token_paid' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.tokenAmountUSD, 0);

  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const finalArea = newArea === '__custom__' ? customArea.trim() || newCity : newArea;
    const finalUniversity =
      newUniversity === '__custom__' ? customUniversity.trim() || 'Đại học khu vực' : newUniversity;

    const EXCHANGE_VND_PER_USD = 25400;
    const computedPriceUSD = Math.max(1, Math.round(newPriceVND / EXCHANGE_VND_PER_USD));
    const computedDepositUSD = Math.max(1, Math.round(newDepositVND / EXCHANGE_VND_PER_USD));
    const computedTokenUSD = Math.max(1, Math.round(newTokenVND / EXCHANGE_VND_PER_USD));

    const fullAddress = newAddress.trim()
      ? `${newAddress.trim()}, ${finalArea}, ${newCity}`
      : `${finalArea}, ${newCity}`;

    addProperty({
      title: newTitle,
      slug: `${newTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      address: fullAddress,
      city: newCity,
      country: 'Việt Nam',
      area: finalArea,
      nearbyUniversity: finalUniversity,
      distanceToCampus: newDistance,
      roomType: newRoomType,
      gender: newGender,
      foodPreference: newFoodPref,
      pricePerMonthUSD: computedPriceUSD,
      securityDepositUSD: computedDepositUSD,
      tokenDepositUSD: computedTokenUSD,
      images: [newImageUrl],
      description: newDescription || 'Phòng trọ sinh viên tiện nghi, an ninh, giờ giấc tự do.',
      highlights: [
        '0% Phí môi giới làm việc trực tiếp',
        `Gần ${finalUniversity} (${newDistance})`,
        newCurfew
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
    setNewAddress('');
    setPropertyCreatedToast(true);
    setTimeout(() => setPropertyCreatedToast(false), 6000);
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
              Khu vực này dành riêng cho Quản trị viên (Admin).
              Vui lòng đăng nhập bằng tài khoản Admin để truy cập Bảng điều khiển quản lý phòng và khách đặt cọc.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full block py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all text-center"
          >
            Đăng nhập tài khoản Admin
          </Link>
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
              Quay lại trang xem phòng trọ
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
            <span className="text-xs font-semibold text-slate-500 block">Tiền cọc giữ chỗ đã thu</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">
              {formatPrice(totalRevenueUSD, 'VND')}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold">Thanh toán qua VietQR 24/7</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 block">Khu vực trọng điểm</span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 mt-1">
              Cần Thơ
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold">&amp; các tỉnh thành Việt Nam</span>
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
            <span>Cấu Hình VietQR &amp; Liên Hệ</span>
          </button>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="mt-6 space-y-4">
            {propertyCreatedToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-xs text-emerald-900 shadow-xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Đã đăng phòng trọ mới lên hệ thống thành công! Phòng đã hiển thị ở vị trí đầu tiên trên trang User.</span>
                </div>
                <Link
                  href="/"
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0 transition-colors"
                >
                  Xem trên trang User ↗
                </Link>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Phòng trọ</th>
                      <th className="p-4">Khu vực / Tỉnh thành</th>
                      <th className="p-4">Trường ĐH gần nhất</th>
                      <th className="p-4">Loại phòng</th>
                      <th className="p-4">Giá thuê / tháng</th>
                      <th className="p-4">Cọc giữ phòng</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {properties.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700 text-sm">Chưa có phòng trọ nào trong hệ thống</p>
                          <p className="text-xs text-slate-400 mt-1 mb-4">
                            Toàn bộ dữ liệu mẫu đã được xóa sạch. Hãy bấm &ldquo;+ Thêm Phòng Mới&rdquo; để đăng phòng trọ thực tế đầu tiên!
                          </p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Thêm Phòng Trọ Đầu Tiên</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      properties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailProp(prop)}
                              className="flex items-center gap-3 text-left group cursor-pointer"
                            >
                              <img
                                src={prop.images[0]}
                                alt=""
                                className="w-12 h-10 object-cover rounded-xl shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-indigo-500/40 transition-all"
                              />
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors block truncate max-w-[220px]">
                                  {prop.title}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {prop.code} • Bấm để xem chi tiết
                                </span>
                              </div>
                            </button>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">
                            {prop.area}, <span className="font-semibold text-slate-800">{prop.city}</span>
                          </td>
                          <td className="p-4 text-indigo-700 font-medium truncate max-w-[180px]">
                            {prop.nearbyUniversity}
                          </td>
                          <td className="p-4 uppercase font-semibold text-slate-700">{prop.roomType}</td>
                          <td className="p-4 font-bold text-slate-900">
                            {formatPrice(prop.pricePerMonthUSD, 'VND')}
                          </td>
                          <td className="p-4 font-bold text-indigo-600">
                            {formatPrice(prop.tokenDepositUSD, 'VND')}
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedDetailProp(prop)}
                                title="Xem chi tiết phòng"
                                className="px-2.5 py-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold text-[11px] inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Chi tiết</span>
                              </button>
                              <Link
                                href={`/properties/${prop.id}`}
                                title="Mở trang hiển thị bên User"
                                className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => setPropertyToDelete(prop)}
                                title="Xóa phòng"
                                className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
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
                      <th className="p-4">Trường Đại học</th>
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
                          {lead.tokenAmountLocal || formatPrice(lead.tokenAmountUSD, 'VND')}
                        </td>
                        <td className="p-4 text-slate-600 font-medium">
                          {lead.paymentMethod === 'vietqr' ? 'Chuyển khoản VietQR' : 'Hẹn xem trực tiếp'}
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
                            <option value="token_paid">Đã cọc giữ chỗ</option>
                            <option value="confirmed">Đã chốt phòng</option>
                            <option value="pending">Chờ thanh toán</option>
                            <option value="cancelled">Đã hủy</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <a
                            href={`https://zalo.me/${lead.studentContact.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <span>Chat Zalo</span>
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
              <h3 className="text-lg font-bold text-slate-900">Cấu Hình Ngân Hàng VietQR &amp; Thông Tin Liên Hệ</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Thiết lập thông tin tài khoản ngân hàng tại Việt Nam để tự động tạo mã VietQR cho sinh viên đặt cọc giữ phòng.
              </p>
            </div>

            {settingsSaved && (
              <div className="p-3 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Đã lưu toàn bộ cấu hình thành công!</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tên Hệ Thống / Thương Hiệu Nhà Trọ</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hotline Hỗ Trợ Sinh Viên</label>
                  <input
                    type="text"
                    value={supportHotline}
                    onChange={(e) => setSupportHotline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số Zalo Chủ Trọ</label>
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
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold">Thêm Phòng Trọ Mới Vào Hệ Thống</h3>
                <p className="text-[11px] text-slate-400">
                  Chọn Tỉnh/Thành phố để hệ thống tự động gợi ý Quận/Huyện và các Trường Đại học tương ứng
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Tiêu đề phòng */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5">Tiêu đề phòng trọ / Căn hộ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Căn hộ Studio ban công thoáng mát gần ĐH Cần Thơ"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              {/* Khối Vị trí Hành chính (Cascading Selects) */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-950 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Vị trí hành chính &amp; Khu vực Trường Đại học
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowMapPreview(!showMapPreview)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Map className="w-3.5 h-3.5" />
                    <span>{showMapPreview ? 'Ẩn bản đồ định vị' : 'Hiện bản đồ Google Maps'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Tỉnh / Thành phố Việt Nam */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">1. Tỉnh / Thành phố (Việt Nam 🇻🇳)</label>
                    <select
                      value={newCity}
                      onChange={(e) => handleCityChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800 focus:border-indigo-600 outline-none"
                    >
                      {VIETNAM_LOCATIONS.map((c) => (
                        <option key={c.city} value={c.city}>
                          {c.city}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Quận / Huyện / Khu dân cư (Tự động lọc theo Tỉnh/TP) */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">2. Quận / Huyện / KDC tại {newCity}</label>
                    <select
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:border-indigo-600 outline-none"
                    >
                      {currentCityData.districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__custom__">+ Tự nhập Quận / Khu vực khác...</option>
                    </select>
                    {newArea === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Nhập tên Quận / Phường / KDC..."
                        value={customArea}
                        onChange={(e) => setCustomArea(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* 3. Địa chỉ thường trú / Số nhà, tên đường cụ thể */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    3. Địa chỉ thường trú chi tiết (Số nhà, Hẻm/Ngõ, Tên đường, Phường/Xã) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Ví dụ: Số 128 Đường 3/2 (hoặc KDC Hồng Phát), ${
                      newArea === '__custom__' ? '' : newArea
                    }, ${newCity}`}
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:border-indigo-600 outline-none"
                  />
                </div>

                {/* 4. Trường Đại học gần nhất (Sổ xuống đúng các trường thuộc Tỉnh/TP đã chọn) & Khoảng cách */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                      <span>4. Trường Đại học / Cao đẳng tại {newCity}</span>
                    </label>
                    <select
                      value={newUniversity}
                      onChange={(e) => setNewUniversity(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-indigo-950 focus:border-indigo-600 outline-none"
                    >
                      {currentCityData.universities.map((u) => (
                        <option key={u} value={u}>
                          🎓 {u}
                        </option>
                      ))}
                      <option value="__custom__">+ Nhập tên trường ĐH/CĐ khác...</option>
                    </select>
                    {newUniversity === '__custom__' && (
                      <input
                        type="text"
                        placeholder="Nhập tên trường Đại học / Cao đẳng..."
                        value={customUniversity}
                        onChange={(e) => setCustomUniversity(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl outline-none"
                      />
                    )}
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      5. Khoảng cách di chuyển tới trường
                    </label>
                    <select
                      value={DISTANCE_PRESETS.includes(newDistance) ? newDistance : '__custom__'}
                      onChange={(e) => {
                        if (e.target.value !== '__custom__') {
                          setNewDistance(e.target.value);
                        } else {
                          setNewDistance('');
                        }
                      }}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl font-medium text-slate-800 focus:border-indigo-600 outline-none"
                    >
                      {DISTANCE_PRESETS.map((d) => (
                        <option key={d} value={d}>
                          📍 {d}
                        </option>
                      ))}
                      <option value="__custom__">+ Tự nhập khoảng cách cụ thể...</option>
                    </select>
                    {!DISTANCE_PRESETS.includes(newDistance) && (
                      <input
                        type="text"
                        placeholder="Ví dụ: 450m (5 phút đi bộ)"
                        value={newDistance}
                        onChange={(e) => setNewDistance(e.target.value)}
                        className="mt-2 w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* Live Google Maps Embed Preview */}
                {showMapPreview && (
                  <div className="pt-1">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-44 relative">
                      <iframe
                        title="Google Maps Location Preview"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                          `${newAddress ? newAddress + ', ' : ''}${
                            newArea === '__custom__' ? customArea : newArea
                          }, ${newCity}, ${
                            newUniversity === '__custom__' ? customUniversity : newUniversity
                          }`
                        )}&output=embed`}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">
                      📌 Bản đồ tự động định vị theo địa chỉ thường trú &amp; khu vực trường{' '}
                      <strong>
                        {newUniversity === '__custom__' ? customUniversity : newUniversity}
                      </strong>{' '}
                      tại <strong>{newCity}</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Loại phòng, Đối tượng, Giờ giấc */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Loại phòng</label>
                  <select
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value as RoomType)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="studio">Căn hộ Studio khép kín</option>
                    <option value="single">Phòng đơn / Sleepbox</option>
                    <option value="double">Phòng ở ghép 2 người</option>
                    <option value="triple">Phòng ở ghép 3-4 người</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Đối tượng ở</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as GenderPreference)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="all">Nam &amp; Nữ (Khu chung)</option>
                    <option value="boys">Chỉ dành cho Nam</option>
                    <option value="girls">Chỉ dành cho Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Giờ giấc &amp; An ninh</label>
                  <select
                    value={CURFEW_PRESETS.includes(newCurfew) ? newCurfew : '__custom__'}
                    onChange={(e) => {
                      if (e.target.value !== '__custom__') setNewCurfew(e.target.value);
                      else setNewCurfew('');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    {CURFEW_PRESETS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="__custom__">+ Tự nhập giờ giấc...</option>
                  </select>
                </div>
              </div>

              {/* Bảng giá VNĐ */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Chi phí thuê &amp; Tiền đặt cọc (VNĐ)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Giá thuê / tháng (VNĐ)</label>
                    <input
                      type="number"
                      step={100000}
                      value={newPriceVND}
                      onChange={(e) => setNewPriceVND(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                      = {newPriceVND.toLocaleString('vi-VN')} ₫ / tháng
                    </span>
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tiền cọc hợp đồng (VNĐ)</label>
                    <input
                      type="number"
                      step={100000}
                      value={newDepositVND}
                      onChange={(e) => setNewDepositVND(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-800"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      = {newDepositVND.toLocaleString('vi-VN')} ₫
                    </span>
                  </div>
                  <div>
                    <label className="font-bold text-indigo-700 block mb-1">Cọc giữ chỗ Online (VNĐ)</label>
                    <input
                      type="number"
                      step={50000}
                      value={newTokenVND}
                      onChange={(e) => setNewTokenVND(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-700"
                    />
                    <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
                      = {newTokenVND.toLocaleString('vi-VN')} ₫ (Giữ chỗ 48h)
                    </span>
                  </div>
                </div>
              </div>

              {/* Hình ảnh phòng trọ: Tải từ máy hoặc chọn ảnh mẫu hoặc dán URL */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-indigo-600" />
                    <span>Hình ảnh phòng trọ (Tải ảnh từ máy hoặc dán Link)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl border border-indigo-200 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingImage ? 'Đang tải ảnh lên Cloud...' : 'Tải ảnh từ máy tính'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-3 items-start">
                  <img
                    src={newImageUrl}
                    alt="Room preview"
                    className="w-24 h-20 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100"
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      {SAMPLE_ROOM_IMAGES.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          onClick={() => setNewImageUrl(img.url)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                            newImageUrl === img.url
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Mô tả chi tiết phòng trọ</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả nội thất (máy lạnh, tủ lạnh, gác lửng, bếp riêng), giờ giấc, tiền điện nước..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Đăng Phòng Lên Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Detail Modal in Admin */}
      {selectedDetailProp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-[10px] font-mono font-bold">
                    {selectedDetailProp.code}
                  </span>
                  <span className="text-xs text-slate-300 uppercase font-semibold">
                    {selectedDetailProp.roomType}
                  </span>
                </div>
                <h3 className="text-base font-bold mt-1">{selectedDetailProp.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailProp(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Ảnh lớn */}
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedDetailProp.images[0]}
                  alt={selectedDetailProp.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Giá thuê & Cọc */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Giá thuê / tháng</span>
                  <span className="text-base font-black text-slate-900">
                    {formatPrice(selectedDetailProp.pricePerMonthUSD, 'VND')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Tiền cọc hợp đồng</span>
                  <span className="text-base font-bold text-slate-800">
                    {formatPrice(selectedDetailProp.securityDepositUSD, 'VND')}
                  </span>
                </div>
                <div>
                  <span className="text-indigo-600 font-semibold block">Cọc giữ chỗ Online</span>
                  <span className="text-base font-black text-indigo-600">
                    {formatPrice(selectedDetailProp.tokenDepositUSD, 'VND')}
                  </span>
                </div>
              </div>

              {/* Địa chỉ & Trường học */}
              <div className="space-y-2.5 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Địa chỉ: </span>
                    <span className="text-slate-700">
                      {selectedDetailProp.address} ({selectedDetailProp.area}, {selectedDetailProp.city})
                    </span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800">Trường ĐH gần nhất: </span>
                    <span className="text-indigo-800 font-semibold">
                      {selectedDetailProp.nearbyUniversity} ({selectedDetailProp.distanceToCampus})
                    </span>
                  </div>
                </div>
                {selectedDetailProp.curfewTime && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Giờ giấc: </span>
                      <span className="text-slate-700">{selectedDetailProp.curfewTime}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <h4 className="font-bold text-slate-800 mb-1">Mô tả chi tiết</h4>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedDetailProp.description}
                </p>
              </div>

              {/* Bản đồ Google Maps */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 h-44 bg-slate-100">
                <iframe
                  title="Bản đồ vị trí phòng"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    `${selectedDetailProp.address}, ${selectedDetailProp.city}`
                  )}&output=embed`}
                />
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedDetailProp;
                    setSelectedDetailProp(null);
                    setPropertyToDelete(target);
                  }}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa phòng này</span>
                </button>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/properties/${selectedDetailProp.id}`}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Mở Trang Hiển Thị Bên User</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedDetailProp(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup Modal */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Xác nhận xóa phòng trọ?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Bạn có chắc chắn muốn xóa phòng trọ này khỏi hệ thống? Phòng sẽ bị gỡ khỏi trang User ngay lập tức và không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={propertyToDelete.images[0]}
                alt={propertyToDelete.title}
                className="w-14 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                  {propertyToDelete.code}
                </span>
                <p className="text-xs font-bold text-slate-900 truncate mt-0.5">
                  {propertyToDelete.title}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {propertyToDelete.area}, {propertyToDelete.city}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPropertyToDelete(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProperty(propertyToDelete.id);
                  setPropertyToDelete(null);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md shadow-red-600/20 inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác nhận xóa vĩnh viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
