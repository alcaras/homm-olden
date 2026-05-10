const CalcView = ({ factionId, kind, initialQuery, go }) => {
  const k = kind === "laws" ? "laws" : "buildings";
  const C = window.OE_CALC_DATA;
  if (!C) return /* @__PURE__ */ React.createElement("p", null, "Calculator data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || C.FACTIONS;
  const fmeta = FACTIONS.find((f) => f.id === factionId);
  const data = factionId ? C.BY_FACTION[factionId] : null;
  const factionKey = fmeta?.unitKey || C.FACTIONS.find((f) => f.id === factionId)?.unitKey;
  const initial = React.useMemo(
    () => parseCalcQuery(initialQuery, factionKey),
    [factionId]
  );
  const [picked, setPicked] = React.useState(k === "laws" ? initial.laws : initial.buildings);
  const [shareCopied, setShareCopied] = React.useState(false);
  React.useEffect(() => {
    setPicked(k === "laws" ? initial.laws : initial.buildings);
  }, [factionId, k, initial]);
  React.useEffect(() => {
    if (!factionId || !factionKey) return;
    const route = `${k}/${factionId}`;
    const queryStr = buildCalcQuery(k, factionKey, picked);
    const url = window.OE_routeToUrl(route + (queryStr ? "?" + queryStr : ""));
    if (window.location.pathname + window.location.search !== url) {
      history.replaceState(null, "", url);
    }
  }, [picked, factionId, factionKey, k]);
  if (!data) {
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: k }), /* @__PURE__ */ React.createElement("h1", null, k === "laws" ? "Laws" : "Buildings", " calculator"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Pick a faction above to plan its ", k, "."));
  }
  return k === "laws" ? /* @__PURE__ */ React.createElement(LawsCalc, { ...{
    data,
    factionId,
    factionKey,
    fmeta,
    FACTIONS,
    go,
    picked,
    setPicked,
    shareCopied,
    setShareCopied
  } }) : /* @__PURE__ */ React.createElement(BuildingsCalc, { ...{
    data,
    factionId,
    factionKey,
    fmeta,
    FACTIONS,
    go,
    picked,
    setPicked,
    shareCopied,
    setShareCopied,
    C
  } });
};
const BuildingsCalc = ({
  data,
  factionId,
  factionKey,
  fmeta,
  FACTIONS,
  go,
  picked,
  setPicked,
  shareCopied,
  setShareCopied,
  C
}) => {
  const buildingsBySid = {};
  for (const cat of data.buildings) for (const b of cat.buildings) buildingsBySid[b.sid] = b;
  const setBuildingLevel = (sid, targetLevel) => {
    setPicked((prev) => {
      const next = { ...prev };
      const cur = next[sid] || 0;
      const newLevel = cur === targetLevel ? targetLevel - 1 : targetLevel;
      next[sid] = newLevel;
      if (newLevel === 0) {
        delete next[sid];
        return next;
      }
      const ensure = (s, lvl) => {
        if ((next[s] || 0) >= lvl) return;
        next[s] = lvl;
        const b = buildingsBySid[s];
        if (!b) return;
        const lvlSpec2 = b.levels[lvl - 1];
        for (const p of lvlSpec2?.prereqs || []) ensure(p.sid, p.level);
      };
      const lvlSpec = buildingsBySid[sid]?.levels[newLevel - 1];
      for (const p of lvlSpec?.prereqs || []) ensure(p.sid, p.level);
      return next;
    });
  };
  const totals = {};
  let levelsCount = 0;
  for (const [sid, lvl] of Object.entries(picked)) {
    const b = buildingsBySid[sid];
    if (!b) continue;
    for (let i = 0; i < lvl; i++) {
      levelsCount += 1;
      const costs = b.levels[i]?.costs || {};
      for (const [r, v] of Object.entries(costs)) {
        totals[r] = (totals[r] || 0) + v;
      }
    }
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: "buildings" }), /* @__PURE__ */ React.createElement(KindSwitcher, { current: "buildings", factionId, go }), /* @__PURE__ */ React.createElement("h1", null, fmeta.name, " \u2014 Buildings"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Pick the buildings you plan to construct. Costs from the actual game files. Selecting a level auto-enacts prerequisites; click a selected level again to step back."), /* @__PURE__ */ React.createElement("div", { className: "calc-totals" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-block calc-totals-wide" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-eyebrow" }, Object.keys(picked).length, " buildings, ", levelsCount, " levels"), /* @__PURE__ */ React.createElement("div", { className: "calc-resources" }, C.RESOURCE_ORDER.map((r) => {
    const v = totals[r] || 0;
    return /* @__PURE__ */ React.createElement("div", { key: r, className: `calc-res calc-res-${r}${v ? " has" : " empty"}` }, /* @__PURE__ */ React.createElement("span", { className: "calc-res-label" }, C.RESOURCE_LABEL[r]), /* @__PURE__ */ React.createElement("span", { className: "calc-res-value" }, v.toLocaleString()));
  }))), /* @__PURE__ */ React.createElement("div", { className: "calc-totals-actions" }, /* @__PURE__ */ React.createElement("button", { onClick: () => copyShareLink(setShareCopied) }, shareCopied ? "\u2713 Copied" : "Copy share link"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPicked({}) }, "Reset all"))), data.buildings.map((cat) => /* @__PURE__ */ React.createElement("section", { key: cat.id, className: "calc-cat" }, /* @__PURE__ */ React.createElement("h3", null, cat.label), /* @__PURE__ */ React.createElement("div", { className: "calc-buildings" }, cat.buildings.map((b) => {
    const cur = picked[b.sid] || 0;
    const isLong = b.shortId.length > 14;
    return /* @__PURE__ */ React.createElement("div", { key: b.sid, className: "calc-building" }, /* @__PURE__ */ React.createElement("div", { className: "calc-building-head" }, b.levels[0]?.icon && /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "calc-building-icon",
        src: b.levels[0].icon,
        alt: "",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "calc-building-titles" }, /* @__PURE__ */ React.createElement("span", { className: "calc-building-name" + (isLong ? " tight" : "") }, b.levels[0].name), /* @__PURE__ */ React.createElement("span", { className: "calc-building-id mono" }, b.shortId))), /* @__PURE__ */ React.createElement("div", { className: "calc-levels" }, b.levels.map((lvl) => {
      const active = cur >= lvl.level;
      const cleanedDesc = lvl.descResolved || (lvl.desc || "").replace(/\{[0-9]+\}/g, "?");
      return /* @__PURE__ */ React.createElement("div", { key: lvl.level, className: "calc-level-row" }, /* @__PURE__ */ React.createElement(
        "button",
        {
          className: "calc-level-btn" + (active ? " active" : ""),
          onClick: () => setBuildingLevel(b.sid, lvl.level),
          title: lvl.name + (cleanedDesc ? "\n\n" + cleanedDesc : "")
        },
        /* @__PURE__ */ React.createElement("span", { className: "calc-level-num" }, "L", lvl.level),
        /* @__PURE__ */ React.createElement("span", { className: "calc-level-cost" }, Object.entries(lvl.costs).map(([r, v]) => /* @__PURE__ */ React.createElement("span", { key: r, className: `calc-cost calc-cost-${r}` }, v.toLocaleString(), abbreviateRes(r))))
      ), cleanedDesc && /* @__PURE__ */ React.createElement("div", { className: "calc-level-effect" + (active ? " active" : "") }, lvl.level > 1 && b.levels[0]?.name !== lvl.name && /* @__PURE__ */ React.createElement("span", { className: "calc-level-effect-name" }, lvl.name, ": "), cleanedDesc));
    })));
  })))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", C.GENERATED_AT, ". Data extracted by", " ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_calc.py"), " from the game's JSON files."));
};
const LawsCalc = ({
  data,
  factionId,
  factionKey,
  fmeta,
  FACTIONS,
  go,
  picked,
  setPicked,
  shareCopied,
  setShareCopied
}) => {
  const lawsById = {};
  for (const r of data.laws) for (const g of r.groups) for (const l of g.laws) lawsById[l.id] = l;
  const setLawLevel = (lawId, targetLevel) => {
    setPicked((prev) => {
      const cur = prev[lawId] || 0;
      const newLevel = cur === targetLevel ? targetLevel - 1 : targetLevel;
      const next = { ...prev };
      if (newLevel === 0) delete next[lawId];
      else next[lawId] = newLevel;
      return next;
    });
  };
  let lpTotal = 0;
  let levelsCount = 0;
  for (const [lid, lvl] of Object.entries(picked)) {
    const l = lawsById[lid];
    if (!l) continue;
    for (let i = 0; i < lvl; i++) {
      levelsCount += 1;
      lpTotal += l.levels[i]?.cost || 0;
    }
  }
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: "laws" }), /* @__PURE__ */ React.createElement(KindSwitcher, { current: "laws", factionId, go }), /* @__PURE__ */ React.createElement("h1", null, fmeta.name, " \u2014 Laws"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Pick the laws you plan to enact. Each row unlocks once you've spent the threshold of law points on earlier rows."), /* @__PURE__ */ React.createElement("div", { className: "calc-totals" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-block calc-totals-wide" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-eyebrow" }, Object.keys(picked).length, " laws, ", levelsCount, " levels enacted"), /* @__PURE__ */ React.createElement("div", { className: "calc-lp" }, /* @__PURE__ */ React.createElement("span", { className: "calc-lp-value" }, lpTotal), /* @__PURE__ */ React.createElement("span", { className: "calc-lp-label" }, "law points spent"))), /* @__PURE__ */ React.createElement("div", { className: "calc-totals-actions" }, /* @__PURE__ */ React.createElement("button", { onClick: () => copyShareLink(setShareCopied) }, shareCopied ? "\u2713 Copied" : "Copy share link"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPicked({}) }, "Reset all"))), data.laws.map((row) => {
    let priorLp = 0;
    for (const r2 of data.laws) {
      if (r2.rowIndex >= row.rowIndex) break;
      for (const g of r2.groups) for (const l of g.laws) {
        const cur = picked[l.id] || 0;
        for (let i = 0; i < cur; i++) priorLp += l.levels[i]?.cost || 0;
      }
    }
    const unlocked = priorLp >= row.countToUnlock;
    return /* @__PURE__ */ React.createElement("section", { key: row.rowIndex, className: "calc-law-row" + (unlocked ? " unlocked" : " locked") }, /* @__PURE__ */ React.createElement("div", { className: "calc-law-row-head" }, /* @__PURE__ */ React.createElement("span", { className: "calc-law-row-num" }, "Row ", row.rowIndex), /* @__PURE__ */ React.createElement("span", { className: "calc-law-row-unlock" }, row.countToUnlock === 0 ? "Unlocked from start" : /* @__PURE__ */ React.createElement(React.Fragment, null, "Unlocks at ", /* @__PURE__ */ React.createElement("b", null, row.countToUnlock, " LP"), " spent on earlier rows", " ", "\u2014 you have ", /* @__PURE__ */ React.createElement("b", null, priorLp), !unlocked && /* @__PURE__ */ React.createElement("span", { className: "calc-law-locked-note" }, " (locked)")))), /* @__PURE__ */ React.createElement("div", { className: "calc-law-groups" }, row.groups.map((g, gi) => /* @__PURE__ */ React.createElement("div", { key: gi, className: "calc-law-group" }, g.laws.map((law) => {
      const cur = picked[law.id] || 0;
      return /* @__PURE__ */ React.createElement("div", { key: law.id, className: "calc-law" }, /* @__PURE__ */ React.createElement("div", { className: "calc-law-head" }, law.icon && /* @__PURE__ */ React.createElement(
        "img",
        {
          loading: "lazy",
          className: "calc-law-icon",
          src: law.icon,
          alt: "",
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ), /* @__PURE__ */ React.createElement("span", { className: "calc-law-name" }, law.name), /* @__PURE__ */ React.createElement("span", { className: "calc-law-num" }, "#", law.num)), /* @__PURE__ */ React.createElement("div", { className: "calc-levels" }, law.levels.map((lvl) => {
        const active = cur >= lvl.level;
        return /* @__PURE__ */ React.createElement("div", { key: lvl.level, className: "calc-level-row" }, /* @__PURE__ */ React.createElement(
          "button",
          {
            className: "calc-level-btn calc-level-law" + (active ? " active" : ""),
            onClick: () => setLawLevel(law.id, lvl.level)
          },
          /* @__PURE__ */ React.createElement("span", { className: "calc-level-num" }, "L", lvl.level),
          /* @__PURE__ */ React.createElement("span", { className: "calc-level-cost" }, lvl.cost, " LP")
        ), lvl.descResolved && /* @__PURE__ */ React.createElement("div", { className: "calc-level-effect" + (active ? " active" : "") }, lvl.descResolved));
      })));
    })))));
  }), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Data from ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_calc.py"), ". Cumulative-LP unlock thresholds extracted from ", /* @__PURE__ */ React.createElement("code", null, "fractions/*.json"), "."));
};
function copyShareLink(setShareCopied) {
  navigator.clipboard?.writeText(window.location.href).then(
    () => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    },
    () => {
    }
  );
}
function abbreviateRes(r) {
  return {
    gold: "g",
    wood: "w",
    ore: "o",
    gemstones: "gem",
    crystals: "cr",
    mercury: "me",
    graal: "graal"
  }[r] || r;
}
function encodeBuildings(picked) {
  const out = [];
  for (const [sid, lvl] of Object.entries(picked)) {
    if (!lvl) continue;
    const short = sid.startsWith("Build_") ? sid.slice("Build_".length) : sid;
    out.push(`${short}:${lvl}`);
  }
  return out.join(",");
}
function encodeLaws(picked, factionKey) {
  const out = [];
  const prefix = `fraction_law_${factionKey}_`;
  for (const [lid, lvl] of Object.entries(picked)) {
    if (!lvl) continue;
    const num = lid.startsWith(prefix) ? lid.slice(prefix.length) : lid;
    out.push(`${num}:${lvl}`);
  }
  return out.join(",");
}
function decodeBuildings(s) {
  if (!s) return {};
  const out = {};
  for (const part of s.split(",")) {
    const [short, lvlStr] = part.split(":");
    const lvl = parseInt(lvlStr, 10);
    if (!short || !lvl) continue;
    out[short.startsWith("Build_") ? short : `Build_${short}`] = lvl;
  }
  return out;
}
function decodeLaws(s, factionKey) {
  if (!s || !factionKey) return {};
  const out = {};
  for (const part of s.split(",")) {
    const [num, lvlStr] = part.split(":");
    const lvl = parseInt(lvlStr, 10);
    if (!num || !lvl) continue;
    const key = num.startsWith("fraction_law_") ? num : `fraction_law_${factionKey}_${num}`;
    out[key] = lvl;
  }
  return out;
}
function parseCalcQuery(query, factionKey) {
  const sp = new URLSearchParams(query || "");
  return {
    buildings: decodeBuildings(sp.get("b") || ""),
    laws: decodeLaws(sp.get("l") || "", factionKey)
  };
}
function buildCalcQuery(kind, factionKey, picked) {
  const parts = [];
  if (kind === "laws") {
    const l = encodeLaws(picked, factionKey);
    if (l) parts.push(`l=${l}`);
  } else {
    const b = encodeBuildings(picked);
    if (b) parts.push(`b=${b}`);
  }
  return parts.join("&");
}
const FactionPicker = ({ current, factions, go, kind }) => /* @__PURE__ */ React.createElement("div", { className: "faction-switcher" }, factions.map((f) => /* @__PURE__ */ React.createElement(
  "a",
  {
    key: f.id,
    href: window.OE_routeToUrl(`calc/${kind}/${f.id}`),
    onClick: (e) => {
      e.preventDefault();
      go(`calc/${kind}/${f.id}`);
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
const KindSwitcher = ({ current, factionId, go }) => /* @__PURE__ */ React.createElement("div", { className: "calc-kind-switcher" }, /* @__PURE__ */ React.createElement(
  "a",
  {
    href: window.OE_routeToUrl(`buildings/${factionId}`),
    onClick: (e) => {
      e.preventDefault();
      go(`buildings/${factionId}`);
    },
    className: current === "buildings" ? "active" : ""
  },
  "Buildings"
), /* @__PURE__ */ React.createElement(
  "a",
  {
    href: window.OE_routeToUrl(`laws/${factionId}`),
    onClick: (e) => {
      e.preventDefault();
      go(`laws/${factionId}`);
    },
    className: current === "laws" ? "active" : ""
  },
  "Laws"
));
const CalcHubView = ({ go }) => {
  const FACTIONS = window.OE_DATA?.FACTIONS || window.OE_CALC_DATA?.FACTIONS || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Calculator"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Plan your faction's law tree and building order against actual game-data costs. Two pages per faction \u2014 Buildings (resource totals + prerequisite chains) and Laws (LP totals + row unlocks)."), /* @__PURE__ */ React.createElement("div", { className: "card-grid" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.id, className: "card faction-card calc-hub-card" }, /* @__PURE__ */ React.createElement("div", { className: "faction-card-head" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "faction-card-icon",
      src: `img/factions/fraction_${f.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.display = "none";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, f.might, " / ", f.magic), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, f.name))), /* @__PURE__ */ React.createElement("div", { className: "calc-hub-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`buildings/${f.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`buildings/${f.id}`);
      }
    },
    "Buildings \u2192"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`laws/${f.id}`),
      onClick: (e) => {
        e.preventDefault();
        go(`laws/${f.id}`);
      }
    },
    "Laws \u2192"
  ))))));
};
window.CalcView = CalcView;
window.CalcHubView = CalcHubView;
