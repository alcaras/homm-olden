const DraftView = () => {
  const D = window.OE_DRAFT_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Draft data not loaded.");
  const SITE_FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionMeta = Object.fromEntries(SITE_FACTIONS.map((f) => [f.id, f]));
  const FactionPill = ({ fid, label }) => /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${fid}` }, label || factionMeta[fid]?.name || fid);
  const BanRank = ({ rank }) => {
    if (rank === "skip") return /* @__PURE__ */ React.createElement("span", { className: "prio-badge prio-trap" }, "skip");
    if (rank === "anti") return /* @__PURE__ */ React.createElement("span", { className: "prio-badge prio-trap" }, "anti");
    return /* @__PURE__ */ React.createElement("span", { className: "prio-badge prio-S", style: { minWidth: "1.4em", textAlign: "center", background: rank === 1 ? "#9a4818" : rank === 2 ? "#b8861b" : "#2c5d83" } }, rank);
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Draft strategy"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Quick reference for tournament/Exodus pick-ban. Use this during a draft."), /* @__PURE__ */ React.createElement("h2", null, "Format"), /* @__PURE__ */ React.createElement("ul", { className: "format-list" }, D.FORMAT.map((f, i) => /* @__PURE__ */ React.createElement("li", { key: i }, f))), /* @__PURE__ */ React.createElement("h2", null, "Faction ban priority"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "prio-col" }, "#"), /* @__PURE__ */ React.createElement("th", null, "Faction"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, D.FACTION_BAN_ORDER.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.faction, className: typeof r.rank !== "number" ? "trap-row" : "" }, /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(BanRank, { rank: r.rank })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: r.faction })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, r.why))))), /* @__PURE__ */ React.createElement("h2", null, "Faction pick priority"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "num-col" }, "#"), /* @__PURE__ */ React.createElement("th", null, "Faction"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, D.FACTION_PICK_ORDER.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: r.faction }, /* @__PURE__ */ React.createElement("td", { className: "num-col" }, i + 1), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: r.faction })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, r.why))))), /* @__PURE__ */ React.createElement("h2", null, "Going first vs second"), /* @__PURE__ */ React.createElement("div", { className: "draft-cols" }, [D.GOING_FIRST, D.GOING_SECOND].map((g, gi) => /* @__PURE__ */ React.createElement("div", { className: "draft-col", key: gi }, /* @__PURE__ */ React.createElement("h3", null, g.title), /* @__PURE__ */ React.createElement("p", { className: "draft-summary" }, g.summary), /* @__PURE__ */ React.createElement("ul", { className: "draft-steps" }, g.steps.map((s, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "step-label" }, s[0]), /* @__PURE__ */ React.createElement("span", { className: "step-body" }, s[1]))))))), /* @__PURE__ */ React.createElement("h2", null, "Counter-pick matrix"), /* @__PURE__ */ React.createElement("p", null, "If your opponent picks faction X, your best response:"), /* @__PURE__ */ React.createElement("table", { className: "guide-table counter-matrix" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Opponent picked"), /* @__PURE__ */ React.createElement("th", null, "Primary counter"), /* @__PURE__ */ React.createElement("th", null, "Why"), /* @__PURE__ */ React.createElement("th", null, "Alt counter"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, Object.entries(D.COUNTERS).map(([fid, c]) => /* @__PURE__ */ React.createElement("tr", { key: fid }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: c.primary.factionId, label: c.primary.name })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, c.primary.why), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: c.alt.factionId, label: c.alt.name })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, c.alt.why))))), /* @__PURE__ */ React.createElement("h2", null, "Top 5 hero bans by opponent faction"), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Your 3 hero bans come from your opponent's faction. Pick the top 3 rows from the relevant card."), /* @__PURE__ */ React.createElement("div", { className: "ban-grid" }, Object.entries(D.HERO_BANS).map(([fid, items]) => {
    const f = factionMeta[fid];
    return /* @__PURE__ */ React.createElement("section", { key: fid, className: "ban-section" }, /* @__PURE__ */ React.createElement("div", { className: "ban-head" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "ban-head-icon",
        src: `img/factions/fraction_${f?.unitKey || ""}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "ban-head-label" }, f?.name || fid)), /* @__PURE__ */ React.createElement("ol", { className: "ban-list" }, items.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "ban-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "ban-body" }, /* @__PURE__ */ React.createElement("div", { className: "ban-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "ban-why" }, h.why))))));
  })), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", D.GENERATED_AT, ". Edit ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_draft_guide.py"), " and rerun."));
};
window.DraftView = DraftView;
