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
    "Faction phase: player A bans, player B bans, player B picks, player A picks",
    "Hero phase:    player A bans 3, player B bans 3, player B picks, player A picks",
    "Key wrinkle: whoever bans FIRST picks SECOND (and vice versa)",
    "First-ban = agenda-setter; second-ban = reactive picker with last-pick advantage",
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
    "title": "If you ban FIRST (and therefore pick SECOND)",
    "summary": ("You set the agenda but lose first pick. Banning forces them off their preferred "
                "faction; picking second forces YOU off yours. Your ban should remove the faction "
                "you most fear them playing — not necessarily the strongest faction overall."),
    "steps": [
        ("Faction ban",
         "Ban the faction you least want to face. Default: **Necropolis** (deepest pool, "
         "Undead Transformer, Skeleton Archer doom-stack). If you specifically dread Avatar Vomit, "
         "ban **Grove** instead. If you dread Twilight + Onyx Dancer 1-stacks, ban **Dungeon**."),
        ("Their faction ban",
         "They will ban one of the remaining S-tier factions, usually whichever you'd prefer to "
         "play. Expect Necro/Grove/Dungeon — whichever you didn't ban. They want to deny YOUR "
         "best pick since you'll pick second."),
        ("Their faction pick (first pick)",
         "They get to grab the best surviving S-tier faction. Plan for this ahead of time — it "
         "will usually be Necropolis, Grove, or Dungeon (whichever isn't banned)."),
        ("Your faction pick (second pick)",
         "Pick the matchup-favored counter to their faction. See the counter-pick matrix below. "
         "Don't pick blindly for raw power — pick what *beats them*."),
        ("Hero bans (you ban first)",
         "Ban their top 3 heroes — see matchup table below. Since you saw their faction pick, "
         "this part is easy."),
        ("Their hero pick (first pick)",
         "They'll pick their best surviving hero from their faction."),
        ("Your hero pick (second pick)",
         "Counter-pick their hero. If they picked a Heroic Strike grinder, take a tanky/sustain "
         "hero. If they picked an Avatar specialist, take a Twilight/anti-magic hero. **Last "
         "pick is the leverage you got for losing first pick — use it.**"),
    ],
}

GOING_SECOND = {
    "title": "If you ban SECOND (and therefore pick FIRST)",
    "summary": ("You react on bans but get first pick. This is the stronger draft side — you have "
                "full information when banning the second faction AND get the best surviving faction. "
                "Use the ban to remove a faction you don't want to mirror, then grab the strongest "
                "remaining S-tier."),
    "steps": [
        ("Their faction ban (first ban)",
         "They ban the faction they least want to face — usually Necropolis (most likely), Grove, "
         "or Dungeon."),
        ("Your faction ban",
         "Now you have full information. Three good lines: "
         "(a) If they banned Necro, ban Grove → you take Dungeon. "
         "(b) If they banned Grove, ban Dungeon → you take Necropolis. "
         "(c) If they banned Dungeon, ban Grove → you take Necropolis. "
         "Always leave Necropolis available if it's there. If they didn't ban Necro, **ban Necro "
         "yourself** only if you don't want to play it; otherwise leave it open and ban their #2."),
        ("Your faction pick (first pick)",
         "Grab the strongest surviving faction. Necropolis if open. Then Grove. Then Dungeon. "
         "Then Temple. **Don't pick a counter-faction here — there's no information yet.** Just "
         "take the strongest pool."),
        ("Their faction pick (second pick)",
         "They will counter-pick your faction. Expect them to pick the strongest counter from the "
         "counter-pick matrix below — plan for that matchup."),
        ("Their hero bans (first ban, 3 of them)",
         "They'll burn bans on YOUR top 3. Plan to lose Kel'Ghul + Bulwark + Onkos "
         "(if Necropolis) etc."),
        ("Your hero bans",
         "Ban their top 3 — see matchup table."),
        ("Their hero pick (first pick)",
         "They take their best surviving hero."),
        ("Your hero pick (last pick)",
         "Take your faction's best surviving hero. Despite losing 3 to bans, deep faction pools "
         "still leave you with an S/A pick."),
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
