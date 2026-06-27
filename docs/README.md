# ExamGuard

> AI-Based Online Examination Integrity Monitoring System

![Next.js](https://img.shields.io/badge/Next.js-16.2-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-green)
![License](https://img.shields.io/badge/License-Academic-red)

---

## 1. Project Description

ExamGuard is an AI-powered online examination integrity monitoring system designed to ensure fair assessments in educational environments. The platform provides real-time surveillance capabilities that detect and document potential cheating behaviors during exam sessions.

### Purpose

- Maintain academic integrity during online examinations
- Provide teachers with real-time visibility into student activities
- Create a secure, distraction-free exam environment
- Generate comprehensive violation reports for review

### Problem Solved

Traditional online exams lack effective monitoring mechanisms. Students can easily switch tabs, copy content, or navigate away from the exam window. ExamGuard addresses these vulnerabilities by implementing multi-layered detection systems that track suspicious activities and provide teachers with actionable insights.

### Main Features

- **Real-time Monitoring**: Live tracking of student exam sessions
- **Integrity Agent**: Client-side detection of suspicious behaviors
- **Risk Analysis**: Automated scoring of student activities
- **Violation Timeline**: Chronological documentation of all detected events
- **Role-based Dashboards**: Separate interfaces for students and teachers
- **Responsive Design**: Full functionality across desktop, tablet, and mobile devices

---

## 2. Architecture

```
exam-integrity-agent/
├── app/                          # Next.js App Router pages
│   ├── auth/                     # Authentication routes
│   ├── dashboard-guru/          # Teacher dashboard (Indonesian)
│   ├── dashboard-mahasiswa/     # Student dashboard (Indonesian)
│   │   └── exam/
│   │       └── [id]/            # Dynamic exam session page
│   ├── login/                   # Login page
│   ├── profile/                 # User profile management
│   ├── settings/                # Application settings
│   ├── signup/                  # Registration page
│   ├── globals.css              # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   ├── exam/                    # Exam-related components
│   ├── navbar.tsx              # Navigation component
│   ├── student/                # Student-specific components
│   │   ├── exam-workspace.tsx  # Exam-taking interface
│   │   └── student-dashboard-content.tsx
│   ├── teacher/                 # Teacher-specific components
│   │   ├── teacher-dashboard.tsx
│   │   ├── student-card.tsx    # Individual student monitoring card
│   │   ├── kpi-card.tsx        # Key performance indicators
│   │   ├── live-activity-bar.tsx
│   │   └── question-heatmap.tsx
│   └── ui/                     # Reusable UI components
│       ├── scientific-background.tsx
│       ├── security-alert.tsx
│       └── toast.tsx
├── hooks/                       # Custom React hooks
│   └── use-integrity-agent.ts  # Core integrity monitoring hook
├── lib/                         # Utility libraries
│   ├── supabase/               # Supabase client configuration
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   ├── utils.ts                # General utilities
│   └── utils/
│       └── date.ts             # Date formatting utilities
├── public/                      # Static assets
├── supabase/                   # Database configuration
│   └── schema.sql              # Complete database schema
├── types/                      # TypeScript type definitions
│   └── supabase.ts             # Supabase-generated types
├── docs/                       # Documentation
│   └── DESIGN.md               # Design system documentation
├── .env.example                # Environment variables template
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Dependencies
├── postcss.config.mjs          # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

---

## 3. Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.2 | React framework with App Router |
| **TypeScript** | 5 | Type-safe JavaScript |
| **Tailwind CSS** | 4 | Utility-first styling |
| **Supabase** | 2.108 | Backend as a service, database, auth |
| **Framer Motion** | 12.41 | Animation library |
| **Lucide React** | 1.21 | Icon library |
| **clsx** | 2.1.1 | Conditional class names |
| **tailwind-merge** | 3.6 | Tailwind class merging |

---

## 4. Features

### Student Features

| Feature | Description |
|---------|-------------|
| **Login/Registration** | Secure authentication with email and password |
| **Dashboard** | View available exams, active sessions, and completed assessments |
| **Take Exam** | Interactive exam interface with question navigation |
| **Auto Save** | Automatic answer persistence to prevent data loss |
| **Submit Exam** | One-click exam submission with confirmation |
| **View Results** | Review completed exam details and responses |
| **Profile Management** | Update personal information |

### Teacher Features

| Feature | Description |
|---------|-------------|
| **Security Monitoring Center** | Real-time surveillance dashboard |
| **Live Activity Feed** | Real-time alerts for exam events |
| **Student Monitoring** | Individual student card with activity details |
| **Violation Detection** | Automated detection and logging of suspicious behaviors |
| **Risk Analysis** | Visual risk scoring per student |
| **Session Filtering** | Filter by status (active, submitted, high-risk) |
| **Search** | Quick student or exam search |

### System Features

| Feature | Description |
|---------|-------------|
| **Authentication** | Supabase Auth with role-based access (teacher/student) |
| **Realtime Updates** | Live monitoring via Supabase Realtime |
| **Responsive UI** | Optimized for 320px to 1920px+ screens |
| **Role-based Routing** | Automatic redirect based on user role |
| **Auto Profile Creation** | Automatic profile generation on signup |

---

## 5. Cheating Detection

The integrity agent (`useIntegrityAgent` hook) monitors and detects the following behaviors:

| Detection Type | Event Type | Description |
|----------------|------------|-------------|
| **Tab Switching** | `tab_switch` | Detects when exam window loses focus |
| **Window Blur** | `tab_switch` | Monitors focus/blur events on window |
| **Lost Focus** | `visibility_hidden` | Triggers when document becomes hidden |
| **Return Duration** | `visibility_hidden` | Tracks time away from exam (threshold: 5 seconds) |
| **Mouse Leave** | `mouse_leave` | Detects mouse leaving top of viewport |
| **Copy/Paste** | `copy_paste` | Monitors copy, paste, and cut operations |
| **Keyboard Shortcuts** | Prevention | Blocks Ctrl+C, Ctrl+V, Ctrl+P, F12, DevTools |

### Risk Scoring

Each violation contributes to a student's risk score:

| Violation Type | Risk Points |
|----------------|-------------|
| Copy/Paste | 30 |
| Visibility Hidden | 25 |
| Tab Switch | 15 |
| Mouse Leave | 10 |

Students with scores above 50 are flagged as **high-risk**.

---

## 6. Database Schema

### Tables

| Table | Description | Key Fields |
|-------|-------------|------------|
| `profiles` | User profiles and roles | id, role, name, created_at |
| `exams` | Exam definitions | id, title, description, teacher_id, duration_minutes |
| `questions` | Exam questions | id, exam_id, question_text, question_order, question_type, options, correct_answer |
| `exam_sessions` | Active exam instances | id, exam_id, student_id, current_question_index, status, started_at, completed_at |
| `student_answers` | Student responses | id, session_id, question_id, answer, answered_at |
| `cheating_events` | Violation logs | id, session_id, event_type, question_number, duration_seconds, details |

### Row Level Security

All tables have RLS (Row Level Security) policies ensuring:
- Students can only access their own data
- Teachers can view all student data for their exams
- Profile updates restricted to the owner

---

## 7. User Roles

| Role | Permissions |
|------|-------------|
| **Student** | Take exams, view own results, update own profile, submit answers |
| **Teacher** | View all exam sessions, monitor students, view violations, create exams and questions |

---

## 8. Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (local or cloud)

### Steps

```bash
# Clone the repository
git clone https://github.com/your-repo/exam-integrity-agent.git
cd exam-integrity-agent

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Configure your Supabase credentials in .env.local
```

---

## 9. Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Variable Descriptions

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client-side access |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin key (keep secret) |

---

## 10. Database Setup

### Option 1: SQL Migration

Run the complete schema from `supabase/schema.sql`:

```sql
-- Connect to Supabase SQL Editor and execute:
-- supabase/schema.sql
```

### Option 2: Supabase CLI

```bash
# Link your Supabase project
npx supabase link --project-ref your-project-ref

# Push migrations
npx supabase db push
```

The schema includes:
- Table creation with proper constraints
- Indexes for performance optimization
- Row Level Security policies
- Trigger for automatic profile creation
- Realtime publications for monitoring

---

## 11. Run Project

```bash
# Development mode
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 12. Demo Accounts

### Teacher Account

| Field | Value |
|-------|-------|
| Email | teacher@university.edu |
| Password | ******** |

### Student Account

| Field | Value |
|-------|-------|
| Email | student@university.edu |
| Password | ******** |

---

## 13. Project Workflow

### Student Flow

```
1. Login → Student Dashboard
2. View Available Exams
3. Start Exam → Create Session
4. Take Exam:
   - Read Questions
   - Select/Write Answers
   - Navigate Between Questions
   - Auto-save on each answer
5. Submit Exam
6. View Results (optional)
```

### Teacher Flow

```
1. Login → Teacher Dashboard (Security Monitoring Center)
2. View Live Activity Feed
3. Monitor KPI Cards:
   - Total Students
   - Active Sessions
   - Completed Sessions
   - Violations
   - Risk Overview
4. Filter Sessions:
   - All / Active / Submitted
   - High Risk / Safe / Warning / Critical
5. Search Students or Exams
6. Click Student Card for Details
7. Review Violation Timeline
```

---

## 14. Realtime Features

The system implements Supabase Realtime subscriptions for live monitoring:

| Channel | Table | Events | Purpose |
|---------|-------|--------|---------|
| `teacher-monitoring` | `cheating_events` | INSERT | Real-time violation alerts |

When a student triggers a violation:
1. Event is logged to `cheating_events` table
2. Supabase Realtime pushes the event to all connected teachers
3. Teacher dashboard updates immediately without refresh
4. Live activity bar shows new alert

---

## 15. Responsive Design

The application is fully responsive across all breakpoints:

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile XS | 320px - 375px | Single column, stacked elements |
| Mobile | 375px - 768px | Single column, optimized touch targets |
| Tablet | 768px - 1024px | Two-column grids where appropriate |
| Desktop | 1024px+ | Full layout with sidebar navigation |
| Large Desktop | 1440px+ | Expanded content area |

---

## 16. Screenshots

### Student Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🛡 ExamGuard                                    [Avatar ▼] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Your Exams                                                 │
│  Focus workspace for your assessments                       │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                   │
│  │ ● Active│  │✓ Complete│  │📚 Total │                   │
│  │    1    │  │    2     │  │    5    │                   │
│  └─────────┘  └─────────┘  └─────────┘                   │
│                                                             │
│  Available Exams                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📘  Introduction to Programming          [Start Exam ▶]││
│  │     Multiple choice • 60 minutes                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Teacher Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🛡 ExamGuard                                    [Avatar ▼] │
├─────────────────────────────────────────────────────────────┤
│  🔴 LIVE: Tab switch detected - John Doe                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌─────────┐ │
│  │ 👥 12│ │ ✓  5 │ │ ✓  7 │ │ ⚠ 8 │ │ 🔴 3 │ │ Safe 5 │ │
│  │Student│ │Active│ │Done  │ │Viol. │ │Risk  │ │Warn 3  │ │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │Crit 0  │ │
│                                               └─────────┘ │
│  [All] [Active] [Submitted] [High Risk] [Safe] [Warning]   │
│  🔍 Search...                                              │
│                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐       │
│  │ 👤 John Doe          │  │ 👤 Jane Smith        │       │
│  │ 📘 Math Final        │  │ 📘 Math Final        │       │
│  │ ⚠ 3 violations       │  │ ✓ No violations      │       │
│  │ Risk: ████░░ 60%      │  │ Risk: ░░░░░ 0%       │       │
│  │ [View Details]        │  │ [View Details]        │       │
│  └──────────────────────┘  └──────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 17. Future Improvements

Planned features for future development:

- **AI Face Detection**: Webcam-based face recognition during exams
- **Screen Recording Detection**: Monitor for screen recording software
- **Browser Lockdown**: Fullscreen-only mode enforcement
- **Voice Detection**: Audio monitoring for suspicious sounds
- **PDF Export**: Generate printable violation reports
- **Email Notifications**: Alert teachers via email for critical violations
- **Exam Timer**: Enhanced countdown with warnings
- **Question Bank**: Reusable question templates
- **Analytics Dashboard**: Historical performance trends
- **Multi-language Support**: i18n for international institutions

---

## 18. License

This project is developed for academic purposes.

**License**: Academic Project - Educational Use Only

---

## 19. Author

| Field | Value |
|-------|-------|
| Project | ExamGuard |
| Type | Academic Project |
| Year | 2026 |
| Purpose | AI-Based Online Examination Integrity Monitoring |

---

## Getting Help

If you encounter any issues:

1. Check the `docs/DESIGN.md` for design system documentation
2. Review `supabase/schema.sql` for database structure
3. Examine component files in `components/` for implementation details
4. Check environment variables are properly configured

---

Built with ❤️ for academic integrity