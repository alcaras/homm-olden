"""Map objects data — every interactable thing on the adventure map.

Pulls names + descriptions + flavor from Lang/english/texts/mapObjects.json,
filters to user-visible adventure-map objects (excludes city barracks /
campaign-only / variants), and groups by category for the SPA's Map Objects
page.

Output:
  docs/map-objects-data.js  (window.OE_MAP_OBJECTS_DATA)
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT_JS = ROOT / "docs" / "map-objects-data.js"

TOKENS_FILE = RAW / "Lang" / "english" / "texts" / "mapObjects.json"


# Category → label + ordered list of id-prefixes that match it. First match wins.
CATEGORIES = [
    ("resources",   "Resource mines & sources",
        ["mine_", "windmill", "celestial_node", "magic_amplifier_",
         "secret_resource_", "tree_of_abundance"]),
    ("treasure",    "Chests, scrolls & one-time loot",
        ["chest", "pandora_box", "scroll_box", "enchanted_scroll_box",
         "mythic_scroll_box", "camp_fire", "abandoned_corpse",
         "abandoned_mansion", "buried_treasure", "found_loot"]),
    ("shrines",     "Shrines, altars & seer-style structures",
        ["altar_of_magic", "altar_of_sacrifice", "shrine_", "trial_scales",
         "wise_owl", "wind_rose", "stargazer", "tree_of_knowledge",
         "obelisk", "monolith", "watchtower", "twilight_bloom"]),
    ("dwellings",   "Creature dwellings (external)",
        ["dwelling_", "neutral_dwelling", "barracks_neutral", "random_hire",
         "creature_house"]),
    ("banks",       "Adventure banks & guarded sites",
        ["abandoned_outpost", "underground_lair", "unforgotten_grave",
         "uncanny_rite", "abnormal_structure", "trial_", "bank_",
         "guarded_", "exp_bank", "buff_bank", "armory_automaton",
         "alvars_eye", "alvar_", "village", "tomb_",
         "troglodyte_throne", "unstable_ruins", "abandoned_temple",
         "outpost_", "campfire", "ruins"]),
    ("travel",      "Travel & teleports",
        ["portal_", "town_gate", "garrison", "fickle_shrine",
         "pocket_dimension", "mirage", "prison"]),
    ("markets",     "Markets, traders & academies",
        ["market", "item_market", "alchemy_lab", "res_trade",
         "unit_res_trade", "bonus_upgrade", "university", "arena",
         "barbaric_arena", "hell_light_arena", "alkana_arena",
         "watcher", "tavern_obj", "magic_mine"]),
    ("special",     "Specials & one-of-a-kind",
        ["insaras_eye", "eternal_dragon", "chimerologist", "celestial_sphere",
         "sacrificial_shrine", "win_condition_", "treasure_chamber",
         "border_guard", "keystone", "mystic_pond", "redwood_observatory",
         "arborcopia"]),
]

# Filters: skip objects whose id matches any of these patterns.
SKIP_PATTERNS = [
    r"^barracks_(human|undead|nature|demon|unfrozen|dungeon)_\d+",
    r"^build_",
    r".*_old$",
    r"^campaign_",
    r"^test_",
    r"^todo_",
    r"^pseudo_",
    r"^global_",
]


def load_tokens(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return {t["sid"]: t["text"] for t in json.loads(text).get("tokens", [])}


def categorize(base_id: str) -> str:
    lid = base_id.lower()
    for cat_id, _, prefixes in CATEGORIES:
        for prefix in prefixes:
            if lid.startswith(prefix) or lid == prefix.rstrip("_"):
                return cat_id
    return "other"


def should_skip(base_id: str) -> bool:
    for pat in SKIP_PATTERNS:
        if re.match(pat, base_id):
            return True
    return False


def build():
    tokens = load_tokens(TOKENS_FILE)
    bases: dict[str, dict] = {}
    for sid, text in tokens.items():
        m = re.match(r"^(.+?)_name$", sid)
        if not m:
            continue
        base = m.group(1)
        if should_skip(base) or not text or not text.strip():
            continue
        bases[base] = {
            "id":         base,
            "name":       text,
            "desc":       (tokens.get(f"{base}_description") or "").strip(),
            "narrative":  (tokens.get(f"{base}_narrativeDescription") or "").strip(),
            "category":   categorize(base),
        }
    for entry in bases.values():
        entry["desc"] = re.sub(r"\{[0-9]+\}", "?", entry["desc"]) if entry["desc"] else ""

    cat_order = [cid for cid, _, _ in CATEGORIES] + ["other"]
    cat_label = dict([(cid, label) for cid, label, _ in CATEGORIES] + [("other", "Other")])
    grouped = {cid: [] for cid in cat_order}
    for entry in bases.values():
        grouped[entry["category"]].append(entry)
    for cid in grouped:
        grouped[cid].sort(key=lambda e: e["name"].lower())

    payload = {
        "OBJECTS":      [{"id": cid, "label": cat_label[cid], "items": grouped[cid]}
                         for cid in cat_order if grouped[cid]],
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_map_objects.py — do not edit by hand */\n"
    js += "window.OE_MAP_OBJECTS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")
    print(f"  total: {sum(len(g['items']) for g in payload['OBJECTS'])} objects across "
          f"{len(payload['OBJECTS'])} categories")
    for g in payload["OBJECTS"]:
        print(f"  {g['label']:40s} {len(g['items']):3d}")


if __name__ == "__main__":
    build()
