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
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: k }), /* @__PURE__ */ React.createElement("h1", null, k === "laws" ? "Laws" : "Buildings", " calculator"));
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
  const cascadePrereqs = (next, sid, lvl) => {
    if ((next[sid] || 0) >= lvl) return;
    next[sid] = lvl;
    const b = buildingsBySid[sid];
    if (!b) return;
    const lvlSpec = b.levels[lvl - 1];
    for (const p of lvlSpec?.prereqs || []) cascadePrereqs(next, p.sid, p.level);
  };
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
      const lvlSpec = buildingsBySid[sid]?.levels[newLevel - 1];
      for (const p of lvlSpec?.prereqs || []) cascadePrereqs(next, p.sid, p.level);
      return next;
    });
  };
  const cycleBuildingLevel = (sid) => {
    setPicked((prev) => {
      const next = { ...prev };
      const cur = next[sid] || 0;
      const b = buildingsBySid[sid];
      const max = b?.levels.length || 1;
      const newLevel = cur >= max ? 0 : cur + 1;
      if (newLevel === 0) {
        delete next[sid];
        return next;
      }
      next[sid] = newLevel;
      const lvlSpec = b?.levels[newLevel - 1];
      for (const p of lvlSpec?.prereqs || []) cascadePrereqs(next, p.sid, p.level);
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: "buildings" }), /* @__PURE__ */ React.createElement(KindSwitcher, { current: "buildings", factionId, go }), /* @__PURE__ */ React.createElement("h1", null, fmeta.name, " \u2014 Buildings"), /* @__PURE__ */ React.createElement("div", { className: "calc-totals" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-block calc-totals-wide" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-eyebrow" }, Object.keys(picked).length, " buildings, ", levelsCount, " levels"), /* @__PURE__ */ React.createElement("div", { className: "calc-resources" }, C.RESOURCE_ORDER.map((r) => {
    const v = totals[r] || 0;
    return /* @__PURE__ */ React.createElement("div", { key: r, className: `calc-res calc-res-${r}${v ? " has" : " empty"}` }, /* @__PURE__ */ React.createElement("span", { className: "calc-res-label" }, C.RESOURCE_LABEL[r]), /* @__PURE__ */ React.createElement("span", { className: "calc-res-value" }, v.toLocaleString()));
  }))), /* @__PURE__ */ React.createElement("div", { className: "calc-totals-actions" }, /* @__PURE__ */ React.createElement("button", { onClick: () => copyShareLink(setShareCopied) }, shareCopied ? "\u2713 Copied" : "Copy share link"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPicked({}) }, "Reset all"))), data.buildings.map((cat) => /* @__PURE__ */ React.createElement("section", { key: cat.id, className: "calc-cat" }, /* @__PURE__ */ React.createElement("h3", null, cat.label), /* @__PURE__ */ React.createElement("div", { className: "calc-buildings" }, cat.buildings.map((b) => {
    const cur = picked[b.sid] || 0;
    const shownLvl = cur > 0 ? b.levels[cur - 1] : b.levels[0];
    const shownDesc = shownLvl?.descResolved || (shownLvl?.desc || "").replace(/\{[0-9]+\}/g, "?");
    const isLong = b.shortId.length > 14;
    const maxLevel = b.levels.length;
    const shownPrereqs = (shownLvl?.prereqs || []).map((p) => {
      const b2 = buildingsBySid[p.sid];
      const satLvl = picked[p.sid] || 0;
      return {
        sid: p.sid,
        level: p.level,
        name: b2?.levels[0]?.name || p.sid,
        icon: b2?.levels[Math.min(p.level, b2?.levels.length || 1) - 1]?.icon || b2?.levels[0]?.icon,
        satisfied: satLvl >= p.level
      };
    });
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: b.sid,
        className: "calc-building" + (cur > 0 ? " picked" : ""),
        role: "button",
        tabIndex: 0,
        title: cur < maxLevel ? `Click to advance to L${cur + 1}` : "Click to reset",
        onClick: (e) => {
          if (e.target.closest(".calc-level-btn")) return;
          cycleBuildingLevel(b.sid);
        },
        onKeyDown: (e) => {
          if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".calc-level-btn")) {
            e.preventDefault();
            cycleBuildingLevel(b.sid);
          }
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "calc-building-head" }, b.levels[0]?.icon && /* @__PURE__ */ React.createElement(
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
      ), /* @__PURE__ */ React.createElement("div", { className: "calc-building-titles" }, /* @__PURE__ */ React.createElement("span", { className: "calc-building-name" + (isLong ? " tight" : "") }, shownLvl?.name || b.levels[0].name), /* @__PURE__ */ React.createElement("span", { className: "calc-building-id mono" }, b.shortId))),
      /* @__PURE__ */ React.createElement("div", { className: "calc-level-chips" }, b.levels.map((lvl) => {
        const active = cur >= lvl.level;
        const cleanedDesc = lvl.descResolved || (lvl.desc || "").replace(/\{[0-9]+\}/g, "?");
        return /* @__PURE__ */ React.createElement(
          "button",
          {
            key: lvl.level,
            className: "calc-level-btn" + (active ? " active" : ""),
            onClick: () => setBuildingLevel(b.sid, lvl.level),
            title: lvl.name + (cleanedDesc ? "\n\n" + cleanedDesc : "")
          },
          /* @__PURE__ */ React.createElement("span", { className: "calc-level-num" }, "L", lvl.level),
          /* @__PURE__ */ React.createElement("span", { className: "calc-level-cost" }, Object.entries(lvl.costs).map(([r, v]) => /* @__PURE__ */ React.createElement("span", { key: r, className: `calc-cost calc-cost-${r}`, title: r }, /* @__PURE__ */ React.createElement(
            "img",
            {
              loading: "lazy",
              className: "calc-cost-icon",
              src: `img/resources/${r}.png`,
              alt: r,
              onError: (e) => {
                e.target.style.display = "none";
              }
            }
          ), v.toLocaleString())))
        );
      })),
      shownPrereqs.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "calc-prereqs" }, /* @__PURE__ */ React.createElement("span", { className: "calc-prereqs-label" }, "Needs"), shownPrereqs.map((p) => /* @__PURE__ */ React.createElement(
        "span",
        {
          key: p.sid,
          className: "calc-prereq" + (p.satisfied ? " satisfied" : ""),
          title: p.satisfied ? `${p.name} L${p.level} \u2014 already built` : `${p.name} L${p.level} \u2014 will be built when you advance`
        },
        p.icon && /* @__PURE__ */ React.createElement(
          "img",
          {
            loading: "lazy",
            className: "calc-prereq-icon",
            src: p.icon,
            alt: "",
            onError: (e) => {
              e.target.style.display = "none";
            }
          }
        ),
        /* @__PURE__ */ React.createElement("span", { className: "calc-prereq-name" }, p.name),
        /* @__PURE__ */ React.createElement("span", { className: "calc-prereq-lvl" }, "L", p.level)
      ))),
      shownDesc && /* @__PURE__ */ React.createElement("div", { className: "calc-level-effect" + (cur > 0 ? " active" : "") }, shownDesc)
    );
  })))));
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
  const cycleLawLevel = (lawId, maxLevel) => {
    setPicked((prev) => {
      const cur = prev[lawId] || 0;
      const next = { ...prev };
      const newLevel = cur >= maxLevel ? 0 : cur + 1;
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionPicker, { current: factionId, factions: FACTIONS, go, kind: "laws" }), /* @__PURE__ */ React.createElement(KindSwitcher, { current: "laws", factionId, go }), /* @__PURE__ */ React.createElement("h1", null, fmeta.name, " \u2014 Laws"), /* @__PURE__ */ React.createElement("div", { className: "calc-totals" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-block calc-totals-wide" }, /* @__PURE__ */ React.createElement("div", { className: "calc-totals-eyebrow" }, Object.keys(picked).length, " laws, ", levelsCount, " levels enacted"), /* @__PURE__ */ React.createElement("div", { className: "calc-lp" }, /* @__PURE__ */ React.createElement("span", { className: "calc-lp-value" }, lpTotal), /* @__PURE__ */ React.createElement("span", { className: "calc-lp-label" }, "law points spent"))), /* @__PURE__ */ React.createElement("div", { className: "calc-totals-actions" }, /* @__PURE__ */ React.createElement("button", { onClick: () => copyShareLink(setShareCopied) }, shareCopied ? "\u2713 Copied" : "Copy share link"), /* @__PURE__ */ React.createElement("button", { onClick: () => setPicked({}) }, "Reset all"))), data.laws.map((row) => {
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
      const shownLvl = cur > 0 ? law.levels[cur - 1] : law.levels[0];
      const shownDesc = shownLvl?.descResolved || (shownLvl?.desc || "").replace(/\{[0-9]+\}/g, "?");
      return /* @__PURE__ */ React.createElement(
        "div",
        {
          key: law.id,
          className: "calc-law" + (cur > 0 ? " picked" : ""),
          role: "button",
          tabIndex: 0,
          title: cur < law.levels.length ? `Click to advance to L${cur + 1}` : "Click to reset",
          onClick: (e) => {
            if (e.target.closest(".calc-level-btn")) return;
            cycleLawLevel(law.id, law.levels.length);
          },
          onKeyDown: (e) => {
            if ((e.key === "Enter" || e.key === " ") && !e.target.closest(".calc-level-btn")) {
              e.preventDefault();
              cycleLawLevel(law.id, law.levels.length);
            }
          }
        },
        /* @__PURE__ */ React.createElement("div", { className: "calc-law-head" }, law.icon && /* @__PURE__ */ React.createElement(
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
        ), /* @__PURE__ */ React.createElement("div", { className: "calc-law-titles" }, /* @__PURE__ */ React.createElement("span", { className: "calc-law-name" }, law.name), /* @__PURE__ */ React.createElement("span", { className: "calc-law-num" }, "#", law.num))),
        /* @__PURE__ */ React.createElement("div", { className: "calc-level-chips" }, law.levels.map((lvl) => {
          const active = cur >= lvl.level;
          return /* @__PURE__ */ React.createElement(
            "button",
            {
              key: lvl.level,
              className: "calc-level-btn calc-level-law" + (active ? " active" : ""),
              onClick: () => setLawLevel(law.id, lvl.level),
              title: lvl.descResolved || ""
            },
            /* @__PURE__ */ React.createElement("span", { className: "calc-level-num" }, "L", lvl.level),
            /* @__PURE__ */ React.createElement("span", { className: "calc-level-cost" }, lvl.cost, " LP")
          );
        })),
        shownDesc && /* @__PURE__ */ React.createElement("div", { className: "calc-level-effect" + (cur > 0 ? " active" : "") }, shownDesc)
      );
    })))));
  }));
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
    href: window.OE_routeToUrl(`${kind}/${f.id}`),
    onClick: (e) => {
      e.preventDefault();
      go(`${kind}/${f.id}`);
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
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Calculator"), /* @__PURE__ */ React.createElement("div", { className: "card-grid" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.id, className: "card faction-card calc-hub-card" }, /* @__PURE__ */ React.createElement("div", { className: "faction-card-head" }, /* @__PURE__ */ React.createElement(
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
