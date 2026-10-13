"""EduPulse Risk API — FastAPI application.

Start with:
    uvicorn api.main:app --reload          # from project root
    # or
    python -m uvicorn api.main:app --reload
"""
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.edupulse.predict import predict_risk  # noqa: E402

app = FastAPI(
    title="EduPulse Risk API",
    description="Predict academic-probation risk for a single student.",
    version="0.1.0",
)


class StudentRecord(BaseModel):
    attendance_pct: float = Field(..., ge=0, le=100, example=85.0)
    previous_sgpa: float = Field(..., ge=0, le=4.0, example=2.8)
    study_hours_daily: float = Field(3.0, ge=0, example=3.0)
    study_sessions_daily: float = Field(2.0, ge=0, example=2.0)
    social_media_hours: float = Field(3.0, ge=0, example=3.0)
    skill_dev_hours: float = Field(2.0, ge=0, example=2.0)
    credits_completed: float = Field(60.0, ge=0, example=60.0)
    age: float = Field(21.0, ge=16, le=40, example=21.0)
    current_semester: float = Field(5.0, ge=1, example=5.0)
    gender: str = Field("Male", example="Male")
    has_scholarship: str = Field("No", example="No")
    uses_transport: str = Field("No", example="No")
    learning_mode: str = Field("Offline", example="Offline")
    uses_teacher_consultancy: str = Field("No", example="No")
    co_curricular: str = Field("No", example="No")
    model: str = Field("rf", description="rf | lr | xgb")


class RiskResponse(BaseModel):
    risk_score: float
    risk_band: str
    at_risk: bool
    threshold_used: float


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/features")
def features():
    """Return the feature names the model expects."""
    from src.edupulse.features import FEATURES
    return {"features": FEATURES}


@app.post("/predict", response_model=RiskResponse)
def predict(record: StudentRecord):
    """Predict academic risk for one student."""
    data = record.model_dump()
    model_key = data.pop("model")
    try:
        result = predict_risk(data, model=model_key)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc))
    return result
