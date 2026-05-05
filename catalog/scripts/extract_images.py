"""Extract hero / faction / specialization / unit icon PNGs from the game's
Unity asset bundle (resources.assets) and write them under docs/img/.

Source naming conventions (verified from the game data):
  Heroes        → JSON `icon` field, e.g. "hero_human_1_ister"
  Specializations → JSON `icon`, e.g. "human_hero_1_specialization_icon"
  Factions      → "fraction_<faction>" + "<faction>_icon" (both forms exist)
  Units         → derived: title-cased unit id with one alias for "trogl"
                  → e.g. "Icon_Esquire", "Icon_Esquire_Upg", "Icon_Esquire_Upg_Alt",
                         "Icon_Troglodyte"

Output layout:
  docs/img/heroes/<hero_id>.png
  docs/img/specs/<spec_id>.png
  docs/img/factions/<faction_display_id>.png   ('temple', 'sylvan', ...)
  docs/img/units/<unit_id>.png

Skips entries that can't be found (missing icons in the bundle).
"""

from __future__ import annotations

import sys
from pathlib import Path

import UnityPy

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
RESOURCES_ASSETS = ROOT / "HeroesOldenEra_Data" / "resources.assets"
IMG = ROOT / "docs" / "img"
IMG.mkdir(parents=True, exist_ok=True)
for sub in ("heroes", "specs", "factions", "units"):
    (IMG / sub).mkdir(exist_ok=True)

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array


# ---------- Build the wanted-icons list ----------
# Each entry: (target_path_no_ext, unity_asset_name)
wanted: list[tuple[Path, str]] = []

# Heroes
for p in (RAW / "DB" / "heroes").glob("*/*.json"):
    if any(x in str(p) for x in ("campaign", "tutorial", "custom")):
        continue
    for h in load_array(p):
        if not isinstance(h, dict):
            continue
        hid = h.get("id")
        ico = h.get("icon")
        if hid and ico:
            wanted.append((IMG / "heroes" / hid, ico))

# Specializations
for p in (RAW / "DB" / "heroes_specializations").glob("specializations_*.json"):
    for s in load_array(p):
        if not isinstance(s, dict):
            continue
        sid = s.get("id")
        ico = s.get("icon")
        if sid and ico:
            wanted.append((IMG / "specs" / sid, ico))

# Factions — display id maps to in-game faction key
FACTIONS = [
    ("temple",     "human"),
    ("necropolis", "undead"),
    ("sylvan",     "nature"),
    ("hive",       "demon"),
    ("schism",     "unfrozen"),
    ("dungeon",    "dungeon"),
]
for did, fkey in FACTIONS:
    # Prefer fraction_<key>; fall back to <key>_icon if not present.
    wanted.append((IMG / "factions" / did, f"fraction_{fkey}"))

# Units — derive Unity asset name from unit id by title-casing.
# Special-case: 'trogl' → 'Troglodyte' (the game spells it out in icon names)
def unit_asset_name(uid: str) -> str:
    parts = uid.split("_")
    titled = []
    for w in parts:
        if w == "trogl":
            titled.append("Troglodyte")
        elif w == "upg":
            titled.append("Upg")
        elif w == "alt":
            titled.append("Alt")
        else:
            titled.append(w.capitalize())
    return "Icon_" + "_".join(titled)

unit_ids: set[str] = set()
for p in (RAW / "DB" / "units" / "units_logics").rglob("*.json"):
    for u in load_array(p):
        if isinstance(u, dict) and u.get("id"):
            unit_ids.add(u["id"])
# Some units use different icon names — fall back through several variants
# to absorb the ~6 known irregulars (halfling, dragon_hunter, *_cultist, ...).
def unit_icon_candidates(uid: str) -> list[str]:
    return [
        unit_asset_name(uid),     # Icon_TitleCased
        uid,                       # bare id
        uid.replace("_upg_alt", "_upg2"),  # some assets use _upg2 instead
        f"Icon_{uid.replace('_', ' ').title().replace(' ', '_')}",
    ]

for uid in sorted(unit_ids):
    wanted.append((IMG / "units" / uid, unit_icon_candidates(uid)))


# ---------- Index resources.assets by name ----------
print(f"loading {RESOURCES_ASSETS}…")
env = UnityPy.load(str(RESOURCES_ASSETS))
print(f"  {len(env.objects)} objects")

# Build name → object map. Prefer Texture2D over Sprite (full image vs atlas slice).
by_name_tex: dict[str, object] = {}
by_name_spr: dict[str, object] = {}
for o in env.objects:
    if o.type.name not in ("Texture2D", "Sprite"):
        continue
    try:
        d = o.read()
        n = getattr(d, "m_Name", "") or ""
    except Exception:
        continue
    if not n:
        continue
    if o.type.name == "Texture2D":
        by_name_tex.setdefault(n, o)
    else:
        by_name_spr.setdefault(n, o)


# ---------- Extract ----------
hits = miss = 0
miss_examples: list[tuple[str, str]] = []
for target, name in wanted:
    candidates = name if isinstance(name, list) else [name]
    obj = None
    for cand in candidates:
        obj = by_name_tex.get(cand) or by_name_spr.get(cand)
        if obj is not None:
            break
    # Faction fallback: if 'fraction_<key>' missing, try '<key>_icon'
    if obj is None and target.parent.name == "factions":
        fkey = next((k for did, k in FACTIONS if did == target.stem), None)
        if fkey:
            alt = f"{fkey}_icon"
            obj = by_name_tex.get(alt) or by_name_spr.get(alt)
    if obj is None:
        miss += 1
        if len(miss_examples) < 8:
            miss_examples.append((
                target.parent.name + "/" + target.name,
                ", ".join(candidates) if isinstance(name, list) else name,
            ))
        continue
    try:
        data = obj.read()
        img = data.image  # PIL.Image (UnityPy decodes texture data automatically)
        out = target.with_suffix(".png")
        img.save(out, "PNG", optimize=True)
        hits += 1
    except Exception as e:
        miss += 1
        if len(miss_examples) < 8:
            miss_examples.append((target.parent.name + "/" + target.name, f"{name} ({e})"))

print(f"extracted: {hits}    missing: {miss}")
if miss_examples:
    print("missing samples:")
    for t, n in miss_examples:
        print(f"  {t}  ←  {n}")
