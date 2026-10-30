'use client';

import React, { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root GlobalError caught:', error);

    // Tự động reload 1 lần nếu phát hiện lỗi ChunkLoadError hoặc deployment mismatch
    const isChunkError =
      error?.message?.includes('ChunkLoadError') ||
      error?.message?.includes('Loading chunk') ||
      error?.message?.includes('Failed to fetch') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError && typeof window !== 'undefined') {
      const reloadKey = 'unistay_auto_reload_last';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleHardReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <html lang="vi">
      <head>
        <title>UniStay - Tải Lại Trang</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
          backgroundColor: '#090d16',
          color: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '1.5rem',
            padding: '2.25rem',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div
            style={{
              width: '3.75rem',
              height: '3.75rem',
              borderRadius: '1rem',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.75rem'
            }}
          >
            ⚡
          </div>
          <h1
            style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              margin: '0 0 0.5rem',
              letterSpacing: '-0.025em',
              color: '#ffffff'
            }}
          >
            Cập Nhật Phiên Bản Mới
          </h1>
          <p
            style={{
              fontSize: '0.85rem',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: '0 0 1.75rem'
            }}
          >
            Hệ thống vừa cập nhật dữ liệu hoặc đường truyền bị gián đoạn.
            Vui lòng bấm nút bên dưới để tải lại dữ liệu mới nhất.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={handleHardReload}
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.85rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)'
              }}
            >
              🔄 Tải Lại Trang
            </button>
            <a
              href="/"
              style={{
                flex: 1,
                padding: '0.8rem 1rem',
                backgroundColor: '#1f2937',
                color: '#e2e8f0',
                textDecoration: 'none',
                borderRadius: '0.85rem',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #374151'
              }}
            >
              🏠 Về Trang Chủ
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}

