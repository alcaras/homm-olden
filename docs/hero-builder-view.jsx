/* Hero builder — interactive level-up simulator.

   Each level-up does two things in the game:
     1. One stat (Attack/Defense/Power/Knowledge) goes up by 1, picked by a
        weighted random roll over the class table (rollPre24 below the L24
        breakpoint, rollPost24 at/after).
     2. The game offers two skills drawn from the eligible pool weighted by
        each skill's `chance`. Player picks one. The chosen skill advances
        from 0 → L1 (Basic), L1 → L2 (Advanced), L2 → L3 (Expert). At L3 the
        skill drops from the offer pool.

   We model both rolls and let the user pick from the offered pair.

   Scope: main skills only. Subskills are not modelled yet.
*/

const SKILL_LVL_LABEL = { 1: 'Basic', 2: 'Advanced', 3: 'Expert' };

// Weighted pick from a list of {chance, ...} entries.
const _weightedPick = (pool) => {
  const tot = pool.reduce((a, s) => a + s.chance, 0);
  if (tot <= 0) return null;
  let r = Math.random() * tot;
  for (const s of pool) { r -= s.chance; if (r <= 0) return s; }
  return pool[pool.length - 1];
};


const HeroBuilderView = ({ heroId, initialQuery, go }) => {
  const D = window.OE_DATA;
  const C = window.OE_CLASSES_DATA;
  if (!D || !C) return <p>Builder data not loaded.</p>;

  // ---- no hero picked → faction grid ----
  if (!heroId) return <HeroPicker D={D} go={go} />;

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

  const cls = C.CLASSES.find(c =>
    c.factionId === ({temple:'human', necropolis:'undead', grove:'nature',
                      hive:'demon', schism:'unfrozen', dungeon:'dungeon'})[hero.faction]
    && c.classType === hero.kind);
  if (!cls) return <p>No class table for {hero.name}.</p>;

  const fmeta = D.FACTIONS.find(f => f.id === hero.faction);
  const breakpoint = cls.breakpoint || 24;

  // Class's full skill pool (regular skills + faction skill).
  const fullSkillPool = React.useMemo(() => {
    const out = cls.skills.filter(s => s.chance > 0).map(s => ({...s}));
    if (cls.factionSkill?.chance > 0) {
      out.push({
        key: 'faction', name: cls.factionSkill.name,
        group: 'utility', chance: cls.factionSkill.chance, isFaction: true,
      });
    }
    return out;
  }, [cls]);

  // Parse the hero's starting skills (e.g., "Diplomacy L1") into a map.
  const initialSkills = React.useMemo(() => {
    const m = {};
    for (const s of (hero.skills || [])) {
      const match = s.match(/^(.*?) L(\d+)$/);
      if (match) m[match[1]] = parseInt(match[2], 10);
    }
    return m;
  }, [hero]);

  // ---- simulator state ----
  const initialState = React.useCallback(() => ({
    level: 1,
    stats: { ...hero.stats },
    skills: { ...initialSkills },
    pending: null,   // { stat, offered: [skill, skill], levelTarget }
    log: [],         // [{ level, stat, skillName, skillLvlAfter }]
  }), [hero, initialSkills]);

  const [sim, setSim] = React.useState(initialState);

  // Re-seed when hero changes.
  React.useEffect(() => { setSim(initialState()); }, [heroId]);

  // Active stat-roll table for the current level.
  const rollTable = React.useMemo(
    () => (sim.level + 1) < breakpoint ? cls.rollPre : cls.rollPost,
    [sim.level, breakpoint, cls]);

  // Eligible skills for the next offer = skill not yet at L3.
  const eligible = React.useMemo(() => {
    return fullSkillPool.filter(s => (sim.skills[s.name] || 0) < 3);
  }, [fullSkillPool, sim.skills]);

  // --- actions ---
  const rollLevelUp = () => {
    if (sim.pending) return;
    // Stat roll
    const tableEntries = [
      {key: 'A', chance: rollTable.A || 0},
      {key: 'D', chance: rollTable.D || 0},
      {key: 'P', chance: rollTable.P || 0},
      {key: 'K', chance: rollTable.K || 0},
    ];
    const stat = _weightedPick(tableEntries)?.key || 'K';
    // Skill offers — 2 distinct skills from eligible pool weighted by chance
    let pool = [...eligible];
    const offered = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const pick = _weightedPick(pool);
      if (!pick) break;
      offered.push(pick);
      pool = pool.filter(s => s.name !== pick.name);
    }
    setSim(prev => ({...prev, pending: { stat, offered, levelTarget: prev.level + 1 }}));
  };

  const pickSkill = (s) => {
    if (!sim.pending) return;
    setSim(prev => {
      const { stat, offered, levelTarget } = prev.pending;
      const newLvl = (prev.skills[s.name] || 0) + 1;
      return {
        ...prev,
        level: levelTarget,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
        skills: { ...prev.skills, [s.name]: newLvl },
        pending: null,
        log: [...prev.log, {
          level: levelTarget, stat,
          skillName: s.name, skillLvlAfter: newLvl, skillGroup: s.group,
        }],
      };
    });
  };

  const reroll = () => {
    if (!sim.pending) return;
    let pool = [...eligible];
    const offered = [];
    for (let i = 0; i < 2 && pool.length > 0; i++) {
      const pick = _weightedPick(pool);
      if (!pick) break;
      offered.push(pick);
      pool = pool.filter(s => s.name !== pick.name);
    }
    setSim(prev => ({...prev, pending: {...prev.pending, offered}}));
  };

  const undoLastLevel = () => {
    setSim(prev => {
      if (prev.pending) return {...prev, pending: null};
      if (prev.log.length === 0) return prev;
      const last = prev.log[prev.log.length - 1];
      // Reverse the change. For skills that drop back to 0, delete the key
      // unless it was a starting skill — preserve the starting level.
      const skills = {...prev.skills};
      const newLvl = (skills[last.skillName] || 0) - 1;
      const startingLvl = initialSkills[last.skillName] || 0;
      if (newLvl <= startingLvl) {
        if (startingLvl > 0) skills[last.skillName] = startingLvl;
        else delete skills[last.skillName];
      } else {
        skills[last.skillName] = newLvl;
      }
      return {
        ...prev,
        level: prev.level - 1,
        stats: { ...prev.stats, [last.stat]: prev.stats[last.stat] - 1 },
        skills,
        log: prev.log.slice(0, -1),
        pending: null,
      };
    });
  };

  const reset = () => setSim(initialState());

  // --- derived ---
  const STAT_LABEL = { A: 'Attack', D: 'Defense', P: 'Power', K: 'Knowledge' };
  const skillTotal = fullSkillPool.reduce((a, s) => a + s.chance, 0);

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

      {/* === Stats panel === */}
      <section className="hb-section">
        <div className="hb-level-head">
          <h2>Level <span className="hb-level-val">{sim.level}</span></h2>
          {sim.level + 1 >= breakpoint && (
            <span className="hb-bp-note">post-{breakpoint} roll table active from L{breakpoint}</span>
          )}
          <div className="hb-actions">
            {!sim.pending && (
              <button className="hb-btn hb-btn-primary" onClick={rollLevelUp}>
                Level up →
              </button>
            )}
            <button className="hb-btn" onClick={undoLastLevel}
                    disabled={sim.log.length === 0 && !sim.pending}>
              Undo
            </button>
            <button className="hb-btn" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className="hb-stats">
          {['A','D','P','K'].map(k => {
            const flashing = sim.pending?.stat === k;
            return (
              <div key={k} className={'hb-stat' + (flashing ? ' rolled' : '')}>
                <div className="hb-stat-lbl">{STAT_LABEL[k]}</div>
                <div className="hb-stat-val">
                  {sim.stats[k]}
                  {flashing && <span className="hb-stat-delta">+1</span>}
                </div>
                <div className="hb-stat-base">start {hero.stats[k]}</div>
              </div>
            );
          })}
        </div>
        <p className="hb-foot mono">
          Next-level stat-roll weights:
          {' '}A {Math.round(100 * (rollTable.A || 0))}%
          {' · '}D {Math.round(100 * (rollTable.D || 0))}%
          {' · '}P {Math.round(100 * (rollTable.P || 0))}%
          {' · '}K {Math.round(100 * (rollTable.K || 0))}%
        </p>
      </section>

      {/* === Skill offer prompt === */}
      {sim.pending && (
        <section className="hb-section hb-prompt">
          <h2>L{sim.pending.levelTarget} — pick a skill</h2>
          <p className="hb-note">
            Stat roll: <b>+1 {STAT_LABEL[sim.pending.stat]}</b>. Choose one of the offered skills:
          </p>
          {sim.pending.offered.length === 0 ? (
            <p className="hb-foot">All skills at Expert — no offers remaining.</p>
          ) : (
            <div className="hb-offers">
              {sim.pending.offered.map(s => {
                const cur = sim.skills[s.name] || 0;
                const nextLvl = cur + 1;
                return (
                  <button key={s.name}
                          className={`hb-offer hb-offer-${s.group}`}
                          onClick={() => pickSkill(s)}>
                    <span className={`hb-skill-dot hb-skill-${s.group}`} />
                    <span className="hb-offer-name">{s.name}</span>
                    <span className="hb-offer-lvl">
                      {cur === 0 ? 'New' : `L${cur} →`} {SKILL_LVL_LABEL[nextLvl]}
                    </span>
                    <span className="hb-offer-chance mono">
                      {(100 * s.chance / skillTotal).toFixed(1)}% weight
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button className="hb-btn hb-btn-sm" onClick={reroll}>Reroll offers</button>
        </section>
      )}

      {/* === Current skills === */}
      <section className="hb-section">
        <h2>Skills ({Object.keys(sim.skills).length})</h2>
        {Object.keys(sim.skills).length === 0 ? (
          <p className="hb-foot">No skills yet — level up to acquire.</p>
        ) : (
          <div className="hb-chips">
            {Object.entries(sim.skills)
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([name, lvl]) => {
                const grp = fullSkillPool.find(s => s.name === name)?.group || 'utility';
                const isStarting = (initialSkills[name] || 0) > 0;
                return (
                  <span key={name} className={`hb-skill-chip hb-skill-${grp}`}>
                    <span className={`hb-skill-dot hb-skill-${grp}`} />
                    {name} <b>L{lvl}</b>
                    {isStarting && <span className="hb-skill-tag">starting</span>}
                  </span>
                );
              })}
          </div>
        )}
      </section>

      {/* === Level log === */}
      {sim.log.length > 0 && (
        <section className="hb-section">
          <h2>Level-up log</h2>
          <table className="hb-log-table">
            <thead>
              <tr><th>Lvl</th><th>Stat</th><th>Skill picked</th></tr>
            </thead>
            <tbody>
              {sim.log.slice().reverse().map((row, i) => (
                <tr key={sim.log.length - i}>
                  <td className="mono">L{row.level}</td>
                  <td>+1 {STAT_LABEL[row.stat]}</td>
                  <td>
                    <span className={`hb-skill-dot hb-skill-${row.skillGroup}`} />
                    {row.skillName} → L{row.skillLvlAfter} ({SKILL_LVL_LABEL[row.skillLvlAfter]})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* === Starting baseline (read-only context) === */}
      <section className="hb-section">
        <h2>Starting baseline</h2>
        <div className="hb-base-grid">
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

      {/* === Skill roll table — reference === */}
      <section className="hb-section">
        <h2>Skill roll table (reference)</h2>
        <p className="hb-note">
          Single-roll probability over the full class skill pool. Picked skills
          that reach L3 (Expert) drop out and the others re-normalize.
        </p>
        <table className="hb-skill-table">
          <thead>
            <tr><th>Skill</th><th>Group</th><th className="hb-num">Weight</th><th className="hb-num">P(roll)</th></tr>
          </thead>
          <tbody>
            {[...fullSkillPool].sort((a, b) => b.chance - a.chance).map(s => {
              const cur = sim.skills[s.name] || 0;
              const isStarting = (initialSkills[s.name] || 0) > 0;
              return (
                <tr key={s.key || s.name}
                    className={cur >= 3 ? 'hb-skill-maxed' : (isStarting ? 'hb-skill-starting' : '')}>
                  <td>
                    <span className={`hb-skill-dot hb-skill-${s.group}`} />
                    {s.name}
                    {cur > 0 && <span className="hb-skill-cur"> L{cur}</span>}
                    {cur >= 3 && <span className="hb-skill-tag hb-skill-tag-max">maxed</span>}
                  </td>
                  <td className="hb-skill-group">{s.group}</td>
                  <td className="hb-num mono">{s.chance}</td>
                  <td className="hb-num mono">
                    {(100 * s.chance / skillTotal).toFixed(1)}%
                  </td>
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
        Pick a hero, then simulate their level-ups: each click rolls a stat
        increase + 2 skill offers, and you pick one. Undo + reset any time.
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
