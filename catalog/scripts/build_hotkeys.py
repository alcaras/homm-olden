"""Hotkeys page data — joins game-localized labels with the extracted default
key bindings asset.

Sources (both 100% extracted from the game):
- catalog/raw/Lang/english/texts/menu.json — `hotkeys_*` sids → display labels.
- catalog/raw/Assets/QwertyProfile.json   — the InputHotkeys ScriptableObject
  ("default qwerty profile" the game ships with), copied out of
  HeroesOldenEra_Data/resources.assets via UnityPy. Each entry has a Sid
  matching menu.json plus Combo/AltCombo arrays of Unity KeyCode tokens.

Output: docs/hotkeys-data.js (window.OE_HOTKEYS_DATA).

Re-extract the QwertyProfile asset after a game patch via:
    python3 catalog/scripts/build_hotkeys.py --extract
which spins up UnityPy, finds the TextAsset by content (no fixed path_id),
and rewrites catalog/raw/Assets/QwertyProfile.json.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MENU = ROOT / "catalog" / "raw" / "Lang" / "english" / "texts" / "menu.json"
QWERTY = ROOT / "catalog" / "raw" / "Assets" / "QwertyProfile.json"
RESOURCES_ASSETS = ROOT / "HeroesOldenEra_Data" / "resources.assets"
OUT = ROOT / "docs" / "hotkeys-data.js"


# Sections in display order. Section names come from menu.json's
# `hotkeys_header_<sec>`; this map is just for display ordering.
SECTIONS_ORDER = [
    "world",
    "city",
    "battle",
    "world_and_city_hero_panel",
    "world_hero_trade",
    "arena",
    "dialogs_and_tutorial",
]

# Unity KeyCode → user-facing token. Every KeyCode that appears in the
# extracted QwertyProfile must have a translation here, otherwise the build
# raises (so we never silently render a raw `Alpha0`).
KEYCODE = {
    # Mouse
    "Mouse0": "Left Mouse",
    "Mouse1": "Right Mouse",
    "Mouse2": "Middle Mouse",
    "Mouse3": "Mouse 3",
    "Mouse4": "Mouse 4",
    # Modifiers (collapse left/right variants — no game shows "must be left")
    "LeftControl":  "Ctrl",
    "RightControl": "Ctrl",
    "LeftShift":    "Shift",
    "RightShift":   "Shift",
    "LeftAlt":      "Alt",
    "RightAlt":     "Alt",
    "LeftCommand":  "Cmd",
    "RightCommand": "Cmd",
    "LeftWindows":  "Win",
    "RightWindows": "Win",
    # Specials
    "Return":     "Enter",
    "KeypadEnter":"Num Enter",
    "Backspace":  "Backspace",
    "Tab":        "Tab",
    "Space":      "Space",
    "Escape":     "Esc",
    "Delete":     "Delete",
    "Insert":     "Insert",
    "Home":       "Home",
    "End":        "End",
    "PageUp":     "Page Up",
    "PageDown":   "Page Down",
    "CapsLock":   "Caps Lock",
    # Arrows
    "UpArrow":    "↑",
    "DownArrow":  "↓",
    "LeftArrow":  "←",
    "RightArrow": "→",
    # Punctuation
    "BackQuote":   "`",
    "Tilde":       "~",
    "Minus":       "-",
    "Underscore":  "_",
    "Equals":      "=",
    "Plus":        "+",
    "LeftBracket": "[",
    "RightBracket":"]",
    "Backslash":   "\\",
    "Semicolon":   ";",
    "Quote":       "'",
    "Comma":       ",",
    "Period":      ".",
    "Slash":       "/",
    "Less":        "<",
    "Greater":     ">",
    # Misc
    "ScrollLock":  "Scroll Lock",
    "Print":       "Print",
    "Pause":       "Pause",
    "Numlock":     "Num Lock",
    "None":        "—",
}
# Letter keys A-Z → uppercase letter
for _c in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
    KEYCODE[_c] = _c
# Top-row digits Alpha0..Alpha9 → "0".."9"
for _i in range(10):
    KEYCODE[f"Alpha{_i}"] = str(_i)
# Numpad Keypad0..Keypad9 → "Num 0".."Num 9"; Keypad math keys
for _i in range(10):
    KEYCODE[f"Keypad{_i}"] = f"Num {_i}"
KEYCODE.update({
    "KeypadDivide":   "Num /",
    "KeypadMultiply": "Num *",
    "KeypadMinus":    "Num -",
    "KeypadPlus":     "Num +",
    "KeypadEquals":   "Num =",
    "KeypadPeriod":   "Num .",
})
# Function keys F1..F15
for _i in range(1, 16):
    KEYCODE[f"F{_i}"] = f"F{_i}"

# Modifier sort order — Ctrl < Alt < Shift < everything else
_MOD_ORDER = {"Ctrl": 0, "Alt": 1, "Shift": 2}
_MODIFIERS = set(_MOD_ORDER) | {"Cmd", "Win"}


def _tr(token: str) -> str:
    if token in KEYCODE:
        return KEYCODE[token]
    raise KeyError(f"Unknown KeyCode token in QwertyProfile: {token!r}")


def _format_combo(combo: list[str]) -> str:
    """Translate one Combo/AltCombo array → display string.

    A Combo with at most one non-modifier key is a chord ('Ctrl + B'). A Combo
    with two or more non-modifier keys is a *set of alternatives* (any arrow
    key for HeroArrow; any digit 1-4 for SelectReward) and is joined with ' / '
    instead. Modifiers, when present, prefix every alternative.
    """
    parts = [_tr(c) for c in combo if c]
    mods = [p for p in parts if p in _MODIFIERS]
    keys = [p for p in parts if p not in _MODIFIERS]
    mods.sort(key=lambda p: _MOD_ORDER[p])
    if len(keys) <= 1:
        return " + ".join(mods + keys)
    if mods:
        prefix = " + ".join(mods) + " + "
        return " / ".join(prefix + k for k in keys)
    return " / ".join(keys)


def _format_entry(entry: dict) -> str:
    """Build the display string for a single QwertyProfile entry.

    Combo is the primary chord; AltCombo is the alternate chord (joined with
    ' or '). Variants is a flat list of single-key alternatives shown the same
    way — but most game-bindable entries use Combo/AltCombo, so we treat
    Variants as additional 'or' options.
    """
    parts: list[str] = []
    if entry.get("Combo"):
        parts.append(_format_combo(entry["Combo"]))
    if entry.get("AltCombo"):
        parts.append(_format_combo(entry["AltCombo"]))
    for v in entry.get("Variants", []) or []:
        parts.append(_format_combo([v]))
    # Dedup while preserving order
    seen = set()
    uniq = [p for p in parts if not (p in seen or seen.add(p))]
    return " or ".join(uniq)


def _load_labels() -> dict[str, str]:
    txt = MENU.read_text(encoding="utf-8-sig", errors="replace")
    txt = "\n".join(l for l in txt.splitlines() if not l.lstrip().startswith("//"))
    obj = json.loads(txt)
    return {e["sid"]: e.get("text", "") for e in obj.get("tokens", []) if e.get("sid")}


def _load_qwerty() -> list[dict]:
    """Tolerant load of the extracted ScriptableObject JSON. Strips // comments
    and the trailing-comma forgiveness Unity sometimes embeds."""
    txt = QWERTY.read_text(encoding="utf-8-sig", errors="replace")
    # The asset has occasional standalone `      \n      "InputAction"` artifacts
    # but is otherwise valid JSON wrapped in {"array": [...]}.
    obj = json.loads(txt)
    return obj.get("array", [])


def extract_from_unity():
    """Pull QwertyProfile out of resources.assets via UnityPy (one-shot)."""
    try:
        import UnityPy  # type: ignore
    except ImportError:
        sys.exit("UnityPy not installed. Run: .venv/bin/pip install UnityPy")
    if not RESOURCES_ASSETS.exists():
        sys.exit(f"Cannot find {RESOURCES_ASSETS}. Symlink HeroesOldenEra_Data first.")
    env = UnityPy.load(str(RESOURCES_ASSETS))
    for obj in env.objects:
        if obj.type.name != "TextAsset":
            continue
        try:
            d = obj.read()
        except Exception:
            continue
        name = (getattr(d, "m_Name", "") or getattr(d, "name", ""))
        if name == "QwertyProfile":
            text_attr = getattr(d, "m_Script", None)
            txt = text_attr if isinstance(text_attr, str) else (text_attr.decode("utf-8", "ignore") if isinstance(text_attr, (bytes, bytearray)) else "")
            QWERTY.parent.mkdir(parents=True, exist_ok=True)
            QWERTY.write_text(txt, encoding="utf-8")
            print(f"wrote {QWERTY} ({len(txt):,} chars)")
            return
    sys.exit("QwertyProfile TextAsset not found in resources.assets")


def build():
    labels = _load_labels()
    qwerty = _load_qwerty()

    # Index QwertyProfile entries by sid. Some entries lack a Sid (engine-internal
    # actions like Action/RightClick/MMWClick); we ignore those — they're not
    # game-bindable hotkeys.
    by_sid: dict[str, str] = {}
    for entry in qwerty:
        sid = entry.get("Sid")
        if not sid:
            continue
        # Multiple entries can share a sid (Up/Down state pairs etc.); first
        # populated combo wins.
        if sid in by_sid and by_sid[sid]:
            continue
        by_sid[sid] = _format_entry(entry)

    # Group by section. Section id is the longest prefix-matching SECTIONS_ORDER
    # entry — `hotkeys_world_and_city_hero_panel_*` must beat `hotkeys_world_*`.
    sec_prefixes = sorted(((f"hotkeys_{s}_", s) for s in SECTIONS_ORDER),
                          key=lambda p: -len(p[0]))
    rows_by_sec: dict[str, list[dict]] = {s: [] for s in SECTIONS_ORDER}
    matched = 0
    for sid, text in labels.items():
        if not sid.startswith("hotkeys_"):
            continue
        sec_id = next((sid_ for prefix, sid_ in sec_prefixes if sid.startswith(prefix)), None)
        if sec_id is None:
            continue
        key = by_sid.get(sid, "")
        if key: matched += 1
        rows_by_sec[sec_id].append({"sid": sid, "name": text, "key": key})

    sections_out = []
    for sec_id in SECTIONS_ORDER:
        rows = rows_by_sec[sec_id]
        rows.sort(key=lambda r: (r["key"] == "", r["name"].lower()))
        sections_out.append({
            "id":   sec_id,
            "name": labels.get(f"hotkeys_header_{sec_id}", sec_id),
            "rows": rows,
        })

    payload = {
        "SECTIONS": sections_out,
        "TOTAL":    sum(len(s["rows"]) for s in sections_out),
        "KEYED":    matched,
    }

    js = "/* generated by catalog/scripts/build_hotkeys.py — do not edit by hand */\n"
    js += "window.OE_HOTKEYS_DATA = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    OUT.write_text(js, encoding="utf-8")
    print(f"wrote {OUT}  ({len(js):,} bytes)")
    print(f"  sections: {len(sections_out)}")
    print(f"  actions:  {payload['TOTAL']} ({payload['KEYED']} with default keys, "
          f"{payload['TOTAL'] - payload['KEYED']} unbound)")


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--extract", action="store_true",
                   help="Pull QwertyProfile out of HeroesOldenEra_Data/resources.assets via UnityPy.")
    args = p.parse_args()
    if args.extract:
        extract_from_unity()
    build()
