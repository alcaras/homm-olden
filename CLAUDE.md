# CLAUDE.md — HOMM Olden Era datamine + reference site

Project notes for future Claude Code sessions in this repo.

## What this is

A datamine of *Heroes of Might and Magic: Olden Era* (Unfrozen / Hooded Horse, Unity / IL2CPP build) plus a single-page React reference site published to GitHub Pages at <https://alcaras.github.io/homm-olden/>.

GitHub repo: `alcaras/homm-olden`. Pages source = `/docs` on `main`, with a `.nojekyll` file so GitHub serves the raw files instead of running Jekyll.

## Layout

```
HeroesOldenEra_Data/         # Game install (gitignored — copyrighted)
  StreamingAssets/Core.zip   # ~7800 hand-authored JSON5-ish data files
  resources.assets / .resS   # ~4 GB Unity bundle holding all art assets
  boot.config                # game build-guid lives here

catalog/
  raw/                       # Extracted Core.zip (gitignored — copyrighted)
    DB/                      # Most files we touch
    Lang/english/texts/      # Localized display names
  scripts/                   # All Python build scripts
    load_json.py             # Tolerant loader (BOMs, // comments, trailing commas)
    build_catalog.py         # Generic SQLite catalog of every entity
    build_classes_json.py    # 12 classes × stats × skill weights × subclasses
    build_specializations_json.py  # All 126 hero specializations
    build_heroes_starting_skills.py
    build_data_js.py         # Generates docs/data.js (the SPA's data)
    extract_images.py        # Pulls 388 PNGs from resources.assets via UnityPy
    analysis_*.py            # tier list, hero score, magic coverage
  out/                       # Generated artifacts (committed)
    catalog.sqlite, classes.json, specializations.json, *.csv, *.md

docs/                        # GitHub Pages root (committed)
  index.html                 # Loads React + Babel from CDN, no build step
  app.jsx                    # Hash-routed shell; tabs: index/subclasses/heroes/units
  index-view.jsx             # Cards + faction strip
  subclasses-view.jsx        # 24×20 sparse-matrix subclass map
  heroes-view.jsx            # Flat sortable hero table, multi-select factions
  units-view.jsx             # Sortable unit table with hover tooltips
  data.js                    # Generated; window.OE_DATA = { FACTIONS, SUBCLASSES, HEROES, UNITS, META }
  style.css                  # Tufte-inspired (cream paper, charter serif)
  img/{factions,heroes,units,specs}/  # 388 PNGs
  .nojekyll
```

## Reproducing from a clean game install

1. Game install at `~/Library/.../Heroes of Might and Magic Olden Era/HeroesOldenEra_Data` symlinked or copied into the repo root.
2. `python3 -c "<the unzip snippet from README.md>"` extracts `Core.zip` → `catalog/raw/`.
3. `python3 catalog/scripts/build_data_js.py` regenerates `docs/data.js`.
4. `python3 -m venv .venv && .venv/bin/pip install UnityPy` then `.venv/bin/python catalog/scripts/extract_images.py` regenerates `docs/img/`.
5. Optional: `python3 catalog/scripts/build_catalog.py`, `build_classes_json.py`, `build_specializations_json.py`, `analysis_*.py` for the SQLite catalog and analyses.

Local preview: `cd docs && python3 -m http.server 8000` — no Jekyll/Ruby needed.

## Conventions and gotchas

- **JSONs are not strict JSON.** Always go through `load_json.load_array()`. They have BOMs, `//` line comments, occasional trailing commas, and the wrapper `{"array": [...]}`.
- **Localization wrapper differs.** `Lang/english/texts/*.json` are wrapped as `{"tokens": [...]}` and `Lang/args/*.json` as `{"tokensArgs": [...]}`. Each entry is `{sid, text}`.
- **Faction id duality.** In-game `fraction` field uses keys `human / undead / nature / demon / unfrozen / dungeon`. Display ids in the site use `temple / necropolis / sylvan / hive / schism / dungeon` (the in-game class titles). `data.js` FACTIONS records map both via `id` (display) and `unitKey` (in-game). Heroes/units in `data.js` use the display id.
- **Sylvan is renamed Grove** in the UI.
- **Attack-type mapping (verified against unit data, not the field names):**
  - `attackType_ = "melee"` → "Melee"
  - `attackType_ = "shoot"` → "Ranged" (archers, mages — `shoot_attack` damage tag, `range_type` AI). E.g. crossbowman, succubus, **Faun = `elf_tracker`**, lich.
  - `attackType_ = "range"` → "Long" (long-reach melee — `range_attack` tag, `reach_type` AI). E.g. unfrozen_cultist, trick_demon.
  - Source counts: 104 / 35 / 13. Don't guess from the keyword names; they are misleading.
- **Image asset names.** Heroes: `hero_<faction>_<n>_<name>` exactly as JSON `icon` field. Specs: `<spec_id>` exactly. Factions: `fraction_<key>` (preferred) or `<key>_icon` (fallback). Units: title-cased `Icon_<UnitId>` with one alias (`trogl` → `Troglodyte`) and a few units that use bare-id names (`halfling`, `unfrozen_cultist`, `dragon_hunter`); see `extract_images.py` for the fallback chain.
- **Image extraction needs `resources.assets`** (~1 GB), not `level*` / `sharedassets*.assets`. The smaller bundles only contain UI elements (Card_Fraction_Top etc.), not portraits or unit icons.
- **Class-locked skills** never appear in subclass conditions: `skill_battle_artistry` (Combat, might-only) and `skill_wisdom` (Thaumaturgy, magic-only). Subclass universe is exactly 20 skills; `skill_siege` (Siegecraft) and `skill_trainer` (Recruitment) are also never required.
- **Subclass recipe is uniformly 1-1-1-2** across Combat / Magic-craft / School / Utility for all 24 subclasses. The matrix surfaces this; see footer note on `subclasses-view.jsx`.
- **Stat-roll breakpoint is level 24**, not 12 (some legacy HOMM doc uses 12). All heroes within a faction-class share starting stats, statsRolls, and skill table.
- **Subclass requirement = level 3** in each of 5 specific main skills. A skill has 3 levels, so 15 advances total. Heroes start with 1–2 skills at L1, or 1 skill at L2.
- **Specialization descriptions** still contain `{0}/{1}/{2}` placeholders; resolution requires walking the spec's `bonuses` block via the runtime arg resolver. Not implemented. `specializations.json` includes `descriptionArgs` mapping each placeholder to a named runtime variable.
- **Game version**: there is no semver. `boot.config` has a `build-guid`; `Core.zip` mtime is the data freshness. Footer surfaces both.
- **`gh` CLI is authenticated** as account `alcaras` (active). `drabiej` also logged in but inactive.
- **Don't push raw game data**. `.gitignore` excludes `HeroesOldenEra_Data/` and `catalog/raw/`. The 114 MB of extracted icons in `docs/img/` is committed under fan-content disclaimer in README.

## Common tasks

- **After a game patch**: re-extract `Core.zip` → `catalog/raw/`; rerun `build_data_js.py`; if art changed, rerun `extract_images.py`. Commit + push triggers Pages rebuild (~30–60s).
- **Adding a new view / column**: data lives in `data.js` (regenerate after schema change), components in `docs/*-view.jsx`, hash route in `docs/app.jsx` `VIEWS` array.
- **CSS changes**: `docs/style.css`. Color tokens in `:root`. Multi-select segmented controls use `.seg.multi`; single-select uses `.seg`.
- **Tooltips**: see the `.u-tooltip` pattern in `style.css` + the corresponding markup in `units-view.jsx` for the hover-revealed pattern with auto-flip near the bottom.

## Don't

- Don't add Jekyll back. The `.nojekyll` is intentional — keeps deploys instant and lets `.jsx` / nested folders work.
- Don't rename the in-game `fraction` keys; only the display layer renames them. Anything that joins on raw JSONs needs the in-game key.
- Don't trust the `attackType_` keyword name. Verify mapping against `damageDealer.tags[0]` (`shoot_attack` vs `range_attack`) and the unit's `ai` field.
- Don't manually edit `docs/data.js` or `docs/img/*` — both are generated. Edit the source script and rerun.
