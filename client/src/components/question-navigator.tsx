import { Button } from '@/components/ui/button';
import { useExam } from '@/hooks/use-exam';

export function QuestionNavigator() {
  const { 
    questions, 
    currentQuestionIndex, 
    answers, 
    flaggedQuestions, 
    setCurrentQuestion 
  } = useExam();

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    if (!question) return 'unanswered';
    
    const isAnswered = answers[question.id];
    const isFlagged = flaggedQuestions.includes(question.id);
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) return 'current';
    if (isFlagged) return 'flagged';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getButtonStyles = (status: string) => {
    switch (status) {
      case 'current':
        return 'border-2 border-primary bg-primary text-white';
      case 'answered':
        return 'border-2 border-green-500 bg-green-500 text-white';
      case 'flagged':
        return 'border-2 border-orange-500 bg-orange-500 text-white';
      default:
        return 'border-2 border-gray-300 hover:bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Question Navigator</h4>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-4">
        {questions.map((_, index) => {
          const status = getQuestionStatus(index);
          return (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`w-10 h-10 p-0 ${getButtonStyles(status)}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {index + 1}
            </Button>
          );
        })}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary bg-primary rounded"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-green-500 bg-green-500 rounded"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-orange-500 bg-orange-500 rounded"></div>
            <span>Flagged</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
            <span>Not Answered</span>
          </div>
        </div>
      </div>
    </div>
  );
}
