import { NextResponse } from 'next/server';
import { getRealtimeState, updateRealtimeState } from '@/lib/realtimeStore';

/**
 * Webhook nhận thông báo biến động số dư Ngân hàng tự động (tương thích SePay, Casso, PayOS)
 * Khi sinh viên quét mã VietQR chuyển khoản, ngân hàng gọi vào endpoint này -> Hệ thống tự động
 * chuyển trạng thái đơn cọc sang 'token_paid' (Đã nhận tiền cọc) theo thời gian thực.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const state = getRealtimeState();

    // Chuẩn hóa nội dung chuyển khoản từ nhiều cổng Webhook phổ biến tại Việt Nam (SePay, Casso, PayOS)
    const rawContent: string =
      payload.content ||
      payload.description ||
      payload?.data?.description ||
      payload?.data?.[0]?.description ||
      payload.transferContent ||
      '';

    const txRef: string =
      String(
        payload.referenceCode ||
          payload.tid ||
          payload?.data?.reference ||
          payload?.data?.[0]?.tid ||
          payload.id ||
          `AUTO_${Date.now().toString().slice(-6)}`
      );

    const directBookingId: string | undefined = payload.bookingId;
    const upperContent = rawContent.toUpperCase().replace(/[^A-Z0-9]/g, '');

    let matchedCount = 0;

    const updatedBookings = state.bookings.map((booking) => {
      if (directBookingId && booking.id === directBookingId) {
        matchedCount++;
        return {
          ...booking,
          status: 'token_paid' as const,
          transactionReference: txRef,
          adminNotes: `Hệ thống tự động xác nhận thanh toán VietQR (${txRef})`
        };
      }

      if (upperContent && booking.status === 'pending') {
        const cleanRef = booking.reference.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const cleanTransfer = (booking.transferContent || '')
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '');
        const cleanCode = booking.propertyCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
        const cleanPhone = booking.studentContact.replace(/[^0-9]/g, '');

        const isMatched =
          (cleanTransfer && upperContent.includes(cleanTransfer)) ||
          (cleanRef && upperContent.includes(cleanRef)) ||
          (cleanCode && cleanPhone && upperContent.includes(cleanCode) && upperContent.includes(cleanPhone));

        if (isMatched) {
          matchedCount++;
          return {
            ...booking,
            status: 'token_paid' as const,
            transactionReference: txRef,
            adminNotes: `Webhook Ngân hàng tự động gạch nợ (${txRef})`
          };
        }
      }

      return booking;
    });

    if (matchedCount > 0) {
      updateRealtimeState({ bookings: updatedBookings });
    }

    return NextResponse.json({
      success: true,
      matchedBookings: matchedCount,
      message:
        matchedCount > 0
          ? `Đã tự động xác nhận ${matchedCount} đơn đặt cọc qua VietQR Webhook.`
          : 'Đã nhận tín hiệu Webhook (không có đơn chờ khớp mã).'
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Webhook error' },
      { status: 400 }
    );
  }
}

