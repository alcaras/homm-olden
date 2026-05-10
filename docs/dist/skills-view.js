const SkillsView = () => {
  const S = window.OE_SKILLS_DATA;
  if (!S) return /* @__PURE__ */ React.createElement("p", null, "Skills data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionById = Object.fromEntries(FACTIONS.map((f) => [f.id, f]));
  const [filter, setFilter] = React.useState("all");
  const skillsByGroup = {};
  for (const sk of S.SKILLS) {
    (skillsByGroup[sk.group] = skillsByGroup[sk.group] || []).push(sk);
  }
  const visibleGroups = filter === "all" ? S.GROUPS : S.GROUPS.filter((g) => g.id === filter);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Skills"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Every hero skill in the game \u2014 Combat, Magic, Schools, Utility, the class-locked Combat / Thaumaturgy pair, the never-in-subclass Siegecraft / Recruitment pair, and the six faction skills. Each entry shows the per-level effect, the sub-skill rewards offered at Advanced and Expert, and the subclasses that need this skill at level 3."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Group"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: filter === "all" ? "active" : "", onClick: () => setFilter("all") }, "All"), S.GROUPS.map((g) => {
    const n = (skillsByGroup[g.id] || []).length;
    if (!n) return null;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: g.id,
        className: filter === g.id ? "active" : "",
        onClick: () => setFilter(g.id)
      },
      shortGroupLabel(g.id),
      " (",
      n,
      ")"
    );
  }))), /* @__PURE__ */ React.createElement("span", { className: "count" }, S.SKILLS.length, " total")), visibleGroups.map((g) => {
    const group = skillsByGroup[g.id] || [];
    if (group.length === 0) return null;
    return /* @__PURE__ */ React.createElement("section", { key: g.id, className: "skill-group" }, /* @__PURE__ */ React.createElement("h2", null, g.label), /* @__PURE__ */ React.createElement("div", { className: "skill-list" }, group.map((sk) => /* @__PURE__ */ React.createElement(SkillCard, { key: sk.id, sk, factionById }))));
  }), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", S.GENERATED_AT, ". Data extracted by", " ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_skills.py"), " from", " ", /* @__PURE__ */ React.createElement("code", null, "DB/heroes_skills/"), " and", " ", /* @__PURE__ */ React.createElement("code", null, "Lang/english/texts/heroSkills.json"), ". Subclass mapping derived from ", /* @__PURE__ */ React.createElement("code", null, "SUBCLASSES"), " in ", /* @__PURE__ */ React.createElement("code", null, "data.js"), "."));
};
function shortGroupLabel(id) {
  return {
    "combat": "Combat",
    "magic": "Magic",
    "school": "Schools",
    "utility": "Utility",
    "combat-class": "Combat (locked)",
    "magic-class": "Magic (locked)",
    "never": "Never required",
    "faction": "Faction"
  }[id] || id;
}
const LEVEL_LABEL = ["Basic", "Advanced", "Expert"];
const SkillCard = ({ sk, factionById }) => {
  const iconFor = (li) => `img/skills/${li === 1 ? sk.id : sk.id + "_L" + li}.png`;
  const subsByFaction = {};
  for (const s of sk.subclasses) {
    (subsByFaction[s.faction] = subsByFaction[s.faction] || []).push(s);
  }
  const ownerFaction = sk.factionId && factionById[sk.factionId];
  return /* @__PURE__ */ React.createElement("article", { className: "skill-card", id: `skill-${sk.id}` }, /* @__PURE__ */ React.createElement("header", { className: "skill-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "skill-icon",
      src: iconFor(1),
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "skill-head-body" }, /* @__PURE__ */ React.createElement("div", { className: "skill-name-row" }, /* @__PURE__ */ React.createElement("h3", { className: "skill-name" }, sk.name), sk.skillType !== "Common" && /* @__PURE__ */ React.createElement("span", { className: "skill-type-chip" }, sk.skillType), ownerFaction && /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${ownerFaction.id}` }, ownerFaction.name), sk.group !== "never" && sk.group !== "faction" && sk.group !== "combat-class" && sk.group !== "magic-class" && /* @__PURE__ */ React.createElement("span", { className: "skill-sc-count" }, sk.subclasses.length, " subclass", sk.subclasses.length === 1 ? "" : "es"), sk.group === "never" && /* @__PURE__ */ React.createElement("span", { className: "skill-never" }, "never in subclass"), sk.starters.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "skill-starter-count" }, sk.starters.length, " starting hero", sk.starters.length === 1 ? "" : "es")), sk.baseDesc && /* @__PURE__ */ React.createElement("p", { className: "skill-base-desc" }, sk.baseDesc.replace(/\{[0-9]+\}/g, "?")))), /* @__PURE__ */ React.createElement("div", { className: "skill-levels" }, sk.levels.map((lvl) => /* @__PURE__ */ React.createElement("div", { key: lvl.level, className: `skill-level skill-level-${lvl.level}` }, /* @__PURE__ */ React.createElement("div", { className: "skill-level-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "skill-level-icon",
      src: iconFor(lvl.level),
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "skill-level-meta" }, /* @__PURE__ */ React.createElement("div", { className: "skill-level-tier" }, /* @__PURE__ */ React.createElement("span", { className: "skill-level-num" }, "L", lvl.level), /* @__PURE__ */ React.createElement("span", { className: "skill-level-tier-name" }, LEVEL_LABEL[lvl.level - 1])), /* @__PURE__ */ React.createElement("div", { className: "skill-level-name" }, lvl.name))), /* @__PURE__ */ React.createElement("div", { className: "skill-level-desc" }, (lvl.desc || "").replace(/\{[0-9]+\}/g, "?")), lvl.subskills.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "skill-subskills" }, /* @__PURE__ */ React.createElement("div", { className: "skill-subskills-head" }, "Sub-skill choices (", lvl.subskills.length, ")"), /* @__PURE__ */ React.createElement("ul", { className: "skill-subskills-list" }, lvl.subskills.map((ss) => /* @__PURE__ */ React.createElement("li", { key: ss.id, className: "skill-subskill" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "skill-subskill-icon",
      src: `img/subskills/${ss.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "skill-subskill-name" }, ss.name), /* @__PURE__ */ React.createElement("div", { className: "skill-subskill-desc" }, (ss.desc || "").replace(/\{[0-9]+\}/g, "?")))))))))), sk.starters.length > 0 && /* @__PURE__ */ React.createElement("footer", { className: "skill-foot skill-foot-starters" }, /* @__PURE__ */ React.createElement("div", { className: "skill-foot-head" }, "Heroes who start with ", sk.name, " (", sk.starters.length, ")"), /* @__PURE__ */ React.createElement("ul", { className: "skill-starter-list" }, sk.starters.map((h, i) => /* @__PURE__ */ React.createElement("li", { key: i, className: "skill-starter" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "skill-starter-portrait",
      src: `img/heroes/${h.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "skill-starter-body" }, /* @__PURE__ */ React.createElement("div", { className: "skill-starter-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "skill-starter-meta" }, /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${h.faction}` }, factionById[h.faction]?.name || h.faction), h.level > 1 && /* @__PURE__ */ React.createElement("span", { className: "skill-starter-level" }, "Starts at L", h.level))))))), sk.subclasses.length > 0 && /* @__PURE__ */ React.createElement("footer", { className: "skill-foot" }, /* @__PURE__ */ React.createElement("div", { className: "skill-foot-head" }, "Required by these subclasses (need this skill at Expert):"), /* @__PURE__ */ React.createElement("div", { className: "skill-foot-subs" }, Object.entries(subsByFaction).map(([fid, subs]) => /* @__PURE__ */ React.createElement("div", { key: fid, className: "skill-foot-fac" }, /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${fid}` }, factionById[fid]?.name || fid), /* @__PURE__ */ React.createElement("span", { className: "skill-foot-sub-list" }, subs.map((s, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: `skill-foot-sub${s.kind === "might" ? " might" : " magic"}` }, s.name, " ", /* @__PURE__ */ React.createElement("em", { className: "skill-foot-class" }, "(", s.class, ")")))))))));
};
window.SkillsView = SkillsView;
