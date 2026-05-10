const ArtifactsView = () => {
  const A = window.OE_ARTIFACTS_DATA;
  if (!A) return /* @__PURE__ */ React.createElement("p", null, "Artifacts data not loaded.");
  const [slot, setSlot] = React.useState("all");
  const [rarity, setRarity] = React.useState("all");
  const [setId, setSetId] = React.useState("all");
  const allRarities = Array.from(new Set(A.ARTIFACTS.map((a) => a.rarity))).sort();
  const filtered = A.ARTIFACTS.filter((a) => {
    if (slot !== "all" && a.slot !== slot) return false;
    if (rarity !== "all" && a.rarity !== rarity) return false;
    if (setId !== "all" && a.itemSet !== setId) return false;
    return true;
  });
  const bySlot = {};
  for (const a of filtered) (bySlot[a.slot] = bySlot[a.slot] || []).push(a);
  const sortedSets = Object.values(A.ITEM_SETS).sort((a, b) => a.name.localeCompare(b.name));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Artifacts"), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Slot"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: slot === "all" ? "active" : "", onClick: () => setSlot("all") }, "All"), A.SLOT_ORDER.map((s) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: s,
      className: slot === s ? "active" : "",
      onClick: () => setSlot(s)
    },
    A.SLOT_LABEL[s] || s
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Rarity"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: rarity === "all" ? "active" : "", onClick: () => setRarity("all") }, "All"), allRarities.map((r) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: r,
      className: rarity === r ? "active" : "",
      onClick: () => setRarity(r)
    },
    capCase(r)
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Item set"), /* @__PURE__ */ React.createElement("select", { className: "search", value: setId, onChange: (e) => setSetId(e.target.value) }, /* @__PURE__ */ React.createElement("option", { value: "all" }, "\u2014 Any set \u2014"), sortedSets.map((s) => /* @__PURE__ */ React.createElement("option", { key: s.id, value: s.id }, s.name, " (", s.items.length, "pc)")))), /* @__PURE__ */ React.createElement("span", { className: "count" }, filtered.length, " artifacts")), A.SLOT_ORDER.filter((s) => bySlot[s]).map((s) => /* @__PURE__ */ React.createElement("section", { key: s, className: "art-section" }, /* @__PURE__ */ React.createElement("h2", null, A.SLOT_LABEL[s] || s), /* @__PURE__ */ React.createElement("div", { className: "art-grid" }, bySlot[s].map((a) => /* @__PURE__ */ React.createElement(ArtifactCard, { key: a.id, a, sets: A.ITEM_SETS }))))));
};
function capCase(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
const ArtifactCard = ({ a, sets }) => {
  const set = a.itemSet ? sets[a.itemSet] : null;
  return /* @__PURE__ */ React.createElement("article", { className: `art-card art-rarity-${a.rarity}` }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "art-img",
      src: `img/artifacts/${a.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "art-body" }, /* @__PURE__ */ React.createElement("header", { className: "art-head" }, /* @__PURE__ */ React.createElement("h3", { className: "art-name" }, a.name), /* @__PURE__ */ React.createElement("div", { className: "art-meta" }, /* @__PURE__ */ React.createElement("span", { className: `art-rarity-chip art-rarity-chip-${a.rarity}` }, capCase(a.rarity)), a.maxLevel > 1 && /* @__PURE__ */ React.createElement("span", { className: "art-level" }, "L1\u2013L", a.maxLevel))), a.desc && /* @__PURE__ */ React.createElement("p", { className: "art-desc" }, a.desc), a.bonuses?.length > 0 && /* @__PURE__ */ React.createElement("ul", { className: "art-bonuses" }, a.bonuses.map((b, i) => /* @__PURE__ */ React.createElement("li", { key: i }, b))), a.narrative && /* @__PURE__ */ React.createElement("p", { className: "art-narr" }, /* @__PURE__ */ React.createElement("em", null, a.narrative)), set && /* @__PURE__ */ React.createElement("div", { className: "art-set" }, /* @__PURE__ */ React.createElement("span", { className: "art-set-label" }, "Set:"), /* @__PURE__ */ React.createElement("span", { className: "art-set-name" }, set.name), /* @__PURE__ */ React.createElement("span", { className: "art-set-pieces" }, "(", set.items.length, " pieces)"))));
};
window.ArtifactsView = ArtifactsView;
