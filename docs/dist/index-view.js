const IndexView = ({ go }) => {
  const { FACTIONS, HEROES, SUBCLASSES, UNITS } = window.OE_DATA;
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "HOMM Olden Era \u2014 Reference"), /* @__PURE__ */ React.createElement("h2", null, "Pages"), /* @__PURE__ */ React.createElement("div", { className: "card-grid" }, /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("mechanics"), onClick: (e) => {
    e.preventDefault();
    go("mechanics");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Beginner primer"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Mechanics 101"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "7"), "sections"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "6"), "faction signatures"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "20+"), "linked sources"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("buildings/temple"), onClick: (e) => {
    e.preventDefault();
    go("buildings/temple");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Interactive tool"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Buildings \u2014 Per-Faction Calculator"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length), "factions"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "~30"), "buildings each"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "7"), "resources tracked"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("laws/temple"), onClick: (e) => {
    e.preventDefault();
    go("laws/temple");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Interactive tool"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Laws \u2014 Per-Faction Calculator"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length), "factions"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "30+"), "laws each"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5"), "unlock rows"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("factions"), onClick: (e) => {
    e.preventDefault();
    go("factions");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Tournament playbook"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Factions \u2014 Per-Faction Pages"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length), "pages"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "1"), "combined view"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("artifacts"), onClick: (e) => {
    e.preventDefault();
    go("artifacts");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Bestiary"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Artifacts"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "117"), "artifacts"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "9"), "slots"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "24"), "sets"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("resources"), onClick: (e) => {
    e.preventDefault();
    go("resources");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Reference"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Resources"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "8"), "resources"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "3"), "tiers"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("map-objects"), onClick: (e) => {
    e.preventDefault();
    go("map-objects");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Bestiary"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Map Objects"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "145"), "objects"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "9"), "categories"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("map-templates"), onClick: (e) => {
    e.preventDefault();
    go("map-templates");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Multiplayer"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Map Templates"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "56"), "templates"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "2"), "modes"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "4"), "sizes"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("spells"), onClick: (e) => {
    e.preventDefault();
    go("spells");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Reference"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Spells"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "103"), "spells"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5"), "schools"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5"), "tiers"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("skills"), onClick: (e) => {
    e.preventDefault();
    go("skills");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Reference"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Skills \u2014 Deep Dive"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "30"), "skills"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "~200"), "sub-skills"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Basic / Adv / Expert")))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("subclasses"), onClick: (e) => {
    e.preventDefault();
    go("subclasses");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Reference matrix"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Subclasses & Required Skills"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, SUBCLASSES.length), "subclasses"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "20"), "skill columns"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "12"), "classes"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("heroes"), onClick: (e) => {
    e.preventDefault();
    go("heroes");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Roster"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Heroes \u2014 Stats, Skills & Armies"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, HEROES.length), "heroes"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length), "factions"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "2"), "classes each"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("units"), onClick: (e) => {
    e.preventDefault();
    go("units");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Bestiary"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Units \u2014 Creature Stats"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, UNITS.length), "unit entries"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "7"), "tiers"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length + 1), "factions + neutral"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("tier"), onClick: (e) => {
    e.preventDefault();
    go("tier");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Tournament meta"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Tier list \u2014 Tournament Heroes"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, HEROES.length), "ranked"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "10"), "top bans"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5"), "archetypes"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("guides"), onClick: (e) => {
    e.preventDefault();
    go("guides");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Tournament prep"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Faction Guides \u2014 Buildings & Laws"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, FACTIONS.length), "factions"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "5"), "universal tips"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "S/A/B"), "priorities"))), /* @__PURE__ */ React.createElement("a", { className: "card", href: window.OE_routeToUrl("draft"), onClick: (e) => {
    e.preventDefault();
    go("draft");
  } }, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, "Pick / ban"), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, "Draft \u2014 Quick Reference"), /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "6\xD76"), "counter-matrix"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "30"), "hero bans"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "2"), "playbooks")))), /* @__PURE__ */ React.createElement("h2", null, "Factions"), /* @__PURE__ */ React.createElement("div", { className: "faction-strip" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: f.id,
      href: window.OE_routeToUrl(`faction/${f.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`faction/${f.id}`);
      }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "faction-icon",
        src: `img/factions/${f.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "name" }, f.name),
    /* @__PURE__ */ React.createElement("div", { className: "skill" }, f.skill),
    /* @__PURE__ */ React.createElement("div", { className: "classes" }, /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-might" }, "\u2694"), " ", f.might, /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-magic" }, "\u2726"), " ", f.magic)
  ))), /* @__PURE__ */ React.createElement("h2", null, "Notes"), /* @__PURE__ */ React.createElement("ul", { style: { maxWidth: "56em", color: "var(--ink-2)", paddingLeft: "1.1rem" } }, /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.4em" } }, "Six playable factions: Temple (human), Necropolis (undead), Grove (nature), Hive (demon), Schism (unfrozen), Dungeon. Each has 18 heroes split into two classes \u2014 Might and Magic."), /* @__PURE__ */ React.createElement("li", { style: { marginBottom: "0.4em" } }, "Two skills are class-locked and never appear in subclass conditions:", " ", /* @__PURE__ */ React.createElement("em", null, "Combat"), " (Might-only) and ", /* @__PURE__ */ React.createElement("em", null, "Thaumaturgy"), " (Magic-only).", " ", /* @__PURE__ */ React.createElement("em", null, "Siegecraft"), " and ", /* @__PURE__ */ React.createElement("em", null, "Recruitment"), " are also never required for any subclass."), /* @__PURE__ */ React.createElement("li", null, "Effect text is preserved verbatim; placeholders like ", /* @__PURE__ */ React.createElement("code", null, "{0}"), " are filled at runtime from each subclass's ", /* @__PURE__ */ React.createElement("code", null, "bonuses"), " block.")));
};
window.IndexView = IndexView;
