import { Property } from '@/types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-vn-1',
    code: 'VN-101',
    title: 'The Green Studio – Căn hộ dịch vụ cao cấp gần ĐH Bách Khoa & Y Dược',
    slug: 'green-studio-bach-khoa-y-duoc',
    address: 'Đường Lý Thường Kiệt, Phường 14, Quận 10',
    city: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    area: 'Quận 10',
    nearbyUniversity: 'ĐH Bách Khoa TP.HCM & ĐH Y Dược',
    distanceToCampus: '350m (4 phút đi bộ)',
    roomType: 'studio',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 180, // ~4.500.000 VND
    securityDepositUSD: 180,
    tokenDepositUSD: 20, // ~500.000 VND
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Phòng studio full nội thất cao cấp: máy lạnh Inverter, máy nước nóng, tủ lạnh, bếp từ riêng biệt, ban công thoáng mát đón nắng. Giờ giấc tự do 24/7, khóa vân tay an ninh tuyệt đối, không chung chủ.',
    highlights: [
      'Giờ giấc tự do 24/7 (Khóa vân tay)',
      '4 phút đi bộ tới cổng ĐH Bách Khoa',
      'Bếp riêng nấu ăn thoải mái, có ban công',
      'Không chung chủ, hỗ trợ đăng ký tạm trú'
    ],
    amenities: [
      'Wifi cáp quang tốc độ cao',
      'Máy lạnh Inverter',
      'Vệ sinh khép kín có nước nóng',
      'Bếp riêng với bếp từ & hút mùi',
      'Máy giặt chung sân phơi',
      'Thang máy',
      'Bãi đỗ xe máy có camera 24/7',
      'Cho nuôi thú cưng nhỏ'
    ],
    curfewTime: 'Tự do 24/7 (Khóa vân tay)',
    availableBeds: 2,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Anh Minh (Chủ nhà trực tiếp)',
    landlordContact: '+84901234567',
    rating: 4.9,
    reviewsCount: 38,
    createdAt: '2026-10-25'
  },
  {
    id: 'prop-vn-2',
    code: 'VN-102',
    title: 'Sunrise Scholar Dorm – Ký túc xá Sleepbox tiện nghi Cầu Giấy',
    slug: 'sunrise-scholar-dorm-cau-giay',
    address: 'Ngõ 20 Hồ Tùng Mậu, Mai Dịch, Cầu Giấy',
    city: 'Hà Nội',
    country: 'Vietnam',
    area: 'Cầu Giấy',
    nearbyUniversity: 'ĐH Quốc Gia Hà Nội & ĐH Sư Phạm',
    distanceToCampus: '400m (5 phút đi bộ)',
    roomType: 'single',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 70, // ~1.800.000 VND bao trọn điện nước
    securityDepositUSD: 70,
    tokenDepositUSD: 15,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Mô hình Sleepbox riêng tư cao cấp dành cho sinh viên cần không gian học tập yên tĩnh, chi phí tiết kiệm. Rèm che riêng tư, nệm cao su non, ổ cắm điện, đèn đọc sách, bàn học mini trong box. Bao trọn chi phí điện nước, wifi và dọn vệ sinh 3 lần/tuần.',
    highlights: [
      'Bao trọn tiền điện nước & Wifi 500Mbps',
      '5 phút đi bộ tới ĐHQG Hà Nội',
      'Khu vực tự học yên tĩnh có điều hòa',
      'Không phát sinh bất kỳ phụ phí nào'
    ],
    amenities: [
      'Wifi tốc độ cao 500 Mbps',
      'Máy lạnh 24/24',
      'Bếp chung tiện nghi (lò vi sóng, tủ lạnh to)',
      'Máy giặt & máy sấy đồ miễn phí',
      'Bảo vệ & camera an ninh 24/7',
      'Dọn dẹp vệ sinh hằng ngày'
    ],
    curfewTime: '23:30 (Có bảo vệ trực)',
    availableBeds: 4,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Quản lý KTX Sunrise',
    landlordContact: '+84988776655',
    rating: 4.8,
    reviewsCount: 52,
    createdAt: '2026-10-26'
  },
  {
    id: 'prop-in-1',
    code: 'IN-201',
    title: 'The Elite Heights – Boys Luxury PG & Co-Living',
    slug: 'the-elite-heights-boys-luxury-pg',
    address: '4th Cross, Koramangala 5th Block, Near Jyoti Nivas College',
    city: 'Bengaluru',
    country: 'India',
    area: 'Koramangala',
    nearbyUniversity: 'Christ University (Central Campus)',
    distanceToCampus: '450m (6 mins walk)',
    roomType: 'double',
    gender: 'boys',
    foodPreference: 'pure_veg',
    pricePerMonthUSD: 147, // ~12,500 INR
    securityDepositUSD: 176,
    tokenDepositUSD: 24, // ~2,000 INR
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Fully furnished premium co-living space designed exclusively for students. Equipped with study desks, 300 Mbps fiber internet, and 3-time authentic North & South Indian pure vegetarian meals included. Zero brokerage with 24/7 CCTV surveillance.',
    highlights: [
      'Pure Veg Hygienic Mess (3 meals/day)',
      '6 mins walk to Christ University',
      'Attached Washroom with Geyser',
      'Zero Brokerage Direct Landlord'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom',
      'Study Table & Ergonomic Chair',
      'Daily Housekeeping',
      'Washing Machine & Laundry',
      'Power Backup (24x7 UPS)',
      'Biometric Entry & CCTV'
    ],
    curfewTime: '10:30 PM (Biometric security)',
    availableBeds: 3,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Rajesh Sharma',
    landlordContact: '+919876543210',
    rating: 4.85,
    reviewsCount: 42,
    createdAt: '2026-10-24'
  },
  {
    id: 'prop-in-2',
    code: 'IN-202',
    title: 'Aura Blossom – Premium Girls Residency & Hostel',
    slug: 'aura-blossom-premium-girls-residency',
    address: 'FC Road, Near Fergusson College Gate 3, Shivajinagar',
    city: 'Pune',
    country: 'India',
    area: 'Shivajinagar',
    nearbyUniversity: 'Fergusson College & Symbiosis Pune',
    distanceToCampus: '300m (4 mins walk)',
    roomType: 'single',
    gender: 'girls',
    foodPreference: 'pure_veg',
    pricePerMonthUSD: 188, // ~16,000 INR
    securityDepositUSD: 235,
    tokenDepositUSD: 30,
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Safe haven for female scholars and interns. Features multi-tier biometric security, on-campus female warden, quiet library study room, and nutritionist-planned vegetarian meals. Ideal for Fergusson and Symbiosis students.',
    highlights: [
      'Strict 24/7 Female Security & CCTV',
      'Pure Veg & Jain Meal Options',
      'Private Single Room with Balcony',
      'Walking distance to FC Road Metro'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom',
      'Quiet Study Hall',
      'Daily Room Cleaning',
      'Gym & Yoga Terrace',
      'Washing Machine'
    ],
    curfewTime: '10:00 PM (Wardens on duty)',
    availableBeds: 2,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Sunita Deshmukh',
    landlordContact: '+919811223344',
    rating: 4.9,
    reviewsCount: 56,
    createdAt: '2026-10-25'
  },
  {
    id: 'prop-au-1',
    code: 'AU-301',
    title: 'Carlton Scholar Suites – Modern Student Living near RMIT & UniMelb',
    slug: 'carlton-scholar-suites-melbourne',
    address: 'Swanston Street, Carlton, Victoria 3053',
    city: 'Melbourne',
    country: 'Australia',
    area: 'Carlton',
    nearbyUniversity: 'University of Melbourne & RMIT',
    distanceToCampus: '200m (3 mins walk to RMIT)',
    roomType: 'single',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 780, // ~1,200 AUD
    securityDepositUSD: 780,
    tokenDepositUSD: 100,
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b40280b89?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Purpose-built student apartment in the heart of Melbourne university precinct. Modern en-suite bedroom, heated floor, ultra-fast fiber, communal cinema room, and tram stop right at your front door.',
    highlights: [
      'Heart of Melbourne University Precinct',
      'Free Tram Zone right outside building',
      'Communal cinema, rooftop BBQ & study pods',
      'All utilities (Water, Power, 1Gbps WiFi) included'
    ],
    amenities: [
      '1 Gbps Ultra-fast WiFi',
      'Central Heating & AC',
      'En-suite Private Bathroom',
      'Fully Equipped Kitchenette',
      'Communal Cinema & Lounge',
      'Rooftop BBQ Garden',
      'Keyless Mobile Entry 24/7'
    ],
    curfewTime: '24/7 Keyless Mobile Entry',
    availableBeds: 3,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Melbourne Student Living Agency',
    landlordContact: '+61400123456',
    rating: 4.92,
    reviewsCount: 71,
    createdAt: '2026-10-26'
  }
];

export const CITIES = [
  'Tất cả thành phố / All Cities',
  'TP. Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Bengaluru',
  'Pune',
  'Delhi NCR',
  'Kota',
  'Melbourne',
  'Sydney',
  'London'
];

export const UNIVERSITIES = [
  'Tất cả trường / All Campuses',
  'ĐH Bách Khoa TP.HCM & ĐH Y Dược',
  'ĐH Quốc Gia Hà Nội & ĐH Sư Phạm',
  'ĐH Y Dược Cần Thơ (CTUMP)',
  'Christ University (Central Campus)',
  'Fergusson College & Symbiosis Pune',
  'Delhi University (DU North Campus)',
  'University of Melbourne & RMIT'
];
