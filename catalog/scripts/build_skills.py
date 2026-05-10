"""Per-skill detail page data.

For each of the ~30 skills, extracts:
  - Localized name + group (combat / magic / school / utility / class / faction)
  - Per-level (Basic / Advanced / Expert): icon, name, description, bonuses
  - Sub-skills offered at L2 and L3 (with their own icons + descriptions)
  - Subclasses that require this skill at level 3 (cross-referenced from data.js)

Inputs:
  catalog/raw/DB/heroes_skills/skills/skills.json
  catalog/raw/DB/heroes_skills/sub_skills/sub_skills.json
  catalog/raw/Lang/english/texts/heroSkills.json
  docs/data.js  (SUBCLASSES + SKILL_COLUMNS for skill-code → skill-id map)

Output:
  docs/skills-data.js  (window.OE_SKILLS_DATA)
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
DATA_JS = ROOT / "docs" / "data.js"
OUT_JS = ROOT / "docs" / "skills-data.js"

SKILLS_JSON     = RAW / "DB" / "heroes_skills" / "skills" / "skills.json"
SUB_SKILLS_JSON = RAW / "DB" / "heroes_skills" / "sub_skills" / "sub_skills.json"
SKILLS_TOKENS   = RAW / "Lang" / "english" / "texts" / "heroSkills.json"

# Category for each skill — drives grouping on the page
SKILL_GROUP = {
    # combat
    "skill_assault":         "combat",
    "skill_protection":      "combat",
    "skill_resistance":      "combat",
    "skill_formation":       "combat",
    "skill_battle_artistry": "combat-class",   # might-only
    # magic
    "skill_sorcery":         "magic",
    "skill_mastery":         "magic",
    "skill_summoner":        "magic",
    "skill_battlemage":      "magic",
    "skill_wisdom":          "magic-class",    # magic-only (Thaumaturgy)
    # schools
    "skill_magic_day":       "school",
    "skill_magic_night":     "school",
    "skill_magic_space":     "school",
    "skill_magic_primal":    "school",
    # utility
    "skill_leadership":      "utility",
    "skill_luck":            "utility",
    "skill_enlightenment":   "utility",
    "skill_diplomacy":       "utility",
    "skill_logistic":        "utility",
    "skill_scouting":        "utility",
    "skill_economy":         "utility",
    "skill_tactics":         "utility",
    # never required by any subclass
    "skill_siege":           "never",
    "skill_trainer":         "never",
    # faction skills — one per faction
    "skill_faction_humans":   "faction",
    "skill_faction_undead":   "faction",
    "skill_faction_nature":   "faction",
    "skill_faction_unfrozen": "faction",
    "skill_faction_demons":   "faction",
    "skill_faction_dungeon":  "faction",
}

# Group display labels + ordering
GROUP_ORDER = [
    ("combat",       "Combat (1-of-4 in subclasses)"),
    ("magic",        "Magic (1-of-4 in subclasses)"),
    ("school",       "Magic schools (1-of-4 in subclasses)"),
    ("utility",      "Utility (2-of-8 in subclasses)"),
    ("combat-class", "Combat — class-locked (might-only)"),
    ("magic-class",  "Magic — class-locked (magic-only)"),
    ("never",        "Never required by any subclass"),
    ("faction",      "Faction skills (one per faction)"),
]

# Faction key in the skill id → site display id
FACTION_KEY_TO_DISPLAY = {
    "humans":   "temple",
    "undead":   "necropolis",
    "nature":   "grove",
    "demons":   "hive",
    "unfrozen": "schism",
    "dungeon":  "dungeon",
}

# ---------- 3-letter SKILL_COLUMNS code → full skill id ----------
# This mirrors the matrix on the Subclasses page so we can map
# subclass.skills[] (e.g. "BAT", "DAY") back to the canonical skill id.
SUBCLASS_CODE_TO_SKILL = {
    "OFF": "skill_assault",
    "DEF": "skill_protection",
    "RES": "skill_resistance",
    "BAT": "skill_formation",         # "Battlecraft" in matrix = skill_formation
    "SOR": "skill_sorcery",
    "WIS": "skill_mastery",           # "Wisdom" in matrix = skill_mastery (NOT skill_wisdom)
    "SUM": "skill_summoner",
    "BMG": "skill_battlemage",
    "DAY": "skill_magic_day",
    "NGT": "skill_magic_night",
    "ARC": "skill_magic_space",
    "PRI": "skill_magic_primal",
    "LD":  "skill_leadership",
    "LK":  "skill_luck",
    "INS": "skill_enlightenment",
    "DPL": "skill_diplomacy",
    "LOG": "skill_logistic",
    "SCT": "skill_scouting",
    "EC":  "skill_economy",
    "TAC": "skill_tactics",
}


# --------------------------------------------------------------------------- #
# Loaders
# --------------------------------------------------------------------------- #

def load_json_strip(path: Path):
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    return json.loads(text)


def load_tokens(path: Path) -> dict[str, str]:
    return {t["sid"]: t["text"] for t in load_json_strip(path).get("tokens", [])}


def load_subclasses_from_data_js() -> list[dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const SUBCLASSES = (\[.*?\]);", text, re.DOTALL)
    return json.loads(m.group(1))


def load_heroes_from_data_js() -> list[dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const HEROES = (\[.*?\]);", text, re.DOTALL)
    return json.loads(m.group(1))


# --------------------------------------------------------------------------- #
# Bonus → human-readable summary
# --------------------------------------------------------------------------- #

def bonus_summary(b: dict) -> str:
    """Best-effort terse summary of a bonus block (the JSON is dense)."""
    bt = b.get("type", "")
    p = b.get("parameters", []) or []
    if bt == "unitStat" and len(p) >= 2:
        # ['stat', value] OR ['modifierSet', 'outDmgMods', 'basic_attack', '0.15']
        if p[0] == "modifierSet" and len(p) >= 4:
            target = p[2].replace("_", " ")
            try:
                val = float(p[3])
                pct = f"{val*100:+.0f}%"
            except Exception:
                pct = str(p[3])
            mod_dir = "deal" if "out" in p[1] else "take"
            return f"Friendly creatures {mod_dir} {pct} damage on {target}"
        return f"Unit {p[0]} {format_signed(p[1])}"
    if bt == "heroStat" and len(p) >= 2:
        return f"Hero {p[0]} {format_signed(p[1])}"
    if bt == "sideRes" and len(p) >= 2:
        return f"+{p[1]} {p[0]}/day"
    if bt == "sideOneTimeAddRes" and len(p) >= 2:
        return f"One-time +{p[1]} {p[0]}"
    if bt == "battleSubskillBonus":
        return f"battle: {' '.join(str(x) for x in p)}"
    if bt == "heroBattleAbility":
        return f"hero ability: {p[0] if p else '?'}"
    if bt == "lawPointsPerDay" and p:
        return f"+{p[0]} law points/day"
    if bt == "astrologyExp" and p:
        return f"+{p[0]} Astrology XP"
    if bt == "citySideExp" and p:
        return f"+{p[0]} side XP / city"
    return f"{bt}: {' '.join(str(x) for x in p)}"


def format_signed(v) -> str:
    try:
        n = float(v)
        if n.is_integer():
            return f"{int(n):+d}"
        return f"{n:+.2f}"
    except Exception:
        return str(v)


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #

def build():
    skills    = load_json_strip(SKILLS_JSON)["array"]
    subskills = {s["id"]: s for s in load_json_strip(SUB_SKILLS_JSON)["array"]}
    tokens    = load_tokens(SKILLS_TOKENS)
    subclasses = load_subclasses_from_data_js()
    heroes     = load_heroes_from_data_js()

    # English-display-name → skill_id, for resolving the heroes' starting-skill
    # display strings ("Daylight Magic L1") back to canonical skill ids.
    # Normalize curly apostrophes vs ASCII apostrophes — game text uses U+2019
    # but data.js may have ' depending on regen path.
    def norm(s: str) -> str:
        return s.replace("’", "'").replace("‘", "'").strip()

    name_to_skill_id: dict[str, str] = {}
    for sk in skills:
        nm = tokens.get(sk.get("name") or f"{sk['id']}_name")
        if nm:
            name_to_skill_id[norm(nm)] = sk["id"]

    # Build skill_id → list of starting-hero refs (with starting level)
    skill_to_starters: dict[str, list[dict]] = {}
    unresolved: set[str] = set()
    for h in heroes:
        for s_str in (h.get("skills") or []):
            # Format: "<Skill Name> L<n>"
            mm = re.match(r"^(.*) L([1-3])$", s_str)
            if not mm:
                continue
            sname, slvl = norm(mm.group(1)), int(mm.group(2))
            sid = name_to_skill_id.get(sname)
            if not sid:
                unresolved.add(sname)
                continue
            skill_to_starters.setdefault(sid, []).append({
                "id":      h["id"],
                "name":    h["name"],
                "faction": h["faction"],
                "kind":    h["kind"],
                "level":   slvl,
            })
    if unresolved:
        print(f"  unresolved hero starting-skill names: {sorted(unresolved)}")
    # Sort each starter list: L2 starters first (rare), then alphabetically
    for sid in skill_to_starters:
        skill_to_starters[sid].sort(key=lambda r: (-r["level"], r["faction"], r["name"]))

    # Build skill-id → list of subclass refs
    skill_to_subs: dict[str, list[dict]] = {}
    for sc in subclasses:
        for code in sc["skills"]:
            sid = SUBCLASS_CODE_TO_SKILL.get(code)
            if sid:
                skill_to_subs.setdefault(sid, []).append({
                    "name":    sc["name"],
                    "class":   sc["class"],
                    "faction": sc["faction"],
                    "kind":    sc["kind"],
                })

    out = []
    for sk in skills:
        sid = sk["id"]
        group = SKILL_GROUP.get(sid, "other")
        # Localized name + base description
        name_sid = sk.get("name") or f"{sid}_name"
        desc_sid = sk.get("desc") or f"{sid}_desc"
        name = tokens.get(name_sid, sid)
        base_desc = tokens.get(desc_sid, "")
        # Faction skills — flag for the page
        faction_display = None
        if group == "faction":
            m = re.match(r"skill_faction_(\w+)", sid)
            if m:
                faction_display = FACTION_KEY_TO_DISPLAY.get(m.group(1))

        # Per-level
        levels = []
        for li, lvl in enumerate(sk.get("parametersPerLevel", []), 1):
            level_name = tokens.get(lvl.get("name", ""), "") or f"Level {li}"
            level_desc = tokens.get(lvl.get("desc", ""), "") or base_desc
            # Bonuses summarized
            bons = [bonus_summary(b) for b in (lvl.get("bonuses") or [])]
            # Subskills offered at this level
            subs = []
            for ssid in (lvl.get("subSkills") or []):
                ss = subskills.get(ssid)
                if not ss:
                    continue
                ss_name = tokens.get(ss.get("name", ""), ssid)
                ss_desc = tokens.get(ss.get("desc", ""), "")
                subs.append({
                    "id":   ssid,
                    "name": ss_name,
                    "desc": ss_desc,
                })
            levels.append({
                "level":    li,
                "icon":     lvl.get("icon") or sid,
                "name":     level_name,
                "desc":     level_desc,
                "bonuses":  bons,
                "subskills": subs,
            })

        out.append({
            "id":          sid,
            "name":        name,
            "baseDesc":    base_desc,
            "group":       group,
            "skillType":   sk.get("skillType", ""),
            "factionId":   faction_display,
            "levels":      levels,
            "subclasses":  skill_to_subs.get(sid, []),
            "starters":    skill_to_starters.get(sid, []),
        })

    payload = {
        "SKILLS":      out,
        "GROUPS":      [{"id": gid, "label": label} for gid, label in GROUP_ORDER],
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_skills.py — do not edit by hand */\n"
    js += "window.OE_SKILLS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")
    print(f"  skills: {len(out)}, "
          f"with-subclasses: {sum(1 for s in out if s['subclasses'])}, "
          f"never-required: {sum(1 for s in out if s['group'] == 'never')}, "
          f"faction: {sum(1 for s in out if s['group'] == 'faction')}")


if __name__ == "__main__":
    build()
