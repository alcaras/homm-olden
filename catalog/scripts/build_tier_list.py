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
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA_JS = ROOT / "docs" / "data.js"
OUT_MD = ROOT / "catalog" / "out" / "tournament_tier_list.md"
OUT_JS = ROOT / "docs" / "tier-data.js"

# Import sibling editorial source so faction-page and mechanics-page share one
# authoritative copy of each faction's signature mechanic explainer.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_mechanics import FACTION_SIGNATURE_MECHANICS


# --------------------------------------------------------------------------- #
# Faction strategy summaries
# --------------------------------------------------------------------------- #

# Per-faction metadata: summary, creature_tip, army_comp (per-tier picks),
# army_tactics (cross-cutting plays), army_phases (Early 1-2-3 / Mid 1-3-5 /
# Late 1-4-7 fight composition). The signature_mechanic field is hydrated at
# build time from build_mechanics.py FACTION_SIGNATURE_MECHANICS so a single
# authoritative copy serves both the Mechanics page and the Faction page.
FACTION_META = {
    "temple": {
        "summary": (
            "Strong T1/T2 ranged base (Crossbowman → Austringer double-shot, then Lightweaver buffs). "
            "Generally noob-friendly. Tournament gameplan: stack Austringers, build mage guild for "
            "Daylight buffs (Bless, Riposte, Radiant Armor), aim for double-built Angels by week 1."
        ),
        "creature_tip": "T1 Crossbowman/Austringer is your early-game carrier. Sun's Aegis 1-stacks reduce range damage by 30%.",
        "army_comp": [
            ("T1", "Sun's Aegis", "Prefer the Aegis upgrade over Guard Captain. -30% ranged-damage aura adjacent — lets you tank T7 neutrals without losses."),
            ("T2", "Austringer", "Double Shot beats Marksman sharpshooter. The early power-stack for map clearing."),
            ("T3", "Guardian Griffin", "Filler. Loyal Protector counterattacks anyone hitting an adjacent friendly — place next to your shooters."),
            ("T4", "Hierophant 1-stacks / Sun Herald", "Hierophant 1-stacks for spammed speed/init buffs and dispels. Sun Herald upgrade if you want it as a damage stack — passively scales off all friendly buffs."),
            ("T5", "Sunspear Cavalry", "Jousting bonus +5% per hex moved. Heavy armor pen, scales hard with Daylight buffs. (Cavalry is awkward to spawn early — videos warn against rushing T5.)"),
            ("T6", "Inquisitor", "Absolute Resistance (immune to magic) + Unyielding (ignores 30% attack). Clunky but a mathematical gigatank vs caster opponents."),
            ("T7", "Apotheosis", "'Most broken unit in the game.' Insane stats, no melee penalty, aura makes friendlies immune to negative effects. Archangel is the alternate sharpshooter glass-cannon."),
        ],
        "army_tactics": [
            "Daylight buff stack: Bless (+35% dmg) + Riposte (counter before hit) + Radiant Armor (-40% dmg).",
            "Lightweaver/Hierophant 1-stacks spam buffs/dispels every round; Angels passively absorb all buffs cast on friendly units → buffed Angels nuke.",
            "Aim for double-built Angels in week 1 — enables zero-loss clears of T7 dwellings.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "T1 Crossbowman (split into 2-3 stacks, ~50-80 each) + Hierophant 1-stack for buffs. Sun's Aegis 1-stack adjacent to your Crossbowmen for the -30% range aura. Goal: clear early Pandora boxes without losing the T2 archer-blob you're scaling."),
            ("Mid — 1-3-5 fights (week 2)",
             "T2 Austringer doom-stack (Double Shot, 100+ from Pandora-farmed boxes) + Hierophant 1-stack + Sun Herald (T4 upgrade) layered with Bless. Add Sunspear Cavalry if your build went Cavalry. Bless + Riposte combo turns the Austringer line into a self-defending wall."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Apotheosis (T7) is the centerpiece — passively immunizes friendlies to negative effects. Inquisitor (T6) for magic-immune anchor. Austringer base, Sun Herald + Hierophant 1-stack for the Daylight buff cycle (Bless + Radiant Armor + Riposte all up)."),
        ],
    },
    "necropolis": {
        "summary": (
            "Deepest hero roster in the game — even after 3 bans you'll still get an S/A pick. "
            "Skeleton Archers + Liches (Rewind Death) + Dread Knights are the core. "
            "The Undead Transformer is the strongest single building in tournament play — convert "
            "Pandora's Box rewards into your own elite units."
        ),
        "creature_tip": "Skeleton Archers split into 1-stacks farm focus; Liches resurrect via Rewind Death; Dread Knights → Avatar of War double-strike.",
        "army_comp": [
            ("T1", "Skeleton Archer", "T1 ranged carry. +1 flat damage from Drums of War / Shadow Blades = ~50% damage boost. Mass 100+ from Pandora boxes for steamroll."),
            ("T2", "Fantasm", "Squishy but applies a DoT curse that enables late-game spell combos. Win-more, weak in auto-resolve."),
            ("T3", "Barghest", "Fast (-30% melee damage taken). Call of the Pack inflates the stack +25% with temporary units."),
            ("T4", "Kennelmaster", "Marks enemies for max damage (kills your archer variance). Generates Focus on every kill in radius."),
            ("T5", "Sanguine Lich", "Best ranged unit on the roster. Rewind Death resurrects high-tier models including Dread Knights — the faction's sustain engine."),
            ("T6", "Avatar of War (Dread Knight upg)", "Always pick this over Wraith. Double Strike one-shots enemy stacks; permanently steals enemy Attack during combat."),
            ("T7", "Vampire Lord", "13 Initiative, prevents counterattacks, 40% vampirism resurrects mid-trade. The endgame melee gigachad."),
        ],
        "army_tactics": [
            "Skeleton Archer doom-stack (Pandora-box farmed, 100+) trivializes mid-game breaks.",
            "Lich Rewind Death sustains the army indefinitely — never skip the T5 build.",
            "Undead Transformer: drag captured T5/T6/T7 neutrals in, get back Necro equivalents (no morale penalty).",
            "Vampire Lord + Bloodthirst law + Morituri te Salutant law = retaliation loop that resurrects on every counter.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "T1 Skeleton Archer split into 2-3 stacks (Onkos start = ~30-45 from day 1). Fantasm 1-stack for DoT curse application. Barghest melee chaff for fast positioning. Goal: clear T1+T2+T3 camps with Necromancy-raised Skeleton Archers compounding the stack each fight."),
            ("Mid — 1-3-5 fights (week 2)",
             "Skeleton Archer doom-stack (100+ from Pandora) + Kennelmaster 1-stack to mark targets for max damage + Sanguine Lich (T5) for sustain. Rewind Death starts paying for itself. Add Dread Knight (T6) if running Kel'Ghul. Necromantic Energy fully spent each week into more Skeletons."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Avatar of War (T6, Dread Knight upgrade — never Wraith) for double-strike + steal-attack. Vampire Lord (T7) for the vampirism + no-counter retaliation loop (combo with Bloodthirst + Morituri te Salutant laws). Liches still in the back for sustain. Skeleton Archer base remains the volume layer."),
        ],
    },
    "grove": {
        "summary": (
            "Grove (formerly Grove). T1 Faun Archer (Sharpshooter), T2 Dusk Hoplite (free +3 spell power "
            "via Bloom), T4 Murmurmancer (re-cast spellbook). Avatar Vomit + Thaumaturgy double-cast is "
            "the bread-and-butter late-game combo. The Grove law tree is widely panned ('the most "
            "dogshit law tree') outside a handful of unit-specific picks."
        ),
        "creature_tip": "Faun Archer doom-stacks clear maps; Dusk Hoplite 1-stacks generate infinite spell power; Murmurmancer enables triple-cast turns.",
        "army_comp": [
            ("T1", "Faun Archer", "Essential T1 ranged for Pandora-box farming. Tuck in a corner during focus-heavy play."),
            ("T2", "Dusk Hoplite", "Split into 1-stacks for continuous focus generation; Swift Strike = no retaliation. The faction's spell-power engine."),
            ("T3", "(skip)", "Menhir Circle / Iriyad path is widely panned — the Qilin tech route is 'horrendous'. Skip and run Avatar Vomit instead."),
            ("T4", "(skip — go Sporomancer)", "Skip the standard T4 dwelling — instead you want Sporomancer/Murmurmancer below. Mid-tier dwellings are the trap."),
            ("T5", "Sporomancer / Murmurmancer", "Core damage dealer. Bees apply brutal DoT on activation. Murmurmancer can re-cast spellbook (triple-cast turns)."),
            ("T6", "(skip Qilins)", "Thunder Lair / Qilins only viable if committed to Naiads — most Grove builds skip."),
            ("T7", "Phoenix", "Resurrects on death once per battle. Decent late-game finisher but most plans win before T7 lands."),
        ],
        "army_tactics": [
            "Focus-kiting: split Hoplets for turn-1 focus, Sporomancers DoT, Fauns pick from the corner.",
            "Avatar Vomit + Thaumaturgy double-cast is *the* meta archetype.",
            "Tss'kish buffs Herbomancers (speed/init/HP/atk/def). Advanced Murmuring starts you with +2 focus.",
            "Strong Connection law: every focus spend reduces spell cooldown — combos with the Hoplite focus loop.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "T1 Faun Archer split into 2-3 stacks (Gingertail start = 3 stacks day 1) + Dusk Hoplite 1-stacks (focus engine) tucked next to the corner. Skip T3 dwellings entirely. Goal: kite from the corner with Fauns while Hoplites generate focus for the hero's spell book."),
            ("Mid — 1-3-5 fights (week 2)",
             "Faun base + Dusk Hoplite 1-stacks + Sporomancer (T5, your Herbomancer upgrade). Avatar Vomit comes online — Avatar absorbs neutral retaliation while Hoplet focus fuels triple-cast turns from Murmurmancer. Skip the T3/T4 dwelling spend entirely; that gold goes to Mage Guild + walls."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Faun doom-stack + Sporomancer + Murmurmancer (re-cast spellbook) + Phoenix (T7) if you got it. The Avatar tank + Bee DoT + spell volume from a Tss'kish/Sullie-type hero is the win condition. T6 Qilins are still skipped on most builds."),
        ],
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
        "army_comp": [
            ("T1", "Warden Parasite", "On death generates 2 Focus — sacrifice 1-stacks early to feed focus to your power units."),
            ("T2", "Ravager Parasite", "Speed 3→5 on the upgrade. Mandatory if you can't reach Reavers fast enough."),
            ("T3", "Overguard Locust", "Double Strike + Parry → strikes before enemy lands hit. The early dive unit."),
            ("T4", "(skip in Exodus)", "Scorpion T4 is slow/beefy but won't one-shot — don't sink resources unless you specifically need HP for egg scaling."),
            ("T5", "Reaver (Maniacal or Menacing)", "The win condition. Apex Predator = +50% damage vs T6/T7. Maniacal gets an extra turn on kill — chain morale procs for triple-attack rounds."),
            ("T6", "Worm (Pyroboros)", "Pyroboros AoE ranged is the alt win condition. Corpse Eater heals/revives — solves Hive's brutal creep."),
            ("T7", "Hive Mother", "Soul Assimilator shares enemy faction-diversity penalty with your whole army. Contaminating Blast = 100% AoE magic. Prefer over Hive Queen."),
        ],
        "army_tactics": [
            "Rush Apex (T5 Reavers) by end of week 1 — non-negotiable.",
            "Reaver Wait-trick: stack two turns at the round boundary for double alpha strike.",
            "Eggs cast at end-of-round hatch instantly. Pair with Focus Reserves law (turn-1 summons).",
            "Heroic Strike chains (Curson) trivialize creeping when build path supports it.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "Hive's brutal phase. T1 Warden Parasite (sacrifice 1-stacks for +2 focus on death) + Ravager Parasite for speed + Locust 1-stack with Double-Strike Parry. Hero spends focus to summon Eggs/Larvae for body count. Survival is the goal — not winning fights cleanly. Lean on Heroic Strike chains (Curson) or Worm corpse-eat (Zoran) if you have those heroes."),
            ("Mid — 1-3-5 fights (week 2)",
             "Apex (T5 Reavers) is online — this is the goal of the rush. Reaver doom-stack + Larva summons + 1-stack Locust dive. Maelstrom hero ships you into this phase faster (starts with 2-3 Reavers). Reaver Wait-trick (chain wait + alpha-strike at round boundary) starts winning bigger camps."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Reaver core (now Maniacal — extra turn on kill, chains with Murderous Glee morale procs) + Worm/Pyroboros (T6) for AoE ranged + Hive Mother (T7) for the morale-aura share. Egg/Larva spam continues into the duel — eggs cast at end-of-round hatch instantly with Focus Reserves law. Win condition: Reaver chain procs after a single morale roll = the fight ends turn 1-2."),
        ],
    },
    "schism": {
        "summary": (
            "Expensive faction with a brutal tech tree (Arbitrators require Riders → Bewitchers → Arbitrators). "
            "Power stack is T4 Grand Shoth + Summoning Rite (sacrifice T2/T3 cultist meatshields to make more "
            "Grand Shoths). Bloated Arbitrators are arguably the single best T6 unit in the game (pure damage, "
            "blocks enemy spellbook). Communion mechanic + 'Abyss Stares Back' law is mandatory in Exodus."
        ),
        "creature_tip": "Stinging Rashoth is the early-game carrier; demon-farm cultists into Grand Shoths; 1-stack a Bewitcher to lock enemy hero out of focus.",
        "army_comp": [
            ("T1", "Stinging Rashoth", "Primary early shooter. Communion synergy = rarely lose actual units. Avoid the slow Ferocious upgrade."),
            ("T2", "Cultist", "Meatshield / demon-farm fuel. Sacrifice via Summoning Rite to spawn Grand Shoths."),
            ("T3", "Aga'Shoth Rider", "More fast meat for the demon-farm loop. Keep a 1-stack Tamer for Piercing Cold debuff (50% more damage taken on target)."),
            ("T4", "Unspeakable Shoth (Grand Shoth)", "Mid-late power stack. Fast double-attack brawler. Summoning Rite resurrects T2/T3 corpses as more Grand Shoths."),
            ("T5", "Mistress of Chains / Bewitcher", "Utility 1-stacks. Chains prevent enemy active abilities; Bewitchers block hero focus generation entirely."),
            ("T6", "Bloated Arbitrator", "'Toilet Seat Overlords.' Highest pure damage T6 in the game. Paradoxical Shots up to +150% at range. Frozen Pages blocks enemy spellbook. Worth the awkward tech path."),
            ("T7", "Abyssal Envoy", "Fast magic-immune brawler. Will of the Abyss = immediate double turn. Demon-farmable late game if you've snowballed economy."),
        ],
        "army_tactics": [
            "Summoning Rite loop: sacrifice T2/T3 corpses to mass-produce Grand Shoths.",
            "Communion shadow army absorbs damage from real units; pair with Hel'Ghat (Armor) for unkillable creep.",
            "1-stack a Bewitcher to lock enemy hero out of focus charges entirely.",
            "Mandatory law: 'The Abyss Stares Back' (max Communion daily) — Exodus turn-skip would otherwise halve it.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "T1 Stinging Rashoth doom-stack (volume primary shooter, Communion absorbs hits) + Cultist + Aga'Shoth Rider stacks as demon-farm fuel for the Summoning Rite loop. Goal: lose Cultists/Riders and gain Grand Shoths from their corpses. Communion shadow army means most 'losses' are not real."),
            ("Mid — 1-3-5 fights (week 2)",
             "Rashoth base + Grand Shoth (T4, Unspeakable Shoth — your mid power stack from the Summoning Rite loop) + Bewitcher 1-stack to shut down enemy hero focus + Mistress of Chains 1-stack for ability lock. Eye Collective hero ships you into this phase with 2 Grand Shoth stacks day 1."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Bloated Arbitrator (T6, the 'Toilet Seat Overlord' — highest pure damage T6 + spellbook lock) + Abyssal Envoy (T7, magic-immune brawler with Will of the Abyss double-turn) + Grand Shoth core + Bewitcher utility 1-stack. Schism wants the long game; if you survived to here, you almost always win the duel."),
        ],
    },
    "dungeon": {
        "summary": (
            "Phenomenally strong in single-hero PvP — top picks are 'perma-ban or perma-pick' tier. "
            "Onyx Dancer 1-stacks strip defense (-2/hit), Minotaur Lord parry, Medusa Sculptor petrification, "
            "Chthonic Hydra regen, Black Dragon spell immunity. Every fighting style has a dedicated law that "
            "1.5×s its damage — those laws are mandatory."
        ),
        "creature_tip": "Onyx Dancer 1-stacks for defense debuffs, Aureate dancer upgrade for 2/hit; Minotaurs love morale; Black Dragon over Ashen for higher initiative.",
        "army_comp": [
            ("T1", "Infernal Troglodyte", "Gaping Wound = +25% damage taken on the marked target. Use a single Trog to 'prison-shank' a high-priority enemy stack so the rest of your army melts it."),
            ("T2", "Guile Infiltrator", "Teleport + no enemy counterattack. High initiative, lucky-strike synergies. Hit-and-run."),
            ("T3", "Aureate Dancer", "Best unit on the roster. A Thousand Cuts permanently strips -2 defense per hit; Bouncing Glaives hits two targets. Split into 1-stacks turn 1 to peel enemy armor."),
            ("T4", "Minotaur Lord", "Parry counterattacks *before* the enemy lands. With Riposte spell, gets two counters before taking damage. Mandatory PvP upgrade."),
            ("T5", "Medusa Queen / Sculptor", "Countershot = retaliates at range with bow. Sculptor variant petrifies. Arguably the strongest unit in the faction."),
            ("T6", "Chthonic Hydra", "Tankier than Infernal, regenerates HP, Poisonous Blood punishes attackers. Pair with Blink to teleport into enemy backline."),
            ("T7", "Black Dragon", "*Always* pick over Ashen Dragon — higher Initiative dictates spell-cast order, immune to all spells. Pair with Armageddon to nuke the board while your dragons sit immune."),
        ],
        "army_tactics": [
            "Aureate Dancer 1-stacks turn 1 → strip defense before main exchanges.",
            "Minotaur Lord + Riposte = double pre-emptive counter on melee opponents.",
            "Black Dragon + Armageddon = global nuke that doesn't hit you.",
            "Take every Fighting Style 1.5× law that matches your build — Dungeon's law tree is uniquely loaded with these.",
        ],
        "army_phases": [
            ("Early — 1-2-3 fights (week 1)",
             "T1 Infernal Troglodyte 1-stack (prison-shank target marker) + T2 Guile Infiltrator (no-retal teleport) + T3 Aureate Dancer split into 2-3 stacks turn 1 to strip enemy defense (-2/hit cumulative). Kieran ships you into this phase with 3 Trog stacks (54-72 total). Day-1 dancer + minotaur recruits is the most explosive ladder opener."),
            ("Mid — 1-3-5 fights (week 2)",
             "Aureate Dancer base + Minotaur Lord (T4, Parry — counters before being hit; combo with Riposte spell for double pre-emptive counters) + Medusa Sculptor (T5, Countershot + Petrify) 1-stacked for utility. Onyx Dancer 1-stacks still doing the defense-strip work. Stinger/Motley scaling poison/Twilight makes mid-tier camps trivial."),
            ("Late — 1-4-7 fights (week 3 break / final duel)",
             "Black Dragon (T7, ALWAYS over Ashen — higher initiative + spell-immune) + Chthonic Hydra (T6, regen + Poisonous Blood) + Medusa Sculptor + Minotaur Lord. Cast Armageddon — your Black Dragons sit immune while the board nukes. Aureate Dancer still in the lineup for the turn-1 defense strip."),
        ],
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
    # Tiers per lexiav's notes (advice/lexiav.md). Mapping: great/good → S
    # (with explicit 'A tier' → A); middle → B; meh → B; bad → C.
    ("human_hero_11", "S", False,
     "Pip — Insight start. Lexiav top pick. Flexible canvas: pivot to Avatar summoner, Daylight caster, or Might/Offense based on map roll."),
    ("human_hero_9", "S", False,
     "Old Lord Mandall — Heroic Strike specialist (Combat + Leadership). Lexiav top pick. Damage carries late even after army bleeds out."),
    ("human_hero_4", "S", False,
     "Kestrel — Crossbow specialist; Offense start. Lexiav top pick. Drives the Austringer doom-stack opener."),
    ("human_hero_8", "B", False,
     "Lord Edgar — Lots of stats; late-game scaler. Lexiav meh — best for slow templates."),
    ("human_hero_1", "B", False,
     "Ister — Logistics specialist. Lexiav meh — best on Sprint (road movement); outshined elsewhere."),
    ("human_hero_5", "B", False,
     "Aeos the Exalted — Morale specialist. Lexiav meh — late-game dream pick, slow to come online."),
    ("human_hero_7", "B", False,
     "Keandra — Cavalry specialist. Lexiav meh — cavalry is awkward in single-hero."),
    ("human_hero_10", "B", False,
     "Merry Elias — +1 spell cap for global map spells. Lexiav meh on Exodus; *top hero on Vendetta*."),
    ("human_hero_12", "B", False,
     "Zenith — Lightweaver specialist (Heavenly Blades). Lexiav meh."),
    ("human_hero_13", "B", False,
     "Lia the Untethered One — Daylight specialist. Lexiav meh — niche school-locking pick."),
    ("human_hero_15", "B", False,
     "Vesper — Masterful Blessing. Lexiav meh."),
    ("human_hero_2", "C", False,
     "Leon Sticky-Fingers — Pathfinder / Scouting. Lexiav bad."),
    ("human_hero_3", "C", False,
     "John Johnson — T1 Swordsman specialist. Lexiav bad."),
    ("human_hero_6", "C", False,
     "Heretic Avis — Gem spec. Lexiav bad."),
    ("human_hero_14", "C", False,
     "Julius — Masterful Healing Water. Lexiav bad — Resistance start, defensive without payoff."),
    ("human_hero_16", "C", False,
     "Anastasia the Meek — Arina's Touch (init + HP). Lexiav bad."),
    ("human_hero_17", "C", False,
     "Nadir — Vulnerability spec. Lexiav bad."),
    ("human_hero_18", "C", False,
     "Clarissa — Economy. Lexiav bad — gold spec doesn't compensate for lost combat tempo."),

    # ---------------- NECROPOLIS ---------------- #
    # Tiers per lexiav. Note: Bulwark explicitly downgraded to A tier; Oona,
    # Artorius, Funerella demoted from prior S/A to B.
    ("necro_hero_3", "S", False,
     "Onkos — Skeleton unit specialist. Lexiav top pick. +2 growth + Skeleton Archer buffs = strongest T1 ranged stack."),
    ("necro_hero_4", "S", False,
     "Kel'Ghul — Dread Knight specialist. Lexiav top pick. +2 growth on T6 + 2-3 Dread Knights at start."),
    ("necro_hero_7", "S", False,
     "Marl — Masterful Web (slows entire enemy army), Logistics. Lexiav top pick. Trivializes ranged trades."),
    ("necro_hero_15", "S", False,
     "Laura — Masterful Despair (AoE, very efficient). Lexiav top pick. Bypasses Despair immunity in PvP."),
    ("necro_hero_16", "S", False,
     "Lord Rufus — Rewind Life. Lexiav top pick. Temporary resurrection lets you creep with zero permanent losses (Thaumaturgy is meh per lexiav)."),
    ("necro_hero_8", "S", False,
     "Tarius — Necromancy specialist. Lexiav top pick — better in slower formats (Necromancy compounds late)."),
    ("necro_hero_1", "A", False,
     "Bulwark — Armor specialty. Lexiav A tier — durable but explicitly below the 'good' Necro group."),
    ("necro_hero_17", "B", False,
     "Funerella — Necromancer caster, similar to Tarius. Lexiav middle tier."),
    ("necro_hero_5", "B", False,
     "Natalida — Pet/Barghest specialist. Lexiav middle tier."),
    ("necro_hero_12", "B", False,
     "Ethric — Wisdom start, ships with Liches. Lexiav middle tier."),
    ("necro_hero_2", "B", False,
     "King-of-Kings — Diplomacy. Lexiav meh."),
    ("necro_hero_6", "B", False,
     "Artorius Veritas — Masterful Berserk in radius. Lexiav meh."),
    ("necro_hero_9", "B", False,
     "Zam — Resource generation Alchemist. Lexiav meh."),
    ("necro_hero_10", "B", False,
     "Mag — Arcane Magic start. Lexiav meh — 'arcane sucks'."),
    ("necro_hero_11", "B", False,
     "Adahn — Recruitment-locked. Lexiav meh — 'recruitment sucks'."),
    ("necro_hero_13", "B", False,
     "Guildmaster Klastor — Graverobbers spec. Lexiav meh."),
    ("necro_hero_14", "B", False,
     "Shadespinner Oona — Nightshade caster. Lexiav meh — Nightshade access doesn't carry hard."),
    ("necro_hero_18", "B", False,
     "Milossa the Golden — Passive gold generation. Lexiav meh."),

    # ---------------- GROVE ---------------- #
    # Tiers per lexiav. Note: Tss'kish demoted from prior S → B (lexiav meh
    # on Herbomancer). Minstrel demoted from A → B.
    ("nature_hero_15", "S", False,
     "Halon — Masterful Chain Lightning. Lexiav 'great' — only 25% loss per bounce instead of 50%."),
    ("nature_hero_17", "S", False,
     "Sullie — Avatar specialist; Avatar is immune to magic damage. Lexiav 'great'."),
    ("nature_hero_3", "S", False,
     "Gingertail — Faun specialist. Lexiav top pick — 3 Faun stacks + Init/HP buffs at start."),
    ("nature_hero_2", "S", False,
     "Gorel Spearhead — Offense specialist. Lexiav top pick — more attack and ranged scaling with level."),
    ("nature_hero_7", "S", False,
     "Faleor — Master Fireball. Lexiav top pick — Murmuring subskill, Child of the Woods for mana."),
    ("nature_hero_9", "S", False,
     "Aunt Daliar — Insight start. Lexiav top pick — blasts down the law tree."),
    ("nature_hero_10", "B", False,
     "Vatawna — Global-map spell specialist (DD/Vendetta). Lexiav middle on Exodus — strong on Vendetta."),
    ("nature_hero_11", "B", False,
     "Elder Tss'kish — Herbomancer buff specialty. Lexiav meh."),
    ("nature_hero_18", "B", False,
     "The Minstrel — Focus point specialist. Lexiav meh."),
    ("nature_hero_12", "B", False,
     "Aeliniel — Masterful Firewall. Lexiav meh — OK vs AI but not great vs players."),
    ("nature_hero_13", "B", False,
     "Glacia — Masterful Ice Bolt. Lexiav meh."),
    ("nature_hero_14", "B", False,
     "Vim — Masterful Cave-In. Lexiav meh — bad damage/mana."),
    ("nature_hero_1", "B", False,
     "Eith — Scouting. Lexiav meh."),
    ("nature_hero_4", "B", False,
     "Old Pilgrim — Lexiav meh — super slow."),
    ("nature_hero_5", "B", False,
     "Octavia — Luck specialist. Lexiav meh."),
    ("nature_hero_6", "B", False,
     "Mreowa — Economy. Lexiav meh."),
    ("nature_hero_8", "B", False,
     "Alluring Sh'a — Diplomacy/Charismatic. Lexiav meh — Assemble doesn't fit single-hero."),
    ("nature_hero_16", "B", False,
     "Echolily — Murmuring Copy. Lexiav meh — clones enemies, not very good."),

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
    # Tiers per lexiav. Big shifts: Motley + Lodos demoted from S → B/C
    # (lexiav's 'meh'/'bad'). Stinger/Typhona/Devir/Enatee/Kelarr stay top.
    ("dungeon_hero_3", "S", False,
     "Stinger — Heroic Strike specialist. Lexiav top pick — devastating early creep with stacking poison."),
    ("dungeon_hero_10", "S", False,
     "Kelarr, son of Navarr — Insight specialist. Lexiav top pick — flexible scaling."),
    ("dungeon_hero_16", "S", False,
     "Typhona — Hydra (T6) specialist Warlock. Lexiav top pick — Tier 6 power on day 1."),
    ("dungeon_hero_1", "S", False,
     "Enatee — Medusa specialist. Lexiav top pick — Medusa Sculptor is one of the faction's best units."),
    ("dungeon_hero_6", "S", False,
     "Devir, son of Devir — Minotaur specialist + Leadership. Lexiav top pick — Day 1 Minotaur doom build."),
    ("dungeon_hero_11", "B", False,
     "Zakron the Great — Sorcery, Firewall, spell stance. Lexiav meh."),
    ("dungeon_hero_13", "B", False,
     "Motley — Onyx Dancer specialist (Luck, Twilight). Lexiav meh — was widely considered top, lexiav less impressed."),
    ("dungeon_hero_2", "C", False,
     "Tellaris the Betrayed — Battlecraft start. Lexiav bad."),
    ("dungeon_hero_4", "C", False,
     "Kieran — Trog specialist. Lexiav bad — fighting style not worth on T1."),
    ("dungeon_hero_5", "C", False,
     "Mouaren — Infiltrator specialist; Scouting. Lexiav bad."),
    ("dungeon_hero_7", "C", False,
     "Creta, daughter of Navarr — Gem and gold spec. Lexiav bad."),
    ("dungeon_hero_8", "C", False,
     "Rhea — Luck spec. Lexiav bad."),
    ("dungeon_hero_9", "C", False,
     "Gleard the Grey — Arcane specialist. Lexiav bad."),
    ("dungeon_hero_12", "C", False,
     "Sister Deira — Arina's Chosen (Thaumaturgy). Lexiav bad."),
    ("dungeon_hero_14", "C", False,
     "Ylwari ('Ilwara') — Diplomacy. Lexiav bad — Assemble doesn't fit single-hero."),
    ("dungeon_hero_15", "C", False,
     "Glastor — Economy mage. Lexiav bad."),
    ("dungeon_hero_17", "C", False,
     "Sunny Rauktol — Daylight specialist. Lexiav bad."),
    ("dungeon_hero_18", "C", False,
     "Lodos — Nightshade specialist (Sleep). Lexiav bad — was widely considered S, lexiav rates poorly."),
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
     "Archer via Onkos), Grove (Faun Archer), Schism (Stinging Rashoth via Grellekh) — farm Pandora boxes for "
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

# Note: a cross-faction "top 10 ban list" was removed because the format only
# allows banning 3 heroes from the opponent's chosen faction — a global list
# implies a draft action you never take. The actionable per-opponent ban
# tables live on the per-faction pages (HERO_BANS in build_draft_guide.py).


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
    # Hydrate signature_mechanic from the sibling Mechanics module so the faction
    # page surfaces the same authoritative copy as the Mechanics primer.
    faction_meta_out = {fid: dict(meta) for fid, meta in FACTION_META.items()}
    for fid, sig in FACTION_SIGNATURE_MECHANICS.items():
        if fid in faction_meta_out:
            faction_meta_out[fid]["signature_mechanic"] = sig

    js_payload = {
        "FACTIONS": [{"id": f["id"], "name": f["name"], "might": f["might"], "magic": f["magic"]} for f in factions],
        "FACTION_META": faction_meta_out,
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
