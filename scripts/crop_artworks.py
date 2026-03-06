#!/usr/bin/env python3
"""Crop artwork images to remove surrounding backgrounds (tables, notebooks, frames)."""

from PIL import Image
import os
import shutil

SRC_DIR = "/home/faeqsu10/projects/misook-gallery/public/artworks"
OUT_DIR = "/home/faeqsu10/projects/misook-gallery/public/artworks_cropped"

os.makedirs(OUT_DIR, exist_ok=True)

# Per-image crop coordinates: (left, upper, right, lower)
# Phone screenshots (1152x2560) need aggressive cropping
CROPS = {
    # --- Phone screenshots with notebook/table backgrounds ---
    "abstract-color-grid.jpg": (80, 50, 1130, 1950),      # spiral notebook on glass table
    "abstract-triangles.jpg": (55, 20, 1110, 1530),        # sketchbook on glass table
    "geometric-lines.jpg": (55, 200, 1030, 1770),          # notebook on striped fabric
    "prayer-diary.jpg": (25, 10, 1115, 2060),              # diary page (text+drawing = artwork)
    "prayer-cross.jpg": (25, 15, 1105, 2050),              # diary page similar angle
    "spiral-vortex.jpg": (40, 20, 1040, 1700),             # notebook on striped fabric
    "witch-framed.jpg": (240, 420, 900, 1520),             # crop inside wooden frame
    "woman-under-tree.jpg": (20, 30, 1080, 1830),          # diary/planner page on glass table

    # --- Close-up photos with minor edges ---
    "abstract-red-green.jpg": (10, 10, 1354, 1470),
    "bird-in-geometry.jpg": (20, 20, 2210, 2770),
    "blue-energy.jpg": (30, 30, 2240, 3100),
    "bold-circles-lines.jpg": (30, 30, 3150, 4580),
    "charcoal-red-cross.jpg": (15, 15, 1960, 2710),
    "color-eye-spiral.jpg": (15, 15, 1950, 2550),          # has pencil on it, crop bottom text
    "color-mosaic.jpg": (5, 5, 948, 1235),
    "fierce-gaze.jpg": (15, 15, 2630, 3590),
    "free-composition.jpg": (10, 10, 1055, 1475),
    "golden-orbit.jpg": (30, 30, 2890, 4370),
    "madonna-rosary.jpg": (100, 30, 2650, 3950),           # notebook dotted line on left
    "tension-and-calm.jpg": (10, 10, 1474, 1540),
    "vivid-triangles.jpg": (10, 10, 969, 1500),
    "witch.jpg": (15, 25, 2235, 3190),
}

for filename, crop_box in CROPS.items():
    src_path = os.path.join(SRC_DIR, filename)
    out_path = os.path.join(OUT_DIR, filename)

    if not os.path.exists(src_path):
        print(f"SKIP: {filename} not found")
        continue

    img = Image.open(src_path)
    w, h = img.size

    # Clamp crop box to image bounds
    left = max(0, crop_box[0])
    upper = max(0, crop_box[1])
    right = min(w, crop_box[2])
    lower = min(h, crop_box[3])

    cropped = img.crop((left, upper, right, lower))
    cropped.save(out_path, quality=95)
    print(f"OK: {filename} ({w}x{h}) -> ({right-left}x{lower-upper})")

print(f"\nDone! Cropped images saved to {OUT_DIR}")
