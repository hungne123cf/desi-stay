import type { Booking, CurrentUser, Property, SiteSettings } from '@/types';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

export function mapProperty(r: Row): Property {
  return {
    id: r.id,
    code: r.code,
    title: r.title,
    slug: r.slug,
    description: r.description ?? '',
    address: r.address ?? '',
    city: r.city,
    country: r.country ?? 'Vietnam',
    area: r.area ?? '',
    nearbyUniversity: r.nearby_university ?? '',
    distanceToCampus: r.distance_to_campus ?? '',
    roomType: r.room_type,
    gender: r.gender,
    foodPreference: r.food_type,
    foodType: r.food_type,
    pricePerMonthUSD: Math.round((r.price_per_month_inr || 15000) / 85),
    securityDepositUSD: Math.round((r.security_deposit_inr || 15000) / 85),
    tokenDepositUSD: Math.round((r.token_deposit_inr || 2000) / 85),
    highlights: r.highlights ?? [],
    amenities: r.amenities ?? [],
    images: r.images ?? [],
    curfewTime: r.curfew_time ?? null,
    availableBeds: r.available_beds ?? 0,
    isVerified: !!r.is_verified,
    isZeroBrokerage: !!r.is_zero_brokerage,
    isPublished: !!r.is_published,
    landlordName: r.landlord_name ?? '',
    landlordContact: r.landlord_whatsapp ?? '',
    rating: 4.9,
    reviewsCount: 30,
    createdAt: r.created_at,
  };
}

export function mapBooking(r: Row): Booking {
  return {
    id: r.id,
    reference: r.reference,
    propertyId: r.property_id,
    propertyTitle: r.properties?.title ?? '',
    propertyCode: r.properties?.code ?? '',
    userId: r.user_id,
    studentName: r.student_name,
    studentEmail: r.student_email,
    studentContact: r.student_whatsapp,
    studentWhatsApp: r.student_whatsapp,
    college: r.college ?? '',
    moveInDate: r.move_in_date,
    roomType: r.room_type,
    tokenAmountUSD: Math.round((r.token_amount_inr || 2000) / 85),
    tokenAmountLocal: `${r.token_amount_inr || 2000}`,
    currency: 'USD',
    status: r.status,
    paymentMethod: r.payment_method === 'razorpay' ? 'razorpay_upi' : 'pay_on_visit',
    adminNotes: r.admin_notes ?? '',
    createdAt: r.created_at,
  };
}

export function mapProfile(r: Row, fallbackEmail: string): CurrentUser {
  return {
    id: r.id,
    email: r.email ?? fallbackEmail,
    name: r.full_name || (r.email ?? fallbackEmail).split('@')[0],
    avatarUrl: r.avatar_url ?? null,
    avatar: r.avatar_url ?? undefined,
    role: r.role ?? 'student',
    phone: r.phone ?? null,
    college: r.college ?? null,
  };
}

export function mapSettings(r: Row | null): SiteSettings {
  return {
    brandName: 'UniStay',
    tagline: 'Student Housing & Co-Living',
    defaultCurrency: 'VND',
    supportWhatsApp: r?.support_whatsapp ?? '',
    supportEmail: r?.support_email ?? '',
    supportHotline: '1900 6868',
    vietQrBankName: 'Vietcombank',
    vietQrAccountNumber: '1029384756',
    vietQrAccountHolder: 'CONG TY CP UNISTAY',
    razorpayKeyId: '',
    stripePublishableKey: '',
    defaultTokenUSD: 20,
    defaultTokenINR: r?.default_token_inr ?? 2000,
    holdHours: r?.hold_hours ?? 48,
  };
}
