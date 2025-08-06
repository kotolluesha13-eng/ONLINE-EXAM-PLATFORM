import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { ExamTimer } from '@/components/exam-timer';
import { QuestionNavigator } from '@/components/question-navigator';
import { useExam } from '@/hooks/use-exam';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft, ChevronRight, Flag, Send, AlertTriangle } from 'lucide-react';

export default function ExamPage() {
  const [, params] = useRoute('/exam/:examId');
  const [, setLocation] = useLocation();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const { toast } = useToast();

  const {
    currentExam,
    questions,
    currentQuestionIndex,
    answers,
    flaggedQuestions,
    timeRemaining,
    isLoading,
    startExam,
    loadQuestions,
    setCurrentQuestion,
    saveAnswer,
    toggleFlag,
    submitExam,
  } = useExam();

  const examId = params?.examId;

  useEffect(() => {
    if (examId) {
      const initializeExam = async () => {
        try {
          await startExam(examId);
          await loadQuestions(examId);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to start exam",
            variant: "destructive",
          });
          setLocation('/dashboard');
        }
      };
      initializeExam();
    }
  }, [examId]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  const handleAnswerChange = (value: string) => {
    if (currentQuestion) {
      saveAnswer(currentQuestion.id, value);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestion(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const handleFlag = () => {
    if (currentQuestion) {
      toggleFlag(currentQuestion.id);
      toast({
        title: "Question flagged",
        description: flaggedQuestions.includes(currentQuestion.id) 
          ? "Question unflagged for review" 
          : "Question flagged for review",
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const result = await submitExam();
      setLocation(`/results/${result.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit exam",
        variant: "destructive",
      });
    }
  };

  const handleTimeUp = () => {
    toast({
      title: "Time's up!",
      description: "Your exam has been automatically submitted.",
      variant: "destructive",
    });
    handleSubmit();
  };

  if (isLoading || !currentExam || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Exam Header with Timer */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{currentExam.title}</h2>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-6">
              {/* Progress Bar */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="w-32">
                  <Progress value={progress} className="h-2" />
                </div>
              </div>
              {/* Timer */}
              <ExamTimer onTimeUp={handleTimeUp} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Question Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex-1">
                  {currentQuestion.text}
                </h3>
                {flaggedQuestions.includes(currentQuestion.id) && (
                  <Badge variant="secondary" className="ml-4">
                    <Flag className="h-3 w-3 mr-1" />
                    Flagged
                  </Badge>
                )}
              </div>
              
              {/* Question Options */}
              <RadioGroup
                value={answers[currentQuestion.id] || ''}
                onValueChange={handleAnswerChange}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.value}
                    className="flex items-start space-x-3 p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-700">{option.label}.</span>
                        <span className="text-gray-900">{option.text}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleFlag}>
                  <Flag className="h-4 w-4 mr-2" />
                  {flaggedQuestions.includes(currentQuestion.id) ? 'Unflag' : 'Flag for Review'}
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => setShowSubmitDialog(true)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              </div>
              
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <QuestionNavigator />
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <DialogTitle>Submit Exam</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to submit your exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Questions Attempted:</span>
              <span className="font-medium">{answeredCount} / {questions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Time Remaining:</span>
              <span className="font-medium text-orange-600">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Flagged Questions:</span>
              <span className="font-medium">{flaggedQuestions.length}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Exam
            </Button>
            <Button onClick={handleSubmit} className="bg-primary">
              Submit Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
