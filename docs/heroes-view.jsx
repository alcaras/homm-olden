/* Heroes view — single flat sortable table across all heroes */

const HeroesView = ({ go }) => {
  const { FACTIONS, HEROES } = window.OE_DATA;
  const [q, setQ] = React.useState('');
  const [kind, setKind] = React.useState('all');                 // all | might | magic
  const [factionSet, setFactionSet] = React.useState(new Set()); // empty = all
  const [sort, setSort] = React.useState({ key: 'num', dir: 1 });

  const factionMap = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  const toggleFaction = (id) => {
    setFactionSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearFactions = () => setFactionSet(new Set());

  const ql = q.trim().toLowerCase();
  const filtered = HEROES.filter(h => {
    if (kind !== 'all' && h.kind !== kind) return false;
    if (factionSet.size > 0 && !factionSet.has(h.faction)) return false;
    if (!ql) return true;
    if (h.name.toLowerCase().includes(ql)) return true;
    if (h.specialty.toLowerCase().includes(ql)) return true;
    if ((h.specDesc || '').toLowerCase().includes(ql)) return true;
    if (h.skills.some(s => s.toLowerCase().includes(ql))) return true;
    if ((h.spells || []).some(s => (s.name || '').toLowerCase().includes(ql))) return true;
    if (h.army.toLowerCase().includes(ql)) return true;
    if ((factionMap[h.faction]?.name || '').toLowerCase().includes(ql)) return true;
    return false;
  });

  // Sort across ALL filtered heroes
  const sorted = [...filtered].sort((a, b) => {
    const k = sort.key;
    let av, bv;
    if (k === 'num')              { av = HEROES.indexOf(a); bv = HEROES.indexOf(b); }
    else if (k === 'name')        { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
    else if (k === 'specialty')   { av = (a.specialty||'').toLowerCase(); bv = (b.specialty||'').toLowerCase(); }
    else if (k === 'faction')     { av = factionMap[a.faction]?.name || a.faction; bv = factionMap[b.faction]?.name || b.faction; }
    else if (k === 'kind')        { av = a.kind; bv = b.kind; }
    else if (['A','D','P','K'].includes(k)) { av = a.stats[k] ?? 0; bv = b.stats[k] ?? 0; }
    else if (k === 'armyScore')   { av = a.armyScore ?? 0; bv = b.armyScore ?? 0; }
    else { av = a[k]; bv = b[k]; }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return  1 * sort.dir;
    return HEROES.indexOf(a) - HEROES.indexOf(b);
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
      <div className="controls">
        <div className="filter-group">
          <label>Search</label>
          <input className="search" placeholder="hero, specialty, skill, spell, unit, faction…"
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
          <label>Factions</label>
          <div className="seg multi" title="Select one or more — empty = all">
            <button className={factionSet.size===0?'active':''}
                    onClick={clearFactions}>All</button>
            {FACTIONS.map(f => (
              <button key={f.id}
                      className={factionSet.has(f.id)?'active':''}
                      onClick={()=>toggleFaction(f.id)}>{f.name}</button>
            ))}
          </div>
        </div>

        <span className="count">{sorted.length} heroes</span>
      </div>
      <div className="heroes-wrap">
        <table className="heroes flat">
          <thead>
            <tr>
              <SortHead label="#" k="num" num />
              <th></th>
              <SortHead label="Hero" k="name" />
              <SortHead label="Class" k="kind" />
              <SortHead label="Faction" k="faction" />
              <SortHead label="Specialty" k="specialty" />
              <SortHead label="A" k="A" num title="Attack" />
              <SortHead label="D" k="D" num title="Defense" />
              <SortHead label="P" k="P" num title="Spell Power" />
              <SortHead label="K" k="K" num title="Knowledge" />
              <th>Starting skills</th>
              <th>Starting spells</th>
              <th>Starting army</th>
              <SortHead label="Starting army score" k="armyScore" num
                        title="Σ unit squadValue × avg stack count" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((h) => {
              const f = factionMap[h.faction];
              return (
                <tr key={h.id || h.name}>
                  <td className="h-num">{HEROES.indexOf(h)+1}</td>
                  <td className="h-portrait-cell">
                    <img loading="lazy" className="h-portrait"
                         src={`img/heroes/${h.id}.png`} alt=""
                         onError={(e)=>{e.target.style.visibility='hidden';}} />
                  </td>
                  <td>
                    <a className="h-name h-name-link"
                       href={window.OE_routeToUrl(`hero/${h.id}`)}
                       onClick={(e)=>{ if (go) { e.preventDefault(); go(`hero/${h.id}`); } }}>
                      {h.name}
                    </a>
                    <div className="h-class-line">
                      {f && (h.kind === 'might' ? f.might : f.magic)}
                    </div>
                  </td>
                  <td>
                    <span className={h.kind==='might'?'glyph glyph-might':'glyph glyph-magic'}>
                      {h.kind==='might' ? '⚔' : '✦'}
                    </span>
                  </td>
                  <td>
                    {f && (
                      <span className={`faction-pill faction-${h.faction}`}>{f.name}</span>
                    )}
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
                  <td><SkillChips skills={h.skills} /></td>
                  <td>
                    {(h.spells || []).map((s) => (
                      <span key={s.id}
                            className={'spell-chip' + (s.masterful ? ' spell-chip-masterful' : '')}
                            title={(s.masterful ? 'Masterful ' : '') + `${s.name} (L${s.level})`}>
                        <img loading="lazy" className="spell-chip-icon"
                             src={`img/spells/${s.id}.png`} alt=""
                             onError={(e)=>{e.target.style.visibility='hidden';}} />
                        {s.masterful && <span className="spell-chip-master">★</span>}
                        <span className="spell-chip-name">
                          {s.masterful ? <em>Masterful </em> : null}{s.name}
                        </span>
                      </span>
                    ))}
                  </td>
                  <td><Army army={h.army} /></td>
                  <td className="num army-score">{h.armyScore?.toLocaleString() ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p style={{color:'var(--muted)', fontStyle:'italic', marginTop:'2rem'}}>
          No heroes match those filters.
        </p>
      )}
    </div>
  );
};

window.HeroesView = HeroesView;
