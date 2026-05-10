"""Artifacts data — 117 artifacts across 9 slots + 24 item sets.

Inputs:
  catalog/raw/DB/items/items/*.json         (per-slot artifact lists)
  catalog/raw/DB/items/item_sets/*.json     (set bonuses)
  catalog/raw/Lang/english/texts/artifacts.json

Each artifact: id, name, slot, rarity, icon, bonuses (stat changes resolved
from numeric parameters), costs, max level, set membership, narrative.

Output:
  docs/artifacts-data.js  (window.OE_ARTIFACTS_DATA)
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT_JS = ROOT / "docs" / "artifacts-data.js"

# Slot label + display order (head → boots, then ring, then unique)
SLOT_ORDER = ["head", "armor", "belt", "boots", "back",
              "left_hand", "right_hand", "ring", "unic_slot"]
SLOT_LABEL = {
    "head":       "Head",
    "armor":      "Armor",
    "belt":       "Belt",
    "boots":      "Boots",
    "back":       "Back",
    "left_hand":  "Left hand",
    "right_hand": "Right hand",
    "ring":       "Ring",
    "unic_slot":  "Unique slot",
}

# Files in items/ that aren't actual gear (skip)
SKIP_FILES = {"magic_scroll.json", "enchante_magic_scroll.json",
              "mythic_scroll_box.json", "item_slot.json"}


def load_json_strip(path: Path):
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text); text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def load_tokens(path: Path) -> dict[str, str]:
    return {t["sid"]: t["text"] for t in load_json_strip(path).get("tokens", [])}


def fmt_signed(v) -> str:
    """Format a signed numeric value: 1 → '+1', -1 → '-1', 0.25 → '+0.25'."""
    try:
        f = float(v)
    except (TypeError, ValueError):
        return str(v)
    if f == int(f):
        return f"{int(f):+d}"
    return f"{f:+g}"


def stat_label(stat: str) -> str:
    """Map raw stat ids to display labels."""
    return ({
        "offence":     "Attack",
        "defence":     "Defense",
        "spellPower":  "Spell Power",
        "intelligence":"Knowledge",
        "viewRadius":  "View",
        "moralePoints":"Morale",
        "luckPoints":  "Luck",
        "moraleAddition":  "Morale",
        "luckAddition":    "Luck",
        "movementPoints":  "Movement",
    }).get(stat, stat)


def summarize_bonus(b: dict) -> str:
    bt = b.get("type") or ""
    p = b.get("parameters") or []
    if bt == "heroStat" and len(p) >= 2:
        return f"{fmt_signed(p[1])} {stat_label(p[0])}"
    if bt == "unitStat" and len(p) >= 2:
        return f"Units: {fmt_signed(p[1])} {stat_label(p[0])}"
    if bt == "heroBattleAbility":
        return f"Ability: {p[0] if p else '?'}"
    if bt == "heroSkillBonus" and len(p) >= 2:
        return f"+{p[1]} {p[0]} skill"
    return f"{bt}: {' '.join(str(x) for x in p)}"


def resolve_desc(desc: str, bonuses: list[dict]) -> str:
    """Substitute {N} in desc with values from bonuses[N].parameters[-1].
    Each artifact's description is short enough that we just take the
    LAST numeric param of each bonus block (for heroStat that's the
    magnitude). Strip sign — descriptions usually include +/- explicitly."""
    if not desc:
        return desc
    values = []
    for b in bonuses:
        params = b.get("parameters") or []
        v = None
        for p in reversed(params):
            try:
                v = float(p); break
            except (TypeError, ValueError):
                continue
        values.append(v)

    def fmt(v):
        if v is None: return "?"
        return str(int(v)) if v == int(v) else f"{v:g}"

    def repl(m):
        idx = int(m.group(1))
        if idx >= len(values) or values[idx] is None:
            return "?"
        return fmt(abs(values[idx]))  # desc has the sign already

    return re.sub(r"\{(\d+)\}", repl, desc)


def build():
    tokens = load_tokens(RAW / "Lang" / "english" / "texts" / "artifacts.json")

    # Load all item sets first so we can attach set name + bonuses to each artifact
    sets: dict[str, dict] = {}
    for f in (RAW / "DB" / "items" / "item_sets").glob("*.json"):
        for s in load_json_strip(f).get("array", []):
            if not isinstance(s, dict) or not s.get("id"):
                continue
            set_id = s["id"]
            set_name_sid = s.get("name") or f"{set_id}_name"
            sets[set_id] = {
                "id":     set_id,
                "name":   tokens.get(set_name_sid, set_id),
                "items":  s.get("itemsInSet") or [],
                "bonuses": [
                    {
                        "summary": summarize_bonus(b),
                        "trigger": b.get("triggerCount") or 0,
                    }
                    for b in (s.get("bonuses") or [])
                ],
            }

    # Now load each per-slot artifact file
    artifacts = []
    for path in sorted((RAW / "DB" / "items" / "items").iterdir()):
        if path.name in SKIP_FILES:
            continue
        slot = path.stem
        for a in load_json_strip(path).get("array", []):
            if not isinstance(a, dict) or not a.get("id"):
                continue
            aid = a["id"]
            raw_desc = tokens.get(a.get("description") or "", "").strip()
            artifacts.append({
                "id":          aid,
                "name":        tokens.get(a.get("name") or "", aid),
                "slot":        slot,
                "rarity":      a.get("rarity") or "common",
                "icon":        a.get("icon") or aid,
                "desc":        resolve_desc(raw_desc, a.get("bonuses") or []),
                "narrative":   tokens.get(a.get("narrativeDescription") or "", "").strip(),
                "bonuses":     [summarize_bonus(b) for b in (a.get("bonuses") or [])],
                "itemSet":     a.get("itemSet") or "",
                "maxLevel":    a.get("maxLevel") or 1,
                "goodsValue":  a.get("goodsValue") or 0,
            })
    # Sort by slot then rarity then name
    rarity_rank = {"common": 0, "uncommon": 1, "rare": 2, "legendary": 3, "unique": 4}
    artifacts.sort(key=lambda a: (SLOT_ORDER.index(a["slot"]) if a["slot"] in SLOT_ORDER else 99,
                                  -rarity_rank.get(a["rarity"], 0),
                                  a["name"].lower()))

    payload = {
        "ARTIFACTS":  artifacts,
        "ITEM_SETS":  sets,
        "SLOT_ORDER": SLOT_ORDER,
        "SLOT_LABEL": SLOT_LABEL,
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_artifacts.py — do not edit by hand */\n"
    js += "window.OE_ARTIFACTS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")
    print(f"  artifacts: {len(artifacts)}, sets: {len(sets)}")
    by_slot = {}
    for a in artifacts:
        by_slot[a["slot"]] = by_slot.get(a["slot"], 0) + 1
    for s in SLOT_ORDER:
        if s in by_slot:
            print(f"  {SLOT_LABEL[s]:14s} {by_slot[s]}")


if __name__ == "__main__":
    build()
