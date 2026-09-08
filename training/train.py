from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


DEFAULT_DATASET = Path("dataset/dataset.yaml")
DEFAULT_PROJECT = Path("training")


def build_model(model_name: str = "yolo11n.pt") -> YOLO:
    return YOLO(model_name)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train a YOLOv11 waste-detection model")
    parser.add_argument("--data", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--epochs", type=int, default=50)
    parser.add_argument("--imgsz", type=int, default=640)
    parser.add_argument("--batch", type=int, default=16)
    parser.add_argument("--project", type=Path, default=DEFAULT_PROJECT)
    parser.add_argument("--name", default="waste-yolo11")
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--model", default="yolo11n.pt")
    parser.add_argument("--amp", action="store_true")
    parser.add_argument("--patience", type=int, default=10)
    args = parser.parse_args()

    model = build_model(args.model)
    results = model.train(
        data=str(args.data),
        epochs=args.epochs,
        imgsz=args.imgsz,
        batch=args.batch,
        project=str(args.project),
        name=args.name,
        resume=args.resume,
        amp=args.amp,
        patience=args.patience,
        pretrained=True,
        exist_ok=True,
    )

    print("Training run finished.")
    print(results)


if __name__ == "__main__":
    main()
