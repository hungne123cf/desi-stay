export type GenderPreference = 'all' | 'boys' | 'girls';
export type RoomType = 'single' | 'double' | 'triple' | 'studio';
export type FoodType = 'pure_veg' | 'non_veg' | 'jain_available' | 'self_cook';

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface Property {
  id: string;
  code: string; // e.g. YS-101
  title: string;
  slug: string;
  address: string;
  city: string;
  area: string;
  nearbyUniversity: string;
  distanceToCampus: string; // e.g. "500m (5 mins walk)"
  roomType: RoomType;
  gender: GenderPreference;
  foodType: FoodType;
  pricePerMonthINR: number;
  securityDepositINR: number;
  tokenDepositINR: number;
  images: string[];
  description: string;
  highlights: string[];
  amenities: string[];
  curfewTime?: string;
  isVerified: boolean;
  isZeroBrokerage: boolean;
  availableRooms: number;
  landlord: {
    name: string;
    phoneWhatsApp: string;
    badge: string;
  };
  rating: number;
  reviewsCount: number;
}

export interface BookingLead {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  studentName: string;
  studentEmail: string;
  studentWhatsApp: string;
  universityOrCollege: string;
  moveInDate: string;
  sharingPreference: RoomType;
  tokenPaidINR: number;
  paymentStatus: 'pending' | 'token_paid' | 'confirmed' | 'cancelled';
  paymentMethod?: 'razorpay_upi' | 'card' | 'offline_transfer';
  transactionId?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'admin';
  phone?: string;
  college?: string;
}

export interface FilterOptions {
  city: string;
  university: string;
  roomType: string;
  gender: string;
  foodType: string;
  maxPrice: number;
  zeroBrokerageOnly: boolean;
  attachedBathOnly: boolean;
}
