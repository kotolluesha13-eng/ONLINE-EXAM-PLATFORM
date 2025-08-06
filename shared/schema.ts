import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(), // in minutes
  questionCount: integer("question_count").notNull(),
  difficulty: text("difficulty").notNull(),
  tags: jsonb("tags").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  text: text("text").notNull(),
  options: jsonb("options").$type<{ label: string; text: string; value: string }[]>().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  order: integer("order").notNull(),
});

export const examSessions = pgTable("exam_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: integer("user_id").references(() => users.id).notNull(),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  submittedAt: timestamp("submitted_at"),
  timeRemaining: integer("time_remaining"), // in seconds
  answers: jsonb("answers").$type<Record<string, string>>().default({}),
  flaggedQuestions: jsonb("flagged_questions").$type<string[]>().default([]),
  isCompleted: boolean("is_completed").default(false).notNull(),
});

export const examResults = pgTable("exam_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").references(() => examSessions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  examId: varchar("exam_id").references(() => exams.id).notNull(),
  score: integer("score").notNull(), // percentage
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(), // in seconds
  passed: boolean("passed").notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  examSessions: many(examSessions),
  examResults: many(examResults),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  questions: many(questions),
  examSessions: many(examSessions),
  examResults: many(examResults),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  exam: one(exams, {
    fields: [questions.examId],
    references: [exams.id],
  }),
}));

export const examSessionsRelations = relations(examSessions, ({ one }) => ({
  user: one(users, {
    fields: [examSessions.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [examSessions.examId],
    references: [exams.id],
  }),
  result: one(examResults),
}));

export const examResultsRelations = relations(examResults, ({ one }) => ({
  session: one(examSessions, {
    fields: [examResults.sessionId],
    references: [examSessions.id],
  }),
  user: one(users, {
    fields: [examResults.userId],
    references: [users.id],
  }),
  exam: one(exams, {
    fields: [examResults.examId],
    references: [exams.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertExamSessionSchema = createInsertSchema(examSessions).omit({
  id: true,
  startedAt: true,
  submittedAt: true,
  isCompleted: true,
});

export const updateExamSessionSchema = createInsertSchema(examSessions).partial().omit({
  id: true,
  userId: true,
  examId: true,
  startedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type Exam = typeof exams.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type ExamSession = typeof examSessions.$inferSelect;
export type ExamResult = typeof examResults.$inferSelect;
export type InsertExamSession = z.infer<typeof insertExamSessionSchema>;
export type UpdateExamSession = z.infer<typeof updateExamSessionSchema>;
