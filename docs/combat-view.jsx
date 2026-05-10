/* Combat simulator: pick two unit stacks and (optionally) heroes + skills,
   compute damage using the Olden Era / classic-HOMM formula:

       modifier  = (20 + ATK_total) / (20 + DEF_total)
       finalMul  = modifier × offenseBonus × defenseReduction × lucky
       perAtkDmg = baseDmg × finalMul
       total     = stack × perAtkDmg          (round to nearest)

   ATK_total = unit.off + hero_attack (defender hero contributes nothing here)
   DEF_total = unit.def + hero_defense

   Skill bonuses: Offense ×1.10/1.15/1.20 (Basic/Adv/Expert)
                  Defense ×0.90/0.85/0.80 (defender takes less)
   Lucky strike: ×1.5
*/

const _OFF_BONUS = [1.0, 1.10, 1.15, 1.20];
const _DEF_REDUC = [1.0, 0.90, 0.85, 0.80];
const _SKILL_LVLS = ['None', 'Basic', 'Advanced', 'Expert'];

const _round = (x) => Math.round(x);  // standard half-up rounding

const CombatView = ({ go }) => {
  const D = window.OE_DATA;
  if (!D) return <p>Data not loaded.</p>;

  // Sort units alphabetically by name within faction for stable picker UX
  const UNITS = React.useMemo(
    () => [...D.UNITS].sort((a, b) =>
      (a.faction || '').localeCompare(b.faction || '') ||
      (a.tier || 0) - (b.tier || 0) ||
      a.name.localeCompare(b.name)),
    [D]);
  const HEROES = React.useMemo(
    () => [...D.HEROES].sort((a, b) =>
      (a.faction || '').localeCompare(b.faction || '') ||
      a.name.localeCompare(b.name)),
    [D]);

  const facName = Object.fromEntries((D.FACTIONS || []).map(f => [f.id, f.name]));

  // --- state ---
  const [attackerId, setAttackerId] = React.useState('esquire');
  const [defenderId, setDefenderId] = React.useState('skeleton_warrior');
  const [aCount, setACount] = React.useState(20);
  const [dCount, setDCount] = React.useState(20);

  const [aHeroId, setAHeroId] = React.useState('');
  const [dHeroId, setDHeroId] = React.useState('');
  const [aHeroAtk, setAHeroAtk] = React.useState(0);
  const [aHeroDef, setAHeroDef] = React.useState(0);
  const [dHeroAtk, setDHeroAtk] = React.useState(0);
  const [dHeroDef, setDHeroDef] = React.useState(0);

  const [aOffense, setAOffense] = React.useState(0);  // attacker's Offense skill
  const [dDefense, setDDefense] = React.useState(0);  // defender's Defense skill
  const [lucky, setLucky] = React.useState(false);

  // Picking a hero auto-fills their Attack and Defense for that side.
  // (Keeps the input visible so it can be tweaked afterward.)
  const pickHero = (side, id) => {
    const h = HEROES.find(x => x.id === id);
    if (side === 'a') {
      setAHeroId(id);
      if (h) { setAHeroAtk(h.stats?.A ?? 0); setAHeroDef(h.stats?.D ?? 0); }
    } else {
      setDHeroId(id);
      if (h) { setDHeroAtk(h.stats?.A ?? 0); setDHeroDef(h.stats?.D ?? 0); }
    }
  };

  const swap = () => {
    const _aid = attackerId, _did = defenderId;
    const _ac = aCount, _dc = dCount;
    const _ah = aHeroId, _dh = dHeroId;
    const _aa = aHeroAtk, _ad = aHeroDef, _da = dHeroAtk, _dd = dHeroDef;
    setAttackerId(_did); setDefenderId(_aid);
    setACount(_dc); setDCount(_ac);
    setAHeroId(_dh); setDHeroId(_ah);
    setAHeroAtk(_da); setAHeroDef(_dd);
    setDHeroAtk(_aa); setDHeroDef(_ad);
    const _o = aOffense, _d = dDefense;
    setAOffense(_d); setDDefense(_o);  // skills swap too (both apply to mirror side)
  };

  const A = UNITS.find(u => u.id === attackerId);
  const Z = UNITS.find(u => u.id === defenderId);

  // --- compute ---
  const atkTotal = (A?.off ?? 0) + Number(aHeroAtk || 0);
  const defTotal = (Z?.def ?? 0) + Number(dHeroDef || 0);
  const baseMod = (20 + atkTotal) / (20 + defTotal);
  const offBonus = _OFF_BONUS[aOffense];
  const defReduc = _DEF_REDUC[dDefense];
  const crit = lucky ? 1.5 : 1.0;
  const totalMul = baseMod * offBonus * defReduc * crit;

  const perMin = (A?.dmgMin ?? 0) * totalMul;
  const perMax = (A?.dmgMax ?? 0) * totalMul;
  const stack = Math.max(0, Number(aCount || 0));
  const totMin = _round(perMin * stack);
  const totMax = _round(perMax * stack);
  const totAvg = _round(((perMin + perMax) / 2) * stack);

  // Quick: "kills X creatures" estimate (assuming defender HP, ignoring overkill complexity)
  const dHp = (Z?.hp ?? 1) * Math.max(1, Number(dCount || 1));
  const remainingMin = Math.max(0, dHp - totMax);
  const remainingMax = Math.max(0, dHp - totMin);
  const killedMin = Z ? Math.floor(totMin / (Z.hp || 1)) : 0;
  const killedMax = Z ? Math.floor(totMax / (Z.hp || 1)) : 0;

  // group units by faction for the optgroup pickers
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
    const groups = kind === 'unit' ? unitsByFaction : heroesByFaction;
    return (
      <select className="combat-select" value={value} onChange={e => onChange(e.target.value)}>
        {kind === 'hero' && <option value="">— No hero —</option>}
        {(D.FACTIONS || []).map(f => (
          <optgroup key={f.id} label={f.name}>
            {(groups[f.id] || []).map(x => (
              <option key={x.id} value={x.id}>
                {x.name}{kind === 'unit' ? ` (T${x.tier}${x.variant !== 'base' ? '+' : ''})` : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    );
  };

  const StackPanel = ({ side, unit, count, setCount, heroId, setHero,
                        heroAtk, setHeroAtk, heroDef, setHeroDef,
                        skillLabel, skillVal, setSkill, skillKind }) => (
    <div className="combat-side">
      <h3 className="combat-side-h">{side === 'a' ? 'Attacker' : 'Defender'}</h3>
      <div className="combat-row">
        <label className="combat-lbl">Unit</label>
        <Picker value={unit?.id || ''} onChange={side === 'a' ? setAttackerId : setDefenderId} kind="unit" />
      </div>
      {unit && (
        <div className="combat-unit-card">
          <img loading="lazy" className="combat-unit-icon"
               src={`img/units/${unit.id}.png`} alt=""
               onError={e=>{e.target.style.visibility='hidden';}} />
          <div className="combat-unit-stats">
            <div><span>HP</span><b>{unit.hp}</b></div>
            <div><span>Off</span><b>{unit.off}</b></div>
            <div><span>Def</span><b>{unit.def}</b></div>
            <div><span>Dmg</span><b>{unit.dmgMin === unit.dmgMax ? unit.dmgMin : `${unit.dmgMin}–${unit.dmgMax}`}</b></div>
            <div><span>Init</span><b>{unit.init}</b></div>
            <div><span>Spd</span><b>{unit.speed}</b></div>
          </div>
        </div>
      )}
      <div className="combat-row">
        <label className="combat-lbl">Stack size</label>
        <input type="number" min="1" className="combat-num"
               value={count} onChange={e => setCount(e.target.value)} />
      </div>

      <div className="combat-row">
        <label className="combat-lbl">Hero</label>
        <Picker value={heroId} onChange={(id) => pickHero(side, id)} kind="hero" />
      </div>
      <div className="combat-row combat-row-pair">
        <span><label className="combat-lbl">Hero ATK</label>
          <input type="number" className="combat-num"
                 value={heroAtk} onChange={e => setHeroAtk(e.target.value)} /></span>
        <span><label className="combat-lbl">Hero DEF</label>
          <input type="number" className="combat-num"
                 value={heroDef} onChange={e => setHeroDef(e.target.value)} /></span>
      </div>

      <div className="combat-row">
        <label className="combat-lbl">{skillLabel}</label>
        <select className="combat-select"
                value={skillVal} onChange={e => setSkill(Number(e.target.value))}>
          {_SKILL_LVLS.map((n, i) => (
            <option key={i} value={i}>
              {n}{i > 0 ? ` (×${(skillKind === 'off' ? _OFF_BONUS[i] : _DEF_REDUC[i]).toFixed(2)})` : ''}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <>
      <h1>Combat simulator</h1>
      <p className="hero-army" style={{maxWidth:'60em'}}>
        Two stacks, one attack. Damage = base × <code>(20+ATK)/(20+DEF)</code> ×
        offense × defense-reduction × lucky-strike, all multiplicative.
      </p>

      <div className="combat-grid">
        <StackPanel
          side="a" unit={A} count={aCount} setCount={setACount}
          heroId={aHeroId} setHero={setAHeroId}
          heroAtk={aHeroAtk} setHeroAtk={setAHeroAtk}
          heroDef={aHeroDef} setHeroDef={setAHeroDef}
          skillLabel="Offense skill" skillVal={aOffense} setSkill={setAOffense} skillKind="off" />

        <div className="combat-vs">
          <button type="button" className="combat-swap" onClick={swap} title="Swap sides">⇄</button>
          <div className="combat-vs-text">vs</div>
          <label className="combat-lucky">
            <input type="checkbox" checked={lucky} onChange={e => setLucky(e.target.checked)} />
            <span>Lucky Strike <span className="combat-mul-tag">×1.5</span></span>
          </label>
        </div>

        <StackPanel
          side="d" unit={Z} count={dCount} setCount={setDCount}
          heroId={dHeroId} setHero={setDHeroId}
          heroAtk={dHeroAtk} setHeroAtk={setDHeroAtk}
          heroDef={dHeroDef} setHeroDef={setDHeroDef}
          skillLabel="Defense skill" skillVal={dDefense} setSkill={setDDefense} skillKind="def" />
      </div>

      {A && Z && (
        <section className="hero-section combat-result">
          <h2>Result</h2>
          <table className="combat-breakdown">
            <tbody>
              <tr><td>Total Attack</td>
                  <td className="mono">{A.off} + {aHeroAtk || 0} = <b>{atkTotal}</b></td></tr>
              <tr><td>Total Defense</td>
                  <td className="mono">{Z.def} + {dHeroDef || 0} = <b>{defTotal}</b></td></tr>
              <tr><td>Base modifier</td>
                  <td className="mono">(20 + {atkTotal}) / (20 + {defTotal}) = <b>×{baseMod.toFixed(3)}</b></td></tr>
              <tr><td>Offense skill</td>
                  <td className="mono">{_SKILL_LVLS[aOffense]} → <b>×{offBonus.toFixed(2)}</b></td></tr>
              <tr><td>Defense skill</td>
                  <td className="mono">{_SKILL_LVLS[dDefense]} → <b>×{defReduc.toFixed(2)}</b></td></tr>
              <tr><td>Lucky Strike</td>
                  <td className="mono">{lucky ? 'Yes' : 'No'} → <b>×{crit.toFixed(2)}</b></td></tr>
              <tr className="combat-total-row">
                <td>Total multiplier</td>
                <td className="mono"><b>×{totalMul.toFixed(3)}</b></td>
              </tr>
              <tr><td>Per-attacker damage</td>
                  <td className="mono">{A.dmgMin}–{A.dmgMax} × {totalMul.toFixed(3)} = <b>{perMin.toFixed(2)}–{perMax.toFixed(2)}</b></td></tr>
              <tr><td>Stack damage</td>
                  <td className="mono">{stack} × ({perMin.toFixed(2)}–{perMax.toFixed(2)})</td></tr>
            </tbody>
          </table>

          <div className="combat-final">
            <div className="combat-final-block">
              <div className="combat-final-lbl">Damage dealt</div>
              <div className="combat-final-val">{totMin.toLocaleString()}–{totMax.toLocaleString()}</div>
              <div className="combat-final-sub">avg ≈ {totAvg.toLocaleString()}</div>
            </div>
            <div className="combat-final-block">
              <div className="combat-final-lbl">{Z.name} killed</div>
              <div className="combat-final-val">{killedMin}–{killedMax}</div>
              <div className="combat-final-sub">of {dCount} ({dHp.toLocaleString()} HP total)</div>
            </div>
            <div className="combat-final-block">
              <div className="combat-final-lbl">Stack remaining</div>
              <div className="combat-final-val">{remainingMin.toLocaleString()}–{remainingMax.toLocaleString()} HP</div>
              <div className="combat-final-sub">≈ {Math.max(0, dCount - killedMax)}–{Math.max(0, dCount - killedMin)} alive</div>
            </div>
          </div>

          <p className="combat-caveat">
            MVP — does not yet model: ranged distance penalty, melee counterattack,
            unit passives (e.g. Double Strike, +/− vs. faction), spell buffs/debuffs (Bless,
            Curse, Stoneskin), terrain, morale, or hero specialty bonuses. Use the
            inputs above to apply such effects manually.
          </p>
        </section>
      )}
    </>
  );
};

window.CombatView = CombatView;
