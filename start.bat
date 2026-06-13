@echo off
echo Starting AttendWise AI (MySQL Edition)...

IF NOT EXIST "backend\.env" copy "backend\.env.example" "backend\.env"
IF NOT EXIST "frontend\.env" copy "frontend\.env.example" "frontend\.env"

echo Installing backend...
cd backend && npm install --silent
cd ..

echo Starting Backend...
start cmd /k "cd backend && npm run dev"

echo Starting AI Service...
start cmd /k "cd ai-service && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo All services starting in separate windows!
echo Frontend:   http://localhost:5173
echo Backend:    http://localhost:5000
echo AI Service: http://localhost:8000
pause
