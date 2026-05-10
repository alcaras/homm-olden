# Per-faction building & law guide — tournament / Exodus

Single-hero PvP gameplan per faction: turn-by-turn build-order priority and law priority list. Sources: creator commentary in `notes-from-videos.md` cross-referenced against extracted data (`catalog/raw/Lang/english/texts/cities.json` for building names, `fractions_laws_table_*.json` for law tables).

**Tier scale.** **S** = rush / mandatory; **A** = strong, take when convenient; **B** = situational; **trap** = a common mistake the videos explicitly call out.

## Universal tips

- **Exodus = 2 home cities + 1 third-faction city.** Each player starts with 2 cities of their own faction and there is a third, off-faction city on the map (capturable). Your home pair is your full-tech engine; the third city is a pure economy annex — Banks/Treasuries/Marketplaces only, no foreign dwellings (morale penalty).
- **Mage Guild in every town.** Ending a turn in a city with a Mage Guild fully restores hero mana. This sustains your global-spell rotation (Town Portal, Second Wind, Dimension Door) — neglecting Mage Guilds is the most-cited mistake in tournament play.
- **Fortifications T2 by end of week 1.** Universal +50% dwelling growth. Every faction that doesn't hit T2 walls by week 1 falls behind in raw army size. Some factions (Dungeon, Hive) need it *more* because their faction-specific growth mechanics are weaker.
- **Don't go home.** The universal Exodus mistake is wasting movement points returning to your capital. Stay out, farm Pandora boxes, and only Town-Portal back when you absolutely need to upgrade and recruit before the duel.
- **Side cities = economy, not military.** If you capture a city of a different faction (e.g. the Exodus third city), do *not* invest in its dwellings — different-faction units inflict a morale penalty. Build only Town Halls, Banks, Marketplaces, Treasuries. Funnel resources back to your main capital.
- **Mage Guild before T7 dwelling.** Several factions (notably Temple) gate the elite training building behind Mage Guild. Always check the dependency tree before queuing your week.

## Temple

Temple's tournament gameplan is the most straightforward in the game. Build a Crossbowman → Austringer ranged blob, support it with Daylight buffs (Bless, Riposte, Radiant Armor), and double-build the Angel line on week 1 if your economy permits. The faction is widely called noob-friendly precisely because this script just works.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_2` | **Mews** | S | Mews → Crossbowmen. T2 archer is your early-game carrier; recruit and split into stacks immediately. |
| Day 1 | `Magic_Guild` | **Mage Guild** | S | Mage Guild L1 — fish for Bless on day 1. Also a prereq for the Archery Camp / Training Range. |
| Day 1-3 | `Bank` | **Bank** | S | +1000 gold/day; Temple builds expensive units, so secure income early. |
| Day 2-4 | `Wall` | **Fortifications** | S | Fortifications T1 → T2 by mid week 1. T2 walls = +50% dwelling growth — the single biggest scalar in the game. |
| Week 1 | `Tier_4` | **Sundrop Chapel** | A | Sundrop Chapel → Lightweavers. Hierophant 1-stacks for buff/dispel; Sun Heralds if using as primary damage. |
| Week 1-2 | `Tier_7` | **Radiant Forge** | A | Radiant Forge — try to double-build Angels in week 1. Securing Angels enables zero-loss clears of T7 dwellings on the map. |
| Week 2 | `Treasury` | **Treasury** | A | Treasury into secondary towns is the standard macro spine. |
| Week 2 | `Magic_Guild` | **Mage Guild** | A | Mage Guild L3-L4 — Riposte (T3, counter before being hit) and Radiant Armor (T4, -40% damage) are tournament-decisive. |
| Week 2-3 | `Tier_3` | **Griffin Rookery** | B | Griffin Rookery — Guardian Griffins counterattack adjacent friendlies. Skip the basic upgrade unless you have spare resources. |
| — | `Tier_5` | **Hippodrome** | trap | Hippodrome (Cavalry). 'Cavalry is too clunky to spawn with' for single-hero Exodus — spawn units waste tempo. Skip in week 1. |
| — | `Intelligence_Academy` | **Scouting Skyship** | trap | Scouting Skyship is generally low-priority — its sight bonus doesn't compete with raw army growth. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 3 | **Resource Riches I** | S | _Provides a one‑time allotment of {0} Gold, {1} Wood, and {1} Ore when enacted._ | Resource Riches I — one-time gold/wood/ore. Cheapest economy snap to fund Fortifications + Angel double-build by end of week 1. |
| 25 | **Encouragement** | S | _The chance of Morale triggering for friendly creatures increases by {0}% for each point of their Morale._ | Encouragement — morale-trigger chance from 4% to 7%. Hugely buffs every Temple morale mechanic. |
| 30 | **Elite Angels** | S | _Angel growth in your cities increases by {0}. They gain {1}% of their hero’s Attack and Defense as Attack and Defense._ | Elite Angels — Angels gain 25-50% of hero A/D. Mandatory once your win condition is online. |
| 10 | **Elite Crossbowmen** | A | _Crossbowman growth in your cities increases by {0}. They gain {1} Attack._ | Elite Crossbowmen — +growth and +Attack. Cheap and directly fuels the T2 archer doom-stack plan. |
| 13 | **Vengeful Strike** | A | _Friendly creatures’ counterattacks deal +{0}% Damage._ | Vengeful Strike — counterattacks deal +up-to-100% damage. Combos toxically with Riposte (counter before being hit). |
| 15 | **Sun’s Grace** | A | _Daylight spells of your heroes gain {0} level(s)._ | Sun's Grace — +1 level to all Daylight spells. Free upgrade to Bless / Radiant Armor / Riposte without mage-guild RNG. |
| 26 | **Hero’s Blessing** | A | _Friendly creatures gain {0}% of their hero’s Spell Power and Knowledge as Attack and Defense respectively._ | Hero's Blessing — units gain 25% of hero's P+K as A/D. A built-in Battle Magic for caster Temples. |
| 2 | **Training: Scouting** | trap | _Your heroes gain {0} Sight radius._ | Training: Scouting — sight radius is rarely the bottleneck; skip in favor of stat-training laws or Resource Riches. |
| 16 | **Resource Riches II** | trap | _Provides a one‑time allotment of {0} Gold, {1} Wood, and {1} Ore when enacted._ | Resource Riches II — only worth it if you've already enacted I and have nothing else to spend on. Often outscaled by direct unit/army laws by mid game. |

## Necropolis

Necropolis snowballs through a Skeleton Archer doom-stack + Lich Rewind Death sustain + Dread Knight power spike. The Undead Transformer is the single most broken building in tournament play — convert Pandora's Box rewards into your own elite units (no morale penalty). Necromancy scaling laws compound the snowball into Exodus's late game.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_1` | **Crypts and Graves** | S | Crypts and Graves (or upgrade if Kel'Ghul). Skeleton Archers are the early-game carrier; split into 1-stacks to farm focus and troll AI. |
| Day 1-2 | `Main` | **Eternal Visage** | A | Eternal Visage L2 with the Law Points upgrade (not gold). |
| Day 2-4 | `Bank` | **Bank** | S | Dread Knights and Liches are expensive — bank early to fund T6/T5 production. |
| Day 4-5 | `Wall` | **Fortifications** | S | Fortifications T1 → T2 by week 1. +50% dwelling growth is the bread-winner of every Necro build. |
| Day 5-6 | `Tier_6` | **Tomb of Warriors** | A | Tomb of Warriors → Dread Knights. Mandatory if running Kel'Ghul; otherwise still your primary T6. |
| Week 1-2 | `Tier_5` | **Timeless Mansion** | S | Timeless Mansion → Liches. Rewind Death sustain is the faction's win condition; do not skip. |
| Week 2 | `Skeleton_Converter` | **Undead Transformer** | S | Undead Transformer. The strongest tournament building. Drag Pandora-box T5/T6/T7 units in to convert them into Necropolis equivalents. |
| Week 2-3 | `Wall` | **Fortifications** | S | Fortifications T3 (further +50% growth on top of T2). Steamroll-mode by week 3. |
| Week 2-3 | `Magic_Guild` | **Mage Guild** | A | Mage Guild for Despair (Sorcery) and Unnatural Calm. Laura's Masterful Despair bypasses immunity for the Decay/Vampire snowball. |
| — | `Tier_4` | **Bone Exchange** | trap | Bone Exchange (Graverobbers). Awkward, slow, focus-hungry. Necropolis already has nowhere near enough focus for Liches and Heroic Strike — skip. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 8 | **Laws of the Immortals** | S | _Your cities generate +{0}% Law points._ | Laws of the Immortals — +60% law point generation in cities. Snowballs the entire law tree; rush this early. |
| 18 | **Elite Liches** | S | _Lich growth in your cities increases by {0}. Their healing abilities restore {1}% more HP._ | Elite Liches — +100% lich healing. Doubles your sustain engine. |
| 20 | **Terra Mortis** | S | _Your Necropolis heroes always battle on their Native Terrain._ | Terra Mortis — every battle on native terrain. Combo with #24 Return to the Soil for permanent +1 speed in PvP. |
| 24 | **Return to the Soil** | S | _Friendly creatures battling on their Native terrain gain {0} Speed._ | Return to the Soil — +1 Speed on native terrain. Pair with Terra Mortis = always-on +1 Speed army-wide. |
| 31 | **Death’s Presence** | S | _Enemy non‑Necropolis creatures deal –{0}% and take +{0}% Damage. Your non‑Necropolis creatures gain the opposite effect._ | Death's Presence — enemy non-Necro creatures deal -% / take +%. Massive passive PvP advantage. |
| 17 | **Bloodthirst** | A | _Vampirism of friendly creatures increases by {0}%._ | Bloodthirst — +Vampirism. Combo with #30 Morituri te Salutant for the S-tier Vampire Lord retaliation loop. |
| 19 | **Elite Dread Knights** | A | _Dread Knight growth in your cities increases by {0}. Their maximum Damage increases by {1}._ | Elite Dread Knights — +growth and +Damage on the Avatar of War win condition. |
| 30 | **Morituri te Salutant** | A | _Friendly creatures can make +{0} counterattacks per round._ | Morituri te Salutant — +1 counterattack/round. With Bloodthirst, Vampire Lords resurrect their stack while retaliating. |
| 2 | **Animate Dead I** | trap | _Your heroes gain {0}% Necromancy Power._ | Animate Dead I — first Necromancy bump is too small to matter early. Take after Laws of the Immortals snowballs your law output. |
| 13 | **Mining: Mercury** | trap | _Produces {0} Mercury daily._ | Mining: Mercury — only useful if you're hard-stuck on spell upgrades; usually outscaled by direct combat laws. |

## Grove

Grove's strategy is 'skip the mid-tier dwellings'. Lean into Faun Archer + Dusk Hoplite (0-mana +3 spell power per cast) + Murmurmancer (re-cast spellbook) and use Avatar Vomit to cheese mid-tier objectives. The law tree is widely panned ('the most dogshit law tree') — only 3-4 laws are actually worth taking.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_2` | **Hop Patch** | S | Hop Patch → upgrade for Dawn/Dusk Hoplets. Hoplites are the focus engine + spell-power amplifier; the entire Grove plan revolves around them. |
| Day 1-2 | `Tier_5` | **Shroomwood Shack** | S | Shroomwood Shack → Herbomancers. Sporomancer/Murmurmancer is the late-game spell engine; rushing it skips most of the build path. |
| Day 2-3 | `Main` | **Grove Palace** | A | Grove Palace L2 → L3 to start banking law points for the inevitable Resource Riches pivot. |
| Day 3-5 | `Wall` | **Fortifications** | S | Fortifications T1 → T2. Same +50% growth scalar as every other faction — mandatory. |
| Day 4-5 | `Magic_Guild` | **Mage Guild** | S | Mage Guild L1 — fish for Avatar / Fireball / Slow. Critical for the spellbook combo. Build *before* secondary economy. |
| Week 1-2 | `Bank` | **Bank** | A | Bank goes in *after* Resource Riches lands — the law gives you a burst of resources that pivots straight into a Bank. |
| Week 2 | `Tier_1` | **Faun Huts** | B | Faun Huts upgrade if you skipped on day 1. Faun Archers are still relevant late if not running Gingertail. |
| Week 2-3 | `Unic_2` | **Mother Nature** | B | Mother Nature (+2 spell power). Strong only with caster heroes (Halon, Sullie, Tss'kish). |
| — | `Tier_3` | **Menhir Circle** | trap | Menhir Circle (Iriyads/Naiads). The Qilin build path is 'horrendous' (Mage Guild → Iriyads → useless Naiads → Qilins). Skip and run Avatar Vomit instead. |
| — | `Tier_6` | **Thunder Lair** | trap | Thunder Lair (Qilins). Only viable if you specifically committed to Naiads. Most Grove builds skip Qilins entirely. |
| — | `Unic_1` | **Mycelium Roots** | trap | Mycelium Roots — teleport is great for long classical games, but in Exodus your hero stays out on the map and uses Town Portal anyway. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 4 | **Resource Riches I** | S | _Provides a one‑time allotment of {0} Gold, {1} Wood, and {1} Ore when enacted._ | Resource Riches I — Grove specifically *plans* to skip economy for early military, then pivots into this law for a mid-week 2 economy snap. |
| 6 | **Elite Hoplets** | S | _Hoplet growth in your cities increases by {0}. They always deal maximum Damage._ | Elite Hoplets — they always deal max damage. Removes the variance that otherwise hurts your tempo unit. |
| 22 | **Elite Mancers** | S | _Herbomancer growth in your cities increases by {0}. Their abilities cost –{1} Focus Charge(s)._ | Elite Mancers — Herbomancer focus cost -1. Drops Murmurmancer spellbook re-cast from 2 focus to 1, enabling triple-spell turns. |
| 7 | **Children of the Wild** | A | _Your Grove heroes gain {0} sight radius and {1} Movement points._ | Children of the Wild — sight + movement + focus. Strong late-game scaling for caster heroes. |
| 11 | **Nature’s Wildness** | A | _Friendly creatures deal {0}% more Damage with Lucky Strikes._ | Nature's Wildness — +50% damage on lucky strikes. Combos with Luck of the Fittest above. |
| 24 | **Luck of the Fittest** | A | _Friendly creatures now have +{0}% Lucky Strike chance for each point of Luck._ | Luck of the Fittest — luck → 7% per point (from 4%). Pair with Octavia or any luck-leaning build. |
| 29 | **Sanctuary** | A | _The abilities of your Vine Iriyads, Naiads, Qilins and Phoenixes cost –{0} Focus Charge(s)._ | Sanctuary — Iriyads/Naiads/Qilins/Phoenixes focus -1. Only relevant if you committed to that build path. |
| 8 | **Save the Forests** | trap | _Your buildings cost –{0}% Wood to construct._ | Save the Forests — wood discount is irrelevant by the time you have enough law points to enact it. |
| 25 | **Force of Nature** | trap | _Your Heroic Strikes deal +{0} basic Damage._ | Force of Nature — +Heroic Strike damage. Grove has *no* heroic strike synergies; skip entirely. |
| 31 | **Natural Serenity** | trap | _The cooldowns of all the battle spells of your heroes are reduced by {0} round(s)._ | Natural Serenity — cooldown reduction is rarely impactful vs standard rotation. |

## Hive

Hive has the worst early game in the entire roster — slow, clunky, no native ranged unit. The whole tournament plan is to *bypass* the early roster and reach Tier 5 (Reavers) or Tier 6 (Worms) as fast as possible. Apex by end of week 1 is non-negotiable. Hive law tier thresholds are uniquely low (Tier 5/6 unit laws unlock at 15 points), enabling power spikes in week 1 that other factions cannot match.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_1` | **Neglected Housing** | A | Neglected Housing — upgrade for Ravager Parasites (3→5 speed). Mandatory if you can't reach Reavers fast enough. |
| Day 1-2 | `Bank` | **Bank** | S | +1000 gold/day. Hive's elite units are expensive; income beats raw production volume. |
| Day 2-4 | `Tier_5` | **Apex** | S | Apex (Reavers). Rushing this by end of week 1 is non-negotiable — Reavers are the faction's win condition. |
| Day 4-5 | `Wall` | **Fortifications** | A | Fortifications T1 → T2. Combined with Maelstrom's growth bonus, you get up to 7 Reavers/week. |
| Week 1-2 | `Magic_Guild` | **Mage Guild** | A | Mage Guild for Haste / Weakening Ray / Dimension Door. Closes Hive's melee-gap weakness. |
| Week 2 | `Treasury` | **Treasury** | A | Treasury supports the late-game elite recruitment burst. |
| Week 2 | `Tier_7` | **Tower of Love** | B | Tower of Love (Hive Queens) — luxury target if economy permits, but rarely affordable in Exodus. Crystal/dust cost is brutal. |
| Week 2-3 | `Tier_6` | **Burning Soul Burrows** | A | Burning Soul Burrows (Worms). Pyroboros AoE ranged is the alternate win-condition stack to Reavers. |
| — | `Tier_3` | **Paper Nest** | trap | Paper Nest (Hornets) — Hornets fall over to anything; skip unless you specifically need turn-order manipulation. |
| — | `Tier_4` | **Chitinous Ziggurat** | trap | Chitinous Ziggurat (Scorpions) — slow, beefy but won't one-shot anything. Don't sink resources unless your build needs HP for egg scaling. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 2 | **Laws of the Hive** | S | _Requirements for unlocking higher‑level Laws are reduced by {0}._ | Laws of the Hive — reduces all higher-tier law thresholds. The keystone law that enables every other Hive law play. |
| 17 | **Elite Reavers** | S | _Reaver growth in your cities increases by {0}. They gain {1} Morale and {2} Luck._ | Elite Reavers — +growth and +5 Morale. With #29 No Compassion, your Reaver stack is permanently morale-capped → Murderous Glee chains. |
| 31 | **Focus Reserves** | S | _Start each battle with +{0} Focus Charge(s)._ | Focus Reserves — +1 Focus charge at battle start. Lets you summon eggs turn 1, fundamental to the Hive plan. |
| 9 | **Mana Devour** | A | _Your heroes’ spells cost –{0} mana._ | Mana Devour — spells -1 mana. Indispensable for caster Hive (Mila, Oriax) running Dimension Door spam. |
| 26 | **Prosper and Flourish** | A | _External dwellings increase respective creature growth in the cities by {0}%._ | Prosper and Flourish — external dwellings grow city creatures +50%. Late-game macro snap. |
| 28 | **Infernal Rage** | A | _Friendly creatures deal +{0} Damage._ | Infernal Rage — +1 base damage. +20% damage to summoned Larvae (4→5 base) — disproportionately big on the swarm side. |
| 29 | **No Compassion** | A | _The chance of Morale or Luck triggering for friendly creatures increases by {0}% for each point of their Morale or Luck, respectively._ | No Compassion — +morale/luck trigger chance. The damage scalar that makes Reaver-only builds work. |
| 21 | **Natural Selection** | trap | _External dwellings in an area that you control produce upgraded creatures._ | Natural Selection — buys upgraded creatures from external dwellings. Pointless: you can just upgrade them in town. |
| 22 | **Hive Magic** | trap | _Your heroes deal +{0}% Magic Damage._ | Hive Magic — +Magic Damage. Hive heroes rarely have the spell power to cash this in; skip. |

## Schism

Schism's tech tree is brutal and expensive — Arbitrators require Riders → Bewitchers → Arbitrators in sequence. The faction's gimmick is Communion (sacrificable shadow army) and Summoning Rite (demon-farm cultists into Grand Shoths). 'The Abyss Stares Back' law is mandatory for tournament play because Exodus often involves skipping a turn before the duel, which would otherwise halve your Communion.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_1` | **Lesser Summoning Rite** | S | Lesser Summoning Rite → Stinging Rashoth. Your early-game shooter is mandatory; carries the entire creep phase. |
| Day 1-3 | `Bank` | **Bank** | S | Schism is the most expensive faction — Banks and Treasuries before military beyond T1. |
| Day 3-4 | `Wall` | **Fortifications** | S | Fortifications T1 → T2. Same +50% growth scalar. |
| Week 1 | `Tier_4` | **Disturbing Summoning Rite** | S | Disturbing Summoning Rite → Grand Shoth. Your mid-to-late game power stack — Summoning Rite resurrects dead T2/T3 units as more Grand Shoths. |
| Week 1-2 | `Magic_Guild` | **Mage Guild** | A | Mage Guild for Avatar / Twilight (if rolled). Critical for Eye Collective / Urgo Avatar plays. |
| Week 2 | `Treasury` | **Treasury** | S | Treasury — 'snowball your economy early or you lose the final duel'. Schism is the faction most punished by tight economies. |
| Week 2-3 | `Tier_5` | **House of Chains** | B | House of Chains (Concubus). Get to Bewitchers/Mistress of Chains 1-stacks for utility — they lock enemies out of abilities/focus. |
| Week 3 | `Tier_6` | **Bloated Mansion** | A | Bloated Mansion (Arbitrators). The 'Toilet Seat Overlord' is widely cited as the best T6 in the game — pure damage, locks enemy spellbook. Worth the awkward tech path if you can afford it. |
| — | `Tier_3` | **Aga’Shoth Stables** | trap | Aga'Shoth Stables (Riders) — only build if you're rushing the Arbitrator tech path. Riders are pure meat-shield/demon-farm fuel; do not power-stack them. |
| — | `Tier_7` | **Eerie Summoning Rite** | trap | Eerie Summoning Rite (Abyssal Envoys) — usually unaffordable in Exodus; skip unless you've snowballed economy hard. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 8 | **Survival Conditions** | S | _Your cities produce +{0} Wood and Ore._ | Survival Conditions — +1 Wood/Ore per town. With 5-6 towns in late Exodus, this generates 12+ of each per turn. |
| 29 | **The Abyss Stares Back** | S | _Your Schism heroes start each day with maximum Communion level._ | The Abyss Stares Back — start each day with maximum Communion. Mandatory for Exodus (the format's turn-skip mechanic would otherwise halve Communion every duel). |
| 9 | **Depths of Mind** | A | _Your Schism heroes restore +{0}% mana each morning._ | Depths of Mind — restore 30% mana each morning (up from 10%). 3× sustained casting on the map. |
| 24 | **Unfrozen Strength V** | A | _Tier‑5 friendly creatures gain {0}% of their hero’s Attack and Spell Power as Attack, {0}% of their Defense and Knowledge as Defense._ | Unfrozen Strength IV-VI — Tier-4+ creatures gain hero-stat scaling. Massive when capturing mid-map Temple/etc towns and bringing those units along. |
| 28 | **Mind Freeze** | A | _Each round of battle, the enemy loses {0} Focus Charge(s)._ | Mind Freeze — enemy hero loses focus charges per round. Pair with Bewitcher 1-stacks to completely shut off enemy ability usage. |
| 33 | **Ice Storms** | A | _All enemy creatures lose {0} Speed and Initiative._ | Ice Storms — all enemy creatures lose Speed and Initiative. A permanent debuff in every fight. |
| 16 | **Cold Shoulder** | trap | _You can use Involuntary Summons in your Schism cities twice per week._ | Cold Shoulder — twice-per-week Involuntary Summons. Gimmicky and rarely the right line vs Survival Conditions. |
| 21 | **Frostbite** | trap | _Each round of battle, enemy heroes lose {0} mana._ | Frostbite — enemy hero loses 1 mana/round. Too slow; spell economy in Exodus duels is decided by burst, not attrition. |

## Dungeon

Dungeon is one of the strongest tournament factions because of how its laws interact with creatures: every Fighting Style has a dedicated 1.5× damage law, and you must take the ones matching your build. Dungeon dwellings *don't* grow with creature upgrades, so Fortifications matter even more here than for other factions. Onyx Dancer 1-stacks (-2 def/hit), Minotaur Lords (parry), Medusa Sculptors (petrify), Black Dragons (spell-immune) form the canonical stack.

### Build order

| Phase | Building | Faction name | Priority | Note |
|---|---|---|---|---|
| Day 1 | `Tier_3` | **Amphitheater** | S | Amphitheater → Onyx Dancers (and rush the upgrade for Aureate Dancers ASAP). Splitting into 1-stacks spams -2 defense per hit; auto-wins early PvE. |
| Day 1-2 | `Tier_4` | **Labyrinth** | S | Labyrinth → Minotaurs (esp. with Devir). Day 1 Minotaur recruits = the most explosive early army on the ladder. |
| Day 2-4 | `Bank` | **Bank** | A | Standard income building — Dungeon T6/T7 prices are steep. |
| Day 3-5 | `Wall` | **Fortifications** | S | Fortifications T1 → T2 in week 1. Dungeon needs walls *more* than other factions because upgrades don't add growth — fortifications are the only growth scalar. |
| Week 1-2 | `Wall` | **Fortifications** | S | Fortifications T3 by week 2. Push every-faction growth scalar to max. |
| Week 1-2 | `Tier_5` | **Stilled Voices** | A | Stilled Voices → Medusas. Sharpshooter + Slither Away + Petrify (Sculptor) = arguably the strongest unit in the faction. |
| Week 2 | `Magic_Guild` | **Mage Guild** | A | Mage Guild — Dungeon mages double-cast spell power via Dragon Stance. Build for Fireball / Star Children / Avatar. |
| Week 2-3 | `Tier_6` | **Chthonic Home** | A | Chthonic Home → Hydras. Tank with regen + poisonous blood. Strong before Black Dragons land. |
| Week 3 | `Tier_7` | **Cave Palace** | A | Cave Palace → Black Dragons (preferred over Ashen). Spell immunity + high init = the win condition. |
| — | `Gymnasium` | **Gymnasium** | trap | Gymnasium gives free hero level-up but makes leveling exponentially harder *after* — save strictly for late-game (level 16+) when the curve flattens. Building it early is a beginner trap. |
| — | `Tier_2` | **Safe House** | trap | Safe House (Infiltrators) — useful but not a power stack. Build for utility 1-stacks (Guile Infiltrator no-retal), don't sink resources into mass production. |

### Law priorities

| # | Law | Priority | Effect (game text) | Why |
|---:|---|---|---|---|
| 2 | **Leaders of the Nation** | S | _Your heroes generate +{0}% Law points._ | Leaders of the Nation — +20% law point generation. Combo with Arcane Knowledge to rapidly unlock world-map spells (Second Wind, Dimension Door). |
| 7 | **Or No Ore?** | S | _Your buildings cost –{0}% Ore to construct._ | Or No Ore? — buildings cost -40% Ore. Dungeon's biggest tournament bottleneck is Ore for Fortifications T2/T3 by week 2; this law is the relief valve. |
| 28 | **Magical Education** | S | _Spells of your heroes gain {0} level(s)._ | Magical Education — +1 level to all spells. Permanent across-the-board upgrade; mandatory for any Dungeon caster build. |
| 33 | **Arcane Knowledge** | S | _Produces {0} Astrology points daily._ | Arcane Knowledge — +500 Astrology daily. Skips needing dedicated astrology buildings; core Dungeon law in every guide. |
| 8 | **Jadame Maps** | A | _Your heroes gain {0} Movement points._ | Jadame Maps — +20 hero movement. Out-paces opponents on the map and controls more Pandora boxes. |
| 22 | **Triumvirate’s Agents** | A | _Your Dungeon heroes gain {0} to all attributes._ | Triumvirate's Agents — +1 to all hero attributes. Doubled when paired with Tactics skill — a huge early stat snap. |
| 23 | **Merchants Guild** | A | _Eliminates all price markups in the Marketplace._ | Merchants Guild — eliminates marketplace markups. Late-game economy law that lets you trade freely between resources. |
| 15 | **Spy Network** | trap | _All external buildings and structures under your control gain +{0} sight radius._ | Spy Network — +sight on external buildings. Outscaled by direct combat / economy laws. |
| 16 | **Peoples of Jadame** | trap | _Your heroes’ Persuasion Power in Diplomacy increases by {0}%._ | Peoples of Jadame — +Diplomacy persuasion. Diplomacy is class-locked anyway; near-zero impact. |

---

*Generated 2026-05-10 04:45 UTC by `catalog/scripts/build_faction_guides.py`. Edit the `GUIDES` dict to update.*
