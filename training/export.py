from __future__ import annotations

import argparse
from pathlib import Path

from ultralytics import YOLO


def main() -> None:
    parser = argparse.ArgumentParser(description="Export YOLO model to ONNX/TensorRT/TFLite")
    parser.add_argument("--weights", type=Path, default=Path("weights/best.pt"))
    parser.add_argument("--format", default="onnx")
    args = parser.parse_args()

    model = YOLO(str(args.weights))
    exported = model.export(format=args.format)
    print(exported)


if __name__ == "__main__":
    main()
