const SpellView = ({ spellId, go }) => {
  const S = window.OE_SPELLS_DATA;
  if (!S) return /* @__PURE__ */ React.createElement("p", null, "Spells data not loaded.");
  const sp = S.SPELLS.find((x) => x.id === spellId);
  if (!sp) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown spell ", /* @__PURE__ */ React.createElement("code", null, spellId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: window.OE_routeToUrl("spells"),
        onClick: (e) => {
          e.preventDefault();
          go("spells");
        }
      },
      "\u2190 All spells"
    )));
  }
  const school = (S.SCHOOLS || []).find((s) => s.id === sp.school);
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const facById = Object.fromEntries(FACTIONS.map((f) => [f.id, f]));
  const manaUniq = Array.from(new Set(sp.manaCost));
  const manaText = manaUniq.length === 1 ? `${manaUniq[0]} mana` : `${Math.min(...sp.manaCost)}\u2013${Math.max(...sp.manaCost)} mana`;
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl("spells"),
      onClick: (e) => {
        e.preventDefault();
        go("spells");
      },
      className: "faction-page-cta"
    },
    "\u2190 All spells"
  )), /* @__PURE__ */ React.createElement("div", { className: "spell-page-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "spell-page-icon",
      src: `img/spells/${sp.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", { className: "spell-page-name" }, sp.name), /* @__PURE__ */ React.createElement("div", { className: "spell-page-meta" }, school && /* @__PURE__ */ React.createElement("span", { className: `mt-tag mt-tag-${sp.school}` }, school.name), " ", sp.tier > 0 && /* @__PURE__ */ React.createElement("span", { className: "mt-tag" }, "Tier ", sp.tier), " ", sp.scope === "world" && /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-tournament" }, "World"), " ", sp.magicType && /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-size" }, sp.magicType), " ", /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-players" }, manaText), sp.cooldown && /* @__PURE__ */ React.createElement(React.Fragment, null, " ", /* @__PURE__ */ React.createElement("span", { className: "mt-tag mt-tag-players" }, "CD ", sp.cooldown, "r"))), /* @__PURE__ */ React.createElement("div", { className: "spell-page-id mono" }, sp.id))), (sp.descResolved || sp.desc) && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Effect"), /* @__PURE__ */ React.createElement("p", { className: "spell-page-desc" }, sp.descResolved || sp.desc.replace(/\{[0-9]+\}/g, "?"))), sp.starters?.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hero-section" }, /* @__PURE__ */ React.createElement("h2", null, "Heroes who start with this spell"), /* @__PURE__ */ React.createElement("div", { className: "hero-roster" }, sp.starters.map((h) => /* @__PURE__ */ React.createElement(
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
    /* @__PURE__ */ React.createElement("span", { className: "hero-roster-name" }, h.name),
    facById[h.faction] && /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${h.faction}` }, facById[h.faction].name)
  )))));
};
window.SpellView = SpellView;
