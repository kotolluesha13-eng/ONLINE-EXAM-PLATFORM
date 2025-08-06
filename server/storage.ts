import { 
  users, 
  exams, 
  questions, 
  examSessions, 
  examResults,
  type User, 
  type InsertUser,
  type Exam,
  type Question,
  type ExamSession,
  type ExamResult,
  type InsertExamSession,
  type UpdateExamSession
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Exam methods
  getActiveExams(): Promise<Exam[]>;
  getExam(examId: string): Promise<Exam | undefined>;
  getExamQuestions(examId: string): Promise<Question[]>;
  
  // Exam session methods
  getActiveExamSession(userId: number, examId: string): Promise<ExamSession | undefined>;
  createExamSession(sessionData: InsertExamSession): Promise<ExamSession>;
  getExamSession(sessionId: string): Promise<ExamSession | undefined>;
  updateExamSession(sessionId: string, updates: UpdateExamSession): Promise<ExamSession>;
  
  // Exam result methods
  createExamResult(resultData: Omit<ExamResult, 'id' | 'completedAt'>): Promise<ExamResult>;
  getUserExamResults(userId: number): Promise<ExamResult[]>;
  getExamResult(resultId: string): Promise<ExamResult | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values([insertUser])
      .returning();
    return user;
  }

  async getActiveExams(): Promise<Exam[]> {
    return await db.select().from(exams).where(eq(exams.isActive, true));
  }

  async getExam(examId: string): Promise<Exam | undefined> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, examId));
    return exam || undefined;
  }

  async getExamQuestions(examId: string): Promise<Question[]> {
    return await db.select().from(questions).where(eq(questions.examId, examId));
  }

  async getActiveExamSession(userId: number, examId: string): Promise<ExamSession | undefined> {
    const [session] = await db
      .select()
      .from(examSessions)
      .where(
        and(
          eq(examSessions.userId, userId),
          eq(examSessions.examId, examId),
          eq(examSessions.isCompleted, false)
        )
      );
    return session || undefined;
  }

  async createExamSession(sessionData: InsertExamSession): Promise<ExamSession> {
    const [session] = await db
      .insert(examSessions)
      .values([sessionData])
      .returning();
    return session;
  }

  async getExamSession(sessionId: string): Promise<ExamSession | undefined> {
    const [session] = await db.select().from(examSessions).where(eq(examSessions.id, sessionId));
    return session || undefined;
  }

  async updateExamSession(sessionId: string, updates: UpdateExamSession): Promise<ExamSession> {
    const validUpdates: any = {};
    if (updates.timeRemaining !== undefined) validUpdates.timeRemaining = updates.timeRemaining;
    if (updates.answers !== undefined) validUpdates.answers = updates.answers;
    if (updates.flaggedQuestions !== undefined) validUpdates.flaggedQuestions = updates.flaggedQuestions;
    if (updates.submittedAt !== undefined) validUpdates.submittedAt = updates.submittedAt;
    if (updates.isCompleted !== undefined) validUpdates.isCompleted = updates.isCompleted;
    
    const [session] = await db
      .update(examSessions)
      .set(validUpdates)
      .where(eq(examSessions.id, sessionId))
      .returning();
    return session;
  }

  async createExamResult(resultData: Omit<ExamResult, 'id' | 'completedAt'>): Promise<ExamResult> {
    const [result] = await db
      .insert(examResults)
      .values([resultData])
      .returning();
    return result;
  }

  async getUserExamResults(userId: number): Promise<ExamResult[]> {
    return await db.select().from(examResults).where(eq(examResults.userId, userId));
  }

  async getExamResult(resultId: string): Promise<ExamResult | undefined> {
    const [result] = await db.select().from(examResults).where(eq(examResults.id, resultId));
    return result || undefined;
  }
}

export const storage = new DatabaseStorage();