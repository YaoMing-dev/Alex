// frontend/src/components/common/SearchInput.tsx
"use client";

import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { useCallback } from "react";
import { debounce } from "@/lib/utils/timing";

interface SearchInputProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ onSearch, placeholder = "Search..." }) => {

  // Vẫn cần dùng useCallback để đảm bảo debouncedSearch là duy nhất 
  // và tránh việc tạo lại hàm closure debounce mỗi lần render.
  const debouncedSearch = useCallback(
    debounce((query: string) => onSearch(query), 200),
    [onSearch]
  );

  return (
    <div className="relative flex-1 max-w-[300px] md:max-w-[400px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        className="w-full pl-10 md:pl-12 truncate"
        onChange={(e) => debouncedSearch(e.target.value)}
      />
    </div>
  );
};