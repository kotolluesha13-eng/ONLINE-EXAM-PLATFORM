import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, BarChart, Play } from 'lucide-react';
import type { Exam, ExamResult } from '@shared/schema';

export default function DashboardPage() {
  const [, setLocation] = useLocation();

  const { data: exams, isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ['/api/exams'],
  });

  const { data: results, isLoading: resultsLoading } = useQuery<ExamResult[]>({
    queryKey: ['/api/results'],
  });

  const handleStartExam = (examId: string) => {
    setLocation(`/exam/${examId}`);
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} minutes`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (examsLoading || resultsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Dashboard</h1>
          <p className="text-gray-600">Welcome to your assessment center</p>
        </div>

        {/* Available Exams Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">Available Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            {!exams || exams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No exams available at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div
                    key={exam.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {exam.title}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 mr-2" />
                            <span>Duration: {formatDuration(exam.duration)}</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span>Questions: {exam.questionCount}</span>
                          </div>
                          <div className="flex items-center">
                            <BarChart className="h-4 w-4 text-gray-400 mr-2" />
                            <span>Difficulty: {exam.difficulty}</span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-4">{exam.description}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getDifficultyColor(exam.difficulty)}>
                            {exam.difficulty}
                          </Badge>
                          {exam.tags?.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="ml-6 flex-shrink-0">
                        <Button
                          onClick={() => handleStartExam(exam.id)}
                          className="bg-primary hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Start Exam
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!results || results.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <BarChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No exam results yet. Take your first exam to see results here!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => (
                  <div
                    key={result.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        Exam Result
                      </h4>
                      <p className="text-sm text-gray-600">
                        Completed on {formatDate(result.completedAt.toString())}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-semibold ${
                        result.passed ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {result.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.passed ? 'Passed' : 'Failed'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
