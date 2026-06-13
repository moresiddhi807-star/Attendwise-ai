"""
AttendWise AI - Python FastAPI Service
Provides intelligent attendance prediction, risk classification, and smart advice.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.linear_model import LinearRegression

app = FastAPI(
    title="AttendWise AI Service",
    description="Intelligent Attendance Prediction & Advisory API",
    version="1.0.0"
)

# Allow CORS from the Node backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────

class PredictRequest(BaseModel):
    current_attended: int
    current_total: int
    future_lectures: int
    planned_bunks: int

class SubjectInfo(BaseModel):
    name: str
    attended: int
    total: int
    percentage: float

class AdvisorRequest(BaseModel):
    message: str
    subjects: List[SubjectInfo]


# ─── Helpers ──────────────────────────────────────────────────────────────────

def classify_risk(percentage: float) -> str:
    """Classify attendance risk level."""
    if percentage >= 80:
        return "SAFE"
    elif percentage >= 75:
        return "WARNING"
    else:
        return "CRITICAL"


def predict_with_regression(attended: int, total: int, future: int, bunks: int) -> float:
    """
    Use Linear Regression to predict future attendance percentage.
    We model attendance as a linear trend based on historical simulation.
    """
    # Build synthetic historical trajectory (last 8 data points)
    X = np.array(range(1, 9)).reshape(-1, 1)
    
    # Simulate past attendance oscillating around current
    base_pct = (attended / total) * 100 if total > 0 else 0
    noise = np.random.normal(0, 1.5, 8)
    y = np.clip(base_pct + noise, 0, 100)
    
    # Fit model
    model = LinearRegression()
    model.fit(X, y)
    
    # Predict at future point
    future_point = np.array([[9]])
    trend_prediction = float(model.predict(future_point)[0])
    
    # Calculate actual projection based on bunks
    future_attended = attended + max(0, future - bunks)
    future_total = total + future
    actual_projection = (future_attended / future_total * 100) if future_total > 0 else 0
    
    # Blend: 70% actual math, 30% ML trend
    blended = 0.7 * actual_projection + 0.3 * trend_prediction
    return round(min(100, max(0, blended)), 2)


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AttendWise AI Service is running 🚀"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict")
def predict_attendance(req: PredictRequest):
    """
    Predict future attendance percentage using Linear Regression.
    """
    if req.current_total <= 0:
        raise HTTPException(status_code=400, detail="total_classes must be > 0")
    if req.planned_bunks > req.future_lectures:
        raise HTTPException(status_code=400, detail="planned_bunks cannot exceed future_lectures")

    predicted_pct = predict_with_regression(
        req.current_attended,
        req.current_total,
        req.future_lectures,
        req.planned_bunks
    )

    status = classify_risk(predicted_pct)
    messages = {
        "SAFE": "Your attendance will remain healthy. You're doing great!",
        "WARNING": "Attendance is borderline. Consider attending more classes.",
        "CRITICAL": "Attendance will drop below 75%! Attend more classes immediately.",
    }

    return {
        "predicted_percentage": predicted_pct,
        "status": status,
        "message": messages[status],
        "current_percentage": round((req.current_attended / req.current_total) * 100, 2),
    }


@app.post("/risk")
def classify_subjects(subjects: List[SubjectInfo]):
    """
    Classify a list of subjects by risk level.
    """
    results = []
    for s in subjects:
        risk = classify_risk(s.percentage)
        needed_75 = max(0, int(np.ceil(0.75 * s.total - s.attended)))
        needed_80 = max(0, int(np.ceil(0.80 * s.total - s.attended)))
        can_miss = max(0, int(np.floor(s.attended - 0.75 * s.total)))

        results.append({
            "name": s.name,
            "percentage": s.percentage,
            "risk": risk,
            "lectures_to_75": needed_75,
            "lectures_to_80": needed_80,
            "can_safely_miss": can_miss,
        })

    return {"subjects": results}


@app.post("/advisor")
def smart_advisor(req: AdvisorRequest):
    """
    Generate intelligent attendance advice based on user message and subject data.
    """
    msg = req.message.lower()
    subjects = req.subjects

    if not subjects:
        return {"response": "📚 Please add your subjects first to get personalized advice!"}

    critical = [s for s in subjects if s.percentage < 75]
    warning = [s for s in subjects if 75 <= s.percentage < 80]
    safe = [s for s in subjects if s.percentage >= 80]
    avg = sum(s.percentage for s in subjects) / len(subjects)

    # Find mentioned subject
    mentioned = next((s for s in subjects if s.name.lower() in msg), None)

    if mentioned:
        pct = mentioned.percentage
        risk = classify_risk(pct)
        needs_to_75 = max(0, int(np.ceil((0.75 * mentioned.total - mentioned.attended) / 0.25)))
        can_miss = max(0, int(np.floor(mentioned.attended - 0.75 * mentioned.total)))

        if any(w in msg for w in ["bunk", "skip", "miss"]):
            if risk == "SAFE" and can_miss > 0:
                return {"response": f"✅ Yes! You can safely skip up to **{can_miss} lecture(s)** of **{mentioned.name}** (currently {pct:.1f}%) without falling below 75%."}
            elif risk == "WARNING":
                return {"response": f"⚠️ Risky! **{mentioned.name}** is at {pct:.1f}% — skipping now could push you below 75%. I'd advise against it."}
            else:
                return {"response": f"❌ Do NOT skip **{mentioned.name}**! You're at {pct:.1f}%. Attend the next **{needs_to_75} classes** to recover to 75%."}
        else:
            status_emoji = "✅" if risk == "SAFE" else "⚠️" if risk == "WARNING" else "🚨"
            return {"response": f"{status_emoji} **{mentioned.name}** is at **{pct:.1f}%** ({risk}). {mentioned.attended}/{mentioned.total} classes attended."}

    if any(w in msg for w in ["bunk", "skip", "safe to miss"]):
        if critical:
            names = ", ".join(s.name for s in critical)
            return {"response": f"🚨 Do NOT skip any classes! **{names}** {'is' if len(critical)==1 else 'are'} already below 75%. Focus on attending these immediately."}
        elif warning:
            names = ", ".join(s.name for s in warning)
            return {"response": f"⚠️ Be cautious. **{names}** {'is' if len(warning)==1 else 'are'} in the warning zone. Only skip classes from subjects above 85%."}
        else:
            best = max(safe, key=lambda s: s.percentage)
            return {"response": f"✅ Your attendance looks good overall! If you need to skip, choose from **{best.name}** ({best.percentage:.1f}%) — it has the most buffer."}

    if any(w in msg for w in ["focus", "priority", "which", "worst"]):
        if critical:
            worst = min(critical, key=lambda s: s.percentage)
            needs = max(0, int(np.ceil((0.75 * worst.total - worst.attended) / 0.25)))
            return {"response": f"🎯 Focus on **{worst.name}** first — it's at **{worst.percentage:.1f}%**. Attend the next **{needs} consecutive classes** to recover to 75%."}
        elif warning:
            focus = warning[0]
            return {"response": f"⚠️ Keep an eye on **{focus.name}** ({focus.percentage:.1f}%). It's close to the boundary — attend 2–3 more classes to get comfortable."}
        else:
            return {"response": f"🌟 All subjects are in good shape! Your overall average is **{avg:.1f}%**. Keep it up!"}

    if any(w in msg for w in ["status", "overview", "how am i", "summary"]):
        return {
            "response": (
                f"📊 **Attendance Summary**\n\n"
                f"Overall Average: **{avg:.1f}%**\n"
                f"✅ Safe: {len(safe)} subjects\n"
                f"⚠️ Warning: {len(warning)} subjects\n"
                f"🚨 Critical: {len(critical)} subjects"
                + (f"\n\n🔴 Needs attention: {', '.join(s.name for s in critical)}" if critical else "")
            )
        }

    # Default
    return {
        "response": (
            f"👋 Hi! Your overall attendance is **{avg:.1f}%** across {len(subjects)} subjects.\n\n"
            + (f"🚨 Critical attention needed: **{', '.join(s.name for s in critical)}**\n" if critical else "")
            + (f"⚠️ Watch out for: **{', '.join(s.name for s in warning)}**\n" if warning else "")
            + "\nAsk me things like 'Can I skip Physics?' or 'Which subject should I focus on?'"
        )
    }
