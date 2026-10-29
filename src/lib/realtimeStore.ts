import fs from 'fs';
import path from 'path';
import { Property, Booking, SiteSettings, ChatMessage } from '@/types';
import { siteConfig } from '@/config/site';

export interface RealtimeState {
  properties: Property[];
  bookings: Booking[];
  messages: ChatMessage[];
  settings: SiteSettings;
  updatedAt: number;
}

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

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'realtime-db.json');

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
    id.startsWith('prop-eu-')
  );
}

function isSampleBookingId(id: string): boolean {
  return id === 'lead-1' || id === 'lead-2' || id === 'lead-3';
}

export function getRealtimeState(): RealtimeState {
  if (globalThis.__unistayRealtimeState) {
    return globalThis.__unistayRealtimeState;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as RealtimeState;
      const cleaned: RealtimeState = {
        properties: Array.isArray(parsed.properties)
          ? parsed.properties.filter((p) => p && p.id && !isSamplePropertyId(p.id))
          : [],
        bookings: Array.isArray(parsed.bookings)
          ? parsed.bookings.filter((b) => b && b.id && !isSampleBookingId(b.id))
          : [],
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
        settings: parsed.settings || DEFAULT_SETTINGS,
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
    settings: DEFAULT_SETTINGS,
    updatedAt: Date.now()
  };
  globalThis.__unistayRealtimeState = initial;
  return initial;
}

export function updateRealtimeState(partial: Partial<Omit<RealtimeState, 'updatedAt'>>): RealtimeState {
  const current = getRealtimeState();
  const next: RealtimeState = {
    properties:
      partial.properties !== undefined
        ? partial.properties.filter((p) => p && p.id && !isSamplePropertyId(p.id))
        : current.properties,
    bookings:
      partial.bookings !== undefined
        ? partial.bookings.filter((b) => b && b.id && !isSampleBookingId(b.id))
        : current.bookings,
    messages: partial.messages !== undefined ? partial.messages : current.messages,
    settings: partial.settings !== undefined ? { ...current.settings, ...partial.settings } : current.settings,
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
