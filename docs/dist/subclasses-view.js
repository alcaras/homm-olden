const CODE_TO_SKILL_ID = {
  OFF: "skill_assault",
  DEF: "skill_protection",
  RES: "skill_resistance",
  BAT: "skill_formation",
  SOR: "skill_sorcery",
  WIS: "skill_mastery",
  SUM: "skill_summoner",
  BMG: "skill_battlemage",
  DAY: "skill_magic_day",
  NGT: "skill_magic_night",
  ARC: "skill_magic_space",
  PRI: "skill_magic_primal",
  LD: "skill_leadership",
  LK: "skill_luck",
  INS: "skill_enlightenment",
  DPL: "skill_diplomacy",
  LOG: "skill_logistic",
  SCT: "skill_scouting",
  EC: "skill_economy",
  TAC: "skill_tactics"
};
const SubclassesView = () => {
  const { FACTIONS, SKILL_COLUMNS, SUBCLASSES } = window.OE_DATA;
  const skillByCode = Object.fromEntries(SKILL_COLUMNS.map((s) => [s.key, s]));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Subclasses"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Each of the 12 hero classes has two subclasses, unlocked once the hero trains ", /* @__PURE__ */ React.createElement("em", null, "five specific skills to level\xA03 (Expert)"), ". The recipe is structurally identical for every subclass:", /* @__PURE__ */ React.createElement("strong", null, " 1 Combat + 1 Magic + 1 School + 2 Utility"), "."), FACTIONS.map((f) => {
    const subs = SUBCLASSES.filter((s) => s.faction === f.id);
    if (!subs.length) return null;
    return /* @__PURE__ */ React.createElement("section", { key: f.id, className: "sub-faction-block" }, /* @__PURE__ */ React.createElement("div", { className: "faction-band" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        className: "faction-band-icon",
        loading: "lazy",
        src: `img/factions/fraction_${f.unitKey || ""}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "name" }, f.name), /* @__PURE__ */ React.createElement("div", { className: "skill" }, f.might, " / ", f.magic, " \xB7 faction skill: ", f.skill))), /* @__PURE__ */ React.createElement("div", { className: "sub-grid" }, subs.map((s) => /* @__PURE__ */ React.createElement(
      "article",
      {
        key: s.faction + s.name,
        className: `sub-card sub-${s.kind}`
      },
      /* @__PURE__ */ React.createElement("header", { className: "sub-card-head" }, /* @__PURE__ */ React.createElement("span", { className: s.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, s.kind === "might" ? "\u2694" : "\u2726"), /* @__PURE__ */ React.createElement("span", { className: "sub-name" }, s.name), /* @__PURE__ */ React.createElement("span", { className: "sub-class" }, s.class)),
      /* @__PURE__ */ React.createElement("div", { className: "sub-skills" }, s.skills.map((code) => {
        const skill = skillByCode[code];
        const sid = CODE_TO_SKILL_ID[code];
        return /* @__PURE__ */ React.createElement("div", { key: code, className: `sub-skill sub-skill-${skill?.group || ""}` }, /* @__PURE__ */ React.createElement(
          "img",
          {
            loading: "lazy",
            className: "sub-skill-icon",
            src: `img/skills/${sid}.png`,
            alt: "",
            onError: (e) => {
              e.target.style.visibility = "hidden";
            }
          }
        ), /* @__PURE__ */ React.createElement("span", { className: "sub-skill-name" }, skill?.name || code));
      })),
      /* @__PURE__ */ React.createElement(
        "div",
        {
          className: "sub-effect",
          dangerouslySetInnerHTML: { __html: s.effect }
        }
      )
    ))));
  }), /* @__PURE__ */ React.createElement("p", { className: "note" }, /* @__PURE__ */ React.createElement("strong", null, "Class-locked skills."), " Two skills never appear in subclass conditions because they are tied to class type:", " ", /* @__PURE__ */ React.createElement("em", null, "Combat"), " (might-only \u2014 Heroic Strike) and", " ", /* @__PURE__ */ React.createElement("em", null, "Thaumaturgy"), " (magic-only \u2014 second spell per round). Both are useful but irrelevant to subclass progression.", " ", /* @__PURE__ */ React.createElement("em", null, "Siegecraft"), " and ", /* @__PURE__ */ React.createElement("em", null, "Recruitment"), " are also never required \u2014 pure side options."));
};
window.SubclassesView = SubclassesView;
