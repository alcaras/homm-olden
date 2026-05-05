/* Heroes view */

const HeroesView = () => {
  const { FACTIONS, HEROES } = window.OE_DATA;
  const [q, setQ] = React.useState('');
  const [kind, setKind] = React.useState('all');     // all | might | magic
  const [faction, setFaction] = React.useState('all');
  const [sort, setSort] = React.useState({ key: 'num', dir: 1 });

  const factionMap = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  const ql = q.trim().toLowerCase();
  const filtered = HEROES.filter(h => {
    if (kind !== 'all' && h.kind !== kind) return false;
    if (faction !== 'all' && h.faction !== faction) return false;
    if (!ql) return true;
    if (h.name.toLowerCase().includes(ql)) return true;
    if (h.specialty.toLowerCase().includes(ql)) return true;
    if ((h.specDesc || '').toLowerCase().includes(ql)) return true;
    if (h.skills.some(s => s.toLowerCase().includes(ql))) return true;
    if (h.army.toLowerCase().includes(ql)) return true;
    return false;
  });

  // Sort comparator — applied within each per-class table.
  const sortedList = (list) => {
    const k = sort.key;
    const numeric = ['A','D','P','K','armyScore','num'].includes(k);
    return [...list].sort((a, b) => {
      let av, bv;
      if (k === 'num')        { av = HEROES.indexOf(a); bv = HEROES.indexOf(b); }
      else if (k === 'name')      { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (k === 'specialty') { av = (a.specialty||'').toLowerCase(); bv = (b.specialty||'').toLowerCase(); }
      else if (['A','D','P','K'].includes(k)) { av = a.stats[k] ?? 0; bv = b.stats[k] ?? 0; }
      else if (k === 'armyScore') { av = a.armyScore ?? 0; bv = b.armyScore ?? 0; }
      else { av = a[k]; bv = b[k]; }
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return  1 * sort.dir;
      return HEROES.indexOf(a) - HEROES.indexOf(b);
    });
  };

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

  const SortHead = ({ label, k, num, title }) => {
    const active = sort.key === k;
    const arrow = active ? (sort.dir > 0 ? '↑' : '↓') : '';
    return (
      <th title={title}
          className={`sortable${active?' active':''}${num?' num':''}`}
          onClick={() => setSort(s => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 })}>
        {label} <span className="sort-arrow">{arrow}</span>
      </th>
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
        <strong>P</strong>ower · <strong>K</strong>nowledge. <strong>Score</strong> is
        the starting-army value (Σ unit squad value × avg stack count). Click any column
        header to sort within each class table.
      </p>

      {FACTIONS.map(f => {
        if (faction !== 'all' && faction !== f.id) return null;
        const group = byFaction[f.id];
        if (!group || (group.might.length + group.magic.length === 0)) return null;
        return (
          <section key={f.id}>
            <div className="faction-band">
              <img loading="lazy" className="faction-band-icon"
                   src={`img/factions/${f.id}.png`} alt=""
                   onError={(e)=>{e.target.style.display='none';}} />
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
              const sortedRows = sortedList(list);
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
                        <SortHead label="#" k="num" num />
                        <th></th>
                        <SortHead label="Hero" k="name" />
                        <SortHead label="Specialty" k="specialty" />
                        <SortHead label="A" k="A" num title="Attack" />
                        <SortHead label="D" k="D" num title="Defense" />
                        <SortHead label="P" k="P" num title="Spell Power" />
                        <SortHead label="K" k="K" num title="Knowledge" />
                        <SortHead label="Score" k="armyScore" num
                                  title="Starting-army squadValue × avg stack count" />
                        <th>Starting skills</th>
                        <th>Starting army</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((h) => (
                        <tr key={h.id || h.name}>
                          <td className="h-num">{HEROES.indexOf(h)+1}</td>
                          <td className="h-portrait-cell">
                            <img loading="lazy" className="h-portrait"
                                 src={`img/heroes/${h.id}.png`} alt=""
                                 onError={(e)=>{e.target.style.visibility='hidden';}} />
                          </td>
                          <td>
                            <div className="h-name-row">
                              <span className="h-name">{h.name}</span>
                            </div>
                          </td>
                          <td>
                            <div className="spec-cell" title={h.specDesc || ''}>
                              {h.specId && (
                                <img loading="lazy" className="spec-icon"
                                     src={`img/specs/${h.specId}.png`} alt=""
                                     title={h.specDesc || h.specialty}
                                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                              )}
                              <div className="spec-text">
                                <div className="spec-name">{h.specialty}</div>
                                {h.specDesc && (
                                  <div className="spec-desc">{h.specDesc}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="num"><span className="stat-v">{h.stats.A}</span></td>
                          <td className="num"><span className="stat-v">{h.stats.D}</span></td>
                          <td className="num"><span className="stat-v">{h.stats.P}</span></td>
                          <td className="num"><span className="stat-v">{h.stats.K}</span></td>
                          <td className="num army-score">
                            {h.armyScore?.toLocaleString() ?? '—'}
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
