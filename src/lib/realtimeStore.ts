import fs from 'fs';
import path from 'path';
import { Property, Booking, SiteSettings, ChatMessage, PropertyReview, UserAccount } from '@/types';
import { siteConfig } from '@/config/site';
import { DEFAULT_ACCOUNTS } from '@/config/auth';

export interface RealtimeTombstones {
  properties: string[];
  reviews: string[];
  bookings: string[];
  accounts: string[];
}

export interface RealtimeState {
  properties: Property[];
  bookings: Booking[];
  messages: ChatMessage[];
  reviews: PropertyReview[];
  accounts: UserAccount[];
  settings: SiteSettings;
  tombstones: RealtimeTombstones;
  updatedAt: number;
}

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: siteConfig.name,
  tagline: siteConfig.tagline,
  defaultCurrency: 'VND',
  supportWhatsApp: '0901234567',
  supportEmail: 'contact@unistay.vn',
  supportHotline: '0901234567',
  vietQrBankName: 'Techcombank',
  vietQrBankCode: '970407',
  vietQrAccountNumber: '19074816556011',
  vietQrAccountHolder: 'TRUONG VAN TUAN',
  razorpayKeyId: '',
  stripePublishableKey: '',
  defaultTokenUSD: 20,
  holdHours: 48
};

const DEFAULT_TOMBSTONES: RealtimeTombstones = {
  properties: [],
  reviews: ['rev-ctu-101-seed'],
  bookings: [],
  accounts: []
};

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = IS_VERCEL ? '/tmp/unistay-data' : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'realtime-db.json');
const SEED_FILE = path.join(process.cwd(), 'src', 'data', 'seed-store.json');

type Listener = (state: RealtimeState) => void;

declare global {
  var __unistayRealtimeState: RealtimeState | undefined;
  var __unistayListeners: Set<Listener> | undefined;
}

function getListeners(): Set<Listener> {
  if (!globalThis.__unistayListeners) {
    globalThis.__unistayListeners = new Set<Listener>();
  }
  return globalThis.__unistayListeners;
}

function isSamplePropertyId(id: string): boolean {
  return (
    id.startsWith('prop-vn-') ||
    id.startsWith('prop-in-') ||
    id.startsWith('prop-eu-') ||
    id === 'prop-1793248830043' ||
    id === 'prop-sample'
  );
}

function isSampleBookingId(id: string): boolean {
  return (
    id === 'lead-1' ||
    id === 'lead-2' ||
    id === 'lead-3' ||
    id === 'book-1793248971531'
  );
}

function mergePropertiesServer(
  current: Property[],
  incoming?: Property[],
  tombstones?: string[]
): Property[] {
  const tombSet = new Set((tombstones || []).map((id) => id.toLowerCase().trim()));
  const map = new Map<string, Property>();

  (current || []).forEach((p) => {
    if (p && p.id && !tombSet.has(p.id.toLowerCase().trim()) && !isSamplePropertyId(p.id)) {
      map.set(p.id, p);
    }
  });

  if (Array.isArray(incoming)) {
    incoming.forEach((p) => {
      if (p && p.id && !tombSet.has(p.id.toLowerCase().trim()) && !isSamplePropertyId(p.id)) {
        const existing = map.get(p.id);
        if (!existing) {
          map.set(p.id, p);
        } else {
          // Merge thông tin, ưu tiên các trường cập nhật mới nhất
          map.set(p.id, {
            ...existing,
            ...p,
            rating: p.rating !== undefined ? p.rating : existing.rating,
            reviewsCount: p.reviewsCount !== undefined ? p.reviewsCount : existing.reviewsCount,
            isDeleted: p.isDeleted !== undefined ? p.isDeleted : existing.isDeleted,
            deletedAt: p.deletedAt !== undefined ? p.deletedAt : existing.deletedAt,
            updatedAt: Math.max(existing.updatedAt || 0, p.updatedAt || 0, Date.now())
          });
        }
      }
    });
  }

  return Array.from(map.values());
}

function mergeBookingsServer(
  current: Booking[],
  incoming?: Booking[],
  tombstones?: string[]
): Booking[] {
  const tombSet = new Set((tombstones || []).map((id) => id.toLowerCase().trim()));
  const map = new Map<string, Booking>();

  (current || []).forEach((b) => {
    if (b && b.id && !tombSet.has(b.id.toLowerCase().trim()) && !isSampleBookingId(b.id)) {
      map.set(b.id, b);
    }
  });

  if (Array.isArray(incoming)) {
    incoming.forEach((b) => {
      if (b && b.id && !tombSet.has(b.id.toLowerCase().trim()) && !isSampleBookingId(b.id)) {
        const existing = map.get(b.id);
        map.set(b.id, existing ? { ...existing, ...b } : b);
      }
    });
  }

  return Array.from(map.values());
}

function mergeReviewsServer(
  current: PropertyReview[],
  incoming?: PropertyReview[],
  tombstones?: string[]
): PropertyReview[] {
  const tombSet = new Set((tombstones || []).map((id) => id.toLowerCase().trim()));
  const map = new Map<string, PropertyReview>();

  (current || []).forEach((r) => {
    if (r && r.id && !tombSet.has(r.id.toLowerCase().trim())) {
      map.set(r.id, r);
    }
  });

  if (Array.isArray(incoming)) {
    incoming.forEach((r) => {
      if (r && r.id && !tombSet.has(r.id.toLowerCase().trim())) {
        const existing = map.get(r.id);
        if (!existing) {
          map.set(r.id, r);
        } else {
          map.set(r.id, {
            ...existing,
            ...r,
            isDeleted: r.isDeleted !== undefined ? r.isDeleted : existing.isDeleted,
            deletedAt: r.deletedAt !== undefined ? r.deletedAt : existing.deletedAt,
            adminReply: r.adminReply !== undefined ? r.adminReply : existing.adminReply,
            repliedAt: r.repliedAt !== undefined ? r.repliedAt : existing.repliedAt
          });
        }
      }
    });
  }

  return Array.from(map.values());
}

function mergeMessagesServer(current: ChatMessage[], incoming?: ChatMessage[]): ChatMessage[] {
  const map = new Map<string, ChatMessage>();
  (current || []).forEach((m) => {
    if (m && m.id) map.set(m.id, m);
  });
  if (Array.isArray(incoming)) {
    incoming.forEach((m) => {
      if (m && m.id) {
        const existing = map.get(m.id);
        map.set(m.id, existing ? { ...existing, ...m } : m);
      }
    });
  }
  return Array.from(map.values());
}

function mergeAccountsServer(
  current: UserAccount[],
  incoming?: UserAccount[],
  tombstones?: string[]
): UserAccount[] {
  const tombSet = new Set((tombstones || []).map((e) => e.toLowerCase().trim()));
  const map = new Map<string, UserAccount>();

  (current || []).forEach((a) => {
    if (a && a.email && !tombSet.has(a.email.toLowerCase().trim())) {
      map.set(a.email.toLowerCase().trim(), a);
    }
  });

  if (Array.isArray(incoming)) {
    incoming.forEach((a) => {
      if (a && a.email && !tombSet.has(a.email.toLowerCase().trim())) {
        const key = a.email.toLowerCase().trim();
        const existing = map.get(key);
        if (!existing) {
          map.set(key, a);
        } else {
          map.set(key, {
            ...existing,
            ...a,
            avatar: a.avatar !== undefined ? a.avatar : existing.avatar,
            role: a.role || existing.role,
            isSuspended: a.isSuspended !== undefined ? a.isSuspended : existing.isSuspended,
            suspendedAt: a.suspendedAt !== undefined ? a.suspendedAt : existing.suspendedAt
          });
        }
      }
    });
  }

  return Array.from(map.values());
}

export function getRealtimeState(): RealtimeState {
  if (globalThis.__unistayRealtimeState) {
    return globalThis.__unistayRealtimeState;
  }

  try {
    const fileToRead = fs.existsSync(DB_FILE)
      ? DB_FILE
      : fs.existsSync(SEED_FILE)
      ? SEED_FILE
      : null;

    if (fileToRead) {
      const raw = fs.readFileSync(fileToRead, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<RealtimeState>;
      const tombstones: RealtimeTombstones = {
        properties: Array.isArray(parsed.tombstones?.properties) ? parsed.tombstones.properties : [],
        reviews: Array.isArray(parsed.tombstones?.reviews) ? parsed.tombstones.reviews : DEFAULT_TOMBSTONES.reviews,
        bookings: Array.isArray(parsed.tombstones?.bookings) ? parsed.tombstones.bookings : [],
        accounts: Array.isArray(parsed.tombstones?.accounts) ? parsed.tombstones.accounts : []
      };

      const cleaned: RealtimeState = {
        properties: mergePropertiesServer([], parsed.properties, tombstones.properties),
        bookings: mergeBookingsServer([], parsed.bookings, tombstones.bookings),
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        reviews: mergeReviewsServer([], parsed.reviews, tombstones.reviews),
        accounts: mergeAccountsServer(DEFAULT_ACCOUNTS, parsed.accounts, tombstones.accounts),
        settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
        tombstones,
        updatedAt: parsed.updatedAt || Date.now()
      };
      globalThis.__unistayRealtimeState = cleaned;
      return cleaned;
    }
  } catch {
    // ignore file read errors
  }

  const initial: RealtimeState = {
    properties: [],
    bookings: [],
    messages: [],
    reviews: [],
    accounts: DEFAULT_ACCOUNTS,
    settings: DEFAULT_SETTINGS,
    tombstones: DEFAULT_TOMBSTONES,
    updatedAt: Date.now()
  };
  globalThis.__unistayRealtimeState = initial;
  return initial;
}

export function updateRealtimeState(partial: Partial<RealtimeState>): RealtimeState {
  const current = getRealtimeState();

  // 1. Cập nhật Tombstones (các mục bị xóa vĩnh viễn)
  const nextTombstones: RealtimeTombstones = {
    properties: Array.from(
      new Set([...(current.tombstones?.properties || []), ...(partial.tombstones?.properties || [])])
    ),
    reviews: Array.from(
      new Set([...(current.tombstones?.reviews || []), ...(partial.tombstones?.reviews || [])])
    ),
    bookings: Array.from(
      new Set([...(current.tombstones?.bookings || []), ...(partial.tombstones?.bookings || [])])
    ),
    accounts: Array.from(
      new Set([...(current.tombstones?.accounts || []), ...(partial.tombstones?.accounts || [])])
    )
  };

  // 2. Hợp nhất thông minh, tránh tuyệt đối việc client cũ ghi đè làm mất dữ liệu của client mới
  const next: RealtimeState = {
    properties: mergePropertiesServer(current.properties, partial.properties, nextTombstones.properties),
    bookings: mergeBookingsServer(current.bookings, partial.bookings, nextTombstones.bookings),
    messages: mergeMessagesServer(current.messages, partial.messages),
    reviews: mergeReviewsServer(current.reviews, partial.reviews, nextTombstones.reviews),
    accounts: mergeAccountsServer(current.accounts, partial.accounts, nextTombstones.accounts),
    settings: partial.settings !== undefined ? { ...current.settings, ...partial.settings } : current.settings,
    tombstones: nextTombstones,
    updatedAt: Date.now()
  };

  globalThis.__unistayRealtimeState = next;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(next, null, 2), 'utf-8');
  } catch {
    // ignore write error on read-only serverless fs
  }

  const listeners = getListeners();
  listeners.forEach((listener) => {
    try {
      listener(next);
    } catch {}
  });

  return next;
}

export function subscribeRealtime(listener: Listener): () => void {
  const listeners = getListeners();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
