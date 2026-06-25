#!/usr/bin/env python3
"""Render Paleo-Hebrew mem icons from Robo-PaleoHeb."""
from __future__ import annotations

from pathlib import Path

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT = ROOT / 'public/fonts/Robo-PaleoHeb.ttf'
OUT = ROOT / 'app/icon.svg'
OUT_MASKABLE = ROOT / 'app/icon-maskable.svg'
GLYPH = 'uni05DE'  # מ
GOLD = '#c5a46e'
INK = '#0b1118'


def _glyph_path(font: TTFont) -> tuple[str, tuple[float, float, float, float]]:
    glyph_set = font.getGlyphSet()

    bounds_pen = BoundsPen(glyph_set)
    glyph_set[GLYPH].draw(bounds_pen)
    x_min, y_min, x_max, y_max = bounds_pen.bounds

    path_pen = SVGPathPen(glyph_set)
    glyph_set[GLYPH].draw(path_pen)
    path = ''.join(path_pen._commands)

    return path, (x_min, y_min, x_max, y_max)


def paleo_mem_svg(size: int = 32, rx: int = 7, pad: int = 2) -> str:
    font = TTFont(FONT)
    path, (x_min, y_min, x_max, y_max) = _glyph_path(font)
    glyph_w = x_max - x_min
    glyph_h = y_max - y_min

    inner = size - 2 * pad
    scale = min(inner / glyph_w, inner / glyph_h)
    scaled_w = glyph_w * scale
    scaled_h = glyph_h * scale
    tx = pad + (inner - scaled_w) / 2 - x_min * scale
    ty = pad + (inner - scaled_h) / 2 + y_max * scale

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Mem">
  <rect width="{size}" height="{size}" rx="{rx}" fill="{GOLD}"/>
  <path fill="{INK}" transform="matrix({scale:.8f},0,0,{-scale:.8f},{tx:.4f},{ty:.4f})" d="{path}"/>
</svg>
'''


def paleo_mem_maskable_svg(size: int = 512, safe_ratio: float = 0.68) -> str:
    """Full-bleed icon with the mem glyph centered in the maskable safe zone."""
    font = TTFont(FONT)
    path, (x_min, y_min, x_max, y_max) = _glyph_path(font)
    glyph_w = x_max - x_min
    glyph_h = y_max - y_min

    safe = size * safe_ratio
    scale = min(safe / glyph_w, safe / glyph_h)
    scaled_w = glyph_w * scale
    scaled_h = glyph_h * scale
    tx = (size - scaled_w) / 2 - x_min * scale
    ty = (size - scaled_h) / 2 + y_max * scale

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Mem">
  <rect width="{size}" height="{size}" fill="{GOLD}"/>
  <path fill="{INK}" transform="matrix({scale:.8f},0,0,{-scale:.8f},{tx:.4f},{ty:.4f})" d="{path}"/>
</svg>
'''


def main() -> None:
    OUT.write_text(paleo_mem_svg(), encoding='utf-8')
    OUT_MASKABLE.write_text(paleo_mem_maskable_svg(), encoding='utf-8')
    print(f'Wrote {OUT}')
    print(f'Wrote {OUT_MASKABLE}')


if __name__ == '__main__':
    main()