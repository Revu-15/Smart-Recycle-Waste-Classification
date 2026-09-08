# Waste Detection Dataset Layout

This project keeps the dataset in the standard YOLO structure:

- `dataset/images/train`
- `dataset/images/val`
- `dataset/images/test`
- `dataset/labels/train`
- `dataset/labels/val`
- `dataset/labels/test`

The generated label file format is YOLO TXT:

```text
<class_id> <x_center> <y_center> <width> <height>
```

The project class list is defined in `dataset/dataset.yaml`.
