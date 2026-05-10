const MapTemplatesView = () => {
  const D = window.OE_MAP_TEMPLATES_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Template data not loaded.");
  const [mode, setMode] = React.useState("all");
  const [size, setSize] = React.useState("all");
  const allSizes = ["small", "medium", "large", "huge"];
  const baseModes = Array.from(new Set(D.TEMPLATES.map((t) => t.mode))).sort();
  const allModes = ["tournament", ...baseModes.filter((m) => m !== "tournament")];
  const filtered = D.TEMPLATES.filter((t) => {
    if (mode === "tournament") {
      if (!t.tournament) return false;
    } else if (mode !== "all" && t.mode !== mode) return false;
    if (size !== "all" && t.size !== size) return false;
    return true;
  });
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Map templates"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Every generated multiplayer template the game ships with \u2014 pulled directly from", " ", /* @__PURE__ */ React.createElement("code", null, "StreamingAssets/map_templates/*.rmg.json"), ". Each card has the in-game preview image, the actual map dimensions, the game-mode tag (Classic / Single-hero), the hero-count range, and the localized description from ", /* @__PURE__ */ React.createElement("code", null, "ui.json"), "."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Mode"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: mode === "all" ? "active" : "", onClick: () => setMode("all") }, "All"), allModes.map((m) => /* @__PURE__ */ React.createElement(
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
  )))), /* @__PURE__ */ React.createElement("span", { className: "count" }, filtered.length, " templates")), /* @__PURE__ */ React.createElement("div", { className: "mt-grid" }, filtered.map((t) => /* @__PURE__ */ React.createElement(TemplateCard, { key: t.id, t }))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", D.GENERATED_AT, ". Size buckets:", " ", /* @__PURE__ */ React.createElement("em", null, "small"), " \u226496, ", /* @__PURE__ */ React.createElement("em", null, "medium"), " \u2264128, ", /* @__PURE__ */ React.createElement("em", null, "large"), " \u2264176,", " ", /* @__PURE__ */ React.createElement("em", null, "huge"), " >176 (max axis)."));
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
  return { small: "Small", medium: "Medium", large: "Large", huge: "Huge" }[s] || s;
}
const TemplateCard = ({ t }) => {
  const heroes = t.heroMin && t.heroMax ? t.heroMin === t.heroMax ? `${t.heroMin}` : `${t.heroMin}\u2013${t.heroMax}` : null;
  return /* @__PURE__ */ React.createElement("article", { className: "mt-card" }, t.image && /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "mt-img",
      src: t.image,
      alt: t.name,
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "mt-body" }, /* @__PURE__ */ React.createElement("header", { className: "mt-head" }, /* @__PURE__ */ React.createElement("h3", { className: "mt-name" }, t.name), /* @__PURE__ */ React.createElement("div", { className: "mt-tags" }, /* @__PURE__ */ React.createElement("span", { className: `mt-tag mt-tag-${t.mode}` }, labelMode(t.mode)), t.tournament && /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-tournament" }, "Tournament"), /* @__PURE__ */ React.createElement("span", { className: `mt-tag mt-tag-size mt-tag-size-${t.size}` }, labelSize(t.size), " (", t.sizeX, "\xD7", t.sizeZ, ")"), heroes && /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-players" }, heroes, " hero", heroes === "1" ? "" : "es"))), /* @__PURE__ */ React.createElement("p", { className: "mt-desc" }, t.desc)));
};
window.MapTemplatesView = MapTemplatesView;
