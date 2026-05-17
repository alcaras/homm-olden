/* Astrology & Insight planner.

   Cities produce Astrology points daily. Accumulated points raise your
   Astrology Level; each level past the first grants 1 Insight. Insight is
   spent to unlock + upgrade the high Neutral Global-Map spells.

   This page lets you set a daily production rate, projects when you'll
   reach each Insight, and lets you build a spell shopping list to see the
   total Insight (and the day) needed to afford it.
*/

const SKILL_LVL_AFTER = { 1: 'learn', 2: '→ L2', 3: '→ L3', 4: '→ L4' };

const AstrologyView = ({ go }) => {
  const A = window.OE_ASTROLOGY_DATA;
  if (!A) return <p>Astrology data not loaded.</p>;
  const D = window.OE_DATA;

  // ladder[i] = cumulative astrology XP to reach Astrology Level (i+1).
  // Insight earned = (level - 1): level 1 @ 0 XP = 0 insight, level 2 = 1, …
  const ladder = A.LADDER;

  const [centralLvl, setCentralLvl] = React.useState(1);
  const [lawFaction, setLawFaction] = React.useState('temple');
  const [lawOn, setLawOn] = React.useState(false);
  const [cities, setCities] = React.useState(1);
  const [extra, setExtra] = React.useState(0);
  const [plan, setPlan] = React.useState({}); // { spellId: targetLevel(1..4) }

  const lawsByFaction = React.useMemo(() => {
    const g = {};
    for (const l of A.LAWS) (g[l.faction] = g[l.faction] || []).push(l);
    // Highest-level entry per faction is the full per-day amount.
    for (const k of Object.keys(g)) g[k].sort((a, b) => b.perDay - a.perDay);
    return g;
  }, [A]);
  const lawForFaction = lawsByFaction[lawFaction]?.[0];

  const perCity = A.CENTRAL_BUILDING[centralLvl - 1]
    + (lawOn && lawForFaction ? lawForFaction.perDay : 0);
  const dailyRate = perCity * Math.max(1, cities) + Math.max(0, Number(extra) || 0);

  // Insight available after `day` days at the current rate.
  const insightAfterDays = (day) => {
    const xp = dailyRate * day;
    let lvl = 1;
    for (let i = 0; i < ladder.length; i++) if (xp >= ladder[i]) lvl = i + 1;
    return lvl - 1;
  };
  // Day you first reach `n` Insight (ceil of cumulative XP / rate).
  const dayForInsight = (n) => {
    if (n <= 0) return 0;
    const need = ladder[n] ?? ladder[ladder.length - 1]; // ladder[level-1]; insight n => level n+1 => index n
    return dailyRate > 0 ? Math.ceil(need / dailyRate) : Infinity;
  };

  // --- spell plan totals ---
  const spellById = Object.fromEntries(A.SPELLS.map(s => [s.id, s]));
  const insightForSpell = (s, target) => {
    if (!target) return 0;
    let c = s.insightLearn;
    for (let i = 0; i < target - 1; i++) c += s.insightUpgrades[i] || 0;
    return c;
  };
  const planTotal = Object.entries(plan)
    .reduce((sum, [id, t]) => sum + insightForSpell(spellById[id], t), 0);

  // Min Astrology Level (→ Insight) that affords the plan, and the day.
  const insightNeeded = planTotal;
  const dayForPlan = dayForInsight(insightNeeded);

  const cycleSpell = (s) => {
    setPlan(prev => {
      const cur = prev[s.id] || 0;
      const max = 1 + s.insightUpgrades.length; // learn + each upgrade
      const next = cur >= max ? 0 : cur + 1;
      const out = { ...prev };
      if (next === 0) delete out[s.id]; else out[s.id] = next;
      return out;
    });
  };

  const FACTIONS = D?.FACTIONS || [];

  return (
    <>
      <h1>Astrology &amp; Insight</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Cities generate <b>Astrology points</b> every day. Accumulated points
        raise your <b>Astrology Level</b>; each level grants one <b>Insight</b>.
        Insight is spent to unlock and upgrade the high Neutral Global-Map
        spells (Town Portal, Dimension Door, etc.). This planner projects when
        you'll reach each Insight and what a spell shopping list costs.
      </p>

      {/* === Production === */}
      <section className="astro-section">
        <h2>Daily astrology production</h2>
        <div className="astro-controls">
          <div className="astro-field">
            <label>Central building</label>
            <div className="seg">
              {A.CENTRAL_BUILDING.map((v, i) => (
                <button key={i} className={centralLvl === i + 1 ? 'active' : ''}
                        onClick={() => setCentralLvl(i + 1)}>
                  L{i + 1} · {v}/day
                </button>
              ))}
            </div>
          </div>
          <div className="astro-field">
            <label>Astrology law</label>
            <label className="astro-check">
              <input type="checkbox" checked={lawOn}
                     onChange={e => setLawOn(e.target.checked)} />
              <span>
                {lawForFaction
                  ? `${lawForFaction.name} (+${lawForFaction.perDay}/day, ${lawForFaction.lpCost} LP)`
                  : 'none'}
              </span>
            </label>
            <select className="cs-select astro-fac" value={lawFaction}
                    onChange={e => setLawFaction(e.target.value)}>
              {FACTIONS.filter(f => lawsByFaction[f.id]).map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div className="astro-field">
            <label>Cities</label>
            <input type="number" min="1" className="cs-num"
                   value={cities} onChange={e => setCities(Math.max(1, +e.target.value || 1))} />
          </div>
          <div className="astro-field">
            <label>Other +/day</label>
            <input type="number" min="0" className="cs-num"
                   value={extra} onChange={e => setExtra(Math.max(0, +e.target.value || 0))} />
          </div>
        </div>
        <div className="astro-rate">
          <span className="astro-rate-val">{dailyRate.toLocaleString()}</span>
          <span className="astro-rate-lbl">astrology points / day</span>
        </div>
      </section>

      {/* === Insight projection ladder === */}
      <section className="astro-section">
        <h2>Insight ladder</h2>
        <p className="hb-note">
          Each Astrology Level grants 1 Insight. Cumulative astrology XP and the
          day you'd reach it at the rate above.
        </p>
        <table className="astro-table">
          <thead>
            <tr>
              <th>Insight</th><th className="astro-num">Astrology XP</th>
              <th className="astro-num">+ from prev</th><th className="astro-num">Day reached</th>
            </tr>
          </thead>
          <tbody>
            {ladder.slice(1).map((cum, i) => {
              const insight = i + 1;
              const prev = ladder[i];
              const day = dailyRate > 0 ? Math.ceil(cum / dailyRate) : Infinity;
              const affordsPlan = insight === insightNeeded;
              return (
                <tr key={insight}
                    className={affordsPlan ? 'astro-row-plan' : ''}>
                  <td><b>{insight}</b></td>
                  <td className="astro-num mono">{cum.toLocaleString()}</td>
                  <td className="astro-num mono">+{(cum - prev).toLocaleString()}</td>
                  <td className="astro-num mono">
                    {day === Infinity ? '—' : `day ${day}`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* === Insight shop === */}
      <section className="astro-section">
        <h2>Global-Map spells — Insight cost</h2>
        <p className="hb-note">
          Click a spell to cycle: <b>learn</b> → L2 → L3 → L4 → off. Costs are
          cumulative Insight (learn + each upgrade).
        </p>
        <div className="astro-spells">
          {A.SPELLS.map(s => {
            const target = plan[s.id] || 0;
            const max = 1 + s.insightUpgrades.length;
            const spent = insightForSpell(s, target);
            return (
              <button key={s.id}
                      className={'astro-spell' + (target ? ' picked' : '')}
                      onClick={() => cycleSpell(s)}>
                <img loading="lazy" className="astro-spell-icon"
                     src={`img/spells/${s.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <div className="astro-spell-body">
                  <div className="astro-spell-head">
                    <span className="astro-spell-name">{s.name}</span>
                    <span className="astro-spell-rank">rank {s.rank}</span>
                  </div>
                  <div className="astro-spell-desc">{s.desc}</div>
                  <div className="astro-spell-cost">
                    <span className="astro-cost-chip">learn {s.insightLearn}</span>
                    {s.insightUpgrades.map((u, i) => (
                      <span key={i}
                            className={'astro-cost-chip' + (target >= i + 2 ? ' on' : '')}>
                        L{i + 2} +{u}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="astro-spell-state">
                  {target === 0 ? '—'
                    : target === 1 ? 'Learned'
                    : `L${target}`}
                  {target > 0 && <span className="astro-spell-spent">{spent} insight</span>}
                </div>
              </button>
            );
          })}
        </div>

        {insightNeeded > 0 && (
          <div className="astro-plan-summary">
            <div>
              <span className="astro-plan-big">{insightNeeded}</span>
              <span className="astro-plan-lbl">Insight needed</span>
            </div>
            <div>
              <span className="astro-plan-big">
                {dayForPlan === Infinity ? '—' : dayForPlan}
              </span>
              <span className="astro-plan-lbl">
                day affordable {dailyRate > 0
                  ? `(${(insightNeeded ? ladder[insightNeeded] : 0).toLocaleString()} XP)`
                  : '(set a rate)'}
              </span>
            </div>
            <button className="hb-btn hb-btn-sm" onClick={() => setPlan({})}>Clear plan</button>
          </div>
        )}
      </section>

      <p className="combat-caveat">
        Reaching Insight <i>n</i> means hitting Astrology Level <i>n</i>+1
        (Level 1 at 0 XP grants no Insight). Production figures: central
        building L1/L2/L3 = {A.CENTRAL_BUILDING.join('/')} per day; the
        astrology law adds its per-day amount on top. Map objects and rewards
        can also grant Astrology XP or Insight directly — not modelled here.
      </p>
    </>
  );
};

window.AstrologyView = AstrologyView;
