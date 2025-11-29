import React from 'react';
  import { ArrowLeft } from 'lucide-react';
  import { Button } from '@/components/ui/button';

  interface StudyHeaderProps {
    lessonName: string;
    onExit: () => void;
  }

  export const StudyHeader: React.FC<StudyHeaderProps> = ({ lessonName, onExit }) => {
    return (
      <header className="bg-edu-light border-2 border-edu-light header-gradient-border rounded-xl mx-4 mt-6 py-3 sm:py-4 sticky top-0 z-30 shadow-md">
        <div className="container mx-auto max-w-4xl flex items-center justify-between px-4 sm:px-6">
          <Button
            variant="outline"
            className="flex items-center text-sm sm:text-md font-semibold text-edu-dark bg-background border-2 border-edu-default hover:bg-edu-light hover:text-edu-dark rounded-lg h-10 sm:h-11 transition-all duration-200 hover:shadow-sm"
            onClick={onExit}
          >
            <ArrowLeft className="h-5 w-5 mr-2 text-edu-dark" /> Thoát
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-edu-dark text-center flex-grow">
            {lessonName}
          </h1>
          <div className="w-20 sm:w-24"></div> {/* Placeholder cân đối */}
        </div>
      </header>
    );
  };