"use client";

import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, BarChart3, CheckCircle, Clock } from "lucide-react";
import { LessonCard } from "./LessonCard";
import { Button } from "@/components/ui/button";
import NextImage from 'next/image';
import { Lesson, LessonStatus } from '@/lib/types/vocab';
import { useRouter } from "next/navigation";

interface ThemeDetailsProps {
  id: number;
  name: string;
  description: string;
  imageSrc: string;
  type: 'regular' | 'special' | 'completed';
  currentProgress: string;
  lessons: Lesson[];
  finalScore?: number;
  isStarted?: boolean;
  totalLessons?: number;
  wordCount?: number;
  progressValue?: number;
  onBack?: () => void;
}

const getPrimaryCta = (theme: ThemeDetailsProps) => {
  // Chỉ xử lý Regular/Special Theme (Completed Theme có logic ôn tập riêng)
  if (theme.type === 'regular' || theme.type === 'special') {

    // 🟢 CẬP NHẬT LOGIC TÌM BÀI HỌC KẾ TIẾP:
    // 1. Tìm Lesson đang học dở (in-progress)
    let nextLesson = theme.lessons.find(l => l.status === 'in-progress');
    // 2. Nếu không có, tìm Lesson sẵn sàng làm Quiz
    if (!nextLesson) {
      nextLesson = theme.lessons.find(l => l.status === 'ready-to-do-quiz');
    }
    // 3. Nếu không có, tìm Lesson sẵn sàng học (ready-to-learn)
    if (!nextLesson) {
      nextLesson = theme.lessons.find(l => l.status === 'ready-to-learn');
    }

    if (nextLesson) {
      // Xác định mode chính xác
      const mode = (nextLesson.status === 'ready-to-do-quiz' || nextLesson.status === 'completed-quiz') ? 'quiz' : 'vocab';

      let buttonText = "Bắt đầu khóa học";
      if (nextLesson.status === 'in-progress') {
        buttonText = "Tiếp tục học";
      } else if (nextLesson.status === 'ready-to-do-quiz') {
        buttonText = "Làm Quiz ngay";
      }

      return {
        text: buttonText,
        link: `/vocabulary/study/${nextLesson.id}?mode=${mode}`,
        icon: <ArrowRight className="h-5 w-5 ml-2" />,
        variant: "default" as const,
      };
    }
  }

  // Logic cho Completed Theme (Ôn tập)
  if (theme.type === 'completed') {
    // Giả định: Ôn tập lại Lesson đầu tiên
    const firstLesson = theme.lessons[0];
    return {
      text: `Ôn tập lại Theme`,
      link: firstLesson ? `/vocabulary/study/${firstLesson.id}` : '#', // Về Lesson đầu tiên để ôn từ vựng
      icon: <BarChart3 className="h-5 w-5 ml-2" />,
      variant: "outline" as const,
    };
  }

  // Mặc định (Theme đã hoàn thành hết và không phải Completed)
  if (theme.isStarted && !theme.lessons.find(l => l.status !== 'completed')) {
    return { text: "Hoàn thành!", link: '#', icon: <CheckCircle className="h-5 w-5 ml-2" />, variant: "default" as const };
  }

  return { text: "Bắt đầu", link: '#', icon: <ArrowRight className="h-5 w-5 ml-2" />, variant: "default" as const };
};

export const ThemeDetails: React.FC<ThemeDetailsProps> = (theme) => {
  const router = useRouter();
  const cta = getPrimaryCta(theme);
  const isRegularOrCompleted = theme.type === 'regular' || theme.type === 'completed';

  const handleLessonClick = (lessonId: number, status?: LessonStatus, isLockedProp?: boolean) => {
    // CẬP NHẬT LOGIC CLICK LESSON CARD: Dùng isLocked từ props của LessonCard
    if (isLockedProp || status === 'upcoming' || status === 'upcoming-quiz') {
      console.log("Lesson is locked or upcoming, cannot navigate.");
      return;
    }

    const mode = status && (status.includes('quiz') || status === 'ready-to-do-quiz') ? 'quiz' : 'vocab';
    router.push(`/vocabulary/study/${lessonId}?mode=${mode}`);
  };

  const handlePrimaryCtaClick = () => {
    if (cta.link && cta.link !== '#') {
      router.push(cta.link);
    } else if (theme.onBack && typeof theme.onBack === 'function') {
      theme.onBack();
    }
  };

  const handleBackClick = () => {
    if (theme.onBack && typeof theme.onBack === 'function') {
      theme.onBack();
    } else {
      router.push('/vocabulary');
    }
  };

  let progressDisplay = theme.currentProgress;
  let progressIcon = <Clock className="h-5 w-5 text-edu-accent mr-2" />;

  if (theme.type === 'completed') {
    progressIcon = <CheckCircle className="h-5 w-5 text-edu-default mr-2" />;
    progressDisplay = `Hoàn thành 100% | Điểm Quiz: ${theme.finalScore || 0}%`;
  } else if (theme.type === 'special' && theme.wordCount && theme.progressValue) {
    progressDisplay = `${theme.wordCount} từ vựng | ${theme.progressValue}% đã học`;
    progressIcon = <BarChart3 className="h-5 w-5 text-edu-light mr-2" />;
  }

  return (
    <div className="relative min-h-screen p-2 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-7xl relative z-10 mb-16">
        <div className="bg-[#F5F7F6] rounded-xl shadow-md border-2 border-edu-light mt-6 mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/2 h-48 md:h-auto flex-shrink-0 rounded-t-xl md:rounded-t-none md:rounded-l-xl overflow-hidden border-b-2 md:border-b-0 md:border-r-2 border-edu-light">
              <NextImage src={theme.imageSrc} alt={theme.name} fill className="object-cover" />
            </div>
            <div className="flex-grow p-6">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-edu-dark tracking-wide mb-4">
                {theme.name}
              </h1>
              <p className="text-edu-dark text-sm sm:text-base mt-2 max-w-2xl">
                {theme.description}
              </p>
              <div className="mt-4 flex items-center text-base sm:text-lg font-medium bg-edu-light/20 border border-edu-default rounded-lg px-3 py-2">
                {progressIcon}
                <span className={theme.type === "completed" ? "text-edu-default" : "text-edu-dark"}>
                  {progressDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row justify-between items-center mb-8 gap-4">
          <Button
            variant="outline"
            className="h-10 text-sm sm:text-lg sm:h-12 px-4 sm:px-6 border-2 border-edu-default text-edu-dark bg-[#F5F7F6] hover:bg-edu-light hover:text-edu-dark transition-all duration-200 flex-1 sm:flex-none"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </Button>
          <Button
            variant={cta.variant}
            className="h-10 text-sm sm:text-lg sm:h-12 px-4 sm:px-6 bg-edu text-edu-foreground hover:bg-edu-dark transition-all duration-200 flex-1 sm:flex-none"
            onClick={handlePrimaryCtaClick}
          >
            {cta.text}
            {cta.icon}
          </Button>
        </div>

        <div className="relative pl-6 sm:pl-8">
          {isRegularOrCompleted && (
            <div className="absolute top-0 bottom-0 left-0 w-1 bg-edu-light rounded-full"></div>
          )}
          <div className="flex flex-col gap-6">
            {theme.lessons.map((lesson) => {
              const dotClasses = cn(
                "absolute left-0 transform -translate-x-1/2 rounded-full border-4 z-10",
                "w-4 h-4",
                lesson.status === 'completed' ? 'bg-edu-default border-edu-foreground' :
                  lesson.status === 'in-progress' || lesson.status === 'ready-to-learn' ? 'bg-edu-accent border-edu-foreground' :
                    'bg-edu-light border-edu-foreground'
              );

              return (
                <div
                  key={lesson.id}
                  className="relative flex items-start"
                >
                  {isRegularOrCompleted && (
                    <div className={dotClasses} style={{ top: '25px' }}></div>
                  )}
                  <div className={cn("flex-grow", isRegularOrCompleted && "ml-4")}>
                    <LessonCard
                      title={lesson.title}
                      status={lesson.status}
                      progressValue={lesson.progressValue}
                      imageSrc={lesson.imageSrc}
                      id={lesson.id}
                      isLocked={lesson.status === 'upcoming' || lesson.status === 'upcoming-quiz'}
                      onClick={(id, e) => handleLessonClick(id, lesson.status, lesson.status === 'upcoming' || lesson.status === 'upcoming-quiz')}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};