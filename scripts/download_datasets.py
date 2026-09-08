from __future__ import annotations

import argparse
from pathlib import Path


SUPPORTED_DATASETS = {
    "trashnet": "https://example.invalid/trashnet.zip",
    "taco": "https://example.invalid/taco.zip",
    "roboflow": "https://example.invalid/roboflow.zip",
}


def main() -> None:
    parser = argparse.ArgumentParser(description="Placeholder downloader for public recyclable datasets")
    parser.add_argument("--dataset", choices=sorted(SUPPORTED_DATASETS), required=True)
    parser.add_argument("--output", type=Path, default=Path("dataset"))
    args = parser.parse_args()

    print(f"Dataset '{args.dataset}' download placeholder: {SUPPORTED_DATASETS[args.dataset]}")
    print(f"Output directory: {args.output}")


if __name__ == "__main__":
    main()
