"""Build a single classes.json describing all 12 hero classes.

Each class entry includes:
- Display name (e.g. "Knight" for human-might)
- Starting hero stats: attack / defence / power / knowledge
- Stat-roll chances pre/post breakpoint (the breakpoint is whatever
  `levelFrom` value the second statsRolls bucket starts at)
- Skill weights (raw `chance` values — i.e. the per-roll relative weight
  used by the game's skill randomizer; higher = more likely to be offered)
- Two subclasses with required skills (each at level 3) and effect description

Sources:
- raw/DB/heroes/<faction>/<id>.json: per-hero starting stats + statsRolls
- raw/DB/heroes_skills/skills_by_level_tables/<table>.json: skill weights
- raw/DB/heroes_sub_classes/sub_classes_<faction>.json: subclass conditions
- raw/Lang/english/texts/*.json: display name lookups
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
OUT = ROOT / "out" / "classes.json"
OUT.parent.mkdir(parents=True, exist_ok=True)


# ---------- Localization lookup ----------
def load_en() -> dict[str, str]:
    en: dict[str, str] = {}
    for f in [
        "raw/Lang/english/texts/heroSkills.json",
        "raw/Lang/english/texts/heroInfo.json",
        "raw/Lang/english/texts/ui.json",
        "raw/Lang/english/texts/menu.json",
        "raw/Lang/english/texts/unsorted.json",
    ]:
        try:
            with (ROOT / f).open(encoding="utf-8-sig") as h:
                for entry in json.load(h).get("tokens", []):
                    if isinstance(entry, dict) and "sid" in entry and "text" in entry:
                        en[entry["sid"]] = entry["text"]
        except FileNotFoundError:
            pass
    return en


EN = load_en()
def t(sid: str | None, default: str = "") -> str:
    if not sid:
        return default
    return EN.get(sid, default or sid)


# ---------- Class display name lookup ----------
# Faction id (from JSON) → English class display name
CLASS_NAME = {
    ("human", "might"): t("might_human_name"),
    ("human", "magic"): t("magic_human_name"),
    ("undead", "might"): t("might_undead_name"),
    ("undead", "magic"): t("magic_undead_name"),
    ("nature", "might"): t("might_nature_name"),
    ("nature", "magic"): t("magic_nature_name"),
    ("demon", "might"): t("might_demon_name"),
    ("demon", "magic"): t("magic_demon_name"),
    ("unfrozen", "might"): t("might_unfrozen_name"),
    ("unfrozen", "magic"): t("magic_unfrozen_name"),
    ("dungeon", "might"): t("might_dungeon_name"),
    ("dungeon", "magic"): t("magic_dungeon_name"),
}


# ---------- Skill SID → user-facing field name + display name ----------
# Order matches the user's reference example. The numeric value we'll write is
# the raw `chance` weight from the game's skill table (game uses these as
# relative weights, not probabilities).
SKILLS = [
    # (json_field_name,         skill_sid,             display_name)
    ("offenceSkill",            "skill_assault",       "Offense"),
    ("defenceSkill",            "skill_protection",    "Defense"),
    ("resistanceSkill",         "skill_resistance",    "Resistance"),
    ("battlecraftSkill",        "skill_formation",     "Battlecraft"),
    ("sorcerySkill",            "skill_sorcery",       "Sorcery"),
    ("intelligenceSkill",       "skill_mastery",       "Wisdom"),
    ("summonAvatarSkill",       "skill_summoner",      "Summon Avatar"),
    ("battleMagicSkill",        "skill_battlemage",    "Battle Magic"),
    ("daylightSkill",           "skill_magic_day",     "Daylight Magic"),
    ("nightshadeSkill",         "skill_magic_night",   "Nightshade Magic"),
    ("arcaneSkill",             "skill_magic_space",   "Arcane Magic"),
    ("primalSkill",             "skill_magic_primal",  "Primal Magic"),
    ("leadershipSkill",         "skill_leadership",    "Leadership"),
    ("luckSkill",               "skill_luck",          "Luck"),
    ("insightSkill",            "skill_enlightenment", "Insight"),
    ("diplomacySkill",          "skill_diplomacy",     "Diplomacy"),
    ("logisticsSkill",          "skill_logistic",      "Logistics"),
    ("scoutingSkill",           "skill_scouting",      "Scouting"),
    ("economySkill",            "skill_economy",       "Economy"),
    ("tacticsSkill",            "skill_tactics",       "Tactics"),
    ("siegecraftSkill",         "skill_siege",         "Siegecraft"),
    ("recruitmentSkill",        "skill_trainer",       "Recruitment"),
    # combat appears only on might tables; thaumaturgy only on magic tables.
    ("combatSkill",             "skill_battle_artistry", "Combat"),       # might-only
    ("thaumaturgySkill",        "skill_wisdom",        "Thaumaturgy"),    # magic-only
]
# Faction-specific skill rendered separately (chance + display name).


# ---------- Skill table loader ----------
def primary_weights(table_id: str) -> dict[str, int]:
    """Return level-1..50 (primary) bucket weights, sid -> chance."""
    path = RAW / "DB" / "heroes_skills" / "skills_by_level_tables" / f"{table_id}.json"
    for rec in load_array(path):
        if rec.get("id") != table_id:
            continue
        for lst in rec.get("defaultList") or []:
            levels = lst.get("levels") or []
            # primary = the bucket that contains 1..50, not [-1] or [-2]
            if levels and 1 in levels and 50 in levels:
                return {rc["sid"]: rc["chance"] for rc in lst.get("rollChances") or []}
    return {}


# ---------- Hero / faction data ----------
def find_class_template(faction: str, class_type: str) -> dict:
    """Return the canonical hero record (any hero in this faction+class
    works; they all share statsRolls, starting stats, and skillsRollVariant)."""
    for p in (RAW / "DB" / "heroes" / "_").parent.glob(f"*/*.json"):
        # exclude campaign / tutorial / custom
        if any(x in str(p) for x in ("campaign", "tutorial", "custom")):
            continue
        for r in load_array(p):
            if isinstance(r, dict) and r.get("fraction") == faction and r.get("classType") == class_type:
                return r
    raise ValueError(f"no hero for {faction}/{class_type}")


# ---------- Subclass loader ----------
def load_subclasses() -> list[dict]:
    out = []
    for p in (RAW / "DB" / "heroes_sub_classes").glob("sub_classes_*.json"):
        out.extend(load_array(p))
    return out


# ---------- Build a single class entry ----------
def build_class(faction: str, class_type: str, subclasses_all: list[dict]) -> dict:
    template = find_class_template(faction, class_type)
    stats = template.get("stats") or {}

    # Stat-roll buckets — find the second bucket's levelFrom as breakpoint.
    rolls = template.get("statsRolls") or []
    pre = next((b for b in rolls if b.get("levelFrom") == 1), rolls[0] if rolls else {})
    post = next((b for b in rolls if b.get("levelFrom", 1) > 1), None)
    breakpoint_level = post.get("levelFrom") if post else None

    def roll_pct(bucket: dict, v: int) -> float:
        rc = bucket.get("rollChances") or []
        total = sum(c.get("c", 0) for c in rc) or 1
        for entry in rc:
            if entry.get("v") == v:
                return round(entry.get("c", 0) / total, 4)
        return 0.0

    # Skill weights from primary bucket
    table_id = template.get("skillsRollVariant")
    weights = primary_weights(table_id)

    skill_block: dict[str, int] = {}
    for field, sid, _ in SKILLS:
        skill_block[field] = weights.get(sid, 0)
    # Faction skill block — different sid per faction, displayed separately
    fac_sid = next((s for s in weights if s.startswith("skill_faction_")), None)
    fac_chance = weights.get(fac_sid, 0) if fac_sid else 0
    fac_name = t(f"{fac_sid}_name", default="") if fac_sid else ""

    # Subclasses for this faction+class
    sc_entries = [
        sc for sc in subclasses_all
        if sc.get("faction") == faction and sc.get("classType") == class_type
    ]
    sc_entries.sort(key=lambda s: s.get("id") or "")

    # Build display name → SID map for skill conditions
    sid_to_display = {sid: name for _, sid, name in SKILLS}
    if fac_sid:
        sid_to_display[fac_sid] = fac_name

    subclasses_out: dict = {}
    for sc in sc_entries:
        name = t(sc.get("name"), default=sc.get("id") or "?")
        desc = t(sc.get("desc"), default="")
        skills = []
        for cond in sc.get("activationConditions") or []:
            sid = cond.get("skillSid")
            display = sid_to_display.get(sid, sid)
            level = cond.get("skillLevel")
            if level and level != 3:
                display = f"{display} (level {level})"
            skills.append(display)
        subclasses_out[name] = {
            "id": sc.get("id"),
            "skills": skills,
            "effect": desc,
        }

    return {
        "name": CLASS_NAME[(faction, class_type)],
        "factionId": faction,
        "classType": class_type,
        "skillsTable": table_id,
        "attack":     stats.get("offence"),
        "defence":    stats.get("defence"),
        "power":      stats.get("spellPower"),
        "knowledge":  stats.get("intelligence"),
        "statsBreakpointLevel": breakpoint_level,
        f"attackRollPre{breakpoint_level}":     roll_pct(pre, 0),
        f"defenceRollPre{breakpoint_level}":    roll_pct(pre, 1),
        f"powerRollPre{breakpoint_level}":      roll_pct(pre, 2),
        f"knowledgeRollPre{breakpoint_level}":  roll_pct(pre, 3),
        f"attackRollPost{breakpoint_level}":    roll_pct(post or {}, 0) if post else None,
        f"defenceRollPost{breakpoint_level}":   roll_pct(post or {}, 1) if post else None,
        f"powerRollPost{breakpoint_level}":     roll_pct(post or {}, 2) if post else None,
        f"knowledgeRollPost{breakpoint_level}": roll_pct(post or {}, 3) if post else None,
        **skill_block,
        "factionSkill": {
            "name": fac_name,
            "sid": fac_sid,
            "chance": fac_chance,
        },
        "subclasses": subclasses_out,
    }


# ---------- Main ----------
subclasses_all = load_subclasses()

CLASSES_ORDER = [
    ("human", "might"), ("human", "magic"),
    ("undead", "might"), ("undead", "magic"),
    ("nature", "might"), ("nature", "magic"),
    ("demon", "might"), ("demon", "magic"),
    ("unfrozen", "might"), ("unfrozen", "magic"),
    ("dungeon", "might"), ("dungeon", "magic"),
]

result = {
    "_doc": {
        "skillWeights": "Raw `chance` values from the game's skill-roll table — "
                        "relative weights, not percentages. The probability of a "
                        "skill being offered on a single roll = chance / sum(chances "
                        "for currently-eligible skills).",
        "statRolls": "Each level-up grants 1 of {attack, defence, power, knowledge}; "
                     "rolls follow `*RollPre<breakpoint>` weights below the breakpoint "
                     "level and `*RollPost<breakpoint>` at and above. Values are "
                     "probabilities (sum to 1.0).",
        "subclassActivation": "Each subclass requires its 5 listed skills at level 3 "
                              "(Expert) simultaneously.",
        "classOnlySkill": "Combat is a might-only skill; Thaumaturgy is a magic-only "
                          "skill — the other class always shows 0 weight.",
    },
    "heroClasses": [build_class(f, c, subclasses_all) for f, c in CLASSES_ORDER],
}

OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False))
print(f"wrote {OUT}")
print(f"classes: {len(result['heroClasses'])}")
