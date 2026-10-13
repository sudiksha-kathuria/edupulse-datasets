"""Single-student inference."""
import pandas as pd

from .pipeline import load_pipeline


def risk_band(probability: float) -> str:
    if probability >= 0.6:
        return "HIGH"
    if probability >= 0.35:
        return "MEDIUM"
    return "LOW"


def predict_risk(record: dict, model: str = "rf") -> dict:
    """
    Predict academic risk for one student.

    Parameters
    ----------
    record : dict
        Keys matching FEATURES in src/edupulse/features.py.
    model : str
        "rf" | "lr" | "xgb"

    Returns
    -------
    dict with risk_score, risk_band, at_risk (bool)
    """
    artifact = load_pipeline(model)
    pipe = artifact["pipeline"]
    threshold = artifact["threshold"]

    df = pd.DataFrame([record])
    prob = float(pipe.predict_proba(df)[0, 1])

    return {
        "risk_score": round(prob, 4),
        "risk_band": risk_band(prob),
        "at_risk": prob >= threshold,
        "threshold_used": threshold,
    }
