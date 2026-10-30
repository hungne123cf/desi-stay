'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProperties } from '@/context/PropertyContext';
import { Property, RoomType, GenderPreference, FoodPreference, CurrencyCode, Booking } from '@/types';
import {
  VIETNAM_LOCATIONS,
  DISTANCE_PRESETS,
  CURFEW_PRESETS,
  SAMPLE_ROOM_IMAGES
} from '@/data/locations';
import {
  VIETNAM_BANKS,
  buildVietQrUrl,
  resolveVietQrBankCode
} from '@/data/vietnamBanks';
import { uploadOrCompressImage } from '@/lib/supabase/storage';
import {
  ShieldCheck,
  Building,
  Building2,
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
  Clock,
  MessageCircle,
  Send,
  Star,
  LogOut,
  UserCheck,
  UserPlus,
  Search,
  Mail,
  ShieldAlert,
  Check,
  Crown,
  Sparkles,
  Wallet,
  Landmark,
  RotateCcw,
  Receipt,
  FileText
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const {
    properties,
    bookings,
    messages,
    reviews,
    accounts,
    currency,
    settings,
    formatPrice,
    addProperty,
    updateProperty,
    deleteProperty,
    restoreProperty,
    permanentDeleteProperty,
    updateBookingStatus,
    archiveBooking,
    restoreBooking,
    updateSettings,
    sendChatMessage,
    markConversationRead,
    deleteConversation,
    replyToReview,
    deleteReview,
    restoreReview,
    permanentDeleteReview,
    updateAccountRole,
    addOrUpdateAccount,
    deleteAccount,
    toggleAccountSuspension,
    permanentDeleteAccount
  } = useProperties();

  const [activeTab, setActiveTab] = useState<'listings' | 'leads' | 'chat' | 'reviews' | 'accounts' | 'settings' | 'trash'>('listings');
  const [trashSubTab, setTrashSubTab] = useState<'properties' | 'bookings' | 'accounts' | 'reviews'>('properties');
  const [trashToast, setTrashToast] = useState<string | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{
    type: 'property' | 'review' | 'account';
    id: string;
    title: string;
  } | null>(null);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [adminReplyText, setAdminReplyText] = useState<string>('');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [reviewReplyInput, setReviewReplyInput] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetailProp, setSelectedDetailProp] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(null);
  const [selectedReceiptLead, setSelectedReceiptLead] = useState<Booking | null>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [propertyCreatedToast, setPropertyCreatedToast] = useState(false);
  const [accountSearchQuery, setAccountSearchQuery] = useState('');
  const [accountRoleFilter, setAccountRoleFilter] = useState<'all' | 'staff' | 'admin' | 'student'>('all');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCollege, setNewStaffCollege] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'staff' | 'admin'>('staff');
  const [accountToast, setAccountToast] = useState<string | null>(null);

  // Settings form state
  const [brandName, setBrandName] = useState(settings.brandName);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(settings.defaultCurrency);
  const [vietQrBankCode, setVietQrBankCode] = useState(
    settings.vietQrBankCode || resolveVietQrBankCode(settings.vietQrBankName)
  );
  const [vietQrBankName, setVietQrBankName] = useState(settings.vietQrBankName);
  const [vietQrAccountNumber, setVietQrAccountNumber] = useState(settings.vietQrAccountNumber);
  const [vietQrAccountHolder, setVietQrAccountHolder] = useState(settings.vietQrAccountHolder);
  const [supportWhatsApp, setSupportWhatsApp] = useState(settings.supportWhatsApp);
  const [supportHotline, setSupportHotline] = useState(settings.supportHotline);
  const [stripeKey, setStripeKey] = useState(settings.stripePublishableKey);
  const [razorpayKey, setRazorpayKey] = useState(settings.razorpayKeyId);
  const [testQrAmountVND, setTestQrAmountVND] = useState(500000);

  useEffect(() => {
    setBrandName(settings.brandName);
    setDefaultCurrency(settings.defaultCurrency);
    setVietQrBankCode(settings.vietQrBankCode || resolveVietQrBankCode(settings.vietQrBankName));
    setVietQrBankName(settings.vietQrBankName);
    setVietQrAccountNumber(settings.vietQrAccountNumber);
    setVietQrAccountHolder(settings.vietQrAccountHolder);
    setSupportWhatsApp(settings.supportWhatsApp);
    setSupportHotline(settings.supportHotline);
  }, [settings]);

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
  const [newLandlordName, setNewLandlordName] = useState('');
  const [newLandlordContact, setNewLandlordContact] = useState('');
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

  const totalRevenueUSD = (bookings || [])
    .filter((b) => b && (b.status === 'token_paid' || b.status === 'confirmed'))
    .reduce((sum, b) => sum + (Number(b?.tokenAmountUSD) || 0), 0);

  const pendingRevenueUSD = (bookings || [])
    .filter((b) => b && b.status === 'pending')
    .reduce((sum, b) => sum + (Number(b?.tokenAmountUSD) || 0), 0);

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

    let fullAddress = newAddress.trim();
    if (!fullAddress) {
      fullAddress = `${finalArea}, ${newCity}`;
    } else {
      if (!fullAddress.toLowerCase().includes(finalArea.toLowerCase())) {
        fullAddress += `, ${finalArea}`;
      }
      if (!fullAddress.toLowerCase().includes(newCity.toLowerCase())) {
        fullAddress += `, ${newCity}`;
      }
    }

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
      landlordName: newLandlordName.trim() || 'Chủ nhà đối tác',
      landlordContact: newLandlordContact.trim() || supportWhatsApp || '0901234567'
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewAddress('');
    setNewLandlordName('');
    setNewLandlordContact('');
    setPropertyCreatedToast(true);
    setTimeout(() => setPropertyCreatedToast(false), 6000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      brandName,
      defaultCurrency,
      vietQrBankCode,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin' && user?.role !== 'staff') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Yêu cầu quyền Quản Trị hoặc Staff</h3>
            <p className="text-xs text-slate-500 mt-1">
              Khu vực này dành riêng cho Quản trị viên (Admin) và Nhân viên (Staff).
              Vui lòng đăng nhập bằng tài khoản được chỉ định quyền để truy cập Bảng điều khiển quản lý.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="w-full block py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md transition-all text-center"
          >
            Đăng nhập tài khoản
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

  const unreadChatCount = (messages || []).filter(
    (m) => m && m.senderRole === 'student' && !m.isReadByAdmin
  ).length;
  const pendingBookingsCount = (bookings || []).filter((b) => b && b.status === 'pending' && !b.isArchived).length;

  const activeProperties = (properties || []).filter((p) => p && !p.isDeleted);
  const deletedProperties = (properties || []).filter((p) => p && p.isDeleted);
  const activeBookings = (bookings || []).filter((b) => b && !b.isArchived);
  const archivedBookings = (bookings || []).filter((b) => b && b.isArchived);
  const activeAccounts = (accounts || []).filter((a) => a && !a.isSuspended);
  const suspendedAccounts = (accounts || []).filter((a) => a && a.isSuspended);
  const activeReviews = (reviews || []).filter((r) => r && !r.isDeleted);
  const deletedReviews = (reviews || []).filter((r) => r && r.isDeleted);
  const totalTrashCount =
    deletedProperties.length +
    archivedBookings.length +
    suspendedAccounts.length +
    deletedReviews.length;

  const navItems: {
    id: 'listings' | 'leads' | 'chat' | 'reviews' | 'accounts' | 'settings' | 'trash';
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }[] = [
    {
      id: 'listings',
      label: 'Quản Lý Phòng Trọ',
      sublabel: 'Kho phòng & giá thuê',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      badge: activeProperties.length,
      badgeColor: 'bg-slate-800 text-slate-200 border border-slate-700'
    },
    {
      id: 'leads',
      label: 'Đơn Cọc & Lịch Hẹn',
      sublabel: 'Duyệt Bill VietQR & hẹn xem',
      icon: <Users className="w-4 h-4 shrink-0" />,
      badge: pendingBookingsCount > 0 ? `${pendingBookingsCount} chờ` : activeBookings.length,
      badgeColor:
        pendingBookingsCount > 0
          ? 'bg-amber-500 text-slate-950 font-black'
          : 'bg-slate-800 text-slate-200 border border-slate-700'
    },
    {
      id: 'chat',
      label: 'Tin Nhắn Khách Hỏi',
      sublabel: 'Hộp thư Live Chat 2 chiều',
      icon: <MessageCircle className="w-4 h-4 shrink-0" />,
      badge:
        unreadChatCount > 0
          ? `${unreadChatCount} mới`
          : Array.from(new Set(messages.map((m) => m.conversationId))).length,
      badgeColor:
        unreadChatCount > 0
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-slate-800 text-slate-200 border border-slate-700'
    },
    {
      id: 'reviews',
      label: 'Đánh Giá & Bình Luận',
      sublabel: 'Quản lý sao & phản hồi SV',
      icon: <Star className="w-4 h-4 shrink-0" />,
      badge: `${activeReviews.length} ⭐`,
      badgeColor: 'bg-slate-800 text-amber-300 border border-slate-700'
    },
    {
      id: 'accounts',
      label: 'Quản Lý Tài Khoản',
      sublabel: 'Chỉ định Staff & Phân quyền',
      icon: <UserCheck className="w-4 h-4 shrink-0" />,
      badge: `${activeAccounts.length}`,
      badgeColor: 'bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-bold'
    },
    {
      id: 'settings',
      label: 'Quản Lý Thu Cọc & Ngân Hàng',
      sublabel: 'Doanh thu cọc, VietQR & STK nhận tiền',
      icon: <Wallet className="w-4 h-4 shrink-0" />,
      badge: formatPrice(totalRevenueUSD, 'VND'),
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-bold'
    },
    {
      id: 'trash',
      label: 'Thùng Rác & Khôi Phục',
      sublabel: 'Khôi phục phòng, cọc & tài khoản',
      icon: <Trash2 className="w-4 h-4 shrink-0" />,
      badge: totalTrashCount > 0 ? `${totalTrashCount} mục` : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800/80 font-bold'
    }
  ];

  const filteredAccounts = (accounts || []).filter((acc) => {
    if (!acc) return false;
    const query = accountSearchQuery.toLowerCase().trim();
    const name = acc.name || '';
    const email = acc.email || '';
    const phone = acc.phone || '';
    const college = acc.college || '';
    const matchesQuery =
      !query ||
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      phone.includes(query) ||
      college.toLowerCase().includes(query);
    const matchesFilter =
      accountRoleFilter === 'all' ? true : acc.role === accountRoleFilter;
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden bg-slate-900 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
            A
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight">
              {settings.brandName || 'UniStay'} {user?.role === 'admin' ? 'Admin' : 'Staff'}
            </span>
            <span className="text-[10px] text-slate-400 block">{user?.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Trang Khách</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
            }}
            className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION (Thanh đề mục cố định bên trái) */}
      <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-slate-900 text-white border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between md:sticky md:top-0 md:h-screen overflow-y-auto">
        <div className="p-4 lg:p-5 space-y-5">
          {/* Admin Header Logo */}
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  {settings.brandName || 'UniStay'}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-500 text-white uppercase tracking-wider">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
                Bảng Điều Khiển Quản Trị
              </p>
            </div>
          </div>

          {/* Admin Identity Card */}
          <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>{user?.role === 'admin' ? 'Admin Portal (Quản Trị)' : 'Staff Portal (Nhân Viên)'}</span>
              </div>
              <h1 className="text-sm font-black tracking-tight text-white truncate mt-0.5">
                Xin chào, {user?.name ? user.name.split(' ')[0] : 'Quản Trị'} 👋
              </h1>
              <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
            </div>
            <Link
              href="/"
              title="Mở trang chủ User"
              className="p-2 rounded-xl bg-slate-700/70 hover:bg-indigo-600 text-slate-200 hover:text-white transition-colors shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          {/* Primary Add Property CTA */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-2xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Phòng Trọ Mới</span>
          </button>

          {/* Left Navigation Menu Items */}
          <div className="space-y-1">
            <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Danh Mục Quản Trị Hệ Thống
            </span>
            <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-auto md:w-full whitespace-nowrap md:whitespace-normal text-left px-3.5 py-2.5 rounded-2xl transition-all flex items-center justify-between gap-2.5 cursor-pointer shrink-0 md:shrink ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold block truncate">{item.label}</span>
                        <span
                          className={`text-[10px] hidden md:block truncate ${
                            isActive ? 'text-indigo-100' : 'text-slate-400'
                          }`}
                        >
                          {item.sublabel}
                        </span>
                      </div>
                    </div>

                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          isActive
                            ? 'bg-white text-indigo-700'
                            : item.badgeColor || 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Summary - Clickable to open Finance & Bank Settings */}
        <div className="hidden md:block p-4 border-t border-slate-800/90 bg-slate-950/50 space-y-3">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer group ${
              activeTab === 'settings'
                ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                : 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-slate-700'
            }`}
            title="Bấm để vào mục Quản Lý Thu Cọc & Cấu Hình Ngân Hàng"
          >
            <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
              <span className="flex items-center gap-1 group-hover:text-slate-200 transition-colors">
                <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tiền cọc đã thu:</span>
              </span>
              <span className="font-black text-emerald-400 group-hover:underline">
                {formatPrice(totalRevenueUSD, 'VND')}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span>NH nhận cọc:</span>
              <span className="font-bold text-indigo-300 truncate max-w-[125px]">
                {vietQrBankCode || settings.vietQrBankCode || 'VCB'} • {vietQrAccountNumber || settings.vietQrAccountNumber}
              </span>
            </div>
            <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-indigo-300 transition-colors">
              <span>Chỉnh sửa STK &amp; Doanh thu</span>
              <span className="font-bold">→ Mở</span>
            </div>
          </button>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Giao Diện Khách</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                logout();
              }}
              className="p-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 rounded-xl transition-all cursor-pointer"
              title="Đăng xuất Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE (Khung nội dung chính bên phải) */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 pb-20">
        {/* Compact Top Header + 4 Mini KPI Strip */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                Đang mở mục
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Đồng bộ Real-time đa trình duyệt
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
          </div>

          {/* Compact 4 KPI Summary Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              onClick={() => setActiveTab('listings')}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-500 block">Phòng trọ đang bán</span>
                {deletedProperties.length > 0 && (
                  <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.2 rounded">
                    +{deletedProperties.length} rác
                  </span>
                )}
              </div>
              <span className="text-base font-black text-slate-900">{activeProperties.length} phòng</span>
            </div>

            <div
              onClick={() => setActiveTab('leads')}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 cursor-pointer transition-colors"
            >
              <span className="text-[10px] font-semibold text-slate-500 block">Khách đặt &amp; Hẹn</span>
              <span className="text-base font-black text-indigo-600">{activeBookings.length} đơn</span>
            </div>

            <div
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 cursor-pointer"
            >
              <span className="text-[10px] font-semibold text-emerald-700 block">Tiền cọc đã thu</span>
              <span className="text-base font-black text-emerald-700">
                {formatPrice(totalRevenueUSD, 'VND')}
              </span>
            </div>

            <div
              onClick={() => setActiveTab('reviews')}
              className="px-3.5 py-2.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 cursor-pointer"
            >
              <span className="text-[10px] font-semibold text-amber-800 block">Đánh giá SV</span>
              <span className="text-base font-black text-amber-700">{activeReviews.length} nhận xét ⭐</span>
            </div>
          </div>
        </div>

        {/* Tab 1: Listings */}
        {activeTab === 'listings' && (
          <div className="space-y-4">
            {deletedProperties.length > 0 && (
              <div className="p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    Đang có <strong>{deletedProperties.length} phòng trọ</strong> nằm trong Thùng Rác (đã xóa mềm).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('trash');
                    setTrashSubTab('properties');
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mở Thùng Rác để Khôi Phục →</span>
                </button>
              </div>
            )}

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
                    {activeProperties.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700 text-sm">Chưa có phòng trọ nào đang mở cho thuê</p>
                          <p className="text-xs text-slate-400 mt-1 mb-4">
                            {deletedProperties.length > 0
                              ? `Tất cả ${deletedProperties.length} phòng đang nằm trong thùng rác. Bạn có thể khôi phục lại bất kỳ lúc nào!`
                              : 'Hãy bấm "+ Thêm Phòng Mới" để đăng phòng trọ thực tế đầu tiên!'}
                          </p>
                          <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Thêm Phòng Trọ Mới</span>
                          </button>
                        </td>
                      </tr>
                    ) : (
                      activeProperties.map((prop) => (
                        <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <button
                              type="button"
                              onClick={() => setSelectedDetailProp(prop)}
                              className="flex items-center gap-3 text-left group cursor-pointer"
                            >
                              <img
                                src={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
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
            {archivedBookings.length > 0 && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    Có <strong>{archivedBookings.length} đơn cọc &amp; lịch hẹn</strong> đang nằm trong mục Lưu Trữ (xóa mềm).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('trash');
                    setTrashSubTab('bookings');
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs shrink-0 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Mở Kho Lưu Trữ Đơn Cọc →</span>
                </button>
              </div>
            )}

            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Khách thuê &amp; SĐT</th>
                      <th className="p-4">Mã phòng</th>
                      <th className="p-4">Ngày nhận / Hẹn xem</th>
                      <th className="p-4">Hình thức &amp; Tiền cọc</th>
                      <th className="p-4">Chứng từ / Ảnh Bill</th>
                      <th className="p-4">Trạng thái duyệt</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeBookings.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-500">
                          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="font-bold text-slate-700 text-sm">Chưa có đơn đặt cọc hoặc lịch hẹn xem phòng nào</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Khi sinh viên quét mã VietQR đặt cọc hoặc đặt lịch hẹn xem phòng trên trang User, đơn sẽ tự động xuất hiện tại đây theo thời gian thực.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      activeBookings.map((lead) => (
                        <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block">{lead.studentName}</span>
                            <span className="text-[11px] text-indigo-600 font-semibold block">
                              {lead.studentContact}
                            </span>
                            <span className="text-[10px] text-slate-400">{lead.college}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-indigo-700 font-mono bg-indigo-50 px-2 py-1 rounded-lg">
                              {lead.propertyCode}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate max-w-[160px] mt-1">
                              {lead.propertyTitle}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-medium">
                            <span className="font-bold block">{lead.moveInDate}</span>
                            {lead.visitTimeSlot && (
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                ⏰ {lead.visitTimeSlot}
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-emerald-700 block">
                              {lead.tokenAmountLocal || formatPrice(lead.tokenAmountUSD, 'VND')}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {lead.paymentMethod === 'vietqr_bank'
                                ? `💳 VietQR (${lead.transferContent || 'Napas 247'})`
                                : '📅 Hẹn xem trực tiếp'}
                            </span>
                          </td>
                          <td className="p-4">
                            {lead.receiptImageUrl ? (
                              <button
                                type="button"
                                onClick={() => setSelectedReceiptLead(lead)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold text-[11px] border border-indigo-200 cursor-pointer"
                              >
                                <img
                                  src={lead.receiptImageUrl}
                                  alt="Bill"
                                  className="w-5 h-5 rounded object-cover"
                                />
                                <span>Xem Ảnh Bill</span>
                              </button>
                            ) : lead.paymentMethod === 'vietqr_bank' ? (
                              <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-medium">
                                Không đính kèm ảnh
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400">Hẹn xem phòng</span>
                            )}
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
                              className={`px-2.5 py-1.5 border rounded-xl text-xs font-bold focus:outline-none cursor-pointer ${
                                lead.status === 'confirmed' || lead.status === 'token_paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : lead.status === 'cancelled'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <option value="pending">⏳ Chờ xác nhận</option>
                              <option value="token_paid">✅ Đã nhận cọc VietQR</option>
                              <option value="confirmed">🏠 Đã chốt giữ phòng</option>
                              <option value="cancelled">❌ Đã hủy</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              {lead.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => updateBookingStatus(lead.id, 'confirmed')}
                                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[11px] cursor-pointer"
                                  title="Duyệt nhanh đơn này"
                                >
                                  Duyệt ngay
                                </button>
                              )}
                              <a
                                href={`https://zalo.me/${lead.studentContact.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200 hover:bg-emerald-100"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>Zalo</span>
                              </a>
                              <button
                                type="button"
                                onClick={() => {
                                  archiveBooking(lead.id);
                                  setTrashToast(`Đã lưu trữ đơn cọc #${lead.reference}! Xem lại ở mục Thùng Rác & Khôi Phục.`);
                                  setTimeout(() => setTrashToast(null), 3500);
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                                title="Lưu trữ đơn này (Xóa mềm)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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

        {/* ========================================================================= */}
        {/* TAB 6: QUẢN LÝ THU CỌC, TÀI CHÍNH & CẤU HÌNH NGÂN HÀNG (VIETQR NAPAS 247) */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="space-y-6 max-w-5xl">
            {/* Header section with primary action */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Quản Lý Thu Cọc &amp; Ngân Hàng Nhận Tiền
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Bàn Giao Web Cho Chủ Trọ
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Quản lý tổng tiền cọc đã thu thực tế, tùy chỉnh Số tài khoản ngân hàng thụ hưởng VietQR Napas 247 của chủ trọ. Tiền cọc từ khách thuê sẽ chuyển thẳng 100% về tài khoản này (0% phí môi giới, không qua trung gian).
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu Cấu Hình Ngân Hàng</span>
                </button>
              </div>
            </div>

            {/* Notification Toast if Saved */}
            {settingsSaved && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Đã lưu thành công thông tin Ngân hàng VietQR và Cấu hình hệ thống! Toàn bộ mã QR cọc trên website đã được cập nhật.</span>
                </div>
              </div>
            )}

            {/* 4 Financial & Bank KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Tiền cọc đã thu thực tế */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-3xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Tiền Cọc Đã Thu</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/20 text-white uppercase">
                    Thực tế
                  </span>
                </div>
                <div className="text-2xl lg:text-3xl font-black tracking-tight">
                  {formatPrice(totalRevenueUSD, 'VND')}
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  Từ {bookings.filter((b) => b.status === 'confirmed' || b.status === 'token_paid').length} giao dịch cọc đã duyệt
                </p>
              </div>

              {/* Card 2: Tiền cọc đang chờ duyệt */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Cọc Đang Chờ Duyệt</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-900 uppercase">
                    Pending
                  </span>
                </div>
                <div className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                  {formatPrice(pendingRevenueUSD, 'VND')}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  {pendingBookingsCount} khách đã nộp bill chờ xác minh
                </p>
              </div>

              {/* Card 3: Ngân hàng thụ hưởng đang nhận */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" />
                    <span>Ngân Hàng Nhận Cọc</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-50 text-indigo-700 uppercase">
                    Napas 247
                  </span>
                </div>
                <div className="text-base font-black text-slate-900 truncate">
                  {vietQrBankName || 'Vietcombank'}
                </div>
                <div className="text-xs font-mono font-bold text-indigo-600 truncate">
                  STK: {vietQrAccountNumber || 'Chưa thiết lập'}
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-bold truncate">
                  CTK: {vietQrAccountHolder || 'CHƯA ĐIỀN'}
                </p>
              </div>

              {/* Card 4: Cơ chế nhận tiền trực tiếp */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/70 p-5 rounded-3xl border border-indigo-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Cổng Thanh Toán</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800">
                    Trực tiếp 100%
                  </span>
                </div>
                <div className="text-sm font-black text-indigo-950">
                  0% Phí Môi Giới Sàn
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Tiền chuyển khoản tự động vào thẳng tài khoản ngân hàng của chủ trọ, không bị giam vốn.
                </p>
              </div>
            </div>

            {/* Handover Instruction Box */}
            <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>HƯỚNG DẪN DÀNH CHO BẠN KHI BÀN GIAO WEBSITE NÀY CHO KHÁCH HÀNG:</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Trang web này được thiết kế để bàn giao cho các chủ nhà trọ, chủ căn hộ sinh viên. Khi bàn giao cho khách hàng mới, khách hàng chỉ cần <strong>chọn Ngân hàng</strong> và <strong>nhập Số tài khoản &amp; Tên chủ tài khoản</strong> bên dưới rồi bấm <em>Lưu Cấu Hình</em>. Hệ thống sẽ tự động đổi toàn bộ mã QR Động, số tài khoản nhận cọc và thông tin liên hệ trên toàn bộ trang web sang của chủ trọ mới ngay lập tức!
              </p>
            </div>

            {/* Main Bank Configuration Form & Live QR Preview */}
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Form Fields */}
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4 text-xs">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-slate-900 text-sm">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>Thông Tin Tài Khoản Ngân Hàng Nhận Tiền Cọc</span>
                  </div>

                  {/* 1. Ngân hàng */}
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      1. Chọn Ngân Hàng Thụ Hưởng (Chuẩn Napas 247) <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={vietQrBankCode}
                      onChange={(e) => {
                        const code = e.target.value;
                        setVietQrBankCode(code);
                        const bankObj = VIETNAM_BANKS.find((b) => b.code === code);
                        if (bankObj) {
                          setVietQrBankName(`${bankObj.shortName} (${bankObj.code})`);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                    >
                      {VIETNAM_BANKS.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.shortName} ({bank.code}) – {bank.fullName}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Hỗ trợ chuyển khoản tức thì 24/7 từ bất kỳ ứng dụng ngân hàng nào tại Việt Nam.
                    </p>
                  </div>

                  {/* 2 & 3: STK & Chủ TK */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        2. Số Tài Khoản Ngân Hàng <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={vietQrAccountNumber}
                        onChange={(e) => setVietQrAccountNumber(e.target.value.replace(/\s+/g, ''))}
                        placeholder="Ví dụ: 19074816556011"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-indigo-700 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        3. Tên Chủ Tài Khoản (In hoa không dấu) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={vietQrAccountHolder}
                        onChange={(e) => setVietQrAccountHolder(e.target.value.toUpperCase())}
                        placeholder="TRUONG VAN TUAN"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Tên hệ thống / Brand Name */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="font-bold text-slate-700 block mb-1">
                      4. Tên Hệ Thống / Thương Hiệu Nhà Trọ
                    </label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="UniStay - Phòng Trọ & Căn Hộ Sinh Viên"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tên này sẽ hiển thị trên Header, hóa đơn xác nhận và biên nhận đặt cọc của sinh viên.
                    </p>
                  </div>

                  {/* Hotline & Zalo */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        5. Số Điện Thoại Hotline Chủ Trọ
                      </label>
                      <input
                        type="text"
                        value={supportHotline}
                        onChange={(e) => setSupportHotline(e.target.value)}
                        placeholder="0901234567"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        6. Số Zalo Nhận Tin Nhắn Đặt Cọc
                      </label>
                      <input
                        type="text"
                        value={supportWhatsApp}
                        onChange={(e) => setSupportWhatsApp(e.target.value)}
                        placeholder="0901234567"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white focus:border-indigo-600 outline-none transition-colors"
                      />
                    </div>
                  </div>

                  {/* Webhook Hint */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
                    💡 <strong>Tự động nhận diện thanh toán (Tùy chọn nâng cao):</strong> Hệ thống đã sẵn sàng hỗ trợ Webhook tự động biến động số dư qua <code className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-indigo-700 font-mono font-bold">/api/payment/webhook</code>. Nếu kết nối với dịch vụ mở rộng (SePay / PayOS), hệ thống sẽ tự động duyệt cọc ngay trong 3 giây khi khách vừa chuyển khoản xong!
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu Toàn Bộ Cấu Hình Ngân Hàng &amp; Bàn Giao Web</span>
                    </button>
                  </div>
                </div>

                {/* Right 1 Col: Live VietQR Interactive Preview */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between text-center space-y-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Bản Xem Trước Mã VietQR Thật</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">
                      Mã QR Động Napas 247
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Được sinh theo thời gian thực từ Ngân hàng &amp; STK bạn đang nhập.
                    </p>
                  </div>

                  {/* QR Image Box */}
                  <div className="w-48 h-48 mx-auto bg-slate-50 rounded-2xl p-2.5 border-2 border-indigo-100 shadow-inner flex items-center justify-center">
                    <img
                      src={buildVietQrUrl({
                        bankCodeOrName: vietQrBankCode,
                        accountNumber: vietQrAccountNumber,
                        accountHolder: vietQrAccountHolder,
                        amountVND: testQrAmountVND,
                        transferContent: 'COC PHONG TEST'
                      })}
                      alt="VietQR Live Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Test Amount Selector */}
                  <div className="space-y-1.5 text-left bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                    <label className="text-[11px] font-bold text-slate-600 block">
                      Số tiền thử nghiệm trên mã QR:
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[50000, 200000, 500000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTestQrAmountVND(amt)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            testQrAmountVND === amt
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {amt >= 1000000 ? `${amt / 1000000} tr` : `${amt / 1000}k`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal">
                    📱 <strong>Mẹo kiểm tra:</strong> Hãy mở App Ngân Hàng bất kỳ trên điện thoại của bạn quét thử mã này ngay trên màn hình để kiểm tra xem Tên chủ tài khoản và STK đã hiển thị đúng 100% chưa!
                  </p>
                </div>
              </div>
            </form>

            {/* Deposit Transaction Ledger (Lịch sử các khoản cọc) */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Lịch Sử Các Khoản Tiền Cọc Đã Giao Dịch ({bookings.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Danh sách tất cả các khoản tiền cọc mà sinh viên / khách thuê đã thanh toán qua tài khoản ngân hàng của bạn
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-600">
                  Tổng thu: <span className="text-emerald-600 font-black">{formatPrice(totalRevenueUSD, 'VND')}</span>
                </div>
              </div>

              {bookings.length === 0 ? (
                <div className="p-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Chưa có giao dịch đặt cọc nào</p>
                  <p className="text-xs text-slate-400">
                    Khi khách thuê chọn phòng và chuyển khoản tiền cọc giữ phòng, số tiền và thông tin giao dịch sẽ hiển thị chi tiết tại đây.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 text-[11px] text-slate-400 uppercase font-bold border-b border-slate-100">
                      <tr>
                        <th className="p-3.5 pl-5">Mã Giao Dịch</th>
                        <th className="p-3.5">Khách Thuê</th>
                        <th className="p-3.5">Phòng Đặt Cọc</th>
                        <th className="p-3.5">Số Tiền Cọc</th>
                        <th className="p-3.5">Trạng Thái</th>
                        <th className="p-3.5">Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="p-3.5 pl-5 font-mono font-bold text-slate-900">
                            {b.reference || b.id}
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-900 block">{b.studentName}</span>
                            <span className="text-slate-400 text-[11px]">{b.studentContact}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-slate-800 block truncate max-w-[200px]">
                              {b.propertyTitle}
                            </span>
                            <span className="text-slate-400 text-[10px]">Mã: {b.propertyCode}</span>
                          </td>
                          <td className="p-3.5 font-bold text-emerald-600 font-mono text-sm">
                            {b.tokenAmountLocal || `${formatPrice(b.tokenAmountUSD, 'VND')}`}
                          </td>
                          <td className="p-3.5">
                            {b.status === 'confirmed' || b.status === 'token_paid' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Đã Nhận Cọc</span>
                              </span>
                            ) : b.status === 'pending' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Chờ Duyệt Bill</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                                {b.status}
                              </span>
                            )}
                          </td>
                          <td className="p-3.5 text-slate-400 text-[11px]">
                            {b.createdAt}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Real-Time Customer Chat Inbox */}
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 md:grid-cols-3 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs min-h-[540px]">
            {/* Danh sách cuộc hội thoại bên trái */}
            <div className="border-b md:border-b-0 md:border-r border-slate-200 flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-700 flex items-center justify-between">
                <span>
                  Danh Sách Khách Nhắn Tin ({Array.from(new Set(messages.map((m) => m.conversationId))).length})
                </span>
                {unreadChatCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px]">
                    {unreadChatCount} chưa đọc
                  </span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[220px] md:max-h-[480px]">
                {Array.from(new Set(messages.map((m) => m.conversationId))).length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Chưa có tin nhắn nào từ khách hàng.
                  </div>
                ) : (
                  Array.from(new Set(messages.map((m) => m.conversationId))).map((convId) => {
                    const convMsgs = messages.filter((m) => m.conversationId === convId);
                    const lastMsg = convMsgs[convMsgs.length - 1];
                    const unread = convMsgs.filter(
                      (m) => m.senderRole === 'student' && !m.isReadByAdmin
                    ).length;
                    const active = (selectedConvId || messages[0]?.conversationId) === convId;

                    return (
                      <div
                        key={convId}
                        onClick={() => {
                          setSelectedConvId(convId);
                          markConversationRead(convId);
                        }}
                        className={`p-3.5 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                          active
                            ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate">
                            {lastMsg?.studentName || convId}
                          </span>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {lastMsg?.senderRole === 'admin' ? 'Bạn: ' : ''}
                            {lastMsg?.text}
                          </p>
                          <span className="text-[10px] text-slate-400">{lastMsg?.createdAt}</span>
                        </div>
                        {unread > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-bold shrink-0">
                            {unread} mới
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Khung nội dung chat bên phải */}
            <div className="md:col-span-2 flex flex-col">
              {(() => {
                const activeConvId = selectedConvId || messages[0]?.conversationId;
                const convMsgs = messages.filter((m) => m.conversationId === activeConvId);
                const studentInfo = convMsgs[0];

                if (!activeConvId || convMsgs.length === 0) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 text-xs">
                      <MessageCircle className="w-10 h-10 text-slate-300 mb-2" />
                      <p className="font-bold text-slate-600">Hộp Thư Hỗ Trợ Trực Tuyến</p>
                      <p className="mt-1 max-w-sm">
                        Khi sinh viên bấm vào nút Chat ở góc phải màn hình User và gửi câu hỏi, tin nhắn sẽ hiện ngay tại đây theo thời gian thực để bạn trả lời.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {studentInfo?.studentName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Liên hệ: {studentInfo?.studentEmail || activeConvId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteConversation(activeConvId)}
                        className="text-[11px] text-red-600 hover:underline font-semibold cursor-pointer"
                      >
                        Xóa hội thoại
                      </button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30 max-h-[380px] text-xs">
                      {convMsgs.map((m) => {
                        const isAdmin = m.senderRole === 'admin';
                        return (
                          <div
                            key={m.id}
                            className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                          >
                            <div
                              className={`px-3.5 py-2.5 rounded-2xl max-w-[75%] ${
                                isAdmin
                                  ? 'bg-indigo-600 text-white rounded-br-xs'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                              }`}
                            >
                              {m.text}
                            </div>
                            <span className="text-[10px] text-slate-400 mt-0.5 px-1">
                              {m.createdAt}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!adminReplyText.trim()) return;
                        sendChatMessage({
                          conversationId: activeConvId,
                          studentName: studentInfo?.studentName || 'Sinh viên',
                          studentEmail: studentInfo?.studentEmail,
                          senderRole: 'admin',
                          senderName: user?.name || 'Quản lý',
                          text: adminReplyText.trim(),
                          isReadByAdmin: true
                        });
                        markConversationRead(activeConvId);
                        setAdminReplyText('');
                      }}
                      className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white"
                    >
                      <input
                        type="text"
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        placeholder="Nhập câu trả lời gửi trực tiếp sang màn hình của khách..."
                        className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-indigo-600"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi</span>
                      </button>
                    </form>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 5: Student Reviews & 5-Star Ratings Manager */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Quản Lý Đánh Giá Sao &amp; Bình Luận Sinh Viên ({reviews.length})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Xem toàn bộ đánh giá thực tế trên các phòng trọ, phản hồi khách thuê hoặc xóa bình luận spam.
                  </p>
                </div>
              </div>

              {reviews.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Star className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 text-sm">
                    Chưa có đánh giá hoặc bình luận nào
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Khi sinh viên chấm sao và gửi nhận xét trên trang Chi tiết phòng, mọi đánh giá sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reviews.map((rev) => {
                    const matchedProp = properties.find(
                      (p) => p.id === rev.propertyId || p.code === rev.propertyCode
                    );
                    const isVerifiedTenant = bookings.some(
                      (b) =>
                        (b.propertyCode === rev.propertyCode ||
                          b.propertyTitle === rev.propertyTitle) &&
                        (b.status === 'token_paid' || b.status === 'confirmed') &&
                        (b.studentName.toLowerCase() === rev.userName.toLowerCase() ||
                          (rev.userEmail &&
                            b.studentContact.replace(/[^0-9]/g, '') ===
                              rev.userEmail.replace(/[^0-9]/g, '')))
                    );

                    return (
                      <div key={rev.id} className="p-5 hover:bg-slate-50/60 transition-colors space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {rev.userName}
                              </span>
                              {rev.userCollege && (
                                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                  🎓 {rev.userCollege}
                                </span>
                              )}
                              {isVerifiedTenant && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  ✅ Khách đã đặt phòng xác thực
                                </span>
                              )}
                              {rev.propertyCode && (
                                <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono text-[10px] font-bold">
                                  Phòng: {rev.propertyCode}
                                </span>
                              )}
                              {matchedProp && (
                                <Link
                                  href={`/properties/${matchedProp.id}#reviews`}
                                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                                >
                                  {matchedProp.title} ↗
                                </Link>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= rev.rating
                                      ? 'text-amber-400 fill-amber-400'
                                      : 'text-slate-200 fill-slate-200'
                                  }`}
                                />
                              ))}
                              <span className="text-[11px] text-slate-400 ml-2">{rev.createdAt}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingReviewId(replyingReviewId === rev.id ? null : rev.id);
                                setReviewReplyInput(rev.adminReply || '');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer"
                            >
                              {rev.adminReply ? 'Sửa phản hồi' : 'Phản hồi'}
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteReview(rev.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs cursor-pointer"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                          {rev.comment}
                        </p>

                        {rev.adminReply && (
                          <div className="ml-4 p-3 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 text-xs">
                            <span className="font-bold text-indigo-950 block mb-0.5">
                              Phản hồi từ Quản lý UniStay:
                            </span>
                            <p className="text-indigo-900">{rev.adminReply}</p>
                          </div>
                        )}

                        {replyingReviewId === rev.id && (
                          <div className="ml-4 flex items-center gap-2">
                            <input
                              type="text"
                              value={reviewReplyInput}
                              onChange={(e) => setReviewReplyInput(e.target.value)}
                              placeholder="Nhập phản hồi chính thức của Quản lý..."
                              className="flex-1 px-3.5 py-2 text-xs bg-white border border-indigo-300 rounded-xl outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (!reviewReplyInput.trim()) return;
                                replyToReview(rev.id, reviewReplyInput.trim());
                                setReplyingReviewId(null);
                                setReviewReplyInput('');
                              }}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Lưu phản hồi
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN STAFF */}
        {/* ========================================================================= */}
        {activeTab === 'accounts' && (
          <div className="space-y-6">
            {/* Header section with stats & primary button */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">
                    Quản Lý Tài Khoản &amp; Phân Quyền Staff
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Quản lý danh sách thành viên, chỉ định tài khoản sinh viên/khách thành Nhân viên vận hành (Staff), hoặc phân quyền Quản trị viên (Admin).
                </p>
              </div>

              {user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => {
                    setNewStaffName('');
                    setNewStaffEmail('');
                    setNewStaffPhone('');
                    setNewStaffCollege('');
                    setNewStaffRole('staff');
                    setShowAddStaffModal(true);
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-600/20 flex items-center gap-2 shrink-0 cursor-pointer transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Chỉ Định / Thêm Nhân Viên (Staff)</span>
                </button>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Tổng Thành Viên</span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-slate-900">{accounts.length}</span>
                  <span className="text-xs text-slate-400 font-medium">người dùng</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-blue-50/50 p-4 rounded-2xl border border-indigo-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-indigo-700 uppercase flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Nhân Viên (Staff)</span>
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-indigo-950">
                    {accounts.filter((a) => a.role === 'staff').length}
                  </span>
                  <span className="text-xs text-indigo-600 font-bold">đang vận hành</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50/50 p-4 rounded-2xl border border-purple-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-purple-700 uppercase flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>Quản Trị (Admin)</span>
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-purple-950">
                    {accounts.filter((a) => a.role === 'admin').length}
                  </span>
                  <span className="text-xs text-purple-600 font-bold">toàn quyền</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>Sinh Viên / Khách</span>
                </span>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-2xl font-black text-emerald-950">
                    {accounts.filter((a) => a.role === 'student').length}
                  </span>
                  <span className="text-xs text-emerald-600 font-bold">khách thuê</span>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              {/* Role Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                {(
                  [
                    { id: 'all', label: 'Tất Cả', count: accounts.length },
                    {
                      id: 'staff',
                      label: 'Nhân Viên (Staff)',
                      count: accounts.filter((a) => a.role === 'staff').length
                    },
                    {
                      id: 'admin',
                      label: 'Quản Trị Viên',
                      count: accounts.filter((a) => a.role === 'admin').length
                    },
                    {
                      id: 'student',
                      label: 'Sinh Viên / Khách',
                      count: accounts.filter((a) => a.role === 'student').length
                    }
                  ] as const
                ).map((tab) => {
                  const active = accountRoleFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAccountRoleFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        active
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={accountSearchQuery}
                  onChange={(e) => setAccountSearchQuery(e.target.value)}
                  placeholder="Tìm theo tên, email, SĐT, trường..."
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Notification Toast */}
            {accountToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{accountToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAccountToast(null)}
                  className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Account List / Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500">
                <span>DANH SÁCH TÀI KHOẢN ({filteredAccounts.length})</span>
                <span className="text-[11px] text-slate-400">
                  {user?.role === 'admin'
                    ? 'Quản trị viên có toàn quyền chỉ định & thay đổi vai trò'
                    : 'Chỉ xem danh bạ nhân sự (Quyền Staff)'}
                </span>
              </div>

              {filteredAccounts.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Không tìm thấy tài khoản phù hợp</p>
                  <p className="text-xs text-slate-400">
                    Hãy thử đổi từ khóa tìm kiếm hoặc lọc lại danh mục vai trò.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredAccounts.map((acc) => {
                    const isSuper =
                      acc.email.toLowerCase().trim() === 'truongvantuan43344@gmail.com';
                    const isCurrentUser = Boolean(
                      user?.email &&
                        acc.email &&
                        user.email.toLowerCase().trim() === acc.email.toLowerCase().trim()
                    );

                    return (
                      <div
                        key={acc.id || acc.email}
                        className="p-4 lg:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        {/* User Identity Info */}
                        <div className="flex items-start gap-3.5 min-w-0">
                          {acc.avatar ? (
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                              {acc?.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {acc.name}
                              </h4>
                              {isSuper && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                  <Crown className="w-3 h-3 text-amber-600" />
                                  <span>Super Admin Sáng Lập</span>
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                                  Bạn
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-500">
                              <a
                                href={`mailto:${acc.email}`}
                                className="flex items-center gap-1 hover:text-indigo-600 truncate"
                              >
                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{acc.email}</span>
                              </a>
                              {acc.phone && (
                                <a
                                  href={`tel:${acc.phone}`}
                                  className="flex items-center gap-1 hover:text-indigo-600"
                                >
                                  <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{acc.phone}</span>
                                </a>
                              )}
                              {acc.college && (
                                <span className="flex items-center gap-1 text-slate-600">
                                  <GraduationCap className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>{acc.college}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Role Badge */}
                        <div className="flex items-center gap-3">
                          {acc.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-purple-100 text-purple-900 border border-purple-200">
                              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                              <span>Quản Trị Viên (Admin)</span>
                            </span>
                          ) : acc.role === 'staff' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-200 shadow-xs">
                              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Nhân Viên Vận Hành (Staff)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                              <Users className="w-3.5 h-3.5 text-slate-500" />
                              <span>Sinh Viên / Khách Thuê</span>
                            </span>
                          )}
                        </div>

                        {/* Right: Actions / Role Assignment */}
                        <div className="flex items-center gap-2 shrink-0">
                          {user?.role === 'admin' ? (
                            isSuper ? (
                              <span className="text-[11px] font-bold text-slate-400 px-3 py-1.5 bg-slate-100 rounded-xl">
                                Quyền mặc định bảo vệ
                              </span>
                            ) : (
                              <>
                                {/* Chỉ định Staff */}
                                {acc.role !== 'staff' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateAccountRole(acc.email, 'staff');
                                      setAccountToast(`Đã chỉ định ${acc.name} (${acc.email}) làm Nhân Viên (Staff)!`);
                                      setTimeout(() => setAccountToast(null), 3500);
                                    }}
                                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                                    title="Chỉ định người này làm Staff để quản lý phòng & đơn cọc"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                                    <span>Chỉ định làm Staff</span>
                                  </button>
                                )}

                                {/* Chuyển về Sinh viên */}
                                {acc.role !== 'student' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      updateAccountRole(acc.email, 'student');
                                      setAccountToast(`Đã chuyển ${acc.name} về quyền Sinh viên / Khách thuê!`);
                                      setTimeout(() => setAccountToast(null), 3500);
                                    }}
                                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                                    title="Hạ quyền về Sinh viên bình thường"
                                  >
                                    <span>Về Sinh Viên</span>
                                  </button>
                                )}

                                {/* Nâng làm Admin */}
                                {acc.role !== 'admin' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn nâng ${acc.name} (${acc.email}) lên quyền Quản trị viên (Admin) cao nhất?`)) {
                                        updateAccountRole(acc.email, 'admin');
                                        setAccountToast(`Đã nâng ${acc.name} lên Quản trị viên (Admin)!`);
                                        setTimeout(() => setAccountToast(null), 3500);
                                      }
                                    }}
                                    className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                                    title="Cấp toàn quyền Quản trị viên"
                                  >
                                    <Crown className="w-3.5 h-3.5" />
                                    <span>Lên Admin</span>
                                  </button>
                                )}

                                {/* Khóa / Mở khóa tài khoản (Xóa mềm) */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleAccountSuspension(acc.email);
                                    setAccountToast(
                                      acc.isSuspended
                                        ? `Đã mở khóa tài khoản ${acc.email}!`
                                        : `Đã khóa tài khoản ${acc.email} (Xóa mềm)!`
                                    );
                                    setTimeout(() => setAccountToast(null), 3000);
                                  }}
                                  className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                                    acc.isSuspended
                                      ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                                      : 'text-slate-500 bg-slate-50 border-slate-200 hover:text-amber-700 hover:bg-amber-50'
                                  }`}
                                  title={acc.isSuspended ? 'Mở khóa tài khoản' : 'Khóa tài khoản (Xóa mềm)'}
                                >
                                  {acc.isSuspended ? (
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  ) : (
                                    <Lock className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </>
                            )
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Chỉ Quản trị viên mới được phân quyền
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: THÙNG RÁC & KHÔI PHỤC DỮ LIỆU ĐÃ XÓA MỀM (TRASH & ARCHIVE)         */}
        {/* ========================================================================= */}
        {activeTab === 'trash' && (
          <div className="space-y-6">
            {/* Trash Toast Feedback */}
            {trashToast && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4 text-xs text-emerald-950 font-bold shadow-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{trashToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTrashToast(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            )}

            {/* Trash Sub-tabs Header Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Kho Dữ Liệu Đã Xóa Mềm &amp; Lưu Trữ
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Mọi dữ liệu xóa mềm đều được bảo vệ toàn vẹn. Bạn có thể <strong>Khôi phục (1-Click)</strong> về trang chính hoặc <strong>Xóa vĩnh viễn</strong>.
                </p>
              </div>

              {/* Sub-tabs selector pills */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setTrashSubTab('properties')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    trashSubTab === 'properties'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Phòng Trọ ({deletedProperties.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrashSubTab('bookings')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    trashSubTab === 'bookings'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Đơn Cọc ({archivedBookings.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrashSubTab('accounts')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    trashSubTab === 'accounts'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Tài Khoản Khóa ({suspendedAccounts.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTrashSubTab('reviews')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    trashSubTab === 'reviews'
                      ? 'bg-white text-purple-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>Đánh Giá Ẩn ({deletedReviews.length})</span>
                </button>
              </div>
            </div>

            {/* Sub-tab 1: Soft-deleted Properties */}
            {trashSubTab === 'properties' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {deletedProperties.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-xs">
                      <CheckCircle className="w-7 h-7" />
                    </div>
                    <p className="text-base font-black text-slate-800">Thùng rác phòng trọ sạch sẽ!</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Hiện tại không có phòng trọ nào bị xóa mềm. Tất cả các phòng trọ của bạn đều đang hiển thị hoạt động tốt bên ngoài trang khách.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Phòng trọ đã xóa</th>
                          <th className="p-4">Khu vực / Tỉnh</th>
                          <th className="p-4">Giá thuê</th>
                          <th className="p-4">Thời gian xóa</th>
                          <th className="p-4 text-right">Hành động khôi phục</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deletedProperties.map((prop) => (
                          <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
                                  alt=""
                                  className="w-14 h-11 object-cover rounded-xl border border-slate-200 grayscale opacity-75"
                                />
                                <div>
                                  <span className="font-mono text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-bold">
                                    {prop.code} (Đã xóa mềm)
                                  </span>
                                  <h4 className="font-bold text-slate-900 mt-0.5 max-w-[220px] truncate">
                                    {prop.title}
                                  </h4>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600">
                              <span className="font-semibold block">{prop.area}</span>
                              <span className="text-[11px] text-slate-400">{prop.city}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-black text-slate-800">
                                {formatPrice(prop.pricePerMonthUSD, 'VND')}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 font-mono text-[11px]">
                              {prop.deletedAt
                                ? new Date(prop.deletedAt).toLocaleString('vi-VN')
                                : 'Gần đây'}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    restoreProperty(prop.id);
                                    setTrashToast(`Đã khôi phục phòng "${prop.title}" về trang chủ thành công!`);
                                    setTimeout(() => setTrashToast(null), 3500);
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Khôi phục lại</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPermanentDeleteTarget({
                                      type: 'property',
                                      id: prop.id,
                                      title: prop.title
                                    });
                                  }}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  title="Xóa vĩnh viễn không thể khôi phục"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa vĩnh viễn</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 2: Archived Bookings */}
            {trashSubTab === 'bookings' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {archivedBookings.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-xs">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <p className="text-base font-black text-slate-800">Không có đơn cọc nào trong mục lưu trữ</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Các đơn cọc đã hủy hoặc hoàn tất có thể lưu trữ vào đây để làm gọn giao diện quản lý duyệt cọc chính.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Mã đơn cọc</th>
                          <th className="p-4">Khách thuê</th>
                          <th className="p-4">Phòng</th>
                          <th className="p-4">Tiền cọc</th>
                          <th className="p-4">Ngày lưu trữ</th>
                          <th className="p-4 text-right">Khôi phục</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {archivedBookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-4 font-mono font-bold text-slate-800">
                              #{b.reference}
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-900 block">{b.studentName}</span>
                              <span className="text-[11px] text-slate-500">{b.studentContact}</span>
                            </td>
                            <td className="p-4">
                              <span className="font-semibold text-slate-800 block">{b.propertyCode}</span>
                              <span className="text-[10px] text-slate-400 truncate max-w-[150px] block">
                                {b.propertyTitle}
                              </span>
                            </td>
                            <td className="p-4 font-black text-emerald-700">
                              {formatPrice(b.tokenAmountUSD, 'VND')}
                            </td>
                            <td className="p-4 text-slate-400 text-[11px] font-mono">
                              {b.archivedAt ? new Date(b.archivedAt).toLocaleDateString('vi-VN') : 'Lưu trữ'}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedReceiptLead(b)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                                >
                                  Xem bill
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    restoreBooking(b.id);
                                    setTrashToast(`Đã khôi phục đơn cọc #${b.reference} về bảng duyệt chính!`);
                                    setTimeout(() => setTrashToast(null), 3500);
                                  }}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Khôi phục</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 3: Suspended Accounts */}
            {trashSubTab === 'accounts' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {suspendedAccounts.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center mx-auto shadow-xs">
                      <UserCheck className="w-7 h-7" />
                    </div>
                    <p className="text-base font-black text-slate-800">Không có tài khoản nào bị khóa</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Tất cả các tài khoản Nhân viên (Staff) và Sinh viên đều đang hoạt động bình thường.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {suspendedAccounts.map((acc) => (
                      <div
                        key={acc.id || acc.email}
                        className="p-4 lg:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-slate-200 text-slate-600 font-black text-sm flex items-center justify-center shrink-0">
                            {acc?.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{acc.name}</h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                Đã khóa / Vô hiệu hóa
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{acc.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              toggleAccountSuspension(acc.email);
                              setTrashToast(`Đã mở khóa tài khoản ${acc.email} thành công!`);
                              setTimeout(() => setTrashToast(null), 3500);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Mở khóa tài khoản</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPermanentDeleteTarget({
                                type: 'account',
                                id: acc.email,
                                title: acc.email
                              });
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa vĩnh viễn</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-tab 4: Soft-deleted Reviews */}
            {trashSubTab === 'reviews' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                {deletedReviews.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto shadow-xs">
                      <Star className="w-7 h-7" />
                    </div>
                    <p className="text-base font-black text-slate-800">Không có đánh giá nào bị ẩn</p>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Các đánh giá vi phạm hoặc cần hòa giải sẽ được lưu ở đây khi bạn bấm xóa mềm.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {deletedReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 lg:p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-slate-50/60"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900">{rev.userName}</span>
                            <span className="text-amber-500 font-bold text-xs">
                              {'★'.repeat(Math.max(1, Math.min(5, Math.floor(rev?.rating || 5))))}
                            </span>
                            <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-bold border border-rose-200">
                              Đang bị ẩn
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                            &ldquo;{rev.comment}&rdquo;
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              restoreReview(rev.id);
                              setTrashToast(`Đã khôi phục đánh giá của ${rev.userName}!`);
                              setTimeout(() => setTrashToast(null), 3500);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Bỏ ẩn / Khôi phục</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setPermanentDeleteTarget({
                                type: 'review',
                                id: rev.id,
                                title: `Đánh giá của ${rev.userName}`
                              });
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa vĩnh viễn</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Property Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white w-full max-w-4xl lg:max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-7 py-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold">Thêm Phòng Trọ Mới Vào Hệ Thống</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chọn Tỉnh/Thành phố để hệ thống tự động gợi ý Quận/Huyện và các Trường Đại học tương ứng
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-7 sm:p-8 overflow-y-auto space-y-6 text-sm">
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

              {/* Ghi chú Chủ nhà Nội bộ (Chỉ mình Admin thấy, ẩn hoàn toàn bên User) */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ghi chú Chủ nhà gốc (Chỉ Admin thấy • Ẩn hoàn toàn với khách thuê để chống cắt cầu)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tên chủ nhà trọ &amp; Ghi chú hoa hồng
                    </label>
                    <input
                      type="text"
                      value={newLandlordName}
                      onChange={(e) => setNewLandlordName(e.target.value)}
                      placeholder="VD: Chú Bảy Hẻm 51 (Hoa hồng 500k)"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      SĐT / Zalo riêng của Chủ nhà gốc
                    </label>
                    <input
                      type="text"
                      value={newLandlordContact}
                      onChange={(e) => setNewLandlordContact(e.target.value)}
                      placeholder="VD: 0918 123 456"
                      className="w-full px-3 py-2 bg-white border border-amber-200 rounded-xl outline-none"
                    />
                  </div>
                </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white w-full max-w-3xl lg:max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-7 py-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-600 text-[11px] font-mono font-bold">
                    {selectedDetailProp.code}
                  </span>
                  <span className="text-xs text-slate-300 uppercase font-semibold">
                    {selectedDetailProp.roomType}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mt-1 text-white">{selectedDetailProp.title}</h3>
              </div>
              <button
                onClick={() => setSelectedDetailProp(null)}
                className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-7 sm:p-8 overflow-y-auto space-y-6 text-sm">
              {/* Ảnh lớn */}
              <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <img
                  src={selectedDetailProp.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
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

              {/* Thông tin Chủ nhà Gốc (Chỉ hiển thị nội bộ trong Admin) */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-amber-700 block">
                      Thông tin Chủ nhà gốc (Nội bộ Admin • Khách không thấy)
                    </span>
                    <span className="font-bold text-slate-900">
                      {selectedDetailProp.landlordName} — SĐT: {selectedDetailProp.landlordContact}
                    </span>
                  </div>
                </div>
                <a
                  href={`https://zalo.me/${selectedDetailProp.landlordContact.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-bold rounded-xl border border-amber-300 shrink-0"
                >
                  Zalo Chủ nhà
                </a>
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

      {/* Delete Confirmation Popup Modal (Soft Delete) */}
      {propertyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Chuyển phòng vào Thùng Rác?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Phòng trọ này sẽ lập tức được ẩn khỏi trang Người Dùng nhưng được lưu an toàn trong <strong>Thùng Rác</strong>. Bạn có thể khôi phục lại bất kỳ lúc nào!
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
              <img
                src={propertyToDelete.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'}
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
                  const title = propertyToDelete.title;
                  setPropertyToDelete(null);
                  setTrashToast(`Đã chuyển phòng "${title}" vào Thùng Rác (Xóa mềm an toàn)!`);
                  setTimeout(() => setTrashToast(null), 4000);
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Đưa Vào Thùng Rác</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-rose-700">CẢNH BÁO: XÓA VĨNH VIỄN!</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Hành động này sẽ <strong>xóa hoàn toàn</strong> dữ liệu của &ldquo;<strong>{permanentDeleteTarget.title}</strong>&rdquo; khỏi hệ thống và <span className="text-rose-600 font-bold">KHÔNG THỂ KHÔI PHỤC</span> nữa.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Hủy bỏ (Giữ lại)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (permanentDeleteTarget.type === 'property') {
                    permanentDeleteProperty(permanentDeleteTarget.id);
                  } else if (permanentDeleteTarget.type === 'account') {
                    permanentDeleteAccount(permanentDeleteTarget.id);
                  } else if (permanentDeleteTarget.type === 'review') {
                    permanentDeleteReview(permanentDeleteTarget.id);
                  }
                  const name = permanentDeleteTarget.title;
                  setPermanentDeleteTarget(null);
                  setTrashToast(`Đã xóa vĩnh viễn "${name}" khỏi hệ thống.`);
                  setTimeout(() => setTrashToast(null), 3500);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xác Nhận Xóa Vĩnh Viễn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt / Bill Inspection Modal */}
      {selectedReceiptLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl sm:max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-7 py-5 flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  Mã đơn: #{selectedReceiptLead.reference} • Phòng: {selectedReceiptLead.propertyCode}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Kiểm Tra Ảnh Biên Lai Chuyển Khoản – {selectedReceiptLead.studentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReceiptLead(null)}
                className="w-10 h-10 rounded-2xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-5 text-sm">
              {selectedReceiptLead.receiptImageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center min-h-[320px] max-h-[520px] p-2">
                  <img
                    src={selectedReceiptLead.receiptImageUrl}
                    alt="Ảnh chụp màn hình chuyển khoản"
                    className="max-h-[500px] w-auto object-contain rounded-xl shadow-lg"
                  />
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Người chuyển:</span>
                  <span className="font-bold text-slate-900">
                    {selectedReceiptLead.studentName} ({selectedReceiptLead.studentContact})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số tiền báo chuyển:</span>
                  <span className="font-black text-emerald-700">
                    {selectedReceiptLead.tokenAmountLocal}
                  </span>
                </div>
                {selectedReceiptLead.transferContent && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nội dung CK:</span>
                    <span className="font-mono font-bold text-indigo-700">
                      {selectedReceiptLead.transferContent}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReceiptLead(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateBookingStatus(selectedReceiptLead.id, 'confirmed');
                    setSelectedReceiptLead(null);
                  }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Xác Nhận Hợp Lệ &amp; Chốt Phòng</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Thêm / Chỉ định Nhân Viên (Staff) Mới */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Chỉ Định &amp; Thêm Nhân Viên Mới</h3>
                  <p className="text-[11px] text-slate-400">Bổ nhiệm nhân sự vận hành hệ thống UniStay</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newStaffEmail || !newStaffName) {
                  alert('Vui lòng nhập đầy đủ Họ tên và Email nhân viên!');
                  return;
                }
                addOrUpdateAccount({
                  name: newStaffName.trim(),
                  email: newStaffEmail.toLowerCase().trim(),
                  phone: newStaffPhone.trim() || undefined,
                  college: newStaffCollege.trim() || 'Nhân viên vận hành UniStay',
                  role: newStaffRole
                });
                setShowAddStaffModal(false);
                setAccountToast(
                  `Đã bổ nhiệm thành công ${newStaffName} (${newStaffEmail}) làm ${
                    newStaffRole === 'admin' ? 'Quản trị viên' : 'Nhân Viên (Staff)'
                  }!`
                );
                setTimeout(() => setAccountToast(null), 3500);
              }}
              className="p-6 space-y-4"
            >
              <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-indigo-950">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>Cách thức hoạt động:</span>
                </p>
                <p className="text-[11px] leading-relaxed text-indigo-800">
                  Nhập địa chỉ Email (Google hoặc Email đăng nhập) của nhân viên. Khi người này đăng nhập vào UniStay, hệ thống sẽ tự động cấp quyền truy cập Bảng quản trị để quản lý phòng trọ, duyệt cọc và live chat với sinh viên.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và Tên Nhân Viên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn Hoàng (CSKH Cần Thơ)"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Địa Chỉ Email (Google / Login) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  placeholder="staff@gmail.com hoặc hoang.nguyen@ctu.edu.vn"
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại / Zalo
                  </label>
                  <input
                    type="tel"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Khu Vực / Trường Phụ Trách
                  </label>
                  <input
                    type="text"
                    value={newStaffCollege}
                    onChange={(e) => setNewStaffCollege(e.target.value)}
                    placeholder="Ví dụ: ĐH Cần Thơ (CTU)"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chỉ Định Vai Trò Phân Quyền
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      newStaffRole === 'staff'
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={newStaffRole === 'staff'}
                      onChange={() => setNewStaffRole('staff')}
                      className="accent-indigo-600"
                    />
                    <div>
                      <span>Nhân Viên (Staff)</span>
                      <p className="text-[10px] font-normal text-slate-500">Quản lý trọ, duyệt cọc, chat</p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      newStaffRole === 'admin'
                        ? 'bg-purple-50 border-purple-300 text-purple-900 ring-2 ring-purple-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={newStaffRole === 'admin'}
                      onChange={() => setNewStaffRole('admin')}
                      className="accent-purple-600"
                    />
                    <div>
                      <span>Quản Trị Viên (Admin)</span>
                      <p className="text-[10px] font-normal text-slate-500">Toàn quyền hệ thống</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Xác Nhận &amp; Cấp Quyền</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
