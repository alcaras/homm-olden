/* Astrology & Insight planner.

   Cities produce Astrology points daily. Accumulated points raise your
   Astrology Level; each level past the first grants 1 Insight. Insight is
   spent to unlock + upgrade the high Neutral Global-Map spells.

   You schedule, per city, the day you finish each central-building level
   and the optional astrology upgrade, plus the day you enact the astrology
   law. The projection integrates that day-by-day so the Insight ladder
   reflects an actual build order, not a flat rate.
*/

// HOMM calendar: 7 days / week, 4 weeks / month (28 days / month).
const _cal = (d) => {
  const z = d - 1;
  return { m: Math.floor(z / 28) + 1, w: Math.floor((z % 28) / 7) + 1, d: (z % 7) + 1 };
};
// "M4 W2 D2 (day 93)"
const fmtDay = (d) => {
  if (!isFinite(d) || d <= 0) return '—';
  const c = _cal(d);
  return `M${c.m} W${c.w} D${c.d} (day ${d})`;
};
// Compact "M4·W2·D2" for inline captions.
const fmtDayShort = (d) => {
  if (!isFinite(d) || d <= 0) return '';
  const c = _cal(d);
  return `M${c.m}·W${c.w}·D${c.d}`;
};
const parseDay = (v) => {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : 0; // 0 = never
};

const AstrologyView = ({ go }) => {
  const A = window.OE_ASTROLOGY_DATA;
  if (!A) return <p>Astrology data not loaded.</p>;
  const D = window.OE_DATA;

  // ladder[i] = cumulative astrology XP to reach Astrology Level (i+1).
  // Insight earned = (level - 1): level 1 @ 0 XP = 0 insight, level 2 = 1, …
  const ladder = A.LADDER;
  const SIM_CAP = 1095; // 3 in-game years

  // Per city: the day each upgrade completes ('' = never; L1 is day 1).
  const blankCity = () => ({ l2: '', l3: '', opt: '' });
  const [cityList, setCityList] = React.useState([blankCity()]);
  const [lawFaction, setLawFaction] = React.useState('temple');
  const [lawDay, setLawDay] = React.useState('');     // '' = never enacted
  const [extra, setExtra] = React.useState(0);
  const [plan, setPlan] = React.useState({});         // { spellId: targetLevel }

  const setCityCount = (n) => {
    n = Math.max(1, Math.min(5, n));
    setCityList(prev => {
      const out = prev.slice(0, n);
      while (out.length < n) out.push(blankCity());
      return out;
    });
  };
  const setCity = (i, patch) =>
    setCityList(prev => prev.map((c, idx) => idx === i ? { ...c, ...patch } : c));

  const lawsByFaction = React.useMemo(() => {
    const g = {};
    for (const l of A.LAWS) (g[l.faction] = g[l.faction] || []).push(l);
    for (const k of Object.keys(g)) g[k].sort((a, b) => b.perDay - a.perDay);
    return g;
  }, [A]);
  const lawForFaction = lawsByFaction[lawFaction]?.[0];
  const lawEnactDay = parseDay(lawDay);

  // Central-building level for a city on day `d` given its schedule.
  const cityLevelOnDay = (c, d) => {
    const l2 = parseDay(c.l2), l3 = parseDay(c.l3);
    if (l3 && d >= l3) return 3;
    if (l2 && d >= l2) return 2;
    return 1;
  };
  const cityRateOnDay = (c, d) => {
    const lvl = cityLevelOnDay(c, d);
    const base = A.CENTRAL_BUILDING[lvl - 1] || 0;
    const optDay = parseDay(c.opt);
    const opt = (optDay && d >= optDay) ? (A.CENTRAL_OPTIONAL[lvl - 1] || 0) : 0;
    return base + opt;
  };
  const rateOnDay = (d) => {
    let r = 0;
    for (const c of cityList) r += cityRateOnDay(c, d);
    if (lawEnactDay && d >= lawEnactDay && lawForFaction) r += lawForFaction.perDay;
    r += Math.max(0, Number(extra) || 0);
    return r;
  };

  // Simulate cumulative astrology XP day by day; record the first day each
  // Insight threshold is crossed. insightDay[n] = day you reach n Insight.
  const sim = React.useMemo(() => {
    const insightDay = new Array(ladder.length).fill(Infinity);
    let cum = 0, nextLvl = 1; // next ladder index to cross
    const cumByDay = [0];
    for (let day = 1; day <= SIM_CAP; day++) {
      cum += rateOnDay(day);
      cumByDay[day] = cum;
      while (nextLvl < ladder.length && cum >= ladder[nextLvl]) {
        insightDay[nextLvl] = day; // insight count == ladder index
        nextLvl++;
      }
      if (nextLvl >= ladder.length) break;
    }
    return { insightDay, cumByDay, finalCum: cum };
  }, [cityList, lawDay, lawFaction, extra, A]);

  const dayForInsight = (n) =>
    n <= 0 ? 0 : (sim.insightDay[n] ?? Infinity);

  // --- spell plan ---
  const spellById = Object.fromEntries(A.SPELLS.map(s => [s.id, s]));
  const maxTargetFor = (s) => 1 + (s.insightUpgrades?.length || 0); // learn + upgrades
  const insightForSpell = (s, target) => {
    if (!s || !target) return 0;
    const t = Math.max(0, Math.min(target, maxTargetFor(s)));
    let c = s.insightLearn;
    for (let i = 0; i < t - 1; i++) c += s.insightUpgrades[i] || 0;
    return c;
  };
  const planTotal = Object.entries(plan)
    .reduce((sum, [id, t]) => sum + insightForSpell(spellById[id], t), 0);
  const insightNeeded = planTotal;
  const dayForPlan = dayForInsight(insightNeeded);

  const cycleSpell = (s) => {
    setPlan(prev => {
      const max = maxTargetFor(s);                 // hard cap (4 for these)
      const cur = Math.min(prev[s.id] || 0, max);
      const next = cur >= max ? 0 : cur + 1;        // 0→1→…→max→0
      const out = { ...prev };
      if (next === 0) delete out[s.id]; else out[s.id] = next;
      return out;
    });
  };

  const FACTIONS = D?.FACTIONS || [];
  const endRate = rateOnDay(SIM_CAP);

  // Small day-input with M·W·D caption.
  const DayInput = ({ label, value, onChange, placeholder }) => {
    const dn = parseDay(value);
    return (
      <div className="astro-dayfield">
        <label>{label}</label>
        <input type="number" min="1" className="cs-num astro-dayinput"
               placeholder={placeholder || 'never'}
               value={value} onChange={e => onChange(e.target.value)} />
        <span className="astro-daycap">{dn ? fmtDayShort(dn) : '—'}</span>
      </div>
    );
  };

  return (
    <>
      <h1>Astrology &amp; Insight</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Cities generate <b>Astrology points</b> daily. Accumulated points raise
        your <b>Astrology Level</b>; each level grants one <b>Insight</b>, spent
        to unlock and upgrade the high Neutral Global-Map spells. Schedule your
        build order below — the Insight ladder integrates it day by day.
      </p>

      {/* === Build schedule === */}
      <section className="astro-section">
        <div className="astro-section-head">
          <h2>Build schedule</h2>
          <div className="astro-citycount">
            <label>Cities</label>
            <div className="seg">
              {[1,2,3,4,5].map(n => (
                <button key={n} className={cityList.length === n ? 'active' : ''}
                        onClick={() => setCityCount(n)}>{n}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="astro-cities">
          {cityList.map((c, i) => {
            const endLvl = cityLevelOnDay(c, SIM_CAP);
            return (
              <div key={i} className="astro-city">
                <span className="astro-city-tag">City {i + 1}</span>
                <DayInput label="Build Lvl 2" value={c.l2}
                          onChange={v => setCity(i, { l2: v })} />
                <DayInput label="Build Lvl 3" value={c.l3}
                          onChange={v => setCity(i, { l3: v })} />
                <DayInput label="Optional upg." value={c.opt}
                          onChange={v => setCity(i, { opt: v })} />
                <span className="astro-city-out mono">
                  ends {cityRateOnDay(c, SIM_CAP).toLocaleString()}/day
                  <span className="astro-city-sub">L1 from day 1 · now L{endLvl}</span>
                </span>
              </div>
            );
          })}
        </div>

        <div className="astro-lawrow">
          <div className="astro-dayfield">
            <label>Astrology law enacted</label>
            <input type="number" min="1" className="cs-num astro-dayinput"
                   placeholder="not taken"
                   value={lawDay} onChange={e => setLawDay(e.target.value)} />
            <span className="astro-daycap">{lawEnactDay ? fmtDayShort(lawEnactDay) : '—'}</span>
          </div>
          <select className="cs-select astro-fac" value={lawFaction}
                  onChange={e => setLawFaction(e.target.value)}>
            {FACTIONS.filter(f => lawsByFaction[f.id]).map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
          <span className="astro-law-note">
            {lawForFaction
              ? `${lawForFaction.name}: +${lawForFaction.perDay}/day · ${lawForFaction.lpCost} LP`
              : 'no astrology law for this faction'}
          </span>
          <div className="astro-dayfield">
            <label>Other +/day (flat)</label>
            <input type="number" min="0" className="cs-num astro-dayinput"
                   value={extra} onChange={e => setExtra(Math.max(0, +e.target.value || 0))} />
          </div>
        </div>

        <div className="astro-rate">
          <span className="astro-rate-val">{endRate.toLocaleString()}</span>
          <span className="astro-rate-lbl">
            astrology / day once everything above is built
          </span>
        </div>
      </section>

      {/* === Insight ladder === */}
      <section className="astro-section">
        <h2>Insight ladder</h2>
        <p className="hb-note">
          Each Astrology Level grants 1 Insight. Day reached is simulated from
          your build schedule (compounding daily production).
        </p>
        <table className="astro-table">
          <thead>
            <tr>
              <th>Insight</th><th className="astro-num">Astrology XP</th>
              <th className="astro-num">+ from prev</th><th>Reached</th>
            </tr>
          </thead>
          <tbody>
            {ladder.slice(1).map((cum, i) => {
              const insight = i + 1;
              const prev = ladder[i];
              const day = sim.insightDay[insight];
              const affordsPlan = insight === insightNeeded;
              return (
                <tr key={insight} className={affordsPlan ? 'astro-row-plan' : ''}>
                  <td><b>{insight}</b></td>
                  <td className="astro-num mono">{cum.toLocaleString()}</td>
                  <td className="astro-num mono">+{(cum - prev).toLocaleString()}</td>
                  <td className="mono">{fmtDay(day)}</td>
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
            const target = Math.min(plan[s.id] || 0, maxTargetFor(s));
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
                    <span className={'astro-cost-chip' + (target >= 1 ? ' on' : '')}>
                      learn {s.insightLearn}
                    </span>
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
                {dayForPlan === Infinity ? '—' : fmtDayShort(dayForPlan)}
              </span>
              <span className="astro-plan-lbl">
                {dayForPlan === Infinity
                  ? 'not reached within 3 years'
                  : `affordable ${fmtDay(dayForPlan)}`}
              </span>
            </div>
            <button className="hb-btn hb-btn-sm" onClick={() => setPlan({})}>Clear plan</button>
          </div>
        )}
      </section>

      <p className="combat-caveat">
        Reaching Insight <i>n</i> means hitting Astrology Level <i>n</i>+1
        (Level 1 at 0 XP grants no Insight). Central building L1/L2/L3 =
        {' '}{A.CENTRAL_BUILDING.join('/')}/day; the optional upgrade adds
        {' '}{A.CENTRAL_OPTIONAL.filter(Boolean).join('/')}/day at L2/L3
        (n/a at L1). Calendar = 7 days/week, 4 weeks/month. Map objects and
        rewards can also grant Astrology XP or Insight directly — not modelled.
      </p>
    </>
  );
};

window.AstrologyView = AstrologyView;
