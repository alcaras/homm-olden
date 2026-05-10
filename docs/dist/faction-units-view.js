const VARIANT_LABEL = {
  base: "Base",
  upg: "Upgrade",
  alt: "Alt upgrade"
};
const ATTACK_GLYPH = {
  Melee: "\u2694",
  Ranged: "\u{1F3F9}",
  Long: "\u2919"
};
const FactionUnitsView = ({ factionId, go }) => {
  const D = window.OE_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Data not loaded.");
  const fmeta = D.FACTIONS.find((f) => f.id === factionId);
  if (!fmeta) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown faction ", /* @__PURE__ */ React.createElement("code", null, factionId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("a", { href: window.OE_routeToUrl("units"), onClick: (e) => {
      e.preventDefault();
      go("units");
    } }, "Back to units")));
  }
  const units = D.UNITS.filter((u) => u.faction === factionId);
  const tiers = Array.from(new Set(units.map((u) => u.tier))).sort((a, b) => a - b);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionUnitsSwitcher, { current: factionId, factions: D.FACTIONS, go }), /* @__PURE__ */ React.createElement("div", { className: "faction-hero" }, /* @__PURE__ */ React.createElement(
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
  ), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-body" }, /* @__PURE__ */ React.createElement("h1", { className: "faction-hero-name" }, fmeta.name, " \u2014 units"), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-classes" }, "7 tiers \xB7 base / upgrade / alt upgrade"))), /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`faction/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`faction/${factionId}`);
      },
      className: "faction-page-cta"
    },
    "\u2190 ",
    fmeta.name,
    " faction page"
  ), " ", /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl("units"),
      onClick: (e) => {
        e.preventDefault();
        go("units");
      },
      className: "faction-page-cta"
    },
    "All-units sortable table \u2192"
  )), tiers.map((tier) => {
    const inTier = units.filter((u) => u.tier === tier);
    const ordered = ["base", "upg", "alt"].map((v) => inTier.find((u) => u.variant === v)).filter(Boolean);
    return /* @__PURE__ */ React.createElement("section", { key: tier, className: "ftier-block" }, /* @__PURE__ */ React.createElement("div", { className: "ftier-head" }, /* @__PURE__ */ React.createElement("span", { className: "ftier-num" }, "Tier ", tier), /* @__PURE__ */ React.createElement("span", { className: "ftier-count" }, ordered.map((u) => u.name).join(" / "))), /* @__PURE__ */ React.createElement("div", { className: "ftier-grid" }, ordered.map((u) => /* @__PURE__ */ React.createElement(UnitCard, { key: u.id, u, fmeta }))));
  }));
};
const UnitCard = ({ u, fmeta }) => {
  const atk = u.attack || "Melee";
  const dmg = u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}\u2013${u.dmgMax}`;
  return /* @__PURE__ */ React.createElement("article", { className: `ucard ucard-${u.variant}` }, /* @__PURE__ */ React.createElement("header", { className: "ucard-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "ucard-icon",
      src: `img/units/${u.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "ucard-head-body" }, /* @__PURE__ */ React.createElement("div", { className: "ucard-variant-row" }, /* @__PURE__ */ React.createElement("span", { className: `variant variant-${u.variant}` }, VARIANT_LABEL[u.variant] || u.variant), /* @__PURE__ */ React.createElement("span", { className: `atk-chip atk-${atk.toLowerCase()}` }, /* @__PURE__ */ React.createElement("span", { className: "atk-glyph" }, ATTACK_GLYPH[atk] || "\xB7"), atk)), /* @__PURE__ */ React.createElement("h3", { className: "ucard-name" }, u.name), /* @__PURE__ */ React.createElement("div", { className: "ucard-id mono" }, u.id))), u.narrative && /* @__PURE__ */ React.createElement("p", { className: "ucard-narr" }, u.narrative), /* @__PURE__ */ React.createElement("div", { className: "ucard-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "HP"), /* @__PURE__ */ React.createElement("b", null, u.hp ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Off"), /* @__PURE__ */ React.createElement("b", null, u.off ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Def"), /* @__PURE__ */ React.createElement("b", null, u.def ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Dmg"), /* @__PURE__ */ React.createElement("b", null, dmg)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Init"), /* @__PURE__ */ React.createElement("b", null, u.init ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Spd"), /* @__PURE__ */ React.createElement("b", null, u.speed ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Cost"), /* @__PURE__ */ React.createElement("b", null, u.cost?.toLocaleString() ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Value"), /* @__PURE__ */ React.createElement("b", null, u.squadValue?.toLocaleString() ?? "\u2014"))), u.passives?.length || u.abilities?.length ? /* @__PURE__ */ React.createElement("div", { className: "ucard-effects" }, u.passives?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "ucard-effect-block" }, /* @__PURE__ */ React.createElement("div", { className: "ucard-effect-head" }, "Passives"), /* @__PURE__ */ React.createElement("ul", { className: "ucard-effect-list" }, u.passives.map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-name" }, p.name), p.desc && /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-desc" }, " \u2014 ", (p.desc || "").replace(/\{[0-9]+\}/g, "?")))))), u.abilities?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "ucard-effect-block" }, /* @__PURE__ */ React.createElement("div", { className: "ucard-effect-head" }, "Active abilities"), /* @__PURE__ */ React.createElement("ul", { className: "ucard-effect-list" }, u.abilities.map((a, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-name" }, a.name), a.desc && /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-desc" }, " \u2014 ", (a.desc || "").replace(/\{[0-9]+\}/g, "?"))))))) : /* @__PURE__ */ React.createElement("div", { className: "ucard-no-effects" }, "No special abilities"));
};
const FactionUnitsSwitcher = ({ current, factions, go }) => /* @__PURE__ */ React.createElement("div", { className: "faction-switcher" }, factions.map((f) => /* @__PURE__ */ React.createElement(
  "a",
  {
    key: f.id,
    href: window.OE_routeToUrl(`units/${f.id}`),
    onClick: (e) => {
      e.preventDefault();
      go(`units/${f.id}`);
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
window.FactionUnitsView = FactionUnitsView;
