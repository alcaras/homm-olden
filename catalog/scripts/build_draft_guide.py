"""Draft strategy guide — pick/ban quick reference for tournament/Exodus.

Editorial content; mirrors the build_tier_list.py / build_faction_guides.py
pattern. Cross-references hero IDs against docs/data.js for portrait paths
and validates that every cited hero exists.

Outputs:
  catalog/out/draft_guide.md
  docs/draft-data.js  (window.OE_DRAFT_DATA)
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_JS = ROOT / "docs" / "data.js"
OUT_MD = ROOT / "catalog" / "out" / "draft_guide.md"
OUT_JS = ROOT / "docs" / "draft-data.js"


# --------------------------------------------------------------------------- #
# Editorial content
# --------------------------------------------------------------------------- #

DRAFT_FORMAT = [
    "1 faction ban per player",
    "1 faction pick per player",
    "3 hero bans per player",
    "1 hero pick per player",
]

FACTION_BAN_ORDER = [
    {
        "rank": 1, "faction": "necropolis", "name": "Necropolis",
        "why": ("Deepest pool in the game — even after spending all 3 hero bans on Kel'Ghul + "
                "Bulwark + Onkos, they still have Marl, Tarius, Lord Rufus, Oona, Artorius, Laura, "
                "Funerella as picks. The Undead Transformer is unique to this faction. You cannot "
                "ban-around Necropolis at the hero phase."),
    },
    {
        "rank": 2, "faction": "sylvan", "name": "Grove",
        "why": ("4 perma-ban-tier heroes (Halon, Sullie, Aunt Daliar, Elder Tss'kish) — you can "
                "only ban 3, so one always slips through. Avatar Vomit + Thaumaturgy is the "
                "strongest archetype in the game."),
    },
    {
        "rank": 3, "faction": "dungeon", "name": "Dungeon",
        "why": ("4 perma-ban-tier heroes (Motley, Stinger, Typhona, Lodos). Lodos's starting Sleep "
                "spell still wins fights even if you ban the other three. Strongest single-hero "
                "unit roster."),
    },
    {
        "rank": "skip", "faction": "temple", "name": "Temple",
        "why": ("Reliable but not broken — fewer S-tier heroes than Necro/Grove/Dungeon. Don't "
                "waste your faction ban here."),
    },
    {
        "rank": "skip", "faction": "schism", "name": "Schism",
        "why": ("Expensive and tech-tree-brutal. Easy to outpace with proper draft discipline; "
                "don't burn your ban here."),
    },
    {
        "rank": "anti", "faction": "hive", "name": "Hive",
        "why": ("**Anti-pattern.** Hive has the worst early game in the roster — banning it removes "
                "your opponent's *losing* option. Hive bans only make sense if you specifically "
                "know your opponent prefers Hive."),
    },
]

FACTION_PICK_ORDER = [
    {"faction": "necropolis", "name": "Necropolis",
     "why": "Deepest pool; ban-resistant. First-pick instantly if open."},
    {"faction": "sylvan", "name": "Grove",
     "why": "Avatar Vomit + Thaumaturgy meta. Even after Halon/Sullie bans, Tss'kish/Daliar/Faleor/Minstrel are strong."},
    {"faction": "dungeon", "name": "Dungeon",
     "why": "Strongest single-hero unit roster. Lodos still S-tier after Motley/Stinger/Typhona bans."},
    {"faction": "temple", "name": "Temple",
     "why": "Reliable script-faction: Crossbowman → Austringer + Daylight buffs + Angel double-build."},
    {"faction": "schism", "name": "Schism",
     "why": "Only if you've practiced the brutal tech tree. Bloated Arbitrators are arguably the best T6 in the game."},
    {"faction": "hive", "name": "Hive",
     "why": "Only if you got Maelstrom. Otherwise the early game is unplayable."},
]


GOING_FIRST = {
    "title": "If you have first ban / first pick",
    "summary": ("You set the tempo. Take Necropolis off the board, then grab the best of "
                "Grove or Dungeon. Spend hero bans on whatever S-tier hero is still standing "
                "in your opponent's faction."),
    "steps": [
        ("Faction ban", "Ban Necropolis. Always. Removes the deepest pool from contention."),
        ("Faction pick", "Pick Grove (if Halon/Sullie are likely to clear hero-ban) or Dungeon. "
                         "If both are likely to be hero-banned out, pick Temple for reliability."),
        ("Hero bans", "Spend bans on your opponent's top-3 — see the matchup table below."),
        ("Hero pick", "Your faction's S-tier hero that survived their bans."),
    ],
}

GOING_SECOND = {
    "title": "If you have second ban / second pick",
    "summary": ("You react. Mirror their faction ban (or take Necro yourself if they didn't ban it), "
                "then counter-pick the matchup. With second pick you know exactly what you're "
                "playing into — use that information."),
    "steps": [
        ("Faction ban", "If they banned Necro, ban Grove or Dungeon (whichever you'd rather not face). "
                        "If they did NOT ban Necro, ban Necro yourself."),
        ("Faction pick", "Counter-pick based on the matchup table — see below. Going Grove into Dungeon "
                         "is good (Halon clears the ranged stack); Dungeon into Grove is good (Twilight "
                         "shuts down spell combos)."),
        ("Hero bans", "React to their faction. Ban their top-3 see matchup table."),
        ("Hero pick", "Counter-pick their hero. If they took Heroic-Strike (Mandall/Stinger/Curson), "
                      "consider tanky/sustain heroes. If they took an Avatar specialist, consider "
                      "Twilight/anti-magic heroes."),
    ],
}


COUNTERS = {
    # opponent faction → your best counter pick + reason
    "necropolis": {
        "primary": ("necropolis", "Necropolis (mirror)",
                    "Mirror denies their gameplan; Marl's Web slows their Skeleton Archers; you "
                    "compete for the same Pandora-box transformer plays."),
        "alt":     ("sylvan", "Grove (Halon)",
                    "Chain Lightning shreds T1 Skeleton Archer doom-stacks; Despair-immune."),
    },
    "sylvan": {
        "primary": ("dungeon", "Dungeon (Motley)",
                    "Mley's Twilight shuts down ranged + Halon's spell combos; Black Dragons "
                    "immune to all magic damage; Onyx Dancer 1-stacks shred squishy Hoplites/Fauns."),
        "alt":     ("necropolis", "Necropolis",
                    "Liches resurrect through Grove's burst spells; Magic Absorption law caps "
                    "their spell power."),
    },
    "dungeon": {
        "primary": ("necropolis", "Necropolis",
                    "Liches resurrect units killed by Onyx Dancer 1-stacks; Vampire Lord retaliation "
                    "loop drains Hydras; Magic Absorption law strips Black Dragon synergy spells."),
        "alt":     ("sylvan", "Grove (Halon)",
                    "Chain Lightning through Onyx Dancer stacks + Avatar absorbs Black Dragon hits."),
    },
    "temple": {
        "primary": ("necropolis", "Necropolis",
                    "Marl's Web + Skeleton Archer volume out-shoots Crossbowmen; Daylight buffs "
                    "neutralized by Death's Presence law."),
        "alt":     ("sylvan", "Grove",
                    "Halon's chain lightning AoE + Avatar tank > Temple's slow blob."),
    },
    "schism": {
        "primary": ("sylvan", "Grove (Halon)",
                    "Chain Lightning clears Rashoth volumes faster than they can demon-farm; "
                    "Avatar Vomit out-tempos Communion-based scaling."),
        "alt":     ("necropolis", "Necropolis",
                    "Animate Dead snowball outpaces Schism's expensive economy; Skeleton volume "
                    "counters demon-farmed Grand Shoths."),
    },
    "hive": {
        "primary": ("dungeon", "Dungeon",
                    "Onyx Dancer 1-stacks strip defense before Reaver alpha-strike; Black Dragons "
                    "immune to Hive's primal-magic finishers."),
        "alt":     ("necropolis", "Necropolis",
                    "Skeleton Archer doom-stack out-volumes Hive's slow early units; Bulwark/"
                    "Onkos scale faster than Hive's week-2 power spike."),
    },
}


# Top-5 hero ban targets per opponent faction
HERO_BANS = {
    "necropolis": [
        ("necro_hero_4",  "Kel'Ghul",          "T6 Dread Knights at start; only +2-growth tier specialist in the game"),
        ("necro_hero_1",  "Bulwark",           "King of Tanks; nearly unbleedable early game"),
        ("necro_hero_3",  "Onkos",             "Skeleton specialist; +2 growth + buffs make Skeleton Archers the strongest T1 ranged stack"),
        ("necro_hero_7",  "Marl",              "Masterful Web slows the entire enemy army; S-tier on Sprint, A everywhere"),
        ("necro_hero_6",  "Artorius Veritas",  "Masterful Berserk hits a radius — punishes corner-camping ranged blob meta"),
    ],
    "sylvan": [
        ("nature_hero_15", "Halon",            "Masterful Chain Lightning loses only 25% per bounce (vs 50%); insane early tempo"),
        ("nature_hero_17", "Sullie",           "Avatar specialist; her Avatar is immune to magic damage"),
        ("nature_hero_9",  "Aunt Daliar",      "Insight + Civic Innovation = blast through the law tree"),
        ("nature_hero_11", "Elder Tss'kish",   "Thaumaturgy + Herbomancer buffs; late-game double/triple-cast"),
        ("nature_hero_3",  "Gingertail",       "Fawn tempo; 3 Fawn stacks + Init/HP buff"),
    ],
    "dungeon": [
        ("dungeon_hero_13", "Motley",          "Onyx Dancers + Twilight; shuts down all enemy ranged units"),
        ("dungeon_hero_3",  "Stinger",         "Poisoned Heroic Strike with +10 damage; toxic creep speed"),
        ("dungeon_hero_16", "Typhona",         "2 Tier 6 Hydras on day 1"),
        ("dungeon_hero_18", "Lodos",           "Starts with Sleep; one cast on a 180-archer stack ends the fight"),
        ("dungeon_hero_6",  "Devir, son of Devir", "Minotaur specialist; Day 1 Minotaur doom build"),
    ],
    "temple": [
        ("human_hero_11", "Pip",                "Most picked/banned Temple hero; Insight + flexible attribute scaling"),
        ("human_hero_9",  "Old Lord Mandall",   "Heroic Strike specialist with +10% damage-amp debuff"),
        ("human_hero_4",  "Kestrel",            "Offense start enables Austringer doom-stack"),
        ("human_hero_8",  "Lord Edgar",         "Tazar-style 20% A/D to units; best on slow templates"),
        ("human_hero_13", "Lia the Untethered One", "Daylight specialist; can lock you out of Daylight in mirror"),
    ],
    "schism": [
        ("unfrozen_hero_13", "The Eye Collective",   "2 Grand Shoth stacks + Avatar Summon = huge early tempo"),
        ("unfrozen_hero_10", "Grellekh the Betrayer", "Shadow Blades +1 base damage = ~50% boost on Rashoth"),
        ("unfrozen_hero_8",  "Changeling Urgo",      "Free 0-mana Avatar scales with Schism's spell-power-heavy stats"),
        ("unfrozen_hero_11", "Icequeen Hel'Ghat",    "Armor specialist; oppressive Communion shadow-army synergy"),
        ("unfrozen_hero_1",  "Nihil",                "Logistics fallback; ban only if their top tempo heroes are gone"),
    ],
    "hive": [
        ("demon_hero_2",  "Maelstrom",          "Best Hive hero — banning him cripples the faction's early game"),
        ("demon_hero_4",  "Zoran the Self-Founded", "Worm Corpse Eater self-sustains the Hive creep"),
        ("demon_hero_9",  "Abigor, Duke of Battle", "+1 hex deploy + scaling init = late-game alpha strike"),
        ("demon_hero_5",  "Curson, Duke of Rage", "Zero-loss creep with Heroic Strike chains"),
        ("demon_hero_16", "Oriax",              "Summon Avatar + likely Masterful Blink combo"),
    ],
}


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #

def load_heroes() -> dict[str, dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const HEROES = (\[.*?\]);", text, re.DOTALL)
    arr = json.loads(m.group(1))
    return {h["id"]: h for h in arr}


def load_factions() -> list[dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const FACTIONS = (\[.*?\]);", text, re.DOTALL)
    return json.loads(m.group(1))


def build():
    heroes = load_heroes()
    factions = load_factions()
    fac_by_id = {f["id"]: f for f in factions}

    # validate
    for fid, picks in HERO_BANS.items():
        if fid not in fac_by_id:
            raise RuntimeError(f"unknown faction id in HERO_BANS: {fid}")
        for hid, name, _ in picks:
            if hid not in heroes:
                raise RuntimeError(f"unknown hero id: {hid} ({name})")
            if heroes[hid]["faction"] != fid:
                raise RuntimeError(f"{hid} ({name}) is faction={heroes[hid]['faction']}, not {fid}")
    for fid, c in COUNTERS.items():
        if fid not in fac_by_id:
            raise RuntimeError(f"unknown faction id in COUNTERS: {fid}")
        for label, (cfid, _, _) in c.items():
            if cfid not in fac_by_id:
                raise RuntimeError(f"unknown counter faction id: {cfid}")

    # markdown
    md = ["# Draft strategy — tournament / Exodus quick reference\n"]
    md.append(
        "Quick-ref guide for drafting in single-hero PvP. Synthesized from creator commentary "
        "and the per-faction tier list. Use during a draft.\n"
    )

    md.append("## Format\n")
    for f in DRAFT_FORMAT:
        md.append(f"- {f}")
    md.append("")

    md.append("## Faction ban priority\n")
    md.append("| Rank | Faction | Why |")
    md.append("|---|---|---|")
    for r in FACTION_BAN_ORDER:
        rank = r["rank"] if isinstance(r["rank"], int) else f"({r['rank']})"
        md.append(f"| {rank} | **{r['name']}** | {r['why']} |")
    md.append("")

    md.append("## Faction pick priority\n")
    md.append("| Rank | Faction | Why |")
    md.append("|---:|---|---|")
    for i, p in enumerate(FACTION_PICK_ORDER, 1):
        md.append(f"| {i} | **{p['name']}** | {p['why']} |")
    md.append("")

    for guide in (GOING_FIRST, GOING_SECOND):
        md.append(f"## {guide['title']}\n")
        md.append(guide["summary"] + "\n")
        for label, body in guide["steps"]:
            md.append(f"- **{label}.** {body}")
        md.append("")

    md.append("## Counter-pick matrix\n")
    md.append("If your opponent picks faction X, your best response is:\n")
    md.append("| Opponent picked | Primary counter | Why | Alt counter | Why |")
    md.append("|---|---|---|---|---|")
    for fid, c in COUNTERS.items():
        op = fac_by_id[fid]["name"]
        pfid, pname, pwhy = c["primary"]
        afid, aname, awhy = c["alt"]
        md.append(f"| **{op}** | {pname} | {pwhy} | {aname} | {awhy} |")
    md.append("")

    md.append("## Top 5 heroes to ban (per opponent faction)\n")
    for fid in ["necropolis", "sylvan", "dungeon", "temple", "schism", "hive"]:
        if fid not in HERO_BANS: continue
        md.append(f"### vs {fac_by_id[fid]['name']}\n")
        for i, (hid, name, why) in enumerate(HERO_BANS[fid], 1):
            md.append(f"{i}. **{name}** — {why}")
        md.append("")

    md.append("---\n")
    md.append(
        f"*Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} by "
        f"`catalog/scripts/build_draft_guide.py`. Edit the script to update.*\n"
    )

    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    print(f"wrote {OUT_MD}  ({len(md)} lines)")

    # JS payload
    payload = {
        "FORMAT": DRAFT_FORMAT,
        "FACTION_BAN_ORDER": FACTION_BAN_ORDER,
        "FACTION_PICK_ORDER": FACTION_PICK_ORDER,
        "GOING_FIRST": GOING_FIRST,
        "GOING_SECOND": GOING_SECOND,
        "COUNTERS": {
            fid: {
                "primary": {"factionId": c["primary"][0], "name": c["primary"][1], "why": c["primary"][2]},
                "alt":     {"factionId": c["alt"][0],     "name": c["alt"][1],     "why": c["alt"][2]},
            }
            for fid, c in COUNTERS.items()
        },
        "HERO_BANS": {
            fid: [{"id": hid, "name": name, "why": why} for hid, name, why in items]
            for fid, items in HERO_BANS.items()
        },
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_draft_guide.py — do not edit by hand */\n"
    js += "window.OE_DRAFT_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")


if __name__ == "__main__":
    build()
