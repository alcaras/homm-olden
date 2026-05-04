"""Extract every hero specialization to a single JSON file.

For each specialization:
  - id            (e.g. "unfrozen_hero_3_specialization")
  - name          (display, e.g. "Chessmaster")
  - description   (English text from the spec's `desc` token — typically
                   contains numeric placeholders {0}, {1}, ...)
  - descriptionArgs   (named arg list from Lang/args/heroInfo.json,
                       in placeholder order; tells you what {0}, {1} mean)
  - bonuses       (raw bonuses block from the spec — the source of truth
                   for every numeric value; the runtime fills the
                   placeholders from these)
  - heroes        (list of hero ids that use this specialization, with
                   their display names)
  - faction
  - classType
  - sourceFile

This is a comprehensive extraction — 126 specs across the playable factions
plus a handful of campaign / tutorial / arena specs.
"""

from __future__ import annotations

import json
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from load_json import load_array

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "catalog" / "raw"
OUT = ROOT / "catalog" / "out" / "specializations.json"
OUT.parent.mkdir(parents=True, exist_ok=True)


# English text lookup
EN: dict[str, str] = {}
for f in [
    "Lang/english/texts/heroSkills.json",
    "Lang/english/texts/heroInfo.json",
    "Lang/english/texts/ui.json",
    "Lang/english/texts/menu.json",
    "Lang/english/texts/unsorted.json",
    "Lang/english/texts/customMaps.json",
    "Lang/english/texts/unitsAbility.json",
    "Lang/english/texts/unitsBuff.json",
]:
    p = RAW / f
    if not p.exists():
        continue
    with p.open(encoding="utf-8-sig") as h:
        for entry in json.load(h).get("tokens", []):
            if isinstance(entry, dict) and "sid" in entry and "text" in entry:
                EN[entry["sid"]] = entry["text"]


# Args lookup: token sid -> ordered arg-name list (which named variables
# fill the {0}, {1}, ... placeholders).
ARGS: dict[str, list[str]] = {}
args_file = RAW / "Lang/args/heroInfo.json"
if args_file.exists():
    with args_file.open(encoding="utf-8-sig") as h:
        for entry in json.load(h).get("tokensArgs", []):
            if isinstance(entry, dict) and "sid" in entry and "args" in entry:
                ARGS[entry["sid"]] = entry["args"]


# Map each spec id -> list of (hero_id, hero_display_name, faction, classType)
hero_users: dict[str, list[dict]] = defaultdict(list)
for p in (RAW / "DB" / "heroes").glob("*/*.json"):
    for r in load_array(p):
        if not isinstance(r, dict):
            continue
        spec = r.get("specialization")
        if not spec:
            continue
        hid = r.get("id")
        hero_users[spec].append({
            "id": hid,
            "name": EN.get(hid, hid),
            "faction": r.get("fraction"),
            "classType": r.get("classType"),
            "source": str(p.relative_to(RAW)),
        })


# Walk every specialization file and collect specs
specs_out: list[dict] = []
for p in sorted((RAW / "DB" / "heroes_specializations").glob("*.json")):
    for s in load_array(p):
        if not isinstance(s, dict) or not s.get("id"):
            continue
        sid = s["id"]
        name_tok = s.get("name") or ""
        desc_tok = s.get("desc") or ""
        users = hero_users.get(sid, [])
        # Faction / classType: take from first user, else from filename
        faction = users[0]["faction"] if users else None
        class_type = users[0]["classType"] if users else None
        if faction is None:
            stem = p.stem  # specializations_unfrozen
            if stem.startswith("specializations_"):
                tag = stem[len("specializations_"):]
                # spec file names use 'necro' instead of 'undead' etc.; map
                faction = {"necro": "undead"}.get(tag, tag)

        specs_out.append({
            "id": sid,
            "name": EN.get(name_tok, name_tok),
            "nameSid": name_tok,
            "description": EN.get(desc_tok, ""),
            "descriptionSid": desc_tok,
            "descriptionArgs": ARGS.get(desc_tok, []),
            "iconSid": s.get("icon"),
            "faction": faction,
            "classType": class_type,
            "heroes": users,
            "bonuses": s.get("bonuses") or [],
            "sourceFile": str(p.relative_to(RAW)),
        })


# Group output for browsability
by_faction: dict[str, list[dict]] = defaultdict(list)
for s in specs_out:
    by_faction[s["faction"] or "_other"].append(s)

playable = ["human", "undead", "nature", "demon", "unfrozen", "dungeon"]
ordered: dict[str, list[dict]] = {}
for f in playable:
    if f in by_faction:
        ordered[f] = sorted(by_faction[f], key=lambda x: x["id"])
for f in sorted(by_faction):
    if f not in ordered:
        ordered[f] = sorted(by_faction[f], key=lambda x: x["id"])

result = {
    "_doc": {
        "description": "All hero specializations (per-hero passive abilities) "
                       "extracted from the raw game data.",
        "placeholders": "Description text uses numeric placeholders like {0}, "
                        "{1}, {2}. The matching `descriptionArgs` array gives "
                        "the named runtime variable for each placeholder, in "
                        "order. The actual numeric value is computed at runtime "
                        "from the `bonuses` block — the raw parameters in "
                        "`bonuses` are the source of truth.",
        "bonuses": "Each bonus entry can have: type (heroStat, unitStat, "
                   "heroBattleAbility, battleSubskillBonus, ...), parameters "
                   "(positional args, format depends on type), optional "
                   "activationLevel (level the bonus first applies), and "
                   "optional upgrade { increment, levelStep } (how the bonus "
                   "scales with hero level).",
    },
    "specializations": ordered,
    "totalCount": len(specs_out),
}

OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False))
print(f"wrote {OUT}")
print(f"specializations: {len(specs_out)}")
print(f"factions: {sorted(ordered.keys())}")
