"""Per-faction Building + Law guide for tournament/Exodus single-hero PvP.

Editorial source of truth for the "Guides" SPA tab and a companion markdown.

Cross-referenced against extracted data in:
  - catalog/raw/Lang/english/texts/cities.json       (building name tokens)
  - catalog/raw/Lang/english/texts/factionLaws.json  (law name + desc tokens)
  - catalog/raw/DB/fractions_laws/*.json             (law cost/bonus structure)

Sources for editorial content: notes-from-videos.md (multiple creator guides).

Tier values:
  S — rush / mandatory / always pick
  A — strong, build/take when convenient
  B — situational
  trap — common mistake, explicitly skip

Outputs:
  catalog/out/faction_guides.md
  docs/guides-data.js
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT_MD = ROOT / "catalog" / "out" / "faction_guides.md"
OUT_JS = ROOT / "docs" / "guides-data.js"

# In-game faction key (cities.json prefix) → display id (matches data.js FACTIONS)
KEY_TO_ID = {
    "human": "temple",
    "undead": "necropolis",
    "nature": "sylvan",
    "demon": "hive",
    "unfrozen": "schism",
    "dungeon": "dungeon",
}
ID_TO_KEY = {v: k for k, v in KEY_TO_ID.items()}

# Display order on the page
FACTION_ORDER = ["temple", "necropolis", "sylvan", "hive", "schism", "dungeon"]

FACTION_DISPLAY = {
    "temple":     "Temple",
    "necropolis": "Necropolis",
    "sylvan":     "Grove",
    "hive":       "Hive",
    "schism":     "Schism",
    "dungeon":    "Dungeon",
}


# --------------------------------------------------------------------------- #
# Editorial guides
# --------------------------------------------------------------------------- #
# Building entries reference the building-tag short id (e.g. "Tier_2", "Wall").
# The script resolves the short id to the in-game name from cities.json.
# Law entries reference the integer law number (1..N) for the faction's table.
# The script validates both and resolves them to the localized name + desc.

GUIDES = {
    "temple": {
        "summary": (
            "Temple's tournament gameplan is the most straightforward in the game. Build a Crossbowman "
            "→ Austringer ranged blob, support it with Daylight buffs (Bless, Riposte, Radiant Armor), and "
            "double-build the Angel line on week 1 if your economy permits. The faction is widely called "
            "noob-friendly precisely because this script just works."
        ),
        "build_order": [
            ("Day 1",      "Tier_2",      "S", "Mews → Crossbowmen. T2 archer is your early-game carrier; recruit and split into stacks immediately."),
            ("Day 1",      "Magic_Guild", "S", "Mage Guild L1 — fish for Bless on day 1. Also a prereq for the Archery Camp / Training Range."),
            ("Day 1-3",    "Bank",        "S", "+1000 gold/day; Temple builds expensive units, so secure income early."),
            ("Day 2-4",    "Wall",        "S", "Fortifications T1 → T2 by mid week 1. T2 walls = +50% dwelling growth — the single biggest scalar in the game."),
            ("Week 1",     "Tier_4",      "A", "Sundrop Chapel → Lightweavers. Hierophant 1-stacks for buff/dispel; Sun Heralds if using as primary damage."),
            ("Week 1-2",   "Tier_7",      "A", "Radiant Forge — try to double-build Angels in week 1. Securing Angels enables zero-loss clears of T7 dwellings on the map."),
            ("Week 2",     "Treasury",    "A", "Treasury into secondary towns is the standard macro spine."),
            ("Week 2",     "Magic_Guild", "A", "Mage Guild L3-L4 — Riposte (T3, counter before being hit) and Radiant Armor (T4, -40% damage) are tournament-decisive."),
            ("Week 2-3",   "Tier_3",      "B", "Griffin Rookery — Guardian Griffins counterattack adjacent friendlies. Skip the basic upgrade unless you have spare resources."),
        ],
        "building_traps": [
            ("Tier_5",       "trap", "Hippodrome (Cavalry). 'Cavalry is too clunky to spawn with' for single-hero Exodus — spawn units waste tempo. Skip in week 1."),
            ("Intelligence_Academy", "trap", "Scouting Skyship is generally low-priority — its sight bonus doesn't compete with raw army growth."),
        ],
        "laws_top": [
            ( 3, "S", "Resource Riches I — one-time gold/wood/ore. Cheapest economy snap to fund Fortifications + Angel double-build by end of week 1."),
            (30, "S", "Elite Angels — Angels gain 25-50% of hero A/D. Mandatory once your win condition is online."),
            (25, "S", "Encouragement — morale-trigger chance from 4% to 7%. Hugely buffs every Temple morale mechanic."),
            (15, "A", "Sun's Grace — +1 level to all Daylight spells. Free upgrade to Bless / Radiant Armor / Riposte without mage-guild RNG."),
            (26, "A", "Hero's Blessing — units gain 25% of hero's P+K as A/D. A built-in Battle Magic for caster Temples."),
            (13, "A", "Vengeful Strike — counterattacks deal +up-to-100% damage. Combos toxically with Riposte (counter before being hit)."),
            (10, "A", "Elite Crossbowmen — +growth and +Attack. Cheap and directly fuels the T2 archer doom-stack plan."),
        ],
        "laws_traps": [
            (16, "trap", "Resource Riches II — only worth it if you've already enacted I and have nothing else to spend on. Often outscaled by direct unit/army laws by mid game."),
            ( 2, "trap", "Training: Scouting — sight radius is rarely the bottleneck; skip in favor of stat-training laws or Resource Riches."),
        ],
    },

    "necropolis": {
        "summary": (
            "Necropolis snowballs through a Skeleton Archer doom-stack + Lich Rewind Death sustain "
            "+ Dread Knight power spike. The Undead Transformer is the single most broken building in "
            "tournament play — convert Pandora's Box rewards into your own elite units (no morale "
            "penalty). Necromancy scaling laws compound the snowball into Exodus's late game."
        ),
        "build_order": [
            ("Day 1",      "Tier_1",            "S", "Crypts and Graves (or upgrade if Kel'Ghul). Skeleton Archers are the early-game carrier; split into 1-stacks to farm focus and troll AI."),
            ("Day 1-2",    "Main",              "A", "Eternal Visage L2 with the Law Points upgrade (not gold)."),
            ("Day 2-4",    "Bank",              "S", "Dread Knights and Liches are expensive — bank early to fund T6/T5 production."),
            ("Day 4-5",    "Wall",              "S", "Fortifications T1 → T2 by week 1. +50% dwelling growth is the bread-winner of every Necro build."),
            ("Day 5-6",    "Tier_6",            "A", "Tomb of Warriors → Dread Knights. Mandatory if running Kel'Ghul; otherwise still your primary T6."),
            ("Week 1-2",   "Tier_5",            "S", "Timeless Mansion → Liches. Rewind Death sustain is the faction's win condition; do not skip."),
            ("Week 2",     "Skeleton_Converter","S", "Undead Transformer. The strongest tournament building. Drag Pandora-box T5/T6/T7 units in to convert them into Necropolis equivalents."),
            ("Week 2-3",   "Wall",              "S", "Fortifications T3 (further +50% growth on top of T2). Steamroll-mode by week 3."),
            ("Week 2-3",   "Magic_Guild",       "A", "Mage Guild for Despair (Sorcery) and Unnatural Calm. Laura's Masterful Despair bypasses immunity for the Decay/Vampire snowball."),
        ],
        "building_traps": [
            ("Tier_4", "trap", "Bone Exchange (Graverobbers). Awkward, slow, focus-hungry. Necropolis already has nowhere near enough focus for Liches and Heroic Strike — skip."),
        ],
        "laws_top": [
            ( 8, "S", "Laws of the Immortals — +60% law point generation in cities. Snowballs the entire law tree; rush this early."),
            (20, "S", "Terra Mortis — every battle on native terrain. Combo with #24 Return to the Soil for permanent +1 speed in PvP."),
            (24, "S", "Return to the Soil — +1 Speed on native terrain. Pair with Terra Mortis = always-on +1 Speed army-wide."),
            (18, "S", "Elite Liches — +100% lich healing. Doubles your sustain engine."),
            (31, "S", "Death's Presence — enemy non-Necro creatures deal -% / take +%. Massive passive PvP advantage."),
            (17, "A", "Bloodthirst — +Vampirism. Combo with #30 Morituri te Salutant for the S-tier Vampire Lord retaliation loop."),
            (30, "A", "Morituri te Salutant — +1 counterattack/round. With Bloodthirst, Vampire Lords resurrect their stack while retaliating."),
            (19, "A", "Elite Dread Knights — +growth and +Damage on the Avatar of War win condition."),
        ],
        "laws_traps": [
            ( 2, "trap", "Animate Dead I — first Necromancy bump is too small to matter early. Take after Laws of the Immortals snowballs your law output."),
            (13, "trap", "Mining: Mercury — only useful if you're hard-stuck on spell upgrades; usually outscaled by direct combat laws."),
        ],
    },

    "sylvan": {
        "summary": (
            "Grove's strategy is 'skip the mid-tier dwellings'. Lean into Fawn Archer + Dusk Hoplite "
            "(0-mana +3 spell power per cast) + Murmurmancer (re-cast spellbook) and use Avatar Vomit "
            "to cheese mid-tier objectives. The law tree is widely panned ('the most dogshit law tree') — "
            "only 3-4 laws are actually worth taking."
        ),
        "build_order": [
            ("Day 1",      "Tier_2",      "S", "Hop Patch → upgrade for Dawn/Dusk Hoplets. Hoplites are the focus engine + spell-power amplifier; the entire Grove plan revolves around them."),
            ("Day 1-2",    "Tier_5",      "S", "Shroomwood Shack → Herbomancers. Sporomancer/Murmurmancer is the late-game spell engine; rushing it skips most of the build path."),
            ("Day 2-3",    "Main",        "A", "Grove Palace L2 → L3 to start banking law points for the inevitable Resource Riches pivot."),
            ("Day 3-5",    "Wall",        "S", "Fortifications T1 → T2. Same +50% growth scalar as every other faction — mandatory."),
            ("Day 4-5",    "Magic_Guild", "S", "Mage Guild L1 — fish for Avatar / Fireball / Slow. Critical for the spellbook combo. Build *before* secondary economy."),
            ("Week 1-2",   "Bank",        "A", "Bank goes in *after* Resource Riches lands — the law gives you a burst of resources that pivots straight into a Bank."),
            ("Week 2",     "Tier_1",      "B", "Faun Huts upgrade if you skipped on day 1. Fawn Archers are still relevant late if not running Gingertail."),
            ("Week 2-3",   "Unic_2",      "B", "Mother Nature (+2 spell power). Strong only with caster heroes (Halon, Sullie, Tss'kish)."),
        ],
        "building_traps": [
            ("Tier_3",  "trap", "Menhir Circle (Iriyads/Naiads). The Qilin build path is 'horrendous' (Mage Guild → Iriyads → useless Naiads → Qilins). Skip and run Avatar Vomit instead."),
            ("Tier_6",  "trap", "Thunder Lair (Qilins). Only viable if you specifically committed to Naiads. Most Grove builds skip Qilins entirely."),
            ("Unic_1",  "trap", "Mycelium Roots — teleport is great for long classical games, but in Exodus your hero stays out on the map and uses Town Portal anyway."),
        ],
        "laws_top": [
            ( 4, "S", "Resource Riches I — Grove specifically *plans* to skip economy for early military, then pivots into this law for a mid-week 2 economy snap."),
            ( 6, "S", "Elite Hoplets — they always deal max damage. Removes the variance that otherwise hurts your tempo unit."),
            (22, "S", "Elite Mancers — Herbomancer focus cost -1. Drops Murmurmancer spellbook re-cast from 2 focus to 1, enabling triple-spell turns."),
            (24, "A", "Luck of the Fittest — luck → 7% per point (from 4%). Pair with Octavia or any luck-leaning build."),
            (11, "A", "Nature's Wildness — +50% damage on lucky strikes. Combos with Luck of the Fittest above."),
            ( 7, "A", "Children of the Wild — sight + movement + focus. Strong late-game scaling for caster heroes."),
            (29, "A", "Sanctuary — Iriyads/Naiads/Qilins/Phoenixes focus -1. Only relevant if you committed to that build path."),
        ],
        "laws_traps": [
            (25, "trap", "Force of Nature — +Heroic Strike damage. Grove has *no* heroic strike synergies; skip entirely."),
            ( 8, "trap", "Save the Forests — wood discount is irrelevant by the time you have enough law points to enact it."),
            (31, "trap", "Natural Serenity — cooldown reduction is rarely impactful vs standard rotation."),
        ],
    },

    "hive": {
        "summary": (
            "Hive has the worst early game in the entire roster — slow, clunky, no native ranged unit. "
            "The whole tournament plan is to *bypass* the early roster and reach Tier 5 (Reavers) or "
            "Tier 6 (Worms) as fast as possible. Apex by end of week 1 is non-negotiable. Hive law tier "
            "thresholds are uniquely low (Tier 5/6 unit laws unlock at 15 points), enabling power spikes "
            "in week 1 that other factions cannot match."
        ),
        "build_order": [
            ("Day 1",      "Tier_1",      "A", "Neglected Housing — upgrade for Ravager Parasites (3→5 speed). Mandatory if you can't reach Reavers fast enough."),
            ("Day 1-2",    "Bank",        "S", "+1000 gold/day. Hive's elite units are expensive; income beats raw production volume."),
            ("Day 2-4",    "Tier_5",      "S", "Apex (Reavers). Rushing this by end of week 1 is non-negotiable — Reavers are the faction's win condition."),
            ("Day 4-5",    "Wall",        "A", "Fortifications T1 → T2. Combined with Maelstrom's growth bonus, you get up to 7 Reavers/week."),
            ("Week 1-2",   "Magic_Guild", "A", "Mage Guild for Haste / Weakening Ray / Dimension Door. Closes Hive's melee-gap weakness."),
            ("Week 2",     "Tier_7",      "B", "Tower of Love (Hive Queens) — luxury target if economy permits, but rarely affordable in Exodus. Crystal/dust cost is brutal."),
            ("Week 2",     "Treasury",    "A", "Treasury supports the late-game elite recruitment burst."),
            ("Week 2-3",   "Tier_6",      "A", "Burning Soul Burrows (Worms). Pyroboros AoE ranged is the alternate win-condition stack to Reavers."),
        ],
        "building_traps": [
            ("Tier_3", "trap", "Paper Nest (Hornets) — Hornets fall over to anything; skip unless you specifically need turn-order manipulation."),
            ("Tier_4", "trap", "Chitinous Ziggurat (Scorpions) — slow, beefy but won't one-shot anything. Don't sink resources unless your build needs HP for egg scaling."),
        ],
        "laws_top": [
            ( 2, "S", "Laws of the Hive — reduces all higher-tier law thresholds. The keystone law that enables every other Hive law play."),
            (31, "S", "Focus Reserves — +1 Focus charge at battle start. Lets you summon eggs turn 1, fundamental to the Hive plan."),
            (17, "S", "Elite Reavers — +growth and +5 Morale. With #29 No Compassion, your Reaver stack is permanently morale-capped → Murderous Glee chains."),
            (29, "A", "No Compassion — +morale/luck trigger chance. The damage scalar that makes Reaver-only builds work."),
            (28, "A", "Infernal Rage — +1 base damage. +20% damage to summoned Larvae (4→5 base) — disproportionately big on the swarm side."),
            (26, "A", "Prosper and Flourish — external dwellings grow city creatures +50%. Late-game macro snap."),
            ( 9, "A", "Mana Devour — spells -1 mana. Indispensable for caster Hive (Mila, Oriax) running Dimension Door spam."),
        ],
        "laws_traps": [
            (21, "trap", "Natural Selection — buys upgraded creatures from external dwellings. Pointless: you can just upgrade them in town."),
            (22, "trap", "Hive Magic — +Magic Damage. Hive heroes rarely have the spell power to cash this in; skip."),
        ],
    },

    "schism": {
        "summary": (
            "Schism's tech tree is brutal and expensive — Arbitrators require Riders → Bewitchers → "
            "Arbitrators in sequence. The faction's gimmick is Communion (sacrificable shadow army) "
            "and Summoning Rite (demon-farm cultists into Grand Shoths). 'The Abyss Stares Back' "
            "law is mandatory for tournament play because Exodus often involves skipping a turn "
            "before the duel, which would otherwise halve your Communion."
        ),
        "build_order": [
            ("Day 1",      "Tier_1",      "S", "Lesser Summoning Rite → Stinging Rashoth. Your early-game shooter is mandatory; carries the entire creep phase."),
            ("Day 1-3",    "Bank",        "S", "Schism is the most expensive faction — Banks and Treasuries before military beyond T1."),
            ("Day 3-4",    "Wall",        "S", "Fortifications T1 → T2. Same +50% growth scalar."),
            ("Week 1",     "Tier_4",      "S", "Disturbing Summoning Rite → Grand Shoth. Your mid-to-late game power stack — Summoning Rite resurrects dead T2/T3 units as more Grand Shoths."),
            ("Week 1-2",   "Magic_Guild", "A", "Mage Guild for Avatar / Twilight (if rolled). Critical for Eye Collective / Urgo Avatar plays."),
            ("Week 2",     "Treasury",    "S", "Treasury — 'snowball your economy early or you lose the final duel'. Schism is the faction most punished by tight economies."),
            ("Week 2-3",   "Tier_5",      "B", "House of Chains (Concubus). Get to Bewitchers/Mistress of Chains 1-stacks for utility — they lock enemies out of abilities/focus."),
            ("Week 3",     "Tier_6",      "A", "Bloated Mansion (Arbitrators). The 'Toilet Seat Overlord' is widely cited as the best T6 in the game — pure damage, locks enemy spellbook. Worth the awkward tech path if you can afford it."),
        ],
        "building_traps": [
            ("Tier_3",  "trap", "Aga'Shoth Stables (Riders) — only build if you're rushing the Arbitrator tech path. Riders are pure meat-shield/demon-farm fuel; do not power-stack them."),
            ("Tier_7",  "trap", "Eerie Summoning Rite (Abyssal Envoys) — usually unaffordable in Exodus; skip unless you've snowballed economy hard."),
        ],
        "laws_top": [
            (29, "S", "The Abyss Stares Back — start each day with maximum Communion. Mandatory for Exodus (the format's turn-skip mechanic would otherwise halve Communion every duel)."),
            ( 8, "S", "Survival Conditions — +1 Wood/Ore per town. With 5-6 towns in late Exodus, this generates 12+ of each per turn."),
            ( 9, "A", "Depths of Mind — restore 30% mana each morning (up from 10%). 3× sustained casting on the map."),
            (33, "A", "Ice Storms — all enemy creatures lose Speed and Initiative. A permanent debuff in every fight."),
            (24, "A", "Unfrozen Strength IV-VI — Tier-4+ creatures gain hero-stat scaling. Massive when capturing mid-map Temple/etc towns and bringing those units along."),
            (28, "A", "Mind Freeze — enemy hero loses focus charges per round. Pair with Bewitcher 1-stacks to completely shut off enemy ability usage."),
        ],
        "laws_traps": [
            (16, "trap", "Cold Shoulder — twice-per-week Involuntary Summons. Gimmicky and rarely the right line vs Survival Conditions."),
            (21, "trap", "Frostbite — enemy hero loses 1 mana/round. Too slow; spell economy in Exodus duels is decided by burst, not attrition."),
        ],
    },

    "dungeon": {
        "summary": (
            "Dungeon is one of the strongest tournament factions because of how its laws interact with "
            "creatures: every Fighting Style has a dedicated 1.5× damage law, and you must take the "
            "ones matching your build. Dungeon dwellings *don't* grow with creature upgrades, so "
            "Fortifications matter even more here than for other factions. Onyx Dancer 1-stacks "
            "(-2 def/hit), Minotaur Lords (parry), Medusa Sculptors (petrify), Black Dragons "
            "(spell-immune) form the canonical stack."
        ),
        "build_order": [
            ("Day 1",      "Tier_3",      "S", "Amphitheater → Onyx Dancers (and rush the upgrade for Aureate Dancers ASAP). Splitting into 1-stacks spams -2 defense per hit; auto-wins early PvE."),
            ("Day 1-2",    "Tier_4",      "S", "Labyrinth → Minotaurs (esp. with Devir). Day 1 Minotaur recruits = the most explosive early army on the ladder."),
            ("Day 2-4",    "Bank",        "A", "Standard income building — Dungeon T6/T7 prices are steep."),
            ("Day 3-5",    "Wall",        "S", "Fortifications T1 → T2 in week 1. Dungeon needs walls *more* than other factions because upgrades don't add growth — fortifications are the only growth scalar."),
            ("Week 1-2",   "Wall",        "S", "Fortifications T3 by week 2. Push every-faction growth scalar to max."),
            ("Week 1-2",   "Tier_5",      "A", "Stilled Voices → Medusas. Sharpshooter + Slither Away + Petrify (Sculptor) = arguably the strongest unit in the faction."),
            ("Week 2",     "Magic_Guild", "A", "Mage Guild — Dungeon mages double-cast spell power via Dragon Stance. Build for Fireball / Star Children / Avatar."),
            ("Week 2-3",   "Tier_6",      "A", "Chthonic Home → Hydras. Tank with regen + poisonous blood. Strong before Black Dragons land."),
            ("Week 3",     "Tier_7",      "A", "Cave Palace → Black Dragons (preferred over Ashen). Spell immunity + high init = the win condition."),
        ],
        "building_traps": [
            ("Gymnasium", "trap", "Gymnasium gives free hero level-up but makes leveling exponentially harder *after* — save strictly for late-game (level 16+) when the curve flattens. Building it early is a beginner trap."),
            ("Tier_2",    "trap", "Safe House (Infiltrators) — useful but not a power stack. Build for utility 1-stacks (Guile Infiltrator no-retal), don't sink resources into mass production."),
        ],
        "laws_top": [
            (33, "S", "Arcane Knowledge — +500 Astrology daily. Skips needing dedicated astrology buildings; core Dungeon law in every guide."),
            ( 2, "S", "Leaders of the Nation — +20% law point generation. Combo with Arcane Knowledge to rapidly unlock world-map spells (Second Wind, Dimension Door)."),
            (28, "S", "Magical Education — +1 level to all spells. Permanent across-the-board upgrade; mandatory for any Dungeon caster build."),
            ( 7, "S", "Or No Ore? — buildings cost -40% Ore. Dungeon's biggest tournament bottleneck is Ore for Fortifications T2/T3 by week 2; this law is the relief valve."),
            (22, "A", "Triumvirate's Agents — +1 to all hero attributes. Doubled when paired with Tactics skill — a huge early stat snap."),
            (23, "A", "Merchants Guild — eliminates marketplace markups. Late-game economy law that lets you trade freely between resources."),
            ( 8, "A", "Jadame Maps — +20 hero movement. Out-paces opponents on the map and controls more Pandora boxes."),
        ],
        "laws_traps": [
            (16, "trap", "Peoples of Jadame — +Diplomacy persuasion. Diplomacy is class-locked anyway; near-zero impact."),
            (15, "trap", "Spy Network — +sight on external buildings. Outscaled by direct combat / economy laws."),
        ],
    },
}


# --------------------------------------------------------------------------- #
# Cross-faction draft-room notes
# --------------------------------------------------------------------------- #

UNIVERSAL_TIPS = [
    ("Exodus = 2 home cities + 1 third-faction city",
     "Each player starts with 2 cities of their own faction and there is a third, off-faction city on "
     "the map (capturable). Your home pair is your full-tech engine; the third city is a pure economy "
     "annex — Banks/Treasuries/Marketplaces only, no foreign dwellings (morale penalty)."),
    ("Mage Guild in every town",
     "Ending a turn in a city with a Mage Guild fully restores hero mana. This sustains your "
     "global-spell rotation (Town Portal, Second Wind, Dimension Door) — neglecting Mage Guilds "
     "is the most-cited mistake in tournament play."),
    ("Fortifications T2 by end of week 1",
     "Universal +50% dwelling growth. Every faction that doesn't hit T2 walls by week 1 falls behind in "
     "raw army size. Some factions (Dungeon, Hive) need it *more* because their faction-specific growth "
     "mechanics are weaker."),
    ("Don't go home",
     "The universal Exodus mistake is wasting movement points returning to your capital. Stay out, farm "
     "Pandora boxes, and only Town-Portal back when you absolutely need to upgrade and recruit before the duel."),
    ("Side cities = economy, not military",
     "If you capture a city of a different faction (e.g. the Exodus third city), do *not* invest in its "
     "dwellings — different-faction units inflict a morale penalty. Build only Town Halls, Banks, "
     "Marketplaces, Treasuries. Funnel resources back to your main capital."),
    ("Mage Guild before T7 dwelling",
     "Several factions (notably Temple) gate the elite training building behind Mage Guild. Always check "
     "the dependency tree before queuing your week."),
]


# --------------------------------------------------------------------------- #
# Build pipeline
# --------------------------------------------------------------------------- #

def load_tokens(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8-sig").lstrip("﻿")
    text = re.sub(r"//[^\n]*", "", text)
    text = re.sub(r",(\s*[}\]])", r"\1", text)
    data = json.loads(text)
    return {t["sid"]: t["text"] for t in data.get("tokens", [])}


def resolve_buildings(faction_id: str, cities_tokens: dict[str, str]) -> dict[str, str]:
    """Return short_id → display name for a faction (e.g. 'Tier_2' → 'Mews')."""
    fkey = ID_TO_KEY[faction_id]
    pref = fkey.capitalize() + "_Build_"
    out = {}
    for sid, txt in cities_tokens.items():
        if not sid.startswith(pref):
            continue
        if sid.endswith("_name"):
            short = sid[len(pref):-len("_name")]
            out[short] = txt
        elif sid.endswith("_name_level_1"):
            short = sid[len(pref):-len("_name_level_1")]
            out.setdefault(short, txt)
    return out


def resolve_laws(faction_id: str, law_tokens: dict[str, str]) -> dict[int, dict[str, str]]:
    """Return law_number → {name, desc} for a faction."""
    fkey = ID_TO_KEY[faction_id]
    out = {}
    for n in range(1, 50):
        nk = f"fraction_law_{fkey}_{n}_name"
        dk = f"fraction_law_{fkey}_{n}_desc"
        if nk in law_tokens:
            out[n] = {"name": law_tokens[nk], "desc": law_tokens.get(dk, "")}
    return out


PRIO_RANK = {"S": 0, "A": 1, "B": 2, "trap": 3}
PRIO_LABEL = {"S": "S — rush", "A": "A — strong", "B": "B — situational", "trap": "trap — skip"}


def build():
    cities_tokens = load_tokens(ROOT / "catalog" / "raw" / "Lang" / "english" / "texts" / "cities.json")
    law_tokens    = load_tokens(ROOT / "catalog" / "raw" / "Lang" / "english" / "texts" / "factionLaws.json")

    payload_factions = []
    md = ["# Per-faction building & law guide — tournament / Exodus\n"]
    md.append(
        "Single-hero PvP gameplan per faction: turn-by-turn build-order priority and law priority list. "
        "Sources: creator commentary in `notes-from-videos.md` cross-referenced against extracted "
        "data (`catalog/raw/Lang/english/texts/cities.json` for building names, "
        "`fractions_laws_table_*.json` for law tables).\n"
    )
    md.append(
        "**Tier scale.** **S** = rush / mandatory; **A** = strong, take when convenient; "
        "**B** = situational; **trap** = a common mistake the videos explicitly call out.\n"
    )

    md.append("## Universal tips\n")
    for t, body in UNIVERSAL_TIPS:
        md.append(f"- **{t}.** {body}")
    md.append("")

    for fid in FACTION_ORDER:
        if fid not in GUIDES:
            continue
        g = GUIDES[fid]
        buildings = resolve_buildings(fid, cities_tokens)
        laws      = resolve_laws(fid, law_tokens)
        fname = FACTION_DISPLAY[fid]

        # validate
        for phase, short_id, prio, note in g["build_order"]:
            if short_id not in buildings:
                raise RuntimeError(f"{fid}: unknown building short id '{short_id}' (need a row in cities.json)")
        for short_id, prio, note in g["building_traps"]:
            if short_id not in buildings:
                raise RuntimeError(f"{fid}: unknown building trap short id '{short_id}'")
        for n, prio, note in g["laws_top"] + g["laws_traps"]:
            if n not in laws:
                raise RuntimeError(f"{fid}: law #{n} not found in fractions_laws_table_{ID_TO_KEY[fid]}")

        # markdown
        md.append(f"## {fname}\n")
        md.append(g["summary"] + "\n")

        md.append("### Build order\n")
        md.append("| Phase | Building | Faction name | Priority | Note |")
        md.append("|---|---|---|---|---|")
        for phase, short_id, prio, note in sorted(g["build_order"], key=lambda r: (r[0], PRIO_RANK[r[2]])):
            md.append(f"| {phase} | `{short_id}` | **{buildings[short_id]}** | {prio} | {note} |")
        for short_id, prio, note in g["building_traps"]:
            md.append(f"| — | `{short_id}` | **{buildings[short_id]}** | {prio} | {note} |")
        md.append("")

        md.append("### Law priorities\n")
        md.append("| # | Law | Priority | Effect (game text) | Why |")
        md.append("|---:|---|---|---|---|")
        all_laws = [(n, p, note, "top") for n, p, note in g["laws_top"]] + \
                   [(n, p, note, "trap") for n, p, note in g["laws_traps"]]
        for n, prio, note, _ in sorted(all_laws, key=lambda r: (PRIO_RANK[r[1]], r[0])):
            l = laws[n]
            desc = l["desc"].split("\n", 1)[0]
            md.append(f"| {n} | **{l['name']}** | {prio} | _{desc}_ | {note} |")
        md.append("")

        # JS payload
        payload_factions.append({
            "id": fid,
            "name": fname,
            "summary": g["summary"],
            "buildOrder": [
                {"phase": phase, "shortId": sid, "name": buildings[sid], "priority": prio, "note": note}
                for phase, sid, prio, note in g["build_order"]
            ],
            "buildingTraps": [
                {"shortId": sid, "name": buildings[sid], "priority": prio, "note": note}
                for sid, prio, note in g["building_traps"]
            ],
            "lawsTop": [
                {"num": n, "name": laws[n]["name"], "desc": laws[n]["desc"], "priority": prio, "note": note}
                for n, prio, note in g["laws_top"]
            ],
            "lawsTraps": [
                {"num": n, "name": laws[n]["name"], "desc": laws[n]["desc"], "priority": prio, "note": note}
                for n, prio, note in g["laws_traps"]
            ],
        })

    md.append("---\n")
    md.append(
        f"*Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} by "
        f"`catalog/scripts/build_faction_guides.py`. Edit the `GUIDES` dict to update.*\n"
    )

    OUT_MD.write_text("\n".join(md), encoding="utf-8")
    print(f"wrote {OUT_MD}  ({len(md)} lines)")

    js_payload = {
        "FACTIONS": payload_factions,
        "UNIVERSAL_TIPS": [{"title": t, "body": b} for t, b in UNIVERSAL_TIPS],
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_faction_guides.py — do not edit by hand */\n"
    js += "window.OE_GUIDES_DATA = " + json.dumps(js_payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")


if __name__ == "__main__":
    build()
