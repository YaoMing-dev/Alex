// frontend/src/lib/hooks/useResponsivePagination.ts
"use client";

import { useState, useEffect } from 'react';

// Định nghĩa các breakpoint TailwindCSS tiêu chuẩn
const breakpoints = {
  // Mobile (1 cột * 4 hàng = 4)
  mobile: 0,
  // Small (sm): 2 cột * 3 hàng = 6
  sm: 640, 
  // Medium (md): 3 cột * 2 hàng = 6
  md: 768, 
  // Large/Extra Large (lg/xl): 4 cột * 2 hàng = 8
  lg: 1024, 
};

/**
 * Hook để tính toán số lượng cards/page dựa trên chiều rộng màn hình (Responsive Grid)
 * Yêu cầu: 4x2=8 (lg+), 3x2=6 (md), 2x3=6 (sm), 1x4=4 (mobile)
 * @returns {number} cardsPerPage - Số lượng card cần hiển thị trên 1 trang
 */
export const useResponsivePagination = () => {
  // Giá trị khởi tạo cho SSR (mặc định cho desktop)
  const [cardsPerPage, setCardsPerPage] = useState(8); 

  useEffect(() => {
    // Hàm tính toán số lượng card
    const calculateCardsPerPage = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints.lg) {
        // 4 cột * 2 hàng = 8
        return 8; 
      } else if (width >= breakpoints.md) {
        // 3 cột * 2 hàng = 6
        return 6;
      } else if (width >= breakpoints.sm) {
        // 2 cột * 3 hàng = 6
        return 6; 
      } else {
        // 1 cột * 4 hàng = 4
        return 4; 
      }
    };

    // Cập nhật giá trị khi mount và resize
    setCardsPerPage(calculateCardsPerPage());
    window.addEventListener('resize', () => setCardsPerPage(calculateCardsPerPage()));
    
    return () => {
      window.removeEventListener('resize', () => setCardsPerPage(calculateCardsPerPage()));
    };
  }, []);

  return cardsPerPage;
};