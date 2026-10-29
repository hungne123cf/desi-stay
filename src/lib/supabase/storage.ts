'use client';

import { isSupabaseConfigured } from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

/**
 * Nén ảnh trên trình duyệt xuống chuẩn HD JPEG (~60-80KB) và:
 * - Nếu đã kết nối Supabase Cloud: Tự động tải lên bucket `property-images` (Supabase Storage CDN)
 * - Nếu chưa tạo bucket hoặc chạy local: Trả về chuỗi ảnh HD Base64 lưu trực tiếp trong cột `images` của Database
 */
export async function uploadOrCompressImage(file: File): Promise<{
  url: string;
  storageType: 'supabase-cloud' | 'database-embedded';
}> {
  // 1. Nén ảnh qua HTML5 Canvas
  const compressedDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Không đọc được file ảnh'));
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('Định dạng ảnh không hợp lệ'));
        return;
      }
      const img = new Image();
      img.onerror = () => resolve(reader.result as string);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        } else {
          resolve(reader.result as string);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  // 2. Nếu đã cấu hình Supabase Cloud -> Thử đẩy lên Supabase Storage Bucket 'property-images'
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const res = await fetch(compressedDataUrl);
      const blob = await res.blob();
      const fileName = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`;

      const { error } = await supabase.storage
        .from('property-images')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (!error) {
        const { data } = supabase.storage.from('property-images').getPublicUrl(fileName);
        if (data?.publicUrl) {
          return {
            url: data.publicUrl,
            storageType: 'supabase-cloud'
          };
        }
      }
    } catch {
      // Fallback sang lưu trực tiếp trong bảng Database
    }
  }

  return {
    url: compressedDataUrl,
    storageType: 'database-embedded'
  };
}
