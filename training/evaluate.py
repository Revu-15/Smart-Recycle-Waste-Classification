from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate a trained YOLO model")
    parser.add_argument("--weights", type=Path, default=Path("weights/best.pt"))
    parser.add_argument("--data", type=Path, default=Path("dataset/dataset.yaml"))
    args = parser.parse_args()

    model = YOLO(str(args.weights))
    metrics = model.val(data=str(args.data), split="test")

    print({
        "precision": metrics.results_dict.get("precision"),
        "recall": metrics.results_dict.get("recall"),
        "map50": metrics.results_dict.get("map50"),
        "map50_95": metrics.results_dict.get("map50-95"),
        "f1": metrics.results_dict.get("f1"),
    })


if __name__ == "__main__":
    main()
