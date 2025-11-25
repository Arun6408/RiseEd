# EduFlow - Complete Architecture Documentation

## Table of Contents

1. [Database Architecture](#database-architecture)
2. [Server Architecture](#server-architecture)
3. [Frontend Architecture](#frontend-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Documentation](#api-documentation)
6. [Real-time Communication](#real-time-communication)
7. [File Management](#file-management)
8. [Security Implementation](#security-implementation)

---

## Database Architecture

### Database System
- **Type**: PostgreSQL
- **Connection**: Connection pooling using `pg` library
- **Connection Management**: Single connection with retry logic (5 retries, 5-second delay)

### Database Schema

#### ENUM Types

```sql
- user_role: 'superAdmin', 'principal', 'teacher', 'student', 'parent'
- topic_type: 'video', 'content', 'pdf', 'questionAndAnswers'
- message_status: 'Seen', 'Delivered'
- answer_option: 'A', 'B', 'C', 'D'
- difficulty_level: 'Easy', 'Medium', 'Hard'
- ebook_genre: 'Fiction', 'Non-Fiction', 'Science', 'Technology', 'Cooking', 'Health', 'Education', 'Biography', 'Travel', 'History'
- salary_Transaction_Status: 'Paid', 'Pending'
- completion_status: 'not_started', 'in_progress', 'completed'
- activity_type: 'video_watch', 'quiz_attempt', 'homework', 'course_study', 'login'
```

#### Core Tables

##### 1. AllUsers
Central user table for all user types.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR(100))
- `userName` (VARCHAR(50) UNIQUE)
- `password` (VARCHAR(255))
- `role` (user_role ENUM)
- `age` (INT)
- `phone` (VARCHAR(15))
- `email` (VARCHAR(100) UNIQUE)
- `joinedAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

**Relationships:**
- Referenced by: Teachers, Students, Parents, Courses, Quiz, Ebooks, Messages, Homework, Salaries, Attendance, SchoolEvents

##### 2. Teachers
Teacher-specific information.

**Columns:**
- `teacherId` (SERIAL PRIMARY KEY)
- `department` (VARCHAR(30))
- `assignedClasses` (TEXT) - Comma-separated class list
- `userId` (INT) - Foreign Key → AllUsers(id)

##### 3. Students
Student-specific information.

**Columns:**
- `studentId` (SERIAL PRIMARY KEY)
- `class` (INT)
- `scholarshipAmount` (DECIMAL(10, 2))
- `userId` (INT) - Foreign Key → AllUsers(id)

##### 4. Parents
Parent information linked to students.

**Columns:**
- `parentId` (SERIAL PRIMARY KEY)
- `totalFee` (DECIMAL(10, 2))
- `feePaid` (DECIMAL(10, 2))
- `studentId` (INT) - Foreign Key → AllUsers(id)
- `userId` (INT) - Foreign Key → AllUsers(id)

##### 5. FeeStructure
Fee structure for different classes.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `class` (VARCHAR(50))
- `tuitionFee` (DECIMAL(10, 2))
- `labFee` (DECIMAL(10, 2))
- `sportsFee` (DECIMAL(10, 2))
- `transportFee` (DECIMAL(10, 2))
- `miscellaneousFee` (DECIMAL(10, 2))

#### Course Management Tables

##### 6. Videos
Video content storage.

**Columns:**
- `videoId` (SERIAL PRIMARY KEY)
- `videoDuration` (INT) - Duration in seconds
- `videoUrl` (VARCHAR(255))

##### 7. Courses
Course information.

**Columns:**
- `courseId` (SERIAL PRIMARY KEY)
- `class` (TEXT) - Comma-separated class list
- `title` (VARCHAR(100))
- `description` (TEXT)
- `content` (TEXT)
- `department` (VARCHAR(30))
- `userId` (INT) - Foreign Key → AllUsers(id) - Creator
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

##### 8. Chapters
Chapters within courses.

**Columns:**
- `chapterId` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(100))
- `description` (TEXT)
- `content` (TEXT)
- `courseId` (INT) - Foreign Key → Courses(courseId)
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

##### 9. Topics
Topics within chapters.

**Columns:**
- `topicId` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(100))
- `description` (TEXT)
- `content` (TEXT)
- `topicType` (topic_type ENUM)
- `videoId` (INT) - Foreign Key → Videos(videoId) - Optional
- `pdfUrl` (VARCHAR(255)) - Optional
- `questionAndAnswers` (TEXT) - JSON format
- `chapterId` (INT) - Foreign Key → Chapters(chapterId)
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Quiz System Tables

##### 10. Quiz
Quiz information.

**Columns:**
- `quizId` (SERIAL PRIMARY KEY)
- `quizTitle` (VARCHAR(100))
- `quizDescription` (TEXT)
- `quizCourseId` (INT) - Foreign Key → Courses(courseId)
- `createdByUserId` (INT) - Foreign Key → AllUsers(id)
- `assignedClasses` (TEXT) - Comma-separated class list
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

##### 11. QuizQuestions
Questions within quizzes.

**Columns:**
- `quizQuestionId` (SERIAL PRIMARY KEY)
- `quizId` (INT) - Foreign Key → Quiz(quizId)
- `question` (TEXT)
- `optionA` (TEXT)
- `optionB` (TEXT)
- `optionC` (TEXT)
- `optionD` (TEXT)
- `correctAnswer` (answer_option ENUM)
- `difficulty` (difficulty_level ENUM)

##### 12. QuizResults
Student quiz results.

**Columns:**
- `resultId` (SERIAL PRIMARY KEY)
- `quizId` (INT) - Foreign Key → Quiz(quizId)
- `userId` (INT) - Foreign Key → AllUsers(id)
- `totalQues` (INT)
- `correctCount` (INT)
- `wrongCount` (INT)
- `skippedCount` (INT)
- `timeSpent` (INT) - Time in minutes
- `score` (INT) - Calculated: (correctCount * 4) - (wrongCount * 1)
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Homework System Tables

##### 13. Homework
Homework assignments.

**Columns:**
- `homeworkId` (SERIAL PRIMARY KEY)
- `createdByUserId` (INT) - Foreign Key → AllUsers(id)
- `title` (VARCHAR(100))
- `description` (TEXT)
- `assignedClasses` (TEXT) - Comma-separated class list
- `dueDate` (TIMESTAMP)
- `fileType` (VARCHAR(20)) - Optional
- `fileUrl` (VARCHAR(255)) - Optional
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

##### 14. HomeworkSubmissions
Student homework submissions.

**Columns:**
- `submissionId` (SERIAL PRIMARY KEY)
- `homeworkId` (INT) - Foreign Key → Homework(homeworkId)
- `submittedByUserId` (INT) - Foreign Key → AllUsers(id)
- `answertext` (TEXT)
- `fileType` (VARCHAR(20)) - Optional
- `fileUrl` (VARCHAR(255)) - Optional
- `grade` (DECIMAL(3,2)) - Optional, max 10.00
- `submittedAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### E-Books Table

##### 15. Ebooks
E-book library.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `title` (VARCHAR(255))
- `createdByUserId` (INT) - Foreign Key → AllUsers(id)
- `description` (TEXT)
- `genre` (ebook_genre ENUM)
- `fileUrl` (VARCHAR(255))
- `uploadDate` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Messaging System Tables

##### 16. Messages
Real-time messaging between users.

**Columns:**
- `messageId` (SERIAL PRIMARY KEY)
- `senderId` (INT) - Foreign Key → AllUsers(id)
- `receiverId` (INT) - Foreign Key → AllUsers(id)
- `message` (TEXT)
- `createdAt` (VARCHAR(50)) - Custom format: "DD/MM/YYYY HH:MM AM/PM"
- `viewStatus` (message_status ENUM) - Default: 'Delivered'
- `fileType` (VARCHAR(20)) - 'Message' or 'Pdf', 'Image', etc.
- `fileUrl` (VARCHAR(255)) - Optional

#### Salary Management Tables

##### 17. Salaries
Teacher salary structure.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `userId` (INT) - Foreign Key → AllUsers(id)
- `basic` (DECIMAL(10,2))
- `rentAllowance` (DECIMAL(10,2))
- `foodAllowance` (DECIMAL(10,2))
- `travelAllowance` (DECIMAL(10,2))
- `otherAllowance` (DECIMAL(10,2))
- `taxDeduction` (DECIMAL(10,2))
- `providentFund` (DECIMAL(10,2))
- `otherDeductions` (DECIMAL(10,2))
- `netSalary` (DECIMAL(10,2)) - GENERATED ALWAYS AS (calculated) STORED
- `lastIncrementDate` (DATE)
- `lastIncrementAmount` (DECIMAL(10,2))
- `nextAppraisalDate` (DATE)

##### 18. SalaryTransactions
Salary payment history.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `userId` (INT) - Foreign Key → AllUsers(id)
- `transactionDate` (DATE)
- `transactionId` (VARCHAR(50) UNIQUE)
- `salaryMonth` (VARCHAR(20)) - Format: "Jan 2024"
- `amount` (DECIMAL(10,2))
- `status` (salary_Transaction_Status ENUM) - Default: 'Pending'
- `payslipUrl` (VARCHAR(255)) - Optional
- `createdAt` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

#### Additional Tables

##### 19. Attendance
User attendance tracking.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `userId` (INT) - Foreign Key → AllUsers(id)
- `attendanceDate` (DATE)

##### 20. SchoolEvents
School events calendar.

**Columns:**
- `id` (SERIAL PRIMARY KEY)
- `conductedBy` (INT) - Foreign Key → AllUsers(id)
- `title` (VARCHAR(100))
- `description` (TEXT)
- `eventType` (VARCHAR(50))
- `startDate` (DATE)
- `endDate` (DATE)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Database Relationships

```
AllUsers (1) ──→ (N) Teachers
AllUsers (1) ──→ (N) Students
AllUsers (1) ──→ (N) Parents
AllUsers (1) ──→ (N) Courses
AllUsers (1) ──→ (N) Quiz
AllUsers (1) ──→ (N) Ebooks
AllUsers (1) ──→ (N) Messages (as sender)
AllUsers (1) ──→ (N) Messages (as receiver)
AllUsers (1) ──→ (N) Homework
AllUsers (1) ──→ (N) HomeworkSubmissions
AllUsers (1) ──→ (N) QuizResults
AllUsers (1) ──→ (N) Salaries
AllUsers (1) ──→ (N) SalaryTransactions
AllUsers (1) ──→ (N) Attendance
AllUsers (1) ──→ (N) SchoolEvents

Courses (1) ──→ (N) Chapters
Chapters (1) ──→ (N) Topics
Videos (1) ──→ (N) Topics
Courses (1) ──→ (N) Quiz
Quiz (1) ──→ (N) QuizQuestions
Quiz (1) ──→ (N) QuizResults
Homework (1) ──→ (N) HomeworkSubmissions
```

---

## Server Architecture

### Server Structure

```
Server/
├── index.js                 # Entry point, Express app setup
├── db/
│   └── connectDb.js         # PostgreSQL connection management
├── routes/                   # API route definitions
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   ├── quizRoutes.js
│   ├── homeworkRoutes.js
│   ├── ebooksRoutes.js
│   ├── messageRouter.js
│   ├── salariesRoutes.js
│   ├── teacherRoutes.js
│   └── studentRoutes.js
├── controllers/              # Business logic
│   ├── loginController.js
│   ├── courses/
│   │   ├── courseController.js
│   │   ├── chapterController.js
│   │   └── topicController.js
│   ├── quizController.js
│   ├── homeworkController.js
│   ├── ebooksController.js
│   ├── messageController.js
│   ├── salariesController.js
│   ├── teacherController.js
│   ├── studentController.js
│   ├── utilController.js
│   └── webSocketController.js
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── dbMiddleware.js      # Database connection check
│   └── validationMiddleware.js # Input validation
└── utils/
    └── errorHandler.js
```

### Server Configuration

**Express Setup:**
- JSON body parser
- URL-encoded body parser
- CORS with credentials
- Database connection middleware
- JWT authentication middleware (applied globally after `/api/auth`)

**Port Configuration:**
- Default: 5000
- Configurable via `PORT` environment variable

### Middleware Stack

1. **ensureDbConnection** (Global)
   - Ensures database connection before processing requests
   - Applied to all routes

2. **verifyToken** (Global, after `/api/auth`)
   - Verifies JWT token from `Authorization: Bearer <token>` header
   - Extracts user info and attaches to `req.user`
   - Returns 401 if token is missing/invalid/expired

3. **Validation Middleware** (Route-specific)
   - Uses `express-validator` for input validation
   - Validates request body, params, query
   - Returns validation errors if invalid

### Route Organization

#### Authentication Routes (`/api/auth`)
- **POST /login**: Public, no auth required
- **POST /register**: Requires auth, role-based access
- **GET /superAdmin/login**: Requires auth, superAdmin only
- **POST /superAdmin/login**: Requires auth, superAdmin only

#### Course Routes (`/api/courses`)
All routes require authentication.

**Course Operations:**
- `GET /` - Get all courses
- `POST /` - Create course (validation required)
- `GET /:courseId` - Get course details
- `DELETE /:courseId` - Delete course

**Chapter Operations:**
- `GET /:courseId/chapters` - Get all chapters
- `POST /:courseId/chapters` - Create chapter (validation required)
- `GET /:courseId/chapters/:chapterId` - Get chapter details
- `DELETE /:courseId/chapters/:chapterId` - Delete chapter

**Topic Operations:**
- `GET /:courseId/chapters/:chapterId/topics` - Get all topics
- `POST /:courseId/chapters/:chapterId/topics` - Create topic (validation required)
- `GET /:courseId/chapters/:chapterId/topics/:topicId` - Get topic details
- `DELETE /:courseId/chapters/:chapterId/topics/:topicId` - Delete topic
- `PATCH /:courseId/chapters/:chapterId/topics/:topicId` - Update topic time

#### Quiz Routes (`/api/quiz`)
- `GET /quiz` - Get all quizzes
- `POST /quiz` - Create quiz (validation required)
- `GET /quiz/:quizId` - Get quiz details
- `DELETE /quiz/:quizId` - Delete quiz
- `GET /quizResults` - Get all quiz results
- `POST /quizResults` - Submit quiz results (validation required)

#### Homework Routes (`/api/homework`)
- `GET /` - Get all homeworks (supports `?homeworkid=<id>` query)
- `POST /` - Create homework
- `GET /submit` - Get submitted homeworks
- `POST /submit` - Submit homework
- `PATCH /submit` - Grade homework

#### E-Books Routes (`/api/ebooks`)
- `GET /` - Get all ebooks
- `POST /` - Create ebook (validation required)
- `GET /:id` - Get ebook by ID
- `DELETE /:id` - Delete ebook

#### Messages Routes (`/api/messages`)
- `GET /` - Get all messages for current user
- `GET /:selectedUserId` - Get messages between current user and selected user
- `DELETE /:selectedUserId` - Delete messages between users

#### Salaries Routes (`/api/salaries`)
- `GET /` - Get all salaries
- `POST /pay` - Pay salary (create transaction)

#### Teacher Routes (`/api/teacher`)
- `GET /dashboard` - Get teacher dashboard information

#### Student Routes (`/api/student`)
- `GET /dashboard` - Get student dashboard information
- `GET /selfAnalysis` - Get student self-analysis data

### Controller Pattern

Controllers follow a consistent pattern:
1. Extract user from `req.user` (set by auth middleware)
2. Validate role permissions (if needed)
3. Get database connection
4. Execute database queries
5. Return JSON response with status and data

**Response Format:**
```javascript
{
  status: "success" | "failed" | "error",
  message: "Human-readable message",
  data: { /* response data */ },
  error: "Error message (if failed)"
}
```

### Error Handling

- Try-catch blocks in all async controllers
- Database errors logged to console
- User-friendly error messages returned
- HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request (validation errors)
  - 401: Unauthorized (authentication)
  - 403: Forbidden (authorization)
  - 404: Not Found
  - 409: Conflict (duplicate entries)
  - 500: Internal Server Error

---

## Frontend Architecture

### Frontend Structure

```
eduflow/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout
│   ├── page.tsx             # Home page
│   ├── loading.tsx          # Loading component
│   ├── globals.css          # Global styles
│   ├── auth/
│   │   ├── login/           # Login page
│   │   └── register/        # Registration page
│   ├── student/             # Student routes
│   │   ├── page.tsx         # Dashboard
│   │   ├── StudentLayout.tsx
│   │   ├── courses/
│   │   ├── homework/
│   │   ├── quizzes/
│   │   ├── ebooks/
│   │   ├── doubts/
│   │   └── selfAnalysis/
│   ├── teacher/             # Teacher routes
│   │   ├── page.tsx         # Dashboard
│   │   ├── TeacherLayout.tsx
│   │   ├── courses/
│   │   ├── homework/
│   │   ├── quizzes/
│   │   ├── ebooks/
│   │   ├── doubts/
│   │   ├── studentsStatus/
│   │   └── profileSalary/
│   ├── principal/           # Principal routes
│   │   ├── page.tsx         # Dashboard
│   │   ├── PrincipalLayout.tsx
│   │   ├── courses/
│   │   ├── registrations/
│   │   ├── students/
│   │   ├── teachersStats/
│   │   ├── feeDues/
│   │   └── events/
│   └── superAdmin/           # Super Admin routes
├── components/
│   ├── Navbars/             # Navigation components
│   ├── pages/               # Page components
│   │   ├── Courses/
│   │   ├── Ebooks/
│   │   ├── Homeworks/
│   │   └── Quiz/
│   ├── ui/                  # UI components
│   ├── hooks/               # Custom hooks
│   └── utils/               # Utility components
├── utils/
│   └── util.ts              # Utility functions
├── lib/
│   └── utils.ts             # Library utilities
├── constants.tsx            # Constants and navigation links
├── types.ts                 # TypeScript type definitions
└── middleware.ts            # Next.js middleware for route protection
```

### Frontend Routing

**Next.js App Router** with file-based routing:

- `/` - Public home page
- `/auth/login` - Login page (public)
- `/auth/register` - Registration page
- `/student/*` - Student routes (protected)
- `/teacher/*` - Teacher routes (protected)
- `/principal/*` - Principal routes (protected)
- `/superAdmin` - Super Admin dashboard (protected)
- `/unauthorized` - Unauthorized access page

### Route Protection

**Middleware (`middleware.ts`):**
- Checks user cookie for authentication
- Validates role-based access
- Redirects unauthorized users to `/unauthorized`
- Public routes: `/`, `/auth/login`, `/events`, `/feeStructure`, `/unauthorized`

**Role-Based Access:**
- `superAdmin`: Access to all routes
- `principal`: Only `/principal/*` routes
- `teacher`: Only `/teacher/*` routes
- `student`: Only `/student/*` routes
- `parent`: Only `/parent/*` routes
- `guest`: Redirected to `/unauthorized`

### State Management

- **Local State**: React `useState` hooks
- **Global State**: LocalStorage for user data and tokens
- **Cookies**: User information stored in cookies for middleware access
- **No Redux/Zustand**: Simple state management approach

### API Integration

**Base URL:** `process.env.NEXT_PUBLIC_API_URL` (default: `http://localhost:5000/api`)

**Axios Configuration:**
- Token automatically added to headers via `setToken()` function
- Token retrieved from `localStorage.getItem('token')`
- Authorization header format: `Bearer <token>`

**API Utility Functions (`utils/util.ts`):**
- `getCourses(courseId)` - Fetch courses
- `getChapters({courseId, chapterId})` - Fetch chapters
- `getTopics({courseId, chapterId, topicId})` - Fetch topics
- `handleUpload(file, fileType)` - Upload to Cloudinary
- `setToken()` - Set authorization header
- `getUserId()`, `getName()`, `getRole()` - Get user info from localStorage

### Component Architecture

**Layout Components:**
- `StudentLayout.tsx` - Student navigation and layout
- `TeacherLayout.tsx` - Teacher navigation and layout
- `PrincipalLayout.tsx` - Principal navigation and layout

**Page Components:**
- Reusable components in `components/pages/`
- Course, Quiz, Homework, Ebook page components

**Navigation:**
- Side navigation with role-specific links
- Top navigation with user info
- Active link highlighting

### File Upload

**Cloudinary Integration:**
- Direct client-side uploads
- Preset-based uploads
- Different endpoints for different file types:
  - Videos/Images: `/auto/upload`
  - PDFs: `/raw/upload`
- Returns secure URL for storage in database

### Real-time Features

**WebSocket Client (`components/hooks/websocket.tsx`):**
- Connects to WebSocket server
- Handles message sending and receiving
- Updates UI in real-time
- Connection URL: `ws://localhost:5000?userId=<user_id>`

---

## Authentication & Authorization

### Authentication Flow

1. **Login Process:**
   ```
   User submits credentials → POST /api/auth/login
   → Server validates credentials
   → Creates JWT token (expires in 1 day)
   → Returns token and user data
   → Frontend stores token in localStorage
   → Frontend stores user in localStorage and cookie
   → Redirects to role-specific dashboard
   ```

2. **Token Structure:**
   ```javascript
   {
     userId: number,
     username: string,
     name: string,
     role: string
   }
   ```

3. **Token Storage:**
   - **localStorage**: `token` and `user` (JSON stringified)
   - **Cookie**: `user` (for middleware access)

### Authorization

**Role-Based Access Control (RBAC):**

1. **Super Admin:**
   - Full system access
   - Can create any user type (except superAdmin)
   - Can access all routes

2. **Principal:**
   - Can create: teachers, students, parents
   - Cannot create: superAdmin, principal, headMaster
   - Access to: `/principal/*` routes

3. **Teacher:**
   - Can create: courses, quizzes, homework, ebooks
   - Can view: assigned students, submitted homework
   - Access to: `/teacher/*` routes

4. **Student:**
   - Can view: assigned courses, quizzes, homework
   - Can submit: homework, quiz answers
   - Access to: `/student/*` routes

5. **Parent:**
   - Can view: student progress, fee information
   - Access to: `/parent/*` routes

**Authorization Middleware (`utilController.js`):**
- `allowUsers(res, allowedRoles, userRole, action)` - Allows specific roles
- `restrictUsers(res, restrictedRoles, userRole, action)` - Restricts specific roles

### Password Security

**Current Implementation:**
- Passwords stored as plain text (⚠️ **Security Issue**)
- Should be hashed using bcryptjs (available but not implemented)

**Recommended Implementation:**
```javascript
const bcrypt = require('bcryptjs');
// On registration/login
const hashedPassword = await bcrypt.hash(password, 10);
// On login
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## API Documentation

### Request/Response Formats

**Standard Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Standard Success Response:**
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

**Standard Error Response:**
```json
{
  "status": "failed" | "error",
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Detailed API Endpoints

#### Authentication APIs

**POST /api/auth/login**
- **Public**: Yes
- **Body:**
  ```json
  {
    "username": "string" (optional if email provided),
    "email": "string" (optional if username provided),
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "user": {
      "userId": 1,
      "username": "teacher1",
      "name": "Sunita Mehta",
      "role": "teacher"
    },
    "token": "jwt_token_string"
  }
  ```
- **Side Effects**: Creates attendance record if not exists for today

**POST /api/auth/register**
- **Public**: No (requires auth)
- **Authorization**: Principal, Super Admin
- **Body:** (varies by role)
  ```json
  {
    "name": "string",
    "username": "string",
    "password": "string",
    "role": "teacher" | "student" | "parent",
    "age": number,
    "phone": "string",
    "email": "string",
    // Role-specific fields...
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "teacher role created successfully"
  }
  ```

#### Course APIs

**GET /api/courses**
- **Query Params**: None
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "courses": [
        {
          "courseId": 1,
          "title": "Basic Mathematics",
          "description": "...",
          "class": "1,2,3,4,5",
          "department": "Mathematics",
          "userId": 5,
          "createdAt": "2025-01-01T00:00:00.000Z"
        }
      ]
    }
  }
  ```

**POST /api/courses**
- **Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "content": "string",
    "class": "string" (comma-separated),
    "department": "string"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "courseId": 1
    }
  }
  ```

#### Quiz APIs

**POST /api/quiz**
- **Body:**
  ```json
  {
    "quizTitle": "string",
    "quizDescription": "string",
    "quizCourseId": number,
    "assignedClasses": "string" (comma-separated),
    "questions": [
      {
        "question": "string",
        "optionA": "string",
        "optionB": "string",
        "optionC": "string",
        "optionD": "string",
        "correctAnswer": "A" | "B" | "C" | "D",
        "difficulty": "Easy" | "Medium" | "Hard"
      }
    ]
  }
  ```

**POST /api/quizResults**
- **Body:**
  ```json
  {
    "quizId": number,
    "totalQues": number,
    "correctCount": number,
    "wrongCount": number,
    "skippedCount": number,
    "timeSpent": number (minutes)
  }
  ```
- **Score Calculation**: `(correctCount * 4) - (wrongCount * 1)`

#### Homework APIs

**GET /api/homework**
- **Query Params**: `?homeworkid=<id>` (optional)
- **Response:**
  ```json
  {
    "status": "success",
    "data": [
      {
        "homeworkId": 1,
        "title": "Math Algebra",
        "description": "...",
        "assignedClasses": "1,2,4,5",
        "dueDate": "2025-02-10T23:59:59.000Z",
        "fileType": "pdf",
        "fileUrl": "https://...",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "createdbyuserid": 4,
        "teachername": "Sunita Mehta"
      }
    ]
  }
  ```

**POST /api/homework/submit**
- **Body:**
  ```json
  {
    "homeworkId": number,
    "answerText": "string",
    "fileType": "string" (optional),
    "fileUrl": "string" (optional)
  }
  ```

**PATCH /api/homework/submit**
- **Body:**
  ```json
  {
    "submissionId": number,
    "grade": number (0-10)
  }
  ```

---

## Real-time Communication

### WebSocket Implementation

**Server Side (`webSocketController.js`):**
- WebSocket server initialized on Express server
- Connection URL: `ws://localhost:5000?userId=<user_id>`
- Client storage: `Map<userId, WebSocket>`

**Message Types:**

1. **newMessage:**
   ```json
   {
     "type": "newMessage",
     "messageData": {
       "senderId": number,
       "receiverId": number,
       "message": "string",
       "fileType": "string",
       "fileUrl": "string" (optional),
       "createdAt": "string"
     }
   }
   ```
   - Validates message data
   - Saves to database
   - Broadcasts to sender and receiver

2. **seenMessage:**
   ```json
   {
     "type": "seenMessage",
     "messageData": {
       "messageIds": [number],
       "senderId": number,
       "receiverId": number
     }
   }
   ```
   - Updates message status to "Seen"
   - Broadcasts update to both users

**Client Side (`components/hooks/websocket.tsx`):**
- React hook for WebSocket connection
- Manages connection lifecycle
- Handles message sending/receiving
- Updates UI state

**Connection Flow:**
1. Client connects with `userId` query parameter
2. Server stores connection in `clients` Map
3. Client sends messages via WebSocket
4. Server validates, saves, and broadcasts
5. Client receives and updates UI
6. On disconnect, server removes from Map

---

## File Management

### Cloudinary Integration

**Upload Process:**
1. Frontend creates FormData with file
2. Adds Cloudinary upload preset
3. POSTs to Cloudinary API
4. Receives secure URL
5. Stores URL in database

**File Types:**
- **Videos**: `/auto/upload` endpoint
- **PDFs**: `/raw/upload` endpoint
- **Images**: `/auto/upload` endpoint

**Configuration:**
- Cloud name: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- Upload preset: `NEXT_PUBLIC_CLOUDINARY_PRESET_NAME`

**Storage Locations:**
- Course videos: `Videos` table → `videoUrl`
- Topic PDFs: `Topics` table → `pdfUrl`
- Homework files: `Homework` and `HomeworkSubmissions` tables → `fileUrl`
- E-books: `Ebooks` table → `fileUrl`
- Message attachments: `Messages` table → `fileUrl`
- Salary payslips: `SalaryTransactions` table → `payslipUrl`

---

## Security Implementation

### Current Security Measures

1. **JWT Authentication:**
   - Token-based authentication
   - Token expiration (1 day)
   - Token verification on protected routes

2. **CORS Configuration:**
   - Restricted to `FRONTEND_URL`
   - Credentials enabled
   - Specific methods allowed

3. **Input Validation:**
   - Express Validator for request validation
   - Role-specific validation rules
   - SQL injection prevention (parameterized queries)

4. **Role-Based Access Control:**
   - Middleware checks user roles
   - Route-level authorization
   - Controller-level permission checks

### Security Recommendations

1. **Password Hashing:**
   - ⚠️ Currently stored as plain text
   - Should implement bcryptjs hashing

2. **HTTPS:**
   - Use HTTPS in production
   - Secure WebSocket (WSS)

3. **Rate Limiting:**
   - Implement rate limiting for login endpoints
   - Prevent brute force attacks

4. **Token Refresh:**
   - Implement refresh token mechanism
   - Shorter access token expiration

5. **Input Sanitization:**
   - Sanitize user inputs
   - Prevent XSS attacks

6. **File Upload Security:**
   - Validate file types
   - Limit file sizes
   - Scan for malware

7. **Database Security:**
   - Use connection pooling
   - Implement query timeouts
   - Regular backups

---

## Additional Notes

### Database Seeding

The `populate.js` script creates:
- 1 Super Admin
- 1 Principal
- 5 Teachers
- 20 Students
- 20 Parents
- 6 Courses with chapters and topics
- Sample quizzes and questions
- Sample homework and submissions
- Sample ebooks
- Sample messages
- Salary structures
- Attendance records
- School events

### Performance Considerations

1. **Database:**
   - Connection pooling (max 20 connections)
   - Indexed foreign keys
   - Efficient queries

2. **Frontend:**
   - Next.js server-side rendering
   - Code splitting
   - Image optimization

3. **Caching:**
   - Consider implementing Redis for session management
   - Cache frequently accessed data

### Deployment

**Backend:**
- Use PM2 for process management
- Environment-specific configurations
- Database connection retry logic

**Frontend:**
- Next.js production build
- Static asset optimization
- Environment variable configuration

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-15

