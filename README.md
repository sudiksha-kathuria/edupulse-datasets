# EduPulse — dataset exploration & early-warning pipeline

EduPulse is an early-warning idea: use signals a college already records —
attendance, assessment performance, engagement — to flag students who may be
falling behind, while there is still time to help them.

This repository contains:
- A collection of public student-performance datasets
- An exploration notebook and three analysis notebooks
- A production ML pipeline (serialised sklearn/XGBoost model)
- A FastAPI inference endpoint
- A Streamlit risk dashboard

## Datasets

| File | What it is | Source |
| --- | --- | --- |
| `student_academic_performance_cse.csv` | Survey of 1,194 Computer Science & Engineering students: attendance, previous SGPA, CGPA, study habits, social media, probation history. **Primary modelling dataset.** | [Kaggle](https://www.kaggle.com/datasets/dhruvb2028/student-academic-performance-dataset-for-ml) (CC BY-NC-SA 4.0) |
| `engineering_student_journey.csv` | 2,000 engineering students (CSE, ECE, MECH, CIVIL, EEE, IT) with semester-wise GPA 1–8, attendance %, backlogs, internships and placement. | [Kaggle](https://www.kaggle.com/datasets/rakeshkapilavai/engineering-student-journey) (CC0) |
| `student_performance_tamilnadu.csv` | 5,000 Tamil Nadu students across campuses: GPA, subject scores, aptitude tests. | [Kaggle](https://www.kaggle.com/datasets/harinarayanan5/students-performance) (MIT) |
| `student_performance_attendance.csv` | 25,000 school-level records: attendance %, subject scores, overall score, final grade. | [Kaggle](https://www.kaggle.com/datasets/kundanbedmutha/student-performance-dataset) (CC BY 4.0) |

## Project structure

```
edupulse-datasets/
├── datasets/                   raw CSVs (read-only)
├── edupulse.ipynb              baseline exploration (start here)
├── notebooks/
│   ├── 02_improved_modelling.ipynb   XGBoost · 5-fold CV · PR curves · threshold tuning
│   ├── 03_engineering_journey.ipynb  GPA trajectory analysis · placement prediction
│   └── 04_clustering.ipynb           K-means student segmentation
├── src/edupulse/
│   ├── features.py             feature definitions & data loader shared by all notebooks
│   ├── pipeline.py             build / train / serialise / load sklearn Pipeline
│   └── predict.py              single-student inference function
├── scripts/
│   └── train.py                CLI: train and save models to models/
├── api/
│   └── main.py                 FastAPI inference endpoint
├── dashboard/
│   └── app.py                  Streamlit risk dashboard
└── models/                     serialised .joblib files (git-ignored)
```

## Quick start

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Run the notebooks

```bash
jupyter notebook            # open edupulse.ipynb first, then notebooks/02_*.ipynb …
```

### Train and save the production model

```bash
python scripts/train.py            # trains rf + lr, saves to models/
python scripts/train.py --model xgb   # adds xgb (requires xgboost)
```

### Start the API

```bash
uvicorn api.main:app --reload
# POST http://localhost:8000/predict
# GET  http://localhost:8000/docs  (interactive Swagger UI)
```

### Launch the dashboard

```bash
streamlit run dashboard/app.py
```
The dashboard trains the model automatically on first run if no saved model is found.

## Note on the data

These datasets are collected from public sources for initial experimentation
only. Their provenance is not verified, most are synthetic or survey-based, and
they are **not claimed to represent VIT students** unless a dataset explicitly
says so. Nothing here should be used to make real decisions about real students.
