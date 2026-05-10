const MapObjectsView = () => {
  const M = window.OE_MAP_OBJECTS_DATA;
  if (!M) return /* @__PURE__ */ React.createElement("p", null, "Map-object data not loaded.");
  const [filter, setFilter] = React.useState("all");
  const visibleCats = filter === "all" ? M.OBJECTS : M.OBJECTS.filter((c) => c.id === filter);
  const total = M.OBJECTS.reduce((n, c) => n + c.items.length, 0);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Map objects"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Every interactable thing you'll find on the adventure map \u2014 mines, chests, shrines, dwellings, banks, teleports, and special structures. Pulled directly from ", /* @__PURE__ */ React.createElement("code", null, "mapObjects.json"), "; icons from", " ", /* @__PURE__ */ React.createElement("code", null, "resources.assets"), "."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Category"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: filter === "all" ? "active" : "",
      onClick: () => setFilter("all")
    },
    "All"
  ), M.OBJECTS.map((c) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: c.id,
      className: filter === c.id ? "active" : "",
      onClick: () => setFilter(c.id)
    },
    shortLabel(c.id),
    " (",
    c.items.length,
    ")"
  )))), /* @__PURE__ */ React.createElement("span", { className: "count" }, total, " objects")), visibleCats.map((cat) => /* @__PURE__ */ React.createElement("section", { key: cat.id, className: "mo-cat" }, /* @__PURE__ */ React.createElement("h2", null, cat.label), /* @__PURE__ */ React.createElement("div", { className: "mo-grid" }, cat.items.map((o) => /* @__PURE__ */ React.createElement(MapObjectCard, { key: o.id, o }))))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", M.GENERATED_AT, ". Edit", " ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_map_objects.py"), " to refine categorization."));
};
function shortLabel(id) {
  return {
    resources: "Resources",
    treasure: "Treasure",
    shrines: "Shrines",
    dwellings: "Dwellings",
    banks: "Banks",
    travel: "Travel",
    markets: "Markets",
    special: "Special",
    other: "Other"
  }[id] || id;
}
const MapObjectCard = ({ o }) => /* @__PURE__ */ React.createElement("article", { className: "mo-card" }, /* @__PURE__ */ React.createElement(
  "img",
  {
    loading: "lazy",
    className: "mo-img",
    src: `img/map_objects/${o.id}.png`,
    alt: "",
    onError: (e) => {
      e.target.style.visibility = "hidden";
    }
  }
), /* @__PURE__ */ React.createElement("div", { className: "mo-body" }, /* @__PURE__ */ React.createElement("h3", { className: "mo-name" }, o.name), o.desc && /* @__PURE__ */ React.createElement("p", { className: "mo-desc" }, o.desc), o.narrative && /* @__PURE__ */ React.createElement("p", { className: "mo-narr" }, /* @__PURE__ */ React.createElement("em", null, o.narrative))));
window.MapObjectsView = MapObjectsView;
