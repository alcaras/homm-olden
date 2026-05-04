"""Hero scoring.

Three components per hero:

1. Starting army value
   sum over startSquad: unit.squadValue * (min+max)/2

2. Specialization weight
   number of bonus entries in the hero's specialization (proxy for power
   density — most heroes have linear scaling, so bonus count is a
   reasonable first cut).

3. Skill table odds — concentration of "good" skills the hero can roll.
   We compute Shannon-style "expected hits" on a hand-picked list of
   high-impact skills (assault, leadership, sorcery, mastery, etc.):
   skill_chance / sum(chances) at level 1, summed.

Composite "score" = z(army) + z(spec) + z(skills) — equal weight, just so
we can rank within faction.
"""

from __future__ import annotations

import csv
import json
import sqlite3
from collections import defaultdict
from pathlib import Path
from statistics import mean, pstdev

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "out" / "catalog.sqlite"
OUT = ROOT / "out"

con = sqlite3.connect(DB)

# Build unit squadValue lookup
unit_sv = {row[0]: row[1] for row in con.execute(
    "SELECT id, squad_value FROM units WHERE squad_value IS NOT NULL"
)}

# Build per-table skill chances at level 1 (the most common starting bucket)
# We pick the row with the lowest level_min to represent "early game" skill weights.
table_chances: dict[str, dict[str, int]] = {}
for tid, lo, hi, sid, ch in con.execute(
    "SELECT table_id, level_min, level_max, skill_sid, chance FROM skill_table"
):
    # Prefer a bucket that includes level 1; fall back to the first bucket seen.
    if tid not in table_chances or (lo == 1 and lo != -1):
        table_chances.setdefault(tid, {})
        # Use the bucket with smallest level_min that's >= 1
        pass
# Simpler: re-read and only keep the bucket that contains level 1
table_chances = defaultdict(dict)
for tid, lo, hi, sid, ch in con.execute(
    "SELECT table_id, level_min, level_max, skill_sid, chance FROM skill_table "
    "WHERE level_min <= 1 AND level_max >= 1"
):
    table_chances[tid][sid] = ch

# Hand-picked "high-impact" skills from the human/skill table inspection.
HIGH_IMPACT = {
    # Combat scalars
    "skill_assault", "skill_protection", "skill_resistance",
    "skill_formation", "skill_leadership", "skill_battle_artistry",
    # Magic scalars
    "skill_sorcery", "skill_mastery", "skill_summoner", "skill_battlemage",
    # Magic schools (one of them is usually the hero's specialty)
    "skill_magic_day", "skill_magic_night",
    "skill_magic_space", "skill_magic_primal",
    # Economy / utility
    "skill_logistic", "skill_diplomacy", "skill_enlightenment",
    "skill_economy", "skill_tactics", "skill_luck", "skill_scouting",
}


def skill_score(table_id: str | None) -> tuple[float, float]:
    """Return (high-impact share, raw total weight) for level-1 rolls."""
    if not table_id or table_id not in table_chances:
        return 0.0, 0.0
    weights = table_chances[table_id]
    total = sum(weights.values()) or 1.0
    hi = sum(c for s, c in weights.items() if s in HIGH_IMPACT)
    return hi / total, float(total)


# Specialization bonus counts
spec_bonus_count = {
    rid: len(json.loads(b)) for rid, b in con.execute(
        "SELECT id, bonuses_json FROM specializations"
    )
}

# Build hero records
rows = list(con.execute("""
    SELECT id, fraction, class_type, cost_gold, start_level,
           skills_table, specialization, mesh
    FROM heroes
"""))

records = []
for hid, frac, cls, cost, lvl, table, spec, mesh in rows:
    # Starting army value
    army = 0.0
    pieces = []
    for sid, mn, mx in con.execute(
        "SELECT unit_sid, min_count, max_count FROM hero_start_squad "
        "WHERE hero_id = ? AND alt = 0", (hid,)
    ):
        avg = ((mn or 0) + (mx or 0)) / 2
        sv = unit_sv.get(sid, 0)
        army += sv * avg
        pieces.append(f"{sid}×{avg:.0f}")
    spec_w = spec_bonus_count.get(spec, 0) if spec else 0
    hi_share, raw_total = skill_score(table)
    records.append({
        "id": hid,
        "fraction": frac or "?",
        "class": cls or "-",
        "cost": cost,
        "start_level": lvl,
        "table": table,
        "specialization": spec,
        "spec_bonus_count": spec_w,
        "skill_high_share": round(hi_share, 4),
        "skill_total_weight": int(raw_total),
        "army_value": round(army, 1),
        "army_pieces": ", ".join(pieces),
        "mesh": mesh,
    })


# Compute z-scores per faction (so within-faction ranking is fair).
def z(values: list[float]) -> list[float]:
    if not values:
        return []
    mu = mean(values)
    sd = pstdev(values) or 1.0
    return [(v - mu) / sd for v in values]


by_frac: dict[str, list[dict]] = defaultdict(list)
for r in records:
    by_frac[r["fraction"]].append(r)

for frac, lst in by_frac.items():
    a_z = z([r["army_value"] for r in lst])
    s_z = z([r["spec_bonus_count"] for r in lst])
    k_z = z([r["skill_high_share"] for r in lst])
    for r, az_, sz_, kz_ in zip(lst, a_z, s_z, k_z):
        r["army_z"] = round(az_, 3)
        r["spec_z"] = round(sz_, 3)
        r["skill_z"] = round(kz_, 3)
        r["score"] = round(az_ + sz_ + kz_, 3)


# CSV
csv_path = OUT / "hero_score.csv"
fields = ["score", "fraction", "class", "id", "specialization",
          "army_value", "army_z", "spec_bonus_count", "spec_z",
          "skill_high_share", "skill_z", "skill_total_weight",
          "table", "cost", "start_level", "army_pieces"]
with csv_path.open("w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in sorted(records, key=lambda r: -r["score"]):
        w.writerow({k: r.get(k) for k in fields})

# Markdown
md = ["# Hero scoring", ""]
md.append("Composite score = `z(army value) + z(spec bonuses) + z(skill mix)`,"
          " each component standardized within its own faction so rankings"
          " here are *intra-faction* — top-of-list is the strongest hero in"
          " that faction by this metric, not necessarily the strongest in the"
          " game.\n")
md.append("- **Army value** = Σ unit.squadValue × avg(min,max) over startSquad.\n"
          "- **Spec bonuses** = number of bonus entries on the hero's specialization "
          "(proxy for spec power density — assumes linear scaling).\n"
          "- **Skill mix** = share of the hero's level-1 skill table weight that lands "
          "on a hand-picked high-impact list "
          "(combat scalars, sorcery/mastery, magic schools, key economy skills).\n")

playable = {"human", "undead", "nature", "demon", "unfrozen", "dungeon"}

for frac in sorted(playable):
    lst = [r for r in by_frac.get(frac, [])
           if not r["id"].startswith(("campaign_", "tutorial_", "cm_"))]
    lst.sort(key=lambda r: -r["score"])
    if not lst:
        continue
    md.append(f"## {frac.capitalize()}")
    md.append("")
    md.append("| Rank | Hero | Class | Spec | Army | Spec# | Skill mix | Score |")
    md.append("|---:|---|---|---|---:|---:|---:|---:|")
    for i, r in enumerate(lst, 1):
        md.append(f"| {i} | `{r['id']}` | {r['class']} | "
                  f"`{r['specialization'] or '-'}` | "
                  f"{r['army_value']:.0f} | {r['spec_bonus_count']} | "
                  f"{r['skill_high_share']:.2%} | "
                  f"{r['score']:+.2f} |")
    md.append("")

# Cross-faction view: top 20 by raw army value (most useful for early-game decisions)
md.append("## Top 20 starting armies (raw squadValue)")
md.append("")
md.append("| Rank | Hero | Faction | Class | Army value | Composition |")
md.append("|---:|---|---|---|---:|---|")
for i, r in enumerate(sorted([rr for rr in records if rr["fraction"] in playable],
                              key=lambda rr: -rr["army_value"])[:20], 1):
    md.append(f"| {i} | `{r['id']}` | {r['fraction']} | {r['class']} | "
              f"{r['army_value']:.0f} | {r['army_pieces']} |")

(OUT / "hero_score.md").write_text("\n".join(md))
print(f"wrote {csv_path}")
print(f"wrote {OUT / 'hero_score.md'}")
print(f"heroes scored: {len(records)}")
