"""Tier list: squadValue / costGold per unit, with per-tier normalization."""

from __future__ import annotations

import csv
import sqlite3
from pathlib import Path
from statistics import mean, pstdev

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "out" / "catalog.sqlite"
OUT = ROOT / "out"

con = sqlite3.connect(DB)
rows = list(con.execute("""
    SELECT id, fraction, tier, squad_value, cost_gold, exp_bonus,
           hp, offence, defence, dmg_min, dmg_max, initiative, speed,
           is_upgrade, is_alt
    FROM units
    WHERE squad_value IS NOT NULL AND cost_gold IS NOT NULL AND cost_gold > 0
    ORDER BY tier, fraction, id
"""))
con.close()

records = []
for (uid, frac, tier, sv, cost, expb, hp, off, dfn, dmin, dmax, init, spd, is_up, is_alt) in rows:
    variant = "alt" if is_alt else ("upg" if is_up else "base")
    records.append({
        "id": uid, "fraction": frac, "tier": tier,
        "variant": variant,
        "squad_value": sv, "cost_gold": cost,
        "value_per_gold": round(sv / cost, 4),
        "exp_bonus": expb,
        "hp": hp, "offence": off, "defence": dfn,
        "dmg_avg": (dmin + dmax) / 2 if dmin is not None and dmax is not None else None,
        "initiative": init, "speed": spd,
    })

# Per-tier z-scores so we can compare across tiers fairly.
by_tier: dict[int, list[float]] = {}
for r in records:
    by_tier.setdefault(r["tier"], []).append(r["value_per_gold"])
tier_stats = {t: (mean(v), pstdev(v) or 1.0) for t, v in by_tier.items()}
for r in records:
    mu, sd = tier_stats[r["tier"]]
    r["vpg_z"] = round((r["value_per_gold"] - mu) / sd, 3)

# CSV: full data, sorted by tier then z-score desc
csv_path = OUT / "tier_list.csv"
fields = ["tier", "fraction", "id", "variant", "squad_value", "cost_gold",
          "value_per_gold", "vpg_z", "hp", "offence", "defence", "dmg_avg",
          "initiative", "speed", "exp_bonus"]
with csv_path.open("w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=fields)
    w.writeheader()
    for r in sorted(records, key=lambda r: (r["tier"], -r["vpg_z"])):
        w.writerow({k: r.get(k) for k in fields})

# Markdown summary: per-tier ranking, playable factions only
md = ["# Unit tier list — squadValue / costGold", ""]
md.append("`squad_value/cost_gold` is the game's own internal balance scalar divided by gold price. "
          "Higher = more value per gold spent. `vpg_z` is the z-score within the same tier so you can "
          "compare across tiers.\n")
md.append("Variants: `base` = recruitable, `upg` = standard upgrade, `alt` = alternate upgrade. "
          "Neutrals shown separately.\n")

playable = {"human", "undead", "nature", "demon", "unfrozen", "dungeon"}

for tier in sorted({r["tier"] for r in records if r["fraction"] in playable}):
    md.append(f"## Tier {tier}")
    md.append("")
    md.append("| Rank | Unit | Faction | Variant | SV | Cost | SV/Cost | z |")
    md.append("|---:|---|---|---|---:|---:|---:|---:|")
    tier_rows = [r for r in records if r["tier"] == tier and r["fraction"] in playable]
    tier_rows.sort(key=lambda r: -r["value_per_gold"])
    for i, r in enumerate(tier_rows, 1):
        md.append(f"| {i} | `{r['id']}` | {r['fraction']} | {r['variant']} | "
                  f"{r['squad_value']:.0f} | {r['cost_gold']:.0f} | "
                  f"{r['value_per_gold']:.3f} | {r['vpg_z']:+.2f} |")
    md.append("")

# Top 10 across the whole game
md.append("## Top 20 best-value units overall")
md.append("")
md.append("| Rank | Unit | Tier | Faction | Variant | SV/Cost | z |")
md.append("|---:|---|---:|---|---|---:|---:|")
all_rows = [r for r in records if r["fraction"] in playable]
all_rows.sort(key=lambda r: -r["vpg_z"])
for i, r in enumerate(all_rows[:20], 1):
    md.append(f"| {i} | `{r['id']}` | {r['tier']} | {r['fraction']} | {r['variant']} | "
              f"{r['value_per_gold']:.3f} | {r['vpg_z']:+.2f} |")
md.append("")

# Faction summaries: avg z per faction (positive = faction is gold-efficient)
md.append("## Faction efficiency")
md.append("")
md.append("Mean z-score across all faction units (playable only).\n")
md.append("| Faction | Mean z | Best base | Best upg |")
md.append("|---|---:|---|---|")
for frac in sorted(playable):
    fr = [r for r in records if r["fraction"] == frac]
    if not fr:
        continue
    mz = mean(r["vpg_z"] for r in fr)
    base = max((r for r in fr if r["variant"] == "base"), key=lambda r: r["vpg_z"], default=None)
    upg  = max((r for r in fr if r["variant"] != "base"), key=lambda r: r["vpg_z"], default=None)
    md.append(f"| {frac} | {mz:+.2f} | "
              f"{base['id'] if base else '-'} ({base['vpg_z']:+.2f}) | "
              f"{upg['id'] if upg else '-'} ({upg['vpg_z']:+.2f}) |")
md.append("")

(OUT / "tier_list.md").write_text("\n".join(md))
print(f"wrote {csv_path}")
print(f"wrote {OUT / 'tier_list.md'}")
print(f"units indexed: {len(records)}")
