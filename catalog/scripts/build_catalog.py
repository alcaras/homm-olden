"""Walk DB/ and load every entity into a SQLite catalog.

Schema:
  entities         (id, category, subcategory, fraction, tier, source_path, json)  -- generic store
  units            (id, fraction, tier, squad_value, exp_bonus, cost_gold,
                    hp, offence, defence, dmg_min, dmg_max, initiative, speed,
                    upgrade_sid, ai, tags_json, source_path)
  heroes           (id, fraction, class_type, cost_gold, start_level,
                    skills_table, specialization, mesh, source_path)
  hero_start_squad (hero_id, slot_idx, alt INT, unit_sid, min_count, max_count)
  hero_start_skill (hero_id, skill_sid, skill_level)
  hero_start_magic (hero_id, magic_sid)
  magics           (id, school, rank, used_on_map INT, source_path)
  skill_table      (table_id, level_min, level_max, skill_sid, chance, source_path)
  specializations  (id, name_token, desc_token, source_path)

The `entities` table keeps the full JSON so anything we forgot to extract is still queryable
via SQLite's JSON1 functions.
"""

from __future__ import annotations

import json
import sqlite3
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "raw"
DB_DIR = RAW / "DB"
OUT = ROOT / "out" / "catalog.sqlite"
OUT.parent.mkdir(parents=True, exist_ok=True)
if OUT.exists():
    OUT.unlink()

con = sqlite3.connect(OUT)
con.executescript("""
CREATE TABLE entities (
    id TEXT, category TEXT, subcategory TEXT,
    fraction TEXT, tier INT,
    source_path TEXT,
    json TEXT
);
CREATE INDEX entities_id ON entities(id);
CREATE INDEX entities_cat ON entities(category, subcategory);

CREATE TABLE units (
    id TEXT PRIMARY KEY, fraction TEXT, tier INT,
    squad_value REAL, exp_bonus REAL, cost_gold REAL,
    hp REAL, offence REAL, defence REAL,
    dmg_min REAL, dmg_max REAL,
    initiative REAL, speed REAL,
    upgrade_sid TEXT, ai TEXT, tags_json TEXT,
    is_upgrade INT, is_alt INT,
    source_path TEXT
);

CREATE TABLE heroes (
    id TEXT PRIMARY KEY, fraction TEXT, class_type TEXT,
    cost_gold REAL, start_level INT,
    skills_table TEXT, specialization TEXT, mesh TEXT,
    source_path TEXT
);

CREATE TABLE hero_start_squad (
    hero_id TEXT, slot_idx INT, alt INT,
    unit_sid TEXT, min_count INT, max_count INT
);
CREATE INDEX hss_hero ON hero_start_squad(hero_id);

CREATE TABLE hero_start_skill (
    hero_id TEXT, skill_sid TEXT, skill_level INT
);
CREATE INDEX hssk_hero ON hero_start_skill(hero_id);

CREATE TABLE hero_start_magic (hero_id TEXT, magic_sid TEXT);
CREATE INDEX hsm_hero ON hero_start_magic(hero_id);

CREATE TABLE magics (
    id TEXT PRIMARY KEY, school TEXT, rank INT,
    used_on_map INT, name_token TEXT, source_path TEXT
);

CREATE TABLE skill_table (
    table_id TEXT, level_min INT, level_max INT,
    skill_sid TEXT, chance INT, source_path TEXT
);
CREATE INDEX st_table ON skill_table(table_id);

CREATE TABLE specializations (
    id TEXT PRIMARY KEY, name_token TEXT, desc_token TEXT,
    bonuses_json TEXT, source_path TEXT
);
""")


def cat_subcat(rel: Path) -> tuple[str, str]:
    """raw/DB/<cat>/<...> -> ('cat', '/'.join(intermediate dirs))"""
    parts = rel.parts  # e.g. ('DB', 'units', 'units_logics', 'demons', 'wasp_l.json')
    if len(parts) <= 2:
        return parts[1] if len(parts) > 1 else "?", ""
    cat = parts[1]
    sub = "/".join(parts[2:-1])
    return cat, sub


def insert_entity(con, rec, cat, sub, src):
    con.execute(
        "INSERT INTO entities(id,category,subcategory,fraction,tier,source_path,json) VALUES(?,?,?,?,?,?,?)",
        (
            rec.get("id"),
            cat,
            sub,
            rec.get("fraction"),
            rec.get("tier") if isinstance(rec.get("tier"), int) else None,
            src,
            json.dumps(rec, ensure_ascii=False, separators=(",", ":")),
        ),
    )


def index_unit(con, rec, src):
    """Only index from units_logics (units_views are presentation-only)."""
    if "units_logics" not in src:
        return
    rid = rec.get("id")
    if not rid:
        return
    stats = rec.get("stats") or {}
    cost_gold = None
    for r in (rec.get("unitCost") or {}).get("costResArray") or []:
        if r.get("name") == "gold":
            cost_gold = r.get("cost")
            break
    is_upgrade = 1 if rid.endswith("_upg") or "_upg_" in rid else 0
    is_alt = 1 if rid.endswith("_upg_alt") else 0
    con.execute(
        """INSERT OR REPLACE INTO units VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (
            rid,
            rec.get("fraction"),
            rec.get("tier"),
            rec.get("squadValue"),
            rec.get("expBonus"),
            cost_gold,
            stats.get("hp"),
            stats.get("offence"),
            stats.get("defence"),
            stats.get("damageMin"),
            stats.get("damageMax"),
            stats.get("initiative"),
            stats.get("speed"),
            rec.get("upgradeSid"),
            rec.get("ai"),
            json.dumps(rec.get("tags") or [], ensure_ascii=False),
            is_upgrade, is_alt,
            src,
        ),
    )


def index_hero(con, rec, src):
    rid = rec.get("id")
    if not rid:
        return
    con.execute(
        "INSERT OR REPLACE INTO heroes VALUES (?,?,?,?,?,?,?,?,?)",
        (
            rid,
            rec.get("fraction"),
            rec.get("classType"),
            rec.get("costGold"),
            rec.get("startLevel"),
            rec.get("skillsRollVariant"),
            rec.get("specialization"),
            rec.get("mesh"),
            src,
        ),
    )
    for i, st in enumerate(rec.get("startSquad") or []):
        con.execute(
            "INSERT INTO hero_start_squad VALUES (?,?,?,?,?,?)",
            (rid, i, 0, st.get("sid"), st.get("min"), st.get("max")),
        )
    for i, st in enumerate(rec.get("startSquadAlt") or []):
        con.execute(
            "INSERT INTO hero_start_squad VALUES (?,?,?,?,?,?)",
            (rid, i, 1, st.get("sid"), st.get("min"), st.get("max")),
        )
    for sk in rec.get("startSkills") or []:
        con.execute(
            "INSERT INTO hero_start_skill VALUES (?,?,?)",
            (rid, sk.get("sid"), sk.get("skillLevel")),
        )
    for mg in rec.get("startMagics") or []:
        sid = mg if isinstance(mg, str) else mg.get("sid") if isinstance(mg, dict) else None
        if sid:
            con.execute("INSERT INTO hero_start_magic VALUES (?,?)", (rid, sid))


def index_magic(con, rec, src):
    rid = rec.get("id")
    if not rid:
        return
    con.execute(
        "INSERT OR REPLACE INTO magics VALUES (?,?,?,?,?,?)",
        (
            rid,
            rec.get("school_") or rec.get("school"),
            rec.get("rank"),
            1 if rec.get("usedOnMap") else 0,
            rec.get("name"),
            src,
        ),
    )


def index_skill_table(con, rec, src):
    tid = rec.get("id")
    for lst in rec.get("defaultList") or []:
        levels = lst.get("levels") or []
        if not levels:
            continue
        lo = min(levels)
        hi = max(levels)
        for rc in lst.get("rollChances") or []:
            con.execute(
                "INSERT INTO skill_table VALUES (?,?,?,?,?,?)",
                (tid, lo, hi, rc.get("sid"), rc.get("chance"), src),
            )


def index_specialization(con, rec, src):
    rid = rec.get("id")
    if not rid:
        return
    con.execute(
        "INSERT OR REPLACE INTO specializations VALUES (?,?,?,?,?)",
        (
            rid,
            rec.get("name"),
            rec.get("desc"),
            json.dumps(rec.get("bonuses") or [], ensure_ascii=False),
            src,
        ),
    )


total = 0
for path in sorted(DB_DIR.rglob("*.json")):
    rel = path.relative_to(RAW)
    cat, sub = cat_subcat(rel)
    src = str(rel)
    try:
        records = load_array(path)
    except Exception as e:
        print("LOAD FAIL", src, e)
        continue
    if not isinstance(records, list):
        records = [records] if records else []
    for rec in records:
        if not isinstance(rec, dict):
            continue
        total += 1
        insert_entity(con, rec, cat, sub, src)
        if cat == "units":
            index_unit(con, rec, src)
        elif cat == "heroes":
            index_hero(con, rec, src)
        elif cat == "magics":
            index_magic(con, rec, src)
        elif cat == "heroes_skills" and "skills_by_level_tables" in sub:
            index_skill_table(con, rec, src)
        elif cat == "heroes_specializations":
            index_specialization(con, rec, src)

con.commit()


def count(q: str) -> int:
    return con.execute(q).fetchone()[0]


print(f"entities loaded: {total}")
print(f"  entities table: {count('SELECT COUNT(*) FROM entities')}")
print(f"  units:          {count('SELECT COUNT(*) FROM units')}")
print(f"  heroes:         {count('SELECT COUNT(*) FROM heroes')}")
print(f"  magics:         {count('SELECT COUNT(*) FROM magics')}")
print(f"  skill_table:    {count('SELECT COUNT(*) FROM skill_table')}")
print(f"  specializations:{count('SELECT COUNT(*) FROM specializations')}")
print(f"  hero_start_squad:{count('SELECT COUNT(*) FROM hero_start_squad')}")

con.close()
print(f"wrote {OUT}")
