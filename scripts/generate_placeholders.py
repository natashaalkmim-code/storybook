"""
One-off script used to generate the placeholder divider/sheet artwork that
ships in public/assets/. Not part of the app build — safe to delete once real
assets replace these, keeping it in scripts/ only for provenance.
"""

from PIL import Image, ImageDraw
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "public", "assets")

SECTIONS = [
    {"id": "projects", "color": "#8471C0"},       # purple
    {"id": "contact", "color": "#C3B6E0"},        # lilac
    {"id": "about", "color": "#A9C98B"},          # green
    {"id": "services", "color": "#5C2540"},       # wine
    {"id": "process", "color": "#3B2A5C"},        # deep purple
]

PAPER_TONES = ["#F4EFE6", "#ECE4D4"]  # alternate paper / paper-dim


def hex_to_rgba(hex_color, alpha=255):
    hex_color = hex_color.lstrip("#")
    r, g, b = (int(hex_color[i : i + 2], 16) for i in (0, 2, 4))
    return (r, g, b, alpha)


def make_divider(color_hex, path, size=(900, 270)):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = hex_to_rgba(color_hex)

    # main horizontal bar
    draw.rounded_rectangle([0, 92, size[0], size[1]], radius=16, fill=color)
    # tab bump sticking up from the bar, like a hanging folder divider
    draw.rounded_rectangle([56, 0, 360, 130], radius=16, fill=color)

    img.save(path, "WEBP", lossless=True)


def make_sheet(color_hex, path, size=(700, 900)):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    color = hex_to_rgba(color_hex)
    draw.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1], radius=14, fill=color)
    img.save(path, "WEBP", lossless=True)


def main():
    dividers_dir = os.path.join(BASE, "dividers")
    sheets_dir = os.path.join(BASE, "sheets")
    os.makedirs(dividers_dir, exist_ok=True)
    os.makedirs(sheets_dir, exist_ok=True)

    for i, section in enumerate(SECTIONS):
        make_divider(section["color"], os.path.join(dividers_dir, f"{section['id']}.webp"))
        paper = PAPER_TONES[i % len(PAPER_TONES)]
        make_sheet(paper, os.path.join(sheets_dir, f"{section['id']}.webp"))
        print(f"generated {section['id']}")


if __name__ == "__main__":
    main()
