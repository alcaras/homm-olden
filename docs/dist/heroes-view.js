const HeroesView = () => {
  const { FACTIONS, HEROES } = window.OE_DATA;
  const [q, setQ] = React.useState("");
  const [kind, setKind] = React.useState("all");
  const [factionSet, setFactionSet] = React.useState(/* @__PURE__ */ new Set());
  const [sort, setSort] = React.useState({ key: "num", dir: 1 });
  const factionMap = Object.fromEntries(FACTIONS.map((f) => [f.id, f]));
  const toggleFaction = (id) => {
    setFactionSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clearFactions = () => setFactionSet(/* @__PURE__ */ new Set());
  const ql = q.trim().toLowerCase();
  const filtered = HEROES.filter((h) => {
    if (kind !== "all" && h.kind !== kind) return false;
    if (factionSet.size > 0 && !factionSet.has(h.faction)) return false;
    if (!ql) return true;
    if (h.name.toLowerCase().includes(ql)) return true;
    if (h.specialty.toLowerCase().includes(ql)) return true;
    if ((h.specDesc || "").toLowerCase().includes(ql)) return true;
    if (h.skills.some((s) => s.toLowerCase().includes(ql))) return true;
    if (h.army.toLowerCase().includes(ql)) return true;
    if ((factionMap[h.faction]?.name || "").toLowerCase().includes(ql)) return true;
    return false;
  });
  const sorted = [...filtered].sort((a, b) => {
    const k = sort.key;
    let av, bv;
    if (k === "num") {
      av = HEROES.indexOf(a);
      bv = HEROES.indexOf(b);
    } else if (k === "name") {
      av = a.name.toLowerCase();
      bv = b.name.toLowerCase();
    } else if (k === "specialty") {
      av = (a.specialty || "").toLowerCase();
      bv = (b.specialty || "").toLowerCase();
    } else if (k === "faction") {
      av = factionMap[a.faction]?.name || a.faction;
      bv = factionMap[b.faction]?.name || b.faction;
    } else if (k === "kind") {
      av = a.kind;
      bv = b.kind;
    } else if (["A", "D", "P", "K"].includes(k)) {
      av = a.stats[k] ?? 0;
      bv = b.stats[k] ?? 0;
    } else if (k === "armyScore") {
      av = a.armyScore ?? 0;
      bv = b.armyScore ?? 0;
    } else {
      av = a[k];
      bv = b[k];
    }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return 1 * sort.dir;
    return HEROES.indexOf(a) - HEROES.indexOf(b);
  });
  const factionSkillNames = new Set(FACTIONS.map((f) => f.skill));
  const SkillChips = ({ skills }) => /* @__PURE__ */ React.createElement("span", null, skills.map((s, i) => {
    const m = s.match(/^(.+?)\s+L(\d)$/);
    const base = m ? m[1] : s;
    const lv = m ? m[2] : "";
    const isFaction = factionSkillNames.has(base);
    const cls = ["skill-chip"];
    if (isFaction) cls.push("faction");
    if (lv === "2") cls.push("l2");
    return /* @__PURE__ */ React.createElement("span", { key: i, className: cls.join(" ") }, base, lv ? /* @__PURE__ */ React.createElement("span", { style: { opacity: 0.55, marginLeft: "0.3em", fontSize: "0.85em" } }, "L", lv) : null);
  }));
  const Army = ({ army }) => {
    const stacks = army.split(" \xB7 ");
    return /* @__PURE__ */ React.createElement("span", { className: "army" }, stacks.map((st, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("span", { className: "stack" }, st), i < stacks.length - 1 && /* @__PURE__ */ React.createElement("span", { className: "sep" }, "\xB7"))));
  };
  const SortHead = ({ label, k, num, title }) => {
    const active = sort.key === k;
    const arrow = active ? sort.dir > 0 ? "\u2191" : "\u2193" : "";
    return /* @__PURE__ */ React.createElement(
      "th",
      {
        title,
        className: `sortable${active ? " active" : ""}${num ? " num" : ""}`,
        onClick: () => setSort((s) => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 })
      },
      label,
      " ",
      /* @__PURE__ */ React.createElement("span", { className: "sort-arrow" }, arrow)
    );
  };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Heroes \u2014 Starting Skills, Stats & Armies"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "All 108 stock heroes (six factions \xD7 two classes \xD7 nine heroes), with starting stats, starting skills, starting army composition, and signature specialization."), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Search"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "search",
      placeholder: "hero, specialty, skill, unit, faction\u2026",
      value: q,
      onChange: (e) => setQ(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Class"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: kind === "all" ? "active" : "", onClick: () => setKind("all") }, "All"), /* @__PURE__ */ React.createElement("button", { className: kind === "might" ? "active" : "", onClick: () => setKind("might") }, "\u2694 Might"), /* @__PURE__ */ React.createElement("button", { className: kind === "magic" ? "active" : "", onClick: () => setKind("magic") }, "\u2726 Magic"))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Factions"), /* @__PURE__ */ React.createElement("div", { className: "seg multi", title: "Select one or more \u2014 empty = all" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: factionSet.size === 0 ? "active" : "",
      onClick: clearFactions
    },
    "All"
  ), FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      className: factionSet.has(f.id) ? "active" : "",
      onClick: () => toggleFaction(f.id)
    },
    f.name
  )))), /* @__PURE__ */ React.createElement("span", { className: "count" }, sorted.length, " heroes")), /* @__PURE__ */ React.createElement("p", { className: "note", style: { marginTop: 0 } }, "Click any column header to sort across all heroes. Click multiple faction buttons to combine selections. Stats: ", /* @__PURE__ */ React.createElement("strong", null, "A"), "ttack \xB7", " ", /* @__PURE__ */ React.createElement("strong", null, "D"), "efense \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "P"), "ower \xB7 ", /* @__PURE__ */ React.createElement("strong", null, "K"), "nowledge.", " ", /* @__PURE__ */ React.createElement("strong", null, "Score"), " is the starting-army value (\u03A3 unit squad value \xD7 avg stack count). Faction-skill chips are outlined in burnt orange; doubled border indicates L2 (hero starts with the faction skill at advanced instead of L1 + a second skill)."), /* @__PURE__ */ React.createElement("div", { className: "heroes-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "heroes flat" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement(SortHead, { label: "#", k: "num", num: true }), /* @__PURE__ */ React.createElement("th", null), /* @__PURE__ */ React.createElement(SortHead, { label: "Hero", k: "name" }), /* @__PURE__ */ React.createElement(SortHead, { label: "Class", k: "kind" }), /* @__PURE__ */ React.createElement(SortHead, { label: "Faction", k: "faction" }), /* @__PURE__ */ React.createElement(SortHead, { label: "Specialty", k: "specialty" }), /* @__PURE__ */ React.createElement(SortHead, { label: "A", k: "A", num: true, title: "Attack" }), /* @__PURE__ */ React.createElement(SortHead, { label: "D", k: "D", num: true, title: "Defense" }), /* @__PURE__ */ React.createElement(SortHead, { label: "P", k: "P", num: true, title: "Spell Power" }), /* @__PURE__ */ React.createElement(SortHead, { label: "K", k: "K", num: true, title: "Knowledge" }), /* @__PURE__ */ React.createElement("th", null, "Starting skills"), /* @__PURE__ */ React.createElement("th", null, "Starting army"), /* @__PURE__ */ React.createElement(
    SortHead,
    {
      label: "Starting army score",
      k: "armyScore",
      num: true,
      title: "\u03A3 unit squadValue \xD7 avg stack count"
    }
  ))), /* @__PURE__ */ React.createElement("tbody", null, sorted.map((h) => {
    const f = factionMap[h.faction];
    return /* @__PURE__ */ React.createElement("tr", { key: h.id || h.name }, /* @__PURE__ */ React.createElement("td", { className: "h-num" }, HEROES.indexOf(h) + 1), /* @__PURE__ */ React.createElement("td", { className: "h-portrait-cell" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "h-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    )), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "h-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "h-class-line" }, f && (h.kind === "might" ? f.might : f.magic))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: h.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, h.kind === "might" ? "\u2694" : "\u2726")), /* @__PURE__ */ React.createElement("td", null, f && /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${h.faction}` }, f.name)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "spec-cell", title: h.specDesc || "" }, h.specId && /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "spec-icon",
        src: `img/specs/${h.specId}.png`,
        alt: "",
        title: h.specDesc || h.specialty,
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "spec-text" }, /* @__PURE__ */ React.createElement("div", { className: "spec-name" }, h.specialty), h.specDesc && /* @__PURE__ */ React.createElement("div", { className: "spec-desc" }, h.specDesc)))), /* @__PURE__ */ React.createElement("td", { className: "num" }, /* @__PURE__ */ React.createElement("span", { className: "stat-v" }, h.stats.A)), /* @__PURE__ */ React.createElement("td", { className: "num" }, /* @__PURE__ */ React.createElement("span", { className: "stat-v" }, h.stats.D)), /* @__PURE__ */ React.createElement("td", { className: "num" }, /* @__PURE__ */ React.createElement("span", { className: "stat-v" }, h.stats.P)), /* @__PURE__ */ React.createElement("td", { className: "num" }, /* @__PURE__ */ React.createElement("span", { className: "stat-v" }, h.stats.K)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(SkillChips, { skills: h.skills })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(Army, { army: h.army })), /* @__PURE__ */ React.createElement("td", { className: "num army-score" }, h.armyScore?.toLocaleString() ?? "\u2014"));
  })))), sorted.length === 0 && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--muted)", fontStyle: "italic", marginTop: "2rem" } }, "No heroes match those filters."));
};
window.HeroesView = HeroesView;
