# 🎴 Flashcard & Quiz System

English learning platform với Flashcard sets và Quiz tương tác.

## ⚠️ Lưu ý quan trọng

Branch này chỉ chứa **Flashcard & Quiz system**, không bao gồm:
- ❌ Vocabulary Learning (Theme/Lesson)
- ❌ Writing Practice
- ❌ Dashboard & Stats
- ❌ Tutorial System

Chỉ có:
- ✅ Authentication (Sign up/Sign in/Google OAuth)
- ✅ Flashcard Sets (tạo, chỉnh sửa, xóa)
- ✅ Quiz System (tạo quiz từ flashcard sets)
- ✅ Vocab database (để dùng cho flashcards)

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL
- npm hoặc yarn

### Setup

#### 1. Clone Repository
```bash
git clone https://github.com/YaoMing-dev/Alex
cd Alex
```

#### 2. Setup Backend

```bash
cd backend

# Cài dependencies
npm install

# Copy .env file
cp .env.example .env

# Cập nhật DATABASE_URL trong file .env
# DATABASE_URL="postgresql://user:password@localhost:5432/flashcard_quiz"

# Chạy migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed database với vocab
npm run seed

# Seed flashcards (optional - tạo demo flashcard sets)
npx ts-node prisma/seed_flashcards.ts

# Start backend server
npm run dev
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

#### 3. Setup Frontend

```bash
cd ../frontend

# Cài dependencies
npm install

# Copy .env file (nếu có .env.example)
# Hoặc tạo file .env.local với nội dung:
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start frontend dev server
npm run dev
```

✅ Frontend sẽ chạy tại: `http://localhost:3000`

---

## 📁 Project Structure

```
Alex/
├── backend/              # Backend API (Express + Prisma + PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema (Users, Vocab, Flashcard, Quiz)
│   │   ├── seed.ts                # Seed vocab data
│   │   └── seed_flashcards.ts     # Seed demo flashcard sets
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── FlashcardController.ts
│   │   │   └── QuizController.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── FlashcardService.ts
│   │   │   └── QuizService.ts
│   │   ├── routes/
│   │   │   ├── AuthRoute.ts
│   │   │   ├── FlashcardRoute.ts
│   │   │   └── QuizRoute.ts
│   │   └── utils/
│   └── package.json
│
└── frontend/             # Frontend (Next.js + React + Tailwind)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/              # Auth pages
    │   │   ├── (protected)/
    │   │   │   ├── flashcard/       # Flashcard pages
    │   │   │   └── quiz/            # Quiz pages
    │   │   └── (full_screen)/
    │   │       └── flashcard/       # Flashcard study/quiz pages
    │   ├── components/
    │   │   ├── auth/                # Auth components
    │   │   ├── quiz/                # Quiz components
    │   │   └── common/              # Shared components
    │   └── lib/
    │       ├── api/
    │       │   ├── auth.ts
    │       │   └── flashcard.ts
    │       └── types/
    │           └── flashcard.ts
    └── package.json
```

---

## 🔧 Database Schema

### Models

#### Users
```prisma
model Users {
  id                      Int
  email                   String  @unique
  username                String
  passwordHash            String?
  level                   Level   (Beginner/Intermediate/Advanced)

  user_flashcard_sets     UserFlashcardSets[]
  quizzes                 Quizzes[]
}
```

#### Vocab
```prisma
model Vocab {
  id                      Int
  internalId              String  @unique
  word                    String
  meaning_en              String
  meaning_vn              String?
  ipa_us, ipa_uk          String?
  audio_url               String?

  user_flashcard_cards    UserFlashcardCards[]
}
```

#### UserFlashcardSets
```prisma
model UserFlashcardSets {
  id                   Int
  user_id              Int
  set_name             String
  description          String?
  background_color     String
  icon                 String?

  user_flashcard_cards UserFlashcardCards[]
  quizzes              Quizzes[]
}
```

#### Quizzes
```prisma
model Quizzes {
  id              Int
  user_id         Int
  flashcard_set_id Int?
  type            QuizType (multiple_choice/fill_blank/mixed)
  context         QuizContext (flashcard_set/general)
  questions_json  Json
  answers_json    Json
  score           Float
  is_passed       Boolean
}
```

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Đăng ký
POST   /api/auth/signin          - Đăng nhập
GET    /api/auth/google          - Google OAuth
POST   /api/auth/refresh         - Refresh token
GET    /api/auth/csrf            - Get CSRF token
```

### Flashcards
```
GET    /api/flashcards/sets                 - Flashcard sets của user
GET    /api/flashcards/sets/:id             - Chi tiết set
POST   /api/flashcards/sets                 - Tạo set mới
PUT    /api/flashcards/sets/:id             - Update set
DELETE /api/flashcards/sets/:id             - Xóa set

POST   /api/flashcards/sets/:id/cards       - Thêm card vào set
DELETE /api/flashcards/sets/:id/cards/:vid  - Xóa card
PUT    /api/flashcards/sets/:id/cards/:vid  - Update card status

PUT    /api/flashcards/sets/:id/study       - Update study progress
GET    /api/flashcards/sets/:id/quiz        - Get quiz for set

POST   /api/flashcards/save-from-quiz               - Save vocab from quiz
POST   /api/flashcards/create-from-wrong-answers    - Create set from wrong answers
```

### Quizzes
```
GET    /api/quiz/available               - Danh sách quiz có thể làm
POST   /api/quiz/flashcard/:setId        - Tạo quiz cho flashcard set
POST   /api/quiz/:quizId/submit          - Submit quiz answers
GET    /api/quiz/history                 - Lịch sử quiz
```

---

## 🎯 User Flow

### 1. Authentication
```
Sign up/Sign in → User Dashboard
```

### 2. Flashcard Flow
```
Create Set → Add Cards from Vocab Library → Study Mode → Take Quiz
```

### 3. Quiz Flow
```
Select Flashcard Set → Start Quiz → Submit Answers → View Results → Save Wrong Words
```

---

## 🔐 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/flashcard_quiz"
PORT=5000

JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

GOOGLE_CLIENT_ID="your-google-id"
GOOGLE_CLIENT_SECRET="your-google-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📚 Features

- ✅ **Authentication**
  - Email/Password signup/signin
  - Google OAuth
  - JWT tokens với refresh mechanism
  - CSRF protection

- ✅ **Flashcards**
  - Tạo custom flashcard sets
  - Customizable background color, icon, size
  - Add vocabulary from library
  - Study mode với flip animation
  - Progress tracking (new/learned/review/mastered)

- ✅ **Quizzes**
  - Multiple choice (Cho nghĩa tiếng Việt → Chọn từ tiếng Anh)
  - Fill in the blank (Cho nghĩa → Điền từ)
  - Mixed quiz mode
  - Auto grading
  - Save wrong words to flashcard set
  - Quiz history tracking

- ✅ **Vocabulary Library**
  - 5000+ English words
  - Vietnamese meanings
  - IPA pronunciation (US/UK)
  - Audio files (US/UK)
  - Example sentences

---

## 🐛 Troubleshooting

### Prisma Client errors
```bash
cd backend
npx prisma generate
npm run dev
```

### Database connection issues
```bash
# Check PostgreSQL is running
# Create database
psql -U postgres
CREATE DATABASE flashcard_quiz;
\q
```

### Migration issues
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev
npm run seed
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

## 📄 License

MIT License

---

Happy Learning! 🎉
