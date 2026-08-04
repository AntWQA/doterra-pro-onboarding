#!/usr/bin/env python3
"""Re-export helper: crop a raw Figma PNG export to an existing asset's bounds.

Why this exists
---------------
This Figma file's PNG exports have NO alpha — Figma renders each node onto an
opaque WHITE matte, with extra padding around the node for the drop shadow's
bleed. An earlier pass tried to remove that matte by chroma-keying white and
zeroing the alpha where it matched. That is fundamentally broken here: the
cards' own fill is ALSO white, so the key could not tell matte from content and
punched holes straight through the card interiors (measured: 357k white pixels
destroyed in tracking-fast-start.png alone).

This script instead crops purely by GEOMETRY and never touches a single pixel's
alpha. It finds where the existing asset sits inside the new raw export by
cross-correlating their DARK pixels (text and strokes, which the white-keying
bug left untouched), then crops. The alignment is self-verifying: a correct
crop scores ~100% dark-pixel overlap, so a bad match fails loudly instead of
silently shipping a misaligned card.

Usage:  reexport_align.py <raw.png> <asset-name>   # asset-name without .png
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
EXPORTS = ROOT / "src" / "assets" / "exports"
NODES = ROOT / "scripts" / "figma-nodes.json"
DARK = 200  # luminance below this counts as structural content, not fill/matte
MIN_OVERLAP = 0.99


def check_against_node(name: str, size: tuple[int, int]) -> None:
    """Warn when the crop is BIGGER than the Figma node it came from.

    Any excess is baked drop shadow that Figma padded the export with. It used
    to be invisible because the old chroma-key zeroed its alpha, so a too-tall
    crop went unnoticed; now that exports stay opaque, that strip renders as a
    second card edge under the real one — and because the frames put a CSS
    border-radius and box-shadow on the <img>, the browser rounds and shadows
    the *image* box rather than the card, so it reads as two stacked cards.
    Caught exactly that on pro-advisor-1 (+15 rows), the question bubble (+5)
    and the toast (+16).
    """
    try:
        meta = json.loads(NODES.read_text()).get(name)
    except OSError:
        return
    if not meta:
        return
    nw, nh = round(meta["w"] * 3), round(meta["h"] * 3)
    dw, dh = size[0] - nw, size[1] - nh
    if dw > 2 or dh > 2:
        print(f"       WARNING: {dw}x{dh} px larger than node {name} ({nw}x{nh}) — "
              f"that excess is baked shadow and will render as a stacked card edge")


def dark_mask(img: Image.Image, use_alpha: bool) -> np.ndarray:
    a = np.array(img.convert("RGBA"))
    m = a[:, :, :3].mean(2) < DARK
    if use_alpha:
        m &= a[:, :, 3] > 128
    return m


def align(raw: Image.Image, old: Image.Image) -> tuple[int, int, float]:
    """Best (dx, dy) placing `old`'s frame inside `raw`, plus overlap score."""
    om = dark_mask(old, use_alpha=True)
    rm = dark_mask(raw, use_alpha=False)
    H, W = om.shape
    RH, RW = rm.shape
    total = int(om.sum())
    if total == 0:
        raise SystemExit("  FAIL: old asset has no dark pixels to align on")

    best = (-1, 0, 0)
    for dy in range(max(1, RH - H + 1)):
        for dx in range(max(1, RW - W + 1)):
            window = rm[dy : dy + H, dx : dx + W]
            if window.shape != om.shape:
                continue
            s = int((window & om).sum())
            if s > best[0]:
                best = (s, dx, dy)
    score, dx, dy = best
    return dx, dy, score / total


def main() -> int:
    raw_path, name = sys.argv[1], sys.argv[2]
    out = EXPORTS / f"{name}.png"
    raw = Image.open(raw_path).convert("RGBA")
    old = Image.open(out).convert("RGBA")
    W, H = old.size

    if raw.size[0] < W or raw.size[1] < H:
        print(f"  SKIP {name}: raw export {raw.size} smaller than target {old.size}")
        return 2

    dx, dy, score = align(raw, old)
    if score < MIN_OVERLAP:
        print(f"  FAIL {name}: alignment only {score:.1%} (need {MIN_OVERLAP:.0%}) — not written")
        return 1

    crop = raw.crop((dx, dy, dx + W, dy + H))
    before = np.array(old)[:, :, 3]
    restored = int((before == 0).sum())
    crop.save(out)
    print(f"  OK   {name}: {raw.size} -> {crop.size} at ({dx},{dy}), "
          f"align {score:.1%}, {restored} keyed-out px restored")
    check_against_node(name, crop.size)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
