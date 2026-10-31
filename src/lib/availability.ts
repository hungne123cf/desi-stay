import { Property, Booking } from '@/types';

export interface PropertyAvailabilityStats {
  isSoldOut: boolean;
  isHeld48h: boolean;
  statusLabel: 'available' | 'held' | 'sold_out';
  statusBadgeText: string;
  confirmedBooking?: Booking;
  paidDepositsCount: number;
  pendingVisitsCount: number;
  totalActiveCount: number;
  activeBookings: Booking[];
  conflictingSlotsCount: number;
}

/**
 * Kiểm tra xem một căn phòng có bị coi là HẾT HÀNG / HẾT PHÒNG không.
 * Phòng được tính là hết hàng khi:
 * 1. Đã có khách được Admin chốt giữ phòng (status === 'confirmed').
 * 2. Hoặc availableBeds === 0.
 * 3. Hoặc thuộc tính isSoldOut === true.
 */
export function isPropertySoldOut(property: Property, bookings: Booking[] = []): boolean {
  if (!property) return false;
  if (property.isSoldOut === true || property.availableBeds <= 0) return true;

  return (bookings || []).some(
    (b) =>
      !b.isArchived &&
      (b.propertyId === property.id || b.propertyCode === property.code) &&
      b.status === 'confirmed'
  );
}

/**
 * Tính toán chi tiết trạng thái đặt cọc, hẹn xem và độ cạnh tranh của một căn phòng.
 */
export function getPropertyAvailabilityStats(
  property: Property,
  bookings: Booking[] = []
): PropertyAvailabilityStats {
  if (!property) {
    return {
      isSoldOut: false,
      isHeld48h: false,
      statusLabel: 'available',
      statusBadgeText: 'Còn phòng',
      paidDepositsCount: 0,
      pendingVisitsCount: 0,
      totalActiveCount: 0,
      activeBookings: [],
      conflictingSlotsCount: 0
    };
  }

  const propBookings = (bookings || []).filter(
    (b) =>
      b &&
      !b.isArchived &&
      (b.propertyId === property.id || b.propertyCode === property.code)
  );

  const confirmedBooking = propBookings.find((b) => b.status === 'confirmed');
  const paidDeposits = propBookings.filter((b) => b.status === 'token_paid');
  const pendingVisits = propBookings.filter(
    (b) => b.status === 'pending' && b.paymentMethod === 'pay_on_visit'
  );
  const activeBookings = propBookings.filter(
    (b) => b.status === 'pending' || b.status === 'token_paid' || b.status === 'confirmed'
  );

  const isSoldOut = Boolean(
    confirmedBooking || property.availableBeds <= 0 || property.isSoldOut === true
  );

  const isHeld48h = !isSoldOut && paidDeposits.length > 0;

  let statusLabel: PropertyAvailabilityStats['statusLabel'] = 'available';
  let statusBadgeText = 'Còn phòng trống';

  if (isSoldOut) {
    statusLabel = 'sold_out';
    statusBadgeText = 'Đã hết phòng (Đã chốt)';
  } else if (isHeld48h) {
    statusLabel = 'held';
    statusBadgeText = `Đang giữ chỗ (${paidDeposits.length} khách cọc)`;
  } else if (pendingVisits.length > 0) {
    statusBadgeText = `Đang có ${pendingVisits.length} người hẹn xem`;
  }

  // Đếm các khung giờ hẹn bị trùng nhau
  const slotMap = new Map<string, number>();
  pendingVisits.forEach((b) => {
    if (b.moveInDate && b.visitTimeSlot) {
      const key = `${b.moveInDate}_${b.visitTimeSlot}`;
      slotMap.set(key, (slotMap.get(key) || 0) + 1);
    }
  });

  let conflictingSlotsCount = 0;
  slotMap.forEach((count) => {
    if (count > 1) conflictingSlotsCount += count;
  });

  return {
    isSoldOut,
    isHeld48h,
    statusLabel,
    statusBadgeText,
    confirmedBooking,
    paidDepositsCount: paidDeposits.length,
    pendingVisitsCount: pendingVisits.length,
    totalActiveCount: propBookings.filter(
      (b) => b.status === 'pending' || b.status === 'token_paid'
    ).length,
    activeBookings,
    conflictingSlotsCount
  };
}
