const SCHOOL_LABEL_BY_ID = {
  day: "Daylight",
  night: "Nightshade",
  space: "Arcane",
  primal: "Primal",
  neutral: "Neutral"
};
const SpellsView = () => {
  const S = window.OE_SPELLS_DATA;
  if (!S) return /* @__PURE__ */ React.createElement("p", null, "Spells data not loaded.");
  const [school, setSchool] = React.useState("all");
  const [scope, setScope] = React.useState("all");
  const [tier, setTier] = React.useState("all");
  const tiers = Array.from(new Set(S.SPELLS.map((s) => s.tier))).sort((a, b) => a - b);
  const filtered = S.SPELLS.filter((sp) => {
    if (school !== "all" && sp.school !== school) return false;
    if (scope !== "all" && sp.scope !== scope) return false;
    if (tier !== "all" && sp.tier !== Number(tier)) return false;
    return true;
  });
  const bySchool = {};
  for (const sp of filtered) {
    const k = sp.school;
    bySchool[k] = bySchool[k] || {};
    (bySchool[k][sp.tier] = bySchool[k][sp.tier] || []).push(sp);
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Spells"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Every spell in the game \u2014 battle and world \u2014 pulled from the magic JSONs. Grouped by school (Daylight / Nightshade / Arcane / Primal / Neutral) and tier. Mana costs are listed per spell-level (L1\u2013L4 of each spell)."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "School"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: school === "all" ? "active" : "", onClick: () => setSchool("all") }, "All"), S.SCHOOLS.map((sk) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: sk.id,
      className: school === sk.id ? "active" : "",
      onClick: () => setSchool(sk.id)
    },
    sk.name
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Scope"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: scope === "all" ? "active" : "", onClick: () => setScope("all") }, "All"), /* @__PURE__ */ React.createElement("button", { className: scope === "battle" ? "active" : "", onClick: () => setScope("battle") }, "Battle"), /* @__PURE__ */ React.createElement("button", { className: scope === "world" ? "active" : "", onClick: () => setScope("world") }, "World"))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Tier"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: tier === "all" ? "active" : "", onClick: () => setTier("all") }, "All"), tiers.filter((t) => t > 0).map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t,
      className: tier === String(t) ? "active" : "",
      onClick: () => setTier(String(t))
    },
    "T",
    t
  )))), /* @__PURE__ */ React.createElement("span", { className: "count" }, filtered.length, " spells")), S.SCHOOLS.filter((sk) => bySchool[sk.id]).map((sk) => /* @__PURE__ */ React.createElement("section", { key: sk.id, className: `spell-school spell-school-${sk.id}` }, /* @__PURE__ */ React.createElement("h2", null, sk.name), tiers.map((t) => {
    const list = bySchool[sk.id]?.[t] || [];
    if (list.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: t, className: "spell-tier-block" }, /* @__PURE__ */ React.createElement("div", { className: "spell-tier-head" }, t === 0 ? "Untiered / passive" : `Tier ${t}`, t > 0 && /* @__PURE__ */ React.createElement("span", { className: "spell-tier-cd" }, " \xB7 cooldown ", t + 1, " rounds")), /* @__PURE__ */ React.createElement("div", { className: "spell-grid" }, list.map((sp) => /* @__PURE__ */ React.createElement(SpellCard, { key: sp.id, sp }))));
  }))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", S.GENERATED_AT, ". Data extracted by", " ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_spells.py"), " from", " ", /* @__PURE__ */ React.createElement("code", null, "DB/magics/"), " and ", /* @__PURE__ */ React.createElement("code", null, "Lang/english/texts/magic.json"), "."));
};
const SpellCard = ({ sp }) => {
  const manaUniq = Array.from(new Set(sp.manaCost));
  const manaText = manaUniq.length === 1 ? `${manaUniq[0]} mana` : `${Math.min(...sp.manaCost)}\u2013${Math.max(...sp.manaCost)} mana`;
  return /* @__PURE__ */ React.createElement("article", { className: "spell-card" }, /* @__PURE__ */ React.createElement("header", { className: "spell-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "spell-icon",
      src: `img/spells/${sp.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "spell-head-body" }, /* @__PURE__ */ React.createElement("div", { className: "spell-name-row" }, /* @__PURE__ */ React.createElement("h3", { className: "spell-name" }, sp.name), sp.scope === "world" && /* @__PURE__ */ React.createElement("span", { className: "spell-scope" }, "World")), /* @__PURE__ */ React.createElement("div", { className: "spell-meta" }, sp.magicType && /* @__PURE__ */ React.createElement("span", { className: "spell-magic-type" }, sp.magicType), /* @__PURE__ */ React.createElement("span", { className: "spell-mana" }, manaText)))), sp.desc && /* @__PURE__ */ React.createElement("p", { className: "spell-desc" }, sp.descResolved || sp.desc.replace(/\{[0-9]+\}/g, "?")));
};
window.SpellsView = SpellsView;
