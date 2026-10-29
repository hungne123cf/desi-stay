'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Booking, CurrencyCode, SiteSettings, ChatMessage, PropertyReview } from '@/types';
import { siteConfig } from '@/config/site';

export interface ReviewEligibility {
  hasPurchased: boolean;
  totalPurchases: number;
  usedReviews: number;
  remainingReviews: number;
  nextBookingToReview: Booking | null;
}

interface PropertyContextType {
  properties: Property[];
  bookings: Booking[];
  messages: ChatMessage[];
  reviews: PropertyReview[];
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
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  markConversationRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  addReview: (review: Omit<PropertyReview, 'id' | 'createdAt'>) => void;
  replyToReview: (reviewId: string, adminReply: string) => void;
  deleteReview: (reviewId: string) => void;
  getReviewEligibility: (
    propertyId: string,
    propertyCode: string,
    user?: { id?: string; email?: string; phone?: string | null; name?: string } | null
  ) => ReviewEligibility;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: siteConfig.name,
  tagline: siteConfig.tagline,
  defaultCurrency: 'VND',
  supportWhatsApp: '0901234567',
  supportEmail: 'contact@unistay.vn',
  supportHotline: '0901234567',
  vietQrBankName: 'Vietcombank (VCB)',
  vietQrAccountNumber: '1029384756',
  vietQrAccountHolder: 'CONG TY CP UNISTAY VIET NAM',
  razorpayKeyId: '',
  stripePublishableKey: '',
  defaultTokenUSD: 20,
  holdHours: 48
};

function isRealAdminProperty(p: Property): boolean {
  if (!p || !p.id) return false;
  if (
    p.id.startsWith('prop-vn-') ||
    p.id.startsWith('prop-in-') ||
    p.id.startsWith('prop-eu-')
  ) {
    return false;
  }
  return true;
}

function isRealUserBooking(b: Booking): boolean {
  if (!b || !b.id) return false;
  if (b.id === 'lead-1' || b.id === 'lead-2' || b.id === 'lead-3') {
    return false;
  }
  return true;
}

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [myBookingIds, setMyBookingIds] = useState<string[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>('VND');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('unistay_my_booking_ids');
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) setMyBookingIds(parsed);
      }
    } catch {}
  }, []);

  const syncToServer = async (payload: {
    properties?: Property[];
    bookings?: Booking[];
    messages?: ChatMessage[];
    reviews?: PropertyReview[];
    settings?: SiteSettings;
  }) => {
    try {
      await fetch('/api/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // fallback localStorage
    }
  };

  useEffect(() => {
    let isMounted = true;

    const localRealProps = new Map<string, Property>();
    try {
      ['unistay_properties', 'unistay_vn_properties_v2', 'unistay_vn_properties_v3', 'unistay_real_properties_v4'].forEach(
        (key) => {
          const raw = localStorage.getItem(key);
          if (!raw) return;
          const parsed: Property[] = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((p) => {
              if (isRealAdminProperty(p)) {
                localRealProps.set(p.id, {
                  ...p,
                  country: 'Việt Nam',
                  isPublished: true
                });
              }
            });
          }
        }
      );
      localStorage.removeItem('unistay_properties');
      localStorage.removeItem('unistay_vn_properties_v2');
      localStorage.removeItem('unistay_vn_properties_v3');
      localStorage.removeItem('unistay_vn_bookings_v3');
    } catch {}

    fetch('/api/store')
      .then((res) => res.json())
      .then((serverState) => {
        if (!isMounted) return;
        const serverProps: Property[] = Array.isArray(serverState.properties)
          ? serverState.properties.filter(isRealAdminProperty)
          : [];
        const serverBookings: Booking[] = Array.isArray(serverState.bookings)
          ? serverState.bookings.filter(isRealUserBooking)
          : [];
        const serverMessages: ChatMessage[] = Array.isArray(serverState.messages)
          ? serverState.messages
          : [];
        const serverReviews: PropertyReview[] = Array.isArray(serverState.reviews)
          ? serverState.reviews
          : [];

        const mergedMap = new Map<string, Property>();
        serverProps.forEach((p) => mergedMap.set(p.id, p));
        let hasNewLocalToPush = false;
        localRealProps.forEach((p, id) => {
          if (!mergedMap.has(id)) {
            mergedMap.set(id, p);
            hasNewLocalToPush = true;
          }
        });

        const finalProps = Array.from(mergedMap.values()).map((p) => {
          const pReviews = serverReviews.filter(
            (r) => r.propertyId === p.id || r.propertyCode === p.code
          );
          if (pReviews.length === 0) {
            return { ...p, rating: 0, reviewsCount: 0 };
          }
          const avg = Number(
            (pReviews.reduce((sum, r) => sum + r.rating, 0) / pReviews.length).toFixed(1)
          );
          return { ...p, rating: avg, reviewsCount: pReviews.length };
        });
        setProperties(finalProps);
        setBookings(serverBookings);
        setMessages(serverMessages);
        setReviews(serverReviews);
        if (serverState.settings) setSettings(serverState.settings);

        try {
          localStorage.setItem('unistay_real_properties_v4', JSON.stringify(finalProps));
          localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(serverBookings));
          localStorage.setItem('unistay_real_messages_v4', JSON.stringify(serverMessages));
          localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(serverReviews));
        } catch {}

        if (hasNewLocalToPush) {
          syncToServer({ properties: finalProps });
        }
      })
      .catch(() => {
        const fallbackProps = Array.from(localRealProps.values());
        setProperties(fallbackProps);
      });

    // Kết nối Real-Time Stream (SSE)
    let eventSource: EventSource | null = null;
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource('/api/stream');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (Array.isArray(data.properties)) {
            const cleanProps = data.properties.filter(isRealAdminProperty);
            setProperties(cleanProps);
            localStorage.setItem('unistay_real_properties_v4', JSON.stringify(cleanProps));
          }
          if (Array.isArray(data.bookings)) {
            const cleanBookings = data.bookings.filter(isRealUserBooking);
            setBookings(cleanBookings);
            localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(cleanBookings));
          }
          if (Array.isArray(data.messages)) {
            setMessages(data.messages);
            localStorage.setItem('unistay_real_messages_v4', JSON.stringify(data.messages));
          }
          if (Array.isArray(data.reviews)) {
            setReviews(data.reviews);
            localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(data.reviews));
          }
          if (data.settings) {
            setSettings(data.settings);
          }
        } catch {}
      };
    }

    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
  };

  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      syncToServer({ settings: updated });
      return updated;
    });
  };

  const formatPrice = (priceUSD: number, customCurrency?: CurrencyCode): string => {
    const cur = customCurrency || currency;
    switch (cur) {
      case 'VND':
      default: {
        const vnd = Math.round(priceUSD * siteConfig.currencyRates.VND);
        return `${vnd.toLocaleString('vi-VN')} ₫`;
      }
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
        rating: 0,
        reviewsCount: 0,
        createdAt: new Date().toISOString().slice(0, 10)
      };
      const updated = [created, ...prev];
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ properties: updated });
      return updated;
    });
  };

  const updateProperty = (id: string, updatedFields: Partial<Property>) => {
    setProperties((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedFields } : p));
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ properties: updated });
      return updated;
    });
  };

  const deleteProperty = (id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ properties: updated });
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
    setBookings((prev) => {
      const updated = [newBooking, ...prev];
      try {
        localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ bookings: updated });
      return updated;
    });
    setMyBookingIds((prev) => {
      const updatedIds = Array.from(new Set([newBooking.id, ref, ...prev]));
      try {
        localStorage.setItem('unistay_my_booking_ids', JSON.stringify(updatedIds));
      } catch {}
      return updatedIds;
    });
    return ref;
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, status } : b));
      try {
        localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ bookings: updated });
      return updated;
    });
  };

  const sendChatMessage = (msgData: Omit<ChatMessage, 'id' | 'createdAt'>) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} • ${now.toLocaleDateString('vi-VN')}`;

    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: timeStr
    };

    setMessages((prev) => {
      const updated = [...prev, newMsg];
      try {
        localStorage.setItem('unistay_real_messages_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ messages: updated });
      return updated;
    });
  };

  const markConversationRead = (conversationId: string) => {
    setMessages((prev) => {
      const hasUnread = prev.some(
        (m) => m.conversationId === conversationId && !m.isReadByAdmin
      );
      if (!hasUnread) return prev;
      const updated = prev.map((m) =>
        m.conversationId === conversationId ? { ...m, isReadByAdmin: true } : m
      );
      try {
        localStorage.setItem('unistay_real_messages_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ messages: updated });
      return updated;
    });
  };

  const deleteConversation = (conversationId: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.conversationId !== conversationId);
      try {
        localStorage.setItem('unistay_real_messages_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ messages: updated });
      return updated;
    });
  };

  const recalculatePropertyRating = (propertyId: string, allReviews: PropertyReview[]) => {
    const propReviews = allReviews.filter((r) => r.propertyId === propertyId);
    const count = propReviews.length;
    const avg =
      count > 0
        ? Number(
            (propReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
          )
        : 0;

    setProperties((prevProps) => {
      const updatedProps = prevProps.map((p) =>
        p.id === propertyId ? { ...p, rating: avg, reviewsCount: count } : p
      );
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updatedProps));
      } catch {}
      syncToServer({ properties: updatedProps, reviews: allReviews });
      return updatedProps;
    });
  };

  const addReview = (reviewData: Omit<PropertyReview, 'id' | 'createdAt'>) => {
    const now = new Date();
    const createdAt = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')} • ${now.toLocaleDateString('vi-VN')}`;

    const newReview: PropertyReview = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt
    };

    setReviews((prev) => {
      const updated = [newReview, ...prev];
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      recalculatePropertyRating(reviewData.propertyId, updated);
      return updated;
    });
  };

  const replyToReview = (reviewId: string, adminReply: string) => {
    setReviews((prev) => {
      const updated = prev.map((r) =>
        r.id === reviewId ? { ...r, adminReply } : r
      );
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ reviews: updated });
      return updated;
    });
  };

  const deleteReview = (reviewId: string) => {
    setReviews((prev) => {
      const target = prev.find((r) => r.id === reviewId);
      const updated = prev.filter((r) => r.id !== reviewId);
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      if (target) {
        recalculatePropertyRating(target.propertyId, updated);
      } else {
        syncToServer({ reviews: updated });
      }
      return updated;
    });
  };

  const getReviewEligibility = (
    propertyId: string,
    propertyCode: string,
    user?: { id?: string; email?: string; phone?: string | null; name?: string } | null
  ): ReviewEligibility => {
    const cleanUserPhone = user?.phone ? user.phone.replace(/[^0-9]/g, '') : '';

    const userBookings = bookings.filter((b) => {
      const matchesProperty = b.propertyId === propertyId || b.propertyCode === propertyCode;
      if (!matchesProperty || b.status === 'cancelled') return false;

      const byLocalBrowser =
        myBookingIds.includes(b.id) || (b.reference ? myBookingIds.includes(b.reference) : false);
      const byUserId = Boolean(user?.id && user.id !== 'guest' && b.userId === user.id);
      const byEmail = Boolean(
        user?.email &&
          b.studentEmail &&
          b.studentEmail.toLowerCase() === user.email.toLowerCase()
      );
      const byPhone = Boolean(
        cleanUserPhone.length >= 8 &&
          b.studentContact.replace(/[^0-9]/g, '') === cleanUserPhone
      );
      const byName = Boolean(
        user?.name && b.studentName.trim().toLowerCase() === user.name.trim().toLowerCase()
      );

      return byLocalBrowser || byUserId || byEmail || byPhone || byName;
    });

    const totalPurchases = userBookings.length;
    if (totalPurchases === 0) {
      return {
        hasPurchased: false,
        totalPurchases: 0,
        usedReviews: 0,
        remainingReviews: 0,
        nextBookingToReview: null
      };
    }

    const propReviews = reviews.filter(
      (r) => r.propertyId === propertyId || r.propertyCode === propertyCode
    );

    const unreviewedBookings = userBookings.filter(
      (b) =>
        !propReviews.some(
          (r) => r.bookingId === b.id || (b.reference && r.bookingId === b.reference)
        )
    );

    const userOwnReviewsCount = propReviews.filter((r) => {
      const matchesBooking = userBookings.some(
        (b) => r.bookingId === b.id || (b.reference && r.bookingId === b.reference)
      );
      const matchesEmail = Boolean(
        user?.email && r.userEmail && r.userEmail.toLowerCase() === user.email.toLowerCase()
      );
      const matchesName = Boolean(
        user?.name && r.userName.trim().toLowerCase() === user.name.trim().toLowerCase()
      );
      return matchesBooking || matchesEmail || matchesName;
    }).length;

    const usedReviews = Math.max(totalPurchases - unreviewedBookings.length, userOwnReviewsCount);
    const remainingReviews = Math.max(0, totalPurchases - usedReviews);

    return {
      hasPurchased: true,
      totalPurchases,
      usedReviews,
      remainingReviews,
      nextBookingToReview:
        remainingReviews > 0 ? unreviewedBookings[0] || userBookings[0] || null : null
    };
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        bookings,
        messages,
        reviews,
        currency,
        settings,
        setCurrency,
        formatPrice,
        addProperty,
        updateProperty,
        deleteProperty,
        addBooking,
        updateBookingStatus,
        updateSettings,
        sendChatMessage,
        markConversationRead,
        deleteConversation,
        addReview,
        replyToReview,
        deleteReview,
        getReviewEligibility
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
