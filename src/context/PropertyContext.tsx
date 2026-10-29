'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Booking, CurrencyCode, SiteSettings } from '@/types';
import { INITIAL_PROPERTIES } from '@/data/mockProperties';
import { siteConfig } from '@/config/site';

interface PropertyContextType {
  properties: Property[];
  bookings: Booking[];
  currency: CurrencyCode;
  settings: SiteSettings;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceUSD: number, customCurrency?: CurrencyCode) => string;
  addProperty: (property: Omit<Property, 'id' | 'code' | 'rating' | 'reviewsCount' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'createdAt'>) => string;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: siteConfig.name,
  tagline: siteConfig.tagline,
  defaultCurrency: 'VND',
  supportWhatsApp: '+84901234567',
  supportEmail: 'contact@unistay.app',
  supportHotline: '1900 6868',
  vietQrBankName: 'Vietcombank (VCB)',
  vietQrAccountNumber: '1029384756',
  vietQrAccountHolder: 'CONG TY CP UNISTAY VIETNAM',
  razorpayKeyId: 'rzp_test_sample',
  stripePublishableKey: 'pk_test_sample',
  defaultTokenUSD: 20,
  holdHours: 48,
};

const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'lead-1',
    reference: 'BK-CT88A1',
    propertyId: 'prop-vn-ct-1',
    propertyTitle: 'Mekong Green Studio – Căn hộ ban công gần ĐH Cần Thơ & ĐH Y Dược',
    propertyCode: 'VN-101',
    userId: 'usr-1',
    studentName: 'Lê Minh Khôi',
    studentEmail: 'khoi.le@student.ctu.edu.vn',
    studentContact: '0939 123 456',
    college: 'ĐH Cần Thơ (CTU - Khu II Đường 3/2)',
    moveInDate: '2026-11-10',
    roomType: 'studio',
    tokenAmountUSD: 20,
    tokenAmountLocal: '500.000 ₫',
    currency: 'VND',
    status: 'token_paid',
    paymentMethod: 'vietqr_bank',
    transactionReference: 'VCB_CT_992817',
    adminNotes: 'Đã nhận chuyển khoản cọc giữ chỗ 500k qua VietQR. Hẹn chiều thứ 7 nhận phòng.',
    createdAt: '2026-10-28 09:30'
  },
  {
    id: 'lead-2',
    reference: 'BK-FPT29B',
    propertyId: 'prop-vn-ct-2',
    propertyTitle: 'FPT Smart Duplex – Phòng gác lửng KDC Hồng Phát gần ĐH FPT Cần Thơ',
    propertyCode: 'VN-102',
    userId: 'usr-2',
    studentName: 'Nguyễn Hoàng Nam',
    studentEmail: 'namnhce180122@fpt.edu.vn',
    studentContact: '0909 888 777',
    college: 'ĐH FPT Cần Thơ (Cầu Rau Răm - Nguyễn Văn Cừ)',
    moveInDate: '2026-11-15',
    roomType: 'double',
    tokenAmountUSD: 20,
    tokenAmountLocal: '500.000 ₫',
    currency: 'VND',
    status: 'confirmed',
    paymentMethod: 'vietqr_bank',
    transactionReference: 'MB_FPT_554120',
    adminNotes: 'Đã xác nhận giữ phòng KDC Hồng Phát cho 2 bạn sinh viên K18 FPT.',
    createdAt: '2026-10-28 14:15'
  }
];

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [currency, setCurrencyState] = useState<CurrencyCode>('VND');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      // Khôi phục cả các phòng do Admin tự tạo ở các phiên bản localStorage trước đó
      const v3Raw = localStorage.getItem('unistay_vn_properties_v3');
      const v2Raw = localStorage.getItem('unistay_vn_properties_v2');
      const v1Raw = localStorage.getItem('unistay_properties');

      const customMap = new Map<string, Property>();

      const normalizeProp = (p: Property): Property => {
        const cityTrim = (p.city || '').trim();
        const normalizedCity =
          cityTrim.toLowerCase() === 'cần thơ' || cityTrim.toLowerCase() === 'can tho'
            ? 'Cần Thơ'
            : cityTrim || 'Cần Thơ';
        return {
          ...p,
          city: normalizedCity,
          country: 'Việt Nam',
          isPublished: true
        };
      };

      [v1Raw, v2Raw, v3Raw].forEach((raw) => {
        if (!raw) return;
        try {
          const parsed: Property[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              // Giữ lại mọi phòng do Admin tạo (id bắt đầu bằng prop-17...)
              if (item && item.id && /^prop-\d+$/.test(item.id)) {
                customMap.set(item.id, normalizeProp(item));
              }
            });
          }
        } catch {}
      });

      if (v3Raw) {
        const parsedV3: Property[] = JSON.parse(v3Raw);
        const existingIds = new Set(parsedV3.map((p) => p.id));
        const recoveredCustoms = Array.from(customMap.values()).filter(
          (c) => !existingIds.has(c.id)
        );
        const merged = [...recoveredCustoms, ...parsedV3.map(normalizeProp)];
        setProperties(merged);
        localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(merged));
      } else {
        const recoveredCustoms = Array.from(customMap.values());
        const merged = [...recoveredCustoms, ...INITIAL_PROPERTIES];
        setProperties(merged);
        localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(merged));
      }

      const savedBookings = localStorage.getItem('unistay_vn_bookings_v3');
      if (savedBookings) setBookings(JSON.parse(savedBookings));

      setCurrencyState('VND');

      const savedSettings = localStorage.getItem('unistay_settings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
    } catch {
      // fallback
    }

    // Đồng bộ tức thời giữa tab Admin và tab User
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'unistay_vn_properties_v3' && e.newValue) {
        try {
          setProperties(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === 'unistay_vn_bookings_v3' && e.newValue) {
        try {
          setBookings(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      bc = new BroadcastChannel('unistay_properties_sync');
      bc.onmessage = (event) => {
        if (event.data?.type === 'PROPERTIES_UPDATED' && Array.isArray(event.data.payload)) {
          setProperties(event.data.payload);
        }
        if (event.data?.type === 'BOOKINGS_UPDATED' && Array.isArray(event.data.payload)) {
          setBookings(event.data.payload);
        }
      };
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (bc) bc.close();
    };
  }, []);

  const broadcastUpdate = (type: 'PROPERTIES_UPDATED' | 'BOOKINGS_UPDATED', payload: unknown) => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const bc = new BroadcastChannel('unistay_properties_sync');
        bc.postMessage({ type, payload });
        bc.close();
      }
    } catch {}
  };

  const saveProperties = (data: Property[]) => {
    setProperties(data);
    try {
      localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(data));
      broadcastUpdate('PROPERTIES_UPDATED', data);
    } catch {}
  };

  const saveBookings = (data: Booking[]) => {
    setBookings(data);
    try {
      localStorage.setItem('unistay_vn_bookings_v3', JSON.stringify(data));
      broadcastUpdate('BOOKINGS_UPDATED', data);
    } catch {}
  };

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem('unistay_currency', c);
    } catch {}
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('unistay_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const formatPrice = (priceUSD: number, customCurrency?: CurrencyCode): string => {
    const cur = customCurrency || currency;
    switch (cur) {
      case 'VND': {
        const vnd = Math.round(priceUSD * siteConfig.currencyRates.VND);
        return `${vnd.toLocaleString('vi-VN')} ₫`;
      }
      case 'INR': {
        const inr = Math.round(priceUSD * siteConfig.currencyRates.INR);
        return `₹${inr.toLocaleString('en-IN')}`;
      }
      case 'EUR': {
        const eur = Math.round(priceUSD * siteConfig.currencyRates.EUR);
        return `€${eur.toLocaleString()}`;
      }
      case 'USD':
      default:
        return `$${priceUSD.toLocaleString()}`;
    }
  };

  const addProperty = (newProp: Omit<Property, 'id' | 'code' | 'rating' | 'reviewsCount' | 'createdAt'>) => {
    setProperties((prev) => {
      const nextCodeNumber = prev.length + 101;
      const prefix = newProp.city === 'Cần Thơ' ? 'CT' : 'VN';
      const created: Property = {
        ...newProp,
        country: 'Việt Nam',
        isPublished: true,
        id: `prop-${Date.now()}`,
        code: `${prefix}-${nextCodeNumber}`,
        rating: 5.0,
        reviewsCount: 1,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      const updated = [created, ...prev];
      try {
        localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(updated));
        broadcastUpdate('PROPERTIES_UPDATED', updated);
      } catch {}
      return updated;
    });
  };

  const updateProperty = (id: string, updatedFields: Partial<Property>) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      try {
        localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(updated));
        broadcastUpdate('PROPERTIES_UPDATED', updated);
      } catch {}
      return updated;
    });
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('unistay_vn_properties_v3', JSON.stringify(updated));
        broadcastUpdate('PROPERTIES_UPDATED', updated);
      } catch {}
      return updated;
    });
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'reference' | 'createdAt'>): string => {
    const ref = `BK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newBooking: Booking = {
      ...bookingData,
      id: `book-${Date.now()}`,
      reference: ref,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    saveBookings([newBooking, ...bookings]);
    return ref;
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    saveBookings(bookings.map((b) => (b.id === id ? { ...b, status } : b)));
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        bookings,
        currency,
        settings,
        setCurrency,
        formatPrice,
        addProperty,
        updateProperty,
        deleteProperty,
        addBooking,
        updateBookingStatus,
        updateSettings
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperties = () => {
  const context = useContext(PropertyContext);
  if (!context) throw new Error('useProperties must be used within PropertyProvider');
  return context;
};
