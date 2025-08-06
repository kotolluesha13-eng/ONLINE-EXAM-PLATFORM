import { create } from 'zustand';
import { apiRequest } from '@/lib/queryClient';
import type { Exam, Question, ExamSession, ExamResult } from '@shared/schema';

interface ExamState {
  currentExam: Exam | null;
  currentSession: ExamSession | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, string>;
  flaggedQuestions: string[];
  timeRemaining: number;
  isLoading: boolean;
  
  // Actions
  startExam: (examId: string) => Promise<void>;
  loadQuestions: (examId: string) => Promise<void>;
  setCurrentQuestion: (index: number) => void;
  saveAnswer: (questionId: string, answer: string) => void;
  toggleFlag: (questionId: string) => void;
  updateTimeRemaining: (seconds: number) => void;
  submitExam: () => Promise<ExamResult>;
  saveProgress: () => Promise<void>;
}

export const useExam = create<ExamState>((set, get) => ({
  currentExam: null,
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  flaggedQuestions: [],
  timeRemaining: 0,
  isLoading: false,

  startExam: async (examId: string) => {
    set({ isLoading: true });
    try {
      // Start exam session
      const sessionResponse = await apiRequest('POST', `/api/exams/${examId}/start`);
      const session = await sessionResponse.json();
      
      // Get exam details
      const examResponse = await apiRequest('GET', `/api/exams/${examId}`);
      const exam = await examResponse.json();

      set({
        currentSession: session,
        currentExam: exam,
        timeRemaining: session.timeRemaining,
        answers: session.answers || {},
        flaggedQuestions: session.flaggedQuestions || [],
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loadQuestions: async (examId: string) => {
    set({ isLoading: true });
    try {
      const response = await apiRequest('GET', `/api/exams/${examId}/questions`);
      const questions = await response.json();
      set({ questions, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCurrentQuestion: (index: number) => {
    set({ currentQuestionIndex: index });
  },

  saveAnswer: (questionId: string, answer: string) => {
    const state = get();
    const newAnswers = { ...state.answers, [questionId]: answer };
    set({ answers: newAnswers });
    
    // Auto-save progress
    get().saveProgress();
  },

  toggleFlag: (questionId: string) => {
    const state = get();
    const flagged = state.flaggedQuestions.includes(questionId);
    const newFlagged = flagged 
      ? state.flaggedQuestions.filter(id => id !== questionId)
      : [...state.flaggedQuestions, questionId];
    
    set({ flaggedQuestions: newFlagged });
    get().saveProgress();
  },

  updateTimeRemaining: (seconds: number) => {
    set({ timeRemaining: seconds });
  },

  saveProgress: async () => {
    const state = get();
    if (!state.currentSession) return;

    try {
      await apiRequest('PATCH', `/api/exam-sessions/${state.currentSession.id}`, {
        answers: state.answers,
        flaggedQuestions: state.flaggedQuestions,
        timeRemaining: state.timeRemaining,
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  },

  submitExam: async () => {
    const state = get();
    if (!state.currentSession) {
      throw new Error('No active exam session');
    }

    const response = await apiRequest('POST', `/api/exam-sessions/${state.currentSession.id}/submit`);
    return await response.json();
  },
}));
