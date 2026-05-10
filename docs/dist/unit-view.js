const UnitView = ({ unitId, go }) => {
  const D = window.OE_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Data not loaded.");
  const u = D.UNITS.find((x) => x.id === unitId);
  if (!u) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown unit ", /* @__PURE__ */ React.createElement("code", null, unitId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: window.OE_routeToUrl("units"),
        onClick: (e) => {
          e.preventDefault();
          go("units");
        }
      },
      "\u2190 All units"
    )));
  }
  const fmeta = D.FACTIONS.find((f) => f.id === u.faction);
  const variants = D.UNITS.filter((x) => x.faction === u.faction && x.tier === u.tier).sort((a, b) => ["base", "upg", "alt"].indexOf(a.variant) - ["base", "upg", "alt"].indexOf(b.variant));
  const starters = (D.HEROES || []).filter((h) => (h.armySegs || []).some((seg) => seg.id === u.id));
  const dmg = u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}\u2013${u.dmgMax}`;
  const atkGlyph = { Melee: "\u2694", Ranged: "\u{1F3F9}", Long: "\u2919" }[u.attack] || "\xB7";
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, fmeta && /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`units/${u.faction}`),
      onClick: (e) => {
        e.preventDefault();
        go(`units/${u.faction}`);
      },
      className: "faction-page-cta"
    },
    "\u2190 ",
    fmeta.name,
    " units"
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
    "All units"
  )), /* @__PURE__ */ React.createElement("div", { className: "hero-page-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "hero-page-portrait",
      src: `img/units/${u.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "hero-page-titles" }, /* @__PURE__ */ React.createElement("h1", { className: "hero-page-name" }, u.name), /* @__PURE__ */ React.createElement("div", { className: "hero-page-class" }, "Tier ", u.tier, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: `variant variant-${u.variant}` }, { base: "Base", upg: "Upgrade", alt: "Alt upgrade" }[u.variant] || u.variant), " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: `atk-chip atk-${(u.attack || "").toLowerCase()}` }, /* @__PURE__ */ React.createElement("span", { className: "atk-glyph" }, atkGlyph), u.attack), fmeta && /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${u.faction}` }, fmeta.name))), /* @__PURE__ */ React.createElement("div", { className: "hero-page-id mono" }, u.id))), u.narrative && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "60em" } }, u.narrative)), /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Stats"), /* @__PURE__ */ React.createElement("div", { className: "hero-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "HP"), /* @__PURE__ */ React.createElement("b", null, u.hp ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Off"), /* @__PURE__ */ React.createElement("b", null, u.off ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Def"), /* @__PURE__ */ React.createElement("b", null, u.def ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Dmg"), /* @__PURE__ */ React.createElement("b", null, dmg)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Init"), /* @__PURE__ */ React.createElement("b", null, u.init ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Spd"), /* @__PURE__ */ React.createElement("b", null, u.speed ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Cost"), /* @__PURE__ */ React.createElement("b", null, u.cost?.toLocaleString() ?? "\u2014")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Squad val"), /* @__PURE__ */ React.createElement("b", null, u.squadValue?.toLocaleString() ?? "\u2014")))), u.passives?.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Passives"), /* @__PURE__ */ React.createElement("ul", { className: "ucard-effect-list" }, u.passives.map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-name" }, p.name), p.desc && /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-desc" }, " \u2014 ", (p.desc || "").replace(/\{[0-9]+\}/g, "?")))))), u.abilities?.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Active abilities"), /* @__PURE__ */ React.createElement("ul", { className: "ucard-effect-list" }, u.abilities.map((a, i) => /* @__PURE__ */ React.createElement("li", { key: i }, /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-name" }, a.name), a.desc && /* @__PURE__ */ React.createElement("span", { className: "ucard-effect-desc" }, " \u2014 ", (a.desc || "").replace(/\{[0-9]+\}/g, "?")))))), variants.length > 1 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Other variants in this creature line"), /* @__PURE__ */ React.createElement("div", { className: "hero-roster" }, variants.map((v) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: v.id,
      href: window.OE_routeToUrl(`unit/${v.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`unit/${v.id}`);
      },
      className: `hero-roster-card${v.id === u.id ? " current" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hero-roster-portrait",
        src: `img/units/${v.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-name" }, v.name),
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-spec" }, { base: "Base", upg: "Upgrade", alt: "Alt" }[v.variant])
  )))), starters.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Heroes who start with this unit"), /* @__PURE__ */ React.createElement("div", { className: "hero-roster" }, starters.map((h) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: h.id,
      href: window.OE_routeToUrl(`hero/${h.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`hero/${h.id}`);
      },
      className: "hero-roster-card"
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hero-roster-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-name" }, h.name)
  )))));
};
window.UnitView = UnitView;
