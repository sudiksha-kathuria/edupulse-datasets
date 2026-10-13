"""Production pipeline: build, train, serialize and load the EduPulse model."""
from pathlib import Path

import joblib
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from .features import CATEGORICAL_FEATURES, FEATURES, NUMERIC_FEATURES, load_primary

# Serialized models land here, relative to the project root.
MODELS_DIR = Path(__file__).resolve().parents[2] / "models"


def _preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        [
            ("num", StandardScaler(), NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", drop="first"), CATEGORICAL_FEATURES),
        ]
    )


def build_pipeline(model: str = "rf") -> Pipeline:
    """Return an untrained sklearn Pipeline for the given model key."""
    if model == "rf":
        clf = RandomForestClassifier(
            n_estimators=400,
            min_samples_leaf=5,
            class_weight="balanced",
            random_state=42,
        )
    elif model == "lr":
        clf = LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)
    elif model == "xgb":
        try:
            from xgboost import XGBClassifier
        except ImportError as exc:
            raise ImportError("pip install xgboost to use the xgb model") from exc
        clf = XGBClassifier(
            n_estimators=300,
            max_depth=4,
            learning_rate=0.05,
            scale_pos_weight=3,
            random_state=42,
            eval_metric="logloss",
            verbosity=0,
        )
    else:
        raise ValueError(f"Unknown model key: {model!r}. Choose rf | lr | xgb")

    return Pipeline([("preprocessor", _preprocessor()), ("classifier", clf)])


def train_and_save(data_dir: Path, model: str = "rf", threshold: float = 0.35) -> Path:
    """Train on the full primary dataset and serialize to models/<model>.joblib."""
    df = load_primary(data_dir)
    X, y = df[FEATURES], df["at_risk"]

    pipe = build_pipeline(model)
    pipe.fit(X, y)

    MODELS_DIR.mkdir(exist_ok=True)
    out_path = MODELS_DIR / f"edupulse_{model}.joblib"
    joblib.dump({"pipeline": pipe, "threshold": threshold, "features": FEATURES}, out_path)
    return out_path


def load_pipeline(model: str = "rf") -> dict:
    """Load a serialized model artifact.  Returns {pipeline, threshold, features}."""
    path = MODELS_DIR / f"edupulse_{model}.joblib"
    if not path.exists():
        raise FileNotFoundError(
            f"No trained model at {path}. Run: python scripts/train.py"
        )
    return joblib.load(path)
