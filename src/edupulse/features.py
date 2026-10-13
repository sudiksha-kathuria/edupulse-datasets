"""Shared feature definitions and data-loading utilities."""
from pathlib import Path

import numpy as np
import pandas as pd

RENAME = {
    "Age": "age",
    "Gender": "gender",
    "Current Semester": "current_semester",
    "How many hour do you study daily?": "study_hours_daily",
    "How many times do you seat for study in a day?": "study_sessions_daily",
    "How many hour do you spent daily in social media?": "social_media_hours",
    "How many hour do you spent daily on your skill development?": "skill_dev_hours",
    "What was your previous SGPA?": "previous_sgpa",
    "How many Credit did you have completed?": "credits_completed",
    "Do you have meritorious scholarship ?": "has_scholarship",
    "Do you use University transportation?": "uses_transport",
    "What is your preferable learning mode?": "learning_mode",
    "Do you attend in teacher consultancy for any kind of academical problems?": "uses_teacher_consultancy",
    "Are you engaged with any co-curriculum activities?": "co_curricular",
    "Did you ever fall in probation?": "probation",
}

NUMERIC_FEATURES = [
    "attendance_pct",
    "previous_sgpa",
    "study_hours_daily",
    "study_sessions_daily",
    "social_media_hours",
    "skill_dev_hours",
    "credits_completed",
    "age",
    "current_semester",
]

CATEGORICAL_FEATURES = [
    "gender",
    "has_scholarship",
    "uses_transport",
    "learning_mode",
    "uses_teacher_consultancy",
    "co_curricular",
]

FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def parse_attendance(value):
    """'90' -> 90.0, '94-98' -> 96.0, junk -> NaN."""
    if pd.isna(value):
        return np.nan
    text = str(value).strip()
    if "-" in text:
        numbers = []
        for part in text.split("-"):
            part = part.strip()
            try:
                numbers.append(float(part))
            except ValueError:
                continue
        return float(np.mean(numbers)) if numbers else np.nan
    try:
        return float(text)
    except ValueError:
        return np.nan


def load_primary(data_dir: Path) -> pd.DataFrame:
    """Load and clean the primary CSE dataset; returns feature + target columns."""
    df = pd.read_csv(Path(data_dir) / "student_academic_performance_cse.csv")
    df["attendance_pct"] = df["Average attendance on class"].apply(parse_attendance)
    df = df.rename(columns=RENAME)
    df["at_risk"] = (df["probation"] == "Yes").astype(int)
    return df[FEATURES + ["at_risk"]].dropna().reset_index(drop=True)
