'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, Booking, CurrencyCode, SiteSettings, ChatMessage, PropertyReview, UserAccount, UserRole } from '@/types';
import { siteConfig } from '@/config/site';
import { DEFAULT_ACCOUNTS, TRUONG_HUNG_REAL_AVATAR } from '@/config/auth';

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
  accounts: UserAccount[];
  currency: CurrencyCode;
  settings: SiteSettings;
  setCurrency: (c: CurrencyCode) => void;
  formatPrice: (priceUSD: number, customCurrency?: CurrencyCode) => string;
  addProperty: (property: Omit<Property, 'id' | 'code' | 'rating' | 'reviewsCount' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  restoreProperty: (id: string) => void;
  permanentDeleteProperty: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'reference' | 'createdAt'>) => string;
  updateBookingStatus: (id: string, status: Booking['status']) => void;
  archiveBooking: (id: string) => void;
  restoreBooking: (id: string) => void;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;
  sendChatMessage: (msg: Omit<ChatMessage, 'id' | 'createdAt'>) => void;
  markConversationRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  addReview: (review: Omit<PropertyReview, 'id' | 'createdAt'>) => void;
  replyToReview: (reviewId: string, adminReply: string) => void;
  deleteReview: (reviewId: string) => void;
  restoreReview: (reviewId: string) => void;
  permanentDeleteReview: (reviewId: string) => void;
  getReviewEligibility: (
    propertyId: string,
    propertyCode: string,
    user?: { id?: string; email?: string; phone?: string | null; name?: string } | null
  ) => ReviewEligibility;
  migrateConversationId: (oldConvId: string, newConvId: string) => void;
  updateAccountRole: (email: string, role: UserRole) => void;
  addOrUpdateAccount: (acc: Partial<UserAccount> & { email: string; name: string }) => void;
  deleteAccount: (email: string) => void;
  toggleAccountSuspension: (email: string) => void;
  permanentDeleteAccount: (email: string) => void;
  wishlistIds: string[];
  toggleWishlist: (propertyId: string) => void;
  isWishlisted: (propertyId: string) => boolean;
  clearWishlist: () => void;
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
    p.id.startsWith('prop-eu-') ||
    p.id === 'prop-1793248830043' ||
    (p.code === 'CT-102' && p.title === '2')
  ) {
    return false;
  }
  return true;
}

function isRealUserBooking(b: Booking): boolean {
  if (!b || !b.id) return false;
  if (
    b.id === 'lead-1' ||
    b.id === 'lead-2' ||
    b.id === 'lead-3' ||
    b.id === 'book-1793248971531' ||
    b.propertyCode === 'CT-102'
  ) {
    return false;
  }
  return true;
}

// Cơ chế khóa bảo vệ chống xung đột Real-time (Optimistic Mutation Lock & Persistent Tombstones)
// Ngăn ngừa triệt để hiện tượng dữ liệu nhảy lên nhảy xuống (flapping) giữa xóa và tồn tại
const recentLocalMutations = new Map<string, number>();
const recentlyPermanentlyDeleted = new Map<string, number>();

function getPersistentSet(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? new Set(arr) : new Set();
  } catch {
    return new Set();
  }
}

function savePersistentSet(key: string, set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(set)));
  } catch {}
}

const KEY_DELETED_PROPS = 'unistay_tombstone_deleted_props';
const KEY_ARCHIVED_BOOKINGS = 'unistay_tombstone_archived_bookings';
const KEY_DELETED_REVIEWS = 'unistay_tombstone_deleted_reviews';
const KEY_SUSPENDED_ACCOUNTS = 'unistay_tombstone_suspended_accounts';
const KEY_PERMANENT_DELETED = 'unistay_tombstone_permanent_deleted';
const KEY_ADMIN_REPLIES = 'unistay_tombstone_admin_replies';

function recordLocalMutation(id: string) {
  if (id) recentLocalMutations.set(id.trim().toLowerCase(), Date.now());
}

function isRecentlyMutated(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  const t = recentLocalMutations.get(cleanId);
  if (!t) return false;
  if (Date.now() - t < 12000) return true; // Giữ 12s sau khi người dùng vừa thao tác
  recentLocalMutations.delete(cleanId);
  return false;
}

function recordPermanentDelete(id: string) {
  if (id) {
    const cleanId = id.trim().toLowerCase();
    recentlyPermanentlyDeleted.set(cleanId, Date.now());
    const permSet = getPersistentSet(KEY_PERMANENT_DELETED);
    permSet.add(cleanId);
    savePersistentSet(KEY_PERMANENT_DELETED, permSet);
  }
}

function isPermanentlyDeleted(id: string): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  if (recentlyPermanentlyDeleted.has(cleanId)) return true;
  const permSet = getPersistentSet(KEY_PERMANENT_DELETED);
  return permSet.has(cleanId);
}

function markTombstone(
  type: 'prop' | 'booking' | 'review' | 'account',
  id: string,
  action: 'delete' | 'restore' | 'permanent'
) {
  if (!id) return;
  const cleanId = id.trim().toLowerCase();

  if (action === 'permanent') {
    recordPermanentDelete(cleanId);
    return;
  }

  recordLocalMutation(cleanId);

  let key = '';
  if (type === 'prop') key = KEY_DELETED_PROPS;
  else if (type === 'booking') key = KEY_ARCHIVED_BOOKINGS;
  else if (type === 'review') key = KEY_DELETED_REVIEWS;
  else if (type === 'account') key = KEY_SUSPENDED_ACCOUNTS;

  if (!key) return;
  const set = getPersistentSet(key);
  if (action === 'delete') {
    set.add(cleanId);
  } else {
    set.delete(cleanId);
  }
  savePersistentSet(key, set);
}

function isTombstonedDeleted(
  type: 'prop' | 'booking' | 'review' | 'account',
  id: string
): boolean {
  if (!id) return false;
  const cleanId = id.trim().toLowerCase();
  let key = '';
  if (type === 'prop') key = KEY_DELETED_PROPS;
  else if (type === 'booking') key = KEY_ARCHIVED_BOOKINGS;
  else if (type === 'review') key = KEY_DELETED_REVIEWS;
  else if (type === 'account') key = KEY_SUSPENDED_ACCOUNTS;
  if (!key) return false;
  return getPersistentSet(key).has(cleanId);
}

function saveAdminReplyTombstone(reviewId: string, reply: string) {
  if (typeof window === 'undefined' || !reviewId) return;
  try {
    const raw = localStorage.getItem(KEY_ADMIN_REPLIES);
    const map = raw ? JSON.parse(raw) : {};
    if (!reply) {
      delete map[reviewId];
    } else {
      map[reviewId] = reply;
    }
    localStorage.setItem(KEY_ADMIN_REPLIES, JSON.stringify(map));
  } catch {}
}

function getAdminReplyTombstone(reviewId: string): string | undefined {
  if (typeof window === 'undefined' || !reviewId) return undefined;
  try {
    const raw = localStorage.getItem(KEY_ADMIN_REPLIES);
    if (!raw) return undefined;
    const map = JSON.parse(raw);
    return map[reviewId];
  } catch {
    return undefined;
  }
}

function mergeProperties(prev: Property[], incoming: Property[]): Property[] {
  if (!incoming || incoming.length === 0) return prev;
  const map = new Map<string, Property>();
  prev.forEach((p) => {
    if (p && p.id && !isPermanentlyDeleted(p.id)) {
      map.set(p.id, p);
    }
  });
  incoming.forEach((p) => {
    if (p && p.id && !isPermanentlyDeleted(p.id)) {
      const existing = map.get(p.id);
      const isDeletedTombstone = isTombstonedDeleted('prop', p.id);
      const effectiveDeleted = isDeletedTombstone || (existing ? Boolean(existing.isDeleted) : Boolean(p.isDeleted));

      if (!existing) {
        map.set(p.id, {
          ...p,
          isDeleted: effectiveDeleted
        });
      } else {
        if (isRecentlyMutated(p.id)) {
          // Ưu tiên trạng thái vừa thao tác (khôi phục/xóa mềm) trên client, không để server polling ghi đè ngược lại
          map.set(p.id, {
            ...p,
            isDeleted: existing.isDeleted,
            deletedAt: existing.deletedAt,
            updatedAt: existing.updatedAt || Date.now()
          });
        } else {
          const prevTime = existing.updatedAt || 0;
          const incomingTime = p.updatedAt || 0;
          if (prevTime > incomingTime) {
            map.set(p.id, {
              ...existing,
              isDeleted: effectiveDeleted
            });
          } else {
            map.set(p.id, {
              ...existing,
              ...p,
              isDeleted: effectiveDeleted
            });
          }
        }
      }
    }
  });
  return Array.from(map.values());
}

function mergeMessages(prev: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
  if (!incoming || incoming.length === 0) return prev;
  const map = new Map<string, ChatMessage>();
  prev.forEach((m) => {
    if (m && m.id) map.set(m.id, m);
  });
  incoming.forEach((m) => {
    if (m && m.id) {
      const existing = map.get(m.id);
      map.set(m.id, existing ? { ...existing, ...m } : m);
    }
  });
  return Array.from(map.values());
}

function mergeBookings(prev: Booking[], incoming: Booking[]): Booking[] {
  if (!incoming || incoming.length === 0) return prev;
  const map = new Map<string, Booking>();
  prev.forEach((b) => {
    if (b && b.id && !isPermanentlyDeleted(b.id)) {
      map.set(b.id, b);
    }
  });
  incoming.forEach((b) => {
    if (b && b.id && !isPermanentlyDeleted(b.id)) {
      const existing = map.get(b.id);
      const isArchivedTombstone = isTombstonedDeleted('booking', b.id);
      const effectiveArchived = isArchivedTombstone || (existing ? Boolean(existing.isArchived) : Boolean(b.isArchived));

      if (!existing) {
        map.set(b.id, {
          ...b,
          isArchived: effectiveArchived
        });
      } else {
        if (isRecentlyMutated(b.id)) {
          map.set(b.id, {
            ...b,
            isArchived: existing.isArchived,
            archivedAt: existing.archivedAt
          });
        } else {
          map.set(b.id, {
            ...existing,
            ...b,
            isArchived: effectiveArchived
          });
        }
      }
    }
  });
  return Array.from(map.values());
}

function mergeReviews(prev: PropertyReview[], incoming: PropertyReview[]): PropertyReview[] {
  if (!incoming || incoming.length === 0) return prev;
  const map = new Map<string, PropertyReview>();
  prev.forEach((r) => {
    if (r && r.id && !isPermanentlyDeleted(r.id)) {
      map.set(r.id, r);
    }
  });
  incoming.forEach((r) => {
    if (r && r.id && !isPermanentlyDeleted(r.id)) {
      const existing = map.get(r.id);
      const isDeletedTombstone = isTombstonedDeleted('review', r.id);
      const savedReply = getAdminReplyTombstone(r.id);
      const effectiveAdminReply = r.adminReply || existing?.adminReply || savedReply;
      const effectiveDeleted = isDeletedTombstone || (existing ? Boolean(existing.isDeleted) : Boolean(r.isDeleted));

      if (!existing) {
        map.set(r.id, {
          ...r,
          isDeleted: effectiveDeleted,
          adminReply: effectiveAdminReply
        });
      } else {
        if (isRecentlyMutated(r.id)) {
          map.set(r.id, {
            ...r,
            isDeleted: existing.isDeleted,
            deletedAt: existing.deletedAt,
            adminReply: existing.adminReply || effectiveAdminReply
          });
        } else {
          map.set(r.id, {
            ...existing,
            ...r,
            isDeleted: effectiveDeleted,
            adminReply: effectiveAdminReply
          });
        }
      }
    }
  });
  return Array.from(map.values());
}

function sanitizeAccountAvatar(acc: UserAccount): UserAccount {
  const cleanEmail = acc.email?.toLowerCase().trim();
  if (
    cleanEmail === 'truongvantuan43344@gmail.com' &&
    (!acc.avatar || acc.avatar.includes('photo-1534528741775') || acc.avatar.includes('unsplash') || acc.avatar.includes('ACg8ocLcJeUqcDC3Ka0yx4uDj5bjHvCuaOX-4di4830y2-VhEkoYR7I'))
  ) {
    return {
      ...acc,
      avatar: TRUONG_HUNG_REAL_AVATAR
    };
  }
  // Loại bỏ hoàn toàn ảnh stock Unsplash giả cho các tài khoản
  if (acc.avatar && (acc.avatar.includes('unsplash.com') || acc.avatar.includes('photo-1573496359142'))) {
    return {
      ...acc,
      avatar: null
    };
  }
  return acc;
}

function mergeAccounts(prev: UserAccount[], incoming: UserAccount[]): UserAccount[] {
  if (!incoming || incoming.length === 0) return prev.map(sanitizeAccountAvatar);
  const map = new Map<string, UserAccount>();
  prev.forEach((a) => {
    if (a && a.email && !isPermanentlyDeleted(a.email)) {
      map.set(a.email.toLowerCase().trim(), sanitizeAccountAvatar(a));
    }
  });
  incoming.forEach((a) => {
    if (a && a.email && !isPermanentlyDeleted(a.email)) {
      const cleanAcc = sanitizeAccountAvatar(a);
      const key = cleanAcc.email.toLowerCase().trim();
      const existing = map.get(key);
      const isSuspendedTombstone = isTombstonedDeleted('account', key);
      const effectiveSuspended = isSuspendedTombstone || (existing ? Boolean(existing.isSuspended) : Boolean(cleanAcc.isSuspended));

      if (!existing) {
        map.set(key, {
          ...cleanAcc,
          isSuspended: effectiveSuspended
        });
      } else {
        if (isRecentlyMutated(key)) {
          map.set(key, {
            ...cleanAcc,
            isSuspended: existing.isSuspended,
            suspendedAt: existing.suspendedAt
          });
        } else {
          map.set(key, {
            ...existing,
            ...cleanAcc,
            avatar: cleanAcc.avatar || existing.avatar,
            isSuspended: effectiveSuspended
          });
        }
      }
    }
  });
  return Array.from(map.values()).map(sanitizeAccountAvatar);
}

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<PropertyReview[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>(DEFAULT_ACCOUNTS);
  const [myBookingIds, setMyBookingIds] = useState<string[]>([]);
  const [currency, setCurrencyState] = useState<CurrencyCode>('VND');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem('unistay_wishlist_ids');
      if (savedWishlist) {
        const parsed = JSON.parse(savedWishlist);
        if (Array.isArray(parsed)) setWishlistIds(parsed);
      }
    } catch {}
  }, []);

  const toggleWishlist = (propertyId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(propertyId);
      const updated = exists ? prev.filter((id) => id !== propertyId) : [...prev, propertyId];
      try {
        localStorage.setItem('unistay_wishlist_ids', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const isWishlisted = (propertyId: string): boolean => {
    return wishlistIds.includes(propertyId);
  };

  const clearWishlist = () => {
    setWishlistIds([]);
    try {
      localStorage.removeItem('unistay_wishlist_ids');
    } catch {}
  };

  useEffect(() => {
    try {
      const savedIds = localStorage.getItem('unistay_my_booking_ids');
      if (savedIds) {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) setMyBookingIds(parsed);
      }
      const savedMessages = localStorage.getItem('unistay_real_messages_v4');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed);
      }
      const savedBookings = localStorage.getItem('unistay_real_bookings_v4');
      if (savedBookings) {
        const parsed = JSON.parse(savedBookings);
        if (Array.isArray(parsed) && parsed.length > 0) setBookings(parsed);
      }
      const savedReviews = localStorage.getItem('unistay_real_reviews_v4');
      if (savedReviews) {
        const parsed = JSON.parse(savedReviews);
        if (Array.isArray(parsed) && parsed.length > 0) setReviews(parsed);
      }
      const savedAccounts = localStorage.getItem('unistay_real_accounts_v4');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map(sanitizeAccountAvatar);
          setAccounts((prev) => mergeAccounts(prev, sanitized));
          try {
            localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(sanitized));
          } catch {}
        }
      }
      const savedProps = localStorage.getItem('unistay_real_properties_v4');
      if (savedProps) {
        const parsed = JSON.parse(savedProps);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProperties(parsed.filter(isRealAdminProperty));
        }
      }
    } catch {}
  }, []);

  const syncToServer = async (payload: {
    properties?: Property[];
    bookings?: Booking[];
    messages?: ChatMessage[];
    reviews?: PropertyReview[];
    accounts?: UserAccount[];
    settings?: SiteSettings;
  }) => {
    // 1. Đồng bộ Real-Time tức thì đa tab/cửa sổ qua BroadcastChannel
    try {
      const channel = new BroadcastChannel('unistay_realtime_sync');
      channel.postMessage({ type: 'SYNC_UPDATE', payload });
      channel.close();
    } catch {}

    // 2. Lưu trữ lên Server API
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

    // Dọn sạch các key cache cũ
    try {
      localStorage.removeItem('unistay_properties');
      localStorage.removeItem('unistay_vn_properties_v2');
      localStorage.removeItem('unistay_vn_properties_v3');
      localStorage.removeItem('unistay_vn_bookings_v3');
    } catch {}

    fetch(`/api/store?t=${Date.now()}`, { cache: 'no-store' })
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
        const serverAccounts: UserAccount[] = Array.isArray(serverState.accounts)
          ? serverState.accounts
          : DEFAULT_ACCOUNTS;

        const finalProps = serverProps.map((p) => {
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
        setProperties((prev) => mergeProperties(prev, finalProps));
        setBookings((prev) => mergeBookings(prev, serverBookings));
        setMessages((prev) => mergeMessages(prev, serverMessages));
        setReviews((prev) => mergeReviews(prev, serverReviews));
        setAccounts((prev) => {
          const merged = mergeAccounts(prev, serverAccounts);
          try {
            localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(merged));
          } catch {}
          return merged;
        });
        if (serverState.settings) setSettings(serverState.settings);

        try {
          localStorage.setItem('unistay_real_properties_v4', JSON.stringify(finalProps));
          localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(serverBookings));
          localStorage.setItem('unistay_real_messages_v4', JSON.stringify(serverMessages));
          localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(serverReviews));
        } catch {}
      })
      .catch(() => {});

    // 1. Kênh BroadcastChannel đồng bộ tức thì giữa các tab/cửa sổ (SignalR-style browser mesh)
    let syncChannel: BroadcastChannel | null = null;
    try {
      syncChannel = new BroadcastChannel('unistay_realtime_sync');
      syncChannel.onmessage = (event) => {
        if (event.data?.type === 'SYNC_UPDATE' && event.data?.payload) {
          const p = event.data.payload;
          if (Array.isArray(p.properties) && p.properties.length > 0) setProperties((prev) => mergeProperties(prev, p.properties));
          if (Array.isArray(p.bookings) && p.bookings.length > 0) {
            setBookings((prev) => mergeBookings(prev, p.bookings));
          }
          if (Array.isArray(p.messages)) {
            setMessages((prev) => mergeMessages(prev, p.messages));
          }
          if (Array.isArray(p.reviews)) {
            setReviews((prev) => mergeReviews(prev, p.reviews));
          }
          if (Array.isArray(p.accounts)) {
            setAccounts((prev) => mergeAccounts(prev, p.accounts));
          }
          if (p.settings) setSettings(p.settings);
        }
      };
    } catch {}

    // 2. Kết nối Real-Time Stream (SSE / SignalR-style push) với cơ chế tự phục hồi
    let eventSource: EventSource | null = null;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    const setupEventSource = () => {
      if (typeof window === 'undefined' || !('EventSource' in window)) return;
      try {
        eventSource = new EventSource('/api/stream');
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (Array.isArray(data.properties) && data.properties.length > 0) {
              const cleanProps = data.properties.filter(isRealAdminProperty);
              setProperties((prev) => {
                const merged = mergeProperties(prev, cleanProps);
                try {
                  localStorage.setItem('unistay_real_properties_v4', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
            if (Array.isArray(data.bookings) && data.bookings.length > 0) {
              const cleanBookings = data.bookings.filter(isRealUserBooking);
              setBookings((prev) => {
                const merged = mergeBookings(prev, cleanBookings);
                try {
                  localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
            if (Array.isArray(data.messages)) {
              setMessages((prev) => {
                const merged = mergeMessages(prev, data.messages);
                try {
                  localStorage.setItem('unistay_real_messages_v4', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
            if (Array.isArray(data.reviews)) {
              setReviews((prev) => {
                const merged = mergeReviews(prev, data.reviews);
                try {
                  localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
            if (Array.isArray(data.accounts)) {
              setAccounts((prev) => {
                const merged = mergeAccounts(prev, data.accounts);
                try {
                  localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(merged));
                } catch {}
                return merged;
              });
            }
            if (data.settings) {
              setSettings(data.settings);
            }
          } catch {}
        };

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Tự động kết nối lại sau 1.5 giây nếu bị ngắt kết nối
          setTimeout(() => {
            if (isMounted) setupEventSource();
          }, 1500);
        };
      } catch {}
    };

    setupEventSource();

    // 3. Fallback polling dự phòng mỗi 2.5 giây để phản hồi siêu tốc giữa các thiết bị
    pollInterval = setInterval(() => {
      if (!isMounted) return;
      fetch(`/api/store?t=${Date.now()}`, { cache: 'no-store' })
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted || !data) return;
          if (Array.isArray(data.properties) && data.properties.length > 0) {
            const cleanProps = data.properties.filter(isRealAdminProperty);
            setProperties((prev) => {
              const merged = mergeProperties(prev, cleanProps);
              try {
                localStorage.setItem('unistay_real_properties_v4', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (Array.isArray(data.bookings) && data.bookings.length > 0) {
            const cleanBookings = data.bookings.filter(isRealUserBooking);
            setBookings((prev) => {
              const merged = mergeBookings(prev, cleanBookings);
              try {
                localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (Array.isArray(data.messages)) {
            setMessages((prev) => {
              const merged = mergeMessages(prev, data.messages);
              try {
                localStorage.setItem('unistay_real_messages_v4', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (Array.isArray(data.reviews)) {
            setReviews((prev) => {
              const merged = mergeReviews(prev, data.reviews);
              try {
                localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (Array.isArray(data.accounts)) {
            setAccounts((prev) => {
              const merged = mergeAccounts(prev, data.accounts);
              try {
                localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(merged));
              } catch {}
              return merged;
            });
          }
          if (data.settings) setSettings(data.settings);
        })
        .catch(() => {});
    }, 2500);

    return () => {
      isMounted = false;
      if (syncChannel) syncChannel.close();
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
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
    // Xóa mềm: đánh dấu isDeleted = true để có thể khôi phục từ thùng rác
    markTombstone('prop', id, 'delete');
    setProperties((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isDeleted: true, deletedAt: new Date().toISOString(), updatedAt: Date.now() } : p
      );
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ properties: updated });
      return updated;
    });
  };

  const restoreProperty = (id: string) => {
    // Khôi phục phòng trọ từ thùng rác về trạng thái hoạt động bình thường
    markTombstone('prop', id, 'restore');
    setProperties((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isDeleted: false, deletedAt: undefined, updatedAt: Date.now() } : p
      );
      try {
        localStorage.setItem('unistay_real_properties_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ properties: updated });
      return updated;
    });
  };

  const permanentDeleteProperty = (id: string) => {
    // Xóa vĩnh viễn (xóa cứng) khỏi toàn bộ hệ thống
    markTombstone('prop', id, 'permanent');
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

  const archiveBooking = (id: string) => {
    // Xóa mềm / Lưu trữ đơn cọc: ẩn khỏi bảng duyệt nhưng giữ nguyên dữ liệu kế toán
    markTombstone('booking', id, 'delete');
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === id ? { ...b, isArchived: true, archivedAt: new Date().toISOString() } : b
      );
      try {
        localStorage.setItem('unistay_real_bookings_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ bookings: updated });
      return updated;
    });
  };

  const restoreBooking = (id: string) => {
    // Khôi phục đơn cọc về lại danh sách duyệt bình thường
    markTombstone('booking', id, 'restore');
    setBookings((prev) => {
      const updated = prev.map((b) =>
        b.id === id ? { ...b, isArchived: false, archivedAt: undefined } : b
      );
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

  const migrateConversationId = (oldConvId: string, newConvId: string) => {
    if (!oldConvId || !newConvId || oldConvId === newConvId) return;
    setMessages((prev) => {
      let hasChanges = false;
      const updated = prev.map((m) => {
        if (m.conversationId === oldConvId) {
          hasChanges = true;
          return { ...m, conversationId: newConvId };
        }
        return m;
      });
      if (!hasChanges) return prev;
      try {
        localStorage.setItem('unistay_real_messages_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ messages: updated });
      return updated;
    });
  };

  const recalculatePropertyRating = (propertyId: string, allReviews: PropertyReview[]) => {
    let matchingProperty: Property | undefined;
    setProperties((prevProps) => {
      matchingProperty = prevProps.find(
        (p) => p.id === propertyId || p.code === propertyId || p.slug === propertyId
      );
      return prevProps;
    });

    const propReviews = allReviews.filter((r) => {
      if (r.isDeleted) return false;
      if (r.propertyId === propertyId) return true;
      if (matchingProperty) {
        if (matchingProperty.code && (r.propertyCode === matchingProperty.code || r.propertyId === matchingProperty.code)) return true;
        if (matchingProperty.slug && r.propertyId === matchingProperty.slug) return true;
        if (matchingProperty.id && r.propertyId === matchingProperty.id) return true;
      }
      return false;
    });

    const count = propReviews.length;
    const avg =
      count > 0
        ? Number(
            (propReviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
          )
        : 0;

    setProperties((prevProps) => {
      const updatedProps = prevProps.map((p) =>
        p.id === propertyId || (matchingProperty && p.id === matchingProperty.id)
          ? { ...p, rating: avg, reviewsCount: count, updatedAt: Date.now() }
          : p
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
    const trimmed = adminReply.trim();
    saveAdminReplyTombstone(reviewId, trimmed);
    recordLocalMutation(reviewId);
    setReviews((prev) => {
      const updated = prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              adminReply: trimmed || undefined,
              repliedAt: trimmed ? new Date().toISOString() : undefined
            }
          : r
      );
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ reviews: updated });
      return updated;
    });
  };

  const deleteReview = (reviewId: string) => {
    // Xóa mềm đánh giá (ẩn khỏi trang người dùng)
    markTombstone('review', reviewId, 'delete');
    setReviews((prev) => {
      const updated = prev.map((r) =>
        r.id === reviewId ? { ...r, isDeleted: true, deletedAt: new Date().toISOString() } : r
      );
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      const target = prev.find((r) => r.id === reviewId);
      if (target) {
        recalculatePropertyRating(target.propertyId, updated);
      } else {
        syncToServer({ reviews: updated });
      }
      return updated;
    });
  };

  const restoreReview = (reviewId: string) => {
    // Khôi phục đánh giá bị ẩn
    markTombstone('review', reviewId, 'restore');
    setReviews((prev) => {
      const updated = prev.map((r) =>
        r.id === reviewId ? { ...r, isDeleted: false, deletedAt: undefined } : r
      );
      try {
        localStorage.setItem('unistay_real_reviews_v4', JSON.stringify(updated));
      } catch {}
      const target = prev.find((r) => r.id === reviewId);
      if (target) {
        recalculatePropertyRating(target.propertyId, updated);
      } else {
        syncToServer({ reviews: updated });
      }
      return updated;
    });
  };

  const permanentDeleteReview = (reviewId: string) => {
    // Xóa vĩnh viễn đánh giá
    markTombstone('review', reviewId, 'permanent');
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

  // Auto-sync discovered accounts from bookings, messages, and registered users into accounts
  useEffect(() => {
    setAccounts((prev) => {
      let changed = false;
      const currentMap = new Map<string, UserAccount>();
      prev.forEach((a) => {
        if (a && a.email) currentMap.set(a.email.toLowerCase().trim(), a);
      });

      // From bookings
      bookings.forEach((b) => {
        const email = b.studentEmail?.toLowerCase().trim();
        if (email && !currentMap.has(email)) {
          currentMap.set(email, {
            id: `acc-${email.replace(/[^a-z0-9]/g, '')}`,
            email,
            name: b.studentName || email.split('@')[0],
            role: 'student',
            phone: b.studentContact || null,
            college: b.college || null,
            createdAt: b.createdAt || new Date().toISOString(),
            lastLoginAt: b.createdAt
          });
          changed = true;
        }
      });

      // From messages
      messages.forEach((m) => {
        const email = m.studentEmail?.toLowerCase().trim();
        if (email && !currentMap.has(email)) {
          currentMap.set(email, {
            id: `acc-${email.replace(/[^a-z0-9]/g, '')}`,
            email,
            name: m.studentName || email.split('@')[0],
            role: 'student',
            createdAt: m.createdAt || new Date().toISOString()
          });
          changed = true;
        }
      });

      // From registered users in localStorage
      try {
        const rawRegistered = localStorage.getItem('unistay_registered_users');
        if (rawRegistered) {
          const registered = JSON.parse(rawRegistered);
          if (Array.isArray(registered)) {
            registered.forEach((u: any) => {
              const email = u.email?.toLowerCase().trim();
              if (email && !currentMap.has(email)) {
                currentMap.set(email, {
                  id: `acc-${email.replace(/[^a-z0-9]/g, '')}`,
                  email,
                  name: u.name || email.split('@')[0],
                  role: u.role || 'student',
                  createdAt: new Date().toISOString()
                });
                changed = true;
              }
            });
          }
        }
      } catch {}

      if (!changed) return prev;
      const nextAccounts = Array.from(currentMap.values());
      try {
        localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(nextAccounts));
      } catch {}
      syncToServer({ accounts: nextAccounts });
      return nextAccounts;
    });
  }, [bookings, messages]);

  const updateAccountRole = (email: string, newRole: UserRole) => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail) return;

    if (cleanEmail === 'truongvantuan43344@gmail.com' && newRole !== 'admin') {
      alert('Không thể hạ quyền Quản trị viên tối cao (Super Admin)!');
      return;
    }

    setAccounts((prev) => {
      const exists = prev.some((a) => a.email.toLowerCase().trim() === cleanEmail);
      let updated: UserAccount[];
      if (exists) {
        updated = prev.map((a) =>
          a.email.toLowerCase().trim() === cleanEmail
            ? { ...a, role: newRole, isStaffAssigned: newRole === 'staff' }
            : a
        );
      } else {
        updated = [
          ...prev,
          {
            id: `acc-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
            email: cleanEmail,
            name: cleanEmail.split('@')[0],
            role: newRole,
            createdAt: new Date().toISOString(),
            isStaffAssigned: newRole === 'staff'
          }
        ];
      }

      try {
        const raw = localStorage.getItem('unistay_assigned_roles');
        const map = raw ? JSON.parse(raw) : {};
        map[cleanEmail] = newRole;
        localStorage.setItem('unistay_assigned_roles', JSON.stringify(map));
        localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(updated));
      } catch {}

      try {
        const authChan = new BroadcastChannel('unistay_auth_channel');
        authChan.postMessage({
          type: 'ROLE_UPDATED',
          email: cleanEmail,
          role: newRole
        });
        authChan.close();
      } catch {}

      syncToServer({ accounts: updated });
      return updated;
    });
  };

  const addOrUpdateAccount = (acc: Partial<UserAccount> & { email: string; name?: string }) => {
    const cleanEmail = acc.email.toLowerCase().trim();
    if (!cleanEmail) return;

    let targetRole: UserRole = acc.role || 'staff';

    setAccounts((prev) => {
      const existing = prev.find((a) => a.email.toLowerCase().trim() === cleanEmail);
      targetRole = acc.role || existing?.role || 'staff';
      let updated: UserAccount[];
      if (existing) {
        updated = prev.map((a) =>
          a.email.toLowerCase().trim() === cleanEmail
            ? sanitizeAccountAvatar({
                ...a,
                name: acc.name?.trim() || a.name,
                role: targetRole,
                phone: acc.phone !== undefined ? acc.phone : a.phone,
                college: acc.college !== undefined ? acc.college : a.college,
                avatar: acc.avatar !== undefined ? acc.avatar : a.avatar,
                isStaffAssigned: acc.role ? targetRole === 'staff' : a.isStaffAssigned
              })
            : a
        );
      } else {
        const newAcc: UserAccount = sanitizeAccountAvatar({
          id: `acc-${Date.now()}`,
          email: cleanEmail,
          name: (acc.name || cleanEmail.split('@')[0]).trim(),
          role: targetRole,
          phone: acc.phone?.trim() || null,
          college: acc.college?.trim() || null,
          avatar: acc.avatar || null,
          createdAt: new Date().toISOString(),
          isStaffAssigned: targetRole === 'staff'
        });
        updated = [newAcc, ...prev];
      }

      try {
        const raw = localStorage.getItem('unistay_assigned_roles');
        const map = raw ? JSON.parse(raw) : {};
        map[cleanEmail] = targetRole;
        localStorage.setItem('unistay_assigned_roles', JSON.stringify(map));
        localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(updated));
      } catch {}

      try {
        const authChan = new BroadcastChannel('unistay_auth_channel');
        authChan.postMessage({
          type: 'ROLE_UPDATED',
          email: cleanEmail,
          role: targetRole
        });
        authChan.close();
      } catch {}

      syncToServer({ accounts: updated });
      return updated;
    });
  };

  const toggleAccountSuspension = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'truongvantuan43344@gmail.com' || cleanEmail === 'admin@unistay.com') {
      alert('Không thể khóa tài khoản Quản trị viên cấp cao!');
      return;
    }

    setAccounts((prev) => {
      const target = prev.find((a) => a.email.toLowerCase().trim() === cleanEmail);
      const nextSuspended = target ? !target.isSuspended : true;
      markTombstone('account', cleanEmail, nextSuspended ? 'delete' : 'restore');

      const updated = prev.map((a) =>
        a.email.toLowerCase().trim() === cleanEmail
          ? {
              ...a,
              isSuspended: nextSuspended,
              suspendedAt: nextSuspended ? new Date().toISOString() : undefined
            }
          : a
      );
      try {
        localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(updated));
      } catch {}
      syncToServer({ accounts: updated });
      return updated;
    });
  };

  const deleteAccount = (email: string) => {
    // Xóa mềm: đánh dấu vô hiệu hóa/khóa tài khoản
    toggleAccountSuspension(email);
  };

  const permanentDeleteAccount = (email: string) => {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'truongvantuan43344@gmail.com' || cleanEmail === 'admin@unistay.com') {
      alert('Không thể xóa tài khoản Quản trị viên cấp cao!');
      return;
    }
    markTombstone('account', cleanEmail, 'permanent');

    setAccounts((prev) => {
      const updated = prev.filter((a) => a.email.toLowerCase().trim() !== cleanEmail);
      try {
        localStorage.setItem('unistay_real_accounts_v4', JSON.stringify(updated));
        const raw = localStorage.getItem('unistay_assigned_roles');
        if (raw) {
          const map = JSON.parse(raw);
          delete map[cleanEmail];
          localStorage.setItem('unistay_assigned_roles', JSON.stringify(map));
        }
      } catch {}
      syncToServer({ accounts: updated });
      return updated;
    });
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        bookings,
        messages,
        reviews,
        accounts,
        currency,
        settings,
        setCurrency,
        formatPrice,
        addProperty,
        updateProperty,
        deleteProperty,
        restoreProperty,
        permanentDeleteProperty,
        addBooking,
        updateBookingStatus,
        archiveBooking,
        restoreBooking,
        updateSettings,
        sendChatMessage,
        markConversationRead,
        deleteConversation,
        addReview,
        replyToReview,
        deleteReview,
        restoreReview,
        permanentDeleteReview,
        getReviewEligibility,
        migrateConversationId,
        updateAccountRole,
        addOrUpdateAccount,
        deleteAccount,
        toggleAccountSuspension,
        permanentDeleteAccount,
        wishlistIds,
        toggleWishlist,
        isWishlisted,
        clearWishlist
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
