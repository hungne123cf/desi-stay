'use client';

import { useEffect } from 'react';

/**
 * Tự động phát hiện và khôi phục khi Vercel vừa build/deploy phiên bản mới
 * khiến các file chunk .js cũ trong bộ nhớ trình duyệt bị 404/mismatch.
 * Thay vì để người dùng thấy màn hình "This page couldn't load", component này
 * sẽ chủ động reload trang 1 lần để kéo phiên bản mới nhất về ngay lập tức.
 */
export function ChunkErrorRecovery() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleWindowError = (event: ErrorEvent) => {
      const msg = event?.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch') ||
        msg.includes('network error')
      ) {
        triggerReload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event?.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      if (
        msg.includes('ChunkLoadError') ||
        msg.includes('Loading chunk') ||
        msg.includes('Failed to fetch')
      ) {
        triggerReload();
      }
    };

    const triggerReload = () => {
      try {
        const key = 'unistay_chunk_autoreload_ts';
        const last = sessionStorage.getItem(key);
        const now = Date.now();
        if (!last || now - Number(last) > 8000) {
          sessionStorage.setItem(key, String(now));
          window.location.reload();
        }
      } catch {}
    };

    window.addEventListener('error', handleWindowError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleWindowError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}

