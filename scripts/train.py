#!/usr/bin/env python
"""Train and serialize all EduPulse models.

Usage:
    python scripts/train.py              # trains rf + lr
    python scripts/train.py --model xgb # trains xgb only (requires xgboost)
"""
import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.edupulse.pipeline import train_and_save

DATA_DIR = ROOT / "datasets"

ALL_MODELS = ["rf", "lr"]

parser = argparse.ArgumentParser(description="Train EduPulse production models")
parser.add_argument(
    "--model",
    choices=["rf", "lr", "xgb", "all"],
    default="all",
    help="Which model to train (default: all)",
)
parser.add_argument(
    "--threshold",
    type=float,
    default=0.35,
    help="Risk decision threshold saved with the model (default: 0.35)",
)
args = parser.parse_args()

targets = ALL_MODELS if args.model == "all" else [args.model]

for m in targets:
    print(f"Training {m} ...", end=" ", flush=True)
    try:
        path = train_and_save(DATA_DIR, model=m, threshold=args.threshold)
        print(f"saved → {path.relative_to(ROOT)}")
    except ImportError as exc:
        print(f"SKIPPED ({exc})")
    except Exception as exc:
        print(f"FAILED: {exc}")
        sys.exit(1)

print("Done.")
