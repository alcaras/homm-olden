"""Emit docs/astrology-data.js — the Astrology & Insight planner data.

Mechanic (verified from game data + tutorial/UI strings):
  - Cities produce Astrology points daily (central building level + the
    faction's astrology law).
  - Accumulated Astrology points raise your Astrology Level. The cumulative
    threshold per level is `astrology_exp/astrology_exp.json` → `exp_standard`.
  - Each Astrology Level grants one Insight (in-data resource `starDust`).
  - Insight is spent to unlock + upgrade the high Neutral Global-Map spells
    (world_neutral_magics.json entries whose upgradeRes is starDust).

Sources:
  catalog/raw/DB/astrology_exp/astrology_exp.json   (the level ladder)
  catalog/raw/DB/magics/world_neutral_magics.json   (insight spell costs)
  catalog/raw/DB/objects_logic/cities/*_city.json   (central-building output)
  catalog/raw/DB/fractions_laws/fractions_laws_table_*.json (astrology laws)
  catalog/raw/Lang/english/texts/*.json             (display names/desc)
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT = ROOT / "docs" / "astrology-data.js"

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

UKEY_TO_DID = {
    "human": "temple", "undead": "necropolis", "nature": "grove",
    "demon": "hive", "unfrozen": "schism", "dungeon": "dungeon",
}


def _toks(path: Path) -> dict[str, str]:
    t = path.read_text(encoding="utf-8-sig", errors="replace")
    t = re.sub(r"//[^\n]*", "", t)
    t = re.sub(r",(\s*[}\]])", r"\1", t)
    return {e["sid"]: e.get("text", "")
            for e in json.loads(t).get("tokens", []) if "sid" in e}


def build():
    L = {}
    for p in (RAW / "Lang" / "english" / "texts").glob("*.json"):
        try:
            L.update(_toks(p))
        except Exception:
            pass

    # --- 1. Astrology Level ladder ---
    astro = load_array(RAW / "DB" / "astrology_exp" / "astrology_exp.json")
    table = next((t for t in astro if t.get("id") == "exp_standard"), astro[0])
    # values[i] = cumulative astrology XP needed to reach level i+1.
    # Level 1 = 0 XP (start); each subsequent level grants +1 Insight.
    ladder = [int(v) for v in table["values"]]

    # --- 2. Insight-gated Neutral global-map spells ---
    spells = []
    for m in load_array(RAW / "DB" / "magics" / "world_neutral_magics.json"):
        if m.get("upgradeRes") != "starDust":
            continue
        lc = m.get("learnCost") or []
        learn = next((c["cost"] for c in lc if c.get("name") == "starDust"), None)
        if learn is None:
            continue
        sid = m["id"]
        desc = L.get(f"{sid}_description", "")
        spells.append({
            "id": sid,
            "name": L.get(f"{sid}_name", sid),
            "rank": m.get("rank", 0),
            "insightLearn": learn,
            "insightUpgrades": [int(x) for x in (m.get("upgradeCost") or [])],
            "desc": re.sub(r"\{[0-9]+\}", "?", desc),
            "icon": m.get("icon", sid),
        })
    spells.sort(key=lambda s: (s["rank"], s["insightLearn"], s["name"]))

    # --- 3. Central-building astrology output per level (uniform across
    #        factions, but read it rather than hardcode). Two parts:
    #        - base `bonusesPerLevel` astrology (always on)
    #        - optional astrology effect from `optionalEffectsPerLevel`
    #          (the central building's pick-one optional upgrade at L2/L3;
    #          the other options are gold or city XP). Index aligns to
    #          building level: idx 0 = L1, idx 1 = L2, idx 2 = L3.
    central, central_opt = [], []
    hc = load_array(RAW / "DB" / "objects_logic" / "cities" / "human_city.json")
    main = (hc[0].get("mains") or [{}])[0] if hc else {}
    for bp in main.get("bonusesPerLevel", []):
        amt = 0
        for b in bp.get("bonuses", []):
            if b.get("type") == "astrologyExp":
                amt = int(b["parameters"][0])
        central.append(amt)
    for oe in main.get("optionalEffectsPerLevel", []):
        amt = 0
        for eff in (oe.get("effects", []) if isinstance(oe, dict) else []):
            for b in eff.get("bonuses", []):
                if b.get("type") == "astrologyExp":
                    amt = int(b["parameters"][0])
        central_opt.append(amt)
    if not central:
        central = [500, 750, 1000]
    if not central_opt:
        central_opt = [0, 500, 1000]
    # Pad optional to match level count.
    while len(central_opt) < len(central):
        central_opt.append(0)

    # --- 4. Per-faction astrology law ---
    laws = []
    for p in sorted((RAW / "DB" / "fractions_laws").glob("fractions_laws_table_*.json")):
        ukey = p.stem.replace("fractions_laws_table_", "")
        for e in load_array(p):
            for lvl_i, pl in enumerate(e.get("parametersPerLevel", []), 1):
                for b in pl.get("bonuses", []):
                    if b.get("type") == "astrologyExp":
                        laws.append({
                            "faction": UKEY_TO_DID.get(ukey, ukey),
                            "lawId": e["id"],
                            "name": L.get(e.get("name", ""), e["id"]),
                            "level": lvl_i,
                            "lpCost": pl.get("cost", 0),
                            "perDay": int(b["parameters"][0]),
                        })

    payload = {
        "LADDER": ladder,                 # cumulative astrology XP per level
        "CENTRAL_BUILDING": central,      # base astrology/day at building L1/L2/L3
        "CENTRAL_OPTIONAL": central_opt,  # extra astrology/day if the optional
                                          # upgrade is taken (L1/L2/L3)
        "LAWS": laws,                     # astrology-producing faction laws
        "SPELLS": spells,                 # insight-gated neutral global-map spells
        "RESOURCE": {
            "astrology": L.get("astrology_exp_name", "Astrology points"),
            "insight": L.get("star_dust_name", "Insight"),
        },
    }
    js = "/* generated by catalog/scripts/build_astrology.py — do not edit by hand */\n"
    js += "window.OE_ASTROLOGY_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"wrote {OUT}  ({len(js):,} bytes)")
    print(f"  ladder levels: {len(ladder)} (max {ladder[-1]:,} XP)")
    print(f"  central/day:   {central}  (+optional {central_opt})")
    print(f"  astrology laws: {len(laws)}")
    print(f"  insight spells: {len(spells)}")
    for s in spells:
        print(f"    {s['name']:18} rank {s['rank']}  learn {s['insightLearn']}  "
              f"upg {s['insightUpgrades']}")


if __name__ == "__main__":
    build()
