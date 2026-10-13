"""EduPulse — Streamlit risk dashboard.

Run from the project root:
    streamlit run dashboard/app.py
"""
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

st.set_page_config(page_title="EduPulse", page_icon="🎓", layout="wide")


@st.cache_resource(show_spinner="Training model on first run — takes ~10 s …")
def _get_artifact(model_key: str):
    from src.edupulse.pipeline import load_pipeline, train_and_save

    try:
        return load_pipeline(model_key)
    except FileNotFoundError:
        train_and_save(ROOT / "datasets", model=model_key)
        return load_pipeline(model_key)


# ── Sidebar ──────────────────────────────────────────────────────────────────
st.sidebar.title("Student Profile")

attendance = st.sidebar.slider("Attendance (%)", 0, 100, 85)
sgpa = st.sidebar.slider("Previous SGPA", 0.0, 4.0, 2.5, step=0.01)
study_hours = st.sidebar.slider("Daily Study Hours", 0.0, 12.0, 3.0, step=0.5)
social_hours = st.sidebar.slider("Daily Social Media Hours", 0.0, 12.0, 3.0, step=0.5)
skill_hours = st.sidebar.slider("Daily Skill Dev Hours", 0.0, 8.0, 2.0, step=0.5)
sessions = st.sidebar.slider("Study Sessions / Day", 1, 6, 2)
credits = st.sidebar.slider("Credits Completed", 0, 150, 60)
age = st.sidebar.slider("Age", 18, 30, 21)
semester = st.sidebar.slider("Current Semester", 1, 12, 5)

st.sidebar.divider()
gender = st.sidebar.selectbox("Gender", ["Male", "Female"])
scholarship = st.sidebar.selectbox("Scholarship", ["No", "Yes"])
transport = st.sidebar.selectbox("University Transport", ["No", "Yes"])
learning = st.sidebar.selectbox("Learning Mode", ["Offline", "Online", "Hybrid"])
consultancy = st.sidebar.selectbox("Uses Teacher Consultancy", ["No", "Yes"])
co_curr = st.sidebar.selectbox("Co-Curricular Activities", ["No", "Yes"])

st.sidebar.divider()
model_key = st.sidebar.selectbox("Model", ["rf", "lr"], index=0)

# ── Build record & predict ────────────────────────────────────────────────────
record = {
    "attendance_pct": float(attendance),
    "previous_sgpa": float(sgpa),
    "study_hours_daily": float(study_hours),
    "study_sessions_daily": float(sessions),
    "social_media_hours": float(social_hours),
    "skill_dev_hours": float(skill_hours),
    "credits_completed": float(credits),
    "age": float(age),
    "current_semester": float(semester),
    "gender": gender,
    "has_scholarship": scholarship,
    "uses_transport": transport,
    "learning_mode": learning,
    "uses_teacher_consultancy": consultancy,
    "co_curricular": co_curr,
}

artifact = _get_artifact(model_key)
pipe = artifact["pipeline"]
threshold = artifact["threshold"]
prob = float(pipe.predict_proba(pd.DataFrame([record]))[0, 1])

BAND_COLOR = {"HIGH": "#e74c3c", "MEDIUM": "#f39c12", "LOW": "#2ecc71"}
band = "HIGH" if prob >= 0.6 else ("MEDIUM" if prob >= threshold else "LOW")
color = BAND_COLOR[band]

# ── Main layout ───────────────────────────────────────────────────────────────
st.title("🎓 EduPulse — Academic Risk Dashboard")
st.caption("Early-warning signals from attendance, prior SGPA and study behaviour.")

col_score, col_gauge = st.columns([1, 2])

with col_score:
    st.markdown(
        f"""
        <div style="background:{color}18; border-left:6px solid {color};
             padding:24px 20px; border-radius:10px;">
          <div style="font-size:2rem; font-weight:700; color:{color}">{band} RISK</div>
          <div style="font-size:3rem; font-weight:800; color:#222">{prob:.0%}</div>
          <div style="color:#555; margin-top:6px">
            {"⚠ Recommend early intervention" if prob >= threshold else "✓ Monitor normally"}
          </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_gauge:
    # Risk score bar vs. historical at-risk rates
    hist = pd.Series({"≤70 % attendance": 46.8, "70-80 %": 36.4, "80-90 %": 22.1, ">90 %": 17.9})
    att_band = (
        "≤70 % attendance" if attendance <= 70
        else ("70-80 %" if attendance <= 80
        else ("80-90 %" if attendance <= 90 else ">90 %"))
    )
    bar_colors = [color if k == att_band else "#ccc" for k in hist.index]

    fig, ax = plt.subplots(figsize=(6, 2.8))
    bars = ax.barh(hist.index, hist.values, color=bar_colors, height=0.55)
    ax.axvline(prob * 100, color=color, linewidth=2, linestyle="--",
               label=f"This student: {prob:.0%}")
    ax.set_xlabel("At-risk rate (%)")
    ax.set_title("Historical at-risk rate by attendance band")
    ax.legend(fontsize=9)
    ax.spines[["top", "right"]].set_visible(False)
    st.pyplot(fig)

st.divider()

col_imp, col_table = st.columns([2, 1])

with col_imp:
    st.subheader("Top model features (global)")
    importances = pd.Series(
        pipe.named_steps["classifier"].feature_importances_
        if hasattr(pipe.named_steps["classifier"], "feature_importances_")
        else np.abs(pipe.named_steps["classifier"].coef_[0]),
        index=pipe.named_steps["preprocessor"].get_feature_names_out(),
    ).sort_values(ascending=False).head(12).sort_values()

    fig2, ax2 = plt.subplots(figsize=(7, 4))
    importances.plot.barh(ax=ax2, color="#3b7dd8")
    ax2.set_xlabel("Importance")
    ax2.spines[["top", "right"]].set_visible(False)
    st.pyplot(fig2)

with col_table:
    st.subheader("Input summary")
    summary = pd.DataFrame(
        {"Feature": list(record.keys()), "Value": list(record.values())}
    )
    st.dataframe(summary, use_container_width=True, hide_index=True)
