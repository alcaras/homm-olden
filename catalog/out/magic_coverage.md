# Magic school coverage

Each row gives the **per-roll probability** that a hero's level-1 skill offer includes that magic school skill (chance / sum of table weights). This is what you face every time the game offers you a skill — think of it as base rate per offered slot. The actual probability of ever rolling the school by level N is computed in a separate subclass-odds analysis (it depends on offering rules).

## Magic schools by faction (mean across all hero variants)

| Faction | Day | Night | Space | Primal |
|---|---:|---:|---:|---:|
| human | 3.40% | 0.85% | 2.55% | 1.70% |
| undead | 0.87% | 3.48% | 2.61% | 1.74% |
| nature | 1.70% | 0.85% | 2.55% | 3.40% |
| demon | 1.70% | 2.55% | 0.85% | 3.40% |
| unfrozen | 1.70% | 2.55% | 3.40% | 0.85% |
| dungeon | 2.08% | 2.08% | 2.08% | 2.08% |

## By class (might vs magic)

| Faction | Class | Day | Night | Space | Primal |
|---|---|---:|---:|---:|---:|
| human | might | 3.40% | 0.85% | 2.55% | 1.70% |
| human | magic | 3.40% | 0.85% | 2.55% | 1.70% |
| undead | might | 0.87% | 3.48% | 2.61% | 1.74% |
| undead | magic | 0.87% | 3.48% | 2.61% | 1.74% |
| nature | might | 1.70% | 0.85% | 2.55% | 3.40% |
| nature | magic | 1.70% | 0.85% | 2.55% | 3.40% |
| demon | might | 1.70% | 2.55% | 0.85% | 3.40% |
| demon | magic | 1.70% | 2.55% | 0.85% | 3.40% |
| unfrozen | might | 1.70% | 2.55% | 3.40% | 0.85% |
| unfrozen | magic | 1.70% | 2.55% | 3.40% | 0.85% |
| dungeon | might | 2.08% | 2.08% | 2.08% | 2.08% |
| dungeon | magic | 2.08% | 2.08% | 2.08% | 2.08% |

## Spell inventory by school × rank

| School | Rank 1 | Rank 2 | Rank 3 | Rank 4 | Rank 5 | Total |
|---|---:|---:|---:|---:|---:|---:|
| day | 7 | 4 | 5 | 4 | 3 | 23 |
| night | 6 | 6 | 4 | 5 | 3 | 24 |
| space | 6 | 6 | 5 | 4 | 3 | 24 |
| primal | 3 | 6 | 6 | 5 | 3 | 23 |
| neutral | 16 | 2 | 17 | 2 | 0 | 37 |

## Top heroes per school (highest per-roll probability)

### Day

| Rank | Hero | Faction | Class | p / roll |
|---:|---|---|---|---:|
| 1 | `human_hero_1` (representative) | human | might | 3.40% |
| 2 | `human_hero_10` (representative) | human | magic | 3.40% |
| 3 | `dungeon_hero_1` (representative) | dungeon | might | 2.08% |
| 4 | `dungeon_hero_10` (representative) | dungeon | magic | 2.08% |
| 5 | `demon_hero_1` (representative) | demon | might | 1.70% |
| 6 | `demon_hero_10` (representative) | demon | magic | 1.70% |

### Night

| Rank | Hero | Faction | Class | p / roll |
|---:|---|---|---|---:|
| 1 | `necro_hero_1` (representative) | undead | might | 3.48% |
| 2 | `necro_hero_10` (representative) | undead | magic | 3.48% |
| 3 | `demon_hero_1` (representative) | demon | might | 2.55% |
| 4 | `demon_hero_10` (representative) | demon | magic | 2.55% |
| 5 | `unfrozen_hero_1` (representative) | unfrozen | might | 2.55% |
| 6 | `unfrozen_hero_10` (representative) | unfrozen | magic | 2.55% |

### Space

| Rank | Hero | Faction | Class | p / roll |
|---:|---|---|---|---:|
| 1 | `unfrozen_hero_1` (representative) | unfrozen | might | 3.40% |
| 2 | `unfrozen_hero_10` (representative) | unfrozen | magic | 3.40% |
| 3 | `necro_hero_1` (representative) | undead | might | 2.61% |
| 4 | `necro_hero_10` (representative) | undead | magic | 2.61% |
| 5 | `human_hero_1` (representative) | human | might | 2.55% |
| 6 | `human_hero_10` (representative) | human | magic | 2.55% |

### Primal

| Rank | Hero | Faction | Class | p / roll |
|---:|---|---|---|---:|
| 1 | `demon_hero_1` (representative) | demon | might | 3.40% |
| 2 | `demon_hero_10` (representative) | demon | magic | 3.40% |
| 3 | `nature_hero_1` (representative) | nature | might | 3.40% |
| 4 | `nature_hero_10` (representative) | nature | magic | 3.40% |
| 5 | `dungeon_hero_1` (representative) | dungeon | might | 2.08% |
| 6 | `dungeon_hero_10` (representative) | dungeon | magic | 2.08% |
