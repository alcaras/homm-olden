"""Map templates — multiplayer template browser.

Source: HeroesOldenEra_Data/StreamingAssets/map_templates/*.rmg.json — each
template has its own RMG config with name, gameMode, sizeX/Z, hero count
limits, and a description localization sid. The matching <Name>.png file
in the same directory is the in-game preview image.

We copy each .png to docs/img/templates/<id>.png and emit
docs/map-templates-data.js with the metadata.
"""

from __future__ import annotations

import json
import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
GAME = ROOT / "HeroesOldenEra_Data" / "StreamingAssets" / "map_templates"
RAW = ROOT / "catalog" / "raw"
OUT_JS = ROOT / "docs" / "map-templates-data.js"
IMG_OUT = ROOT / "docs" / "img" / "templates"


def load_json_strip(path: Path):
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def load_tokens(path: Path) -> dict[str, str]:
    return {t["sid"]: t["text"] for t in load_json_strip(path).get("tokens", [])}


def slug(name: str) -> str:
    """Filename-safe id from a display name."""
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


def size_label(x: int, z: int) -> str:
    """Map sizeX×sizeZ to a Small/Medium/Large/Huge bucket using the
    in-game scheme: ≤96 small, ≤128 medium, ≤176 large, larger huge."""
    n = max(x or 0, z or 0)
    if n <= 96:  return "small"
    if n <= 128: return "medium"
    if n <= 176: return "large"
    return "huge"


def mode_label(game_mode: str) -> str:
    """Normalize gameMode strings to display labels."""
    m = (game_mode or "").lower()
    if "singlehero" in m or "single_hero" in m: return "single-hero"
    if "classic" in m: return "classic"
    if "scenario" in m: return "scenario"
    if "pve" in m: return "pve"
    return m or "multiplayer"


# Curated list of templates used in competitive tournament play. The .rmg.json
# files don't carry this distinction — gameMode is just Classic / SingleHero —
# so we maintain it here. Tournament is *additive* on top of the gameplay
# mode (an Exodus template is BOTH single-hero AND tournament).
TOURNAMENT_TEMPLATES = {
    "exodus",          # the canonical Exodus tournament template
    "exodus_classic",  # classic-mode variant
    "vendetta",
    "sprint",
    "jebus_cross",
    "jebus_cross_classic",
    "jebus_outcast",
    "massacre",
    "helltide",
    "hellmonth",
    "maneuvers",
    "blitz",
    "helltime",
}


def build():
    if not GAME.exists():
        raise SystemExit(f"missing game dir: {GAME}")
    ui_tokens = load_tokens(RAW / "Lang" / "english" / "texts" / "ui.json")

    IMG_OUT.mkdir(parents=True, exist_ok=True)

    templates = []
    for cfg in sorted(GAME.glob("*.rmg.json")):
        try:
            d = json.load(cfg.open(encoding="utf-8-sig"))
        except Exception:
            continue
        name = d.get("name") or cfg.stem
        png = cfg.with_suffix("").with_suffix(".png")  # strip .rmg → .png
        # Some files are like "All Around.rmg.json" → with_suffix("") gives "All Around.rmg"
        # then with_suffix(".png") gives "All Around.png" — works.
        png_alt = GAME / f"{name}.png"
        png_path = png if png.exists() else (png_alt if png_alt.exists() else None)
        sid = slug(name)

        # Copy PNG to docs/img/templates/<slug>.png
        img_url = None
        if png_path and png_path.exists():
            dst = IMG_OUT / f"{sid}.png"
            try:
                shutil.copy2(png_path, dst)
                img_url = f"img/templates/{sid}.png"
            except Exception:
                pass

        rules = d.get("gameRules") or {}
        hero_min = rules.get("heroCountMin")
        hero_max = rules.get("heroCountMax")

        # Description: localized via ui.json. Strip leading <b>...</b> markers.
        desc_sid = d.get("description") or ""
        desc = (ui_tokens.get(desc_sid, "") or "").strip()
        desc = re.sub(r"^<b>[^<]*</b>\s*", "", desc).strip()

        size_x = d.get("sizeX") or 0
        size_z = d.get("sizeZ") or 0

        mode = mode_label(d.get("gameMode") or "")
        # Heuristic secondary tag: PVE vs PvP from filename
        if sid.startswith("pve_"):
            mode = "pve"

        templates.append({
            "id":         sid,
            "name":       name,
            "desc":       desc,
            "image":      img_url,
            "mode":       mode,
            "tournament": sid in TOURNAMENT_TEMPLATES,
            "size":       size_label(size_x, size_z),
            "sizeX":      size_x,
            "sizeZ":      size_z,
            "heroMin":    hero_min,
            "heroMax":    hero_max,
        })
    templates.sort(key=lambda t: t["name"])

    payload = {
        "TEMPLATES":    templates,
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_map_templates.py — do not edit by hand */\n"
    js += "window.OE_MAP_TEMPLATES_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")
    print(f"  {len(templates)} templates")
    by_mode = {}
    by_size = {}
    with_img = sum(1 for t in templates if t["image"])
    for t in templates:
        by_mode[t["mode"]] = by_mode.get(t["mode"], 0) + 1
        by_size[t["size"]] = by_size.get(t["size"], 0) + 1
    print(f"  with image: {with_img}/{len(templates)}")
    for m, n in sorted(by_mode.items()): print(f"  mode={m:14s} {n}")
    for s, n in sorted(by_size.items()): print(f"  size={s:14s} {n}")


if __name__ == "__main__":
    build()
