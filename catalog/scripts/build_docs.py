"""Build the GitHub Pages docs/ folder.

Outputs:
- docs/index.md
- docs/subclasses.md   (sparse-matrix subclass map, Tufte-styled)
- docs/heroes.md       (per-faction hero reference)

Style/structural choices follow the design walkthrough principles:
- Sparse matrix beats list of cards when the universe of choices is small.
- Group columns (Combat / Magic / Schools / Utility) with hairline dividers.
- Headers UPPERCASE, cells Mixed-case so vertical and horizontal scans don't
  visually collide.
- Single accent color, ⚔ / ✦ glyphs for might / magic.
- Effect text verbatim with {0} placeholders preserved.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[2]   # …/homm
RAW = ROOT / "catalog" / "raw"
DOCS = ROOT / "docs"
DOCS.mkdir(exist_ok=True)


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
    "Lang/english/texts/cities.json",
    "Lang/english/texts/artifacts.json",
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


# ---------- Skill universe ----------
COMBAT = [
    ("skill_assault",     "Offense",     "Off"),
    ("skill_protection",  "Defense",     "Def"),
    ("skill_resistance",  "Resistance",  "Res"),
    ("skill_formation",   "Battlecraft", "Bat"),
]
MAGIC_CRAFT = [
    ("skill_sorcery",     "Sorcery",       "Sor"),
    ("skill_mastery",     "Wisdom",        "Wis"),
    ("skill_summoner",    "Summon Avatar", "Sum"),
    ("skill_battlemage",  "Battle Magic",  "BMg"),
]
SCHOOLS = [
    ("skill_magic_day",     "Daylight Magic",   "Day"),
    ("skill_magic_night",   "Nightshade Magic", "Ngt"),
    ("skill_magic_space",   "Arcane Magic",     "Arc"),
    ("skill_magic_primal",  "Primal Magic",     "Pri"),
]
UTILITY = [
    ("skill_leadership",    "Leadership",  "Ld"),
    ("skill_luck",          "Luck",        "Lk"),
    ("skill_enlightenment", "Insight",     "Ins"),
    ("skill_diplomacy",     "Diplomacy",   "Dpl"),
    ("skill_logistic",      "Logistics",   "Log"),
    ("skill_scouting",      "Scouting",    "Sct"),
    ("skill_economy",       "Economy",     "Ec"),
    ("skill_tactics",       "Tactics",     "Tac"),
]
SKILL_GROUPS = [("Combat", COMBAT), ("Magic", MAGIC_CRAFT),
                ("Schools", SCHOOLS), ("Utility", UTILITY)]
SKILL_BY_SID = {sid: (full, abbrev) for _, group in SKILL_GROUPS for sid, full, abbrev in group}

# Skills outside the subclass-matrix universe but still appear on heroes / in tables.
# Class-locked + utility skills that no subclass requires.
EXTRA_SKILLS = {
    "skill_battle_artistry": ("Combat", "Cmb"),       # might-only
    "skill_wisdom":          ("Thaumaturgy", "Thau"), # magic-only
    "skill_siege":           ("Siegecraft", "Sgc"),   # never required
    "skill_trainer":         ("Recruitment", "Rcr"),  # never required
}
ALL_SKILL_NAMES = {sid: full for sid, (full, _) in {**SKILL_BY_SID, **EXTRA_SKILLS}.items()}
# Faction-skill SIDs handled separately (per-faction display name)


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
FACTION_TITLE = {
    "human":    "Temple",
    "undead":   "Necropolis",
    "nature":   "Grove",
    "demon":    "Hive",
    "unfrozen": "Schism",
    "dungeon":  "Dungeon",
}
FACTION_SKILL = {
    "human":    ("skill_faction_humans",   "Righteousness"),
    "undead":   ("skill_faction_undead",   "Necromancy"),
    "nature":   ("skill_faction_nature",   "Murmuring"),
    "demon":    ("skill_faction_demons",   "Summon Swarm"),
    "unfrozen": ("skill_faction_unfrozen", "Abyssal Communion"),
    "dungeon":  ("skill_faction_dungeon",  "Triumvirate’s Strength"),
}

PLAYABLE_ORDER = ["human", "undead", "nature", "demon", "unfrozen", "dungeon"]


def class_glyph(class_type: str) -> str:
    return '<span class="glyph-might">⚔</span>' if class_type == "might" \
           else '<span class="glyph-magic">✦</span>'


# ---------- Load subclasses ----------
subclasses_all: list[dict] = []
for p in (RAW / "DB" / "heroes_sub_classes").glob("sub_classes_*.json"):
    subclasses_all.extend(load_array(p))


# ---------- Load heroes ----------
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


# Specializations: id -> (display name, raw desc with placeholders)
spec_lookup: dict[str, tuple[str, str]] = {}
for spec_file in (RAW / "DB" / "heroes_specializations").glob("specializations_*.json"):
    for s in load_array(spec_file):
        if isinstance(s, dict) and s.get("id"):
            spec_lookup[s["id"]] = (
                t(s.get("name"), default=s["id"]),
                t(s.get("desc"), default=""),
            )


# Unit display names
def unit_display(unit_id: str) -> str:
    return t(f"{unit_id}_name", default=unit_id.replace("_", " ").title())


# ---------- Subclasses page ----------
def render_subclasses() -> str:
    out: list[str] = []
    out.append("---")
    out.append("title: Subclasses & Required Skills")
    out.append("layout: default")
    out.append("permalink: /subclasses/")
    out.append("---\n")
    out.append("# Subclasses & Required Skills\n")
    out.append('<p class="lede">Each of the 12 hero classes has two subclasses, '
               'unlocked by training five specific skills to level&nbsp;3 '
               '(Expert). The matrix below lays out all 24 subclass recipes.</p>\n')

    out.append("Read across a row to see what one subclass needs; read down a "
               "column to see who needs that skill. Faction blocks are separated "
               "by horizontal rules; skill groups by vertical rules. ⚔ marks "
               "Might subclasses, ✦ marks Magic subclasses.\n")

    by_class: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for sc in subclasses_all:
        by_class[(sc.get("faction"), sc.get("classType"))].append(sc)
    for k in by_class:
        by_class[k].sort(key=lambda s: s.get("id") or "")

    skill_cols = COMBAT + MAGIC_CRAFT + SCHOOLS + UTILITY

    # Raw HTML — kramdown-friendly inside the markdown file
    out.append('<div class="scroll-x">')
    out.append('<table class="subclass-matrix">')

    # Header row with column-group dividers handled via CSS :nth-child
    out.append('<thead><tr>')
    out.append('<th></th><th>Subclass</th>')
    for sid, full, abbr in skill_cols:
        out.append(f'<th title="{full}">{abbr.upper()}</th>')
    out.append('<th>Effect</th>')
    out.append('</tr></thead>')

    out.append('<tbody>')
    for fi, faction in enumerate(PLAYABLE_ORDER):
        cls_for_divider = "faction-divider" if fi > 0 else ""
        # Faction header row (full-width via colspan)
        total_cols = 2 + len(skill_cols) + 1
        out.append(
            f'<tr class="{cls_for_divider}">'
            f'<td></td>'
            f'<td colspan="{total_cols - 1}" style="text-align:left">'
            f'<span class="faction-name">{FACTION_TITLE[faction]}</span>'
            f' <span style="color:#777">— faction skill: '
            f'<em>{FACTION_SKILL[faction][1]}</em></span>'
            f'</td>'
            f'</tr>'
        )

        for cls_type in ("might", "magic"):
            cls_name = CLASS_NAME[(faction, cls_type)]
            for sc in by_class.get((faction, cls_type), []):
                sc_name = t(sc.get("name"), default=sc.get("id") or "?")
                req_sids = {c.get("skillSid") for c in sc.get("activationConditions") or []}
                effect = t(sc.get("desc"), default="")
                cells: list[str] = [
                    f'<td>{class_glyph(cls_type)}</td>',
                    f'<td><strong>{sc_name}</strong> '
                    f'<span style="color:#888">· {cls_name}</span></td>',
                ]
                for sid, full, abbr in skill_cols:
                    cells.append(f'<td>{abbr if sid in req_sids else ""}</td>')
                cells.append(f'<td class="col-effect">{effect}</td>')
                out.append('<tr>' + "".join(cells) + '</tr>')

    out.append('</tbody></table></div>')

    # Footer note
    out.append('<p class="note"><strong>Structural pattern.</strong> Every '
               'subclass requires exactly <strong>1 Combat + 1 Magic + 1 School '
               '+ 2 Utility</strong> — the recipe is fixed. Of the four Magic '
               'schools, only one is required per subclass. Of the ten utility '
               'skills, only eight ever appear in any subclass requirement: '
               '<em>Siegecraft</em> and <em>Recruitment</em> are never required, '
               'making them pure side-options.</p>\n')

    out.append('<p class="note"><strong>Class-locked skills.</strong> Two skills '
               'are tied to class type and never appear in subclass conditions: '
               '<em>Combat</em> (might-only, gives the hero a Heroic Strike '
               'cooldown reduction) and <em>Thaumaturgy</em> (magic-only, lets '
               'the hero cast a second spell each round). Both are useful but '
               'unrelated to subclass progression.</p>\n')

    out.append('<p class="note"><strong>About the effects.</strong> Numeric '
               'placeholders like <code>{0}</code> are filled at runtime from '
               'each subclass\'s <code>bonuses</code> entry; values typically '
               'scale with hero level. HTML <code>&lt;b&gt;</code> tags in '
               'effect text mark game-side absolute guarantees.</p>\n')

    return "\n".join(out)


# ---------- Heroes page ----------
def render_heroes() -> str:
    out: list[str] = []
    out.append("---")
    out.append("title: Heroes — Starting Skills, Stats & Armies")
    out.append("layout: default")
    out.append("permalink: /heroes/")
    out.append("---\n")
    out.append("# Heroes — Starting Skills, Stats & Armies\n")
    out.append('<p class="lede">All 108 stock heroes (six factions × two classes '
               '× nine heroes), with starting stats, starting skills, starting '
               'army composition, and the hero\'s signature specialization.</p>\n')

    out.append('Within each faction, ⚔ heroes are the Might class, ✦ are Magic. '
               'Stats columns: <strong>A</strong>ttack, <strong>D</strong>efense, '
               '<strong>P</strong>ower (Spell Power), <strong>K</strong>nowledge. '
               'Skill levels are L1 / L2 (basic / advanced). Each hero starts '
               'with the faction skill plus one other; a few start with the '
               'faction skill at L2 instead.\n')

    by_faction: dict[str, list[dict]] = defaultdict(list)
    for h in heroes:
        by_faction[h.get("fraction") or "?"].append(h)

    by_class_subclasses: dict[tuple[str, str], list[dict]] = defaultdict(list)
    for sc in subclasses_all:
        by_class_subclasses[(sc.get("faction"), sc.get("classType"))].append(sc)
    for k in by_class_subclasses:
        by_class_subclasses[k].sort(key=lambda s: s.get("id") or "")

    for faction in PLAYABLE_ORDER:
        if faction not in by_faction:
            continue
        title = FACTION_TITLE[faction]
        fac_skill_name = FACTION_SKILL[faction][1]
        fac_skill_sid = FACTION_SKILL[faction][0]
        fac_skill_desc = t(f"{fac_skill_sid}_desc",
                           default="").replace("|", "\\|")

        out.append(f"## {title}\n")

        # Quick subclass reminder for this faction
        sc_lines = []
        for cls_type in ("might", "magic"):
            cls_name = CLASS_NAME[(faction, cls_type)]
            for sc in by_class_subclasses.get((faction, cls_type), []):
                sc_name = t(sc.get("name"), default=sc.get("id") or "?")
                req_sids = [c.get("skillSid") for c in sc.get("activationConditions") or []]
                req_names = [SKILL_BY_SID.get(s, (s, s))[0] for s in req_sids]
                glyph = class_glyph(cls_type)
                sc_lines.append(f"- {glyph} <strong>{sc_name}</strong> "
                                f"({cls_name}): {' · '.join(req_names)}")
        out.append(f"<p><em>Faction skill</em>: <strong>{fac_skill_name}</strong>. "
                   f"<em>Subclasses:</em></p>\n")
        out.append("\n".join(sc_lines))
        out.append("")

        # Heroes — one table per (faction × class)
        for cls_type in ("might", "magic"):
            cls_name = CLASS_NAME[(faction, cls_type)]
            cls_heroes = sorted(
                [h for h in by_faction[faction] if h.get("classType") == cls_type],
                key=hero_sort_key,
            )
            if not cls_heroes:
                continue

            out.append(f"### {class_glyph(cls_type)} {cls_name}\n")

            head = ["#", "Hero", "Specialization",
                    "A", "D", "P", "K",
                    "Starting Skills", "Starting Army"]
            sep = ["---:", "---", "---", "---:", "---:", "---:", "---:", "---", "---"]
            out.append("<div class=\"scroll-x\">\n")
            out.append("| " + " | ".join(head) + " |")
            out.append("| " + " | ".join(sep) + " |")

            for h in cls_heroes:
                hid = h["id"]
                display = t(hid, default=hid).replace("|", "\\|")
                tail = hid.rsplit("_", 1)[-1]

                stats = h.get("stats") or {}
                a = stats.get("offence", "")
                d = stats.get("defence", "")
                p = stats.get("spellPower", "")
                k = stats.get("intelligence", "")

                # Starting skills
                start = []
                for sk in h.get("startSkills") or []:
                    sid = sk.get("sid")
                    if sid == FACTION_SKILL[faction][0]:
                        name = FACTION_SKILL[faction][1]
                    else:
                        name = ALL_SKILL_NAMES.get(sid) or t(f"{sid}_name", default=sid)
                    lvl = sk.get("skillLevel") or 1
                    start.append(f"{name} L{lvl}")
                start_str = " · ".join(start) or "—"

                # Starting squad
                squad_parts = []
                for st in h.get("startSquad") or []:
                    mn = st.get("min") or 0
                    mx = st.get("max") or 0
                    name = unit_display(st.get("sid") or "")
                    squad_parts.append(f"{mn}–{mx} {name}")
                army = " · ".join(squad_parts) or "—"

                spec_id = h.get("specialization") or ""
                spec_name, _ = spec_lookup.get(spec_id, ("", ""))

                glyph = class_glyph(cls_type)
                out.append(
                    f"| {glyph} {tail} | <strong>{display}</strong> "
                    f"| <span class='specialty'>{spec_name}</span> "
                    f"| {a} | {d} | {p} | {k} "
                    f"| <span class='skills'>{start_str}</span> "
                    f"| <span class='army'>{army}</span> |"
                )

            out.append("\n{:.heroes-table}\n")
            out.append("</div>\n")

        # Per-faction note: heroes who start at L2 in faction skill
        l2_heroes = [
            h for h in by_faction[faction]
            if any(
                sk.get("sid") == FACTION_SKILL[faction][0] and
                (sk.get("skillLevel") or 1) >= 2
                for sk in (h.get("startSkills") or [])
            )
        ]
        if l2_heroes:
            names = ", ".join(t(h["id"], default=h["id"]) for h in l2_heroes)
            out.append(f'<p class="note"><strong>Faction-skill specialists:</strong> '
                       f'{names} start with <strong>{fac_skill_name} L2</strong> instead '
                       f'of L1 + a second skill — they trade head-start flexibility '
                       f'for an early advanced faction-skill effect.</p>\n')

    return "\n".join(out)


# ---------- Index page ----------
def render_index() -> str:
    return """---
title: HOMM Olden Era Reference
layout: default
permalink: /
---

# HOMM Olden Era — Reference

<p class="lede">Hero classes, subclasses, and starting loadouts for
<em>Heroes of Might and Magic: Olden Era</em>. Datamined from the game's
JSON files; updated to match the current build.</p>

## Pages

- **[Subclasses & Required Skills](subclasses/)** — A 24-row matrix of every
  subclass (two per class, twelve classes), showing the five skills each
  needs at level&nbsp;3 plus the unique passive effect. Built around the
  fact that every subclass takes exactly 1 Combat + 1 Magic + 1 School + 2
  Utility skills, the design surfaces that pattern at a glance.

- **[Heroes — Starting Skills, Stats & Armies](heroes/)** — All 108 stock
  heroes by faction, with their starting Attack/Defense/Power/Knowledge,
  starting skills (each hero gets the faction skill plus one other),
  starting army composition (three unit stacks with min/max counts), and
  signature specialization name.

## Notes

- Six playable factions: Temple (human), Necropolis (undead), Grove
  (nature), Hive (demon), Schism (unfrozen), Dungeon. Each has 18 heroes
  split into two classes (Might / Magic).
- Two skills are class-locked and never appear in subclass conditions:
  *Combat* (Might-only) and *Thaumaturgy* (Magic-only). *Siegecraft* and
  *Recruitment* are also never required for any subclass.
- Effect text is preserved verbatim; placeholders like `{0}` are filled at
  runtime from each subclass's bonuses block.

<p class="note"><strong>Reproduce</strong>: <code>python3
catalog/scripts/build_docs.py</code> regenerates these pages from
<code>HeroesOldenEra_Data/StreamingAssets/Core.zip</code> after extraction
into <code>catalog/raw/</code>.</p>
"""


# ---------- Write ----------
(DOCS / "index.md").write_text(render_index())
(DOCS / "subclasses.md").write_text(render_subclasses())
(DOCS / "heroes.md").write_text(render_heroes())
print(f"wrote {DOCS / 'index.md'}")
print(f"wrote {DOCS / 'subclasses.md'}")
print(f"wrote {DOCS / 'heroes.md'}")
