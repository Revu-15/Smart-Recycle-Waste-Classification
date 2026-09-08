# Model Evaluation Notes

The project contains a recorded Ultralytics YOLO11 training run under the local `runs/` directory. The run configuration records a detection task using `yolo11n.pt`, the project dataset, 10 epochs, and batch size 8.

The local `results.csv` includes epoch-level box loss, classification loss, DFL loss, precision, recall, mAP50, and mAP50-95 columns. It is generated training output and is intentionally not committed to the GitHub repository with the raw `runs/` tree.

The repository does not publish a single verified final accuracy number because the available output is an epoch history and the project does not define a release evaluation protocol. The original project contains validation plots and confusion matrices, which are copied into `docs/screenshots/` when present.

**Evaluation metrics are pending/future work as a formally reported project result.** The available local plots should be treated as experiment artifacts, not as a generalization guarantee.