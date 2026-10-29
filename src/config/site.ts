import { CurrencyCode } from '@/types';

export const siteConfig = {
  name: 'UniStay',
  nameAccent: 'Việt Nam',
  tagline: 'Phòng Trọ & Căn Hộ Sinh Viên',
  description:
    'Hệ thống tìm kiếm phòng trọ, căn hộ Studio và nhà trọ gác lửng uy tín dành cho sinh viên tại Cần Thơ và các thành phố đại học lớn tại Việt Nam. 0% phí môi giới, đặt cọc giữ chỗ trực tuyến qua VietQR.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  legalName: 'Công ty Cổ phần UniStay Việt Nam',
  supportEmail: 'hotro@unistay.vn',
  supportWhatsApp: '0901234567',
  supportHotline: '0901 234 567',
  defaultCurrency: 'VND' as CurrencyCode,

  currencyRates: {
    USD: 1,
    VND: 25400,
    INR: 85,
    EUR: 0.92,
  },

  regions: [
    {
      country: 'Việt Nam',
      cities: ['Cần Thơ', 'TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Vĩnh Long', 'An Giang']
    }
  ]
};

export type SiteConfig = typeof siteConfig;
