// frontend/src/lib/utils/timing.ts

/**
 * Hàm Debounce: Đảm bảo một hàm chỉ được gọi sau khi một khoảng thời gian nhất định (wait)
 * đã trôi qua kể từ lần gọi cuối cùng.
 * @param func Hàm cần debounce.
 * @param wait Khoảng thời gian chờ (milliseconds).
 * @returns Hàm đã được debounce.
 */
export function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    
    const later = function() {
      timeout = null;
      func.apply(context, args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}