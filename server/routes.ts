import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { insertUserSchema, loginSchema, updateExamSessionSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Middleware to verify JWT token
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        user: { id: user.id, email: user.email, username: user.username, fullName: user.fullName },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        user: { id: user.id, email: user.email, username: user.username, fullName: user.fullName },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, username: user.username, fullName: user.fullName });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Exam routes
  app.get("/api/exams", authenticateToken, async (req, res) => {
    try {
      const exams = await storage.getActiveExams();
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/exams/:examId", authenticateToken, async (req, res) => {
    try {
      const exam = await storage.getExam(req.params.examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }
      res.json(exam);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Start exam session
  app.post("/api/exams/:examId/start", authenticateToken, async (req, res) => {
    try {
      const examId = req.params.examId;
      const userId = req.user.userId;

      // Check if exam exists
      const exam = await storage.getExam(examId);
      if (!exam) {
        return res.status(404).json({ message: "Exam not found" });
      }

      // Check if user already has an active session for this exam
      const existingSession = await storage.getActiveExamSession(userId, examId);
      if (existingSession) {
        return res.json(existingSession);
      }

      // Create new exam session
      const session = await storage.createExamSession({
        userId,
        examId,
        timeRemaining: exam.duration * 60, // Convert minutes to seconds
        answers: {},
        flaggedQuestions: [],
      });

      res.status(201).json(session);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get exam questions
  app.get("/api/exams/:examId/questions", authenticateToken, async (req, res) => {
    try {
      const examId = req.params.examId;
      
      // Verify user has an active session for this exam
      const session = await storage.getActiveExamSession(req.user.userId, examId);
      if (!session) {
        return res.status(403).json({ message: "No active exam session found" });
      }

      const questions = await storage.getExamQuestions(examId);
      
      // Get exam details for question count
      const exam = await storage.getExam(examId);
      const questionCount = exam?.questionCount || 25;
      
      // Randomize questions order
      const shuffledQuestions = questions.sort(() => Math.random() - 0.5)
        .slice(0, questionCount);

      res.json(shuffledQuestions);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update exam session (save answers, flags, time)
  app.patch("/api/exam-sessions/:sessionId", authenticateToken, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const updates = updateExamSessionSchema.parse(req.body);

      const session = await storage.getExamSession(sessionId);
      if (!session || session.userId !== req.user.userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.isCompleted) {
        return res.status(400).json({ message: "Exam already completed" });
      }

      const updatedSession = await storage.updateExamSession(sessionId, updates);
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Submit exam
  app.post("/api/exam-sessions/:sessionId/submit", authenticateToken, async (req, res) => {
    try {
      const sessionId = req.params.sessionId;

      const session = await storage.getExamSession(sessionId);
      if (!session || session.userId !== req.user.userId) {
        return res.status(404).json({ message: "Session not found" });
      }

      if (session.isCompleted) {
        return res.status(400).json({ message: "Exam already completed" });
      }

      // Calculate score
      const questions = await storage.getExamQuestions(session.examId);
      const answers = session.answers || {};
      
      let correctAnswers = 0;
      questions.forEach((question: any) => {
        if (answers[question.id] === question.correctAnswer) {
          correctAnswers++;
        }
      });

      const totalQuestions = questions.length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      // Get exam duration
      const exam = await storage.getExam(session.examId);
      const timeTaken = exam ? (exam.duration * 60) - (session.timeRemaining || 0) : 0;
      const passed = score >= 70; // 70% passing score

      // Mark session as completed
      await storage.updateExamSession(sessionId, {
        isCompleted: true,
        submittedAt: new Date(),
      });

      // Create exam result
      const result = await storage.createExamResult({
        sessionId,
        userId: session.userId,
        examId: session.examId,
        score,
        correctAnswers,
        totalQuestions,
        timeTaken,
        passed,
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get exam results for user
  app.get("/api/results", authenticateToken, async (req, res) => {
    try {
      const results = await storage.getUserExamResults(req.user.userId);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific exam result
  app.get("/api/results/:resultId", authenticateToken, async (req, res) => {
    try {
      const result = await storage.getExamResult(req.params.resultId);
      if (!result || result.userId !== req.user.userId) {
        return res.status(404).json({ message: "Result not found" });
      }
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
