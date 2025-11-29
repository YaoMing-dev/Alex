// frontend/src/components/vocabulary/LessonCard.tsx
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Star, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import NextImage from 'next/image';

type LessonStatus = 'completed' | 'in-progress' | 'ready-to-learn' | 'upcoming' | 'completed-quiz' | 'ready-to-do-quiz' | 'upcoming-quiz';

interface LessonCardProps {
  title: string;
  status: LessonStatus;
  progressValue?: number;
  imageSrc: string;
  id: number; // Thêm id để onClick dùng đúng lessonId
  isLocked?: boolean;
  onClick?: (id: number, e: React.MouseEvent<HTMLDivElement>) => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ title, status, progressValue = 0, imageSrc, id, isLocked = false, onClick }) => {
  const isCompletedStudy = status === 'completed'; // Hoàn thành Study
  const isCompletedQuiz = status === 'completed-quiz';
  const isCompleted = isCompletedStudy || isCompletedQuiz;
  const isInProgress = status === 'in-progress';
  const isUpcoming = status === 'upcoming' || status === 'upcoming-quiz' || isLocked; // isLocked vẫn dùng để fallback
  const isReadyToLearn = status === 'ready-to-learn';
  const isReadyToDoQuiz = status === 'ready-to-do-quiz';

  const finalStatusText =
    isCompleted ? "Đã hoàn thành" :
      isInProgress ? `Đang học (${progressValue}%)` :
        isReadyToDoQuiz ? "Sẵn sàng làm Quiz" :
          isReadyToLearn ? "Sẵn sàng học" :
            isUpcoming ? "Sắp tới (Bị khóa)" :
              "Không rõ trạng thái";

  let progressIcon;
  let cardClasses;
  let titleColor = "text-edu-dark";
  let progressColor = "text-edu-light";
  let imageBorderColor = "border-edu-light";
  let progressBarClasses = "h-1.5 bg-edu-light [&>div]:bg-edu-light mt-1";

  if (isUpcoming) {
    progressIcon = <Lock className="h-5 w-5 text-gray-400" />;
    cardClasses = "bg-gray-100/50 shadow-sm border border-gray-200 text-gray-400 cursor-not-allowed opacity-70";
  } else if (isCompleted) {
    progressIcon = <CheckCircle className="h-5 w-5 text-edu-default opacity-80" />;
    titleColor = "text-edu-dark";
    progressColor = "text-edu-default";
    imageBorderColor = "border-edu-default";
    cardClasses = "bg-card shadow-md hover:shadow-lg hover:border-edu-default opacity-90";
    progressBarClasses = "h-1.5 bg-edu-light [&>div]:bg-edu-default mt-1";
  } else if (isInProgress || isReadyToLearn) {
    progressIcon = <Clock className="h-5 w-5 text-edu-accent" />;
    titleColor = "text-edu-dark"; // Giữ text tối để dễ đọc trên nền sáng
    progressColor = "text-edu-accent";
    imageBorderColor = "border-edu-accent";
    cardClasses = "bg-edu-light/80 ring-2 ring-edu-accent/50 shadow-md hover:shadow-lg hover:border-edu-accent";
    progressBarClasses = "h-1.5 bg-edu-light [&>div]:bg-edu-accent mt-1";
  } else if (isReadyToDoQuiz) {
    progressIcon = <Star className="h-5 w-5 text-edu-foreground fill-edu-foreground" />;
    titleColor = "text-edu-foreground";
    progressColor = "text-edu-foreground";
    imageBorderColor = "border-edu-foreground";
    cardClasses = "bg-edu-accent text-edu-foreground shadow-md hover:shadow-lg hover:border-edu-foreground";
    progressBarClasses = "h-1.5 bg-edu-light [&>div]:bg-edu-foreground mt-1";
  } else {
    // Default Fallback
    progressIcon = <Lock className="h-5 w-5 text-edu-light" />;
    cardClasses = "bg-card shadow-md border border-gray-200";
  }

  const progressValueDisplay = isCompleted ? 100 : (isInProgress ? progressValue : 0);

  return (
    <div
      className={cn("flex items-center w-full h-[70px] p-3 rounded-xl transition-all duration-200 cursor-pointer", cardClasses)}
      // LOGIC CLICK: CHỈ CHO PHÉP CLICK NẾU KHÔNG BỊ KHÓA
      onClick={(e) => !isUpcoming && onClick && onClick(id, e as React.MouseEvent<HTMLDivElement>)}
      onTouchStart={() => { }}
      onTouchEnd={() => { }}
    >
      <div className="relative flex-shrink-0 mr-2 sm:mr-3">
        <div className={cn("w-12 sm:w-14 h-12 sm:h-14 rounded-full border-2 overflow-hidden", imageBorderColor)}>
          <NextImage src={imageSrc} alt={title} fill className="object-cover rounded-full" />
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-center h-full min-w-0">
        <p className={cn("text-sm font-semibold truncate", titleColor)} title={title}>{title}</p>
        <p className={cn("text-xs mt-0.5", progressColor)}>{finalStatusText}</p>
      </div>
      <div className="flex-shrink-0 ml-2 w-14">
        {progressIcon}
        {/* Không hiển thị progress bar nếu bị khóa */}
        {!isUpcoming && <Progress value={progressValueDisplay} className={progressBarClasses} />}
      </div>
    </div>
  );
};