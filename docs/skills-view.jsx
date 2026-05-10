/* Skills page — every skill, with icons, levels, sub-skill rewards, and which
   subclasses require it at level 3. */

const SkillsView = () => {
  const S = window.OE_SKILLS_DATA;
  if (!S) return <p>Skills data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionById = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  const [filter, setFilter] = React.useState('all');

  const skillsByGroup = {};
  for (const sk of S.SKILLS) {
    (skillsByGroup[sk.group] = skillsByGroup[sk.group] || []).push(sk);
  }

  const visibleGroups = filter === 'all'
    ? S.GROUPS
    : S.GROUPS.filter(g => g.id === filter);

  return (
    <>
      <h1>Skills</h1>
      <p className="lede">
        Every hero skill in the game — Combat, Magic, Schools, Utility, the
        class-locked Combat / Thaumaturgy pair, the never-in-subclass
        Siegecraft / Recruitment pair, and the six faction skills. Each entry
        shows the per-level effect, the sub-skill rewards offered at Advanced
        and Expert, and the subclasses that need this skill at level 3.
      </p>

      <div className="controls">
        <div className="filter-group">
          <label>Group</label>
          <div className="seg">
            <button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>All</button>
            {S.GROUPS.map(g => {
              const n = (skillsByGroup[g.id] || []).length;
              if (!n) return null;
              return (
                <button key={g.id}
                        className={filter===g.id?'active':''}
                        onClick={()=>setFilter(g.id)}>
                  {shortGroupLabel(g.id)} ({n})
                </button>
              );
            })}
          </div>
        </div>
        <span className="count">{S.SKILLS.length} total</span>
      </div>

      {visibleGroups.map(g => {
        const group = skillsByGroup[g.id] || [];
        if (group.length === 0) return null;
        return (
          <section key={g.id} className="skill-group">
            <h2>{g.label}</h2>
            <div className="skill-list">
              {group.map(sk => (
                <SkillCard key={sk.id} sk={sk} factionById={factionById} />
              ))}
            </div>
          </section>
        );
      })}

      <p className="note">
        Generated {S.GENERATED_AT}. Data extracted by{' '}
        <code>catalog/scripts/build_skills.py</code> from{' '}
        <code>DB/heroes_skills/</code> and{' '}
        <code>Lang/english/texts/heroSkills.json</code>. Subclass mapping derived
        from <code>SUBCLASSES</code> in <code>data.js</code>.
      </p>
    </>
  );
};

function shortGroupLabel(id) {
  return ({
    'combat':       'Combat',
    'magic':        'Magic',
    'school':       'Schools',
    'utility':      'Utility',
    'combat-class': 'Combat (locked)',
    'magic-class':  'Magic (locked)',
    'never':        'Never required',
    'faction':      'Faction',
  })[id] || id;
}

const LEVEL_LABEL = ['Basic', 'Advanced', 'Expert'];

const SkillCard = ({sk, factionById}) => {
  // Level 1 icon = skill_id.png; L2 = skill_id_L2.png; L3 = skill_id_L3.png
  const iconFor = (li) => `img/skills/${li === 1 ? sk.id : sk.id + '_L' + li}.png`;

  // Group subclass list by faction for cleaner rendering
  const subsByFaction = {};
  for (const s of sk.subclasses) {
    (subsByFaction[s.faction] = subsByFaction[s.faction] || []).push(s);
  }

  // Faction-skill: also surface the owning faction
  const ownerFaction = sk.factionId && factionById[sk.factionId];

  return (
    <article className="skill-card" id={`skill-${sk.id}`}>
      <header className="skill-head">
        <img loading="lazy" className="skill-icon"
             src={iconFor(1)} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="skill-head-body">
          <div className="skill-name-row">
            <h3 className="skill-name">{sk.name}</h3>
            {sk.skillType !== 'Common' && (
              <span className="skill-type-chip">{sk.skillType}</span>
            )}
            {ownerFaction && (
              <span className={`faction-pill faction-${ownerFaction.id}`}>{ownerFaction.name}</span>
            )}
            {sk.group !== 'never' && sk.group !== 'faction' && sk.group !== 'combat-class' && sk.group !== 'magic-class' && (
              <span className="skill-sc-count">
                {sk.subclasses.length} subclass{sk.subclasses.length === 1 ? '' : 'es'}
              </span>
            )}
            {sk.group === 'never' && (
              <span className="skill-never">never in subclass</span>
            )}
          </div>
          {sk.baseDesc && (
            <p className="skill-base-desc">{sk.baseDesc.replace(/\{[0-9]+\}/g, '?')}</p>
          )}
        </div>
      </header>

      <div className="skill-levels">
        {sk.levels.map(lvl => (
          <div key={lvl.level} className={`skill-level skill-level-${lvl.level}`}>
            <div className="skill-level-head">
              <img loading="lazy" className="skill-level-icon"
                   src={iconFor(lvl.level)} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
              <div className="skill-level-meta">
                <div className="skill-level-tier">
                  <span className="skill-level-num">L{lvl.level}</span>
                  <span className="skill-level-tier-name">{LEVEL_LABEL[lvl.level - 1]}</span>
                </div>
                <div className="skill-level-name">{lvl.name}</div>
              </div>
            </div>
            <div className="skill-level-desc">
              {(lvl.desc || '').replace(/\{[0-9]+\}/g, '?')}
            </div>

            {lvl.subskills.length > 0 && (
              <div className="skill-subskills">
                <div className="skill-subskills-head">
                  Sub-skill choices ({lvl.subskills.length})
                </div>
                <ul className="skill-subskills-list">
                  {lvl.subskills.map(ss => (
                    <li key={ss.id} className="skill-subskill">
                      <img loading="lazy" className="skill-subskill-icon"
                           src={`img/subskills/${ss.id}.png`} alt=""
                           onError={(e)=>{e.target.style.visibility='hidden';}} />
                      <div>
                        <div className="skill-subskill-name">{ss.name}</div>
                        <div className="skill-subskill-desc">
                          {(ss.desc || '').replace(/\{[0-9]+\}/g, '?')}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {sk.subclasses.length > 0 && (
        <footer className="skill-foot">
          <div className="skill-foot-head">Required by these subclasses (need this skill at Expert):</div>
          <div className="skill-foot-subs">
            {Object.entries(subsByFaction).map(([fid, subs]) => (
              <div key={fid} className="skill-foot-fac">
                <span className={`faction-pill faction-${fid}`}>
                  {factionById[fid]?.name || fid}
                </span>
                <span className="skill-foot-sub-list">
                  {subs.map((s, i) => (
                    <span key={i} className={`skill-foot-sub${s.kind === 'might' ? ' might' : ' magic'}`}>
                      {s.name} <em className="skill-foot-class">({s.class})</em>
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </footer>
      )}
    </article>
  );
};

window.SkillsView = SkillsView;
