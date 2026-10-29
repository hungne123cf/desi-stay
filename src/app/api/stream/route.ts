import { getRealtimeState, subscribeRealtime } from '@/lib/realtimeStore';

export async function GET(request: Request) {
  void request.url;
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;
  let keepAliveTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Gửi trạng thái hiện tại ngay khi kết nối
      const initial = getRealtimeState();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify(initial)}\n\n`));

      // Lắng nghe thay đổi Real-time (SignalR-style push)
      unsubscribe = subscribeRealtime((newState) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(newState)}\n\n`));
        } catch {}
      });

      // Giữ kết nối sống mỗi 20 giây
      keepAliveTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {}
      }, 20000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (keepAliveTimer) clearInterval(keepAliveTimer);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}
