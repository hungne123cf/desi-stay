import { Property } from '@/types';

export const INITIAL_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    code: 'YS-101',
    title: 'The Elite Heights - Boys Luxury PG & Co-Living',
    slug: 'the-elite-heights-boys-luxury-pg',
    address: '4th Cross, Koramangala 5th Block, Near Jyoti Nivas College',
    city: 'Bengaluru',
    area: 'Koramangala',
    nearbyUniversity: 'Christ University (Central Campus)',
    distanceToCampus: '450m (6 mins walk)',
    roomType: 'double',
    gender: 'boys',
    foodType: 'pure_veg',
    pricePerMonthINR: 12500,
    securityDepositINR: 15000,
    tokenDepositINR: 2000,
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Fully furnished premium co-living space designed exclusively for students. Equipped with ergonomic study desks, high-speed 300 Mbps fiber internet, and 3-time authentic North & South Indian pure vegetarian meals included. Zero brokerage with 24/7 CCTV surveillance and biometric entry.',
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
      'Biometric Entry & CCTV',
      'RO Purified Water Dispensers'
    ],
    curfewTime: '10:30 PM (Biometric security)',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 3,
    landlord: {
      name: 'Rajesh Sharma',
      phoneWhatsApp: '+919876543210',
      badge: 'Superhost Landlord'
    },
    rating: 4.8,
    reviewsCount: 42
  },
  {
    id: 'prop-2',
    code: 'YS-102',
    title: 'Aura Blossom - Premium Girls Residency & Hostel',
    slug: 'aura-blossom-premium-girls-residency',
    address: 'FC Road, Near Fergusson College Gate 3, Shivajinagar',
    city: 'Pune',
    area: 'Shivajinagar',
    nearbyUniversity: 'Fergusson College & Symbiosis Pune',
    distanceToCampus: '300m (4 mins walk)',
    roomType: 'single',
    gender: 'girls',
    foodType: 'jain_available',
    pricePerMonthINR: 16000,
    securityDepositINR: 20000,
    tokenDepositINR: 2500,
    images: [
      'https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'A safe, tranquil, and comfortable haven for female scholars and interns. Features multi-tier biometric security, on-campus female warden, quiet library study room, and nutritionist-planned vegetarian & Jain food options. Ideal for Fergusson and Symbiosis university students.',
    highlights: [
      'Strict 24/7 Female Security & CCTV',
      'Jain Food & Pure Veg Menu',
      'Private Single Room with Balcony',
      'Walking distance to FC Road Metro & Campuses'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom',
      'Quiet Study Hall',
      'Daily Room Cleaning',
      'Gym & Yoga Terrace',
      'Nutritious Pure Veg & Jain Meals',
      'Refrigerator & Microwave Access',
      'Washing Machine'
    ],
    curfewTime: '10:00 PM (Wardens on duty)',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 2,
    landlord: {
      name: 'Sunita Deshmukh',
      phoneWhatsApp: '+919811223344',
      badge: 'Verified Female Warden'
    },
    rating: 4.9,
    reviewsCount: 56
  },
  {
    id: 'prop-3',
    code: 'YS-103',
    title: 'North Campus Scholar Suites - Modern Co-Ed Living',
    slug: 'north-campus-scholar-suites',
    address: 'Hudson Lane, GTB Nagar, Near Metro Gate 4',
    city: 'Delhi NCR',
    area: 'GTB Nagar',
    nearbyUniversity: 'Delhi University (DU North Campus)',
    distanceToCampus: '600m (8 mins walk)',
    roomType: 'double',
    gender: 'all',
    foodType: 'non_veg',
    pricePerMonthINR: 11000,
    securityDepositINR: 11000,
    tokenDepositINR: 1500,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Vibrant student co-living in the heart of Delhi University North Campus student hub. Modern interior, individual wooden wardrobes, spacious double sharing rooms, community lounge with Netflix & PlayStation, and flexible meal plans (Both Veg & Non-Veg allowed).',
    highlights: [
      'Heart of Hudson Lane cafe street',
      'Both Veg & Non-Veg food served',
      'Rooftop recreation & community events',
      'No hidden charges, maintenance included'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom',
      'Rooftop Cafe & Lounge',
      'Gaming Zone (PS5 & Foosball)',
      'Full Power Backup',
      'Self-Cooking Kitchenette',
      'Laundry Service'
    ],
    curfewTime: '11:00 PM',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 5,
    landlord: {
      name: 'Vikram Chawla',
      phoneWhatsApp: '+919988776655',
      badge: 'Verified Partner'
    },
    rating: 4.7,
    reviewsCount: 38
  },
  {
    id: 'prop-4',
    code: 'YS-104',
    title: 'MedCampus Residency - International Indian Students Hub',
    slug: 'medcampus-residency-international',
    address: 'Nguyen Van Cu Street, An Khanh Ward, Ninh Kieu District',
    city: 'Can Tho / Vietnam Hub',
    area: 'University Quarter',
    nearbyUniversity: 'Can Tho University of Medicine & Pharmacy (CTUMP)',
    distanceToCampus: '350m (5 mins walk)',
    roomType: 'double',
    gender: 'all',
    foodType: 'pure_veg',
    pricePerMonthINR: 9800,
    securityDepositINR: 10000,
    tokenDepositINR: 1500,
    images: [
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Customized specifically for Indian MBBS medical students studying abroad in Vietnam. Features full Indian spices pantry, dedicated Indian chef cooking daily North & South Indian meals, quiet anatomy study rooms, and transport to affiliated teaching hospitals.',
    highlights: [
      'Dedicated Indian Chef (Veg/Non-Veg mess)',
      '5 mins walk to Medical University Lecture Halls',
      'Indian community of 150+ MBBS peers',
      'Electricity, Water & High-speed WiFi included'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom with Hot Water',
      'Indian Mess (Breakfast, Lunch, Dinner)',
      'Self-Cooking Kitchen with Induction',
      'Study Library with Medical Reference Books',
      'Housekeeping 3x a week',
      'Motorbike & Bicycle Parking'
    ],
    curfewTime: 'Flexible (Hospital shifts permitted)',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 4,
    landlord: {
      name: 'Dr. Amit Patel (Campus Coordinator)',
      phoneWhatsApp: '+84901234567',
      badge: 'Official University Liaison'
    },
    rating: 4.95,
    reviewsCount: 84
  },
  {
    id: 'prop-5',
    code: 'YS-105',
    title: 'The Kota Aspirant Hub - NEET & JEE Preparation PG',
    slug: 'the-kota-aspirant-hub-neet-jee',
    address: 'Landmark City, Kunadi, Near Allen Samyak & Motion',
    city: 'Kota',
    area: 'Kunadi',
    nearbyUniversity: 'Allen Career Institute & Resonance Kota',
    distanceToCampus: '200m (3 mins walk)',
    roomType: 'single',
    gender: 'boys',
    foodType: 'pure_veg',
    pricePerMonthINR: 14500,
    securityDepositINR: 14500,
    tokenDepositINR: 2000,
    images: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Engineered for maximum academic focus. Noise-isolated private single rooms equipped with broad study desks, soft LED lighting, ergonomic posture chairs, biometric entry for parents peace of mind, and 100% pure sattvic vegetarian food tailored for student health.',
    highlights: [
      'Soundproof Study Environment',
      'Nutritious Sattvic & Pure Veg food',
      'Parents Real-time Biometric SMS Alerts',
      'Doctor on Call & Counselor support'
    ],
    amenities: [
      'High-Speed Fiber WiFi',
      'Silent Air Conditioner',
      'Attached Bathroom',
      'Personal Refrigerator',
      'Daily Linen Change & Cleaning',
      'Power Backup with Inverter',
      'RO Drinking Water with Minerals'
    ],
    curfewTime: '9:30 PM (Coaching schedule compliant)',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 1,
    landlord: {
      name: 'Rameshwar Meena',
      phoneWhatsApp: '+919772233445',
      badge: 'Kota Care Certified'
    },
    rating: 4.85,
    reviewsCount: 63
  },
  {
    id: 'prop-6',
    code: 'YS-106',
    title: 'Serene Haven Studio - Budget Independent Living',
    slug: 'serene-haven-studio-independent',
    address: 'Viman Nagar, Lane 2, Near Phoenix Mall',
    city: 'Pune',
    area: 'Viman Nagar',
    nearbyUniversity: 'Symbiosis Centre for Management Studies (SCMS)',
    distanceToCampus: '800m (10 mins walk)',
    roomType: 'studio',
    gender: 'all',
    foodType: 'self_cook',
    pricePerMonthINR: 21000,
    securityDepositINR: 30000,
    tokenDepositINR: 3000,
    images: [
      'https://images.unsplash.com/photo-1502005229762-ee1b40280b89?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    description: 'Private 1-BHK student studio apartment for postgraduates and senior university students who want complete freedom. Features modular kitchen with gas pipeline, private balcony, pet-friendly policy, and no curfew.',
    highlights: [
      'Independent Private Studio (No sharing)',
      'Modular Kitchen with Gas & Chimney',
      'Zero Curfew & Pet Friendly',
      'High-Speed Fiber & Smart TV'
    ],
    amenities: [
      'High-Speed WiFi',
      'Air Conditioner',
      'Attached Bathroom & Bathtub',
      'Modular Kitchen with Refrigerator',
      'Smart TV with OTT subscriptions',
      'Dedicated Covered Parking',
      'Lift with Power Backup'
    ],
    curfewTime: 'No Curfew (24/7 keycard access)',
    isVerified: true,
    isZeroBrokerage: true,
    availableRooms: 2,
    landlord: {
      name: 'Arjun Singhania',
      phoneWhatsApp: '+919833445566',
      badge: 'Verified Owner'
    },
    rating: 4.75,
    reviewsCount: 29
  }
];

export const CITIES = ['All Cities', 'Bengaluru', 'Pune', 'Delhi NCR', 'Kota', 'Can Tho / Vietnam Hub'];

export const UNIVERSITIES = [
  'All Universities',
  'Christ University (Central Campus)',
  'Fergusson College & Symbiosis Pune',
  'Delhi University (DU North Campus)',
  'Can Tho University of Medicine & Pharmacy (CTUMP)',
  'Allen Career Institute & Resonance Kota',
  'Symbiosis Centre for Management Studies (SCMS)',
  'IIT Delhi / IIT Bombay',
  'Manipal University'
];
