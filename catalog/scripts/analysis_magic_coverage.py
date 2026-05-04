"""Magic school coverage matrix.

For each faction, look at each hero's skills_table and pull the level-1 chance
(weight) of the four magic-school skills:

    skill_magic_day, skill_magic_night, skill_magic_space, skill_magic_primal

Per-roll probability = chance / sum(table chances at level 1).

Outputs:
- A faction × school table of mean per-roll probability across that faction's heroes.
- A faction × school table split by class (might / magic).
- A magic-school inventory: counts per school × rank.
"""

from __future__ import annotations

import csv
import sqlite3
from collections import defaultdict
from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "out" / "catalog.sqlite"
OUT = ROOT / "out"

con = sqlite3.connect(DB)

SCHOOL_SKILLS = {
    "day": "skill_magic_day",
    "night": "skill_magic_night",
    "space": "skill_magic_space",
    "primal": "skill_magic_primal",
}

# Per-table level-1 weights
table_weights: dict[str, dict[str, int]] = defaultdict(dict)
for tid, sid, ch in con.execute(
    "SELECT table_id, skill_sid, chance FROM skill_table "
    "WHERE level_min <= 1 AND level_max >= 1"
):
    table_weights[tid][sid] = ch

table_total = {tid: sum(w.values()) for tid, w in table_weights.items()}


def per_roll_prob(table_id: str, skill_sid: str) -> float:
    if not table_id or table_id not in table_weights:
        return 0.0
    total = table_total[table_id] or 1
    return table_weights[table_id].get(skill_sid, 0) / total


# Heroes (skip campaign / tutorial / cm)
heroes = list(con.execute("""
    SELECT id, fraction, class_type, skills_table
    FROM heroes
    WHERE id NOT LIKE 'campaign_%' AND id NOT LIKE 'tutorial_%' AND id NOT LIKE 'cm_%'
"""))

playable = ["human", "undead", "nature", "demon", "unfrozen", "dungeon"]

rows = []  # for CSV: hero, faction, class, school, prob
faction_school: dict[tuple[str, str], list[float]] = defaultdict(list)
faction_class_school: dict[tuple[str, str, str], list[float]] = defaultdict(list)

for hid, frac, cls, table in heroes:
    if frac not in playable:
        continue
    for school, skill in SCHOOL_SKILLS.items():
        p = per_roll_prob(table, skill)
        rows.append({"hero": hid, "fraction": frac, "class": cls or "-",
                     "school": school, "table": table, "p_per_roll": round(p, 5)})
        faction_school[(frac, school)].append(p)
        faction_class_school[(frac, cls or "-", school)].append(p)


# CSV
csv_path = OUT / "magic_coverage.csv"
with csv_path.open("w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["hero", "fraction", "class", "school", "table", "p_per_roll"])
    w.writeheader()
    w.writerows(rows)


# Markdown
md = ["# Magic school coverage", ""]
md.append("Each row gives the **per-roll probability** that a hero's level-1 skill"
          " offer includes that magic school skill (chance / sum of table weights)."
          " This is what you face every time the game offers you a skill —"
          " think of it as base rate per offered slot. The actual probability of"
          " ever rolling the school by level N is computed in a separate"
          " subclass-odds analysis (it depends on offering rules).\n")

md.append("## Magic schools by faction (mean across all hero variants)")
md.append("")
md.append("| Faction | Day | Night | Space | Primal |")
md.append("|---|---:|---:|---:|---:|")
for frac in playable:
    cells = []
    for school in ("day", "night", "space", "primal"):
        ps = faction_school.get((frac, school), [])
        cells.append(f"{mean(ps):.2%}" if ps else "-")
    md.append(f"| {frac} | " + " | ".join(cells) + " |")
md.append("")

md.append("## By class (might vs magic)")
md.append("")
md.append("| Faction | Class | Day | Night | Space | Primal |")
md.append("|---|---|---:|---:|---:|---:|")
for frac in playable:
    for cls in ("might", "magic"):
        cells = []
        for school in ("day", "night", "space", "primal"):
            ps = faction_class_school.get((frac, cls, school), [])
            cells.append(f"{mean(ps):.2%}" if ps else "-")
        md.append(f"| {frac} | {cls} | " + " | ".join(cells) + " |")
md.append("")

# Magic spell inventory
md.append("## Spell inventory by school × rank")
md.append("")
md.append("| School | Rank 1 | Rank 2 | Rank 3 | Rank 4 | Rank 5 | Total |")
md.append("|---|---:|---:|---:|---:|---:|---:|")
inv: dict[tuple[str, int], int] = defaultdict(int)
for school, rank in con.execute("SELECT school, rank FROM magics"):
    inv[(school or "?", rank or 0)] += 1
schools = ["day", "night", "space", "primal", "neutral"]
for s in schools:
    cells = [inv.get((s, r), 0) for r in range(1, 6)]
    md.append(f"| {s} | " + " | ".join(str(c) for c in cells) + f" | {sum(cells)} |")
md.append("")

# Best / worst hero per school (highest p_per_roll)
md.append("## Top heroes per school (highest per-roll probability)")
md.append("")
for school in ("day", "night", "space", "primal"):
    md.append(f"### {school.capitalize()}")
    md.append("")
    md.append("| Rank | Hero | Faction | Class | p / roll |")
    md.append("|---:|---|---|---|---:|")
    school_rows = sorted(
        [r for r in rows if r["school"] == school],
        key=lambda r: -r["p_per_roll"]
    )
    seen_table = set()
    out_rows = []
    for r in school_rows:
        # de-dupe by (table, p) — heroes that share a table will tie; show once.
        key = (r["table"], r["p_per_roll"])
        if key in seen_table:
            continue
        seen_table.add(key)
        out_rows.append(r)
    for i, r in enumerate(out_rows[:6], 1):
        md.append(f"| {i} | `{r['hero']}` (representative) | {r['fraction']} | {r['class']} | "
                  f"{r['p_per_roll']:.2%} |")
    md.append("")

(OUT / "magic_coverage.md").write_text("\n".join(md))
print(f"wrote {csv_path}")
print(f"wrote {OUT / 'magic_coverage.md'}")
print(f"hero/school rows: {len(rows)}")
