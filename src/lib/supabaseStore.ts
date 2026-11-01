import { createPublicClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/env';
import { Property, Booking, ChatMessage, PropertyReview, UserAccount, SiteSettings } from '@/types';

// Helper to convert DB snake_case row to Property
function rowToProperty(row: any): Property {
  return {
    id: String(row.id),
    code: String(row.code || ''),
    title: String(row.title || ''),
    slug: String(row.slug || ''),
    description: String(row.description || ''),
    address: String(row.address || ''),
    city: String(row.city || ''),
    country: String(row.country || 'Việt Nam'),
    area: String(row.area || ''),
    nearbyUniversity: String(row.nearby_university || ''),
    distanceToCampus: String(row.distance_to_campus || ''),
    roomType: row.room_type || 'studio',
    gender: row.gender || 'all',
    foodPreference: row.food_preference || 'self_cook',
    pricePerMonthUSD: Number(row.price_per_month_usd) || 100,
    securityDepositUSD: Number(row.security_deposit_usd) || 100,
    tokenDepositUSD: Number(row.token_deposit_usd) || 20,
    highlights: Array.isArray(row.highlights) ? row.highlights : [],
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    images: Array.isArray(row.images) ? row.images : [],
    curfewTime: row.curfew_time || 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    availableBeds: Number(row.available_beds) || 2,
    isVerified: Boolean(row.is_verified),
    isZeroBrokerage: Boolean(row.is_zero_brokerage),
    isPublished: row.is_published !== undefined ? Boolean(row.is_published) : true,
    isSoldOut: Boolean(row.is_sold_out),
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? String(row.deleted_at) : undefined,
    rating: Number(row.rating) || 0,
    reviewsCount: Number(row.reviews_count) || 0,
    landlordName: String(row.landlord_name || ''),
    landlordContact: String(row.landlord_contact || ''),
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : new Date().toISOString().slice(0, 10)
  };
}

function propertyToRow(p: Property): Record<string, any> {
  return {
    id: p.id,
    code: p.code,
    title: p.title,
    slug: p.slug,
    description: p.description || '',
    address: p.address || '',
    city: p.city,
    country: p.country || 'Việt Nam',
    area: p.area || '',
    nearby_university: p.nearbyUniversity || '',
    distance_to_campus: p.distanceToCampus || '',
    room_type: p.roomType || 'studio',
    gender: p.gender || 'all',
    food_preference: p.foodPreference || 'self_cook',
    price_per_month_usd: p.pricePerMonthUSD,
    security_deposit_usd: p.securityDepositUSD,
    token_deposit_usd: p.tokenDepositUSD,
    highlights: p.highlights || [],
    amenities: p.amenities || [],
    images: p.images || [],
    curfew_time: p.curfewTime || 'Giờ giấc tự do 24/7 (Khóa vân tay)',
    available_beds: p.availableBeds || 2,
    is_verified: p.isVerified !== undefined ? p.isVerified : true,
    is_zero_brokerage: p.isZeroBrokerage !== undefined ? p.isZeroBrokerage : true,
    is_published: p.isPublished !== undefined ? p.isPublished : true,
    is_sold_out: Boolean(p.isSoldOut),
    is_deleted: Boolean(p.isDeleted),
    deleted_at: p.deletedAt || null,
    rating: p.rating || 0,
    reviews_count: p.reviewsCount || 0,
    landlord_name: p.landlordName || '',
    landlord_contact: p.landlordContact || '',
    updated_at: new Date().toISOString()
  };
}

function rowToBooking(row: any): Booking {
  return {
    id: String(row.id),
    reference: String(row.reference || ''),
    propertyId: String(row.property_id || ''),
    propertyCode: String(row.property_code || ''),
    propertyTitle: String(row.property_title || ''),
    userId: String(row.user_id || ''),
    studentName: String(row.student_name || ''),
    studentEmail: String(row.student_email || ''),
    studentContact: String(row.student_contact || ''),
    studentWhatsApp: row.student_whatsapp ? String(row.student_whatsapp) : undefined,
    college: String(row.college || ''),
    moveInDate: String(row.move_in_date || ''),
    visitTimeSlot: row.visit_time_slot ? String(row.visit_time_slot) : undefined,
    roomType: row.room_type || 'studio',
    tokenAmountUSD: Number(row.token_amount_usd) || 20,
    tokenAmountLocal: String(row.token_amount_local || '500.000 ₫'),
    currency: row.currency || 'VND',
    status: row.status || 'pending',
    paymentMethod: row.payment_method || 'vietqr_bank',
    transactionReference: row.transaction_reference ? String(row.transaction_reference) : undefined,
    receiptImageUrl: row.receipt_image_url ? String(row.receipt_image_url) : undefined,
    transferContent: row.transfer_content ? String(row.transfer_content) : undefined,
    adminNotes: String(row.admin_notes || ''),
    isArchived: Boolean(row.is_archived),
    archivedAt: row.archived_at ? String(row.archived_at) : undefined,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString()
  };
}

function bookingToRow(b: Booking): Record<string, any> {
  return {
    id: b.id,
    reference: b.reference,
    property_id: b.propertyId,
    property_code: b.propertyCode,
    property_title: b.propertyTitle,
    user_id: b.userId || '',
    student_name: b.studentName,
    student_email: b.studentEmail,
    student_contact: b.studentContact,
    student_whatsapp: b.studentWhatsApp || '',
    college: b.college || '',
    move_in_date: b.moveInDate,
    visit_time_slot: b.visitTimeSlot || '',
    room_type: b.roomType || 'studio',
    token_amount_usd: b.tokenAmountUSD,
    token_amount_local: b.tokenAmountLocal,
    currency: b.currency || 'VND',
    status: b.status || 'pending',
    payment_method: b.paymentMethod || 'vietqr_bank',
    transaction_reference: b.transactionReference || null,
    receipt_image_url: b.receiptImageUrl || null,
    transfer_content: b.transferContent || null,
    admin_notes: b.adminNotes || '',
    is_archived: Boolean(b.isArchived),
    archived_at: b.archivedAt || null,
    created_at: b.createdAt
  };
}

function rowToReview(row: any): PropertyReview {
  return {
    id: String(row.id),
    bookingId: row.booking_id ? String(row.booking_id) : undefined,
    propertyId: String(row.property_id || ''),
    propertyCode: row.property_code ? String(row.property_code) : undefined,
    propertyTitle: row.property_title ? String(row.property_title) : undefined,
    userName: String(row.user_name || ''),
    userEmail: row.user_email ? String(row.user_email) : undefined,
    userAvatar: row.user_avatar ? String(row.user_avatar) : undefined,
    userCollege: row.user_college ? String(row.user_college) : undefined,
    rating: Number(row.rating) || 5,
    comment: String(row.comment || ''),
    adminReply: row.admin_reply ? String(row.admin_reply) : undefined,
    repliedAt: row.replied_at ? String(row.replied_at) : undefined,
    isDeleted: Boolean(row.is_deleted),
    deletedAt: row.deleted_at ? String(row.deleted_at) : undefined,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString()
  };
}

function reviewToRow(r: PropertyReview): Record<string, any> {
  return {
    id: r.id,
    booking_id: r.bookingId || null,
    property_id: r.propertyId,
    property_code: r.propertyCode || '',
    property_title: r.propertyTitle || '',
    user_name: r.userName,
    user_email: r.userEmail || '',
    user_avatar: r.userAvatar || null,
    user_college: r.userCollege || '',
    rating: r.rating || 5,
    comment: r.comment || '',
    admin_reply: r.adminReply || null,
    replied_at: r.repliedAt || null,
    is_deleted: Boolean(r.isDeleted),
    deleted_at: r.deletedAt || null,
    created_at: r.createdAt
  };
}

function rowToMessage(row: any): ChatMessage {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id || ''),
    studentName: String(row.student_name || ''),
    studentEmail: row.student_email ? String(row.student_email) : undefined,
    senderRole: row.sender_role || 'student',
    senderName: String(row.sender_name || ''),
    senderAvatar: row.sender_avatar ? String(row.sender_avatar) : undefined,
    text: String(row.text || ''),
    isReadByAdmin: Boolean(row.is_read_by_admin),
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString()
  };
}

function messageToRow(m: ChatMessage): Record<string, any> {
  return {
    id: m.id,
    conversation_id: m.conversationId,
    student_name: m.studentName,
    student_email: m.studentEmail || '',
    sender_role: m.senderRole || 'student',
    sender_name: m.senderName,
    sender_avatar: m.senderAvatar || null,
    text: m.text,
    is_read_by_admin: Boolean(m.isReadByAdmin),
    created_at: m.createdAt
  };
}

function rowToAccount(row: any): UserAccount {
  return {
    id: String(row.id),
    email: String(row.email || ''),
    name: String(row.name || row.full_name || ''),
    role: row.role || row.role_code || 'student',
    phone: row.phone ? String(row.phone) : null,
    college: row.college ? String(row.college) : null,
    avatar: row.avatar || row.avatar_url || null,
    createdAt: row.created_at ? String(row.created_at) : new Date().toISOString(),
    lastLoginAt: row.last_login_at ? String(row.last_login_at) : undefined,
    isSuspended: Boolean(row.is_suspended),
    suspendedAt: row.suspended_at ? String(row.suspended_at) : undefined
  };
}

function accountToRow(a: UserAccount): Record<string, any> {
  return {
    id: a.id,
    email: a.email,
    name: a.name,
    full_name: a.name,
    role: a.role,
    role_code: a.role,
    phone: a.phone || null,
    college: a.college || null,
    avatar: a.avatar || null,
    avatar_url: a.avatar || null,
    is_suspended: Boolean(a.isSuspended),
    suspended_at: a.suspendedAt || null,
    last_login_at: a.lastLoginAt || new Date().toISOString()
  };
}

export async function fetchAllFromSupabase(): Promise<{
  properties?: Property[];
  bookings?: Booking[];
  reviews?: PropertyReview[];
  messages?: ChatMessage[];
  accounts?: UserAccount[];
  settings?: SiteSettings;
} | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createPublicClient();

    const [propsRes, bookingsRes, reviewsRes, msgsRes, accountsRes, settingsRes] = await Promise.all([
      supabase.from('properties').select('*').order('created_at', { ascending: false }),
      supabase.from('bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('property_reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('chat_messages').select('*').order('created_at', { ascending: true }),
      supabase.from('accounts').select('*'),
      supabase.from('site_settings').select('*').limit(1).single()
    ]);

    const result: {
      properties?: Property[];
      bookings?: Booking[];
      reviews?: PropertyReview[];
      messages?: ChatMessage[];
      accounts?: UserAccount[];
      settings?: SiteSettings;
    } = {};

    if (propsRes.data && Array.isArray(propsRes.data)) {
      result.properties = propsRes.data.map(rowToProperty);
    }
    if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
      result.bookings = bookingsRes.data.map(rowToBooking);
    }
    if (reviewsRes.data && Array.isArray(reviewsRes.data)) {
      result.reviews = reviewsRes.data.map(rowToReview);
    }
    if (msgsRes.data && Array.isArray(msgsRes.data)) {
      result.messages = msgsRes.data.map(rowToMessage);
    }
    if (accountsRes.data && Array.isArray(accountsRes.data)) {
      result.accounts = accountsRes.data.map(rowToAccount);
    }
    if (settingsRes.data) {
      const s = settingsRes.data;
      result.settings = {
        brandName: s.brand_name || 'UniStay',
        tagline: s.tagline || 'Phòng Trọ & Căn Hộ Sinh Viên',
        defaultCurrency: s.default_currency || 'VND',
        supportWhatsApp: s.support_whatsapp || '0901234567',
        supportEmail: s.support_email || 'contact@unistay.vn',
        supportHotline: s.support_hotline || '0901234567',
        vietQrBankName: s.vietQr_bank_name || s.vietqr_bank_name || 'Techcombank',
        vietQrBankCode: s.vietQr_bank_code || s.vietqr_bank_code || '970407',
        vietQrAccountNumber: s.vietQr_account_number || s.vietqr_account_number || '19074816556011',
        vietQrAccountHolder: s.vietQr_account_holder || s.vietqr_account_holder || 'TRUONG VAN TUAN',
        defaultTokenUSD: Number(s.default_token_usd) || 20,
        holdHours: Number(s.hold_hours) || 48,
        razorpayKeyId: '',
        stripePublishableKey: ''
      };
    }

    return result;
  } catch (err) {
    console.error('Supabase fetch error, fallback to local store:', err);
    return null;
  }
}

export async function syncToSupabase(payload: {
  properties?: Property[];
  bookings?: Booking[];
  reviews?: PropertyReview[];
  messages?: ChatMessage[];
  accounts?: UserAccount[];
  settings?: SiteSettings;
}): Promise<void> {
  if (!isSupabaseConfigured()) return;

  try {
    const supabase = createPublicClient();

    if (payload.properties && payload.properties.length > 0) {
      const rows = payload.properties.map(propertyToRow);
      await supabase.from('properties').upsert(rows, { onConflict: 'id' });
    }

    if (payload.bookings && payload.bookings.length > 0) {
      const rows = payload.bookings.map(bookingToRow);
      await supabase.from('bookings').upsert(rows, { onConflict: 'id' });
    }

    if (payload.reviews && payload.reviews.length > 0) {
      const rows = payload.reviews.map(reviewToRow);
      await supabase.from('property_reviews').upsert(rows, { onConflict: 'id' });
    }

    if (payload.messages && payload.messages.length > 0) {
      const rows = payload.messages.map(messageToRow);
      await supabase.from('chat_messages').upsert(rows, { onConflict: 'id' });
    }

    if (payload.accounts && payload.accounts.length > 0) {
      const rows = payload.accounts.map(accountToRow);
      await supabase.from('accounts').upsert(rows, { onConflict: 'id' });
    }

    if (payload.settings) {
      const s = payload.settings;
      await supabase.from('site_settings').upsert({
        id: 'default',
        brand_name: s.brandName,
        tagline: s.tagline,
        default_currency: s.defaultCurrency,
        support_whatsapp: s.supportWhatsApp,
        support_email: s.supportEmail,
        support_hotline: s.supportHotline,
        vietqr_bank_name: s.vietQrBankName,
        vietqr_bank_code: s.vietQrBankCode || '970407',
        vietqr_account_number: s.vietQrAccountNumber,
        vietqr_account_holder: s.vietQrAccountHolder,
        default_token_usd: s.defaultTokenUSD || 20,
        hold_hours: s.holdHours || 48,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
    }
  } catch (err) {
    console.error('Supabase sync error:', err);
  }
}
