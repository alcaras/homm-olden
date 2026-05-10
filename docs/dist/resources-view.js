const ResourcesView = () => {
  const R = window.OE_RESOURCES_DATA;
  if (!R) return /* @__PURE__ */ React.createElement("p", null, "Resources data not loaded.");
  const byCat = {};
  for (const r of R.RESOURCES) (byCat[r.category] = byCat[r.category] || []).push(r);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Resources"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "The eight resources the game tracks \u2014 primary (Gold / Wood / Ore), rare (Gems / Crystal / Mercury), plus Alchemical Dust and Graal. Icons pulled from ", /* @__PURE__ */ React.createElement("code", null, "resources.assets"), "; tactical notes synthesized for tournament/Exodus play."), Object.keys(R.CATEGORY_LABEL).map((catKey) => {
    const items = byCat[catKey] || [];
    if (!items.length) return null;
    return /* @__PURE__ */ React.createElement("section", { key: catKey, className: "res-section" }, /* @__PURE__ */ React.createElement("h2", null, R.CATEGORY_LABEL[catKey]), /* @__PURE__ */ React.createElement("div", { className: "res-grid" }, items.map((r) => /* @__PURE__ */ React.createElement(ResourceCard, { key: r.id, r }))));
  }), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", R.GENERATED_AT, "."));
};
const ResourceCard = ({ r }) => /* @__PURE__ */ React.createElement("article", { className: `res-card res-card-${r.id}` }, /* @__PURE__ */ React.createElement(
  "img",
  {
    loading: "lazy",
    className: "res-img",
    src: `img/resources/${r.id}.png`,
    alt: "",
    onError: (e) => {
      e.target.style.visibility = "hidden";
    }
  }
), /* @__PURE__ */ React.createElement("div", { className: "res-body" }, /* @__PURE__ */ React.createElement("h3", { className: "res-name" }, r.name), r.narrative && /* @__PURE__ */ React.createElement("p", { className: "res-narr" }, /* @__PURE__ */ React.createElement("em", null, r.narrative)), r.tactical && /* @__PURE__ */ React.createElement("p", { className: "res-tactical" }, r.tactical)));
window.ResourcesView = ResourcesView;
