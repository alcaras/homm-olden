/* Tier list view — tournament/exodus single-hero PvP rankings */

const TierView = () => {
  const T = window.OE_TIER_DATA;
  if (!T) return <p>Tier data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const factionById = Object.fromEntries(FACTIONS.map(f => [f.id, f]));

  const [factionSet, setFactionSet] = React.useState(new Set());
  const [tierSet, setTierSet] = React.useState(new Set());
  const [hideDerived, setHideDerived] = React.useState(false);

  const toggleFaction = (id) => {
    setFactionSet(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };
  const toggleTier = (t) => {
    setTierSet(prev => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };

  const TIER_ORDER = ['S', 'A', 'B', 'C'];

  const factionVisible = (fid) => factionSet.size === 0 || factionSet.has(fid);
  const tierVisible    = (t)   => tierSet.size === 0 || tierSet.has(t);

  // Count visible heroes per faction (after filters), for the count badge
  const countVisible = (fid) => {
    const rows = T.BY_FACTION[fid] || [];
    return rows.filter(r => tierVisible(r.tier) && (!hideDerived || !r.derived)).length;
  };

  const totalVisible = FACTIONS.reduce((acc, f) =>
    acc + (factionVisible(f.id) ? countVisible(f.id) : 0), 0);

  return (
    <>
      <h1>Tournament tier list</h1>
      <div className="tier-scale">
        <span><b>S</b> perma-pick / perma-ban</span>
        <span><b>A</b> strong contested</span>
        <span><b>B</b> situational / playable</span>
        <span><b>C</b> avoid in single-hero Exodus</span>
        <span className="tier-derived-key"><em>(data)</em> uncited — derived from extracted data only</span>
      </div>

      {/* ------- Opening picks ------- */}
      <h2>Opening-pick archetypes</h2>
      <div className="archetypes">
        {T.OPENING_PICKS.map((p) => (
          <div className="archetype" key={p.title}>
            <div className="archetype-title">{p.title}</div>
            <div className="archetype-body">{p.body}</div>
          </div>
        ))}
      </div>

      {/* ------- Filters ------- */}
      <h2>Per-faction tiers</h2>
      <div className="controls">
        <div className="filter-group">
          <label>Factions</label>
          <div className="seg multi">
            <button className={factionSet.size===0?'active':''}
                    onClick={()=>setFactionSet(new Set())}>All</button>
            {FACTIONS.map(f => (
              <button key={f.id}
                      className={factionSet.has(f.id)?'active':''}
                      onClick={()=>toggleFaction(f.id)}>{f.name}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Tiers</label>
          <div className="seg multi">
            <button className={tierSet.size===0?'active':''}
                    onClick={()=>setTierSet(new Set())}>All</button>
            {TIER_ORDER.map(t => (
              <button key={t}
                      className={tierSet.has(t)?`active tier-${t}`:`tier-${t}`}
                      onClick={()=>toggleTier(t)}>{t}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>
            <input type="checkbox" checked={hideDerived}
                   onChange={(e)=>setHideDerived(e.target.checked)} />
            {' '}Hide data-derived
          </label>
        </div>
        <span className="count">{totalVisible} heroes</span>
      </div>

      {FACTIONS.filter(f => factionVisible(f.id)).map((f) => {
        const meta = T.FACTION_META[f.id] || {};
        const rows = (T.BY_FACTION[f.id] || [])
          .filter(r => tierVisible(r.tier) && (!hideDerived || !r.derived));
        if (rows.length === 0) return null;
        return (
          <section key={f.id} className="faction-section">
            <div className="faction-band">
              <img className="faction-band-icon" loading="lazy"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
              <div>
                <div className="name">{f.name}</div>
                <div className="skill">{f.might} / {f.magic}</div>
              </div>
              <div className="counts">{rows.length} heroes</div>
            </div>
            {meta.summary && <p className="faction-summary">{meta.summary}</p>}
            {meta.creature_tip && (
              <p className="faction-tip"><em>Creature tip:</em> {meta.creature_tip}</p>
            )}

            {TIER_ORDER.map(tier => {
              const t_rows = rows.filter(r => r.tier === tier);
              if (t_rows.length === 0) return null;
              return (
                <div key={tier} className={`tier-block tier-block-${tier}`}>
                  <div className="tier-head">
                    <span className={`tier-badge tier-${tier}`}>{tier}</span>
                    <span className="tier-label">
                      {tier === 'S' && 'perma-pick / perma-ban'}
                      {tier === 'A' && 'strong contested'}
                      {tier === 'B' && 'situational / playable'}
                      {tier === 'C' && 'avoid'}
                    </span>
                    <span className="tier-count">{t_rows.length}</span>
                  </div>
                  <ul className="tier-heroes">
                    {t_rows.map(h => (
                      <li key={h.id} className="tier-hero">
                        <img loading="lazy" className="th-portrait"
                             src={`img/heroes/${h.id}.png`} alt=""
                             onError={(e)=>{e.target.style.visibility='hidden';}} />
                        <div className="th-body">
                          <div className="th-name-row">
                            <span className="th-name">{h.name}</span>
                            <span className={h.kind==='might'?'glyph glyph-might':'glyph glyph-magic'}>
                              {h.kind==='might' ? '⚔' : '✦'}
                            </span>
                            <span className="th-class">
                              {h.kind==='might' ? f.might : f.magic}
                            </span>
                            <span className="th-specialty">{h.specialty}</span>
                            {h.derived && <span className="th-derived">data</span>}
                          </div>
                          <div className="th-army">{h.army}</div>
                          <div className="th-note">{h.note}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
};

window.TierView = TierView;
