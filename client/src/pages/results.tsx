import { useQuery } from '@tanstack/react-query';
import { useRoute, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Home, Download, BarChart } from 'lucide-react';
import type { ExamResult } from '@shared/schema';

export default function ResultsPage() {
  const [, params] = useRoute('/results/:resultId');
  const [, setLocation] = useLocation();

  const { data: result, isLoading } = useQuery<ExamResult>({
    queryKey: ['/api/results', params?.resultId],
    enabled: !!params?.resultId,
  });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes} minutes ${remainingSeconds} seconds`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h1>
          <p className="text-gray-600 mb-4">The exam result you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation('/dashboard')}>
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            result.passed ? 'bg-green-500' : 'bg-red-500'
          }`}>
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Exam Completed!</h1>
          <p className="text-gray-600">Your assessment has been successfully submitted</p>
        </div>

        {/* Results Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  result.passed ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.score}%
                </div>
                <div className="text-gray-600">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {result.correctAnswers}
                </div>
                <div className="text-gray-600">Correct Answers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-500 mb-2">
                  {result.totalQuestions - result.correctAnswers}
                </div>
                <div className="text-gray-600">Incorrect Answers</div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Score Breakdown</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Questions</span>
                  <span className="font-medium">{result.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Questions Attempted</span>
                  <span className="font-medium">{result.totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Time Taken</span>
                  <span className="font-medium">{formatTime(result.timeTaken)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed At</span>
                  <span className="font-medium">{formatDate(result.completedAt.toString())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Passing Score</span>
                  <span className="font-medium">70%</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                  <span className="text-lg font-medium text-gray-900">Result</span>
                  <Badge className={`text-lg font-bold ${
                    result.passed 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-red-500 hover:bg-red-600'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Overview</h3>
              <div className="bg-gray-100 rounded-lg p-6 text-center">
                <BarChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Detailed Performance Analysis</p>
                <p className="text-sm text-gray-500">
                  You scored {result.score}% ({result.correctAnswers} out of {result.totalQuestions} questions correct)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="bg-primary hover:bg-blue-700"
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
        </div>
      </div>
    </div>
  );
}
