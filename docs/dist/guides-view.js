const GuidesView = () => {
  const G = window.OE_GUIDES_DATA;
  if (!G) return /* @__PURE__ */ React.createElement("p", null, "Guides data not loaded.");
  const SITE_FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionMeta = Object.fromEntries(SITE_FACTIONS.map((f) => [f.id, f]));
  const [factionId, setFactionId] = React.useState(G.FACTIONS[0]?.id);
  const current = G.FACTIONS.find((f) => f.id === factionId) || G.FACTIONS[0];
  const fmeta = factionMeta[current?.id];
  const PrioBadge = ({ p }) => {
    const cls = `prio-badge prio-${p === "trap" ? "trap" : p}`;
    const label = p === "trap" ? "skip" : p;
    return /* @__PURE__ */ React.createElement("span", { className: cls }, label);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Faction guides"), /* @__PURE__ */ React.createElement("h2", null, "Universal tips"), /* @__PURE__ */ React.createElement("div", { className: "tips" }, G.UNIVERSAL_TIPS.map((t) => /* @__PURE__ */ React.createElement("div", { className: "tip", key: t.title }, /* @__PURE__ */ React.createElement("div", { className: "tip-title" }, t.title), /* @__PURE__ */ React.createElement("div", { className: "tip-body" }, t.body)))), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Faction"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, G.FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      className: f.id === factionId ? "active" : "",
      onClick: () => setFactionId(f.id)
    },
    f.name
  ))))), current && /* @__PURE__ */ React.createElement("section", { className: "faction-guide" }, /* @__PURE__ */ React.createElement("div", { className: "faction-band" }, fmeta && /* @__PURE__ */ React.createElement(
    "img",
    {
      className: "faction-band-icon",
      loading: "lazy",
      src: `img/factions/fraction_${fmeta.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "name" }, current.name), fmeta && /* @__PURE__ */ React.createElement("div", { className: "skill" }, fmeta.might, " / ", fmeta.magic))), /* @__PURE__ */ React.createElement("p", { className: "faction-summary" }, current.summary), /* @__PURE__ */ React.createElement("div", { className: "guide-grid" }, /* @__PURE__ */ React.createElement("div", { className: "guide-col" }, /* @__PURE__ */ React.createElement("h3", null, "Build order"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "phase-col" }, "Phase"), /* @__PURE__ */ React.createElement("th", null, "Building"), /* @__PURE__ */ React.createElement("th", { className: "prio-col" }), /* @__PURE__ */ React.createElement("th", null, "Note"))), /* @__PURE__ */ React.createElement("tbody", null, current.buildOrder.map((b, i) => /* @__PURE__ */ React.createElement("tr", { key: `b${i}` }, /* @__PURE__ */ React.createElement("td", { className: "phase-col" }, /* @__PURE__ */ React.createElement("span", { className: "phase" }, b.phase)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, b.name), /* @__PURE__ */ React.createElement("code", { className: "b-id" }, b.shortId)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: b.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, b.note))), current.buildingTraps.length > 0 && /* @__PURE__ */ React.createElement("tr", { className: "traps-divider" }, /* @__PURE__ */ React.createElement("td", { colSpan: "4" }, "Traps to avoid")), current.buildingTraps.map((b, i) => /* @__PURE__ */ React.createElement("tr", { key: `bt${i}`, className: "trap-row" }, /* @__PURE__ */ React.createElement("td", { className: "phase-col" }, /* @__PURE__ */ React.createElement("span", { className: "phase phase-skip" }, "\u2014")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, b.name), /* @__PURE__ */ React.createElement("code", { className: "b-id" }, b.shortId)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: b.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, b.note)))))), /* @__PURE__ */ React.createElement("div", { className: "guide-col" }, /* @__PURE__ */ React.createElement("h3", null, "Law priorities"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "num-col" }, "#"), /* @__PURE__ */ React.createElement("th", null, "Law"), /* @__PURE__ */ React.createElement("th", { className: "prio-col" }), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, current.lawsTop.map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: `l${i}` }, /* @__PURE__ */ React.createElement("td", { className: "num-col" }, l.num), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, l.name), /* @__PURE__ */ React.createElement("div", { className: "l-desc" }, l.desc)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: l.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, l.note))), current.lawsTraps.length > 0 && /* @__PURE__ */ React.createElement("tr", { className: "traps-divider" }, /* @__PURE__ */ React.createElement("td", { colSpan: "4" }, "Traps to avoid")), current.lawsTraps.map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: `lt${i}`, className: "trap-row" }, /* @__PURE__ */ React.createElement("td", { className: "num-col" }, l.num), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, l.name), /* @__PURE__ */ React.createElement("div", { className: "l-desc" }, l.desc)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: l.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, l.note)))))))));
};
window.GuidesView = GuidesView;
