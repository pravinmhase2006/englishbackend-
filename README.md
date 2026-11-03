# englishbackend-

## SpeakUp AI Backend — Production API Service

Enterprise Node.js, Fastify & TypeScript backend designed specifically for the **SpeakUp AI English Learning** Flutter application.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v20+ (Tested on Node v25.9)
- **MongoDB Server** (Running locally on `mongodb://127.0.0.1:27017` or via MongoDB Atlas)

### 2. Installation
```bash
cd backend
npm install
```

### 3. Environment Setup
Create a `.env` file in `backend/`:
```env
PORT=5000
HOST=0.0.0.0
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/speakup_db
JWT_SECRET=speakup_jwt_secret_super_key_2026_antigravity_secure
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=speakup_refresh_token_super_secret_key_2026
REFRESH_TOKEN_EXPIRES_IN=30d
UPLOAD_DIR=./uploads
```

### 4. Seed Database
Seeds the default learner **Alex Carter** (`alex.carter@example.com` / `password123`), the Word of the Day (*"Confident"*), Grammar Unit 4 (*Connectors*), and the Daily Fluency Challenge (*"Bite the bullet"*):
```bash
npm run seed
```

### 5. Build & Run
```bash
# Build TypeScript
npm run build

# Start Production Server
npm start

# Or Run in Development Mode with Hot Reload
npm run dev
```

---

## 📖 Interactive Swagger / OpenAPI Documentation

The backend provides complete **OpenAPI 3.0** documentation with interactive testing in **Swagger UI**:

* **Interactive Swagger UI:** [http://127.0.0.1:5000/docs](http://127.0.0.1:5000/docs)
* **Raw OpenAPI 3.0 Spec JSON:** [http://127.0.0.1:5000/docs/json](http://127.0.0.1:5000/docs/json)

### How to test protected endpoints in Swagger UI:
1. Open [http://127.0.0.1:5000/docs](http://127.0.0.1:5000/docs).
2. Expand the `Authentication` group and run `POST /api/v1/auth/login` with:
   ```json
   {
     "email": "alex.carter@example.com",
     "password": "password123"
   }
   ```
3. Copy the `accessToken` from the response JSON.
4. Click the green **Authorize 🔓** button at the top right of the Swagger UI.
5. In the `BearerAuth` box, paste your token: `Bearer <your_access_token>`.
6. Click **Authorize** -> **Close**.
7. Now all protected endpoints (`/users/me`, `/speaking/sessions`, `/daily-challenges/today`, `/progress/summary`, etc.) can be executed directly from your browser!

---

## 📡 REST API Reference

Base URL: `http://127.0.0.1:5000/api/v1` (or `http://10.0.2.2:5000/api/v1` on Android Emulator)

### 1. Authentication (`/api/v1/auth`)

#### `POST /auth/register`
* **Headers:** `Content-Type: application/json`
* **Request:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "cefrLevel": "B1"
}
```
* **Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "cefrLevel": "B1" },
    "tokens": { "accessToken": "eyJhbG...", "refreshToken": "eyJhbG..." }
  }
}
```

#### `POST /auth/login`
* **Request:**
```json
{
  "email": "alex.carter@example.com",
  "password": "password123"
}
```
* **Response:** Returns JWT `accessToken` & user profile.

---

### 2. User Profile (`/api/v1/users`)

#### `GET /users/me`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response:** Current user stats (streak days, study time, weekly goal, XP, preferences).

#### `PATCH /users/me/cefr`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:** `{ "cefrLevel": "B2" }`

---

### 3. AI Speaking & Voice Simulation (`/api/v1/speaking`)

#### `GET /speaking/topics`
* **Response:** Preset speaking scenarios (Cafe, Job Interview, Weekend Hobbies) with suggested phrases.

#### `POST /speaking/sessions`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:** `{ "topicTitle": "Ordering at a Cafe", "cefrLevel": "B1" }`

#### `POST /speaking/sessions/:sessionId/voice-turn`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:**
```json
{
  "userText": "I'd like an iced latte with oat milk, please.",
  "audioDuration": "0:04"
}
```
* **Response:**
```json
{
  "success": true,
  "data": {
    "evaluation": {
      "overallFluency": 96,
      "wordScores": [
        { "word": "I'd", "score": 98 },
        { "word": "like", "score": 100 },
        { "word": "latte", "score": 92 }
      ],
      "coachTip": "Excellent intonation! Your pitch variation feels relaxed and natural."
    },
    "aiResponse": {
      "sender": "ai",
      "text": "Great choice! Would you like that for here or to go?",
      "audioDuration": "0:03"
    }
  }
}
```

---

### 4. Vocabulary (`/api/v1/vocabulary`)

#### `GET /vocabulary/word-of-the-day`
* **Response:** Featured word (*"Confident"*), phonetics, definition, example sentence, and memory anchor.

#### `POST /vocabulary/:wordId/progress`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:** `{ "status": "mastered" }` (Awards +15 XP)

---

### 5. Grammar Learning (`/api/v1/grammar`)

#### `GET /grammar/units`
* **Response:** Curriculum units (e.g. Unit 4: Mastering Sentence Flow).

#### `POST /grammar/questions/:questionId/verify`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:** `{ "selectedOptionIndex": 0 }`
* **Response:** `{ "isCorrect": true, "explanation": "...", "xpEarned": 20 }`

---

### 6. Daily Challenge (`/api/v1/daily-challenges`)

#### `GET /daily-challenges/today`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response:** Today's 60s speed quest with idiom question and +50 XP reward.

#### `POST /daily-challenges/today/submit`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Request:** `{ "selectedOption": 0, "secondsTaken": 14 }`

---

### 7. Learning Progress (`/api/v1/progress`)

#### `GET /progress/summary`
* **Headers:** `Authorization: Bearer <accessToken>`
* **Response:**
```json
{
  "success": true,
  "data": {
    "cefrBenchmark": "Intermediate B1",
    "overallFluencyScore": 84,
    "monthlyDelta": "+8% this month",
    "skillBreakdown": {
      "pronunciation": { "score": 88, "progress": 0.88 },
      "vocabulary": { "score": 82, "progress": 0.82 },
      "grammar": { "score": 86, "progress": 0.86 },
      "listening": { "score": 80, "progress": 0.80 }
    }
  }
}
```

---

## 🧪 Testing

Run the automated test script verifying all 13 test flows:
```powershell
powershell -ExecutionPolicy Bypass -File test_api.ps1
```
Result: **`=== ALL API TESTS PASSED! ===`**
