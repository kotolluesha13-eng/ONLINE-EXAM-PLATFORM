import { useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useExam } from '@/hooks/use-exam';

interface ExamTimerProps {
  onTimeUp: () => void;
}

export function ExamTimer({ onTimeUp }: ExamTimerProps) {
  const { timeRemaining, updateTimeRemaining } = useExam();

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeRemaining(timeRemaining - 1);
      
      if (timeRemaining <= 1) {
        clearInterval(timer);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, updateTimeRemaining, onTimeUp]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const isLowTime = timeRemaining < 300; // Last 5 minutes

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-md ${
      isLowTime ? 'bg-red-100 text-red-800' : 'bg-gray-100'
    }`}>
      <Clock className={`h-4 w-4 ${isLowTime ? 'text-red-600' : 'text-gray-600'}`} />
      <span className={`font-mono text-lg font-semibold ${
        isLowTime ? 'text-red-800' : 'text-gray-900'
      }`}>
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  );
}
