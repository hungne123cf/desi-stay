export type UserRole = 'student' | 'staff' | 'admin';
export type GenderPreference = 'all' | 'boys' | 'girls';
export type RoomType = 'single' | 'double' | 'triple' | 'studio' | 'apartment';
export type FoodPreference = 'self_cook' | 'pure_veg' | 'mess_included' | 'all' | 'none';
export type FoodType = FoodPreference;
export type CurrencyCode = 'VND' | 'USD' | 'INR' | 'EUR';
export type BookingStatus = 'pending' | 'token_paid' | 'confirmed' | 'cancelled' | 'expired';
export type PaymentMethod = 'vietqr_bank' | 'razorpay_upi' | 'card_stripe' | 'pay_on_visit';

export interface Property {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  country: string;
  area: string;
  nearbyUniversity: string;
  distanceToCampus: string;
  roomType: RoomType;
  gender: GenderPreference;
  foodPreference?: FoodPreference;
  foodType?: FoodPreference;
  pricePerMonthUSD: number;
  securityDepositUSD: number;
  tokenDepositUSD: number;
  highlights: string[];
  amenities: string[];
  curfewTime: string | null;
  availableBeds: number;
  isVerified: boolean;
  isZeroBrokerage: boolean;
  isPublished: boolean;
  landlordName: string;
  landlordContact: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  createdAt: string;
}

export interface Booking {
  id: string;
  reference: string;
  propertyId: string;
  propertyTitle: string;
  propertyCode: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  studentContact: string;
  studentWhatsApp?: string;
  college: string;
  moveInDate: string;
  roomType: RoomType;
  tokenAmountUSD: number;
  tokenAmountLocal: string;
  currency: CurrencyCode;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
  receiptImageUrl?: string;
  transferContent?: string;
  visitTimeSlot?: string;
  adminNotes: string;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  avatar?: string;
  role: UserRole;
  phone?: string | null;
  college?: string | null;
}

export type User = CurrentUser;

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  college?: string | null;
  avatar?: string | null;
  createdAt: string;
  lastLoginAt?: string;
  isStaffAssigned?: boolean;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  defaultCurrency: CurrencyCode;
  supportWhatsApp: string;
  supportEmail: string;
  supportHotline: string;
  vietQrBankCode?: string;
  vietQrBankName: string;
  vietQrAccountNumber: string;
  vietQrAccountHolder: string;
  webhookSecret?: string;
  razorpayKeyId: string;
  stripePublishableKey: string;
  defaultTokenUSD: number;
  defaultTokenINR?: number;
  holdHours: number;
}

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export interface ChatMessage {
  id: string;
  conversationId: string;
  studentName: string;
  studentEmail?: string;
  senderRole: 'student' | 'admin' | 'staff';
  senderName: string;
  text: string;
  createdAt: string;
  isReadByAdmin?: boolean;
}

export interface PropertyReview {
  id: string;
  bookingId?: string;
  propertyId: string;
  propertyCode?: string;
  propertyTitle?: string;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  userCollege?: string;
  rating: number;
  comment: string;
  adminReply?: string;
  createdAt: string;
}

