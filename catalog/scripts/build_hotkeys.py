"""Hotkeys page data — joins game-localized action labels with default keys.

Sources:
- Action labels and section grouping: catalog/raw/Lang/english/texts/menu.json
  (every `hotkeys_<section>_<id>` sid → display string).
- Default key bindings: hand-keyed from the in-game Settings → Hotkeys screen
  (the IL2CPP binary holds the actual InputAction asset; we don't extract it).
  Sourced from "All Hotkeys for HoMM: Olden Era" reference card by Kotletiy.

Output: docs/hotkeys-data.js (window.OE_HOTKEYS_DATA).
"""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MENU = ROOT / "catalog" / "raw" / "Lang" / "english" / "texts" / "menu.json"
OUT = ROOT / "docs" / "hotkeys-data.js"


# Sections in display order; each value is the in-game header text from
# `hotkeys_header_<sec>` (we render that exact text so we don't duplicate it).
SECTIONS = [
    ("world",                       "Global Map"),
    ("city",                        "City"),
    ("battle",                      "Battle"),
    ("world_and_city_hero_panel",   "Hero and Garrison Panel"),
    ("world_hero_trade",            "Hero Interaction Screen"),
    ("arena",                       "Arena Draft"),
    ("dialogs_and_tutorial",        "Dialogues and Tutorial"),
]


# Default key bindings — keyed by `(section, sid_suffix)` → key string.
# Empty string means the action exists in-game but the reference card doesn't
# show its default key; the entry still renders in the table with a — placeholder.
KEYBINDS: dict[tuple[str, str], str] = {
    # ---------------- Global Map ---------------- #
    ("world", "DeleteUnitUI"):           "Ctrl + D",
    ("world", "DeleteHero"):             "",
    ("world", "EscapeSelect"):           "Esc",
    ("world", "SpaceSelect"):            "Space",
    ("world", "SelectSkill"):            "1 / 2 / 3",
    ("world", "OpenLaws"):               "L",
    ("world", "Alt"):                    "Alt",
    ("world", "OpenMarket"):             "M",
    ("world", "OpenMagicGuild"):         "O",
    ("world", "OpenMagicBook"):          "B",
    ("world", "MagicBookTurnLeft"):      "<",
    ("world", "MagicBookTurnRight"):     ">",
    ("world", "SelectReward"):           "1 / 2 / 3 / 4",
    ("world", "GismoZ"):                 "Z",
    ("world", "GismoX"):                 "X",
    ("world", "GismoC"):                 "C",
    ("world", "fogOfWar"):               "",
    ("world", "EndTurn"):                "E or Enter",
    ("world", "Space"):                  "Space / Num5",
    ("world", "Tab"):                    "Tab",
    ("world", "AltInfo"):                "Shift + Tab",
    ("world", "HeroArrow"):              "Arrow Keys",
    ("world", "HeroArrowNum"):           "Numpad 1-9",
    ("world", "TryContinueMove"):        "_",
    ("world", "ChatWheel"):              "",
    ("world", "HeroInventory"):          "",
    ("world", "leftMouseHero"):          "Left Mouse",
    ("world", "rightMouseCamera"):       "Right Mouse (hold)",
    ("world", "zoomIn"):                 "",
    ("world", "zoomOut"):                "",
    ("world", "camera_up"):              "",
    ("world", "camera_down"):            "",
    ("world", "camera_left"):            "",
    ("world", "camera_right"):           "",
    ("world", "EndTurn_no_ui"):          "",
    ("world", "quick_save"):             "",
    ("world", "quick_load"):             "",

    # ---------------- City ---------------- #
    ("city", "StopCameraMove"):          "Click Mouse Button",
    ("city", "OpenBuildingsWindow"):     "B",
    ("city", "OpenHire"):                "C",
    ("city", "OpenUpgradeUnits"):        "U",
    ("city", "OpenTavern"):              "H",
    ("city", "OpenMarket"):              "M",
    ("city", "OpenItemMarket"):          "A",
    ("city", "OpenUniversalBuild"):      "G",
    ("city", "Tab"):                     "Tab",
    ("city", "AltInfo"):                 "Shift + Tab",
    ("city", "OpenLaws"):                "L",
    ("city", "OpenMagicGuild"):          "O",
    ("city", "HireAll"):                 "X",
    ("city", "EndTurn"):                 "E or Enter",
    ("city", "unitHireBase"):            "Shift + Right Mouse",
    ("city", "unitHireUpg"):             "Ctrl + Right Mouse",
    ("city", "unitHireAlt"):             "Alt + Right Mouse",
    ("city", "unitHireOne"):             "",

    # ---------------- Battle ---------------- #
    ("battle", "UnitAbility"):           "1 / 2 / 3 / 4 / 5",
    ("battle", "UnitWait"):              "W",
    ("battle", "UnitSkipTurn"):          "D or Space",
    ("battle", "HeroAbility"):           "6 / 7 / 8 / 9 / 0",
    ("battle", "HeroStrike"):            "~",
    ("battle", "BattleCapitulation"):    "R",
    ("battle", "BattleEscape"):          "E",
    ("battle", "OpenMagicBook"):         "B",
    ("battle", "MagicBookTurnLeft"):     "<",
    ("battle", "MagicBookTurnRight"):    ">",
    ("battle", "OpenBattleLog"):         "L",
    ("battle", "TacticsComplete"):       "Space or Enter",
    ("battle", "quickBattle"):           "",
    ("battle", "autoBattle"):            "",
    ("battle", "camera"):                "",
    ("battle", "zoomIn"):                "",
    ("battle", "zoomOut"):               "",

    # -------- Hero and Garrison Panel -------- #
    ("world_and_city_hero_panel", "OneUnits"):                          "Ctrl + Left Mouse",
    ("world_and_city_hero_panel", "OneUnitsAll"):                       "Ctrl + Shift + Left Mouse",
    ("world_and_city_hero_panel", "AllUnits"):                          "Ctrl + Shift + Right Mouse",
    ("world_and_city_hero_panel", "DeleteUnits"):                       "Ctrl + D + Left Mouse",
    ("world_and_city_hero_panel", "BalancedOneUnit"):                   "Shift + Left Mouse",
    ("world_and_city_hero_panel", "TransferUnits"):                     "Ctrl + Alt + Left Mouse",
    ("world_and_city_hero_panel", "TransferUnitsWithoutCurrentUnit"):   "Ctrl + Alt + Right Mouse",
    ("world_and_city_hero_panel", "CitySwitchHeroes"):                  "Space",
    ("world_and_city_hero_panel", "CityHeroExchange"):                  "Q",
    ("world_and_city_hero_panel", "HeroInventoryOne"):                  "",
    ("world_and_city_hero_panel", "HeroInventoryTwo"):                  "",
    ("world_and_city_hero_panel", "BalancedOneUnitFull"):               "",

    # ---------- Hero Interaction Screen ---------- #
    ("world_hero_trade", "TransferTab"):                          "Tab",
    ("world_hero_trade", "TransferToLeft"):                       "Ctrl + 1",
    ("world_hero_trade", "TransferToTRight"):                     "Ctrl + 2",
    ("world_hero_trade", "TransferItem"):                         "Ctrl + Right Mouse",
    ("world_hero_trade", "TransferItemWithoutCurrentItem"):       "Ctrl + Alt + Right Mouse",
    ("world_hero_trade", "TransferUnits"):                        "Ctrl + Right Mouse",
    ("world_hero_trade", "TransferUnitsWithoutCurrentUnit"):      "Ctrl + Alt + Right Mouse",
    ("world_hero_trade", "TransferUnitsWithoutOneCurrentUnit"):   "Ctrl + Alt + Left Mouse",

    # ---------------- Arena Draft ---------------- #
    ("arena", "Select"):                 "1 / 2 / 3",

    # ----------- Dialogues and Tutorial ----------- #
    ("dialogs_and_tutorial", "DalogAnswer"):           "1 / 2 / 3 / 4 / 5",
    ("dialogs_and_tutorial", "DialogNext"):            "",
    ("dialogs_and_tutorial", "DialogSkipToAnswer"):    "A",
    ("dialogs_and_tutorial", "DialogSkip"):            "E",
    ("dialogs_and_tutorial", "GuideNext"):             "Space or →",
    ("dialogs_and_tutorial", "BackPrev"):              "Backspace or ←",
    ("dialogs_and_tutorial", "EscapeMenu"):            "Esc",
    ("dialogs_and_tutorial", "Escape"):                "Esc",
}


def _load_labels() -> dict[str, str]:
    txt = MENU.read_text(encoding="utf-8-sig", errors="replace")
    txt = "\n".join(l for l in txt.splitlines() if not l.lstrip().startswith("//"))
    obj = json.loads(txt)
    return {e["sid"]: e.get("text", "") for e in obj.get("tokens", []) if e.get("sid")}


def build():
    labels = _load_labels()

    sections_out = []
    seen: set[tuple[str, str]] = set()
    for sec_id, sec_name in SECTIONS:
        prefix = f"hotkeys_{sec_id}_"
        rows = []
        for sid, text in labels.items():
            if not sid.startswith(prefix):
                continue
            suffix = sid[len(prefix):]
            key = KEYBINDS.get((sec_id, suffix), "")
            seen.add((sec_id, suffix))
            rows.append({"sid": sid, "name": text, "key": key})
        # Stable display order: keyed actions first (game-confirmed), then unkeyed.
        rows.sort(key=lambda r: (r["key"] == "", r["name"].lower()))
        sections_out.append({
            "id":   sec_id,
            "name": labels.get(f"hotkeys_header_{sec_id}", sec_name),
            "rows": rows,
        })

    # Sanity: every keybind we defined should reference a real label.
    declared = set(KEYBINDS.keys())
    extras = declared - seen
    if extras:
        raise RuntimeError(f"KEYBINDS references unknown action(s): {sorted(extras)}")

    payload = {
        "SECTIONS": sections_out,
        "TOTAL":    sum(len(s["rows"]) for s in sections_out),
        "KEYED":    sum(1 for s in sections_out for r in s["rows"] if r["key"]),
    }

    js = "/* generated by catalog/scripts/build_hotkeys.py — do not edit by hand */\n"
    js += "window.OE_HOTKEYS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"wrote {OUT}  ({len(js):,} bytes)")
    print(f"  sections: {len(sections_out)}")
    print(f"  actions:  {payload['TOTAL']} ({payload['KEYED']} with keys, "
          f"{payload['TOTAL'] - payload['KEYED']} unkeyed)")


if __name__ == "__main__":
    build()
