from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser(description="Run YOLO model testing/evaluation")
    parser.add_argument("--weights", type=Path, default=Path("weights/best.pt"))
    parser.add_argument("--data", type=Path, default=Path("dataset/dataset.yaml"))
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--task", choices=["val", "test"], default="test")
    args = parser.parse_args()

    model = YOLO(str(args.weights))
    split = "val" if args.task == "val" else "test"
    metrics = model.val(data=str(args.data), split=split, imgsz=args.imgsz, batch=args.batch)
    print(metrics)


if __name__ == "__main__":
    main()
