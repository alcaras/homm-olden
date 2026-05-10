/* Combat simulator: pick faction → hero → unit on each side; compute damage
   using the Olden Era / classic-HOMM formula:

       modifier  = (20 + ATK_total) / (20 + DEF_total)
       finalMul  = modifier × offenseBonus × defenseReduction × lucky
       perAtkDmg = baseDmg × finalMul
       total     = stack × perAtkDmg          (round to nearest)

   Hero auto-fills ATK on the attacker side and DEF on the defender side.
   Skill bonuses: Offense ×1.10/1.15/1.20  Defense ×0.90/0.85/0.80
   Lucky strike: ×1.5
*/

const _OFF_BONUS = [1.0, 1.10, 1.15, 1.20];
const _DEF_REDUC = [1.0, 0.90, 0.85, 0.80];
const _SKILL_LVLS = ['None', 'Basic', 'Advanced', 'Expert'];
const _round = (x) => Math.round(x);

const CombatView = ({ go }) => {
  const D = window.OE_DATA;
  if (!D) return <p>Data not loaded.</p>;

  const FACTIONS = D.FACTIONS || [];
  const facById = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  // Heroes / units grouped by faction (and units sorted tier→variant→name).
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
      g[k].sort((a, b) =>
        (a.tier - b.tier)
        || ((variantOrder[a.variant] ?? 9) - (variantOrder[b.variant] ?? 9))
        || a.name.localeCompare(b.name));
    }
    return g;
  }, [D]);

  // Per-side state.
  const [aFac, setAFac] = React.useState('temple');
  const [dFac, setDFac] = React.useState('necropolis');

  const firstUnit = (fac) => unitsByFac[fac]?.[0]?.id || '';
  const [aUnitId, setAUnitId] = React.useState(() => firstUnit('temple'));
  const [dUnitId, setDUnitId] = React.useState(() => firstUnit('necropolis'));

  const [aHeroId, setAHeroId] = React.useState('');
  const [dHeroId, setDHeroId] = React.useState('');

  const [aCount, setACount] = React.useState(20);
  const [dCount, setDCount] = React.useState(20);

  // Hero stat overrides (auto-fill from picked hero, but editable).
  const [aHeroAtk, setAHeroAtk] = React.useState(0);
  const [aHeroDef, setAHeroDef] = React.useState(0);
  const [dHeroAtk, setDHeroAtk] = React.useState(0);
  const [dHeroDef, setDHeroDef] = React.useState(0);

  const [aOffense, setAOffense] = React.useState(0);
  const [dDefense, setDDefense] = React.useState(0);
  const [lucky, setLucky] = React.useState(false);

  // Switching faction → reset hero (cross-faction wouldn't match) and snap unit
  // to that faction's first unit. Keeps the picker honest.
  const changeFac = (side, fid) => {
    if (side === 'a') {
      setAFac(fid); setAHeroId(''); setAHeroAtk(0); setAHeroDef(0);
      setAUnitId(firstUnit(fid));
    } else {
      setDFac(fid); setDHeroId(''); setDHeroAtk(0); setDHeroDef(0);
      setDUnitId(firstUnit(fid));
    }
  };

  const pickHero = (side, id) => {
    const h = D.HEROES.find(x => x.id === id);
    if (side === 'a') {
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
    const _aF = aFac, _aU = aUnitId, _aH = aHeroId, _aC = aCount,
          _aA = aHeroAtk, _aD = aHeroDef, _aO = aOffense;
    setAFac(dFac);   setDFac(_aF);
    setAUnitId(dUnitId); setDUnitId(_aU);
    setAHeroId(dHeroId); setDHeroId(_aH);
    setACount(dCount);   setDCount(_aC);
    setAHeroAtk(dHeroAtk); setDHeroAtk(_aA);
    setAHeroDef(dHeroDef); setDHeroDef(_aD);
    setAOffense(dDefense); setDDefense(_aO);
  };

  const A = D.UNITS.find(u => u.id === aUnitId);
  const Z = D.UNITS.find(u => u.id === dUnitId);

  // --- compute ---
  const atkTotal = (A?.off ?? 0) + Number(aHeroAtk || 0);
  const defTotal = (Z?.def ?? 0) + Number(dHeroDef || 0);
  const baseMod  = (20 + atkTotal) / (20 + defTotal);
  const offBonus = _OFF_BONUS[aOffense];
  const defReduc = _DEF_REDUC[dDefense];
  const crit     = lucky ? 1.5 : 1.0;
  const totalMul = baseMod * offBonus * defReduc * crit;

  const perMin = (A?.dmgMin ?? 0) * totalMul;
  const perMax = (A?.dmgMax ?? 0) * totalMul;
  const stack  = Math.max(0, Number(aCount || 0));
  const totMin = _round(perMin * stack);
  const totMax = _round(perMax * stack);
  const totAvg = _round(((perMin + perMax) / 2) * stack);

  const dHp        = (Z?.hp ?? 1) * Math.max(1, Number(dCount || 1));
  const killedMin  = Z ? Math.floor(totMin / (Z.hp || 1)) : 0;
  const killedMax  = Z ? Math.floor(totMax / (Z.hp || 1)) : 0;
  const remainMin  = Math.max(0, dHp - totMax);
  const remainMax  = Math.max(0, dHp - totMin);

  // --- subcomponents ---

  const FactionRow = ({ value, onChange }) => (
    <div className="cs-fac-row">
      {FACTIONS.map(f => (
        <button key={f.id} type="button"
                className={`cs-fac-pill faction-${f.id}${value === f.id ? ' selected' : ''}`}
                onClick={() => onChange(f.id)}
                title={f.name}>
          <img loading="lazy" src={`img/factions/${f.id}.png`} alt=""
               onError={e => { e.target.style.visibility = 'hidden'; }} />
          <span>{f.name}</span>
        </button>
      ))}
    </div>
  );

  const HeroGrid = ({ fac, value, onChange, allowNone }) => (
    <div className="cs-icon-grid">
      {allowNone && (
        <button type="button"
                className={`cs-icon-btn cs-icon-none${!value ? ' selected' : ''}`}
                onClick={() => onChange('')} title="No hero">—</button>
      )}
      {(heroesByFac[fac] || []).map(h => (
        <button key={h.id} type="button"
                className={`cs-icon-btn${value === h.id ? ' selected' : ''}`}
                onClick={() => onChange(h.id)}
                title={`${h.name} — ${h.specialty || ''} (A${h.stats?.A ?? 0} D${h.stats?.D ?? 0} P${h.stats?.P ?? 0} K${h.stats?.K ?? 0})`}>
          <img loading="lazy" src={`img/heroes/${h.id}.png`} alt=""
               onError={e => { e.target.style.visibility = 'hidden'; }} />
        </button>
      ))}
    </div>
  );

  const variantTag = (v) => ({ base: '', upg: '+', alt: '★' })[v] || '';
  const UnitGrid = ({ fac, value, onChange }) => (
    <div className="cs-icon-grid">
      {(unitsByFac[fac] || []).map(u => (
        <button key={u.id} type="button"
                className={`cs-icon-btn${value === u.id ? ' selected' : ''}`}
                onClick={() => onChange(u.id)}
                title={`T${u.tier}${variantTag(u.variant)} ${u.name} — HP ${u.hp}, Off ${u.off}, Def ${u.def}, Dmg ${u.dmgMin}–${u.dmgMax}`}>
          <img loading="lazy" src={`img/units/${u.id}.png`} alt=""
               onError={e => { e.target.style.visibility = 'hidden'; }} />
          {u.variant !== 'base' && <span className="cs-variant-tag">{variantTag(u.variant)}</span>}
        </button>
      ))}
    </div>
  );

  const SkillSelect = ({ value, onChange, kind }) => (
    <select className="cs-select"
            value={value} onChange={e => onChange(Number(e.target.value))}>
      {_SKILL_LVLS.map((n, i) => (
        <option key={i} value={i}>
          {n}{i > 0 ? ` (×${(kind === 'off' ? _OFF_BONUS[i] : _DEF_REDUC[i]).toFixed(2)})` : ''}
        </option>
      ))}
    </select>
  );

  const Side = ({ side, fac, unit, hero, count, setCount, heroAtk, setHeroAtk,
                  heroDef, setHeroDef, skillLabel, skillVal, setSkill, skillKind }) => {
    const setHeroId = (id) => pickHero(side, id);
    const setUnitId = (id) => side === 'a' ? setAUnitId(id) : setDUnitId(id);
    return (
      <div className="cs-side">
        <h3 className="cs-side-h">{side === 'a' ? 'Attacker' : 'Defender'}</h3>

        <div className="cs-field">
          <div className="cs-lbl">Faction</div>
          <FactionRow value={fac} onChange={(fid) => changeFac(side, fid)} />
        </div>

        <div className="cs-field">
          <div className="cs-lbl">Hero {hero && <span className="cs-sub">— {hero.name} (A{hero.stats?.A ?? 0} D{hero.stats?.D ?? 0})</span>}</div>
          <HeroGrid fac={fac} value={side === 'a' ? aHeroId : dHeroId} onChange={setHeroId} allowNone />
        </div>

        <div className="cs-field">
          <div className="cs-lbl">Unit {unit && <span className="cs-sub">— T{unit.tier}{variantTag(unit.variant)} {unit.name}</span>}</div>
          <UnitGrid fac={fac} value={side === 'a' ? aUnitId : dUnitId} onChange={setUnitId} />
        </div>

        {unit && (
          <div className="cs-statline">
            <span><b>HP</b> {unit.hp}</span>
            <span><b>Off</b> {unit.off}</span>
            <span><b>Def</b> {unit.def}</span>
            <span><b>Dmg</b> {unit.dmgMin === unit.dmgMax ? unit.dmgMin : `${unit.dmgMin}–${unit.dmgMax}`}</span>
            <span><b>Init</b> {unit.init}</span>
            <span><b>Spd</b> {unit.speed}</span>
          </div>
        )}

        <div className="cs-inline-row">
          <label>Stack
            <input type="number" min="1" className="cs-num"
                   value={count} onChange={e => setCount(e.target.value)} /></label>
          <label>Hero ATK
            <input type="number" className="cs-num"
                   value={heroAtk} onChange={e => setHeroAtk(e.target.value)} /></label>
          <label>Hero DEF
            <input type="number" className="cs-num"
                   value={heroDef} onChange={e => setHeroDef(e.target.value)} /></label>
        </div>

        <div className="cs-inline-row">
          <label className="cs-skill">{skillLabel}
            <SkillSelect value={skillVal} onChange={setSkill} kind={skillKind} /></label>
        </div>
      </div>
    );
  };

  const aHero = D.HEROES.find(x => x.id === aHeroId);
  const dHero = D.HEROES.find(x => x.id === dHeroId);

  return (
    <>
      <h1>Combat simulator</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Pick a faction, hero, and unit per side. Damage = base × <code>(20+ATK)/(20+DEF)</code> ×
        offense × defense-reduction × lucky-strike, all multiplicative.
      </p>

      <div className="cs-grid">
        <Side side="a" fac={aFac} unit={A} hero={aHero}
              count={aCount} setCount={setACount}
              heroAtk={aHeroAtk} setHeroAtk={setAHeroAtk}
              heroDef={aHeroDef} setHeroDef={setAHeroDef}
              skillLabel="Offense skill" skillVal={aOffense} setSkill={setAOffense} skillKind="off" />

        <div className="cs-vs">
          <button type="button" className="cs-swap" onClick={swap} title="Swap sides">⇄</button>
          <div className="cs-vs-text">vs</div>
          <label className="cs-lucky">
            <input type="checkbox" checked={lucky} onChange={e => setLucky(e.target.checked)} />
            <span>Lucky <span className="cs-mul">×1.5</span></span>
          </label>
        </div>

        <Side side="d" fac={dFac} unit={Z} hero={dHero}
              count={dCount} setCount={setDCount}
              heroAtk={dHeroAtk} setHeroAtk={setDHeroAtk}
              heroDef={dHeroDef} setHeroDef={setDHeroDef}
              skillLabel="Defense skill" skillVal={dDefense} setSkill={setDDefense} skillKind="def" />
      </div>

      {A && Z && (
        <section className="hero-section cs-result">
          <h2>Result</h2>
          <table className="cs-breakdown">
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
              <tr className="cs-total-row">
                <td>Total multiplier</td>
                <td className="mono"><b>×{totalMul.toFixed(3)}</b></td>
              </tr>
              <tr><td>Per-attacker damage</td>
                  <td className="mono">{A.dmgMin}–{A.dmgMax} × {totalMul.toFixed(3)} = <b>{perMin.toFixed(2)}–{perMax.toFixed(2)}</b></td></tr>
              <tr><td>Stack damage</td>
                  <td className="mono">{stack} × ({perMin.toFixed(2)}–{perMax.toFixed(2)})</td></tr>
            </tbody>
          </table>

          <div className="cs-final">
            <div className="cs-final-block">
              <div className="cs-final-lbl">Damage dealt</div>
              <div className="cs-final-val">{totMin.toLocaleString()}–{totMax.toLocaleString()}</div>
              <div className="cs-final-sub">avg ≈ {totAvg.toLocaleString()}</div>
            </div>
            <div className="cs-final-block">
              <div className="cs-final-lbl">{Z.name} killed</div>
              <div className="cs-final-val">{killedMin}–{killedMax}</div>
              <div className="cs-final-sub">of {dCount} ({dHp.toLocaleString()} HP total)</div>
            </div>
            <div className="cs-final-block">
              <div className="cs-final-lbl">Stack remaining</div>
              <div className="cs-final-val">{remainMin.toLocaleString()}–{remainMax.toLocaleString()} HP</div>
              <div className="cs-final-sub">≈ {Math.max(0, dCount - killedMax)}–{Math.max(0, dCount - killedMin)} alive</div>
            </div>
          </div>

          <p className="cs-caveat">
            MVP — does not yet model: ranged distance penalty, melee counterattack,
            unit passives (Double Strike, Hate-X, etc.), spell buffs/debuffs (Bless,
            Curse, Stoneskin), terrain, morale, or hero specialty bonuses. Apply
            such effects manually via the Hero ATK / Hero DEF inputs.
          </p>
        </section>
      )}
    </>
  );
};

window.CombatView = CombatView;
