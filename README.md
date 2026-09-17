# EduPulse — dataset exploration

EduPulse is an early-warning idea: use signals a college already records —
attendance, assessment performance, engagement — to flag students who may be
falling behind, while there is still time to help them.

This repository is the dataset groundwork for that idea. It contains a small
collection of public student-performance datasets and one notebook that
explores them, picks the best fit, and trains two baseline models to predict
academic risk.

## Datasets

| File | What it is | Source |
| --- | --- | --- |
| `student_academic_performance_cse.csv` | Survey of 1,194 Computer Science & Engineering students: attendance, previous SGPA, CGPA, study habits, social media, probation history. **Used in the notebook.** | [Kaggle — Student Academic Performance Dataset for ML](https://www.kaggle.com/datasets/dhruvb2028/student-academic-performance-dataset-for-ml) (CC BY-NC-SA 4.0) |
| `engineering_student_journey.csv` | 2,000 engineering students (CSE, ECE, MECH, CIVIL, EEE, IT) with semester-wise GPA 1–8, attendance %, backlogs, internships and placement. | [Kaggle — Engineering Student Journey](https://www.kaggle.com/datasets/rakeshkapilavai/engineering-student-journey) (CC0) |
| `student_performance_tamilnadu.csv` | 5,000 Tamil Nadu students across campuses including VIT Vellore, PSG, Anna University, IIT Madras: GPA, subject scores, aptitude tests. | [Kaggle — MODEL STUDENTS DATASET](https://www.kaggle.com/datasets/harinarayanan5/students-performance) (MIT) |
| `student_performance_attendance.csv` | 25,000 school-level records: attendance %, subject scores, overall score, final grade, study hours. | [Kaggle — Student Performance Dataset](https://www.kaggle.com/datasets/kundanbedmutha/student-performance-dataset) (CC BY 4.0) |

The notebook uses **`student_academic_performance_cse.csv`** because it is the
only file that combines higher-education students, numeric attendance, previous
academic performance, engagement signals, and a real observed outcome to
predict.

## Running the notebook

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
jupyter notebook edupulse.ipynb
```

Run all cells top to bottom. The notebook is self-contained: it loads the CSVs
from `datasets/`, cleans them, and trains the models.

## Note on the data

These datasets are collected from public sources for initial experimentation
only. Their provenance is not verified, most are synthetic or survey-based, and
they are **not claimed to represent VIT students** unless a dataset explicitly
says so. Nothing here should be used to make real decisions about real
students.
