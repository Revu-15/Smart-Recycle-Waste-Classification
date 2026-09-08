from __future__ import annotations

from pathlib import Path

DATASET_ROOT = Path("dataset")
TRAIN = DATASET_ROOT / "train"
VALID = DATASET_ROOT / "valid"
TEST = DATASET_ROOT / "test"

for folder in (TRAIN, VALID, TEST):
    folder.mkdir(parents=True, exist_ok=True)

print("Dataset folders prepared at", DATASET_ROOT)
