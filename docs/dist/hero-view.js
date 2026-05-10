const HeroView = ({ heroId, go }) => {
  const D = window.OE_DATA;
  const T = window.OE_TIER_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Data not loaded.");
  const h = D.HEROES.find((x) => x.id === heroId);
  if (!h) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown hero ", /* @__PURE__ */ React.createElement("code", null, heroId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: window.OE_routeToUrl("heroes"),
        onClick: (e) => {
          e.preventDefault();
          go("heroes");
        }
      },
      "\u2190 Back to heroes"
    )));
  }
  const fmeta = D.FACTIONS.find((f) => f.id === h.faction);
  const className = h.kind === "might" ? fmeta?.might : fmeta?.magic;
  let tierEntry = null;
  if (T?.BY_FACTION) {
    const list = T.BY_FACTION[h.faction] || [];
    tierEntry = list.find((r) => r.id === heroId);
  }
  const factionRoster = D.HEROES.filter((x) => x.faction === h.faction);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`faction/${h.faction}`),
      onClick: (e) => {
        e.preventDefault();
        go(`faction/${h.faction}`);
      },
      className: "faction-page-cta"
    },
    "\u2190 ",
    fmeta?.name,
    " faction"
  ), " ", /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl("heroes"),
      onClick: (e) => {
        e.preventDefault();
        go("heroes");
      },
      className: "faction-page-cta"
    },
    "All heroes"
  )), /* @__PURE__ */ React.createElement("div", { className: "hero-page-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "hero-page-portrait",
      src: `img/heroes/${h.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "hero-page-titles" }, /* @__PURE__ */ React.createElement("h1", { className: "hero-page-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "hero-page-class" }, /* @__PURE__ */ React.createElement("span", { className: h.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, h.kind === "might" ? "\u2694" : "\u2726"), " ", className, fmeta && /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${h.faction}` }, fmeta.name))), /* @__PURE__ */ React.createElement("div", { className: "hero-page-id mono" }, h.id))), h.specialty && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Specialization"), /* @__PURE__ */ React.createElement("div", { className: "hero-spec" }, h.specId && /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "hero-spec-icon",
      src: `img/specs/${h.specId}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "hero-spec-name" }, h.specialty), h.specDesc && /* @__PURE__ */ React.createElement("p", { className: "hero-spec-desc" }, h.specDesc)))), /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting stats"), /* @__PURE__ */ React.createElement("div", { className: "hero-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Attack"), /* @__PURE__ */ React.createElement("b", null, h.stats.A)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Defense"), /* @__PURE__ */ React.createElement("b", null, h.stats.D)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Power"), /* @__PURE__ */ React.createElement("b", null, h.stats.P)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "lbl" }, "Knowledge"), /* @__PURE__ */ React.createElement("b", null, h.stats.K)))), h.skills?.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting skills"), /* @__PURE__ */ React.createElement("div", { className: "hero-chips" }, h.skills.map((s, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "skill-chip" }, s)))), h.spells?.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting spells"), /* @__PURE__ */ React.createElement("ul", { className: "hero-spell-list" }, h.spells.map((s) => /* @__PURE__ */ React.createElement("li", { key: s.id, className: "hero-spell-row" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "hero-spell-icon",
      src: `img/spells/${s.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "hero-spell-name" }, s.name), /* @__PURE__ */ React.createElement("div", { className: "hero-spell-meta" }, "L", s.level, " ", s.learned ? "\xB7 learned" : "")))))), h.army && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting army"), /* @__PURE__ */ React.createElement("p", { className: "hero-army" }, h.army), h.armyScore != null && /* @__PURE__ */ React.createElement("p", { className: "hero-army-score" }, "Army score: ", /* @__PURE__ */ React.createElement("b", null, h.armyScore.toLocaleString()))), tierEntry && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Tier list (lexiav)"), /* @__PURE__ */ React.createElement("div", { className: "hero-tier-row" }, /* @__PURE__ */ React.createElement("span", { className: `tier-badge tier-${tierEntry.tier}` }, tierEntry.tier), /* @__PURE__ */ React.createElement("span", { className: "hero-tier-note" }, tierEntry.note))), /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Other ", fmeta?.name, " heroes"), /* @__PURE__ */ React.createElement("div", { className: "hero-roster" }, factionRoster.map((r) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: r.id,
      href: window.OE_routeToUrl(`hero/${r.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`hero/${r.id}`);
      },
      className: `hero-roster-card${r.id === h.id ? " current" : ""}`
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hero-roster-portrait",
        src: `img/heroes/${r.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-name" }, r.name),
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-spec" }, r.specialty)
  )))));
};
window.HeroView = HeroView;
