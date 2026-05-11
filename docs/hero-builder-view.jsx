/* Hero builder MVP — pick faction → hero, project stats by level, browse
   the class's skill-roll table.

   URL state: /builder/<hero_id>?lvl=N. State is shareable.

   Scope: planner, not simulator. The game's level-up roll is probabilistic;
   we surface expected stat growth (rollPre/rollPost × levels) and the raw
   skill-chance weights so users can see what's *likely* to be offered.
*/

const HeroBuilderView = ({ heroId, initialQuery, go }) => {
  const D = window.OE_DATA;
  const C = window.OE_CLASSES_DATA;
  if (!D || !C) return <p>Builder data not loaded.</p>;

  // ---- state from URL ----
  const initial = React.useMemo(() => {
    const sp = new URLSearchParams(initialQuery || '');
    const lvl = parseInt(sp.get('lvl') || '', 10);
    return { lvl: Number.isFinite(lvl) ? Math.max(1, Math.min(40, lvl)) : 12 };
  }, [heroId]);

  const [level, setLevel] = React.useState(initial.lvl);
  React.useEffect(() => setLevel(initial.lvl), [heroId]);

  // Sync URL → ?lvl=N (replaceState so we don't pollute history).
  React.useEffect(() => {
    if (!heroId) return;
    const url = window.OE_routeToUrl(`builder/${heroId}` + (level !== 12 ? `?lvl=${level}` : ''));
    if (window.location.pathname + window.location.search !== url) {
      history.replaceState(null, '', url);
    }
  }, [heroId, level]);

  // ---- no hero picked → faction grid ----
  if (!heroId) {
    return <HeroPicker D={D} go={go} />;
  }

  const hero = D.HEROES.find(h => h.id === heroId);
  if (!hero) {
    return (
      <>
        <p>Unknown hero <code>{heroId}</code>.</p>
        <p><a href={window.OE_routeToUrl('builder')}
              onClick={(e)=>{e.preventDefault();go('builder');}}>← All heroes</a></p>
      </>
    );
  }

  // Find this hero's class entry in classes.json.
  const cls = C.CLASSES.find(c =>
    c.factionId === ({temple:'human', necropolis:'undead', grove:'nature',
                      hive:'demon', schism:'unfrozen', dungeon:'dungeon'})[hero.faction]
    && c.classType === hero.kind);
  if (!cls) return <p>No class table for {hero.name}.</p>;

  const fmeta = D.FACTIONS.find(f => f.id === hero.faction);

  // ---- expected stat projection ----
  // Each level after L1 grants one stat point. Below the breakpoint use
  // rollPre weights, at/above use rollPost. Expected stats = starting +
  // sum_{l=2..level} (roll for that level). Display as a fractional projection.
  const breakpoint = cls.breakpoint || 24;
  const projection = React.useMemo(() => {
    const stats = { ...hero.stats };
    for (let l = 2; l <= level; l++) {
      const w = l < breakpoint ? cls.rollPre : cls.rollPost;
      for (const k of ['A','D','P','K']) stats[k] += w[k] || 0;
    }
    return stats;
  }, [hero, level, cls]);

  // Format with one decimal when fractional, integer otherwise.
  const fmtStat = (n) => Number.isInteger(n) ? n.toString() : n.toFixed(1);

  // ---- skill weights, sorted by chance descending ----
  const skillTotal = cls.skills.reduce((a, s) => a + s.chance, 0)
    + (cls.factionSkill?.chance || 0);
  const skills = [...cls.skills, ...(cls.factionSkill
    ? [{key: 'faction', name: cls.factionSkill.name, group: 'utility',
       chance: cls.factionSkill.chance, isFaction: true}] : [])]
    .filter(s => s.chance > 0)
    .sort((a, b) => b.chance - a.chance);

  // Mark which skills the hero starts with.
  const startingSkillNames = new Set((hero.skills || []).map(s => s.split(' L')[0]));

  return (
    <>
      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl('builder')}
           onClick={(e)=>{e.preventDefault();go('builder');}}
           className="faction-page-cta">← All heroes</a>
      </p>

      <div className="hero-page-head">
        <img loading="lazy" className="hero-page-portrait"
             src={`img/heroes/${hero.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="hero-page-titles">
          <h1 className="hero-page-name">{hero.name}</h1>
          <div className="hero-page-class">
            {fmeta && <span className={`faction-pill faction-${hero.faction}`}>{fmeta.name}</span>}{' '}
            <span className="mono">{cls.name}</span>
            {' · '}<em>{hero.specialty}</em>
          </div>
        </div>
      </div>

      {/* ---- level slider + stats projection ---- */}
      <section className="hb-section">
        <div className="hb-level-head">
          <h2>Stats at level <span className="hb-level-val">{level}</span></h2>
          {level >= breakpoint && (
            <span className="hb-bp-note">post-{breakpoint} stat distribution</span>
          )}
        </div>
        <div className="hb-level-control">
          <input type="range" min="1" max="40"
                 value={level} onChange={(e) => setLevel(parseInt(e.target.value, 10))}
                 className="hb-slider" />
          <div className="hb-level-ticks">
            {[1, 6, 12, 18, breakpoint, 30, 40].map(n => (
              <button key={n}
                      className={'hb-tick' + (level === n ? ' active' : '')}
                      onClick={() => setLevel(n)}>
                {n === breakpoint ? `L${n}†` : `L${n}`}
              </button>
            ))}
          </div>
        </div>
        <div className="hb-stats">
          {[['A','Attack'],['D','Defense'],['P','Power'],['K','Knowledge']].map(([k, lbl]) => (
            <div key={k} className="hb-stat">
              <div className="hb-stat-lbl">{lbl}</div>
              <div className="hb-stat-val">{fmtStat(projection[k])}</div>
              <div className="hb-stat-base">start {hero.stats[k]}</div>
            </div>
          ))}
        </div>
        <p className="hb-foot mono">
          {level === 1
            ? 'Starting stats. Each level-up grants 1 point in one of the four stats.'
            : `Expected after ${level - 1} level-up rolls. † = post-${breakpoint} distribution kicks in at L${breakpoint}.`}
        </p>
      </section>

      {/* ---- starting army + spells + skills (factual baseline) ---- */}
      <section className="hb-section">
        <h2>Starting baseline</h2>
        <div className="hb-base-grid">
          <div className="hb-base-block">
            <div className="hb-base-eyebrow">Skills</div>
            <div className="hb-chips">
              {(hero.skills || []).map(s => (
                <span key={s} className="hb-chip">{s}</span>
              ))}
            </div>
          </div>
          {hero.spells?.length > 0 && (
            <div className="hb-base-block">
              <div className="hb-base-eyebrow">Spells</div>
              <div className="hb-chips">
                {hero.spells.map(sp => (
                  <a key={sp.id} className={'hb-chip hb-chip-spell' + (sp.masterful ? ' masterful' : '')}
                     href={window.OE_routeToUrl(`spell/${sp.id}`)}
                     onClick={(e) => { e.preventDefault(); go(`spell/${sp.id}`); }}>
                    {sp.masterful && <em>Masterful</em>}{sp.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          {hero.armySegs?.length > 0 && (
            <div className="hb-base-block">
              <div className="hb-base-eyebrow">Army</div>
              <div className="hb-chips">
                {hero.armySegs.map(seg => (
                  <a key={seg.id} className="hb-chip"
                     href={window.OE_routeToUrl(`unit/${seg.id}`)}
                     onClick={(e) => { e.preventDefault(); go(`unit/${seg.id}`); }}>
                    <span className="hb-army-count mono">{seg.min}–{seg.max}</span> {seg.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {hero.specDesc && (
          <p className="hb-spec mono">
            <b>{hero.specialty}.</b>{' '}
            {hero.specDesc.replace(/\{[0-9]+\}/g, '?')}
          </p>
        )}
      </section>

      {/* ---- skill roll table (chance the game offers each skill on a level-up) ---- */}
      <section className="hb-section">
        <h2>Skill roll table</h2>
        <p className="hb-note">
          Each level-up offers 2 skills picked by weighted random. Probabilities
          shown assume every skill is still eligible — once you reach L3 in a
          skill it drops out of the pool, raising the others.
        </p>
        <table className="hb-skill-table">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Group</th>
              <th className="hb-num">Weight</th>
              <th className="hb-num">Single-roll chance</th>
            </tr>
          </thead>
          <tbody>
            {skills.map(s => {
              const starting = startingSkillNames.has(s.name);
              const pct = (100 * s.chance / skillTotal).toFixed(1);
              return (
                <tr key={s.key} className={starting ? 'hb-skill-starting' : ''}>
                  <td>
                    <span className={`hb-skill-dot hb-skill-${s.group}`} />
                    {s.name}
                    {starting && <span className="hb-skill-tag">starting</span>}
                  </td>
                  <td className="hb-skill-group">{s.group}</td>
                  <td className="hb-num mono">{s.chance}</td>
                  <td className="hb-num mono">{pct}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};

// ---- hero picker (faction → hero grid) ----
const HeroPicker = ({ D, go }) => {
  const [faction, setFaction] = React.useState('temple');
  const heroes = D.HEROES.filter(h => h.faction === faction)
                          .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <h1>Hero builder</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Plan a hero's stat trajectory and see what the level-up roll table looks
        like for their class. Shareable via URL. <em>(MVP — no skill/artifact/army
        loadout editing yet.)</em>
      </p>
      <div className="hb-fac-row">
        {D.FACTIONS.map(f => (
          <button key={f.id} type="button"
                  className={`cs-fac-pill faction-${f.id}${faction === f.id ? ' selected' : ''}`}
                  onClick={() => setFaction(f.id)}>
            <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                 onError={(e)=>{e.target.style.visibility='hidden';}} />
            <span>{f.name}</span>
          </button>
        ))}
      </div>
      <div className="hb-hero-grid">
        {heroes.map(h => (
          <a key={h.id}
             className={`hb-hero-card hb-${h.kind}`}
             href={window.OE_routeToUrl(`builder/${h.id}`)}
             onClick={(e) => { e.preventDefault(); go(`builder/${h.id}`); }}
             title={`${h.name} — ${h.specialty}`}>
            <img loading="lazy" className="hb-hero-portrait"
                 src={`img/heroes/${h.id}.png`} alt=""
                 onError={(e)=>{e.target.style.visibility='hidden';}} />
            <div className="hb-hero-name">{h.name}</div>
            <div className="hb-hero-spec">{h.specialty}</div>
          </a>
        ))}
      </div>
    </>
  );
};

window.HeroBuilderView = HeroBuilderView;
