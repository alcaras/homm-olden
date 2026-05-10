const _OFF_BONUS = [1, 1.1, 1.15, 1.2];
const _DEF_REDUC = [1, 0.9, 0.85, 0.8];
const _SKILL_LVLS = ["None", "Basic", "Advanced", "Expert"];
const _round = (x) => Math.round(x);
const CombatView = ({ go }) => {
  const D = window.OE_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Data not loaded.");
  const FACTIONS = D.FACTIONS || [];
  const facById = Object.fromEntries(FACTIONS.map((f) => [f.id, f]));
  const heroesByFac = React.useMemo(() => {
    const g = {};
    for (const h of D.HEROES) (g[h.faction] = g[h.faction] || []).push(h);
    for (const k of Object.keys(g)) g[k].sort((a, b) => a.name.localeCompare(b.name));
    return g;
  }, [D]);
  const unitsByFac = React.useMemo(() => {
    const g = {};
    const variantOrder = { base: 0, upg: 1, alt: 2 };
    for (const u of D.UNITS) (g[u.faction] = g[u.faction] || []).push(u);
    for (const k of Object.keys(g)) {
      g[k].sort((a, b) => a.tier - b.tier || (variantOrder[a.variant] ?? 9) - (variantOrder[b.variant] ?? 9) || a.name.localeCompare(b.name));
    }
    return g;
  }, [D]);
  const [aFac, setAFac] = React.useState("temple");
  const [dFac, setDFac] = React.useState("necropolis");
  const firstUnit = (fac) => unitsByFac[fac]?.[0]?.id || "";
  const [aUnitId, setAUnitId] = React.useState(() => firstUnit("temple"));
  const [dUnitId, setDUnitId] = React.useState(() => firstUnit("necropolis"));
  const [aHeroId, setAHeroId] = React.useState("");
  const [dHeroId, setDHeroId] = React.useState("");
  const [aCount, setACount] = React.useState(20);
  const [dCount, setDCount] = React.useState(20);
  const [aHeroAtk, setAHeroAtk] = React.useState(0);
  const [aHeroDef, setAHeroDef] = React.useState(0);
  const [dHeroAtk, setDHeroAtk] = React.useState(0);
  const [dHeroDef, setDHeroDef] = React.useState(0);
  const [aOffense, setAOffense] = React.useState(0);
  const [dDefense, setDDefense] = React.useState(0);
  const [lucky, setLucky] = React.useState(false);
  const changeFac = (side, fid) => {
    if (side === "a") {
      setAFac(fid);
      setAHeroId("");
      setAHeroAtk(0);
      setAHeroDef(0);
      setAUnitId(firstUnit(fid));
    } else {
      setDFac(fid);
      setDHeroId("");
      setDHeroAtk(0);
      setDHeroDef(0);
      setDUnitId(firstUnit(fid));
    }
  };
  const pickHero = (side, id) => {
    const h = D.HEROES.find((x) => x.id === id);
    if (side === "a") {
      setAHeroId(id);
      setAHeroAtk(h?.stats?.A ?? 0);
      setAHeroDef(h?.stats?.D ?? 0);
    } else {
      setDHeroId(id);
      setDHeroAtk(h?.stats?.A ?? 0);
      setDHeroDef(h?.stats?.D ?? 0);
    }
  };
  const swap = () => {
    const _aF = aFac, _aU = aUnitId, _aH = aHeroId, _aC = aCount, _aA = aHeroAtk, _aD = aHeroDef, _aO = aOffense;
    setAFac(dFac);
    setDFac(_aF);
    setAUnitId(dUnitId);
    setDUnitId(_aU);
    setAHeroId(dHeroId);
    setDHeroId(_aH);
    setACount(dCount);
    setDCount(_aC);
    setAHeroAtk(dHeroAtk);
    setDHeroAtk(_aA);
    setAHeroDef(dHeroDef);
    setDHeroDef(_aD);
    setAOffense(dDefense);
    setDDefense(_aO);
  };
  const A = D.UNITS.find((u) => u.id === aUnitId);
  const Z = D.UNITS.find((u) => u.id === dUnitId);
  const atkTotal = (A?.off ?? 0) + Number(aHeroAtk || 0);
  const defTotal = (Z?.def ?? 0) + Number(dHeroDef || 0);
  const baseMod = (20 + atkTotal) / (20 + defTotal);
  const offBonus = _OFF_BONUS[aOffense];
  const defReduc = _DEF_REDUC[dDefense];
  const crit = lucky ? 1.5 : 1;
  const totalMul = baseMod * offBonus * defReduc * crit;
  const perMin = (A?.dmgMin ?? 0) * totalMul;
  const perMax = (A?.dmgMax ?? 0) * totalMul;
  const stack = Math.max(0, Number(aCount || 0));
  const totMin = _round(perMin * stack);
  const totMax = _round(perMax * stack);
  const totAvg = _round((perMin + perMax) / 2 * stack);
  const dHp = (Z?.hp ?? 1) * Math.max(1, Number(dCount || 1));
  const killedMin = Z ? Math.floor(totMin / (Z.hp || 1)) : 0;
  const killedMax = Z ? Math.floor(totMax / (Z.hp || 1)) : 0;
  const remainMin = Math.max(0, dHp - totMax);
  const remainMax = Math.max(0, dHp - totMin);
  const FactionRow = ({ value, onChange }) => /* @__PURE__ */ React.createElement("div", { className: "cs-fac-row" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      type: "button",
      className: `cs-fac-pill faction-${f.id}${value === f.id ? " selected" : ""}`,
      onClick: () => onChange(f.id),
      title: f.name
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        src: `img/factions/${f.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("span", null, f.name)
  )));
  const HeroGrid = ({ fac, value, onChange, allowNone }) => /* @__PURE__ */ React.createElement("div", { className: "cs-icon-grid" }, allowNone && /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      className: `cs-icon-btn cs-icon-none${!value ? " selected" : ""}`,
      onClick: () => onChange(""),
      title: "No hero"
    },
    "\u2014"
  ), (heroesByFac[fac] || []).map((h) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: h.id,
      type: "button",
      className: `cs-icon-btn${value === h.id ? " selected" : ""}`,
      onClick: () => onChange(h.id),
      title: `${h.name} \u2014 ${h.specialty || ""} (A${h.stats?.A ?? 0} D${h.stats?.D ?? 0} P${h.stats?.P ?? 0} K${h.stats?.K ?? 0})`
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    )
  )));
  const variantTag = (v) => ({ base: "", upg: "+", alt: "\u2605" })[v] || "";
  const UnitGrid = ({ fac, value, onChange }) => /* @__PURE__ */ React.createElement("div", { className: "cs-icon-grid" }, (unitsByFac[fac] || []).map((u) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: u.id,
      type: "button",
      className: `cs-icon-btn${value === u.id ? " selected" : ""}`,
      onClick: () => onChange(u.id),
      title: `T${u.tier}${variantTag(u.variant)} ${u.name} \u2014 HP ${u.hp}, Off ${u.off}, Def ${u.def}, Dmg ${u.dmgMin}\u2013${u.dmgMax}`
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        src: `img/units/${u.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ),
    u.variant !== "base" && /* @__PURE__ */ React.createElement("span", { className: "cs-variant-tag" }, variantTag(u.variant))
  )));
  const SkillSelect = ({ value, onChange, kind }) => /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "cs-select",
      value,
      onChange: (e) => onChange(Number(e.target.value))
    },
    _SKILL_LVLS.map((n, i) => /* @__PURE__ */ React.createElement("option", { key: i, value: i }, n, i > 0 ? ` (\xD7${(kind === "off" ? _OFF_BONUS[i] : _DEF_REDUC[i]).toFixed(2)})` : ""))
  );
  const Side = ({
    side,
    fac,
    unit,
    hero,
    count,
    setCount,
    heroAtk,
    setHeroAtk,
    heroDef,
    setHeroDef,
    skillLabel,
    skillVal,
    setSkill,
    skillKind
  }) => {
    const setHeroId = (id) => pickHero(side, id);
    const setUnitId = (id) => side === "a" ? setAUnitId(id) : setDUnitId(id);
    return /* @__PURE__ */ React.createElement("div", { className: "cs-side" }, /* @__PURE__ */ React.createElement("h3", { className: "cs-side-h" }, side === "a" ? "Attacker" : "Defender"), /* @__PURE__ */ React.createElement("div", { className: "cs-field" }, /* @__PURE__ */ React.createElement("div", { className: "cs-lbl" }, "Faction"), /* @__PURE__ */ React.createElement(FactionRow, { value: fac, onChange: (fid) => changeFac(side, fid) })), /* @__PURE__ */ React.createElement("div", { className: "cs-field" }, /* @__PURE__ */ React.createElement("div", { className: "cs-lbl" }, "Hero ", hero && /* @__PURE__ */ React.createElement("span", { className: "cs-sub" }, "\u2014 ", hero.name, " (A", hero.stats?.A ?? 0, " D", hero.stats?.D ?? 0, ")")), /* @__PURE__ */ React.createElement(HeroGrid, { fac, value: side === "a" ? aHeroId : dHeroId, onChange: setHeroId, allowNone: true })), /* @__PURE__ */ React.createElement("div", { className: "cs-field" }, /* @__PURE__ */ React.createElement("div", { className: "cs-lbl" }, "Unit ", unit && /* @__PURE__ */ React.createElement("span", { className: "cs-sub" }, "\u2014 T", unit.tier, variantTag(unit.variant), " ", unit.name)), /* @__PURE__ */ React.createElement(UnitGrid, { fac, value: side === "a" ? aUnitId : dUnitId, onChange: setUnitId })), unit && /* @__PURE__ */ React.createElement("div", { className: "cs-statline" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "HP"), " ", unit.hp), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Off"), " ", unit.off), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Def"), " ", unit.def), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Dmg"), " ", unit.dmgMin === unit.dmgMax ? unit.dmgMin : `${unit.dmgMin}\u2013${unit.dmgMax}`), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Init"), " ", unit.init), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "Spd"), " ", unit.speed)), /* @__PURE__ */ React.createElement("div", { className: "cs-inline-row" }, /* @__PURE__ */ React.createElement("label", null, "Stack", /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        min: "1",
        className: "cs-num",
        value: count,
        onChange: (e) => setCount(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "Hero ATK", /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        className: "cs-num",
        value: heroAtk,
        onChange: (e) => setHeroAtk(e.target.value)
      }
    )), /* @__PURE__ */ React.createElement("label", null, "Hero DEF", /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "number",
        className: "cs-num",
        value: heroDef,
        onChange: (e) => setHeroDef(e.target.value)
      }
    ))), /* @__PURE__ */ React.createElement("div", { className: "cs-inline-row" }, /* @__PURE__ */ React.createElement("label", { className: "cs-skill" }, skillLabel, /* @__PURE__ */ React.createElement(SkillSelect, { value: skillVal, onChange: setSkill, kind: skillKind }))));
  };
  const aHero = D.HEROES.find((x) => x.id === aHeroId);
  const dHero = D.HEROES.find((x) => x.id === dHeroId);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Combat simulator"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Pick a faction, hero, and unit per side. Damage = base \xD7 ", /* @__PURE__ */ React.createElement("code", null, "(20+ATK)/(20+DEF)"), " \xD7 offense \xD7 defense-reduction \xD7 lucky-strike, all multiplicative."), /* @__PURE__ */ React.createElement("div", { className: "cs-grid" }, /* @__PURE__ */ React.createElement(
    Side,
    {
      side: "a",
      fac: aFac,
      unit: A,
      hero: aHero,
      count: aCount,
      setCount: setACount,
      heroAtk: aHeroAtk,
      setHeroAtk: setAHeroAtk,
      heroDef: aHeroDef,
      setHeroDef: setAHeroDef,
      skillLabel: "Offense skill",
      skillVal: aOffense,
      setSkill: setAOffense,
      skillKind: "off"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "cs-vs" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "cs-swap", onClick: swap, title: "Swap sides" }, "\u21C4"), /* @__PURE__ */ React.createElement("div", { className: "cs-vs-text" }, "vs"), /* @__PURE__ */ React.createElement("label", { className: "cs-lucky" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: lucky, onChange: (e) => setLucky(e.target.checked) }), /* @__PURE__ */ React.createElement("span", null, "Lucky ", /* @__PURE__ */ React.createElement("span", { className: "cs-mul" }, "\xD71.5")))), /* @__PURE__ */ React.createElement(
    Side,
    {
      side: "d",
      fac: dFac,
      unit: Z,
      hero: dHero,
      count: dCount,
      setCount: setDCount,
      heroAtk: dHeroAtk,
      setHeroAtk: setDHeroAtk,
      heroDef: dHeroDef,
      setHeroDef: setDHeroDef,
      skillLabel: "Defense skill",
      skillVal: dDefense,
      setSkill: setDDefense,
      skillKind: "def"
    }
  )), A && Z && /* @__PURE__ */ React.createElement("section", { className: "hero-section cs-result" }, /* @__PURE__ */ React.createElement("h2", null, "Result"), /* @__PURE__ */ React.createElement("table", { className: "cs-breakdown" }, /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Attack"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, A.off, " + ", aHeroAtk || 0, " = ", /* @__PURE__ */ React.createElement("b", null, atkTotal))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Defense"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, Z.def, " + ", dHeroDef || 0, " = ", /* @__PURE__ */ React.createElement("b", null, defTotal))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Base modifier"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, "(20 + ", atkTotal, ") / (20 + ", defTotal, ") = ", /* @__PURE__ */ React.createElement("b", null, "\xD7", baseMod.toFixed(3)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Offense skill"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, _SKILL_LVLS[aOffense], " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", offBonus.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Defense skill"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, _SKILL_LVLS[dDefense], " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", defReduc.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Lucky Strike"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, lucky ? "Yes" : "No", " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", crit.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", { className: "cs-total-row" }, /* @__PURE__ */ React.createElement("td", null, "Total multiplier"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, /* @__PURE__ */ React.createElement("b", null, "\xD7", totalMul.toFixed(3)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Per-attacker damage"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, A.dmgMin, "\u2013", A.dmgMax, " \xD7 ", totalMul.toFixed(3), " = ", /* @__PURE__ */ React.createElement("b", null, perMin.toFixed(2), "\u2013", perMax.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Stack damage"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, stack, " \xD7 (", perMin.toFixed(2), "\u2013", perMax.toFixed(2), ")")))), /* @__PURE__ */ React.createElement("div", { className: "cs-final" }, /* @__PURE__ */ React.createElement("div", { className: "cs-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "cs-final-lbl" }, "Damage dealt"), /* @__PURE__ */ React.createElement("div", { className: "cs-final-val" }, totMin.toLocaleString(), "\u2013", totMax.toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "cs-final-sub" }, "avg \u2248 ", totAvg.toLocaleString())), /* @__PURE__ */ React.createElement("div", { className: "cs-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "cs-final-lbl" }, Z.name, " killed"), /* @__PURE__ */ React.createElement("div", { className: "cs-final-val" }, killedMin, "\u2013", killedMax), /* @__PURE__ */ React.createElement("div", { className: "cs-final-sub" }, "of ", dCount, " (", dHp.toLocaleString(), " HP total)")), /* @__PURE__ */ React.createElement("div", { className: "cs-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "cs-final-lbl" }, "Stack remaining"), /* @__PURE__ */ React.createElement("div", { className: "cs-final-val" }, remainMin.toLocaleString(), "\u2013", remainMax.toLocaleString(), " HP"), /* @__PURE__ */ React.createElement("div", { className: "cs-final-sub" }, "\u2248 ", Math.max(0, dCount - killedMax), "\u2013", Math.max(0, dCount - killedMin), " alive"))), /* @__PURE__ */ React.createElement("p", { className: "cs-caveat" }, "MVP \u2014 does not yet model: ranged distance penalty, melee counterattack, unit passives (Double Strike, Hate-X, etc.), spell buffs/debuffs (Bless, Curse, Stoneskin), terrain, morale, or hero specialty bonuses. Apply such effects manually via the Hero ATK / Hero DEF inputs.")));
};
window.CombatView = CombatView;
