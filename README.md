# Online Exam Platform

A full-stack web application for online exam management that allows users to register, authenticate, take timed exams, and view their results.

## 🚀 Features

- **User Authentication**: JWT-based secure login and registration
- **Timed Exams**: 30-minute timer with auto-submit functionality
- **Question Navigation**: Navigate between questions with Previous/Next buttons
- **Answer Flagging**: Mark questions for review during exam
- **Progress Tracking**: Real-time progress indicator
- **Automatic Scoring**: Instant score calculation upon submission
- **Result Analytics**: Detailed performance breakdown by topic
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **TanStack Query** for server state management
- **Zustand** for client state management
- **React Hook Form** with Zod validation
- **Wouter** for routing

### Backend
- **Node.js** with Express.js
- **TypeScript** with ES modules
- **JWT** authentication with bcrypt password hashing
- **Drizzle ORM** for database operations
- **PostgreSQL** with Neon serverless driver
- **Express sessions** with PostgreSQL store

## 📊 Database Schema

- **Users**: User accounts with email and password
- **Exams**: Exam metadata (title, description, duration, passing score)
- **Questions**: MCQ questions with options and correct answers
- **Exam Sessions**: Active exam sessions with user answers and timing
- **Exam Results**: Completed exam results with scores and analytics

## 🎯 Available Exams

1. **JavaScript Fundamentals** (10 questions)
   - Variables and data types
   - Functions and scope
   - Arrays and objects
   - ES6+ features

2. **React Concepts** (15 questions)
   - Components and JSX
   - State and props
   - Hooks and lifecycle
   - Event handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kotolluesha13-eng/ONLINE-EXAM-PLATFORM.git
cd ONLINE-EXAM-PLATFORM
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env file with:
DATABASE_URL=your_postgresql_connection_string
```

4. Push database schema:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Express backend
│   ├── db.ts              # Database configuration
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                # Shared types and schemas
│   └── schema.ts          # Drizzle database schema
└── README.md
```

## 🔐 Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. JWT token is issued upon successful login
4. Token is stored in localStorage for subsequent requests
5. Protected routes validate JWT token on each request

## 📝 Exam Flow

1. User selects an exam from dashboard
2. Exam session is created with unique ID
3. Questions are fetched and displayed one by one
4. User answers are saved in real-time
5. Timer counts down from 30 minutes
6. Auto-submit triggers when time expires
7. Score is calculated and result is stored
8. User can view detailed results with analytics

## 🎨 UI/UX Features

- Clean, modern interface with shadcn/ui components
- Dark/light theme support
- Mobile-responsive design
- Loading states and error handling
- Toast notifications for user feedback
- Progress indicators and timers

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## 🚀 Deployment

This application can be deployed on:
- **Vercel** (frontend) + **Railway/Supabase** (backend + database)
- **Netlify** (frontend) + **Heroku** (backend) + **PostgreSQL** (database)
- **DigitalOcean App Platform** or **AWS** for full-stack deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

A comprehensive online exam platform built with modern web technologies, demonstrating full-stack development skills with React, TypeScript, and Node.js.

---

**Note**: This project excludes admin panel, question bank management, analytics dashboard, and webcam proctoring features as per assignment requirements.