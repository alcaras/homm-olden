# Hero scoring

Composite score = `z(army value) + z(spec bonuses) + z(skill mix)`, each component standardized within its own faction so rankings here are *intra-faction* — top-of-list is the strongest hero in that faction by this metric, not necessarily the strongest in the game.

- **Army value** = Σ unit.squadValue × avg(min,max) over startSquad.
- **Spec bonuses** = number of bonus entries on the hero's specialization (proxy for spec power density — assumes linear scaling).
- **Skill mix** = share of the hero's level-1 skill table weight that lands on a hand-picked high-impact list (combat scalars, sorcery/mastery, magic schools, key economy skills).

## Demon

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `demon_hero_5` | might | `demon_hero_5_specialization` | 3864 | 16 | 82.98% | +1.86 |
| 2 | `demon_hero_2` | might | `demon_hero_2_specialization` | 3395 | 14 | 82.98% | +1.29 |
| 3 | `demon_hero_4` | might | `demon_hero_4_specialization` | 2808 | 14 | 82.98% | +1.29 |
| 4 | `demon_hero_7` | might | `demon_hero_7_specialization` | 2916 | 14 | 82.98% | +1.29 |
| 5 | `demon_hero_1` | might | `demon_hero_1_specialization` | 3864 | 9 | 82.98% | -0.15 |
| 6 | `demon_hero_3` | might | `demon_hero_3_specialization` | 3864 | 9 | 82.98% | -0.15 |
| 7 | `demon_hero_9` | might | `demon_hero_9_specialization` | 3864 | 9 | 82.98% | -0.15 |
| 8 | `demon_hero_17` | magic | `demon_hero_17_specialization` | 3174 | 15 | 76.60% | -0.43 |
| 9 | `demon_hero_8` | might | `demon_hero_8_specialization` | 3864 | 8 | 82.98% | -0.44 |
| 10 | `demon_hero_13` | magic | `demon_hero_13_specialization` | 2580 | 14 | 76.60% | -0.72 |
| 11 | `demon_hero_14` | magic | `demon_hero_14_specialization` | 3174 | 14 | 76.60% | -0.72 |
| 12 | `demon_hero_6` | might | `demon_hero_6_specialization` | 3864 | 6 | 82.98% | -1.01 |
| 13 | `demon_hero_11` | magic | `demon_hero_11_specialization` | 3174 | 9 | 76.60% | -2.16 |
| 14 | `demon_hero_10` | magic | `demon_hero_10_specialization` | 3174 | 8 | 76.60% | -2.44 |
| 15 | `demon_hero_12` | magic | `demon_hero_12_specialization` | 3174 | 8 | 76.60% | -2.44 |
| 16 | `demon_hero_15` | magic | `demon_hero_15_specialization` | 3174 | 8 | 76.60% | -2.44 |
| 17 | `demon_hero_16` | magic | `demon_hero_16_specialization` | 3174 | 8 | 76.60% | -2.44 |
| 18 | `demon_hero_18` | magic | `demon_hero_18_specialization` | 3174 | 7 | 76.60% | -2.73 |

## Dungeon

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `dungeon_hero_6` | might | `dungeon_hero_6_specialization` | 4088 | 14 | 83.33% | +3.95 |
| 2 | `dungeon_hero_3` | might | `dungeon_hero_3_specialization` | 3196 | 16 | 83.33% | +2.50 |
| 3 | `dungeon_hero_9` | might | `dungeon_hero_9_specialization` | 3196 | 15 | 83.33% | +2.21 |
| 4 | `dungeon_hero_1` | might | `dungeon_hero_1_specialization` | 2912 | 14 | 83.33% | +1.29 |
| 5 | `dungeon_hero_5` | might | `dungeon_hero_5_specialization` | 2646 | 14 | 83.33% | +0.68 |
| 6 | `dungeon_hero_4` | might | `dungeon_hero_4_specialization` | 2520 | 14 | 83.33% | +0.40 |
| 7 | `dungeon_hero_2` | might | `dungeon_hero_2_specialization` | 3196 | 8 | 83.33% | +0.23 |
| 8 | `dungeon_hero_7` | might | `dungeon_hero_7_specialization` | 3196 | 8 | 83.33% | +0.23 |
| 9 | `dungeon_hero_8` | might | `dungeon_hero_8_specialization` | 3196 | 8 | 83.33% | +0.23 |
| 10 | `dungeon_hero_16` | magic | `dungeon_hero_16_specialization` | 2956 | 14 | 77.08% | -0.43 |
| 11 | `dungeon_hero_17` | magic | `dungeon_hero_17_specialization` | 2673 | 15 | 77.08% | -0.78 |
| 12 | `dungeon_hero_18` | magic | `dungeon_hero_18_specialization` | 2673 | 15 | 77.08% | -0.78 |
| 13 | `dungeon_hero_13` | magic | `dungeon_hero_13_specialization` | 2205 | 14 | 77.08% | -2.13 |
| 14 | `dungeon_hero_10` | magic | `dungeon_hero_10_specialization` | 2673 | 9 | 77.08% | -2.48 |
| 15 | `dungeon_hero_11` | magic | `dungeon_hero_11_specialization` | 2673 | 8 | 77.08% | -2.77 |
| 16 | `dungeon_hero_12` | magic | `dungeon_hero_12_specialization` | 2673 | 8 | 77.08% | -2.77 |
| 17 | `dungeon_hero_14` | magic | `dungeon_hero_14_specialization` | 2673 | 8 | 77.08% | -2.77 |
| 18 | `dungeon_hero_15` | magic | `dungeon_hero_15_specialization` | 2673 | 8 | 77.08% | -2.77 |

## Human

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `human_hero_9` | might | `human_hero_9_specialization` | 3629 | 16 | 82.98% | +1.43 |
| 2 | `human_hero_7` | might | `human_hero_7_specialization` | 3409 | 14 | 82.98% | +0.92 |
| 3 | `human_hero_3` | might | `human_hero_3_specialization` | 2714 | 14 | 82.98% | +0.89 |
| 4 | `human_hero_4` | might | `human_hero_4_specialization` | 2594 | 14 | 82.98% | +0.89 |
| 5 | `human_hero_13` | magic | `human_hero_13_specialization` | 3046 | 15 | 76.60% | -0.36 |
| 6 | `human_hero_1` | might | `human_hero_1_specialization` | 3629 | 8 | 82.98% | -0.56 |
| 7 | `human_hero_2` | might | `human_hero_2_specialization` | 3629 | 8 | 82.98% | -0.56 |
| 8 | `human_hero_5` | might | `human_hero_5_specialization` | 3629 | 8 | 82.98% | -0.56 |
| 9 | `human_hero_6` | might | `human_hero_6_specialization` | 3629 | 8 | 82.98% | -0.56 |
| 10 | `human_hero_8` | might | `human_hero_8_specialization` | 3629 | 8 | 82.98% | -0.56 |
| 11 | `human_hero_12` | magic | `human_hero_12_specialization` | 3284 | 14 | 76.60% | -0.60 |
| 12 | `human_hero_11` | magic | `human_hero_11_specialization` | 3046 | 9 | 76.60% | -1.84 |
| 13 | `human_hero_10` | magic | `human_hero_10_specialization` | 3046 | 8 | 76.60% | -2.09 |
| 14 | `human_hero_14` | magic | `human_hero_14_specialization` | 3046 | 8 | 76.60% | -2.09 |
| 15 | `human_hero_15` | magic | `human_hero_15_specialization` | 3046 | 8 | 76.60% | -2.09 |
| 16 | `human_hero_16` | magic | `human_hero_16_specialization` | 3046 | 8 | 76.60% | -2.09 |
| 17 | `human_hero_17` | magic | `human_hero_17_specialization` | 3046 | 8 | 76.60% | -2.09 |
| 18 | `human_hero_18` | magic | `human_hero_18_specialization` | 3046 | 8 | 76.60% | -2.09 |

## Nature

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `nature_hero_3` | might | `nature_hero_3_specialization` | 2268 | 14 | 82.98% | +2.12 |
| 2 | `nature_hero_17` | magic | `nature_hero_17_specialization` | 2472 | 16 | 76.60% | +1.00 |
| 3 | `nature_hero_2` | might | `nature_hero_2_specialization` | 2993 | 9 | 82.98% | +0.38 |
| 4 | `nature_hero_9` | might | `nature_hero_9_specialization` | 2993 | 9 | 82.98% | +0.38 |
| 5 | `nature_hero_11` | magic | `nature_hero_11_specialization` | 2658 | 14 | 76.60% | +0.30 |
| 6 | `nature_hero_1` | might | `nature_hero_1_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 7 | `nature_hero_4` | might | `nature_hero_4_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 8 | `nature_hero_5` | might | `nature_hero_5_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 9 | `nature_hero_6` | might | `nature_hero_6_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 10 | `nature_hero_7` | might | `nature_hero_7_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 11 | `nature_hero_8` | might | `nature_hero_8_specialization` | 2993 | 8 | 82.98% | +0.02 |
| 12 | `nature_hero_10` | magic | `nature_hero_10_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 13 | `nature_hero_12` | magic | `nature_hero_12_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 14 | `nature_hero_13` | magic | `nature_hero_13_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 15 | `nature_hero_14` | magic | `nature_hero_14_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 16 | `nature_hero_15` | magic | `nature_hero_15_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 17 | `nature_hero_16` | magic | `nature_hero_16_specialization` | 2472 | 8 | 76.60% | -1.87 |
| 18 | `nature_hero_18` | magic | `nature_hero_18_specialization` | 2472 | 7 | 76.60% | -2.23 |

## Undead

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `necro_hero_5` | might | `necro_hero_5_specialization` | 2970 | 14 | 82.61% | +0.16 |
| 2 | `necro_hero_4` | might | `necro_hero_4_specialization` | 2380 | 14 | 82.61% | +0.14 |
| 3 | `necro_hero_3` | might | `necro_hero_3_specialization` | 1958 | 14 | 82.61% | +0.13 |
| 4 | `necro_hero_1` | might | `necro_hero_1_specialization` | 3352 | 9 | 82.61% | -0.33 |
| 5 | `necro_hero_2` | might | `necro_hero_2_specialization` | 3352 | 8 | 82.61% | -0.43 |
| 6 | `necro_hero_6` | might | `necro_hero_6_specialization` | 3352 | 8 | 82.61% | -0.43 |
| 7 | `necro_hero_7` | might | `necro_hero_7_specialization` | 3352 | 8 | 82.61% | -0.43 |
| 8 | `necro_hero_9` | might | `necro_hero_9_specialization` | 3352 | 8 | 82.61% | -0.43 |
| 9 | `necro_hero_8` | might | `necro_hero_8_specialization` | 3352 | 7 | 82.61% | -0.54 |
| 10 | `necro_hero_10` | magic | `necro_hero_10_specialization` | 2706 | 15 | 76.09% | -1.67 |
| 11 | `necro_hero_14` | magic | `necro_hero_14_specialization` | 2706 | 15 | 76.09% | -1.67 |
| 12 | `necro_hero_13` | magic | `necro_hero_13_specialization` | 3754 | 14 | 76.09% | -1.74 |
| 13 | `necro_hero_12` | magic | `necro_hero_12_specialization` | 2903 | 14 | 76.09% | -1.77 |
| 14 | `necro_hero_11` | magic | `necro_hero_11_specialization` | 2430 | 14 | 76.09% | -1.78 |
| 15 | `necro_hero_15` | magic | `necro_hero_15_specialization` | 2706 | 8 | 76.09% | -2.38 |
| 16 | `necro_hero_16` | magic | `necro_hero_16_specialization` | 2706 | 8 | 76.09% | -2.38 |
| 17 | `necro_hero_18` | magic | `necro_hero_18_specialization` | 2706 | 8 | 76.09% | -2.38 |
| 18 | `necro_hero_17` | magic | `necro_hero_17_specialization` | 2706 | 7 | 76.09% | -2.48 |

## Unfrozen

| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `unfrozen_hero_8` | might | `unfrozen_hero_8_specialization` | 3928 | 16 | 82.98% | +1.82 |
| 2 | `unfrozen_hero_7` | might | `unfrozen_hero_7_specialization` | 3928 | 15 | 82.98% | +1.53 |
| 3 | `unfrozen_hero_4` | might | `unfrozen_hero_4_specialization` | 3519 | 14 | 82.98% | +0.97 |
| 4 | `unfrozen_hero_5` | might | `unfrozen_hero_5_specialization` | 3201 | 14 | 82.98% | +0.77 |
| 5 | `unfrozen_hero_6` | might | `unfrozen_hero_6_specialization` | 2538 | 14 | 82.98% | +0.34 |
| 6 | `unfrozen_hero_14` | magic | `unfrozen_hero_14_specialization` | 3252 | 16 | 76.60% | -0.15 |
| 7 | `unfrozen_hero_3` | might | `unfrozen_hero_3_specialization` | 3928 | 9 | 82.98% | -0.22 |
| 8 | `unfrozen_hero_1` | might | `unfrozen_hero_1_specialization` | 3928 | 8 | 82.98% | -0.51 |
| 9 | `unfrozen_hero_2` | might | `unfrozen_hero_2_specialization` | 3928 | 8 | 82.98% | -0.51 |
| 10 | `unfrozen_hero_9` | might | `unfrozen_hero_9_specialization` | 3928 | 8 | 82.98% | -0.51 |
| 11 | `unfrozen_hero_13` | magic | `unfrozen_hero_13_specialization` | 3180 | 14 | 76.60% | -0.78 |
| 12 | `unfrozen_hero_18` | magic | `unfrozen_hero_18_specialization` | 3252 | 13 | 76.60% | -1.02 |
| 13 | `unfrozen_hero_12` | magic | `unfrozen_hero_12_specialization` | 2124 | 14 | 76.60% | -1.46 |
| 14 | `unfrozen_hero_10` | magic | `unfrozen_hero_10_specialization` | 3252 | 8 | 76.60% | -2.48 |
| 15 | `unfrozen_hero_11` | magic | `unfrozen_hero_11_specialization` | 3252 | 8 | 76.60% | -2.48 |
| 16 | `unfrozen_hero_15` | magic | `unfrozen_hero_15_specialization` | 3252 | 8 | 76.60% | -2.48 |
| 17 | `unfrozen_hero_16` | magic | `unfrozen_hero_16_specialization` | 3252 | 8 | 76.60% | -2.48 |
| 18 | `unfrozen_hero_17` | magic | `unfrozen_hero_17_specialization` | 3252 | 8 | 76.60% | -2.48 |

## Top 20 starting armies (raw squadValue)

| Rank | Hero | Faction | Class | Army value | Composition |
|---:|---|---|---|---:|---|
| 1 | `campaign_M10_hero_demon_generic_1` | demon | might | 2413465 | trick_demon_upg_alt×1000, locust_upg_alt×750, wasp_upg_alt×600, jaw_upg_alt×500, godslayer_upg_alt×450, olgoi_upg_alt×300, hive_queen_upg_alt×99 |
| 2 | `campaign_M10_hero_demon_generic_2` | demon | might | 2413465 | trick_demon_upg_alt×1000, locust_upg_alt×750, wasp_upg_alt×600, jaw_upg_alt×500, godslayer_upg_alt×450, olgoi_upg_alt×300, hive_queen_upg_alt×99 |
| 3 | `campaign_M10_hero_demon_generic_3` | demon | might | 2413465 | trick_demon_upg_alt×1000, locust_upg_alt×750, wasp_upg_alt×600, jaw_upg_alt×500, godslayer_upg_alt×450, olgoi_upg_alt×300, hive_queen_upg_alt×99 |
| 4 | `campaign_M10_hero_demon_generic_4` | demon | magic | 2413465 | trick_demon_upg×1000, locust_upg×750, wasp_upg×600, jaw_upg×500, godslayer_upg×450, olgoi_upg×300, hive_queen_upg×99 |
| 5 | `campaign_M10_hero_demon_generic_5` | demon | magic | 2413465 | trick_demon_upg×1000, locust_upg×750, wasp_upg×600, jaw_upg×500, godslayer_upg×450, olgoi_upg×300, hive_queen_upg×99 |
| 6 | `campaign_M10_hero_demon_generic_6` | demon | magic | 2413465 | trick_demon_upg×1000, locust_upg×750, wasp_upg×600, jaw_upg×500, godslayer_upg×450, olgoi_upg×300, hive_queen_upg×99 |
| 7 | `campaign_M10_hero_demon_4` | demon | might | 1979500 | godslayer_upg×250, olgoi_upg×150, hive_queen_upg_alt×50, godslayer_upg_alt×250, hive_queen_upg×50, olgoi_upg_alt×150, wasp_upg_alt×300 |
| 8 | `campaign_M10_hero_demon_3` | demon | might | 157150 | wasp_upg_alt×30, jaw_upg_alt×40, hive_queen_upg_alt×5, olgoi_upg×16, hive_queen_upg×5, jaw_upg×40, olgoi_upg_alt×8 |
| 9 | `tutorial_hero_c1_12` | undead | might | 127119 | skeleton_upg_alt×235, flicker_upg_alt×100, pet_upg×75, graverobber_upg_alt×42, avatar_of_war_upg×19, vampire_upg×10, lich×51 |
| 10 | `campaign_M4_hero_temple_1` | human | might | 111412 | esquire_upg_alt×240, sunlight_cavalry_upg×5, sunlight_cavalry×5, griffin_upg×80, sunlight_cavalry_upg×5, crossbowman_upg×164, griffin_upg_alt×80 |
| 11 | `campaign_M9_hero_temple_main` | human | might | 101364 | esquire_upg_alt×80, crossbowman_upg×64, wasp_upg×36, jaw_upg×20, sunlight_cavalry_upg_alt×12, olgoi_upg×16, angel×4 |
| 12 | `campaign_M9_hero_undead_npc` | undead | magic | 92035 | lich_upg×27, lich_upg_alt×27, pet_upg×54, graverobber_upg×34, lich_upg_alt×27, avatar_of_war_upg×15, pet_upg_alt×46 |
| 13 | `tutorial_hero_c1_14` | undead | might | 91827 | skeleton_upg_alt×470, flicker_upg_alt×175, pet_upg×103, graverobber_upg_alt×53, lich×51 |
| 14 | `campaign_M9_hero_undead_main` | undead | might | 91030 | skeleton_upg_alt×160, wasp_upg×36, jaw_upg×20, lich_upg_alt×24, skeleton_upg×160, olgoi_upg×16, vampire×6 |
| 15 | `campaign_M10_hero_demon_2` | demon | might | 80714 | godslayer_upg×10, jaw_upg×35, wasp_upg_alt×20, hive_queen×4, wasp_upg×20, jaw_upg_alt×35, godslayer_upg_alt×10 |
| 16 | `cm_fun_hero_human_1` | human | magic | 80436 | angel_upg×2, crossbowman_upg_alt×86, lightweaver_upg_alt×24, griffin_upg×35, inquisitor_upg×8, griffin_upg_alt×35, esquire_upg_alt×106 |
| 17 | `tutorial_hero_c1_11` | human | might | 78366 | inquisitor_upg×18, esquire_upg×151, lightweaver_upg_alt×75 |
| 18 | `campaign_M4_hero_sylvan_1` | nature | might | 75120 | twinkle_upg_alt×45, elf_tracker_upg×75, druid_upg_alt×15, ent_upg×30, druid_upg×15, elf_tracker_upg_alt×75, twinkle_upg×45 |
| 19 | `campaign_M5_hero_undead_1` | undead | might | 71160 | skeleton_upg_alt×600, skeleton×960, skeleton_upg×540 |
| 20 | `campaign_M5_hero_undead_2` | undead | magic | 54724 | lich_upg×12, graverobber_upg_alt×22, pet_upg×32, avatar_of_war_upg×8, lich_upg_alt×12, avatar_of_war_upg_alt×8, pet_upg_alt×32 |