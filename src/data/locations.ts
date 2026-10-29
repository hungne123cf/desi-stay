export interface CityLocationData {
  city: string;
  districts: string[];
  universities: string[];
}

export interface CountryLocationData {
  countryCode: string;
  countryName: string;
  cities: CityLocationData[];
}

export const LOCATION_CATALOG: Record<string, CountryLocationData> = {
  Vietnam: {
    countryCode: 'Vietnam',
    countryName: 'Việt Nam 🇻🇳',
    cities: [
      {
        city: 'Cần Thơ',
        districts: [
          'Quận Ninh Kiều',
          'Quận Cái Răng',
          'Quận Bình Thủy',
          'Quận Ô Môn',
          'Huyện Phong Điền',
          'KDC Hồng Phát (An Bình)',
          'KDC 91B (An Khánh)',
          'KDC Metro Hưng Lợi'
        ],
        universities: [
          'ĐH Cần Thơ (CTU - Khu II Đường 3/2)',
          'ĐH FPT Cần Thơ (Cầu Rau Răm - Nguyễn Văn Cừ)',
          'ĐH Y Dược Cần Thơ (CTUMP)',
          'ĐH Nam Cần Thơ (DNC)',
          'ĐH Kỹ thuật - Công nghệ Cần Thơ (CTUT)',
          'ĐH Tây Đô (Cái Răng)',
          'CĐ FPT Polytechnic Cần Thơ',
          'CĐ Kinh tế - Kỹ thuật Cần Thơ'
        ]
      },
      {
        city: 'TP. Hồ Chí Minh',
        districts: [
          'Quận 10',
          'Quận 1',
          'Quận 3',
          'Quận 5',
          'Quận 7 (Nam Sài Gòn)',
          'Quận Bình Thạnh',
          'TP. Thủ Đức (Làng Đại Học)',
          'TP. Thủ Đức (Khu Công Nghệ Cao Q.9)',
          'Quận Gò Vấp',
          'Quận Tân Bình',
          'Quận Phú Nhuận'
        ],
        universities: [
          'ĐH Bách Khoa TP.HCM & ĐH Y Dược',
          'Làng Đại Học Quốc Gia TP.HCM (Thủ Đức)',
          'ĐH FPT TP.HCM (Khu Công Nghệ Cao)',
          'ĐH Kinh Tế TP.HCM (UEH)',
          'ĐH Công Nghệ TP.HCM (HUTECH) & Ngoại Thương',
          'ĐH Tôn Đức Thắng (TDTU) & RMIT Quận 7',
          'ĐH Văn Lang (VLU) & ĐH Công Nghiệp (IUH)',
          'ĐH Sư Phạm Kỹ Thuật TP.HCM (HCMUTE)',
          'ĐH Luật TP.HCM & ĐH Nguyễn Tất Thành'
        ]
      },
      {
        city: 'Hà Nội',
        districts: [
          'Quận Cầu Giấy',
          'Quận Đống Đa',
          'Quận Hai Bà Trưng',
          'Quận Thanh Xuân',
          'Quận Bắc Từ Liêm',
          'Quận Nam Từ Liêm',
          'Khu CNC Hòa Lạc (Thạch Thất)',
          'Quận Ba Đình',
          'Quận Hoàng Mai'
        ],
        universities: [
          'ĐH Quốc Gia Hà Nội & ĐH Sư Phạm',
          'ĐH Bách Khoa Hà Nội - KTQD - Xây Dựng',
          'ĐH FPT Hà Nội (Hòa Lạc Campus)',
          'ĐH Ngoại Thương (FTU) & HV Ngoại Giao',
          'ĐH Thương Mại & HV Báo Chí Tuyên Truyền',
          'ĐH Hà Nội (HANU) & ĐH Kiến Trúc',
          'Học viện Tài Chính & ĐH Mỏ Địa Chất'
        ]
      },
      {
        city: 'Đà Nẵng',
        districts: [
          'Quận Hải Châu',
          'Quận Liên Chiểu',
          'Quận Ngũ Hành Sơn (FPT City)',
          'Quận Sơn Trà',
          'Quận Thanh Khê',
          'Quận Cẩm Lệ'
        ],
        universities: [
          'ĐH Bách Khoa - ĐH Đà Nẵng (Liên Chiểu)',
          'ĐH Kinh Tế - ĐH Đà Nẵng (Ngũ Hành Sơn)',
          'ĐH FPT Đà Nẵng (KĐT FPT City)',
          'ĐH Duy Tân (DTU)',
          'ĐH Sư Phạm & ĐH Ngoại Ngữ Đà Nẵng',
          'ĐH Đông Á & ĐH Kiến Trúc Đà Nẵng'
        ]
      },
      {
        city: 'Bình Dương',
        districts: [
          'TP. Đông Hòa (Dĩ An - Giáp Làng ĐH)',
          'TP. Thủ Dầu Một',
          'TP. Thuận An',
          'TP. Bến Cát'
        ],
        universities: [
          'Làng Đại Học Quốc Gia (Khu vực Dĩ An)',
          'ĐH Thủ Dầu Một (TDMU)',
          'ĐH Quốc Tế Miền Đông (EIU)',
          'ĐH Việt Đức (VGU - Bến Cát)',
          'ĐH Bình Dương'
        ]
      },
      {
        city: 'Thừa Thiên Huế',
        districts: [
          'Quận Thuận Hóa (Trung tâm Nam Sông Hương)',
          'Quận Phú Xuân',
          'Khu quy hoạch An Vân Dương'
        ],
        universities: [
          'ĐH Y Dược - ĐH Huế',
          'ĐH Khoa Học & ĐH Sư Phạm Huế',
          'ĐH Kinh Tế & ĐH Ngoại Ngữ Huế',
          'ĐH Luật - ĐH Huế'
        ]
      },
      {
        city: 'Khánh Hòa (Nha Trang)',
        districts: ['Phường Vĩnh Hải', 'Phường Vĩnh Thọ', 'Trung tâm TP. Nha Trang'],
        universities: [
          'ĐH Nha Trang (NTU)',
          'ĐH Khánh Hòa',
          'ĐH Thái Bình Dương'
        ]
      },
      {
        city: 'Lâm Đồng (Đà Lạt)',
        districts: ['Phường 8 (Đồi Sinh Viên)', 'Phường 2', 'Phường 9'],
        universities: ['ĐH Đà Lạt (DLU)', 'ĐH Yersin Đà Lạt']
      }
    ]
  },
  India: {
    countryCode: 'India',
    countryName: 'Ấn Độ (India) 🇮🇳',
    cities: [
      {
        city: 'Bengaluru',
        districts: ['Koramangala', 'SG Palya (Christ Univ)', 'HSR Layout', 'Indiranagar', 'Electronic City'],
        universities: [
          'Christ University (Central Campus)',
          'Jain University (Jayanagar)',
          'PES University & BMSCE',
          'Mount Carmel College'
        ]
      },
      {
        city: 'Pune',
        districts: ['Shivajinagar (FC Road)', 'Viman Nagar', 'Kothrud', 'Wakad', 'Hinjewadi'],
        universities: [
          'Fergusson College & Symbiosis Pune',
          'Symbiosis International University (Viman Nagar)',
          'MIT World Peace University (Kothrud)',
          'Savitribai Phule Pune University'
        ]
      },
      {
        city: 'Delhi NCR',
        districts: ['GTB Nagar (Hudson Lane)', 'Kamla Nagar', 'Satya Niketan', 'Noida Sector 125'],
        universities: [
          'Delhi University (DU North Campus)',
          'Delhi University (DU South Campus)',
          'IIT Delhi & JNU',
          'Amity University Noida'
        ]
      },
      {
        city: 'Kota',
        districts: ['Rajeev Gandhi Nagar', 'Talwandi', 'Landmark City (Kunhari)', 'Mahaveer Nagar'],
        universities: [
          'Allen Career Institute (Sankalp / Samarth)',
          'Resonance & Motion Education Hub',
          'PhysicsWallah Vidyapeeth Kota'
        ]
      }
    ]
  },
  Australia: {
    countryCode: 'Australia',
    countryName: 'Úc (Australia) 🇦🇺',
    cities: [
      {
        city: 'Melbourne',
        districts: ['Carlton', 'Melbourne CBD', 'Clayton', 'Parkville', 'Southbank'],
        universities: [
          'University of Melbourne & RMIT',
          'Monash University (Clayton Campus)',
          'Deakin University & Swinburne'
        ]
      },
      {
        city: 'Sydney',
        districts: ['Ultimo', 'Camperdown / Darlington', 'Kensington', 'Macquarie Park'],
        universities: [
          'University of Sydney (USYD) & UTS',
          'UNSW Sydney (Kensington)',
          'Macquarie University'
        ]
      }
    ]
  },
  'United Kingdom': {
    countryCode: 'United Kingdom',
    countryName: 'Vương Quốc Anh (UK) 🇬🇧',
    cities: [
      {
        city: 'London',
        districts: ['Bloomsbury', 'King’s Cross', 'South Kensington', 'Stratford', 'Shoreditch'],
        universities: [
          'UCL (University College London) & LSE',
          'Imperial College London',
          'King’s College London (KCL)'
        ]
      },
      {
        city: 'Manchester',
        districts: ['Fallowfield', 'Oxford Road Corridor', 'Victoria Park'],
        universities: ['University of Manchester & Manchester Met']
      }
    ]
  }
};

export const DISTANCE_PRESETS = [
  '150m (2 phút đi bộ)',
  '300m (4 phút đi bộ)',
  '500m (6 phút đi bộ)',
  '800m (3 phút đi xe máy)',
  '1.2km (5 phút đi xe máy)',
  '2km (7 phút đi xe máy / xe buýt)'
];

export const CURFEW_PRESETS = [
  'Giờ giấc tự do 24/7 (Khóa vân tay)',
  'Tự do 24/7 (Thẻ từ thang máy & Camera)',
  'Đóng cổng 23:00 (Có bảo vệ trực)',
  'Đóng cổng 23:30 (Hỗ trợ mở cửa khi về trễ)'
];

export const SAMPLE_ROOM_IMAGES = [
  {
    label: 'Studio hiện đại ban công',
    url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Phòng đơn sáng sủa',
    url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'KTX / Sleepbox tiện nghi',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Căn hộ Duplex / Gác lửng',
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
  },
  {
    label: 'Phòng 2 giường đôi',
    url: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80'
  }
];
