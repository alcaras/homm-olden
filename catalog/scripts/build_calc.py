"""Per-faction Law and Building calculator data.

Extracts structured per-faction tables from the raw game data so the SPA can
render an interactive "pick your laws / pick your buildings" calculator with
running resource and law-point totals.

Inputs:
  catalog/raw/DB/objects_logic/cities/<faction>_city.json
  catalog/raw/DB/fractions/<n>_<faction>.json
  catalog/raw/DB/fractions_laws/fractions_laws_table_<faction>.json
  catalog/raw/Lang/english/texts/cities.json
  catalog/raw/Lang/english/texts/factionLaws.json

Output:
  docs/calc-data.js  (window.OE_CALC_DATA)
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT_JS = ROOT / "docs" / "calc-data.js"

# In-game faction key → site display id
KEY_TO_ID = {
    "human":    "temple",
    "undead":   "necropolis",
    "nature":   "sylvan",
    "demon":    "hive",
    "unfrozen": "schism",
    "dungeon":  "dungeon",
}
ID_TO_KEY = {v: k for k, v in KEY_TO_ID.items()}
FACTION_ORDER = ["temple", "necropolis", "sylvan", "hive", "schism", "dungeon"]
FACTION_DISPLAY = {
    "temple":     ("Temple",     "human"),
    "necropolis": ("Necropolis", "undead"),
    "sylvan":     ("Grove",      "nature"),
    "hive":       ("Hive",       "demon"),
    "schism":     ("Schism",     "unfrozen"),
    "dungeon":    ("Dungeon",    "dungeon"),
}

# Display names for the building category groupings
CATEGORY_LABEL = {
    "mains":          "Town hall",
    "taverns":        "Tavern",
    "markets":        "Marketplace",
    "artifactMarkets": "Artifact market",
    "banks":          "Banks & treasuries",
    "magicGuilds":    "Mage Guild",
    "hires":          "Creature dwellings",
    "walls":          "Fortifications",
    "intelligences":  "Intelligence Academy",
    "trainingRanges": "Training Range",
    "graals":         "Graal",
    "uniques":        "Faction unique buildings",
    "specials":       "Specials",
    "captures":       "Capture buildings",
}

# The order categories appear in the calculator UI
CATEGORY_ORDER = [
    "mains", "walls", "magicGuilds", "hires",
    "banks", "markets", "taverns",
    "artifactMarkets", "trainingRanges", "intelligences",
    "uniques", "specials", "captures", "graals",
]

# Resource short ids in display order (matches in-game UI)
RESOURCE_ORDER = ["gold", "wood", "ore", "gemstones", "crystals", "mercury", "graal"]
RESOURCE_LABEL = {
    "gold":      "Gold",
    "wood":      "Wood",
    "ore":       "Ore",
    "gemstones": "Gems",
    "crystals":  "Crystal",
    "mercury":   "Mercury",
    "graal":     "Graal",
}


# --------------------------------------------------------------------------- #
# Loaders
# --------------------------------------------------------------------------- #

def load_json(path: Path):
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def load_tokens(path: Path) -> dict[str, str]:
    return {t["sid"]: t["text"] for t in load_json(path).get("tokens", [])}


# --------------------------------------------------------------------------- #
# Buildings
# --------------------------------------------------------------------------- #

def short_sid(sid: str) -> str:
    return sid[len("Build_"):] if sid.startswith("Build_") else sid


def building_name(faction_key: str, sid: str, level: int, tokens: dict[str, str]) -> str:
    """Resolve <Faction>_<sid>_name_level_<N> with fallbacks."""
    pref = faction_key.capitalize()
    short = short_sid(sid)
    for try_key in (
        f"{pref}_{sid}_name_level_{level}",
        f"{pref}_Build_{short}_name_level_{level}",
        f"{pref}_{sid}_name",
        f"{pref}_Build_{short}_name",
    ):
        if try_key in tokens:
            return tokens[try_key]
    return short


def building_desc(faction_key: str, sid: str, level: int, tokens: dict[str, str]) -> str:
    pref = faction_key.capitalize()
    short = short_sid(sid)
    for try_key in (
        f"{pref}_{sid}_description_level_{level}",
        f"{pref}_Build_{short}_description_level_{level}",
        f"{pref}_{sid}_description",
        f"{pref}_Build_{short}_description",
    ):
        if try_key in tokens:
            return tokens[try_key]
    return ""


def extract_buildings(faction_id: str, city_obj: dict, tokens: dict[str, str]) -> list[dict]:
    fkey = ID_TO_KEY[faction_id]
    cats: list[dict] = []
    for cat in CATEGORY_ORDER:
        items = city_obj.get(cat, [])
        if not items:
            continue
        bs = []
        for b in items:
            sid = b.get("sid")
            levels = []
            for li, lvl in enumerate(b.get("parametersPerLevel", []), 1):
                costs = {c["name"]: c["cost"] for c in lvl.get("costs", [])}
                prereqs = [
                    {"sid": p["sid"], "level": p["level"]}
                    for p in lvl.get("prevBuildings", [])
                ]
                levels.append({
                    "level":   li,
                    "name":    building_name(fkey, sid, li, tokens),
                    "desc":    building_desc(fkey, sid, li, tokens),
                    "costs":   costs,
                    "prereqs": prereqs,
                })
            if not levels:
                continue
            bs.append({
                "sid":     sid,
                "shortId": short_sid(sid),
                "levels":  levels,
            })
        if bs:
            cats.append({
                "id":        cat,
                "label":     CATEGORY_LABEL.get(cat, cat),
                "buildings": bs,
            })
    return cats


# --------------------------------------------------------------------------- #
# Laws
# --------------------------------------------------------------------------- #

def extract_laws(faction_id: str, fraction_obj: dict, law_table: dict, tokens: dict[str, str]) -> list[dict]:
    by_id = {l["id"]: l for l in law_table["array"]}
    rows = []
    for ri, row in enumerate(fraction_obj["fractionLawsLines"], 1):
        groups_out = []
        for gi, group in enumerate(row.get("groups", []), 1):
            laws_out = []
            for law_id in group.get("laws", []):
                law = by_id.get(law_id)
                if law is None:
                    continue
                levels = []
                for li, lvl in enumerate(law.get("parametersPerLevel", []), 1):
                    levels.append({
                        "level": li,
                        "cost":  lvl.get("cost", 0),
                    })
                # Match the law to a 1-based ordinal that matches factionLaws.json tokens
                # (tokens are keyed `fraction_law_<key>_<n>_name`, where n is 1..)
                m = re.match(r"fraction_law_[a-z]+_(\d+)$", law_id)
                num = int(m.group(1)) if m else None
                fkey = ID_TO_KEY[faction_id]
                name = tokens.get(f"fraction_law_{fkey}_{num}_name", law_id)
                desc = tokens.get(f"fraction_law_{fkey}_{num}_desc", "")
                # Strip placeholder runtime-arg strings; keep the first line
                desc = desc.split("\n", 1)[0].strip()
                laws_out.append({
                    "id":     law_id,
                    "num":    num,
                    "name":   name,
                    "desc":   desc,
                    "levels": levels,
                })
            groups_out.append({"laws": laws_out})
        rows.append({
            "rowIndex":      ri,
            "countToUnlock": row.get("countToUnlock", 0),
            "groups":        groups_out,
        })
    return rows


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #

def build():
    cities_tokens = load_tokens(RAW / "Lang" / "english" / "texts" / "cities.json")
    laws_tokens   = load_tokens(RAW / "Lang" / "english" / "texts" / "factionLaws.json")

    by_faction = {}
    for fid in FACTION_ORDER:
        fkey = ID_TO_KEY[fid]
        city_obj = load_json(RAW / "DB" / "objects_logic" / "cities" / f"{fkey}_city.json")["array"][0]
        # Find <n>_<key>.json in fractions/
        f_dir = RAW / "DB" / "fractions"
        f_path = next((p for p in f_dir.iterdir() if p.name.endswith(f"_{fkey}.json")), None)
        if not f_path:
            raise RuntimeError(f"no fractions/*_{fkey}.json found")
        fraction_obj = load_json(f_path)["array"][0]
        law_table = load_json(RAW / "DB" / "fractions_laws" / f"fractions_laws_table_{fkey}.json")

        by_faction[fid] = {
            "buildings": extract_buildings(fid, city_obj, cities_tokens),
            "laws":      extract_laws(fid, fraction_obj, law_table, laws_tokens),
        }

    payload = {
        "FACTIONS": [
            {"id": fid, "unitKey": ID_TO_KEY[fid], "name": FACTION_DISPLAY[fid][0]}
            for fid in FACTION_ORDER
        ],
        "BY_FACTION":     by_faction,
        "RESOURCE_ORDER": RESOURCE_ORDER,
        "RESOURCE_LABEL": RESOURCE_LABEL,
        "GENERATED_AT":   datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }

    js = "/* generated by catalog/scripts/build_calc.py — do not edit by hand */\n"
    js += "window.OE_CALC_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")


if __name__ == "__main__":
    build()
