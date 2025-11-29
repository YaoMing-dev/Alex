// frontend/src/components/dashboard/ProgressCharts.tsx
"use client";

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Loader2 } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';

// Đăng ký Chart.js
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

// Cấu hình font
ChartJS.defaults.font.family = 'Inter, sans-serif';

// Interface cho Daily Progress (Charts)
interface DailyProgressData {
  date: string; // YYYY-MM-DD
  count?: number; // Cho writing (số bài)
  avgBandScore?: number | null; // Cho writing (Band TB)
  wordsMastered?: number; // Cho vocab (số từ)
}

interface ProgressChartsProps {
  writingData: DailyProgressData[];
  vocabData: DailyProgressData[];
  loading: boolean;
}

// Cấu hình Biểu đồ
const writingOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const, labels: { font: { size: 12 } } },
    title: { display: false },
  },
  scales: {
    y: {
      min: 5, max: 9, ticks: { stepSize: 0.5 },
      title: { display: true, text: 'Band Score', font: { size: 14 } },
    },
    x: {
      title: { display: true, text: 'Ngày', font: { size: 14 } }, // Đổi từ Tuần -> Ngày
    },
  },
};

const vocabOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const, labels: { font: { size: 12 } } },
    title: { display: false },
  },
  scales: {
    y: {
      title: { display: true, text: 'Số từ', font: { size: 14 } },
      beginAtZero: true,
      ticks: {
        stepSize: 1,
        precision: 0, // Đảm bảo không có phần thập phân
      },
    },
    x: {
      title: { display: true, text: 'Ngày', font: { size: 14 } },
    },
  },
};

// Hàm tạo Chart Data
const createChartData = (data: DailyProgressData[], type: 'writing' | 'vocab') => {
  // SỬA ĐỔI: Sử dụng trực tiếp dữ liệu đã được scaffolded từ Backend
  if (data.length === 0) {
    return { labels: [], datasets: [] };
  }

  // Lấy labels (MM-DD) từ dữ liệu
  // Vì Backend đã trả về mảng 7 phần tử theo thứ tự ngày tăng dần, ta chỉ cần map qua nó.
  const labels = data.map(item => {
    // Định dạng lại từ YYYY-MM-DD sang MM-DD cho Label của Chart
    return item.date.substring(5);
  });

  // Tạo data points cho Line chart (Writing)
  if (type === 'writing') {
    const bandScores = data.map(item => {
      // Dữ liệu đã được scaffolded, nếu không có bài viết, avgBandScore sẽ là null
      return item.avgBandScore || null;
    });

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Band Score Trung bình',
          data: bandScores,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          tension: 0.4,
          pointRadius: 5,
          pointHoverRadius: 7,
          // Thêm logic để chỉ vẽ đường kẻ giữa các điểm có giá trị
          spanGaps: true,
        },
      ],
    };
  }

  // Tạo data points cho Bar chart (Vocab)
  if (type === 'vocab') {
    const wordsLearned = data.map(item => {
      // Dữ liệu đã được scaffolded, nếu không có hoạt động, wordsMastered sẽ là 0
      return item.wordsMastered || 0;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Từ vựng đã học',
          data: wordsLearned,
          backgroundColor: '#8B5CF6',
          borderColor: '#7C3AED',
          borderWidth: 1,
          borderRadius: 5,
        },
      ],
    };
  }

  return { labels: [], datasets: [] };
};

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ writingData, vocabData, loading }) => {

  const finalWritingData = createChartData(writingData, 'writing');
  const finalVocabData = createChartData(vocabData, 'vocab');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px]">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
        <p className="mt-3 text-sm text-neutral-500">Đang tải dữ liệu biểu đồ...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 h-[300px] sm:h-[350px] lg:h-[400px]">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Tiến trình Band Score (7 Ngày Gần nhất)</h2>
        <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
          {finalWritingData.labels.length > 0 ? (
            <Line data={finalWritingData} options={writingOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">Chưa có bài viết nào được chấm trong 7 ngày qua.</div>
          )}
        </div>
      </Card>
      <Card className="p-4 sm:p-6 h-[300px] sm:h-[350px] lg:h-[400px]">
        <h2 className="text-lg sm:text-xl font-bold text-neutral-800 mb-4">Tiến trình Học Từ vựng (7 Ngày Gần nhất)</h2>
        <div className="h-[200px] sm:h-[250px] lg:h-[300px]">
          {finalVocabData.labels.length > 0 ? (
            <Bar data={finalVocabData} options={vocabOptions} />
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-500">Chưa có từ vựng nào được học trong 7 ngày qua.</div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ProgressCharts;