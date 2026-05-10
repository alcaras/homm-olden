const TIER_ORDER = ["S", "A", "B", "C"];
const TIER_LABEL = {
  S: "perma-pick / perma-ban",
  A: "strong contested",
  B: "situational / playable",
  C: "avoid"
};
const FactionView = ({ factionId, go }) => {
  const T = window.OE_TIER_DATA;
  const D = window.OE_DRAFT_DATA;
  if (!T) return /* @__PURE__ */ React.createElement("p", null, "Tier data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const fmeta = FACTIONS.find((f) => f.id === factionId);
  if (!fmeta) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown faction ", /* @__PURE__ */ React.createElement("code", null, factionId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("a", { href: window.OE_routeToUrl("factions"), onClick: (e) => {
      e.preventDefault();
      go("factions");
    } }, "Back to factions")));
  }
  const heroes = T.BY_FACTION && T.BY_FACTION[factionId] || [];
  const heroBans = D?.HERO_BANS && D.HERO_BANS[factionId] || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionSwitcher, { current: factionId, factions: FACTIONS, go }), /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`buildings/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`buildings/${factionId}`);
      },
      className: "faction-page-cta"
    },
    fmeta.name,
    " buildings calc \u2192"
  ), " ", /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`laws/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`laws/${factionId}`);
      },
      className: "faction-page-cta"
    },
    fmeta.name,
    " laws calc \u2192"
  ), " ", /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`units/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`units/${factionId}`);
      },
      className: "faction-page-cta"
    },
    fmeta.name,
    " units \u2192"
  )), /* @__PURE__ */ React.createElement("div", { className: "faction-hero" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      className: "faction-hero-icon",
      loading: "lazy",
      src: `img/factions/fraction_${fmeta.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-body" }, /* @__PURE__ */ React.createElement("h1", { className: "faction-hero-name" }, fmeta.name), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-classes" }, /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-might" }, "\u2694"), " ", fmeta.might, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-magic" }, "\u2726"), " ", fmeta.magic, fmeta.skill && /* @__PURE__ */ React.createElement("span", { className: "faction-hero-skill" }, " \xB7 ", fmeta.skill)))), /* @__PURE__ */ React.createElement("h2", null, "Hero tier list"), TIER_ORDER.map((tier) => {
    const t_rows = heroes.filter((r) => r.tier === tier);
    if (t_rows.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: tier, className: `tier-block tier-block-${tier}` }, /* @__PURE__ */ React.createElement("div", { className: "tier-head" }, /* @__PURE__ */ React.createElement("span", { className: `tier-badge tier-${tier}` }, tier), /* @__PURE__ */ React.createElement("span", { className: "tier-label" }, TIER_LABEL[tier]), /* @__PURE__ */ React.createElement("span", { className: "tier-count" }, t_rows.length)), /* @__PURE__ */ React.createElement("ul", { className: "tier-heroes" }, t_rows.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id, className: "tier-hero" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "th-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "th-body" }, /* @__PURE__ */ React.createElement("div", { className: "th-name-row" }, /* @__PURE__ */ React.createElement("span", { className: "th-name" }, h.name), /* @__PURE__ */ React.createElement("span", { className: h.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, h.kind === "might" ? "\u2694" : "\u2726"), /* @__PURE__ */ React.createElement("span", { className: "th-class" }, h.kind === "might" ? fmeta.might : fmeta.magic), /* @__PURE__ */ React.createElement("span", { className: "th-specialty" }, h.specialty)), /* @__PURE__ */ React.createElement("div", { className: "th-army" }, h.army), /* @__PURE__ */ React.createElement("div", { className: "th-note" }, h.note))))));
  }), heroBans.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Top hero bans against ", fmeta.name), /* @__PURE__ */ React.createElement("ol", { className: "ban-list ban-list-tall" }, heroBans.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id }, /* @__PURE__ */ React.createElement(
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
  ), /* @__PURE__ */ React.createElement("div", { className: "ban-body" }, /* @__PURE__ */ React.createElement("div", { className: "ban-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "ban-why" }, h.why)))))));
};
const FactionSwitcher = ({ current, factions, go }) => /* @__PURE__ */ React.createElement("div", { className: "faction-switcher" }, factions.map((f) => /* @__PURE__ */ React.createElement(
  "a",
  {
    key: f.id,
    href: window.OE_routeToUrl(`faction/${f.id}`),
    onClick: (e) => {
      e.preventDefault();
      go(`faction/${f.id}`);
    },
    className: f.id === current ? "active" : ""
  },
  /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      src: `img/factions/fraction_${f.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.display = "none";
      }
    }
  ),
  /* @__PURE__ */ React.createElement("span", null, f.name)
)));
const FactionsHubView = ({ go }) => {
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Factions"), /* @__PURE__ */ React.createElement("div", { className: "card-grid" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: f.id,
      className: "card faction-card",
      href: window.OE_routeToUrl(`faction/${f.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`faction/${f.id}`);
      }
    },
    /* @__PURE__ */ React.createElement("div", { className: "faction-card-head" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "faction-card-icon",
        src: `img/factions/fraction_${f.unitKey || ""}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, f.might, " / ", f.magic), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, f.name)))
  ))));
};
window.FactionView = FactionView;
window.FactionsHubView = FactionsHubView;
