#!/bin/bash
echo "🚀 Starting AttendWise AI (MySQL Edition)..."

command -v node >/dev/null 2>&1   || { echo "❌ Node.js not found"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 not found"; exit 1; }

[ -f backend/.env ]  || cp backend/.env.example  backend/.env  && echo "⚠️  Edit backend/.env with your MySQL credentials"
[ -f frontend/.env ] || cp frontend/.env.example frontend/.env

(cd backend  && npm install --silent)
(cd frontend && npm install --silent)
(cd ai-service && python3 -m venv venv 2>/dev/null; source venv/bin/activate; pip install -r requirements.txt -q)

(cd backend    && npm run dev &)
(cd ai-service && source venv/bin/activate && uvicorn main:app --reload --port 8000 &)
(cd frontend   && npm run dev &)

echo ""
echo "✅ All services starting!"
echo "   Frontend:   http://localhost:5173"
echo "   Backend:    http://localhost:5000"
echo "   AI Service: http://localhost:8000"
wait
