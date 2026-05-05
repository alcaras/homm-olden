"""Generate docs/data.js — the single source of truth for the React SPA.

Produces window.OE_DATA = { FACTIONS, SKILL_COLUMNS, SUBCLASSES, HEROES, UNITS }.

- FACTIONS: 6 playable factions, with display name + faction skill + class names.
- SKILL_COLUMNS: 20-skill universe used by the subclass matrix.
- SUBCLASSES: 24 entries (2 per class × 12 classes).
- HEROES: 108 stock heroes.
- UNITS: every unit logic file, with display name, tier, stats, cost, squadValue.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT = ROOT / "docs" / "data.js"

# Game build fingerprint
import datetime as _dt
GAME_DATA = ROOT / "HeroesOldenEra_Data"
build_guid = ""
boot = GAME_DATA / "boot.config"
if boot.exists():
    for line in boot.read_text().splitlines():
        if line.startswith("build-guid="):
            build_guid = line.split("=", 1)[1].strip()
            break
core_zip = GAME_DATA / "StreamingAssets" / "Core.zip"
core_mtime = (
    _dt.date.fromtimestamp(core_zip.stat().st_mtime).isoformat()
    if core_zip.exists() else ""
)
generated_at = _dt.date.today().isoformat()
META = {
    "buildGuid": build_guid,
    "coreDate": core_mtime,
    "generatedAt": generated_at,
}


# ---------- Localization ----------
EN: dict[str, str] = {}
for f in [
    "Lang/english/texts/heroSkills.json",
    "Lang/english/texts/heroInfo.json",
    "Lang/english/texts/ui.json",
    "Lang/english/texts/menu.json",
    "Lang/english/texts/unsorted.json",
    "Lang/english/texts/customMaps.json",
    "Lang/english/texts/unitsAbility.json",
    "Lang/english/texts/unitsBuff.json",
]:
    p = RAW / f
    if not p.exists():
        continue
    with p.open(encoding="utf-8-sig") as h:
        for entry in json.load(h).get("tokens", []):
            if isinstance(entry, dict) and "sid" in entry and "text" in entry:
                EN[entry["sid"]] = entry["text"]


def t(sid: str | None, default: str = "") -> str:
    if not sid:
        return default
    return EN.get(sid, default if default else (sid or ""))


# ---------- FACTIONS ----------
# (display id, in-game faction key for units, display name, faction skill,
#  might class display, magic class display)
FACTION_DEFS = [
    ("temple",    "human",    "Temple",     "Righteousness",          "Knight",       "Cleric"),
    ("necropolis","undead",   "Necropolis", "Necromancy",             "Death Knight", "Necromancer"),
    ("sylvan",    "nature",   "Grove",      "Murmuring",              "Warden",       "Druid"),
    ("hive",      "demon",    "Hive",       "Summon Swarm",           "Enforcer",     "Herald"),
    ("schism",    "unfrozen", "Schism",     "Abyssal Communion",      "Oathkeeper",   "Riftspeaker"),
    ("dungeon",   "dungeon",  "Dungeon",    "Triumvirate's Strength", "Overlord",     "Warlock"),
]
FACTIONS = [
    {"id": did, "unitKey": ukey, "name": dname, "skill": sk,
     "might": might, "magic": magic}
    for did, ukey, dname, sk, might, magic in FACTION_DEFS
]
DID_BY_UKEY = {ukey: did for did, ukey, *_ in FACTION_DEFS}


# ---------- SKILL_COLUMNS (matrix universe) ----------
SKILL_COLUMNS = [
    {"key": "OFF", "name": "Offense",         "group": "combat"},
    {"key": "DEF", "name": "Defense",         "group": "combat"},
    {"key": "RES", "name": "Resistance",      "group": "combat"},
    {"key": "BAT", "name": "Battlecraft",     "group": "combat"},
    {"key": "SOR", "name": "Sorcery",         "group": "magic"},
    {"key": "WIS", "name": "Wisdom",          "group": "magic"},
    {"key": "SUM", "name": "Summon Avatar",   "group": "magic"},
    {"key": "BMG", "name": "Battle Magic",    "group": "magic"},
    {"key": "DAY", "name": "Daylight Magic",  "group": "school"},
    {"key": "NGT", "name": "Nightshade",      "group": "school"},
    {"key": "ARC", "name": "Arcane Magic",    "group": "school"},
    {"key": "PRI", "name": "Primal Magic",    "group": "school"},
    {"key": "LD",  "name": "Leadership",      "group": "utility"},
    {"key": "LK",  "name": "Luck",            "group": "utility"},
    {"key": "INS", "name": "Insight",         "group": "utility"},
    {"key": "DPL", "name": "Diplomacy",       "group": "utility"},
    {"key": "LOG", "name": "Logistics",       "group": "utility"},
    {"key": "SCT", "name": "Scouting",        "group": "utility"},
    {"key": "EC",  "name": "Economy",         "group": "utility"},
    {"key": "TAC", "name": "Tactics",         "group": "utility"},
]
SID_TO_KEY = {
    "skill_assault": "OFF", "skill_protection": "DEF", "skill_resistance": "RES",
    "skill_formation": "BAT",
    "skill_sorcery": "SOR", "skill_mastery": "WIS", "skill_summoner": "SUM",
    "skill_battlemage": "BMG",
    "skill_magic_day": "DAY", "skill_magic_night": "NGT",
    "skill_magic_space": "ARC", "skill_magic_primal": "PRI",
    "skill_leadership": "LD", "skill_luck": "LK", "skill_enlightenment": "INS",
    "skill_diplomacy": "DPL", "skill_logistic": "LOG", "skill_scouting": "SCT",
    "skill_economy": "EC", "skill_tactics": "TAC",
    # extras (not used by subclasses but appear on heroes)
    "skill_battle_artistry": None, "skill_wisdom": None,
    "skill_siege": None, "skill_trainer": None,
}
SKILL_DISPLAY = {
    "skill_assault": "Offense", "skill_protection": "Defense",
    "skill_resistance": "Resistance", "skill_formation": "Battlecraft",
    "skill_sorcery": "Sorcery", "skill_mastery": "Wisdom",
    "skill_summoner": "Summon Avatar", "skill_battlemage": "Battle Magic",
    "skill_magic_day": "Daylight Magic", "skill_magic_night": "Nightshade Magic",
    "skill_magic_space": "Arcane Magic", "skill_magic_primal": "Primal Magic",
    "skill_leadership": "Leadership", "skill_luck": "Luck",
    "skill_enlightenment": "Insight", "skill_diplomacy": "Diplomacy",
    "skill_logistic": "Logistics", "skill_scouting": "Scouting",
    "skill_economy": "Economy", "skill_tactics": "Tactics",
    "skill_siege": "Siegecraft", "skill_trainer": "Recruitment",
    "skill_battle_artistry": "Combat", "skill_wisdom": "Thaumaturgy",
}
FACTION_SKILL = {
    "human":    ("skill_faction_humans",   "Righteousness"),
    "undead":   ("skill_faction_undead",   "Necromancy"),
    "nature":   ("skill_faction_nature",   "Murmuring"),
    "demon":    ("skill_faction_demons",   "Summon Swarm"),
    "unfrozen": ("skill_faction_unfrozen", "Abyssal Communion"),
    "dungeon":  ("skill_faction_dungeon",  "Triumvirate's Strength"),
}


# ---------- SUBCLASSES ----------
SUBCLASSES_OUT: list[dict] = []
for fdid, ukey, dname, _, might, magic in FACTION_DEFS:
    pass  # placeholder — actual loop below

subclass_files = sorted((RAW / "DB" / "heroes_sub_classes").glob("sub_classes_*.json"))
all_subs: list[dict] = []
for p in subclass_files:
    all_subs.extend(load_array(p))

class_label = {
    ("human", "might"): "Knight",       ("human", "magic"): "Cleric",
    ("undead", "might"): "Death Knight", ("undead", "magic"): "Necromancer",
    ("nature", "might"): "Warden",      ("nature", "magic"): "Druid",
    ("demon", "might"): "Enforcer",     ("demon", "magic"): "Herald",
    ("unfrozen", "might"): "Oathkeeper", ("unfrozen", "magic"): "Riftspeaker",
    ("dungeon", "might"): "Overlord",   ("dungeon", "magic"): "Warlock",
}

for sub in all_subs:
    if not isinstance(sub, dict):
        continue
    ukey = sub.get("faction")
    cls = sub.get("classType")
    if ukey not in DID_BY_UKEY or cls not in ("might", "magic"):
        continue
    skills_keys: list[str] = []
    for cond in sub.get("activationConditions") or []:
        sid = cond.get("skillSid")
        k = SID_TO_KEY.get(sid)
        if k:
            skills_keys.append(k)
    SUBCLASSES_OUT.append({
        "faction": DID_BY_UKEY[ukey],
        "kind": cls,
        "name": t(sub.get("name"), default=sub.get("id") or "?"),
        "class": class_label[(ukey, cls)],
        "skills": skills_keys,
        "effect": t(sub.get("desc"), default=""),
    })

# Sort subclasses by faction order then might/magic then id
faction_order = {fdid: i for i, fdid in enumerate([f["id"] for f in FACTIONS])}
SUBCLASSES_OUT.sort(key=lambda s: (faction_order[s["faction"]],
                                    0 if s["kind"] == "might" else 1,
                                    s["name"]))


# ---------- HEROES ----------
def hero_sort_key(h: dict) -> tuple:
    cls = h.get("classType") or "z"
    hid = h.get("id") or ""
    parts = hid.rsplit("_", 1)
    num = int(parts[-1]) if parts and parts[-1].isdigit() else 0
    return (cls, num, hid)


# Specialization name + description lookup
spec_lookup: dict[str, dict[str, str]] = {}
for spec_file in (RAW / "DB" / "heroes_specializations").glob("specializations_*.json"):
    for s in load_array(spec_file):
        if isinstance(s, dict) and s.get("id"):
            spec_lookup[s["id"]] = {
                "name": t(s.get("name"), default=s["id"]),
                "desc": t(s.get("desc"), default=""),
            }

heroes_raw: list[dict] = []
for p in (RAW / "DB" / "heroes").glob("*/*.json"):
    if any(x in str(p) for x in ("campaign", "tutorial", "custom")):
        continue
    for r in load_array(p):
        if isinstance(r, dict):
            heroes_raw.append(r)

# Unit-id → squadValue lookup (for hero army-score computation)
unit_sv: dict[str, int] = {}
for p in (RAW / "DB" / "units" / "units_logics").rglob("*.json"):
    for u in load_array(p):
        if isinstance(u, dict) and u.get("id") and u.get("squadValue") is not None:
            unit_sv[u["id"]] = u["squadValue"]

HEROES_OUT: list[dict] = []
for ukey in [u for _, u, *_ in FACTION_DEFS]:
    cohort = [h for h in heroes_raw if h.get("fraction") == ukey]
    cohort.sort(key=hero_sort_key)
    for h in cohort:
        hid = h.get("id") or ""
        stats = h.get("stats") or {}
        # Skills
        skill_strs: list[str] = []
        for sk in h.get("startSkills") or []:
            sid = sk.get("sid")
            if sid == FACTION_SKILL[ukey][0]:
                name = FACTION_SKILL[ukey][1]
            else:
                name = SKILL_DISPLAY.get(sid) or t(f"{sid}_name", default=sid)
            lvl = sk.get("skillLevel") or 1
            skill_strs.append(f"{name} L{lvl}")
        # Army
        squad_parts: list[str] = []
        for st in h.get("startSquad") or []:
            mn = st.get("min") or 0
            mx = st.get("max") or 0
            uid = st.get("sid") or ""
            uname = t(f"{uid}_name", default=uid.replace("_", " ").title())
            squad_parts.append(f"{mn}–{mx} {uname}")
        army = " · ".join(squad_parts) or "—"

        spec_id = h.get("specialization") or ""
        spec_info = spec_lookup.get(spec_id, {"name": "", "desc": ""})
        # Army score = sum over startSquad of squadValue × avg(min,max)
        army_score = 0
        for st in h.get("startSquad") or []:
            sv = unit_sv.get(st.get("sid") or "", 0) or 0
            mn = st.get("min") or 0
            mx = st.get("max") or 0
            army_score += sv * (mn + mx) / 2
        HEROES_OUT.append({
            "id": hid,
            "specId": spec_id,
            "faction": DID_BY_UKEY[ukey],
            "kind": h.get("classType") or "?",
            "name": t(hid, default=hid),
            "specialty": spec_info["name"],
            "specDesc": spec_info["desc"],
            "armyScore": round(army_score),
            "stats": {
                "A": stats.get("offence"),
                "D": stats.get("defence"),
                "P": stats.get("spellPower"),
                "K": stats.get("intelligence"),
            },
            "skills": skill_strs,
            "army": army,
        })


# ---------- UNITS ----------
UNITS_OUT: list[dict] = []
unit_files = sorted((RAW / "DB" / "units" / "units_logics").rglob("*.json"))
for p in unit_files:
    for u in load_array(p):
        if not isinstance(u, dict) or not u.get("id"):
            continue
        uid = u["id"]
        stats = u.get("stats") or {}
        cost_gold = None
        for c in (u.get("unitCost") or {}).get("costResArray") or []:
            if c.get("name") == "gold":
                cost_gold = c.get("cost")
                break
        is_alt = uid.endswith("_upg_alt")
        is_upg = (not is_alt) and (uid.endswith("_upg") or "_upg_" in uid)
        variant = "alt" if is_alt else ("upg" if is_upg else "base")
        ukey = u.get("fraction") or "neutral"
        # Map in-game faction key to our display id; neutrals stay 'neutral'
        fid = DID_BY_UKEY.get(ukey, "neutral")

        # Attack type from first defaultAttacks entry: melee | shoot | range
        atk_raw = None
        for atk in u.get("defaultAttacks") or []:
            atk_raw = atk.get("attackType_") or atk.get("attackType")
            if atk_raw:
                break
        # attackType_ values: melee | shoot | range
        # `shoot` = ranged attackers (archers/spellcasters); `range` = long-reach melee.
        atk_label = {"melee": "Melee", "shoot": "Ranged", "range": "Long"}.get(atk_raw, "—")

        UNITS_OUT.append({
            "id": uid,
            "name": t(f"{uid}_name", default=uid.replace("_", " ").title()),
            "faction": fid,
            "tier": u.get("tier") if isinstance(u.get("tier"), int) else 0,
            "variant": variant,
            "attack": atk_label,           # Melee / Ranged / Long
            "hp": stats.get("hp"),
            "off": stats.get("offence"),
            "def": stats.get("defence"),
            "dmgMin": stats.get("damageMin"),
            "dmgMax": stats.get("damageMax"),
            "init": stats.get("initiative"),
            "speed": stats.get("speed"),
            "squadValue": u.get("squadValue"),
            "cost": cost_gold,
            "ai": u.get("ai"),
            "tags": u.get("tags") or [],
        })

# Sort units: tier asc, faction order, name
fid_order = {f["id"]: i for i, f in enumerate(FACTIONS)}
fid_order["neutral"] = 99
UNITS_OUT.sort(key=lambda u: (u["tier"], fid_order.get(u["faction"], 100),
                                u["name"], u["variant"]))


# ---------- Emit JS ----------
def js(obj) -> str:
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


lines: list[str] = []
lines.append("// Olden Era reference data — generated by catalog/scripts/build_data_js.py")
lines.append("// Do not edit by hand; rerun the script to regenerate.")
lines.append("window.OE_DATA = (() => {")
lines.append(f"const FACTIONS = {js(FACTIONS)};")
lines.append(f"const SKILL_COLUMNS = {js(SKILL_COLUMNS)};")
lines.append(f"const SUBCLASSES = {js(SUBCLASSES_OUT)};")
lines.append(f"const HEROES = {js(HEROES_OUT)};")
lines.append(f"const UNITS = {js(UNITS_OUT)};")
lines.append(f"const META = {js(META)};")
lines.append("return { FACTIONS, SKILL_COLUMNS, SUBCLASSES, HEROES, UNITS, META };")
lines.append("})();")

OUT.write_text("\n".join(lines))
print(f"wrote {OUT}")
print(f"  factions:    {len(FACTIONS)}")
print(f"  subclasses:  {len(SUBCLASSES_OUT)}")
print(f"  heroes:      {len(HEROES_OUT)}")
print(f"  units:       {len(UNITS_OUT)}")
