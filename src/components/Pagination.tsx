'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [6, 9, 12, 24],
  itemLabel = 'mục',
  className = ''
}: PaginationProps) {
  // Nếu không có phần tử nào hoặc chỉ có 0 trang thì không cần hiện
  if (totalPages <= 0) return null;

  // Tính khoảng hiển thị (Ví dụ: 1 - 6 / 9)
  const startItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min((currentPage - 1) * pageSize + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && pageSize !== undefined
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  // Thuật toán sinh danh sách số trang hiển thị thông minh
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
    >
      {/* Tóm tắt số lượng phần tử & Tùy chọn số mục mỗi trang */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 w-full sm:w-auto justify-center sm:justify-start">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <p>
            Hiển thị{' '}
            <span className="font-bold text-slate-800">
              {totalItems === 0 ? 0 : `${startItem} - ${endItem}`}
            </span>{' '}
            trên tổng số <span className="font-bold text-indigo-600">{totalItems}</span> {itemLabel}
          </p>
        ) : (
          <p>
            Trang <span className="font-bold text-slate-800">{currentPage}</span> /{' '}
            <span className="font-bold text-indigo-600">{totalPages}</span>
          </p>
        )}

        {onPageSizeChange && pageSize && pageSizeOptions.length > 0 && (
          <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-slate-200">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1); // Reset về trang 1 khi đổi page size
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-xs"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Điều khiển phân trang (Chỉ hiển thị khi có từ 2 trang trở lên) */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
          {/* Về trang đầu */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Trang đầu"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Trang trước */}
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            title="Trang trước"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Các nút số trang */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) => {
              if (p === '...') {
                return (
                  <span
                    key={`ellipsis-${idx}`}
                    className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400"
                  >
                    ...
                  </span>
                );
              }

              const pageNum = Number(p);
              const isActive = pageNum === currentPage;

              return (
                <button
                  key={`page-${pageNum}`}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Trang kế tiếp */}
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            title="Trang tiếp theo"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Đến trang cuối */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Trang cuối"
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
