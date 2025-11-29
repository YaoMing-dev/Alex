// frontend/src/components/common/SortBySelect.tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortBySelectProps {
  currentSort: string;
  onSortChange: (sort: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
}

// Default options cho Writing/Vocab
const defaultSortOptions = [
  { value: "alphabetical", label: "Alphabetical" },
  { value: "recent", label: "Most Recent" },
  { value: "popular", label: "Most Popular" },
];

export const SortBySelect: React.FC<SortBySelectProps> = ({
  currentSort,
  onSortChange,
  placeholder = "Sort by",
  options = defaultSortOptions
}) => {
  return (
    <Select value={currentSort} onValueChange={onSortChange}>
      <SelectTrigger
        className="w-full max-w-[200px] md:w-[200px] font-medium text-sm hover:bg-accent hover:text-accent-foreground"
      >
        <ArrowUpDown className="h-4 w-4 opacity-75 mr-2 text-primary" />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map(option => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};