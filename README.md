# 🎓 EduAIon - English Learning Platform

Nền tảng học tiếng Anh thông minh với AI, flashcards, và quiz tương tác.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- PostgreSQL
- npm hoặc yarn

### Setup cho người mới clone

#### 1. Clone Repository
```bash
git clone https://gitlab.com/alexnbui/eduaion.git
cd eduaion
```

#### 2. Setup Backend

```bash
cd backend

# Cài dependencies (tự động chạy prisma generate)
npm install

# Copy .env file
cp .env.example .env
# Trên Windows: copy .env.example .env

# Cập nhật DATABASE_URL trong file .env
# DATABASE_URL="postgresql://user:password@localhost:5432/eduaion"

# Chạy migrations
npx prisma migrate dev

# ⚠️ QUAN TRỌNG: Nếu gặp lỗi "Module '@prisma/client' has no exported member 'Level'"
# Chạy lệnh này:
npx prisma generate

# Start backend server
npm run dev
```

✅ Backend sẽ chạy tại: `http://localhost:5000`

#### 3. Setup Frontend

```bash
cd ../frontend

# Cài dependencies
npm install

# Copy .env file
cp .env.example .env.local
# Trên Windows: copy .env.example .env.local

# Cập nhật API URL trong .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Start frontend dev server
npm run dev
```

✅ Frontend sẽ chạy tại: `http://localhost:3000`

---

## 🐛 Troubleshooting

### ❌ Lỗi phổ biến khi clone

#### 1. "Module '@prisma/client' has no exported member 'Level'"

**Nguyên nhân:** Prisma Client chưa được generate sau khi clone

**Giải pháp:**
```bash
cd backend
npx prisma generate
npm run dev
```

#### 2. "Can't reach database server"

**Giải pháp:**
1. Kiểm tra PostgreSQL đang chạy
2. Kiểm tra `DATABASE_URL` trong `.env`
3. Tạo database nếu chưa có:
   ```bash
   # Đăng nhập PostgreSQL
   psql -U postgres

   # Tạo database
   CREATE DATABASE eduaion;

   # Thoát
   \q
   ```

#### 3. Migration failed

**Giải pháp:**
```bash
cd backend
# Reset và chạy lại migrations
npx prisma migrate reset
npx prisma migrate dev
```

---

## 📁 Project Structure

```
eduaion/
├── backend/              # Backend API (Express + Prisma + PostgreSQL)
│   ├── prisma/          # Database schema & migrations
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   └── utils/       # Utilities
│   ├── scripts/         # Migration & seed scripts
│   ├── SETUP.md         # ⭐ Chi tiết setup backend
│   └── package.json
│
└── frontend/            # Frontend (Next.js + React + Tailwind)
    ├── src/
    │   ├── app/         # Next.js app router
    │   ├── components/  # React components
    │   ├── lib/         # Utils & API clients
    │   └── context/     # React contexts
    └── package.json
```

📖 **Xem chi tiết:** [backend/SETUP.md](backend/SETUP.md)

---

## 🔧 Development Scripts

### Backend
```bash
npm run dev         # Start dev server với nodemon
npm run migrate     # Chạy migrations
npm run generate    # Generate Prisma Client
npm run studio      # Mở Prisma Studio (GUI database)
```

### Frontend
```bash
npm run dev         # Start Next.js dev server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

---

## 📚 Features

- ✅ **Authentication**
  - Google OAuth
  - Email/Password login
  - JWT tokens với refresh

- ✅ **Vocabulary Learning**
  - 5000+ từ vựng theo theme
  - Lesson-based learning
  - Progress tracking

- ✅ **Flashcards**
  - Tạo custom flashcard sets
  - Flashcard mặc định cho user mới
  - Study mode với flip animation

- ✅ **Quizzes**
  - Multiple choice (Cho nghĩa → Chọn từ)
  - Fill in the blank (Cho nghĩa → Điền từ)
  - Auto grading
  - Quiz sau mỗi lesson

- ✅ **Writing Practice**
  - IELTS Writing Task 1 & 2
  - AI feedback (coming soon)

- ✅ **Progress Tracking**
  - User stats & streaks
  - Goals setting
  - Activity logs

---

## 🔐 Environment Variables

### Backend `.env`
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eduaion"
PORT=5000
NODE_ENV=development

# JWT Secrets
JWT_SECRET="your-secret-key-here"
JWT_REFRESH_SECRET="your-refresh-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/api/auth/google/callback"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🗄️ Database

### Schema Overview
- **Users** - User accounts & authentication
- **Vocab** - 5000+ từ vựng
- **Theme & Lesson** - Tổ chức từ vựng theo chủ đề
- **UserFlashcardSets** - Custom flashcard sets
- **Quizzes** - Quiz history & results
- **WritingSubmissions** - IELTS writing submissions
- **UserStats** - Progress tracking

📖 **Xem chi tiết:** `backend/prisma/schema.prisma`

### Prisma Commands
```bash
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Chạy migrations
npx prisma studio         # GUI xem database
npx prisma migrate reset  # Reset database (⚠️ xóa data)
```

---

## 📝 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Đăng ký
POST   /api/auth/signin          - Đăng nhập
GET    /api/auth/google          - Google OAuth
POST   /api/auth/refresh         - Refresh token
POST   /api/auth/logout          - Đăng xuất
```

### Vocabulary
```
GET    /api/vocab/themes                    - Danh sách themes
GET    /api/vocab/themes/:id/lessons        - Lessons của theme
GET    /api/vocab/lessons/:id               - Chi tiết lesson
POST   /api/vocab/lessons/:id/complete      - Hoàn thành lesson
```

### Flashcards
```
GET    /api/flashcards/sets                 - Flashcard sets của user
GET    /api/flashcards/sets/:id             - Chi tiết set
POST   /api/flashcards/sets                 - Tạo set mới
POST   /api/flashcards/sets/:id/cards       - Thêm card vào set
DELETE /api/flashcards/sets/:id/cards/:vid  - Xóa card
```

### Quizzes
```
GET    /api/quiz/available                  - Danh sách quiz có thể làm
POST   /api/quiz/lesson/:lessonId           - Tạo quiz cho lesson
POST   /api/quiz/flashcard/:setId           - Tạo quiz cho flashcard set
POST   /api/quiz/:quizId/submit             - Submit quiz
GET    /api/quiz/history                    - Lịch sử quiz
```

---

## 🎯 User Flow

### 1. Onboarding
```
Đăng ký → Chọn level → Onboarding complete → Dashboard
```

### 2. Learning Flow
```
Choose Theme → Select Lesson → Study Vocab → Take Quiz → Next Lesson
```

### 3. Flashcard Flow
```
Create Set → Add Cards from Library → Study Mode → Quiz
```

---

## 🚀 Deployment

### Backend
```bash
# Build
npm run build

# Start production
npm start
```

### Frontend
```bash
# Build
npm run build

# Start production
npm start
```

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Create Merge Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Developed with ❤️ by EduAIon Team

---

## 📞 Support

Gặp vấn đề khi setup?

1. Xem [backend/SETUP.md](backend/SETUP.md) để biết chi tiết
2. Check [Troubleshooting](#-troubleshooting) section
3. Tạo issue tại GitLab

Happy Learning! 🎉
