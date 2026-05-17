const _cal = (d) => {
  const z = d - 1;
  return { m: Math.floor(z / 28) + 1, w: Math.floor(z % 28 / 7) + 1, d: z % 7 + 1 };
};
const fmtDay = (d) => {
  if (!isFinite(d) || d <= 0) return "\u2014";
  const c = _cal(d);
  return `M${c.m} W${c.w} D${c.d} (day ${d})`;
};
const fmtDayShort = (d) => {
  if (!isFinite(d) || d <= 0) return "";
  const c = _cal(d);
  return `M${c.m}\xB7W${c.w}\xB7D${c.d}`;
};
const parseDay = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
};
const AstrologyView = ({ go }) => {
  const A = window.OE_ASTROLOGY_DATA;
  if (!A) return /* @__PURE__ */ React.createElement("p", null, "Astrology data not loaded.");
  const D = window.OE_DATA;
  const ladder = A.LADDER;
  const SIM_CAP = 1095;
  const blankCity = () => ({ l2: "", l3: "", opt2: "", opt3: "" });
  const [cityList, setCityList] = React.useState([blankCity()]);
  const [lawFaction, setLawFaction] = React.useState("temple");
  const [lawDay, setLawDay] = React.useState("");
  const [extra, setExtra] = React.useState(0);
  const [plan, setPlan] = React.useState({});
  const setCityCount = (n) => {
    n = Math.max(1, Math.min(5, n));
    setCityList((prev) => {
      const out = prev.slice(0, n);
      while (out.length < n) out.push(blankCity());
      return out;
    });
  };
  const setCity = (i, patch) => setCityList((prev) => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));
  const lawsByFaction = React.useMemo(() => {
    const g = {};
    for (const l of A.LAWS) (g[l.faction] = g[l.faction] || []).push(l);
    for (const k of Object.keys(g)) g[k].sort((a, b) => b.perDay - a.perDay);
    return g;
  }, [A]);
  const lawForFaction = lawsByFaction[lawFaction]?.[0];
  const lawEnactDay = parseDay(lawDay);
  const cityLevelOnDay = (c, d) => {
    const l2 = parseDay(c.l2), l3 = parseDay(c.l3);
    if (l3 && d >= l3) return 3;
    if (l2 && d >= l2) return 2;
    return 1;
  };
  const OPT_L2 = A.CENTRAL_OPTIONAL[1] || 0;
  const OPT_L3 = A.CENTRAL_OPTIONAL[2] || 0;
  const cityRateOnDay = (c, d) => {
    const lvl = cityLevelOnDay(c, d);
    let r = A.CENTRAL_BUILDING[lvl - 1] || 0;
    const o2 = parseDay(c.opt2), o3 = parseDay(c.opt3);
    if (o2 && d >= o2) r += OPT_L2;
    if (o3 && d >= o3) r += OPT_L3;
    return r;
  };
  const rateOnDay = (d) => {
    let r = 0;
    for (const c of cityList) r += cityRateOnDay(c, d);
    if (lawEnactDay && d >= lawEnactDay && lawForFaction) r += lawForFaction.perDay;
    r += Math.max(0, Number(extra) || 0);
    return r;
  };
  const sim = React.useMemo(() => {
    const insightDay = new Array(ladder.length).fill(Infinity);
    let cum = 0, nextLvl = 1;
    const cumByDay = [0];
    for (let day = 1; day <= SIM_CAP; day++) {
      cum += rateOnDay(day);
      cumByDay[day] = cum;
      while (nextLvl < ladder.length && cum >= ladder[nextLvl]) {
        insightDay[nextLvl] = day;
        nextLvl++;
      }
      if (nextLvl >= ladder.length) break;
    }
    return { insightDay, cumByDay, finalCum: cum };
  }, [cityList, lawDay, lawFaction, extra, A]);
  const dayForInsight = (n) => n <= 0 ? 0 : sim.insightDay[n] ?? Infinity;
  const spellById = Object.fromEntries(A.SPELLS.map((s) => [s.id, s]));
  const maxTargetFor = (s) => 1 + (s.insightUpgrades?.length || 0);
  const insightForSpell = (s, target) => {
    if (!s || !target) return 0;
    const t = Math.max(0, Math.min(target, maxTargetFor(s)));
    let c = s.insightLearn;
    for (let i = 0; i < t - 1; i++) c += s.insightUpgrades[i] || 0;
    return c;
  };
  const planTotal = Object.entries(plan).reduce((sum, [id, t]) => sum + insightForSpell(spellById[id], t), 0);
  const insightNeeded = planTotal;
  const dayForPlan = dayForInsight(insightNeeded);
  const cycleSpell = (s) => {
    setPlan((prev) => {
      const max = maxTargetFor(s);
      const cur = Math.min(prev[s.id] || 0, max);
      const next = cur >= max ? 0 : cur + 1;
      const out = { ...prev };
      if (next === 0) delete out[s.id];
      else out[s.id] = next;
      return out;
    });
  };
  const FACTIONS = D?.FACTIONS || [];
  const endRate = rateOnDay(SIM_CAP);
  const DayInput = ({ label, value, onChange, placeholder }) => {
    const dn = parseDay(value);
    return /* @__PURE__ */ React.createElement("div", { className: "astro-dayfield" }, /* @__PURE__ */ React.createElement("label", null, label), /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        className: "cs-num astro-dayinput",
        placeholder: placeholder || "never",
        value,
        onChange: (e) => onChange(e.target.value)
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "astro-daycap" }, dn ? fmtDayShort(dn) : "\u2014"));
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Astrology & Insight"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Cities generate ", /* @__PURE__ */ React.createElement("b", null, "Astrology points"), " daily. Accumulated points raise your ", /* @__PURE__ */ React.createElement("b", null, "Astrology Level"), "; each level grants one ", /* @__PURE__ */ React.createElement("b", null, "Insight"), ", spent to unlock and upgrade the high Neutral Global-Map spells. Schedule your build order below \u2014 the Insight ladder integrates it day by day."), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("div", { className: "astro-section-head" }, /* @__PURE__ */ React.createElement("h2", null, "Build schedule"), /* @__PURE__ */ React.createElement("div", { className: "astro-citycount" }, /* @__PURE__ */ React.createElement("label", null, "Cities"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: n,
      className: cityList.length === n ? "active" : "",
      onClick: () => setCityCount(n)
    },
    n
  ))))), /* @__PURE__ */ React.createElement("div", { className: "astro-cities" }, cityList.map((c, i) => {
    const endLvl = cityLevelOnDay(c, SIM_CAP);
    return /* @__PURE__ */ React.createElement("div", { key: i, className: "astro-city" }, /* @__PURE__ */ React.createElement("span", { className: "astro-city-tag" }, "City ", i + 1), /* @__PURE__ */ React.createElement(
      DayInput,
      {
        label: "Build Lvl 2",
        value: c.l2,
        onChange: (v) => setCity(i, { l2: v })
      }
    ), /* @__PURE__ */ React.createElement(
      DayInput,
      {
        label: "Build Lvl 3",
        value: c.l3,
        onChange: (v) => setCity(i, { l3: v })
      }
    ), /* @__PURE__ */ React.createElement(
      DayInput,
      {
        label: `L2 astro opt +${OPT_L2}`,
        value: c.opt2,
        onChange: (v) => setCity(i, { opt2: v })
      }
    ), /* @__PURE__ */ React.createElement(
      DayInput,
      {
        label: `L3 astro opt +${OPT_L3}`,
        value: c.opt3,
        onChange: (v) => setCity(i, { opt3: v })
      }
    ), /* @__PURE__ */ React.createElement("span", { className: "astro-city-out mono" }, "ends ", cityRateOnDay(c, SIM_CAP).toLocaleString(), "/day", /* @__PURE__ */ React.createElement("span", { className: "astro-city-sub" }, "L1 from day 1 \xB7 now L", endLvl)));
  })), /* @__PURE__ */ React.createElement("div", { className: "astro-lawrow" }, /* @__PURE__ */ React.createElement("div", { className: "astro-dayfield" }, /* @__PURE__ */ React.createElement("label", null, "Astrology law enacted"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "1",
      className: "cs-num astro-dayinput",
      placeholder: "not taken",
      value: lawDay,
      onChange: (e) => setLawDay(e.target.value)
    }
  ), /* @__PURE__ */ React.createElement("span", { className: "astro-daycap" }, lawEnactDay ? fmtDayShort(lawEnactDay) : "\u2014")), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "cs-select astro-fac",
      value: lawFaction,
      onChange: (e) => setLawFaction(e.target.value)
    },
    FACTIONS.filter((f) => lawsByFaction[f.id]).map((f) => /* @__PURE__ */ React.createElement("option", { key: f.id, value: f.id }, f.name))
  ), /* @__PURE__ */ React.createElement("span", { className: "astro-law-note" }, lawForFaction ? `${lawForFaction.name}: +${lawForFaction.perDay}/day \xB7 ${lawForFaction.lpCost} LP` : "no astrology law for this faction"), /* @__PURE__ */ React.createElement("div", { className: "astro-dayfield" }, /* @__PURE__ */ React.createElement("label", null, "Other +/day (flat)"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "0",
      className: "cs-num astro-dayinput",
      value: extra,
      onChange: (e) => setExtra(Math.max(0, +e.target.value || 0))
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "astro-rate" }, /* @__PURE__ */ React.createElement("span", { className: "astro-rate-val" }, endRate.toLocaleString()), /* @__PURE__ */ React.createElement("span", { className: "astro-rate-lbl" }, "astrology / day once everything above is built"))), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("h2", null, "Insight ladder"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Each Astrology Level grants 1 Insight. Day reached is simulated from your build schedule (compounding daily production)."), /* @__PURE__ */ React.createElement("table", { className: "astro-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Insight"), /* @__PURE__ */ React.createElement("th", { className: "astro-num" }, "Astrology XP"), /* @__PURE__ */ React.createElement("th", { className: "astro-num" }, "+ from prev"), /* @__PURE__ */ React.createElement("th", null, "Reached"))), /* @__PURE__ */ React.createElement("tbody", null, ladder.slice(1).map((cum, i) => {
    const insight = i + 1;
    const prev = ladder[i];
    const day = sim.insightDay[insight];
    const affordsPlan = insight === insightNeeded;
    return /* @__PURE__ */ React.createElement("tr", { key: insight, className: affordsPlan ? "astro-row-plan" : "" }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("b", null, insight)), /* @__PURE__ */ React.createElement("td", { className: "astro-num mono" }, cum.toLocaleString()), /* @__PURE__ */ React.createElement("td", { className: "astro-num mono" }, "+", (cum - prev).toLocaleString()), /* @__PURE__ */ React.createElement("td", { className: "mono" }, fmtDay(day)));
  })))), /* @__PURE__ */ React.createElement("section", { className: "astro-section" }, /* @__PURE__ */ React.createElement("h2", null, "Global-Map spells \u2014 Insight cost"), /* @__PURE__ */ React.createElement("p", { className: "hb-note" }, "Click a spell to cycle: ", /* @__PURE__ */ React.createElement("b", null, "learn"), " \u2192 L2 \u2192 L3 \u2192 L4 \u2192 off. Costs are cumulative Insight (learn + each upgrade)."), /* @__PURE__ */ React.createElement("div", { className: "astro-spells" }, A.SPELLS.map((s) => {
    const target = Math.min(plan[s.id] || 0, maxTargetFor(s));
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
      /* @__PURE__ */ React.createElement("div", { className: "astro-spell-body" }, /* @__PURE__ */ React.createElement("div", { className: "astro-spell-head" }, /* @__PURE__ */ React.createElement("span", { className: "astro-spell-name" }, s.name), /* @__PURE__ */ React.createElement("span", { className: "astro-spell-rank" }, "rank ", s.rank)), /* @__PURE__ */ React.createElement("div", { className: "astro-spell-desc" }, s.desc), /* @__PURE__ */ React.createElement("div", { className: "astro-spell-cost" }, /* @__PURE__ */ React.createElement("span", { className: "astro-cost-chip" + (target >= 1 ? " on" : "") }, "learn ", s.insightLearn), s.insightUpgrades.map((u, i) => /* @__PURE__ */ React.createElement(
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
  })), insightNeeded > 0 && /* @__PURE__ */ React.createElement("div", { className: "astro-plan-summary" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "astro-plan-big" }, insightNeeded), /* @__PURE__ */ React.createElement("span", { className: "astro-plan-lbl" }, "Insight needed")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", { className: "astro-plan-big" }, dayForPlan === Infinity ? "\u2014" : fmtDayShort(dayForPlan)), /* @__PURE__ */ React.createElement("span", { className: "astro-plan-lbl" }, dayForPlan === Infinity ? "not reached within 3 years" : `affordable ${fmtDay(dayForPlan)}`)), /* @__PURE__ */ React.createElement("button", { className: "hb-btn hb-btn-sm", onClick: () => setPlan({}) }, "Clear plan"))), /* @__PURE__ */ React.createElement("p", { className: "combat-caveat" }, "Reaching Insight ", /* @__PURE__ */ React.createElement("i", null, "n"), " means hitting Astrology Level ", /* @__PURE__ */ React.createElement("i", null, "n"), "+1 (Level 1 at 0 XP grants no Insight). Central building L1/L2/L3 =", " ", A.CENTRAL_BUILDING.join("/"), "/day base. The L2 and L3 astrology optional upgrades are ", /* @__PURE__ */ React.createElement("b", null, "independent picks"), " (+", OPT_L2, " and", " ", "+", OPT_L3, "/day) that ", /* @__PURE__ */ React.createElement("b", null, "stack"), " on top of the base \u2014 pick one optional effect per level; the other options are gold or city XP. Calendar = 7 days/week, 4 weeks/month. Map objects and rewards can also grant Astrology XP or Insight directly \u2014 not modelled."));
};
window.AstrologyView = AstrologyView;
