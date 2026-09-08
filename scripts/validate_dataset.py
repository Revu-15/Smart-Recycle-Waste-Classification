from __future__ import annotations

import hashlib
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "dataset"
IMAGE_ROOT = DATASET / "images"
LABEL_ROOT = DATASET / "labels"
SPLITS = ("train", "val", "test")
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


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validate() -> None:
    issues: list[str] = []
    duplicates: dict[str, list[Path]] = {}
    seen_hashes: dict[str, Path] = {}
    valid_extensions = {".jpg", ".jpeg", ".png", ".webp"}

    for split in SPLITS:
        image_dir = IMAGE_ROOT / split
        label_dir = LABEL_ROOT / split

        if not image_dir.exists():
            issues.append(f"Missing image split directory: {image_dir}")
            continue
        if not label_dir.exists():
            issues.append(f"Missing label split directory: {label_dir}")
            continue

        images = [p for p in image_dir.rglob("*") if p.is_file() and p.suffix.lower() in valid_extensions]
        for image_path in images:
            rel_path = image_path.relative_to(image_dir)
            label_path = (label_dir / rel_path).with_suffix(".txt")
            if not label_path.exists():
                # also check flat label_dir
                flat_label_path = label_dir / f"{image_path.stem}.txt"
                if not flat_label_path.exists():
                    issues.append(f"Missing annotation for image {rel_path}")

            hash_value = sha256(image_path)
            if hash_value in seen_hashes:
                duplicates.setdefault(hash_value, [seen_hashes[hash_value]]).append(image_path)
            else:
                seen_hashes[hash_value] = image_path

    if issues:
        print("Dataset validation warnings/issues:")
        for issue in issues[:10]:
            print(f"- {issue}")
        if len(issues) > 10:
            print(f"... and {len(issues) - 10} more.")

    print(f"Dataset validation completed ({len(seen_hashes)} unique images verified).")
    print("Supported classes:", ", ".join(CLASS_NAMES))


if __name__ == "__main__":
    validate()
