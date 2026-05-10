const MapTemplatesView = () => {
  const D = window.OE_MAP_TEMPLATES_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Template data not loaded.");
  const [mode, setMode] = React.useState("all");
  const [size, setSize] = React.useState("all");
  const allModes = Array.from(new Set(D.TEMPLATES.flatMap((t) => t.modes))).sort();
  const allSizes = Array.from(new Set(D.TEMPLATES.map((t) => t.size))).sort();
  const filtered = D.TEMPLATES.filter((t) => {
    if (mode !== "all" && !t.modes.includes(mode)) return false;
    if (size !== "all" && t.size !== size) return false;
    return true;
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Map templates"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Every generated multiplayer template the game ships with. Names and descriptions are pulled from ", /* @__PURE__ */ React.createElement("code", null, "ui.json"), "; mode tags cross-reference ", /* @__PURE__ */ React.createElement("code", null, "quickStart.json"), "'s classic / single-hero / scenario lists. The game doesn't ship per-template preview images \u2014 each template shows a placeholder icon until we have a source for those."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Mode"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: mode === "all" ? "active" : "", onClick: () => setMode("all") }, "All"), allModes.map((m) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: m,
      className: mode === m ? "active" : "",
      onClick: () => setMode(m)
    },
    labelMode(m)
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Size"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: size === "all" ? "active" : "", onClick: () => setSize("all") }, "All"), allSizes.map((s) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s,
      className: size === s ? "active" : "",
      onClick: () => setSize(s)
    },
    labelSize(s)
  )))), /* @__PURE__ */ React.createElement("span", { className: "count" }, filtered.length, " templates")), /* @__PURE__ */ React.createElement("div", { className: "mt-grid" }, filtered.map((t) => /* @__PURE__ */ React.createElement(TemplateCard, { key: t.id, t }))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", D.GENERATED_AT, ". Size is heuristic from description text; flag wrong inferences in ", /* @__PURE__ */ React.createElement("code", null, "build_map_templates.py"), "."));
};
function labelMode(m) {
  return {
    "classic": "Classic",
    "single-hero": "Single-hero",
    "pve": "PvE",
    "scenario": "Scenario",
    "tournament": "Tournament",
    "multiplayer": "Multiplayer"
  }[m] || m;
}
function labelSize(s) {
  return { small: "Small", medium: "Medium", large: "Large" }[s] || s;
}
const TemplateCard = ({ t }) => /* @__PURE__ */ React.createElement("article", { className: "mt-card" }, /* @__PURE__ */ React.createElement(
  "img",
  {
    loading: "lazy",
    className: "mt-img",
    src: `img/map_objects/${t.id}.png`,
    alt: "",
    onError: (e) => {
      e.target.src = "img/factions/temple.png";
      e.target.style.opacity = 0.15;
    }
  }
), /* @__PURE__ */ React.createElement("div", { className: "mt-body" }, /* @__PURE__ */ React.createElement("header", { className: "mt-head" }, /* @__PURE__ */ React.createElement("h3", { className: "mt-name" }, t.name), /* @__PURE__ */ React.createElement("div", { className: "mt-tags" }, t.modes.map((m) => /* @__PURE__ */ React.createElement("span", { key: m, className: `mt-tag mt-tag-${m}` }, labelMode(m))), /* @__PURE__ */ React.createElement("span", { className: `mt-tag mt-tag-size mt-tag-size-${t.size}` }, labelSize(t.size)), t.playerCount && /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-players" }, t.playerCount, "p"))), /* @__PURE__ */ React.createElement("p", { className: "mt-desc" }, t.desc)));
window.MapTemplatesView = MapTemplatesView;
