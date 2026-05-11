const SKILL_LVL_LABEL = { 1: "Basic", 2: "Advanced", 3: "Expert" };
const _weightedPick = (pool) => {
  const tot = pool.reduce((a, s) => a + s.chance, 0);
  if (tot <= 0) return null;
  let r = Math.random() * tot;
  for (const s of pool) {
    r -= s.chance;
    if (r <= 0) return s;
  }
  return pool[pool.length - 1];
};
const HeroBuilderView = ({ heroId, initialQuery, go }) => {
  const D = window.OE_DATA;
  const C = window.OE_CLASSES_DATA;
  if (!D || !C) return /* @__PURE__ */ React.createElement("p", null, "Builder data not loaded.");
  if (!heroId) return /* @__PURE__ */ React.createElement(HeroPicker, { D, go });
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
  const fullSkillPool = React.useMemo(() => {
    const out = cls.skills.filter((s) => s.chance > 0).map((s) => ({ ...s }));
    if (cls.factionSkill?.chance > 0) {
      out.push({
        key: "faction",
        name: cls.factionSkill.name,
        group: "utility",
        chance: cls.factionSkill.chance,
        isFaction: true
      });
    }
    return out;
  }, [cls]);
  const initialSkills = React.useMemo(() => {
    const m = {};
    for (const s of hero.skills || []) {
      const match = s.match(/^(.*?) L(\d+)$/);
      if (match) m[match[1]] = parseInt(match[2], 10);
    }
    return m;
  }, [hero]);
  const initialState = React.useCallback(() => ({
    level: 1,
    stats: { ...hero.stats },
    skills: { ...initialSkills },
    pending: null,
    // { stat, offered: [skill, skill], levelTarget }
    log: [],
    // [{ level, stat, skillName, skillLvlAfter }]
    items: {},
    // { slot: artifactId }
    pickerSlot: null
    // which slot's picker is currently open
  }), [hero, initialSkills]);
  const [sim, setSim] = React.useState(initialState);
  React.useEffect(() => {
    setSim(initialState());
  }, [heroId]);
  const rollTable = React.useMemo(
    () => sim.level + 1 < breakpoint ? cls.rollPre : cls.rollPost,
    [sim.level, breakpoint, cls]
  );
  const eligible = React.useMemo(() => {
    return fullSkillPool.filter((s) => (sim.skills[s.name] || 0) < 3);
  }, [fullSkillPool, sim.skills]);
  const rollLevelUp = () => {
    if (sim.pending) return;
    const tableEntries = [
      { key: "A", chance: rollTable.A || 0 },
      { key: "D", chance: rollTable.D || 0 },
      { key: "P", chance: rollTable.P || 0 },
      { key: "K", chance: rollTable.K || 0 }
    ];
    const stat = _weightedPick(tableEntries)?.key || "K";
    let pool = [...eligible];
    const offered = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const pick = _weightedPick(pool);
      if (!pick) break;
      offered.push(pick);
      pool = pool.filter((s) => s.name !== pick.name);
    }
    setSim((prev) => ({ ...prev, pending: { stat, offered, levelTarget: prev.level + 1 } }));
  };
  const pickSkill = (s) => {
    if (!sim.pending) return;
    setSim((prev) => {
      const { stat, offered, levelTarget } = prev.pending;
      const newLvl = (prev.skills[s.name] || 0) + 1;
      return {
        ...prev,
        level: levelTarget,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
        skills: { ...prev.skills, [s.name]: newLvl },
        pending: null,
        log: [...prev.log, {
          level: levelTarget,
          stat,
          skillName: s.name,
          skillLvlAfter: newLvl,
          skillGroup: s.group
        }]
      };
    });
  };
  const reroll = () => {
    if (!sim.pending) return;
    let pool = [...eligible];
    const offered = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const pick = _weightedPick(pool);
      if (!pick) break;
      offered.push(pick);
      pool = pool.filter((s) => s.name !== pick.name);
    }
    setSim((prev) => ({ ...prev, pending: { ...prev.pending, offered } }));
  };
  const undoLastLevel = () => {
    setSim((prev) => {
      if (prev.pending) return { ...prev, pending: null };
      if (prev.log.length === 0) return prev;
      const last = prev.log[prev.log.length - 1];
      const skills = { ...prev.skills };
      const newLvl = (skills[last.skillName] || 0) - 1;
      const startingLvl = initialSkills[last.skillName] || 0;
      if (newLvl <= startingLvl) {
        if (startingLvl > 0) skills[last.skillName] = startingLvl;
        else delete skills[last.skillName];
      } else {
        skills[last.skillName] = newLvl;
      }
      return {
        ...prev,
        level: prev.level - 1,
        stats: { ...prev.stats, [last.stat]: prev.stats[last.stat] - 1 },
        skills,
        log: prev.log.slice(0, -1),
        pending: null
      };
    });
  };
  const reset = () => setSim(initialState());
  const A = window.OE_ARTIFACTS_DATA;
  const artifactsBySlot = React.useMemo(() => {
    const g = {};
    for (const a of A?.ARTIFACTS || []) {
      (g[a.slot] = g[a.slot] || []).push(a);
    }
    const rOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    for (const k of Object.keys(g)) {
      g[k].sort((x, y) => (rOrder[x.rarity] ?? 9) - (rOrder[y.rarity] ?? 9) || x.name.localeCompare(y.name));
    }
    return g;
  }, [A]);
  const artifactById = React.useMemo(() => {
    const m = {};
    for (const a of A?.ARTIFACTS || []) m[a.id] = a;
    return m;
  }, [A]);
  const openPicker = (slot) => setSim((prev) => ({ ...prev, pickerSlot: prev.pickerSlot === slot ? null : slot }));
  const equip = (slot, artifactId) => setSim((prev) => ({
    ...prev,
    items: { ...prev.items, [slot]: artifactId },
    pickerSlot: null
  }));
  const unequip = (slot) => setSim((prev) => {
    const items = { ...prev.items };
    delete items[slot];
    return { ...prev, items };
  });
  const STAT_LABEL = { A: "Attack", D: "Defense", P: "Power", K: "Knowledge" };
  const skillTotal = fullSkillPool.reduce((a, s) => a + s.chance, 0);
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
  ), /* @__PURE__ */ React.createElement("div", { className: "hero-page-titles" }, /* @__PURE__ */ React.createElement("h1", { className: "hero-page-name" }, hero.name), /* @__PURE__ */ React.createElement("div", { className: "hero-page-class" }, fmeta && /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${hero.faction}` }, fmeta.name), " ", /* @__PURE__ */ React.createElement("span", { className: "mono" }, cls.name), " \xB7 ", /* @__PURE__ */ React.createElement("em", null, hero.specialty)))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("div", { className: "hb-level-head" }, /* @__PURE__ */ React.createElement("h2", null, "Level ", /* @__PURE__ */ React.createElement("span", { className: "hb-level-val" }, sim.level)), sim.level + 1 >= breakpoint && /* @__PURE__ */ React.createElement("span", { className: "hb-bp-note" }, "post-", breakpoint, " roll table active from L", breakpoint), /* @__PURE__ */ React.createElement("div", { className: "hb-actions" }, !sim.pending && /* @__PURE__ */ React.createElement("button", { className: "hb-btn hb-btn-primary", onClick: rollLevelUp }, "Level up \u2192"), /* @__PURE__ */ React.createElement(
    "button",
    {
      className: "hb-btn",
      onClick: undoLastLevel,
      disabled: sim.log.length === 0 && !sim.pending
    },
    "Undo"
  ), /* @__PURE__ */ React.createElement("button", { className: "hb-btn", onClick: reset }, "Reset"))), /* @__PURE__ */ React.createElement("div", { className: "hb-stats" }, ["A", "D", "P", "K"].map((k) => {
    const flashing = sim.pending?.stat === k;
    return /* @__PURE__ */ React.createElement("div", { key: k, className: "hb-stat" + (flashing ? " rolled" : "") }, /* @__PURE__ */ React.createElement("div", { className: "hb-stat-lbl" }, STAT_LABEL[k]), /* @__PURE__ */ React.createElement("div", { className: "hb-stat-val" }, sim.stats[k], flashing && /* @__PURE__ */ React.createElement("span", { className: "hb-stat-delta" }, "+1")), /* @__PURE__ */ React.createElement("div", { className: "hb-stat-base" }, "start ", hero.stats[k]));
  })), /* @__PURE__ */ React.createElement("p", { className: "hb-foot mono" }, "Next-level stat-roll weights:", " ", "A ", Math.round(100 * (rollTable.A || 0)), "%", " \xB7 ", "D ", Math.round(100 * (rollTable.D || 0)), "%", " \xB7 ", "P ", Math.round(100 * (rollTable.P || 0)), "%", " \xB7 ", "K ", Math.round(100 * (rollTable.K || 0)), "%")), sim.pending && /* @__PURE__ */ React.createElement("section", { className: "hb-section hb-prompt" }, /* @__PURE__ */ React.createElement("h2", null, "L", sim.pending.levelTarget, " \u2014 pick a skill"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Stat roll: ", /* @__PURE__ */ React.createElement("b", null, "+1 ", STAT_LABEL[sim.pending.stat]), ". Choose one of the offered skills:"), sim.pending.offered.length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "hb-foot" }, "All skills at Expert \u2014 no offers remaining.") : /* @__PURE__ */ React.createElement("div", { className: "hb-offers" }, sim.pending.offered.map((s) => {
    const cur = sim.skills[s.name] || 0;
    const nextLvl = cur + 1;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.name,
        className: `hb-offer hb-offer-${s.group}`,
        onClick: () => pickSkill(s)
      },
      /* @__PURE__ */ React.createElement("span", { className: `hb-skill-dot hb-skill-${s.group}` }),
      /* @__PURE__ */ React.createElement("span", { className: "hb-offer-name" }, s.name),
      /* @__PURE__ */ React.createElement("span", { className: "hb-offer-lvl" }, cur === 0 ? "New" : `L${cur} \u2192`, " ", SKILL_LVL_LABEL[nextLvl]),
      /* @__PURE__ */ React.createElement("span", { className: "hb-offer-chance mono" }, (100 * s.chance / skillTotal).toFixed(1), "% weight")
    );
  })), /* @__PURE__ */ React.createElement("button", { className: "hb-btn hb-btn-sm", onClick: reroll }, "Reroll offers")), A && /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Items (", Object.keys(sim.items).length, "/", A.SLOT_ORDER.length, ")"), /* @__PURE__ */ React.createElement("div", { className: "hb-slots" }, A.SLOT_ORDER.map((slot) => {
    const equipped = sim.items[slot] ? artifactById[sim.items[slot]] : null;
    const open = sim.pickerSlot === slot;
    return /* @__PURE__ */ React.createElement("div", { key: slot, className: "hb-slot" + (open ? " open" : "") + (equipped ? " filled" : " empty") }, /* @__PURE__ */ React.createElement("button", { className: "hb-slot-btn", onClick: () => openPicker(slot) }, /* @__PURE__ */ React.createElement("span", { className: "hb-slot-lbl" }, A.SLOT_LABEL[slot]), equipped ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hb-slot-img",
        src: `img/artifacts/${equipped.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("span", { className: `hb-slot-name hb-rarity-${equipped.rarity}` }, equipped.name)) : /* @__PURE__ */ React.createElement("span", { className: "hb-slot-empty" }, "\u2014 empty \u2014")), equipped && /* @__PURE__ */ React.createElement(
      "button",
      {
        className: "hb-slot-x",
        onClick: () => unequip(slot),
        title: "Unequip"
      },
      "\xD7"
    ));
  })), sim.pickerSlot && /* @__PURE__ */ React.createElement(
    ArtifactPicker,
    {
      slot: sim.pickerSlot,
      slotLabel: A.SLOT_LABEL[sim.pickerSlot],
      candidates: artifactsBySlot[sim.pickerSlot] || [],
      currentId: sim.items[sim.pickerSlot],
      onPick: (id) => equip(sim.pickerSlot, id),
      onClose: () => setSim((prev) => ({ ...prev, pickerSlot: null }))
    }
  ), Object.keys(sim.items).length > 0 && /* @__PURE__ */ React.createElement("div", { className: "hb-item-bonuses" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-eyebrow" }, "Bonuses from equipped items"), /* @__PURE__ */ React.createElement("ul", { className: "hb-bonus-list" }, Object.values(sim.items).map((id) => artifactById[id]).filter(Boolean).flatMap((a) => (a.bonuses || []).map((b, i) => ({ a, b, key: `${a.id}-${i}` }))).map(({ a, b, key }) => /* @__PURE__ */ React.createElement("li", { key }, /* @__PURE__ */ React.createElement("span", { className: `hb-rarity-${a.rarity}` }, a.name), /* @__PURE__ */ React.createElement("span", { className: "hb-bonus-sep" }, " \xB7 "), /* @__PURE__ */ React.createElement("span", null, b)))))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Skills (", Object.keys(sim.skills).length, ")"), Object.keys(sim.skills).length === 0 ? /* @__PURE__ */ React.createElement("p", { className: "hb-foot" }, "No skills yet \u2014 level up to acquire.") : /* @__PURE__ */ React.createElement("div", { className: "hb-chips" }, Object.entries(sim.skills).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([name, lvl]) => {
    const grp = fullSkillPool.find((s) => s.name === name)?.group || "utility";
    const isStarting = (initialSkills[name] || 0) > 0;
    return /* @__PURE__ */ React.createElement("span", { key: name, className: `hb-skill-chip hb-skill-${grp}` }, /* @__PURE__ */ React.createElement("span", { className: `hb-skill-dot hb-skill-${grp}` }), name, " ", /* @__PURE__ */ React.createElement("b", null, "L", lvl), isStarting && /* @__PURE__ */ React.createElement("span", { className: "hb-skill-tag" }, "starting"));
  }))), sim.log.length > 0 && /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Level-up log"), /* @__PURE__ */ React.createElement("table", { className: "hb-log-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Lvl"), /* @__PURE__ */ React.createElement("th", null, "Stat"), /* @__PURE__ */ React.createElement("th", null, "Skill picked"))), /* @__PURE__ */ React.createElement("tbody", null, sim.log.slice().reverse().map((row, i) => /* @__PURE__ */ React.createElement("tr", { key: sim.log.length - i }, /* @__PURE__ */ React.createElement("td", { className: "mono" }, "L", row.level), /* @__PURE__ */ React.createElement("td", null, "+1 ", STAT_LABEL[row.stat]), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `hb-skill-dot hb-skill-${row.skillGroup}` }), row.skillName, " \u2192 L", row.skillLvlAfter, " (", SKILL_LVL_LABEL[row.skillLvlAfter], ")")))))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Starting baseline"), /* @__PURE__ */ React.createElement("div", { className: "hb-base-grid" }, hero.spells?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "hb-base-block" }, /* @__PURE__ */ React.createElement("div", { className: "hb-base-eyebrow" }, "Spells"), /* @__PURE__ */ React.createElement("div", { className: "hb-chips" }, hero.spells.map((sp) => /* @__PURE__ */ React.createElement(
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
  ))))), hero.specDesc && /* @__PURE__ */ React.createElement("p", { className: "hb-spec mono" }, /* @__PURE__ */ React.createElement("b", null, hero.specialty, "."), " ", hero.specDesc.replace(/\{[0-9]+\}/g, "?"))), /* @__PURE__ */ React.createElement("section", { className: "hb-section" }, /* @__PURE__ */ React.createElement("h2", null, "Skill roll table (reference)"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Single-roll probability over the full class skill pool. Picked skills that reach L3 (Expert) drop out and the others re-normalize."), /* @__PURE__ */ React.createElement("table", { className: "hb-skill-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Skill"), /* @__PURE__ */ React.createElement("th", null, "Group"), /* @__PURE__ */ React.createElement("th", { className: "hb-num" }, "Weight"), /* @__PURE__ */ React.createElement("th", { className: "hb-num" }, "P(roll)"))), /* @__PURE__ */ React.createElement("tbody", null, [...fullSkillPool].sort((a, b) => b.chance - a.chance).map((s) => {
    const cur = sim.skills[s.name] || 0;
    const isStarting = (initialSkills[s.name] || 0) > 0;
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: s.key || s.name,
        className: cur >= 3 ? "hb-skill-maxed" : isStarting ? "hb-skill-starting" : ""
      },
      /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `hb-skill-dot hb-skill-${s.group}` }), s.name, cur > 0 && /* @__PURE__ */ React.createElement("span", { className: "hb-skill-cur" }, " L", cur), cur >= 3 && /* @__PURE__ */ React.createElement("span", { className: "hb-skill-tag hb-skill-tag-max" }, "maxed")),
      /* @__PURE__ */ React.createElement("td", { className: "hb-skill-group" }, s.group),
      /* @__PURE__ */ React.createElement("td", { className: "hb-num mono" }, s.chance),
      /* @__PURE__ */ React.createElement("td", { className: "hb-num mono" }, (100 * s.chance / skillTotal).toFixed(1), "%")
    );
  })))));
};
const HeroPicker = ({ D, go }) => {
  const [faction, setFaction] = React.useState("temple");
  const heroes = D.HEROES.filter((h) => h.faction === faction).sort((a, b) => a.name.localeCompare(b.name));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Hero Level-Up Simulator"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Pick a hero, then simulate their level-ups: each click rolls a stat increase + 2 skill offers, and you pick one. Undo + reset any time."), /* @__PURE__ */ React.createElement("div", { className: "hb-fac-row" }, D.FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
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
const ArtifactPicker = ({ slot, slotLabel, candidates, currentId, onPick, onClose }) => {
  const [rarity, setRarity] = React.useState("all");
  const filtered = rarity === "all" ? candidates : candidates.filter((a) => a.rarity === rarity);
  return /* @__PURE__ */ React.createElement("div", { className: "hb-picker" }, /* @__PURE__ */ React.createElement("div", { className: "hb-picker-head" }, /* @__PURE__ */ React.createElement("span", { className: "hb-picker-title" }, slotLabel, " \u2014 pick an item"), /* @__PURE__ */ React.createElement("div", { className: "hb-picker-filter" }, ["all", "legendary", "epic", "rare", "common"].map((r) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: r,
      className: "hb-picker-rarity hb-rarity-" + r + (rarity === r ? " active" : ""),
      onClick: () => setRarity(r)
    },
    r
  ))), /* @__PURE__ */ React.createElement("button", { className: "hb-btn hb-btn-sm", onClick: onClose }, "Close")), /* @__PURE__ */ React.createElement("div", { className: "hb-picker-grid" }, filtered.map((a) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: a.id,
      className: "hb-art-card hb-rarity-" + a.rarity + (a.id === currentId ? " selected" : ""),
      onClick: () => onPick(a.id),
      title: a.bonuses?.join("\n") || a.desc || ""
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "hb-art-icon",
        src: `img/artifacts/${a.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", { className: "hb-art-name" }, a.name),
    a.bonuses?.length > 0 && /* @__PURE__ */ React.createElement("span", { className: "hb-art-bonus" }, a.bonuses[0])
  ))));
};
window.HeroBuilderView = HeroBuilderView;
