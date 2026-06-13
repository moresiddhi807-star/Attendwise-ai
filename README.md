# AttendWise AI 🎓
**Intelligent Attendance Prediction & Bunk Calculator**

> Never worry about attendance again. Predict your attendance, calculate safe bunks, and stay exam-eligible.

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React.js (Vite) + Tailwind + Recharts |
| Backend    | Node.js + Express.js                |
| Database   | **MySQL**                           |
| AI Module  | Python + FastAPI + Scikit-Learn     |
| Auth       | JWT                                 |

---

## ⚙️ Setup — Step by Step

### Prerequisites
Install these before starting:
- **Node.js** ≥ 18 → https://nodejs.org
- **Python** ≥ 3.9 → https://python.org (check "Add to PATH" on Windows)
- **MySQL** ≥ 8.0 → https://dev.mysql.com/downloads/mysql/

---

### Step 1 — Set Up MySQL Database

**Option A: MySQL Command Line**
```bash
mysql -u root -p < database/setup.sql
```

**Option B: MySQL Workbench**
1. Open MySQL Workbench
2. File → Open SQL Script → select `database/setup.sql`
3. Press Ctrl+Shift+Enter (Run All)

This creates the `attendwise` database and all tables automatically.

---

### Step 2 — Configure Backend

```bash
cd backend
copy .env.example .env        # Windows
# cp .env.example .env        # Mac/Linux
```

Edit `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_root_password
DB_NAME=attendwise
JWT_SECRET=any_long_random_string_here
AI_SERVICE_URL=http://localhost:8000
```

Install and start:
```bash
npm install
npm run dev
```
✅ You should see: `Connected to MySQL` and `Server running on http://localhost:5000`

---

### Step 3 — Configure AI Service (Optional but recommended)

```bash
cd ai-service

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
✅ You should see: `Uvicorn running on http://0.0.0.0:8000`

> **Note:** If you skip this step, the app still works — it uses built-in logic instead of ML predictions.

---

### Step 4 — Start Frontend

```bash
cd frontend
npm install
npm run dev
```
✅ Open http://localhost:5173 in your browser

---

## 🗄️ Database Schema (MySQL)

```sql
-- Users
CREATE TABLE users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(191) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,   -- bcrypt hashed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Subjects
CREATE TABLE subjects (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  user_id               INT          NOT NULL,
  subject_name          VARCHAR(150) NOT NULL,
  attended_classes      INT          NOT NULL DEFAULT 0,
  total_classes         INT          NOT NULL DEFAULT 1,
  attendance_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 📡 API Endpoints

| Method | Route              | Description          |
|--------|--------------------|----------------------|
| POST   | /api/register      | Register new user    |
| POST   | /api/login         | Login                |
| GET    | /api/profile       | Get user profile     |
| GET    | /api/subjects      | List all subjects    |
| POST   | /api/subjects      | Add subject          |
| PUT    | /api/subjects/:id  | Update subject       |
| DELETE | /api/subjects/:id  | Delete subject       |
| POST   | /api/predict       | Attendance forecast  |
| POST   | /api/advisor       | AI advice            |
| GET    | /api/analytics     | Analytics data       |

---

## 🔑 Environment Variables (backend/.env)

| Variable       | Description                     | Example                  |
|----------------|---------------------------------|--------------------------|
| PORT           | Server port                     | 5000                     |
| DB_HOST        | MySQL host                      | localhost                |
| DB_PORT        | MySQL port                      | 3306                     |
| DB_USER        | MySQL username                  | root                     |
| DB_PASSWORD    | MySQL password                  | mypassword               |
| DB_NAME        | Database name                   | attendwise               |
| JWT_SECRET     | Secret for signing JWT tokens   | some_random_string       |
| AI_SERVICE_URL | URL of Python AI service        | http://localhost:8000    |

---

## 🎨 Color Theme

| Token      | Value     |
|------------|-----------|
| Primary    | `#6D5DFC` |
| Secondary  | `#8B7FFF` |
| Accent     | `#A78BFA` |
| Background | `#F8FAFC` |
