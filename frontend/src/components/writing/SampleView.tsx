// frontend/src/components/writing/SampleView.tsx
import React from 'react';
import { EssayAnalysisResult } from '@/lib/types/writing';

const SampleView: React.FC<{ analysis: EssayAnalysisResult }> = ({ analysis }) => (
    <div className="space-y-4">
        <h4 className="font-bold text-edu-dark text-sm lg:text-base">Gợi ý Nâng cao Chung</h4>
        <div className="p-3 border rounded-lg bg-edu-light/20 text-xs lg:text-sm text-edu-dark italic">
            {analysis.general_suggestion}
        </div>
        <h4 className="font-bold text-edu-dark mt-6 text-sm lg:text-base">Bài làm Mẫu (Sample Answer)</h4>
        <div className="p-3 border rounded-lg bg-edu-background text-edu-dark whitespace-pre-wrap text-xs lg:text-sm">
            {analysis.sample_answer}
        </div>
    </div>
);

export default SampleView;