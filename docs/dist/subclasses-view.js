const SubclassesView = () => {
  const { FACTIONS, SKILL_COLUMNS, SUBCLASSES } = window.OE_DATA;
  const [hoverCol, setHoverCol] = React.useState(null);
  const groupOf = {};
  SKILL_COLUMNS.forEach((s) => groupOf[s.key] = s.group);
  const groupBoundary = (i) => {
    if (i === 0) return true;
    return SKILL_COLUMNS[i].group !== SKILL_COLUMNS[i - 1].group;
  };
  const groupRunStart = (i) => groupBoundary(i);
  const groupSpan = (g) => SKILL_COLUMNS.filter((s) => s.group === g).length;
  const rows = [];
  FACTIONS.forEach((f) => {
    rows.push({ kind: "faction", faction: f });
    SUBCLASSES.filter((s) => s.faction === f.id).forEach((s) => {
      rows.push({ kind: "sub", sub: s });
    });
  });
  const groups = [
    { id: "combat", label: "Combat (1)", span: groupSpan("combat") },
    { id: "magic", label: "Magic (1)", span: groupSpan("magic") },
    { id: "school", label: "School (1)", span: groupSpan("school") },
    { id: "utility", label: "Utility (2)", span: groupSpan("utility") }
  ];
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Subclasses & Required Skills"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Each of the 12 hero classes has two subclasses, unlocked by training five specific skills to level\xA03 (Expert). The matrix below lays out all 24 recipes \u2014 read across a row to see what one subclass needs; read down a column to see who needs that skill."), /* @__PURE__ */ React.createElement("div", { className: "legend" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "swatch combat" }), "Combat"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "swatch magic" }), "Magic"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "swatch school" }), "School"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("span", { className: "swatch utility" }), "Utility"), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--faint)" } }, "Hover a column header for the full skill name.")), /* @__PURE__ */ React.createElement("div", { className: "matrix-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "matrix" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "row-glyph", rowSpan: "2" }), /* @__PURE__ */ React.createElement("th", { className: "row-head", rowSpan: "2" }, "Subclass"), groups.map((g, i) => /* @__PURE__ */ React.createElement(
    "th",
    {
      key: g.id,
      colSpan: g.span,
      className: `group-cap ${g.id} ${i > 0 ? "group-edge" : ""}`
    },
    g.label
  )), /* @__PURE__ */ React.createElement("th", { className: "col-effect group-edge", rowSpan: "2" }, "Subclass effect")), /* @__PURE__ */ React.createElement("tr", null, SKILL_COLUMNS.map((s, i) => /* @__PURE__ */ React.createElement(
    "th",
    {
      key: s.key,
      className: `${groupRunStart(i) && i > 0 ? "group-edge" : ""} ${hoverCol === i ? "col-hl" : ""}`,
      title: s.name,
      onMouseEnter: () => setHoverCol(i),
      onMouseLeave: () => setHoverCol(null)
    },
    s.key
  )))), /* @__PURE__ */ React.createElement("tbody", null, rows.map((row, ri) => {
    if (row.kind === "faction") {
      return /* @__PURE__ */ React.createElement("tr", { key: "f" + row.faction.id, className: "faction-row" }, /* @__PURE__ */ React.createElement("td", { colSpan: 2 + SKILL_COLUMNS.length + 1 }, row.faction.name, /* @__PURE__ */ React.createElement("span", { className: "fac-skill" }, "faction skill: ", row.faction.skill)));
    }
    const s = row.sub;
    const set = new Set(s.skills);
    return /* @__PURE__ */ React.createElement("tr", { key: s.faction + s.name }, /* @__PURE__ */ React.createElement("td", { className: "row-glyph" }, /* @__PURE__ */ React.createElement("span", { className: s.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, s.kind === "might" ? "\u2694" : "\u2726")), /* @__PURE__ */ React.createElement("td", { className: "row-head" }, s.name, /* @__PURE__ */ React.createElement("span", { className: "row-class" }, s.class)), SKILL_COLUMNS.map((col, i) => {
      const on = set.has(col.key);
      const cls = ["skill-cell", col.group, on ? "on" : ""];
      if (groupRunStart(i) && i > 0) cls.push("group-edge");
      if (hoverCol === i) cls.push("col-hl");
      return /* @__PURE__ */ React.createElement(
        "td",
        {
          key: col.key,
          className: cls.join(" "),
          onMouseEnter: () => setHoverCol(i),
          onMouseLeave: () => setHoverCol(null)
        },
        on ? /* @__PURE__ */ React.createElement("span", { className: "dot", "aria-label": col.name }) : ""
      );
    }), /* @__PURE__ */ React.createElement(
      "td",
      {
        className: "col-effect group-edge",
        dangerouslySetInnerHTML: { __html: s.effect }
      }
    ));
  })))), /* @__PURE__ */ React.createElement("p", { className: "note" }, /* @__PURE__ */ React.createElement("strong", null, "Structural pattern."), " Every subclass requires exactly", " ", /* @__PURE__ */ React.createElement("strong", null, "1 Combat + 1 Magic + 1 School + 2 Utility"), " \u2014 the recipe is fixed. Of the four magic schools, only one is required per subclass. Of the ten utility skills, only eight ever appear in any subclass requirement: ", /* @__PURE__ */ React.createElement("em", null, "Siegecraft"), " ", "and ", /* @__PURE__ */ React.createElement("em", null, "Recruitment"), " are never required, making them pure side-options."), /* @__PURE__ */ React.createElement("p", { className: "note" }, /* @__PURE__ */ React.createElement("strong", null, "Class-locked skills."), " Two skills are tied to class type and never appear in subclass conditions: ", /* @__PURE__ */ React.createElement("em", null, "Combat"), " (might-only, Heroic Strike cooldown) and ", /* @__PURE__ */ React.createElement("em", null, "Thaumaturgy"), " (magic-only, second spell per round). Both are useful but unrelated to subclass progression."));
};
window.SubclassesView = SubclassesView;
