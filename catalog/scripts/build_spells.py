"""Spells data — all combat + world spells, grouped by school and tier.

Inputs:
  catalog/raw/DB/magics/{battle,world}_{day,night,space,primal,neutral}_magics.json
  catalog/raw/Lang/english/texts/magic.json

Output:
  docs/spells-data.js  (window.OE_SPELLS_DATA)

Each spell carries: id, name, icon, school, tier (rank), mana cost per level,
description, magic-type (Recovery / Damage / Buff / Debuff / Summoning / etc),
and whether it's a battle or world spell.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT_JS = ROOT / "docs" / "spells-data.js"

MAGIC_TOKENS = RAW / "Lang" / "english" / "texts" / "magic.json"

SCHOOL_LABEL = {
    "day":     "Daylight",
    "night":   "Nightshade",
    "space":   "Arcane",
    "primal":  "Primal",
    "neutral": "Neutral",
}

# Display order (matches the Subclasses matrix grouping for schools)
SCHOOL_ORDER = ["day", "night", "space", "primal", "neutral"]


def load_json_strip(path: Path):
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def load_tokens(path: Path) -> dict[str, str]:
    return {t["sid"]: t["text"] for t in load_json_strip(path).get("tokens", [])}


def load_buffs() -> dict[str, dict]:
    """Index every magic-buff entry by its sid so spell-buff descriptions can
    surface the actual magnitude (e.g. magic_haste_effect_0 → +1 Speed).
    Each entry's data.stats block holds the relevant numeric value."""
    out = {}
    for p in (RAW / "DB" / "buffs").glob("buffs_*_magics.json"):
        for b in load_json_strip(p).get("array", []):
            if isinstance(b, dict) and b.get("id"):
                out[b["id"]] = b
    return out


def buff_magnitude(buff_def: dict) -> float | None:
    """Best-effort: pull the leading numeric magnitude out of a buff's data
    block. Buffs typically encode a single stat change (e.g. outDmgMods +0.2,
    speed +1) — we surface that one."""
    if not buff_def:
        return None
    data = buff_def.get("data") or {}
    stats = data.get("stats") or {}
    # Walk all stat groups and look for either a single numeric value or a
    # list of {t, v} pairs. Return the first numeric we find.
    def walk(obj):
        if isinstance(obj, dict):
            if "v" in obj and isinstance(obj.get("v"), (int, float)):
                return obj["v"]
            for v in obj.values():
                r = walk(v)
                if r is not None:
                    return r
        elif isinstance(obj, list):
            for v in obj:
                r = walk(v)
                if r is not None:
                    return r
        elif isinstance(obj, (int, float)):
            return obj
        return None
    return walk(stats)


def spell_values(sp: dict, buffs: dict[str, dict]) -> list[float | str]:
    """Flatten the user-visible numeric values used to fill {N} placeholders.
    Order matters: descriptions index by position. Heuristic priority:
      1. dealer-level damage fields (minBaseDmg, maxBaseDmg, numTargets,
         minStackDmg, maxStackDmg)
      2. buff magnitude (from data.stats), then buff duration
      3. targetMechanics values (numeric only)
    Falls back to None for missing positions; the caller renders those as '?'.
    """
    bm = sp.get("battleMagic") or sp.get("battleMagic_") or {}
    dealers = bm.get("magicDealers") or []
    if not dealers:
        return []
    d = dealers[0]
    values: list[float | None] = []

    # Damage spell fields
    for k in ("minBaseDmg", "maxBaseDmg", "minStackDmg", "maxStackDmg", "numTargets"):
        if k in d:
            try:
                values.append(float(d[k]))
            except (TypeError, ValueError):
                pass

    # Buff magnitude + duration
    buff_field = d.get("buff") or {}
    if buff_field:
        mag = buff_magnitude(buffs.get(buff_field.get("sid", "")))
        if mag is not None:
            values.append(float(mag))
        if "duration" in buff_field:
            try:
                values.append(float(buff_field["duration"]))
            except (TypeError, ValueError):
                pass

    # targetMechanics values (heal/damage/dispel/etc)
    for m in d.get("targetMechanics", []) or []:
        for v in m.get("values", []) or []:
            try:
                values.append(float(v))
            except (TypeError, ValueError):
                continue
    return values


def fmt_int_if_int(v: float) -> str:
    return str(int(v)) if v == int(v) else f"{v:g}"


def resolve_spell_desc(desc: str, values: list[float | None]) -> str:
    """Substitute {N} placeholders in `desc` with values[N]. Same context-aware
    formatting as the law/building resolver:
      "{0}%" → percent (×100 if fractional)
      "{0} times"/"fold" → multiplier-delta (1+v)
      otherwise → raw integer / float
    """
    if not desc:
        return desc

    def repl(m):
        idx = int(m.group(1))
        if idx >= len(values) or values[idx] is None:
            return "?"
        v = values[idx]
        tail = desc[m.end():m.end() + 24].lower()
        if tail.startswith("%"):
            if 0 < abs(v) < 1:
                v = v * 100
            return fmt_int_if_int(v)
        # Multiplier-delta only for "times more" / "times the" / "fold"
        # — avoids over-applying to plain "{N} time(s)" (count).
        if " times more" in tail or " times the" in tail or "fold" in tail:
            return fmt_int_if_int(1 + v)
        return fmt_int_if_int(v)

    return re.sub(r"\{(\d+)\}", repl, desc)


def collect_spells(tokens: dict[str, str], buffs: dict[str, dict]) -> list[dict]:
    """Walk every magics/*.json file, normalize each spell into a flat dict."""
    out = []
    for p in sorted((RAW / "DB" / "magics").glob("*.json")):
        # Skip test/special/punishment variants — these are not user-castable.
        if any(x in p.name for x in ("test_", "_special", "punishment_")):
            continue
        scope = "world" if p.name.startswith("world_") else "battle"
        for sp in load_json_strip(p).get("array", []):
            if not isinstance(sp, dict) or not sp.get("id"):
                continue
            sid = sp["id"]
            name_sid = sp.get("name") or f"{sid}_name"
            # description can be a list of variants — take the FIRST entry as
            # the display description (matches the in-game tooltip default).
            desc_field = sp.get("description")
            if isinstance(desc_field, list) and desc_field:
                desc_sid = desc_field[0]
            else:
                desc_sid = desc_field or f"{sid}_description"
            magic_type_sid = sp.get("magicTypeDescription") or ""
            magic_type = tokens.get(magic_type_sid, "")
            mana_per_level = sp.get("manaCost") or []
            # Cooldown rule from in-game: tier N → (N + 1) rounds. Verified
            # against the wiki: tier 1 = 2 rounds, +1 per tier.
            tier = sp.get("rank") or 0
            cooldown = (tier + 1) if tier else None
            # Resolve {N} placeholders from spell data + linked buff definitions
            raw_desc = (tokens.get(desc_sid, "") or "").strip()
            values = spell_values(sp, buffs)
            desc_resolved = resolve_spell_desc(raw_desc, values)

            out.append({
                "id":           sid,
                "name":         tokens.get(name_sid, sid),
                "icon":         sp.get("icon") or sid,
                "school":       sp.get("school_") or "neutral",
                "tier":         tier,
                "scope":        scope,                      # 'battle' or 'world'
                "magicType":    magic_type,
                "desc":         raw_desc,
                "descResolved": desc_resolved,
                "manaCost":     list(mana_per_level),
                "cooldown":     cooldown,
                "learnCost":    sp.get("learnCost") or [],
            })
    return out


def load_heroes_with_starting_spells() -> dict[str, list[dict]]:
    """Build spell_id → list of heroes who start with that spell, by reading
    docs/data.js's HEROES array (which build_data_js.py emits)."""
    p = ROOT / "docs" / "data.js"
    if not p.exists():
        return {}
    text = p.read_text(encoding="utf-8")
    m = re.search(r"const HEROES = (\[.*?\]);", text, re.DOTALL)
    if not m:
        return {}
    out = {}
    for h in json.loads(m.group(1)):
        for sp in (h.get("spells") or []):
            out.setdefault(sp["id"], []).append({
                "id":      h["id"],
                "name":    h["name"],
                "faction": h["faction"],
                "kind":    h["kind"],
                "level":   sp.get("level") or 1,
            })
    for sid in out:
        out[sid].sort(key=lambda r: (-r["level"], r["faction"], r["name"]))
    return out


def build():
    tokens = load_tokens(MAGIC_TOKENS)
    buffs = load_buffs()
    spells = collect_spells(tokens, buffs)
    starters = load_heroes_with_starting_spells()
    for sp in spells:
        sp["starters"] = starters.get(sp["id"], [])
    # Sort: school order, then tier, then name
    school_idx = {s: i for i, s in enumerate(SCHOOL_ORDER)}
    spells.sort(key=lambda s: (school_idx.get(s["school"], 99), s["tier"], s["name"]))

    payload = {
        "SPELLS":       spells,
        "SCHOOLS":      [{"id": s, "name": SCHOOL_LABEL[s]} for s in SCHOOL_ORDER],
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_spells.py — do not edit by hand */\n"
    js += "window.OE_SPELLS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")
    print(f"  total spells: {len(spells)}")
    by_school = {}
    for s in spells:
        by_school[s["school"]] = by_school.get(s["school"], 0) + 1
    for sk, n in sorted(by_school.items()):
        print(f"  {sk}: {n}")


if __name__ == "__main__":
    build()
