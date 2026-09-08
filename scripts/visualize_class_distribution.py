from __future__ import annotations

import csv
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LABEL_ROOT = ROOT / "dataset" / "labels"
OUTPUT = ROOT / "runs" / "class_distribution.csv"
CLASS_NAMES = [
    "Plastic Bottle",
    "Plastic Bag",
    "PET Plastic",
    "HDPE Plastic",
    "Glass Bottle",
    "Paper",
    "Cardboard",
    "Aluminium Can",
    "Steel Can",
    "Food Waste",
    "Organic Waste",
    "E-Waste",
    "Battery",
    "Textile",
    "Tetra Pak",
    "Others",
]


def main() -> None:
    counter: Counter[int] = Counter()
    for label_file in LABEL_ROOT.rglob("*.txt"):
        for line in label_file.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            class_id = int(float(line.split()[0]))
            counter[class_id] += 1

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(["class_id", "class_name", "count"])
        for class_id, count in sorted(counter.items()):
            writer.writerow([class_id, CLASS_NAMES[class_id], count])

    print(f"Class distribution written to {OUTPUT}")


if __name__ == "__main__":
    main()
