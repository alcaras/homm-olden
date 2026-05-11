const HeroBuilderView = ({ heroId, initialQuery, go }) => {
  const D = window.OE_DATA;
  const C = window.OE_CLASSES_DATA;
  if (!D || !C) return /* @__PURE__ */ React.createElement("p", null, "Builder data not loaded.");
  const initial = React.useMemo(() => {
    const sp = new URLSearchParams(initialQuery || "");
    const lvl = parseInt(sp.get("lvl") || "", 10);
    return { lvl: Number.isFinite(lvl) ? Math.max(1, Math.min(40, lvl)) : 12 };
  }, [heroId]);
  const [level, setLevel] = React.useState(initial.lvl);
  React.useEffect(() => setLevel(initial.lvl), [heroId]);
  React.useEffect(() => {
    if (!heroId) return;
    const url = window.OE_routeToUrl(`builder/${heroId}` + (level !== 12 ? `?lvl=${level}` : ""));
    if (window.location.pathname + window.location.search !== url) {
      history.replaceState(null, "", url);
    }
  }, [heroId, level]);
  if (!heroId) {
    return /* @__PURE__ */ React.createElement(HeroPicker, { D, go });
  }
  const hero = D.HEROES.find((h) => h.id === heroId);
  if (!hero) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", null, "Unknown hero ", /* @__PURE__ */ React.createElement("code", null, heroId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement(
      "a",
      {
        href: window.OE_routeToUrl("builder"),
        onClick: (e) => {
          e.preventDefault();
          go("builder");
        }
      },
      "\u2190 All heroes"
    )));
  }
  const cls = C.CLASSES.find((c) => c.factionId === {
    temple: "human",
    necropolis: "undead",
    grove: "nature",
    hive: "demon",
    schism: "unfrozen",
    dungeon: "dungeon"
  }[hero.faction] && c.classType === hero.kind);
  if (!cls) return /* @__PURE__ */ React.createElement("p", null, "No class table for ", hero.name, ".");
  const fmeta = D.FACTIONS.find((f) => f.id === hero.faction);
  const breakpoint = cls.breakpoint || 24;
  const projection = React.useMemo(() => {
    const stats = { ...hero.stats };
    for (let l = 2; l <= level; l++) {
      const w = l < breakpoint ? cls.rollPre : cls.rollPost;
      for (const k of ["A", "D", "P", "K"]) stats[k] += w[k] || 0;
    }
    return stats;
  }, [hero, level, cls]);
  const fmtStat = (n) => Number.isInteger(n) ? n.toString() : n.toFixed(1);
  const skillTotal = cls.skills.reduce((a, s) => a + s.chance, 0) + (cls.factionSkill?.chance || 0);
  const skills = [...cls.skills, ...cls.factionSkill ? [{
    key: "faction",
    name: cls.factionSkill.name,
    group: "utility",
    chance: cls.factionSkill.chance,
    isFaction: true
  }] : []].filter((s) => s.chance > 0).sort((a, b) => b.chance - a.chance);
  const startingSkillNames = new Set((hero.skills || []).map((s) => s.split(" L")[0]));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl("builder"),
      onClick: (e) => {
        e.preventDefault();
        go("builder");
      },
      className: "faction-page-cta"
    },
    "\u2190 All heroes"
  )), /* @__PURE__ */ React.createElement("div", { className: "hero-page-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "hero-page-portrait",
      src: `img/heroes/${hero.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "hero-page-titles" }, /* @__PURE__ */ React.createElement("h1", { className: "hero-page-name" }, hero.name), /* @__PURE__ */ React.createElement("div", { className: "hero-page-class" }, fmeta && /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${hero.faction}` }, fmeta.name), " ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, cls.name), " \xB7 ", /* @__PURE__ */ React.createElement("em", null, hero.specialty)))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("div", { className: "hb-level-head" }, /* @__PURE__ */ React.createElement("h2", null, "Stats at level ", /* @__PURE__ */ React.createElement("span", { className: "hb-level-val" }, level)), level >= breakpoint && /* @__PURE__ */ React.createElement("span", { className: "hb-bp-note" }, "post-", breakpoint, " stat distribution")), /* @__PURE__ */ React.createElement("div", { className: "hb-level-control" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: "1",
      max: "40",
      value: level,
      onChange: (e) => setLevel(parseInt(e.target.value, 10)),
      className: "hb-slider"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "hb-level-ticks" }, [1, 6, 12, 18, breakpoint, 30, 40].map((n) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: n,
      className: "hb-tick" + (level === n ? " active" : ""),
      onClick: () => setLevel(n)
    },
    n === breakpoint ? `L${n}\u2020` : `L${n}`
  )))), /* @__PURE__ */ React.createElement("div", { className: "hb-stats" }, [["A", "Attack"], ["D", "Defense"], ["P", "Power"], ["K", "Knowledge"]].map(([k, lbl]) => /* @__PURE__ */ React.createElement("div", { key: k, className: "hb-stat" }, /* @__PURE__ */ React.createElement("div", { className: "hb-stat-lbl" }, lbl), /* @__PURE__ */ React.createElement("div", { className: "hb-stat-val" }, fmtStat(projection[k])), /* @__PURE__ */ React.createElement("div", { className: "hb-stat-base" }, "start ", hero.stats[k])))), /* @__PURE__ */ React.createElement("p", { className: "hb-foot mono" }, level === 1 ? "Starting stats. Each level-up grants 1 point in one of the four stats." : `Expected after ${level - 1} level-up rolls. \u2020 = post-${breakpoint} distribution kicks in at L${breakpoint}.`)), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting baseline"), /* @__PURE__ */ React.createElement("div", { className: "hb-base-grid" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-block" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-eyebrow" }, "Skills"), /* @__PURE__ */ React.createElement("div", { className: "hb-chips" }, (hero.skills || []).map((s) => /* @__PURE__ */ React.createElement("span", { key: s, className: "hb-chip" }, s)))), hero.spells?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "hb-base-block" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-eyebrow" }, "Spells"), /* @__PURE__ */ React.createElement("div", { className: "hb-chips" }, hero.spells.map((sp) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: sp.id,
      className: "hb-chip hb-chip-spell" + (sp.masterful ? " masterful" : ""),
      href: window.OE_routeToUrl(`spell/${sp.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`spell/${sp.id}`);
      }
    },
    sp.masterful && /* @__PURE__ */ React.createElement("em", null, "Masterful"),
    sp.name
  )))), hero.armySegs?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "hb-base-block" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-eyebrow" }, "Army"), /* @__PURE__ */ React.createElement("div", { className: "hb-chips" }, hero.armySegs.map((seg) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: seg.id,
      className: "hb-chip",
      href: window.OE_routeToUrl(`unit/${seg.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`unit/${seg.id}`);
      }
    },
    /* @__PURE__ */ React.createElement("span", { className: "hb-army-count mono" }, seg.min, "\u2013", seg.max),
    " ",
    seg.name
  ))))), hero.specDesc && /* @__PURE__ */ React.createElement("p", { className: "hb-spec mono" }, /* @__PURE__ */ React.createElement("b", null, hero.specialty, "."), " ", hero.specDesc.replace(/\{[0-9]+\}/g, "?"))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Skill roll table"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Each level-up offers 2 skills picked by weighted random. Probabilities shown assume every skill is still eligible \u2014 once you reach L3 in a skill it drops out of the pool, raising the others."), /* @__PURE__ */ React.createElement("table", { className: "hb-skill-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Skill"), /* @__PURE__ */ React.createElement("th", null, "Group"), /* @__PURE__ */ React.createElement("th", { className: "hb-num" }, "Weight"), /* @__PURE__ */ React.createElement("th", { className: "hb-num" }, "Single-roll chance"))), /* @__PURE__ */ React.createElement("tbody", null, skills.map((s) => {
    const starting = startingSkillNames.has(s.name);
    const pct = (100 * s.chance / skillTotal).toFixed(1);
    return /* @__PURE__ */ React.createElement("tr", { key: s.key, className: starting ? "hb-skill-starting" : "" }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `hb-skill-dot hb-skill-${s.group}` }), s.name, starting && /* @__PURE__ */ React.createElement("span", { className: "hb-skill-tag" }, "starting")), /* @__PURE__ */ React.createElement("td", { className: "hb-skill-group" }, s.group), /* @__PURE__ */ React.createElement("td", { className: "hb-num mono" }, s.chance), /* @__PURE__ */ React.createElement("td", { className: "hb-num mono" }, pct, "%"));
  })))));
};
const HeroPicker = ({ D, go }) => {
  const [faction, setFaction] = React.useState("temple");
  const heroes = D.HEROES.filter((h) => h.faction === faction).sort((a, b) => a.name.localeCompare(b.name));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Hero builder"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Plan a hero's stat trajectory and see what the level-up roll table looks like for their class. Shareable via URL. ", /* @__PURE__ */ React.createElement("em", null, "(MVP \u2014 no skill/artifact/army loadout editing yet.)")), /* @__PURE__ */ React.createElement("div", { className: "hb-fac-row" }, D.FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      type: "button",
      className: `cs-fac-pill faction-${f.id}${faction === f.id ? " selected" : ""}`,
      onClick: () => setFaction(f.id)
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        src: `img/factions/fraction_${f.unitKey || ""}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", null, f.name)
  ))), /* @__PURE__ */ React.createElement("div", { className: "hb-hero-grid" }, heroes.map((h) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: h.id,
      className: `hb-hero-card hb-${h.kind}`,
      href: window.OE_routeToUrl(`builder/${h.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`builder/${h.id}`);
      },
      title: `${h.name} \u2014 ${h.specialty}`
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hb-hero-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "hb-hero-name" }, h.name),
    /* @__PURE__ */ React.createElement("div", { className: "hb-hero-spec" }, h.specialty)
  ))));
};
window.HeroBuilderView = HeroBuilderView;
