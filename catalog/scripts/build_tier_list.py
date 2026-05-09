"""Tournament/Exodus hero tier list — editorial source of truth.

Holds tier assignments + rationales as a Python literal, then emits:
  - catalog/out/tournament_tier_list.md   (readable markdown)
  - docs/tier-data.js                     (window.OE_TIER_DATA for the SPA)

Single-hero PvP, Exodus-flavored. Sources:
  - notes-from-videos.md (creator commentary, multiple videos)
  - docs/data.js (hero stats / starting army / specs)
  - catalog/out/{hero_score, tier_list, heroes_starting_skills}.md

Tiers:
  S = perma-pick or perma-ban — top of every draft.
  A = strong contested pick when S-tier is gone.
  B = situational / playable / format-dependent.
  C = avoid for single-hero Exodus.

`derived = True` means the call is *data-only* (no creator endorsement);
`derived = False` means at least one video commentator named the hero.
"""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_JS = ROOT / "docs" / "data.js"
OUT_MD = ROOT / "catalog" / "out" / "tournament_tier_list.md"
OUT_JS = ROOT / "docs" / "tier-data.js"


# --------------------------------------------------------------------------- #
# Faction strategy summaries
# --------------------------------------------------------------------------- #

FACTION_META = {
    "temple": {
        "summary": (
            "Strong T1/T2 ranged base (Crossbowman → Austringer double-shot, then Lightweaver buffs). "
            "Generally noob-friendly. Tournament gameplan: stack Austringers, build mage guild for "
            "Daylight buffs (Bless, Riposte, Radiant Armor), aim for double-built Angels by week 1."
        ),
        "creature_tip": "T1 Crossbowman/Austringer is your early-game carrier. Sun's Aegis 1-stacks reduce range damage by 30%.",
    },
    "necropolis": {
        "summary": (
            "Deepest hero roster in the game — even after 3 bans you'll still get an S/A pick. "
            "Skeleton Archers + Liches (Rewind Death) + Dread Knights are the core. "
            "The Undead Transformer is the strongest single building in tournament play — convert "
            "Pandora's Box rewards into your own elite units."
        ),
        "creature_tip": "Skeleton Archers split into 1-stacks farm focus; Liches resurrect via Rewind Death; Dread Knights → Avatar of War double-strike.",
    },
    "sylvan": {
        "summary": (
            "Grove (formerly Sylvan). T1 Fawn Archer (Sharpshooter), T2 Dusk Hoplite (free +3 spell power "
            "via Bloom), T4 Murmurmancer (re-cast spellbook). Avatar Vomit + Thaumaturgy double-cast is "
            "the bread-and-butter late-game combo. The Grove law tree is widely panned ('the most "
            "dogshit law tree') outside a handful of unit-specific picks."
        ),
        "creature_tip": "Fawn Archer doom-stacks clear maps; Dusk Hoplite 1-stacks generate infinite spell power; Murmurmancer enables triple-cast turns.",
    },
    "hive": {
        "summary": (
            "Worst early game in the game — slow, clunky, no native ranged unit. Win condition lives in "
            "Tier 5 Reavers (Maniacal — extra turn on kill) or Tier 6 Worms (corpse-eating revive). Strategy: "
            "bypass low-tier dwellings, rush Apex by end of week 1, abuse Heroic Strike or Worm corpse "
            "mechanic to survive creeping. Egg/larvae summons scale off total army HP — Rock Lobsters in the "
            "stack make swarms hit much harder."
        ),
        "creature_tip": "Reaver Wait-trick stacks two turns at round boundary; Hornet wait-trick is the same at T3; eggs hatch instantly when cast at end-of-round.",
    },
    "schism": {
        "summary": (
            "Expensive faction with a brutal tech tree (Arbitrators require Riders → Bewitchers → Arbitrators). "
            "Power stack is T4 Grand Shoth + Summoning Rite (sacrifice T2/T3 cultist meatshields to make more "
            "Grand Shoths). Bloated Arbitrators are arguably the single best T6 unit in the game (pure damage, "
            "blocks enemy spellbook). Communion mechanic + 'Abyss Stares Back' law is mandatory in Exodus."
        ),
        "creature_tip": "Stinging Rashoth is the early-game carrier; demon-farm cultists into Grand Shoths; 1-stack a Bewitcher to lock enemy hero out of focus.",
    },
    "dungeon": {
        "summary": (
            "Phenomenally strong in single-hero PvP — top picks are 'perma-ban or perma-pick' tier. "
            "Onyx Dancer 1-stacks strip defense (-2/hit), Minotaur Lord parry, Medusa Sculptor petrification, "
            "Chthonic Hydra regen, Black Dragon spell immunity. Every fighting style has a dedicated law that "
            "1.5×s its damage — those laws are mandatory."
        ),
        "creature_tip": "Onyx Dancer 1-stacks for defense debuffs, Aureate dancer upgrade for 2/hit; Minotaurs love morale; Black Dragon over Ashen for higher initiative.",
    },
}


# --------------------------------------------------------------------------- #
# Hero tier assignments
# --------------------------------------------------------------------------- #
# Format: (hero_id, tier, derived, note)
# Note format: 1-3 sentences. Cite "(video)" for verdict from notes-from-videos.md,
# "(data)" for data-only inference. Disagreements get "video; conflicts:" prefix.

HEROES_TIERS = [
    # ---------------- TEMPLE ---------------- #
    ("human_hero_11", "S", False,
     "Pip — most picked/banned Temple hero. Insight + extra attribute every 2 levels makes him a "
     "flexible canvas: pivot to Avatar summoner, Daylight caster, or Might/Offense based on map roll. "
     "He is *the* stock-standard Temple hero."),
    ("human_hero_9", "S", False,
     "Old Lord Mandall — Heroic Strike specialist, +10% damage amp debuff on hit. Self-sufficient: "
     "even if the army bleeds out, his damage carries late game. Pairs with Inspiring Strike for chain-resets."),
    ("human_hero_4", "A", False,
     "Kestrel — strong early tempo. Offense start unlocks Archery sub-skill quickly; doubles down on a "
     "dominant T2 Crossbowman → Austringer (double-shot) ranged stack. Targets Swashbuckler subclass."),
    ("human_hero_8", "A", False,
     "Lord Edgar — Tazar-style: gives 20% of his Attack/Defense to your units. Best on slow templates "
     "going for late-game doom-stacks; weaker on shorter Exodus."),
    ("human_hero_10", "B", False,
     "Merry Elias — +1 spell cap for global map spells, huge mana pool. *Top hero in the game* on Vendetta "
     "(double Dimension Door day 1) but middle-of-pack on standard Exodus where early control matters more."),
    ("human_hero_13", "B", False,
     "Lia the Untethered One — Daylight specialist; can cast Daylight without locking out other schools "
     "and prevents the enemy from casting Daylight at all. Niche counter-pick into Temple mirror."),
    ("human_hero_1", "B", False,
     "Ister — Logistics specialist. Strong only on the Sprint template (road-movement bonuses); "
     "outshined by Pip/Mandall everywhere else."),
    ("human_hero_3", "B", False,
     "John Johnson — videos disagree: one creator calls him a feared 'swordsman spam' steamroller, the "
     "dedicated Temple guide labels him a 'newbie trap'. Probably playable but nothing special; lean situational."),
    ("human_hero_15", "B", True,
     "Vesper — Daylight Magic start, 'Blessing' specialty. Bless is the T1 +35% damage spell; a Bless "
     "specialist scales the entire army. Underrated but uncited (data)."),
    ("human_hero_17", "B", True,
     "Nadir — Nightshade Magic start, 'Heart of Hearts'. Could lock enemy from Nightshade in Necro/Dungeon "
     "matchups (similar pattern to Lia for Daylight). No video corroboration (data)."),
    ("human_hero_5", "B", True,
     "Aeos the Exalted — Leadership start (Swashbuckler subclass head-start). Generic might hero with no "
     "spec hook called out by creators (data)."),
    ("human_hero_2", "B", True,
     "Leon Sticky-Fingers — Pathfinder/Scouting. Solid utility might hero, no creator endorsement (data)."),
    ("human_hero_16", "B", True,
     "Anastasia the Meek — Thaumaturgy start (the double-cast school). Universal upside for any caster "
     "build, but no specific video coverage (data)."),
    ("human_hero_14", "C", True,
     "Julius — Resistance + 'Compassionate Healer'. Heads toward Ascendant subclass but no creator buzz; "
     "Resistance start is unusually defensive for tournament tempo (data)."),
    ("human_hero_12", "C", False,
     "Zenith — Lightweaver specialist. The Hive draft-bans video flags 'auto-ban the lightweaver hero' as a "
     "format trap (RNG-heavy buff cycling). Picking her into a competent opponent is risky."),
    ("human_hero_7", "C", False,
     "Keandra — Cavalry start; cavalry is widely called 'too clunky to spawn with' for single-hero Exodus."),
    ("human_hero_6", "C", False,
     "Heretic Avis — explicitly called 'filler' in the Temple roundup; no clear plan."),
    ("human_hero_18", "C", False,
     "Clarissa — explicitly called 'weak economy' pick; her gold spec doesn't compensate for the lost combat tempo."),

    # ---------------- NECROPOLIS ---------------- #
    ("necro_hero_1", "S", False,
     "Bulwark — 'King of Tanks'. Armor specialty + units take less damage = nearly unbleedable creep early. "
     "Often straight-up banned in drafts."),
    ("necro_hero_3", "S", False,
     "Onkos — Skeleton specialist: +2 growth, +Speed/Init/HP on Skeletons. Upgrade to Skeleton Archers and "
     "you have the strongest T1 ranged power-stack in the game very early. Starts with Offense for Archery sub-skill."),
    ("necro_hero_4", "S", False,
     "Kel'Ghul — 'best Necropolis hero for strict 1v1 PvP'. Dread Knight specialist with rare +2 growth (most "
     "tier specialists give +1). Starts with 2-3 Dread Knights — clears early biomes with zero losses."),
    ("necro_hero_7", "A", False,
     "Marl — Masterful Web slows the *entire* enemy army (HoMM3 Expert Slow). S-tier on Sprint, A everywhere. "
     "Trivializes ranged-vs-ranged trades and counters fast factions like Hive."),
    ("necro_hero_8", "A", False,
     "Tarius — Necromancy power scales with hero level. Best for slow tournament formats like Exodus where "
     "the game runs long enough to compound the necromancy snowball."),
    ("necro_hero_15", "A", False,
     "Laura — Sorcery + Masterful Despair. Bypasses Despair's normal immunity (undead/constructs/embodiments), "
     "so the AoE damage spell hits everything in PvP — massive utility."),
    ("necro_hero_16", "A", False,
     "Lord Rufus — 'Rewind Life' is busted: temporarily resurrects fallen units as meatshields, letting you "
     "creep with effectively zero permanent losses. Combine with Avatar summon for an unkillable rush."),
    ("necro_hero_14", "A", False,
     "Shadespinner Oona — Nightshade caster who can double-cast Nightshade *and* prevents the enemy hero from "
     "casting it. Locks one of the strongest schools out of the opposing draft."),
    ("necro_hero_6", "A", False,
     "Artorius Veritas — Masterful Berserk in a radius. Punishes the corner-camping ranged 'blob' meta — "
     "forces experienced players off their best deployment. Frequent ban."),
    ("necro_hero_17", "A", False,
     "Funerella — Necromancer answer to Tarius. Starts with Necromancy L2 and is the go-to when you need "
     "more Knowledge in the build."),
    ("necro_hero_18", "B", False,
     "Milossa the Golden — passive gold generation for tight tournament economies. Lets you build greedier "
     "and afford the full week's recruits before the duel."),
    ("necro_hero_12", "B", True,
     "Ethric — Wisdom start, ships with 3-4 Liches in starting army. Liches are the faction sustain "
     "carry — starting with them is unusually strong (data, not video-cited)."),
    ("necro_hero_5", "B", True,
     "Natalida — Pet/Barghest specialist with 30 starting Pets. T3 unit specialization is weaker than T1 archer "
     "or T6 specs but useful for early creeping (data)."),
    ("necro_hero_10", "B", True,
     "Mag — Arcane Magic start. Arcane gives access to Blink and other utility spells (data)."),
    ("necro_hero_13", "B", True,
     "Guildmaster Klastor — Luck on a magic hero (unusual). Starts with 2 stacks of Graverobbers (data)."),
    ("necro_hero_2", "C", True,
     "King-of-Kings — Diplomacy start. Diplomacy's 'Assemble' is built for multi-hero shuffling — same trap "
     "that disqualifies Ilwara from single-hero play (data, by analogy)."),
    ("necro_hero_9", "C", True,
     "Zam — generic Battlecraft 'Alchemist'. No spec hook for tournament. (data)."),
    ("necro_hero_11", "C", True,
     "Adahn — Recruitment-locked spec, low impact (data)."),

    # ---------------- GROVE / SYLVAN ---------------- #
    ("nature_hero_15", "S", False,
     "Halon — instant ban. Starts with Chain Lightning (T4 Primal); his Masterful spec means it loses only "
     "25% per bounce instead of 50%. Insane early tempo and map-clear."),
    ("nature_hero_17", "S", False,
     "Sullie — Avatar specialist; her Avatar is immune to magic damage. The 0-mana Avatar drop is the "
     "current meta absorber/damage-dealer. Broken early-to-mid game."),
    ("nature_hero_9", "S", False,
     "Aunt Daliar — Insight start + Civic Innovation law combo blasts you down the law tree faster than "
     "any opponent. Heavily prioritized in drafts."),
    ("nature_hero_11", "S", False,
     "Elder Tss'kish ('Tree Pimp') — Thaumaturgy + Herbomancer buff specialty. Late-game double/triple-cast "
     "engine; clears Pandora boxes with ease via Bee + spell stacking."),
    ("nature_hero_2", "A", False,
     "Gorel Spearhead — Offense specialist. Ranged/melee/long-reach attacks all scale with level. The "
     "reliable fallback when S-tier is banned out."),
    ("nature_hero_3", "A", False,
     "Gingertail — ultimate Fawn tempo hero. Starts with 3 Fawn stacks + Init/HP buff; in Exodus you can "
     "amass 100+ Fawn Warriors and curb-stomp the early map."),
    ("nature_hero_7", "A", False,
     "Faleor — Master Fireball specialist (sleeper pick). Advanced Murmuring start gives free Child of the "
     "Woods (+30 mana cap) — Dusk Hoplite combo nukes the early map."),
    ("nature_hero_18", "A", False,
     "The Minstrel — top morale-focused pick. Innate focus charges + crowd control; thrives in fast tournament "
     "formats."),
    ("nature_hero_10", "A", False,
     "Vatawna — *S-tier on Vendetta* (DD twice on day 1) but middle-of-pack on Exodus. Ranking reflects Exodus."),
    ("nature_hero_5", "B", False,
     "Octavia — Luck specialist; pairs with Nature's Wildness + Luck of the Fittest law combo for crit-heavy "
     "damage builds."),
    ("nature_hero_14", "B", False,
     "Vim — chain-lightning attack pattern, 2-turn cooldown. Solid utility, not a centerpiece pick."),
    ("nature_hero_4", "B", False,
     "Old Pilgrim — best as a late-game elite-killer with magic damage. Slow start hurts in Exodus."),
    ("nature_hero_12", "B", True,
     "Aeliniel — Primal Magic 'Tempered Embers'. Likely fire/ember caster, similar to Faleor archetype but "
     "uncited (data)."),
    ("nature_hero_13", "B", True,
     "Glacia — Primal 'Ice Bolt' spec. Single-target primal damage, no creator endorsement (data)."),
    ("nature_hero_16", "B", True,
     "Echolily — Arcane Magic + 'Murmuring Copy'. Could enable Murmurmancer combos but no video hook (data)."),
    ("nature_hero_1", "C", True,
     "Eith — generic Pathfinder/Scouting. No spec edge in tournament tempo (data)."),
    ("nature_hero_6", "C", True,
     "Mreowa — Sorcery on a might/Beastmaster hero. Hybrid that doesn't lean into Grove's main archetypes (data)."),
    ("nature_hero_8", "C", True,
     "Alluring Sh'a — Diplomacy/Charismatic. Same Assemble-trap concern as Ilwara/King-of-Kings for single hero (data)."),

    # ---------------- HIVE ---------------- #
    ("demon_hero_2", "S", False,
     "Maelstrom — undisputed best Hive hero. Reaver specialist with Insight; spawns with 2-3 Reavers, solving "
     "Hive's miserable early game. Your Maniacal Reaver chains will close out Exodus."),
    ("demon_hero_4", "S", False,
     "Zoran the Self-Founded — Worm specialist; starts with 2 Worms whose Corpse Eater ability heals & revives. "
     "Makes Hive's brutal early creeping survivable."),
    ("demon_hero_9", "S", False,
     "Abigor, Duke of Battle — +1 hex tactics deploy + units gain +1 init per 6 hero levels. By L18 your whole "
     "army deploys in the enemy's face with +3 init = alpha-strike their ranged blob. Frequent ban."),
    ("demon_hero_5", "A", False,
     "Curson, Duke of Rage — top zero-loss creep with Heroic Strike chains (Effortless Strike makes it free, "
     "Confusing Strike removes counter-attack). *Conflicts:* one Hive guide says avoid because Heroic Strike "
     "competes with Summon Swarm focus economy. Strong on creeping, dependent on build path."),
    ("demon_hero_15", "A", False,
     "Mila — Masterful Haste lets you haste the whole army turn 1, closing the melee gap that defines Hive's "
     "weakness. Solves the 'we can't reach them' problem."),
    ("demon_hero_16", "A", False,
     "Oriax — Summon Avatar starter, 'Here and There' (likely Blink) spec. Matches the 'Allesnorn' archetype "
     "described in videos: blink enemy units into your blob and feast. Avatar + Blink combo is top-tier."),
    ("demon_hero_3", "B", False,
     "Nor — Battlecraft start, gains extra attribute on level. Fan favorite but Battlecraft start isn't optimal."),
    ("demon_hero_6", "B", False,
     "Tavi — Larva specialist. Only viable on long, army-heavy templates where the Larva stack scales to "
     "self-sufficiency. Format-dependent."),
    ("demon_hero_13", "B", True,
     "Leira — Battle Magic start with 3 stacks of Hornets (3-5 each). Hornet 1-stack init manipulation matches "
     "the late-round Wait trick (data)."),
    ("demon_hero_7", "B", True,
     "Lo — Defense start, ships with 3 Locust stacks. Locusts are the early-game power stack; triple-stacking "
     "them gives tactical flexibility (data)."),
    ("demon_hero_17", "B", True,
     "Khariseth — Primal Weaving. Primal damage-dealer Hive caster; possible match for the unidentified 'Dro' "
     "build mentioned in one Hive guide (data)."),
    ("demon_hero_14", "B", True,
     "Groo — Wisdom start, 'Son of All Mothers'. Wisdom is universally good for caster development (data)."),
    ("demon_hero_12", "B", True,
     "Bathym, Duke of Jewels — Economy/Charming Shine. Solid greedy pick if your map has good gem nodes (data)."),
    ("demon_hero_1", "C", False,
     "Niev ('Naev') — Offense specialty doesn't sustain Hive's fragile early army; explicitly called out as "
     "'doesn't do enough' in the Hive ranking video."),
    ("demon_hero_8", "C", False,
     "Goldentongue ('Golden Tongue') — Morale specialist. Morale specialists thrive with shooters; Hive lacks "
     "early ranged units, so the kit doesn't fit."),
    ("demon_hero_10", "C", True,
     "Fleu — Logistics/Wayfarer; generic mage, no spec hook for tournament combat (data)."),
    ("demon_hero_11", "C", True,
     "Xirr — Resistance/elements; no spec hook (data)."),
    ("demon_hero_18", "C", True,
     "Pauper — 'Flea Bites' is a low-impact effect spec; unsupported by creator commentary (data)."),

    # ---------------- SCHISM ---------------- #
    ("unfrozen_hero_13", "S", False,
     "The Eye Collective — 'one of the absolute best heroes in the faction'. Starts with 2 Grand Shoth stacks "
     "(T4 power unit) AND Summon Avatar. Massive early tempo with a clear Grand-Shoth doom-stack target."),
    ("unfrozen_hero_10", "S", False,
     "Grellekh the Betrayer — incredible offense tempo. Offense start → Shadow Blades adds +1 base damage, "
     "which is ~50% damage increase for your weak T1 Rashoth shooters. Perfect Schism opener."),
    ("unfrozen_hero_11", "A", False,
     "Icequeen Hel'Ghat — Armor specialist; oppressive synergy with Communion (bleed shadow army then absorb "
     "what would kill the real one). Durable early game."),
    ("unfrozen_hero_8", "A", False,
     "Changeling Urgo — Summon Avatar specialist. Free 0-mana Avatar with a barrier scales hard with the "
     "Schism mage's spell-power-heavy stat distribution."),
    ("unfrozen_hero_1", "B", False,
     "Nihil — Logistics specialist. Pick *only* when the tempo heroes (Eye, Grellekh, Hel'Ghat, Urgo) are all "
     "banned out — early clearing is harder without combat stats."),
    ("unfrozen_hero_6", "B", True,
     "The Iron Master — Resistance + 'Leash of Chains', starts with 2-3 Concubus. Concubus utility (Mistress of "
     "Chains, Bewitcher) is huge — having early access matters (data)."),
    ("unfrozen_hero_5", "B", True,
     "Mara Mat'ha — Coldblood Siblings, starts with 3 stacks of Aga'Shoth Riders. Riders are mainly demon-farm "
     "fuel but the volume helps early creeping (data)."),
    ("unfrozen_hero_2", "B", True,
     "Blackhorn — Sorcery on a might Frostlord. Hybrid build with damage spells; no creator coverage (data)."),
    ("unfrozen_hero_18", "B", True,
     "Dhüvri — Communion L2 starter. Faction's gimmick from turn 1; quietly strong (data)."),
    ("unfrozen_hero_17", "B", True,
     "Sister Keiri — Nightshade Magic. Schism + Nightshade is potent (Twilight, Naira's Kiss); no specific "
     "video endorsement but the archetype is strong (data)."),
    ("unfrozen_hero_4", "B", True,
     "Jänhei — Wisdom start with 3 Cultist stacks. Wisdom is broadly good; Cultist meatshield volume fuels "
     "Summoning Rite demon-farm (data)."),
    ("unfrozen_hero_3", "B", True,
     "Matastala the White — Tactics start. Tactics is mediocre on Schism (Communion mechanic dominates), but "
     "deploys forward (data)."),
    ("unfrozen_hero_16", "B", True,
     "Ra'Davok — Arcane Magic; access to Blink, useful but not signature (data)."),
    ("unfrozen_hero_7", "C", True,
     "Wal'kha — Primal Magic on a might hero. Hybrid that doesn't lean into Schism's strengths (data)."),
    ("unfrozen_hero_9", "C", True,
     "Martyr Tho — Daylight Magic on might. Daylight isn't a Schism strength, and the spec doesn't cover the gap (data)."),
    ("unfrozen_hero_14", "C", True,
     "Tölketh — Logistics; generic mage (data)."),
    ("unfrozen_hero_15", "C", True,
     "Ulkuth — Scouting; generic (data)."),
    ("unfrozen_hero_12", "C", True,
     "Kwinri — Recruitment-locked spec, low ceiling (data)."),

    # ---------------- DUNGEON ---------------- #
    ("dungeon_hero_13", "S", False,
     "Motley ('Mley') — top-3 hero in the entire game. Onyx Dancer specialist + starts with Twilight (Nightshade) "
     "= shuts down ranged units completely. Auto-ban in PvP."),
    ("dungeon_hero_18", "S", False,
     "Lodos — top-tier; starts with Sleep. One sleep on a 180-strong archer stack week 2 ends the fight. "
     "Also denies the opponent Nightshade. Frequent ban."),
    ("dungeon_hero_3", "S", False,
     "Stinger — Combat starter; heroic strikes hit +10 damage AND apply stacking poison. Devastating for "
     "early creep, scales late. Heavily banned."),
    ("dungeon_hero_16", "S", False,
     "Typhona — Hydra (T6) specialist with 2 Hydras at start. Tier 6 power on day 1 = trivializes early biomes. "
     "Top ban/pick."),
    ("dungeon_hero_6", "A", False,
     "Devir, son of Devir ('D'vir') — Minotaur specialist. Leadership start + 2 Minotaur stacks = Day 1 Minotaur "
     "doom build. Highly contested."),
    ("dungeon_hero_4", "A", False,
     "Kieran — Troglodyte specialist with 3 stacks of Trogls (54-72 total). T1 trogl carry build; falls off late "
     "but in tournament you may not need late."),
    ("dungeon_hero_1", "A", False,
     "Enatee ('Enati') — Medusa specialist with +1 town growth and 3-4 Medusas at start. Medusa Sculptor is "
     "arguably the strongest unit in the faction; less reliant on map RNG to scale."),
    ("dungeon_hero_10", "A", False,
     "Kelarr, son of Navarr — Insight/Learning specialist; gains bonus attributes and XP. Flexible 'react to "
     "what you find' pick when the elites are banned."),
    ("dungeon_hero_11", "A", False,
     "Zakron the Great — Sorcery; reduces enemy spell damage, boosts own. Dragon Stance synergy — 200+ damage "
     "Fireballs by day 1-2 is the gem-in-the-rough call."),
    ("dungeon_hero_12", "B", True,
     "Sister Deira — Thaumaturgy starter (the double-cast school). Universal upside for any caster build (data)."),
    ("dungeon_hero_17", "B", True,
     "Sunny Rauktol — Daylight Magic specialist. Like Lia for Temple, can lock enemy out of Daylight (data)."),
    ("dungeon_hero_5", "B", True,
     "Mouaren — Scouting start, 3 stacks of Infiltrators. Infiltrator 1-stacks remove enemy retaliation; "
     "starting with three is unusually flexible (data)."),
    ("dungeon_hero_2", "B", True,
     "Tellaris the Betrayed — Battlecraft start. Heads toward Paragon-equivalent subclass (data)."),
    ("dungeon_hero_8", "B", True,
     "Rhea — Luck spec on might. Solid filler if S/A all banned (data)."),
    ("dungeon_hero_7", "B", True,
     "Creta, daughter of Navarr — Economy/Gem Seeker. Greedy pick for long Exodus games (data)."),
    ("dungeon_hero_9", "B", True,
     "Gleard the Grey — Arcane Magic on a might hero. Hybrid (data)."),
    ("dungeon_hero_15", "C", True,
     "Glastor — Economy mage, generic (data)."),
    ("dungeon_hero_14", "C", False,
     "Ylwari ('Ilwara') — Diplomacy/Assemble kit. Explicitly called 'practically useless in single hero mode' — "
     "her abilities shuffle armies between heroes."),
]


# --------------------------------------------------------------------------- #
# Cross-faction draft guide
# --------------------------------------------------------------------------- #

OPENING_PICKS = [
    ("Avatar + Thaumaturgy",
     "Any hero that can pair Summon Avatar with Thaumaturgy double-cast is a top-tier build. The Avatar tanks "
     "retaliation, ties up enemy ranged units, and bait-baits the AI. Sullie (Grove), Changeling Urgo (Schism), "
     "Oriax (Hive), and Pip (Temple, by drafting into it) all enable this archetype."),
    ("T1 archer doom-stack",
     "Factions that start with strong T1 ranged units — Temple (Crossbowman/Austringer), Necropolis (Skeleton "
     "Archer via Onkos), Grove (Fawn Archer), Schism (Stinging Rashoth via Grellekh) — farm Pandora boxes for "
     "100+ archer stacks that trivialize mid-game breakthroughs."),
    ("Heroic-strike chains",
     "Combat → Effortless Strike → Confusing Strike makes Heroic Strike free *and* counter-attack-removing. "
     "Curson (Hive), Stinger (Dungeon), Mandall (Temple), Artorius (Necropolis) live on this engine."),
    ("Masterful starting spell",
     "Heroes starting with a Masterful version of a key spell skip 5-10 levels of scaling. Halon (Chain "
     "Lightning), Marl (Web), Mila (Haste), Motley (Twilight), Lodos (Sleep), Artorius (Berserk), Lord Rufus "
     "(Rewind Life) all qualify."),
    ("Tier 6+ on day 1",
     "Some heroes start with a T6+ unit, letting you clear neutral camps with zero losses immediately: "
     "Kel'Ghul (Dread Knights, T6), Typhona (Hydras, T6). Big advantage in week 1."),
]

TOP_BANS = [
    # (hero_id, why-it-gets-banned)
    ("dungeon_hero_13", "Motley shuts down all ranged units via Twilight. Single-handedly invalidates 4 of 6 factions' early plans."),
    ("nature_hero_15",  "Halon's Masterful Chain Lightning loses only 25%/bounce — early-game tempo bomb you cannot keep up with."),
    ("necro_hero_4",    "Kel'Ghul starts with T6 Dread Knights and the only +2-growth tier specialty in the game."),
    ("nature_hero_17",  "Sullie's magic-immune Avatar is the dominant absorber/dealer in the current Avatar meta."),
    ("dungeon_hero_3",  "Stinger's poisoned heroic strikes are toxic to fight; she creeps faster than any other might hero."),
    ("dungeon_hero_16", "Typhona's 2 starting Hydras (T6) clear early biomes flawlessly."),
    ("necro_hero_1",    "Bulwark's defensive specialty makes Necropolis nearly unbleedable early."),
    ("necro_hero_6",    "Artorius Veritas's Masterful Berserk dismantles the corner-camping ranged blob meta."),
    ("demon_hero_9",    "Abigor's +1 hex deploy + scaling init lets him alpha-strike the opponent's back line by L18."),
    ("dungeon_hero_18", "Lodos's starting Sleep ends week-2 fights instantly."),
]


# --------------------------------------------------------------------------- #
# Build
# --------------------------------------------------------------------------- #

def load_heroes_from_data_js() -> dict[str, dict]:
    """Crude regex-based parse of HEROES array from data.js."""
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const HEROES = (\[.*?\]);", text, re.DOTALL)
    if not m:
        raise RuntimeError("could not locate const HEROES = [...] in data.js")
    arr = json.loads(m.group(1))
    return {h["id"]: h for h in arr}


def load_factions_from_data_js() -> list[dict]:
    text = DATA_JS.read_text(encoding="utf-8")
    m = re.search(r"const FACTIONS = (\[.*?\]);", text, re.DOTALL)
    return json.loads(m.group(1))


TIER_ORDER = ["S", "A", "B", "C"]


def build():
    heroes = load_heroes_from_data_js()
    factions = load_factions_from_data_js()
    faction_by_id = {f["id"]: f for f in factions}

    # Sanity: every tier entry must reference a known hero
    seen_ids = set()
    for hid, _, _, _ in HEROES_TIERS:
        if hid not in heroes:
            raise RuntimeError(f"unknown hero id in tier list: {hid}")
        if hid in seen_ids:
            raise RuntimeError(f"duplicate tier entry for {hid}")
        seen_ids.add(hid)
    missing = set(heroes) - seen_ids
    if missing:
        raise RuntimeError(f"heroes missing from tier list: {sorted(missing)}")

    # Group by faction in display order, sort by tier then might-before-magic then id
    by_faction: dict[str, list[dict]] = {f["id"]: [] for f in factions}
    for hid, tier, derived, note in HEROES_TIERS:
        h = heroes[hid]
        by_faction[h["faction"]].append({
            "id": hid,
            "name": h["name"],
            "kind": h["kind"],
            "specialty": h["specialty"],
            "skills": h["skills"],
            "army": h["army"],
            "armyScore": h.get("armyScore"),
            "tier": tier,
            "derived": derived,
            "note": note,
        })
    for fid in by_faction:
        by_faction[fid].sort(
            key=lambda r: (TIER_ORDER.index(r["tier"]),
                           0 if r["kind"] == "might" else 1,
                           r["id"])
        )

    # ------------ markdown ------------ #
    md_lines: list[str] = []
    md_lines.append("# Tournament / Exodus hero tier list — single hero PvP\n")
    md_lines.append(
        "Per-faction tier list for single-hero PvP on tournament templates "
        "(Exodus-flavored, ~45 min matches, week-3 breakthrough). "
        "Sources: creator commentary in `notes-from-videos.md`, plus extracted hero/spec/army data.\n"
    )
    md_lines.append(
        "**Scale.** **S** = perma-pick or perma-ban; **A** = strong contested pick; "
        "**B** = situational / playable / format-dependent; **C** = avoid.\n"
    )
    md_lines.append(
        "**Provenance.** A `(data)` tag on a verdict means the call is *uncited* — derived from extracted data "
        "(starting army, spec, skill mix) without video corroboration. Treat those as informed guesses, not meta consensus.\n"
    )
    md_lines.append(
        "**Caveats.** A few hero names in the videos are localizations/early-access aliases of in-game names — "
        "this list resolves them to the in-game `name` field in `data.js`. Where creators disagreed, the conflict is noted inline.\n"
    )

    # Draft guide
    md_lines.append("## Draft strategy\n")
    md_lines.append("### Top 10 ban list\n")
    md_lines.append("| # | Hero | Faction | Why ban |")
    md_lines.append("|---:|---|---|---|")
    for idx, (hid, why) in enumerate(TOP_BANS, 1):
        h = heroes[hid]
        fac_name = faction_by_id[h["faction"]]["name"]
        md_lines.append(f"| {idx} | **{h['name']}** | {fac_name} | {why} |")
    md_lines.append("")

    md_lines.append("### Opening-pick archetypes\n")
    for title, body in OPENING_PICKS:
        md_lines.append(f"- **{title}.** {body}")
    md_lines.append("")

    # Per-faction
    md_lines.append("## Per-faction tier lists\n")
    for f in factions:
        fid = f["id"]
        meta = FACTION_META.get(fid, {})
        md_lines.append(f"### {f['name']} ({f['might']} / {f['magic']})\n")
        if meta.get("summary"):
            md_lines.append(meta["summary"] + "\n")
        if meta.get("creature_tip"):
            md_lines.append(f"*Creature tip:* {meta['creature_tip']}\n")
        # Group rows by tier
        rows = by_faction[fid]
        for tier in TIER_ORDER:
            tier_rows = [r for r in rows if r["tier"] == tier]
            if not tier_rows:
                continue
            md_lines.append(f"#### Tier {tier}\n")
            md_lines.append("| Hero | Class | Specialty | Starting army | Note |")
            md_lines.append("|---|---|---|---|---|")
            for r in tier_rows:
                klass = f["might"] if r["kind"] == "might" else f["magic"]
                derived_tag = " *(data)*" if r["derived"] else ""
                # Strip the leading "Hero —" prefix from notes since the table already shows the name,
                # and drop bare "(data)" mentions inside the prose since the trailing tag handles it.
                note = re.sub(rf"^{re.escape(r['name'].split()[0])}[^—]*—\s*", "", r["note"])
                note = re.sub(r"\s*\(data\)\s*\.?", ".", note).rstrip(". ").rstrip(".") + "."
                if note:
                    note = note[0].upper() + note[1:]
                md_lines.append(
                    f"| **{r['name']}** | {klass} ({r['kind']}) | {r['specialty']} | "
                    f"{r['army']} | {note}{derived_tag} |"
                )
            md_lines.append("")

    md_lines.append("---\n")
    md_lines.append(
        f"*Generated {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')} by "
        f"`catalog/scripts/build_tier_list.py`. Edit the script's `HEROES_TIERS` list to update.*\n"
    )

    OUT_MD.write_text("\n".join(md_lines), encoding="utf-8")
    print(f"wrote {OUT_MD}  ({len(md_lines)} lines)")

    # ------------ JS ------------ #
    js_payload = {
        "FACTIONS": [{"id": f["id"], "name": f["name"], "might": f["might"], "magic": f["magic"]} for f in factions],
        "FACTION_META": FACTION_META,
        "TOP_BANS": [
            {
                "id": hid,
                "name": heroes[hid]["name"],
                "faction": heroes[hid]["faction"],
                "factionName": faction_by_id[heroes[hid]["faction"]]["name"],
                "why": why,
            }
            for hid, why in TOP_BANS
        ],
        "OPENING_PICKS": [{"title": t, "body": b} for t, b in OPENING_PICKS],
        "BY_FACTION": by_faction,
        "GENERATED_AT": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
    }
    js = "/* generated by catalog/scripts/build_tier_list.py — do not edit by hand */\n"
    js += "window.OE_TIER_DATA = " + json.dumps(js_payload, ensure_ascii=False, indent=2) + ";\n"
    OUT_JS.write_text(js, encoding="utf-8")
    print(f"wrote {OUT_JS}  ({len(js):,} bytes)")


if __name__ == "__main__":
    build()
