"""Tolerant JSON loader for HOMM Olden Era data files.

The game's JSONs use BOMs, // and /* */ comments, and (rarely) trailing commas.
Strict json.loads() fails on these. We strip comments + BOMs + trailing commas
in a single pass, then hand the cleaned string to json.loads().
"""

from __future__ import annotations

import json
import re
from pathlib import Path

_BOM = "﻿"
_RE_LINE_COMMENT = re.compile(r"//[^\n]*")
_RE_BLOCK_COMMENT = re.compile(r"/\*.*?\*/", re.DOTALL)
_RE_TRAILING_COMMA = re.compile(r",(\s*[}\]])")


def _scrub(text: str) -> str:
    if text.startswith(_BOM):
        text = text[1:]
    # Strip block comments first so // inside /* */ doesn't double-fire.
    text = _RE_BLOCK_COMMENT.sub("", text)
    # Remove line comments only when "//" isn't inside a string. Simple heuristic:
    # walk char-by-char tracking string state.
    out = []
    in_str = False
    escape = False
    i = 0
    while i < len(text):
        c = text[i]
        if in_str:
            out.append(c)
            if escape:
                escape = False
            elif c == "\\":
                escape = True
            elif c == '"':
                in_str = False
            i += 1
            continue
        if c == '"':
            in_str = True
            out.append(c)
            i += 1
            continue
        if c == "/" and i + 1 < len(text) and text[i + 1] == "/":
            # skip until newline
            j = text.find("\n", i)
            i = len(text) if j == -1 else j
            continue
        out.append(c)
        i += 1
    cleaned = "".join(out)
    cleaned = _RE_TRAILING_COMMA.sub(r"\1", cleaned)
    return cleaned


def load(path: str | Path) -> dict | list:
    text = Path(path).read_text(encoding="utf-8-sig", errors="replace")
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return json.loads(_scrub(text))


def load_array(path: str | Path) -> list[dict]:
    """Game files are wrapped as {"array": [...]}. Return the inner list."""
    obj = load(path)
    if isinstance(obj, dict) and "array" in obj:
        return obj["array"] or []
    if isinstance(obj, list):
        return obj
    return []
