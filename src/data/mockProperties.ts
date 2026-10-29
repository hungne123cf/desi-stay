import { Property } from '@/types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-vn-ct-1',
    code: 'VN-101',
    title: 'Mekong Green Studio – Căn hộ ban công gần ĐH Cần Thơ & ĐH Y Dược',
    slug: 'mekong-green-studio-can-tho',
    address: 'Hẻm 51 Đường 3/2, Phường Xuân Khánh',
    city: 'Cần Thơ',
    country: 'Vietnam',
    area: 'Quận Ninh Kiều',
    nearbyUniversity: 'ĐH Cần Thơ (CTU - Khu II Đường 3/2)',
    distanceToCampus: '300m (4 phút đi bộ)',
    roomType: 'studio',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 110, // ~2.800.000 VNĐ
    securityDepositUSD: 110,
    tokenDepositUSD: 20, // ~500.000 VNĐ
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Phòng trọ Studio mới xây ngay trung tâm Ninh Kiều, trang bị sẵn máy lạnh Inverter, tủ lạnh, kệ bếp nấu ăn riêng, nhà vệ sinh khép kín có máy nước nóng. Khu vực cao ráo không ngập nước, giờ giấc tự do 24/7 bằng khóa vân tay.',
    highlights: [
      'Giờ giấc tự do 24/7 (Khóa vân tay)',
      '4 phút đi bộ tới Cổng B ĐH Cần Thơ',
      'Khu dân cư an ninh, không ngập nước',
      '0% Phí môi giới - Làm việc trực tiếp chủ nhà'
    ],
    amenities: [
      'Wifi cáp quang tốc độ cao',
      'Máy lạnh Inverter tiết kiệm điện',
      'Vệ sinh khép kín có nước nóng',
      'Kệ bếp riêng & bồn rửa inox',
      'Máy giặt chung sân thượng',
      'Nhà xe rộng có Camera 24/7'
    ],
    curfewTime: 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: 3,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Chú Bảy / Anh Hùng (Chủ nhà)',
    landlordContact: '0901234567',
    rating: 4.95,
    reviewsCount: 46,
    createdAt: '2026-10-25'
  },
  {
    id: 'prop-vn-ct-2',
    code: 'VN-102',
    title: 'FPT Smart Duplex – Phòng gác lửng KDC Hồng Phát gần ĐH FPT Cần Thơ',
    slug: 'fpt-smart-duplex-kdc-hong-phat-can-tho',
    address: 'Đường số 6, KDC Hồng Phát, Phường An Bình',
    city: 'Cần Thơ',
    country: 'Vietnam',
    area: 'KDC Hồng Phát (P. An Bình)',
    nearbyUniversity: 'ĐH FPT Cần Thơ (Cầu Rau Răm - Nguyễn Văn Cừ)',
    distanceToCampus: '500m (2 phút đi xe máy)',
    roomType: 'double',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 125, // ~3.200.000 VNĐ
    securityDepositUSD: 125,
    tokenDepositUSD: 20,
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Phòng Duplex gác lửng trần cao thoáng mát nằm trong KDC Hồng Phát yên tĩnh, đường nhựa rộng 12m, cực kỳ thuận tiện cho sinh viên ĐH FPT Cần Thơ và ĐH Nam Cần Thơ. Ở được 2-3 bạn thoải mái.',
    highlights: [
      'Cách ĐH FPT Cần Thơ & ĐH Nam Cần Thơ chỉ 500m',
      'Thiết kế gác lửng rộng rãi, ở được 2-3 sinh viên',
      'Đường KDC Hồng Phát sáng sủa, an ninh tuyệt đối',
      'Hỗ trợ đăng ký tạm trú online miễn phí'
    ],
    amenities: [
      'Wifi Mesh riêng từng tầng',
      'Máy lạnh Inverter',
      'Gác lửng lót sàn gỗ',
      'Tủ quần áo & bàn học dài',
      'Bếp nấu ăn riêng',
      'Khóa vân tay 2 lớp'
    ],
    curfewTime: 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: 2,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Chị Lan (Chủ nhà KDC Hồng Phát)',
    landlordContact: '0901234567',
    rating: 4.9,
    reviewsCount: 39,
    createdAt: '2026-10-26'
  },
  {
    id: 'prop-vn-hcm-1',
    code: 'VN-103',
    title: 'The Green Studio – Căn hộ dịch vụ cao cấp gần ĐH Bách Khoa & Y Dược',
    slug: 'green-studio-bach-khoa-y-duoc-q10',
    address: 'Đường Lý Thường Kiệt, Phường 14, Quận 10',
    city: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    area: 'Quận 10',
    nearbyUniversity: 'ĐH Bách Khoa TP.HCM & ĐH Y Dược',
    distanceToCampus: '350m (4 phút đi bộ)',
    roomType: 'studio',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 175, // ~4.450.000 VNĐ
    securityDepositUSD: 175,
    tokenDepositUSD: 20,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Phòng studio full nội thất cao cấp: máy lạnh Inverter, máy nước nóng, tủ lạnh, bếp từ riêng biệt, ban công thoáng mát đón nắng. Giờ giấc tự do 24/7, thang máy thẻ từ, không chung chủ.',
    highlights: [
      '4 phút đi bộ tới cổng ĐH Bách Khoa TP.HCM',
      'Bếp riêng nấu ăn thoải mái, có ban công lớn',
      'Thang máy thẻ từ, hầm để xe bảo vệ 24/7',
      'Không chung chủ, hợp đồng minh bạch'
    ],
    amenities: [
      'Wifi cáp quang tốc độ cao',
      'Máy lạnh & Tủ lạnh 150L',
      'Vệ sinh khép kín nước nóng năng lượng mặt trời',
      'Bếp riêng & Hút mùi',
      'Thang máy thẻ từ',
      'Hầm xe bảo vệ 24/7'
    ],
    curfewTime: 'Tự do 24/7 (Thẻ từ thang máy & Camera)',
    availableBeds: 2,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Anh Minh (Chủ tòa nhà)',
    landlordContact: '0901234567',
    rating: 4.88,
    reviewsCount: 64,
    createdAt: '2026-10-26'
  },
  {
    id: 'prop-vn-hcm-2',
    code: 'VN-104',
    title: 'UniVillage Thủ Đức – Phòng trọ sinh viên Làng Đại Học Quốc Gia',
    slug: 'univillage-lang-dai-hoc-thu-duc',
    address: 'Đường Tân Lập, Đông Hòa (Sát trục chính Làng ĐH)',
    city: 'TP. Hồ Chí Minh',
    country: 'Vietnam',
    area: 'TP. Thủ Đức (Làng Đại Học)',
    nearbyUniversity: 'Làng Đại Học Quốc Gia TP.HCM (Thủ Đức)',
    distanceToCampus: '400m (5 phút đi bộ)',
    roomType: 'double',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 95, // ~2.400.000 VNĐ
    securityDepositUSD: 95,
    tokenDepositUSD: 16,
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Khu nhà trọ sinh viên văn minh chuẩn Làng Đại Học Thủ Đức, ngay gần ĐH Bách Khoa CS2, ĐH Khoa Học Tự Nhiên, ĐH CNTT và ĐH Quốc Tế. Có sân để xe rộng, phòng đọc sách chung và khu phơi đồ thoáng mát.',
    highlights: [
      'Ngay trục đường chính Làng ĐH Quốc Gia',
      'Đi bộ ra trạm xe buýt & Metro số 1',
      'Điện nước tính theo giá Nhà nước',
      'Môi trường 100% sinh viên yên tĩnh học tập'
    ],
    amenities: [
      'Wifi tốc độ cao',
      'Máy lạnh',
      'WC khép kín trong phòng',
      'Khu giặt sấy tự động',
      'Camera an ninh toàn khu'
    ],
    curfewTime: 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: 4,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Cô Tư (Quản lý khu trọ)',
    landlordContact: '0901234567',
    rating: 4.85,
    reviewsCount: 41,
    createdAt: '2026-10-27'
  },
  {
    id: 'prop-vn-hn-1',
    code: 'VN-105',
    title: 'Sunrise Scholar Box – Ký túc xá Sleepbox tiện nghi Cầu Giấy',
    slug: 'sunrise-scholar-dorm-cau-giay',
    address: 'Ngõ 20 Hồ Tùng Mậu, Phường Mai Dịch',
    city: 'Hà Nội',
    country: 'Vietnam',
    area: 'Quận Cầu Giấy',
    nearbyUniversity: 'ĐH Quốc Gia Hà Nội & ĐH Sư Phạm (Cầu Giấy)',
    distanceToCampus: '350m (4 phút đi bộ)',
    roomType: 'single',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 70, // ~1.780.000 VNĐ trọn gói
    securityDepositUSD: 70,
    tokenDepositUSD: 15,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Mô hình Sleepbox riêng tư cao cấp dành cho sinh viên cần không gian học tập yên tĩnh, chi phí tiết kiệm. Bao trọn chi phí điện, nước, wifi, máy giặt sấy và dọn vệ sinh 3 lần/tuần.',
    highlights: [
      'Bao trọn tiền điện nước & Wifi 500Mbps',
      '4 phút đi bộ tới ĐH Quốc Gia & ĐH Thương Mại',
      'Box riêng có khoá từ, bàn học và đèn đọc sách',
      'Không phát sinh bất kỳ phụ phí nào'
    ],
    amenities: [
      'Bao trọn Điện + Nước + Wifi',
      'Điều hòa 2 chiều 24/24',
      'Bếp chung (tủ lạnh, lò vi sóng)',
      'Máy giặt & máy sấy miễn phí',
      'Dọn vệ sinh 3 buổi/tuần'
    ],
    curfewTime: 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: 4,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Ban Quản Lý Sunrise Cầu Giấy',
    landlordContact: '0988776655',
    rating: 4.82,
    reviewsCount: 53,
    createdAt: '2026-10-27'
  },
  {
    id: 'prop-vn-dn-1',
    code: 'VN-106',
    title: 'Ocean Breeze Studio – Căn hộ sinh viên gần ĐH Kinh Tế & ĐH FPT Đà Nẵng',
    slug: 'ocean-breeze-studio-ngu-hanh-son-da-nang',
    address: 'Đường Châu Thị Vĩnh Tế, Phường Mỹ An',
    city: 'Đà Nẵng',
    country: 'Vietnam',
    area: 'Quận Ngũ Hành Sơn (FPT City)',
    nearbyUniversity: 'ĐH Kinh Tế - ĐH Đà Nẵng (Ngũ Hành Sơn)',
    distanceToCampus: '250m (3 phút đi bộ)',
    roomType: 'studio',
    gender: 'all',
    foodPreference: 'self_cook',
    pricePerMonthUSD: 130, // ~3.300.000 VNĐ
    securityDepositUSD: 130,
    tokenDepositUSD: 20,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502005229762-ee1b40280b89?auto=format&fit=crop&w=1200&q=80'
    ],
    description:
      'Căn hộ Studio đầy đủ tiện nghi nằm ngay khu phố sinh viên sầm uất Châu Thị Vĩnh Tế, đi bộ 3 phút tới ĐH Kinh Tế Đà Nẵng, 10 phút ra biển Mỹ Khê. Phòng có cửa sổ lớn đón gió biển mát mẻ quanh năm.',
    highlights: [
      'Sát cổng sau ĐH Kinh Tế Đà Nẵng (Phố sinh viên Mỹ An)',
      'Đầy đủ nội thất: Giường nệm, tủ lạnh, máy giặt riêng',
      'Cửa sổ lớn thoáng mát, thang máy hiện đại',
      '0% Phí môi giới'
    ],
    amenities: [
      'Wifi tốc độ cao',
      'Máy lạnh & Tủ lạnh riêng',
      'Máy giặt riêng tại phòng',
      'Bếp từ & Hút mùi',
      'Thang máy & Khóa vân tay'
    ],
    curfewTime: 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: 2,
    isVerified: true,
    isZeroBrokerage: true,
    isPublished: true,
    landlordName: 'Anh Hoàng (Chủ nhà Đà Nẵng)',
    landlordContact: '0905123456',
    rating: 4.91,
    reviewsCount: 34,
    createdAt: '2026-10-28'
  }
];
