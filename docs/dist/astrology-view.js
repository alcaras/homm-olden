const SKILL_LVL_AFTER = { 1: "learn", 2: "\u2192 L2", 3: "\u2192 L3", 4: "\u2192 L4" };
const AstrologyView = ({ go }) => {
  const A = window.OE_ASTROLOGY_DATA;
  if (!A) return /* @__PURE__ */ React.createElement("p", null, "Astrology data not loaded.");
  const D = window.OE_DATA;
  const ladder = A.LADDER;
  const [centralLvl, setCentralLvl] = React.useState(1);
  const [lawFaction, setLawFaction] = React.useState("temple");
  const [lawOn, setLawOn] = React.useState(false);
  const [cities, setCities] = React.useState(1);
  const [extra, setExtra] = React.useState(0);
  const [plan, setPlan] = React.useState({});
  const lawsByFaction = React.useMemo(() => {
    const g = {};
    for (const l of A.LAWS) (g[l.faction] = g[l.faction] || []).push(l);
    for (const k of Object.keys(g)) g[k].sort((a, b) => b.perDay - a.perDay);
    return g;
  }, [A]);
  const lawForFaction = lawsByFaction[lawFaction]?.[0];
  const perCity = A.CENTRAL_BUILDING[centralLvl - 1] + (lawOn && lawForFaction ? lawForFaction.perDay : 0);
  const dailyRate = perCity * Math.max(1, cities) + Math.max(0, Number(extra) || 0);
  const insightAfterDays = (day) => {
    const xp = dailyRate * day;
    let lvl = 1;
    for (let i = 0; i < ladder.length; i++) if (xp >= ladder[i]) lvl = i + 1;
    return lvl - 1;
  };
  const dayForInsight = (n) => {
    if (n <= 0) return 0;
    const need = ladder[n] ?? ladder[ladder.length - 1];
    return dailyRate > 0 ? Math.ceil(need / dailyRate) : Infinity;
  };
  const spellById = Object.fromEntries(A.SPELLS.map((s) => [s.id, s]));
  const insightForSpell = (s, target) => {
    if (!target) return 0;
    let c = s.insightLearn;
    for (let i = 0; i < target - 1; i++) c += s.insightUpgrades[i] || 0;
    return c;
  };
  const planTotal = Object.entries(plan).reduce((sum, [id, t]) => sum + insightForSpell(spellById[id], t), 0);
  const insightNeeded = planTotal;
  const dayForPlan = dayForInsight(insightNeeded);
  const cycleSpell = (s) => {
    setPlan((prev) => {
      const cur = prev[s.id] || 0;
      const max = 1 + s.insightUpgrades.length;
      const next = cur >= max ? 0 : cur + 1;
      const out = { ...prev };
      if (next === 0) delete out[s.id];
      else out[s.id] = next;
      return out;
    });
  };
  const FACTIONS = D?.FACTIONS || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Astrology & Insight"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Cities generate ", /* @__PURE__ */ React.createElement("b", null, "Astrology points"), " every day. Accumulated points raise your ", /* @__PURE__ */ React.createElement("b", null, "Astrology Level"), "; each level grants one ", /* @__PURE__ */ React.createElement("b", null, "Insight"), ". Insight is spent to unlock and upgrade the high Neutral Global-Map spells (Town Portal, Dimension Door, etc.). This planner projects when you'll reach each Insight and what a spell shopping list costs."), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("h2", null, "Daily astrology production"), /* @__PURE__ */ React.createElement("div", { className: "astro-controls" }, /* @__PURE__ */ React.createElement("div", { className: "astro-field" }, /* @__PURE__ */ React.createElement("label", null, "Central building"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, A.CENTRAL_BUILDING.map((v, i) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: i,
      className: centralLvl === i + 1 ? "active" : "",
      onClick: () => setCentralLvl(i + 1)
    },
    "L",
    i + 1,
    " \xB7 ",
    v,
    "/day"
  )))), /* @__PURE__ */ React.createElement("div", { className: "astro-field" }, /* @__PURE__ */ React.createElement("label", null, "Astrology law"), /* @__PURE__ */ React.createElement("label", { className: "astro-check" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: lawOn,
      onChange: (e) => setLawOn(e.target.checked)
    }
  ), /* @__PURE__ */ React.createElement("span", null, lawForFaction ? `${lawForFaction.name} (+${lawForFaction.perDay}/day, ${lawForFaction.lpCost} LP)` : "none")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "cs-select astro-fac",
      value: lawFaction,
      onChange: (e) => setLawFaction(e.target.value)
    },
    FACTIONS.filter((f) => lawsByFaction[f.id]).map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.id }, f.name))
  )), /* @__PURE__ */ React.createElement("div", { className: "astro-field" }, /* @__PURE__ */ React.createElement("label", null, "Cities"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "1",
      className: "cs-num",
      value: cities,
      onChange: (e) => setCities(Math.max(1, +e.target.value || 1))
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "astro-field" }, /* @__PURE__ */ React.createElement("label", null, "Other +/day"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "0",
      className: "cs-num",
      value: extra,
      onChange: (e) => setExtra(Math.max(0, +e.target.value || 0))
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "astro-rate" }, /* @__PURE__ */ React.createElement("span", { className: "astro-rate-val" }, dailyRate.toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "astro-rate-lbl" }, "astrology points / day"))), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("h2", null, "Insight ladder"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Each Astrology Level grants 1 Insight. Cumulative astrology XP and the day you'd reach it at the rate above."), /* @__PURE__ */ React.createElement("table", { className: "astro-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Insight"), /* @__PURE__ */ React.createElement("th", { className: "astro-num" }, "Astrology XP"), /* @__PURE__ */ React.createElement("th", { className: "astro-num" }, "+ from prev"), /* @__PURE__ */ React.createElement("th", { className: "astro-num" }, "Day reached"))), /* @__PURE__ */ React.createElement("tbody", null, ladder.slice(1).map((cum, i) => {
    const insight = i + 1;
    const prev = ladder[i];
    const day = dailyRate > 0 ? Math.ceil(cum / dailyRate) : Infinity;
    const affordsPlan = insight === insightNeeded;
    return /* @__PURE__ */ React.createElement(
      "tr",
      {
        key: insight,
        className: affordsPlan ? "astro-row-plan" : ""
      },
      /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, insight)),
      /* @__PURE__ */ React.createElement("td", { className: "astro-num mono" }, cum.toLocaleString()),
      /* @__PURE__ */ React.createElement("td", { className: "astro-num mono" }, "+", (cum - prev).toLocaleString()),
      /* @__PURE__ */ React.createElement("td", { className: "astro-num mono" }, day === Infinity ? "\u2014" : `day ${day}`)
    );
  })))), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("h2", null, "Global-Map spells \u2014 Insight cost"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Click a spell to cycle: ", /* @__PURE__ */ React.createElement("b", null, "learn"), " \u2192 L2 \u2192 L3 \u2192 L4 \u2192 off. Costs are cumulative Insight (learn + each upgrade)."), /* @__PURE__ */ React.createElement("div", { className: "astro-spells" }, A.SPELLS.map((s) => {
    const target = plan[s.id] || 0;
    const max = 1 + s.insightUpgrades.length;
    const spent = insightForSpell(s, target);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: s.id,
        className: "astro-spell" + (target ? " picked" : ""),
        onClick: () => cycleSpell(s)
      },
      /* @__PURE__ */ React.createElement(
        "img",
        {
          loading: "lazy",
          className: "astro-spell-icon",
          src: `img/spells/${s.id}.png`,
          alt: "",
          onError: (e) => {
            e.target.style.visibility = "hidden";
          }
        }
      ),
      /* @__PURE__ */ React.createElement("div", { className: "astro-spell-body" }, /* @__PURE__ */ React.createElement("div", { className: "astro-spell-head" }, /* @__PURE__ */ React.createElement("span", { className: "astro-spell-name" }, s.name), /* @__PURE__ */ React.createElement("span", { className: "astro-spell-rank" }, "rank ", s.rank)), /* @__PURE__ */ React.createElement("div", { className: "astro-spell-desc" }, s.desc), /* @__PURE__ */ React.createElement("div", { className: "astro-spell-cost" }, /* @__PURE__ */ React.createElement("span", { className: "astro-cost-chip" }, "learn ", s.insightLearn), s.insightUpgrades.map((u, i) => /* @__PURE__ */ React.createElement(
        "span",
        {
          key: i,
          className: "astro-cost-chip" + (target >= i + 2 ? " on" : "")
        },
        "L",
        i + 2,
        " +",
        u
      )))),
      /* @__PURE__ */ React.createElement("div", { className: "astro-spell-state" }, target === 0 ? "\u2014" : target === 1 ? "Learned" : `L${target}`, target > 0 && /* @__PURE__ */ React.createElement("span", { className: "astro-spell-spent" }, spent, " insight"))
    );
  })), insightNeeded > 0 && /* @__PURE__ */ React.createElement("div", { className: "astro-plan-summary" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "astro-plan-big" }, insightNeeded), /* @__PURE__ */ React.createElement("span", { className: "astro-plan-lbl" }, "Insight needed")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "astro-plan-big" }, dayForPlan === Infinity ? "\u2014" : dayForPlan), /* @__PURE__ */ React.createElement("span", { className: "astro-plan-lbl" }, "day affordable ", dailyRate > 0 ? `(${(insightNeeded ? ladder[insightNeeded] : 0).toLocaleString()} XP)` : "(set a rate)")), /* @__PURE__ */ React.createElement("button", { className: "hb-btn hb-btn-sm", onClick: () => setPlan({}) }, "Clear plan"))), /* @__PURE__ */ React.createElement("p", { className: "combat-caveat" }, "Reaching Insight ", /* @__PURE__ */ React.createElement("i", null, "n"), " means hitting Astrology Level ", /* @__PURE__ */ React.createElement("i", null, "n"), "+1 (Level 1 at 0 XP grants no Insight). Production figures: central building L1/L2/L3 = ", A.CENTRAL_BUILDING.join("/"), " per day; the astrology law adds its per-day amount on top. Map objects and rewards can also grant Astrology XP or Insight directly \u2014 not modelled here."));
};
window.AstrologyView = AstrologyView;
