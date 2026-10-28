import { CurrencyCode } from '@/types';

export const siteConfig = {
  name: 'UniStay',
  nameAccent: 'Global',
  tagline: 'Student Housing & Co-Living Platform',
  description:
    'Discover verified student apartments, dorms, and private rooms near top universities worldwide. Zero brokerage, instant token reservation, and 24/7 verified support.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  legalName: 'UniStay Global Technologies Inc.',
  supportEmail: 'contact@unistay.app',
  supportWhatsApp: '+84901234567',
  supportHotline: '1900 6868',
  defaultCurrency: 'VND' as CurrencyCode,

  // Conversion rates based on USD (Base = 1 USD)
  currencyRates: {
    USD: 1,
    VND: 25400,
    INR: 85,
    EUR: 0.92,
  },

  // Popular campus hubs across regions
  regions: [
    { country: 'Vietnam', cities: ['Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ'] },
    { country: 'India', cities: ['Bengaluru', 'Pune', 'Delhi NCR', 'Kota', 'Mumbai'] },
    { country: 'Australia / UK / Global', cities: ['Melbourne', 'Sydney', 'London', 'Manchester'] },
  ],
};

export type SiteConfig = typeof siteConfig;
