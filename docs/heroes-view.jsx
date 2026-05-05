/* Heroes view */

const HeroesView = () => {
  const { FACTIONS, HEROES } = window.OE_DATA;
  const [q, setQ] = React.useState('');
  const [kind, setKind] = React.useState('all');     // all | might | magic
  const [faction, setFaction] = React.useState('all');

  const factionMap = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  const ql = q.trim().toLowerCase();
  const filtered = HEROES.filter(h => {
    if (kind !== 'all' && h.kind !== kind) return false;
    if (faction !== 'all' && h.faction !== faction) return false;
    if (!ql) return true;
    if (h.name.toLowerCase().includes(ql)) return true;
    if (h.specialty.toLowerCase().includes(ql)) return true;
    if (h.skills.some(s => s.toLowerCase().includes(ql))) return true;
    if (h.army.toLowerCase().includes(ql)) return true;
    return false;
  });

  // Group filtered heroes by faction → kind
  const byFaction = {};
  filtered.forEach(h => {
    if (!byFaction[h.faction]) byFaction[h.faction] = { might: [], magic: [] };
    byFaction[h.faction][h.kind].push(h);
  });

  const factionSkillNames = new Set(FACTIONS.map(f => f.skill));

  const SkillChips = ({skills}) => (
    <span>
      {skills.map((s, i) => {
        // strip level suffix to detect faction skill
        const m = s.match(/^(.+?)\s+L(\d)$/);
        const base = m ? m[1] : s;
        const lv = m ? m[2] : '';
        const isFaction = factionSkillNames.has(base);
        const cls = ['skill-chip'];
        if (isFaction) cls.push('faction');
        if (lv === '2') cls.push('l2');
        return (
          <span key={i} className={cls.join(' ')}>
            {base}{lv ? <span style={{opacity:0.55, marginLeft:'0.3em', fontSize:'0.85em'}}>L{lv}</span> : null}
          </span>
        );
      })}
    </span>
  );

  const Army = ({army}) => {
    const stacks = army.split(' · ');
    return (
      <span className="army">
        {stacks.map((st, i) => (
          <React.Fragment key={i}>
            <span className="stack">{st}</span>
            {i < stacks.length - 1 && <span className="sep">·</span>}
          </React.Fragment>
        ))}
      </span>
    );
  };

  return (
    <div>
      <h1>Heroes — Starting Skills, Stats & Armies</h1>
      <p className="lede">
        All 108 stock heroes (six factions × two classes × nine heroes), with starting
        stats, starting skills, starting army composition, and signature specialization.
      </p>

      <div className="controls">
        <div className="filter-group">
          <label>Search</label>
          <input className="search" placeholder="hero, specialty, skill, unit…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Class</label>
          <div className="seg">
            <button className={kind==='all'?'active':''} onClick={()=>setKind('all')}>All</button>
            <button className={kind==='might'?'active':''} onClick={()=>setKind('might')}>⚔ Might</button>
            <button className={kind==='magic'?'active':''} onClick={()=>setKind('magic')}>✦ Magic</button>
          </div>
        </div>

        <div className="filter-group">
          <label>Faction</label>
          <div className="seg">
            <button className={faction==='all'?'active':''} onClick={()=>setFaction('all')}>All</button>
            {FACTIONS.map(f => (
              <button key={f.id} className={faction===f.id?'active':''}
                      onClick={()=>setFaction(f.id)}>{f.name}</button>
            ))}
          </div>
        </div>

        <span className="count">{filtered.length} heroes</span>
      </div>

      <p className="note" style={{marginTop:0}}>
        Within each faction, <span className="glyph-might"><strong>⚔</strong></span> heroes
        are the Might class, <span className="glyph-magic"><strong>✦</strong></span> are
        Magic. Stats: <strong>A</strong>ttack · <strong>D</strong>efense ·{' '}
        <strong>P</strong>ower · <strong>K</strong>nowledge. Faction-skill chips are
        outlined in burnt orange; doubled border indicates L2 (hero starts with the faction
        skill at advanced instead of L1 + a second skill).
      </p>

      {FACTIONS.map(f => {
        if (faction !== 'all' && faction !== f.id) return null;
        const group = byFaction[f.id];
        if (!group || (group.might.length + group.magic.length === 0)) return null;
        return (
          <section key={f.id}>
            <div className="faction-band">
              <span className="name">{f.name}</span>
              <span className="skill">faction skill: {f.skill}</span>
              <span className="counts">
                ⚔ {f.might} · ✦ {f.magic}
              </span>
            </div>

            {['might','magic'].map(k => {
              const list = group[k];
              if (!list.length) return null;
              const className = k==='might' ? f.might : f.magic;
              return (
                <div key={k}>
                  <h3>
                    <span className={k==='might'?'glyph glyph-might':'glyph glyph-magic'}>
                      {k==='might' ? '⚔' : '✦'}
                    </span>
                    {' '}{className}
                  </h3>
                  <table className="heroes">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Hero</th>
                        <th>Stats</th>
                        <th>Starting skills</th>
                        <th>Starting army</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((h, i) => (
                        <tr key={h.name}>
                          <td className="h-num">{HEROES.indexOf(h)+1}</td>
                          <td>
                            <div className="h-name">{h.name}</div>
                            <div className="h-spec">{h.specialty}</div>
                          </td>
                          <td>
                            <div className="stats-row">
                              <span className="lbl">A</span><span className="v">{h.stats.A}</span>
                              <span className="lbl">D</span><span className="v">{h.stats.D}</span>
                              <span className="lbl">P</span><span className="v">{h.stats.P}</span>
                              <span className="lbl">K</span><span className="v">{h.stats.K}</span>
                            </div>
                          </td>
                          <td><SkillChips skills={h.skills} /></td>
                          <td><Army army={h.army} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </section>
        );
      })}

      {filtered.length === 0 && (
        <p style={{color:'var(--muted)', fontStyle:'italic', marginTop:'2rem'}}>
          No heroes match those filters.
        </p>
      )}
    </div>
  );
};

window.HeroesView = HeroesView;
