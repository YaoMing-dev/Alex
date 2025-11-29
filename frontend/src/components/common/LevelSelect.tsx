// frontend/src/components/common/LevelSelect.tsx
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface LevelSelectProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

const levels = [
  { value: "A1A2", label: "A1 & A2 (Beginner)" },
  { value: "B1B2", label: "B1 & B2 (Intermediate)" },
  { value: "C1C2", label: "C1 & C2 (Advanced)" },
];

export const LevelSelect: React.FC<LevelSelectProps> = ({ currentLevel, onLevelChange }) => {
  return (
    <Select value={currentLevel} onValueChange={onLevelChange}>
      <SelectTrigger
        className="w-full max-w-[250px] md:w-[280px] md:max-w-[320px] font-semibold text-base shadow-md border border-gray-200 p-2 md:p-3 transition-all duration-200"
      >
        <SelectValue placeholder="Chọn cấp độ" />
      </SelectTrigger>
      <SelectContent>
        {levels.map(level => (
          <SelectItem key={level.value} value={level.value}>
            {level.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};