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
  docs/img/factions/<faction_display_id>.png   ('temple', 'grove', ...)
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
for sub in ("heroes", "specs", "factions", "units", "skills", "subskills",
            "spells", "buildings", "laws", "map_objects", "resources", "artifacts"):
    (IMG / sub).mkdir(exist_ok=True)
# Per-faction subdirs for buildings + laws (icon names are faction-specific).
for fkey in ("human", "undead", "nature", "demon", "unfrozen", "dungeon"):
    (IMG / "buildings" / fkey).mkdir(exist_ok=True, parents=True)
    (IMG / "laws" / fkey).mkdir(exist_ok=True, parents=True)

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
    ("grove",     "nature"),
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

# Skills — JSON `parametersPerLevel[i].icon` per level.
# Save the level-1 icon under <skill_id>.png and per-level under <skill_id>_<lvl>.png.
for p in (RAW / "DB" / "heroes_skills" / "skills").glob("skills.json"):
    for sk in load_array(p):
        if not isinstance(sk, dict):
            continue
        sid = sk.get("id")
        if not sid:
            continue
        for li, lvl in enumerate(sk.get("parametersPerLevel", []), 1):
            ico = lvl.get("icon")
            if not ico:
                continue
            # Save the L1 icon under the bare skill id; subsequent levels append _L<n>
            target = IMG / "skills" / (sid if li == 1 else f"{sid}_L{li}")
            wanted.append((target, ico))

# Sub-skills (a.k.a. skill rewards picked at L2/L3)
for p in (RAW / "DB" / "heroes_skills" / "sub_skills").glob("sub_skills.json"):
    for sk in load_array(p):
        if not isinstance(sk, dict):
            continue
        sid = sk.get("id")
        ico = sk.get("icon")
        if sid and ico:
            wanted.append((IMG / "subskills" / sid, ico))

# Spells — JSON `icon` field per spell entry.
for p in (RAW / "DB" / "magics").glob("*.json"):
    if any(x in p.name for x in ("test_", "_special", "punishment_")):
        continue
    for sp in load_array(p):
        if not isinstance(sp, dict):
            continue
        sid = sp.get("id")
        ico = sp.get("icon")
        if sid and ico:
            wanted.append((IMG / "spells" / sid, ico))

# Buildings — per-faction city files. Each building has an `icons` list with
# one asset name per level (some single-level buildings have just one).
for p in (RAW / "DB" / "objects_logic" / "cities").glob("*_city.json"):
    fkey = p.stem.replace("_city", "")
    for city in load_array(p):
        if not isinstance(city, dict):
            continue
        for cat in ("mains", "taverns", "markets", "artifactMarkets", "banks",
                    "magicGuilds", "hires", "walls", "intelligences",
                    "trainingRanges", "graals", "uniques", "specials", "captures"):
            for b in (city.get(cat) or []):
                sid = b.get("sid") or ""
                short = sid[len("Build_"):] if sid.startswith("Build_") else sid
                for li, asset in enumerate(b.get("icons") or [], 1):
                    if not asset: continue
                    # Save as <faction_key>/<short>_L<n>.png so calc-data can
                    # reference 'img/buildings/human/Tier_2_L2.png'.
                    target = IMG / "buildings" / fkey / f"{short}_L{li}"
                    wanted.append((target, asset))

# Map objects — read the names list from mapObjects.json tokens.
# Asset names mostly match the bare object id; numbered neutral barracks need
# special handling (their assets are keyed by creature, not by number).
import re as _re
import json as _json

def _load_tokens_raw(p):
    mt = p.read_text(encoding="utf-8-sig").lstrip("﻿")
    mt = _re.sub(r"//[^\n]*", "", mt); mt = _re.sub(r",(\s*[}\]])", r"\1", mt)
    return _json.loads(mt).get("tokens", [])

# Build barracks_id → primary unit sid map for the numbered-neutral fallback.
barracks_unit = {}
barracks_path = RAW / "DB" / "objects_logic" / "hires" / "barracks.json"
if barracks_path.exists():
    for b in load_array(barracks_path):
        if not isinstance(b, dict): continue
        bid = b.get("id") or ""
        units = (b.get("unitsData") or {}).get("units") or []
        if units and units[0].get("sids"):
            barracks_unit[bid] = units[0]["sids"][0]

# Hand-curated map-object → asset overrides for ids whose default candidates
# below don't resolve. Each entry inserts an extra candidate at the *front*
# of the list so the override wins. Verified against resources.assets +
# sharedassets*.assets in the May 2026 build.
MAP_OBJECT_OVERRIDES: dict[str, list[str]] = {
    # Use the actual building diffuse where the id is a placeholder name.
    "camp_fire":            ["campfire_diffuse"],
    "portal_one":           ["portal_1_diffuse"],
    "chimerologist":        ["Chimerists_Lair_diffuse"],
    "the_gorge":            ["gorge_diffuse"],
    "gladiator_arena":      ["hell_light_arena_diffuse"],
    "lost_library":         ["endless_library_diffuse"],
    "mana_well":            ["autumn_well_01_diffuse"],
    "huntsmans_camp":       ["temporary_camp"],
    "unforgotten_grave":    ["graves_diffuse"],
    # Existing _icon-suffixed sprites the default candidate list missed.
    "mysterious_stone":     ["mysterious_stone_icon"],
    "beer_fountain":        ["beer_fountain_buff_icon"],
    # Numbered neutral barracks where the unit→texture mapping isn't a
    # straight substring (typos in shipped asset names, synonym swaps).
    "barracks_neutral_1":   ["Scholars_House_diffuse"],          # Temple of Four Scholars
    "barracks_neutral_2":   ["obsidian_dragon"],                 # Dragon Crag — no architecture asset, fall back to unit art
    "barracks_neutral_3":   ["barracks_neutral_world_watcher"],  # Watcher Platform
    "barracks_neutral_4":   ["barracks_neutral_coatle"],         # Pyramid (asset uses 'coatle')
    "barracks_neutral_7":   ["barracks_neutral_giand_frog"],     # Blooming Marsh (asset typo 'giand')
    "barracks_neutral_9":   ["barracks_neutral_dragonslayer"],   # Dragonslayer Base
    "barracks_neutral_17":  ["barracks_neutral_fairy"],          # Pixie Tower (pixie ≈ fairy)
    # No usable asset in the May 2026 build for: barracks_neutral_5 (Manticore
    # tower), block_campaign, bronze_prayer, platinum_prayer, orb_observatory,
    # research_laboratory. These render with the missing-image fallback.
}


mo_path = RAW / "Lang" / "english" / "texts" / "mapObjects.json"
if mo_path.exists():
    for t in _load_tokens_raw(mo_path):
        m = _re.match(r"^(.+?)_name$", t.get("sid", ""))
        if not m: continue
        base = m.group(1)
        # Candidate asset names — try in priority order.
        candidates = [
            base,                              # mine_gold, altar_of_magic_1
            base.replace("_", ""),             # camp_fire → campfire
            base + "_color",                   # chest → Chest_color (also matches via case-insensitive lookup)
            base + "_diffuse",
            base.capitalize() + "_color",      # Chest_color
            base.capitalize(),                 # Chest
        ]
        # Numbered neutral barracks: tack on creature-keyed name as a fallback.
        if base in barracks_unit:
            unit_sid = barracks_unit[base]
            candidates.insert(1, f"barracks_neutral_{unit_sid}")
            candidates.insert(2, f"barracks_neutral_{unit_sid.replace('_upg','').replace('_alt','')}")
        # Hand-curated overrides win — push to the front so they're tried first.
        for ov in reversed(MAP_OBJECT_OVERRIDES.get(base, [])):
            candidates.insert(0, ov)
        wanted.append((IMG / "map_objects" / base, candidates))


# Resources — gold, wood, ore, gemstones, crystals, mercury, dust, graal.
for rid in ("gold", "wood", "ore", "gemstones", "crystals", "mercury", "dust", "graal"):
    wanted.append((IMG / "resources" / rid,
                   [rid, f"resource_{rid}", f"Resource_{rid}", rid.capitalize()]))

# Artifacts — JSON `icon` field per artifact entry. Walk the per-slot files.
for p in (RAW / "DB" / "items" / "items").glob("*.json"):
    if any(skip in p.name for skip in ("magic_scroll", "mythic_scroll", "item_slot")):
        continue
    for a in load_array(p):
        if not isinstance(a, dict): continue
        aid = a.get("id"); ico = a.get("icon")
        if aid and ico:
            wanted.append((IMG / "artifacts" / aid, ico))


# Laws — one icon per law entry, keyed by faction key + law number.
for p in (RAW / "DB" / "fractions_laws").glob("fractions_laws_table_*.json"):
    fkey = p.stem.replace("fractions_laws_table_", "")
    for law in load_array(p):
        if not isinstance(law, dict):
            continue
        sid = law.get("id") or ""
        ico = law.get("icon")
        # Extract law number from 'fraction_law_<key>_<n>'
        import re as _re
        m = _re.match(r"fraction_law_[a-z]+_(\d+)$", sid)
        if not m or not ico:
            continue
        num = m.group(1)
        wanted.append((IMG / "laws" / fkey / num, ico))


# ---------- Index every bundle by texture/sprite name ----------
# resources.assets carries the bulk of icons; sharedassets*.assets host
# additional sprites + diffuse textures (Scholars_House_diffuse,
# graves_diffuse, endless_library_diffuse, etc.) referenced by the map-object
# overrides.
import glob as _glob
ASSET_BUNDLES = [str(RESOURCES_ASSETS)] + sorted(_glob.glob(
    str(RESOURCES_ASSETS.parent / "sharedassets*.assets")))

# Build name → object map. Prefer Texture2D over Sprite (full image vs atlas
# slice); resources.assets matches win over sharedassets matches for backward
# compatibility with the prior single-bundle indexing.
by_name_tex: dict[str, object] = {}
by_name_spr: dict[str, object] = {}
for bundle in ASSET_BUNDLES:
    print(f"loading {Path(bundle).name}…")
    try:
        env_b = UnityPy.load(bundle)
    except Exception as e:
        print(f"  skip ({e})")
        continue
    n_obj = 0
    for o in env_b.objects:
        if o.type.name not in ("Texture2D", "Sprite"):
            continue
        try:
            d = o.read()
            n = getattr(d, "m_Name", "") or ""
        except Exception:
            continue
        if not n:
            continue
        n_obj += 1
        if o.type.name == "Texture2D":
            by_name_tex.setdefault(n, o)
        else:
            by_name_spr.setdefault(n, o)
    print(f"  +{n_obj} textures/sprites")
print(f"index: {len(by_name_tex):,} Texture2D · {len(by_name_spr):,} Sprite")
env = None  # legacy reference removed; downstream uses the name maps above.


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
