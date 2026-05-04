"""For each faction, list heroes with starting skills, with the two subclass
requirement rows shown so you can see which heroes are pre-baked toward which
subclass.

Output:
- out/heroes_starting_skills.md  (markdown, per-faction sections)
- out/heroes_starting_skills.csv (machine-readable)
"""

from __future__ import annotations

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
OUT = ROOT / "out"


# ---------- Localization ----------
EN: dict[str, str] = {}
for f in [
    "raw/Lang/english/texts/heroSkills.json",
    "raw/Lang/english/texts/heroInfo.json",
    "raw/Lang/english/texts/ui.json",
    "raw/Lang/english/texts/menu.json",
    "raw/Lang/english/texts/unsorted.json",
    "raw/Lang/english/texts/customMaps.json",
]:
    p = ROOT / f
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


SKILL_DISPLAY = {
    "skill_assault": "Offense",
    "skill_protection": "Defense",
    "skill_resistance": "Resistance",
    "skill_formation": "Battlecraft",
    "skill_sorcery": "Sorcery",
    "skill_mastery": "Wisdom",
    "skill_summoner": "Summon Avatar",
    "skill_battlemage": "Battle Magic",
    "skill_magic_day": "Daylight Magic",
    "skill_magic_night": "Nightshade Magic",
    "skill_magic_space": "Arcane Magic",
    "skill_magic_primal": "Primal Magic",
    "skill_leadership": "Leadership",
    "skill_luck": "Luck",
    "skill_enlightenment": "Insight",
    "skill_diplomacy": "Diplomacy",
    "skill_logistic": "Logistics",
    "skill_scouting": "Scouting",
    "skill_economy": "Economy",
    "skill_tactics": "Tactics",
    "skill_siege": "Siegecraft",
    "skill_trainer": "Recruitment",
    "skill_battle_artistry": "Combat",
    "skill_wisdom": "Thaumaturgy",
    "skill_faction_humans": "Righteousness",
    "skill_faction_undead": "Necromancy",
    "skill_faction_unfrozen": "Abyssal Communion",
    "skill_faction_demons": "Summon Swarm",
    "skill_faction_dungeon": "Triumvirate’s Strength",
    "skill_faction_nature": "Murmuring",
}


CLASS_NAME = {
    ("human", "might"): "Knight",
    ("human", "magic"): "Cleric",
    ("undead", "might"): "Death Knight",
    ("undead", "magic"): "Necromancer",
    ("nature", "might"): "Warden",
    ("nature", "magic"): "Druid",
    ("demon", "might"): "Enforcer",
    ("demon", "magic"): "Herald",
    ("unfrozen", "might"): "Oathkeeper",
    ("unfrozen", "magic"): "Riftspeaker",
    ("dungeon", "might"): "Overlord",
    ("dungeon", "magic"): "Warlock",
}


def load_array_safe(p):
    try:
        return load_array(p)
    except Exception:
        return []


# ---------- Load heroes (stock only) ----------
def hero_sort_key(h: dict) -> tuple:
    cls = h.get("classType") or "z"
    hid = h.get("id") or ""
    parts = hid.rsplit("_", 1)
    num = int(parts[-1]) if parts and parts[-1].isdigit() else 0
    return (cls, num, hid)


heroes: list[dict] = []
for p in (RAW / "DB" / "heroes").glob("*/*.json"):
    if any(x in str(p) for x in ("campaign", "tutorial", "custom")):
        continue
    for r in load_array(p):
        if isinstance(r, dict):
            heroes.append(r)

# Specializations: id -> display name
spec_lookup: dict[str, str] = {}
for spec_file in (RAW / "DB" / "heroes_specializations").glob("specializations_*.json"):
    for s in load_array_safe(spec_file):
        if isinstance(s, dict) and s.get("id"):
            spec_lookup[s["id"]] = t(s.get("name"), default=s["id"])

# Subclasses
subclasses_all: list[dict] = []
for p in (RAW / "DB" / "heroes_sub_classes").glob("sub_classes_*.json"):
    subclasses_all.extend(load_array(p))

by_class_subclasses: dict[tuple[str, str], list[dict]] = defaultdict(list)
for sc in subclasses_all:
    by_class_subclasses[(sc.get("faction"), sc.get("classType"))].append(sc)
for k in by_class_subclasses:
    by_class_subclasses[k].sort(key=lambda s: s.get("id") or "")

by_faction: dict[str, list[dict]] = defaultdict(list)
for h in heroes:
    by_faction[h.get("fraction") or "?"].append(h)

playable_order = ["human", "undead", "nature", "demon", "unfrozen", "dungeon"]


# ---------- Markdown ----------
md: list[str] = []
md.append("# Heroes — starting skills & subclass cheat-sheet")
md.append("")
md.append("For each faction, this report shows every stock hero's starting skills "
          "and how those starting picks line up against the faction's two subclass "
          "requirements. The last two columns of each hero table show *which* of that "
          "hero's starting skills are on each subclass's 5-skill checklist (a "
          "head-start towards that subclass).\n")

for faction in playable_order:
    if faction not in by_faction:
        continue
    md.append(f"## {faction.capitalize()}")
    md.append("")
    md.append("**Subclasses & required skills (all at level 3):**\n")
    md.append("| Class | Subclass | Skill 1 | Skill 2 | Skill 3 | Skill 4 | Skill 5 |")
    md.append("|---|---|---|---|---|---|---|")
    for cls_type in ("might", "magic"):
        cls_name = CLASS_NAME[(faction, cls_type)]
        for sc in by_class_subclasses.get((faction, cls_type), []):
            sc_name = t(sc.get("name"), default=sc.get("id") or "?")
            cells = [SKILL_DISPLAY.get(c.get("skillSid"), c.get("skillSid"))
                     for c in (sc.get("activationConditions") or [])]
            cells = (cells + ["-"] * 5)[:5]
            md.append(f"| {cls_name} | **{sc_name}** | " + " | ".join(cells) + " |")
    md.append("")

    for cls_type in ("might", "magic"):
        cls_name = CLASS_NAME[(faction, cls_type)]
        cls_heroes = sorted(
            [h for h in by_faction[faction] if h.get("classType") == cls_type],
            key=hero_sort_key,
        )
        if not cls_heroes:
            continue
        sc_for_class = by_class_subclasses.get((faction, cls_type), [])
        sc_required: list[set[str]] = []
        sc_names: list[str] = []
        for sc in sc_for_class:
            req = {SKILL_DISPLAY.get(c.get("skillSid"), c.get("skillSid"))
                   for c in (sc.get("activationConditions") or [])}
            sc_required.append(req)
            sc_names.append(t(sc.get("name"), default=sc.get("id") or "?"))

        md.append(f"### {cls_name}")
        md.append("")
        sc_a = sc_names[0] if len(sc_names) > 0 else "-"
        sc_b = sc_names[1] if len(sc_names) > 1 else "-"
        md.append(f"| # | Hero | Specialization | Starting skills | "
                  f"{sc_a} matches | {sc_b} matches |")
        md.append("|---:|---|---|---|---|---|")
        for h in cls_heroes:
            hid = h.get("id") or "?"
            display = t(hid, default=hid)
            spec_sid = h.get("specialization") or ""
            spec_name = spec_lookup.get(spec_sid, spec_sid)
            starts = []
            for sk in h.get("startSkills") or []:
                sid = sk.get("sid")
                disp = SKILL_DISPLAY.get(sid, sid)
                lvl = sk.get("skillLevel") or 1
                starts.append((disp, lvl))
            start_str = ", ".join(f"{name} (L{lvl})" for name, lvl in starts) or "—"
            start_names = {name for name, _ in starts}
            match_a = ", ".join(sorted(
                start_names & (sc_required[0] if sc_required else set())
            ))
            match_b = ", ".join(sorted(
                start_names & (sc_required[1] if len(sc_required) > 1 else set())
            ))
            tail = hid.rsplit("_", 1)[-1]
            md.append(f"| {tail} | **{display}** (`{hid}`) | {spec_name} | "
                      f"{start_str} | {match_a or '—'} | {match_b or '—'} |")
        md.append("")

(OUT / "heroes_starting_skills.md").write_text("\n".join(md))


# ---------- CSV ----------
csv_path = OUT / "heroes_starting_skills.csv"
with csv_path.open("w", newline="") as f:
    w = csv.writer(f)
    w.writerow([
        "faction", "classType", "className", "heroId", "heroName",
        "specializationSid", "specializationName",
        "startingSkills",
        "subclassA", "subclassA_required", "subclassA_starting_matches",
        "subclassB", "subclassB_required", "subclassB_starting_matches",
    ])
    for faction in playable_order:
        if faction not in by_faction:
            continue
        for cls_type in ("might", "magic"):
            cls_name = CLASS_NAME[(faction, cls_type)]
            sc_for_class = by_class_subclasses.get((faction, cls_type), [])
            sc_data = []
            for sc in sc_for_class:
                req = [SKILL_DISPLAY.get(c.get("skillSid"), c.get("skillSid"))
                       for c in (sc.get("activationConditions") or [])]
                sc_data.append({
                    "name": t(sc.get("name"), default=sc.get("id") or "?"),
                    "required": req,
                    "required_set": set(req),
                })
            cls_heroes = sorted(
                [h for h in by_faction[faction] if h.get("classType") == cls_type],
                key=hero_sort_key,
            )
            for h in cls_heroes:
                hid = h.get("id") or ""
                display = t(hid, default=hid)
                spec_sid = h.get("specialization") or ""
                starts = []
                for sk in h.get("startSkills") or []:
                    sid = sk.get("sid")
                    disp = SKILL_DISPLAY.get(sid, sid)
                    lvl = sk.get("skillLevel") or 1
                    starts.append(f"{disp} (L{lvl})")
                start_names = {s.split(" (")[0] for s in starts}
                a = sc_data[0] if len(sc_data) > 0 else None
                b = sc_data[1] if len(sc_data) > 1 else None
                w.writerow([
                    faction, cls_type, cls_name,
                    hid, display, spec_sid, spec_lookup.get(spec_sid, spec_sid),
                    "; ".join(starts),
                    a["name"] if a else "",
                    "; ".join(a["required"]) if a else "",
                    "; ".join(sorted(start_names & a["required_set"])) if a else "",
                    b["name"] if b else "",
                    "; ".join(b["required"]) if b else "",
                    "; ".join(sorted(start_names & b["required_set"])) if b else "",
                ])

print(f"wrote {OUT / 'heroes_starting_skills.md'}")
print(f"wrote {csv_path}")
print(f"heroes: {len(heroes)}")
