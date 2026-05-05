/* Units view — sortable / searchable creature stat table */

const UnitsView = () => {
  const { FACTIONS, UNITS } = window.OE_DATA;
  const [q, setQ] = React.useState('');
  const [faction, setFaction] = React.useState('all');
  const [tier, setTier] = React.useState('all');
  const [variant, setVariant] = React.useState('all');
  const [atkType, setAtkType] = React.useState('all');
  const [sort, setSort] = React.useState({ key: 'tier', dir: 1 });

  // Faction id list incl. neutral. Units use the display id ('temple' etc.).
  const factionOptions = [
    ...FACTIONS.map(f => ({ id: f.id, label: f.name })),
    { id: 'neutral', label: 'Neutral' },
  ];
  const factionLabel = Object.fromEntries(factionOptions.map(o => [o.id, o.label]));

  // Tiers present
  const tiers = Array.from(new Set(UNITS.map(u => u.tier))).sort((a,b)=>a-b);

  const ql = q.trim().toLowerCase();
  const filtered = UNITS.filter(u => {
    if (faction !== 'all' && u.faction !== faction) return false;
    if (tier !== 'all' && u.tier !== Number(tier)) return false;
    if (variant !== 'all' && u.variant !== variant) return false;
    if (atkType !== 'all' && u.attack !== atkType) return false;
    if (!ql) return true;
    if (u.name.toLowerCase().includes(ql)) return true;
    if (u.id.toLowerCase().includes(ql)) return true;
    if ((u.ai || '').toLowerCase().includes(ql)) return true;
    if ((u.tags || []).some(t => t.toLowerCase().includes(ql))) return true;
    return false;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const k = sort.key;
    let av = a[k], bv = b[k];
    if (k === 'name')      { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (k === 'faction')   { av = factionLabel[av] || av; bv = factionLabel[bv] || bv; }
    if (k === 'dmgAvg')    { av = (a.dmgMin + a.dmgMax) / 2; bv = (b.dmgMin + b.dmgMax) / 2; }
    if (k === 'valuePerCost') {
      av = a.cost ? a.squadValue / a.cost : 0;
      bv = b.cost ? b.squadValue / b.cost : 0;
    }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return  1 * sort.dir;
    // stable secondary: tier, then name
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });

  const SortHead = ({ label, k, num }) => {
    const active = sort.key === k;
    const arrow = active ? (sort.dir > 0 ? '↑' : '↓') : '';
    return (
      <th
        className={`sortable${active?' active':''}${num?' num':''}`}
        onClick={() => setSort(s =>
          s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }
        )}
      >
        {label} <span className="sort-arrow">{arrow}</span>
      </th>
    );
  };

  const variantLabel = { base: 'Base', upg: 'Upgrade', alt: 'Alt Upg' };

  return (
    <div>
      <h1>Units — Creature Stats</h1>
      <p className="lede">
        Every recruitable creature in the game — six factions plus neutral, in
        three variants per stack: <em>base</em> (recruited from the dwelling),{' '}
        <em>upgrade</em> (the standard improvement), and <em>alt upgrade</em>{' '}
        (the alternate option).
      </p>

      <div className="controls">
        <div className="filter-group">
          <label>Search</label>
          <input className="search" placeholder="name, id, tag, ai…"
                 value={q} onChange={e => setQ(e.target.value)} />
        </div>

        <div className="filter-group">
          <label>Faction</label>
          <div className="seg">
            <button className={faction==='all'?'active':''} onClick={()=>setFaction('all')}>All</button>
            {factionOptions.map(o => (
              <button key={o.id} className={faction===o.id?'active':''}
                      onClick={()=>setFaction(o.id)}>{o.label}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Tier</label>
          <div className="seg">
            <button className={tier==='all'?'active':''} onClick={()=>setTier('all')}>All</button>
            {tiers.map(t => (
              <button key={t} className={tier===String(t)?'active':''}
                      onClick={()=>setTier(String(t))}>{t}</button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Variant</label>
          <div className="seg">
            <button className={variant==='all'?'active':''} onClick={()=>setVariant('all')}>All</button>
            <button className={variant==='base'?'active':''} onClick={()=>setVariant('base')}>Base</button>
            <button className={variant==='upg'?'active':''} onClick={()=>setVariant('upg')}>Upgrade</button>
            <button className={variant==='alt'?'active':''} onClick={()=>setVariant('alt')}>Alt</button>
          </div>
        </div>

        <div className="filter-group">
          <label>Attack</label>
          <div className="seg">
            <button className={atkType==='all'?'active':''}    onClick={()=>setAtkType('all')}>All</button>
            <button className={atkType==='Melee'?'active':''}  onClick={()=>setAtkType('Melee')}>⚔ Melee</button>
            <button className={atkType==='Long'?'active':''}   onClick={()=>setAtkType('Long')}>↔ Long</button>
            <button className={atkType==='Ranged'?'active':''} onClick={()=>setAtkType('Ranged')}>🏹 Ranged</button>
          </div>
        </div>

        <span className="count">{sorted.length} units</span>
      </div>

      <p className="note" style={{marginTop:0}}>
        Click any column header to sort; click again to reverse. <strong>SV</strong>{' '}
        is squad value — the game's internal balance scalar; <strong>SV/g</strong>{' '}
        is value per gold (higher is more cost-efficient at face value).
      </p>

      <div className="units-wrap">
        <table className="units">
          <thead>
            <tr>
              <th></th>
              <SortHead label="Tier" k="tier" num />
              <SortHead label="Faction" k="faction" />
              <SortHead label="Unit" k="name" />
              <th>Var.</th>
              <SortHead label="Atk" k="attack" />
              <SortHead label="HP" k="hp" num />
              <SortHead label="Off" k="off" num />
              <SortHead label="Def" k="def" num />
              <SortHead label="Dmg" k="dmgAvg" num />
              <SortHead label="Init" k="init" num />
              <SortHead label="Spd" k="speed" num />
              <SortHead label="SV" k="squadValue" num />
              <SortHead label="Cost" k="cost" num />
              <SortHead label="SV/g" k="valuePerCost" num />
            </tr>
          </thead>
          <tbody>
            {sorted.map(u => {
              const dmgAvg = (u.dmgMin + u.dmgMax) / 2;
              const ratio = u.cost ? (u.squadValue / u.cost) : 0;
              const atkGlyph = u.attack === 'Melee'  ? '⚔'
                             : u.attack === 'Long'   ? '↔'
                             : u.attack === 'Ranged' ? '🏹' : '';
              return (
                <tr key={u.id}>
                  <td className="u-icon-cell">
                    <img loading="lazy" className="u-icon"
                         src={`img/units/${u.id}.png`} alt=""
                         onError={(e)=>{e.target.style.visibility='hidden';}} />
                  </td>
                  <td className="num">{u.tier}</td>
                  <td>
                    <span className={`faction-pill faction-${u.faction}`}>
                      {factionLabel[u.faction] || u.faction}
                    </span>
                  </td>
                  <td>
                    <div className="u-name">{u.name}</div>
                    <div className="u-id">{u.id}</div>
                  </td>
                  <td>
                    <span className={`variant variant-${u.variant}`}>
                      {variantLabel[u.variant] || u.variant}
                    </span>
                  </td>
                  <td>
                    <span className={`atk-chip atk-${u.attack.toLowerCase()}`}>
                      <span className="atk-glyph">{atkGlyph}</span>{u.attack}
                    </span>
                  </td>
                  <td className="num">{u.hp ?? '—'}</td>
                  <td className="num">{u.off ?? '—'}</td>
                  <td className="num">{u.def ?? '—'}</td>
                  <td className="num dmg">
                    {u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}–${u.dmgMax}`}
                  </td>
                  <td className="num">{u.init ?? '—'}</td>
                  <td className="num">{u.speed ?? '—'}</td>
                  <td className="num">{u.squadValue ?? '—'}</td>
                  <td className="num">{u.cost ?? '—'}</td>
                  <td className="num ratio">
                    {u.cost ? ratio.toFixed(2) : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {sorted.length === 0 && (
        <p style={{color:'var(--muted)', fontStyle:'italic', marginTop:'2rem'}}>
          No units match those filters.
        </p>
      )}
    </div>
  );
};

window.UnitsView = UnitsView;
