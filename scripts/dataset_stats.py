from __future__ import annotations

import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "dataset"
IMAGE_ROOT = DATASET / "images"
LABEL_ROOT = DATASET / "labels"
SPLITS = ("train", "val", "test")


def collect_stats() -> None:
    summary: dict[str, object] = {}
    class_counter: Counter[int] = Counter()
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    for split in SPLITS:
        image_dir = IMAGE_ROOT / split
        label_dir = LABEL_ROOT / split
        image_count = len([item for item in image_dir.rglob("*") if item.is_file() and item.suffix.lower() in valid_extensions])
        label_count = len(list(label_dir.rglob("*.txt")))

        summary[split] = {
            "images": image_count,
            "labels": label_count,
        }

        for label_path in label_dir.rglob("*.txt"):
            for line in label_path.read_text(encoding="utf-8").splitlines():
                if not line.strip():
                    continue
                try:
                    class_id = int(float(line.split()[0]))
                    class_counter[class_id] += 1
                except (ValueError, IndexError):
                    continue

    print(json.dumps({"splits": summary, "class_distribution": dict(class_counter)}, indent=2))


if __name__ == "__main__":
    collect_stats()
