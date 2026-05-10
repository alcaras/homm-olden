const _OFF_BONUS = [1, 1.1, 1.15, 1.2];
const _DEF_REDUC = [1, 0.9, 0.85, 0.8];
const _SKILL_LVLS = ["None", "Basic", "Advanced", "Expert"];
const _round = (x) => Math.round(x);
const CombatView = ({ go }) => {
  const D = window.OE_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Data not loaded.");
  const UNITS = React.useMemo(
    () => [...D.UNITS].sort((a, b) => (a.faction || "").localeCompare(b.faction || "") || (a.tier || 0) - (b.tier || 0) || a.name.localeCompare(b.name)),
    [D]
  );
  const HEROES = React.useMemo(
    () => [...D.HEROES].sort((a, b) => (a.faction || "").localeCompare(b.faction || "") || a.name.localeCompare(b.name)),
    [D]
  );
  const facName = Object.fromEntries((D.FACTIONS || []).map((f) => [f.id, f.name]));
  const [attackerId, setAttackerId] = React.useState("esquire");
  const [defenderId, setDefenderId] = React.useState("skeleton_warrior");
  const [aCount, setACount] = React.useState(20);
  const [dCount, setDCount] = React.useState(20);
  const [aHeroId, setAHeroId] = React.useState("");
  const [dHeroId, setDHeroId] = React.useState("");
  const [aHeroAtk, setAHeroAtk] = React.useState(0);
  const [aHeroDef, setAHeroDef] = React.useState(0);
  const [dHeroAtk, setDHeroAtk] = React.useState(0);
  const [dHeroDef, setDHeroDef] = React.useState(0);
  const [aOffense, setAOffense] = React.useState(0);
  const [dDefense, setDDefense] = React.useState(0);
  const [lucky, setLucky] = React.useState(false);
  const pickHero = (side, id) => {
    const h = HEROES.find((x) => x.id === id);
    if (side === "a") {
      setAHeroId(id);
      if (h) {
        setAHeroAtk(h.stats?.A ?? 0);
        setAHeroDef(h.stats?.D ?? 0);
      }
    } else {
      setDHeroId(id);
      if (h) {
        setDHeroAtk(h.stats?.A ?? 0);
        setDHeroDef(h.stats?.D ?? 0);
      }
    }
  };
  const swap = () => {
    const _aid = attackerId, _did = defenderId;
    const _ac = aCount, _dc = dCount;
    const _ah = aHeroId, _dh = dHeroId;
    const _aa = aHeroAtk, _ad = aHeroDef, _da = dHeroAtk, _dd = dHeroDef;
    setAttackerId(_did);
    setDefenderId(_aid);
    setACount(_dc);
    setDCount(_ac);
    setAHeroId(_dh);
    setDHeroId(_ah);
    setAHeroAtk(_da);
    setAHeroDef(_dd);
    setDHeroAtk(_aa);
    setDHeroDef(_ad);
    const _o = aOffense, _d = dDefense;
    setAOffense(_d);
    setDDefense(_o);
  };
  const A = UNITS.find((u) => u.id === attackerId);
  const Z = UNITS.find((u) => u.id === defenderId);
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
  const remainingMin = Math.max(0, dHp - totMax);
  const remainingMax = Math.max(0, dHp - totMin);
  const killedMin = Z ? Math.floor(totMin / (Z.hp || 1)) : 0;
  const killedMax = Z ? Math.floor(totMax / (Z.hp || 1)) : 0;
  const unitsByFaction = React.useMemo(() => {
    const g = {};
    for (const u of UNITS) (g[u.faction] = g[u.faction] || []).push(u);
    return g;
  }, [UNITS]);
  const heroesByFaction = React.useMemo(() => {
    const g = {};
    for (const h of HEROES) (g[h.faction] = g[h.faction] || []).push(h);
    return g;
  }, [HEROES]);
  const Picker = ({ value, onChange, kind }) => {
    const groups = kind === "unit" ? unitsByFaction : heroesByFaction;
    return /* @__PURE__ */ React.createElement("select", { className: "combat-select", value, onChange: (e) => onChange(e.target.value) }, kind === "hero" && /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014 No hero \u2014"), (D.FACTIONS || []).map((f) => /* @__PURE__ */ React.createElement("optgroup", { key: f.id, label: f.name }, (groups[f.id] || []).map((x) => /* @__PURE__ */ React.createElement("option", { key: x.id, value: x.id }, x.name, kind === "unit" ? ` (T${x.tier}${x.variant !== "base" ? "+" : ""})` : "")))));
  };
  const StackPanel = ({
    side,
    unit,
    count,
    setCount,
    heroId,
    setHero,
    heroAtk,
    setHeroAtk,
    heroDef,
    setHeroDef,
    skillLabel,
    skillVal,
    setSkill,
    skillKind
  }) => /* @__PURE__ */ React.createElement("div", { className: "combat-side" }, /* @__PURE__ */ React.createElement("h3", { className: "combat-side-h" }, side === "a" ? "Attacker" : "Defender"), /* @__PURE__ */ React.createElement("div", { className: "combat-row" }, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, "Unit"), /* @__PURE__ */ React.createElement(Picker, { value: unit?.id || "", onChange: side === "a" ? setAttackerId : setDefenderId, kind: "unit" })), unit && /* @__PURE__ */ React.createElement("div", { className: "combat-unit-card" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "combat-unit-icon",
      src: `img/units/${unit.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "combat-unit-stats" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "HP"), /* @__PURE__ */ React.createElement("b", null, unit.hp)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Off"), /* @__PURE__ */ React.createElement("b", null, unit.off)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Def"), /* @__PURE__ */ React.createElement("b", null, unit.def)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Dmg"), /* @__PURE__ */ React.createElement("b", null, unit.dmgMin === unit.dmgMax ? unit.dmgMin : `${unit.dmgMin}\u2013${unit.dmgMax}`)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Init"), /* @__PURE__ */ React.createElement("b", null, unit.init)), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("span", null, "Spd"), /* @__PURE__ */ React.createElement("b", null, unit.speed)))), /* @__PURE__ */ React.createElement("div", { className: "combat-row" }, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, "Stack size"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      min: "1",
      className: "combat-num",
      value: count,
      onChange: (e) => setCount(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "combat-row" }, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, "Hero"), /* @__PURE__ */ React.createElement(Picker, { value: heroId, onChange: (id) => pickHero(side, id), kind: "hero" })), /* @__PURE__ */ React.createElement("div", { className: "combat-row combat-row-pair" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, "Hero ATK"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "combat-num",
      value: heroAtk,
      onChange: (e) => setHeroAtk(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, "Hero DEF"), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "number",
      className: "combat-num",
      value: heroDef,
      onChange: (e) => setHeroDef(e.target.value)
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: "combat-row" }, /* @__PURE__ */ React.createElement("label", { className: "combat-lbl" }, skillLabel), /* @__PURE__ */ React.createElement(
    "select",
    {
      className: "combat-select",
      value: skillVal,
      onChange: (e) => setSkill(Number(e.target.value))
    },
    _SKILL_LVLS.map((n, i) => /* @__PURE__ */ React.createElement("option", { key: i, value: i }, n, i > 0 ? ` (\xD7${(skillKind === "off" ? _OFF_BONUS[i] : _DEF_REDUC[i]).toFixed(2)})` : ""))
  )));
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Combat simulator"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "60em" } }, "Two stacks, one attack. Damage = base \xD7 ", /* @__PURE__ */ React.createElement("code", null, "(20+ATK)/(20+DEF)"), " \xD7 offense \xD7 defense-reduction \xD7 lucky-strike, all multiplicative."), /* @__PURE__ */ React.createElement("div", { className: "combat-grid" }, /* @__PURE__ */ React.createElement(
    StackPanel,
    {
      side: "a",
      unit: A,
      count: aCount,
      setCount: setACount,
      heroId: aHeroId,
      setHero: setAHeroId,
      heroAtk: aHeroAtk,
      setHeroAtk: setAHeroAtk,
      heroDef: aHeroDef,
      setHeroDef: setAHeroDef,
      skillLabel: "Offense skill",
      skillVal: aOffense,
      setSkill: setAOffense,
      skillKind: "off"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "combat-vs" }, /* @__PURE__ */ React.createElement("button", { type: "button", className: "combat-swap", onClick: swap, title: "Swap sides" }, "\u21C4"), /* @__PURE__ */ React.createElement("div", { className: "combat-vs-text" }, "vs"), /* @__PURE__ */ React.createElement("label", { className: "combat-lucky" }, /* @__PURE__ */ React.createElement("input", { type: "checkbox", checked: lucky, onChange: (e) => setLucky(e.target.checked) }), /* @__PURE__ */ React.createElement("span", null, "Lucky Strike ", /* @__PURE__ */ React.createElement("span", { className: "combat-mul-tag" }, "\xD71.5")))), /* @__PURE__ */ React.createElement(
    StackPanel,
    {
      side: "d",
      unit: Z,
      count: dCount,
      setCount: setDCount,
      heroId: dHeroId,
      setHero: setDHeroId,
      heroAtk: dHeroAtk,
      setHeroAtk: setDHeroAtk,
      heroDef: dHeroDef,
      setHeroDef: setDHeroDef,
      skillLabel: "Defense skill",
      skillVal: dDefense,
      setSkill: setDDefense,
      skillKind: "def"
    }
  )), A && Z && /* @__PURE__ */ React.createElement("section", { className: "hero-section combat-result" }, /* @__PURE__ */ React.createElement("h2", null, "Result"), /* @__PURE__ */ React.createElement("table", { className: "combat-breakdown" }, /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Attack"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, A.off, " + ", aHeroAtk || 0, " = ", /* @__PURE__ */ React.createElement("b", null, atkTotal))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Total Defense"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, Z.def, " + ", dHeroDef || 0, " = ", /* @__PURE__ */ React.createElement("b", null, defTotal))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Base modifier"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, "(20 + ", atkTotal, ") / (20 + ", defTotal, ") = ", /* @__PURE__ */ React.createElement("b", null, "\xD7", baseMod.toFixed(3)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Offense skill"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, _SKILL_LVLS[aOffense], " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", offBonus.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Defense skill"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, _SKILL_LVLS[dDefense], " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", defReduc.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Lucky Strike"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, lucky ? "Yes" : "No", " \u2192 ", /* @__PURE__ */ React.createElement("b", null, "\xD7", crit.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", { className: "combat-total-row" }, /* @__PURE__ */ React.createElement("td", null, "Total multiplier"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, /* @__PURE__ */ React.createElement("b", null, "\xD7", totalMul.toFixed(3)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Per-attacker damage"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, A.dmgMin, "\u2013", A.dmgMax, " \xD7 ", totalMul.toFixed(3), " = ", /* @__PURE__ */ React.createElement("b", null, perMin.toFixed(2), "\u2013", perMax.toFixed(2)))), /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, "Stack damage"), /* @__PURE__ */ React.createElement("td", { className: "mono" }, stack, " \xD7 (", perMin.toFixed(2), "\u2013", perMax.toFixed(2), ")")))), /* @__PURE__ */ React.createElement("div", { className: "combat-final" }, /* @__PURE__ */ React.createElement("div", { className: "combat-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "combat-final-lbl" }, "Damage dealt"), /* @__PURE__ */ React.createElement("div", { className: "combat-final-val" }, totMin.toLocaleString(), "\u2013", totMax.toLocaleString()), /* @__PURE__ */ React.createElement("div", { className: "combat-final-sub" }, "avg \u2248 ", totAvg.toLocaleString())), /* @__PURE__ */ React.createElement("div", { className: "combat-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "combat-final-lbl" }, Z.name, " killed"), /* @__PURE__ */ React.createElement("div", { className: "combat-final-val" }, killedMin, "\u2013", killedMax), /* @__PURE__ */ React.createElement("div", { className: "combat-final-sub" }, "of ", dCount, " (", dHp.toLocaleString(), " HP total)")), /* @__PURE__ */ React.createElement("div", { className: "combat-final-block" }, /* @__PURE__ */ React.createElement("div", { className: "combat-final-lbl" }, "Stack remaining"), /* @__PURE__ */ React.createElement("div", { className: "combat-final-val" }, remainingMin.toLocaleString(), "\u2013", remainingMax.toLocaleString(), " HP"), /* @__PURE__ */ React.createElement("div", { className: "combat-final-sub" }, "\u2248 ", Math.max(0, dCount - killedMax), "\u2013", Math.max(0, dCount - killedMin), " alive"))), /* @__PURE__ */ React.createElement("p", { className: "combat-caveat" }, "MVP \u2014 does not yet model: ranged distance penalty, melee counterattack, unit passives (e.g. Double Strike, +/\u2212 vs. faction), spell buffs/debuffs (Bless, Curse, Stoneskin), terrain, morale, or hero specialty bonuses. Use the inputs above to apply such effects manually.")));
};
window.CombatView = CombatView;
