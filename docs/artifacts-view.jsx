/* Artifacts page — 117 artifacts across 9 slots, with set membership. */

const ArtifactsView = () => {
  const A = window.OE_ARTIFACTS_DATA;
  if (!A) return <p>Artifacts data not loaded.</p>;

  const [slot, setSlot] = React.useState('all');
  const [rarity, setRarity] = React.useState('all');
  const [setId, setSetId] = React.useState('all');

  const allRarities = Array.from(new Set(A.ARTIFACTS.map(a => a.rarity))).sort();

  const filtered = A.ARTIFACTS.filter(a => {
    if (slot   !== 'all' && a.slot   !== slot)   return false;
    if (rarity !== 'all' && a.rarity !== rarity) return false;
    if (setId  !== 'all' && a.itemSet !== setId) return false;
    return true;
  });

  // Group by slot for rendering
  const bySlot = {};
  for (const a of filtered) (bySlot[a.slot] = bySlot[a.slot] || []).push(a);

  const sortedSets = Object.values(A.ITEM_SETS).sort((a,b)=>a.name.localeCompare(b.name));

  return (
    <>
      <h1>Artifacts</h1>
      <div className="controls">
        <div className="filter-group">
          <label>Slot</label>
          <div className="seg">
            <button className={slot==='all'?'active':''} onClick={()=>setSlot('all')}>All</button>
            {A.SLOT_ORDER.map(s => (
              <button key={s}
                      className={slot===s?'active':''}
                      onClick={()=>setSlot(s)}>{A.SLOT_LABEL[s] || s}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Rarity</label>
          <div className="seg">
            <button className={rarity==='all'?'active':''} onClick={()=>setRarity('all')}>All</button>
            {allRarities.map(r => (
              <button key={r}
                      className={rarity===r?'active':''}
                      onClick={()=>setRarity(r)}>{capCase(r)}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Item set</label>
          <select className="search" value={setId} onChange={e=>setSetId(e.target.value)}>
            <option value="all">— Any set —</option>
            {sortedSets.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.items.length}pc)</option>
            ))}
          </select>
        </div>
        <span className="count">{filtered.length} artifacts</span>
      </div>

      {A.SLOT_ORDER.filter(s => bySlot[s]).map(s => (
        <section key={s} className="art-section">
          <h2>{A.SLOT_LABEL[s] || s}</h2>
          <div className="art-grid">
            {bySlot[s].map(a => <ArtifactCard key={a.id} a={a} sets={A.ITEM_SETS} />)}
          </div>
        </section>
      ))}
    </>
  );
};

function capCase(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }

const ArtifactCard = ({a, sets}) => {
  const set = a.itemSet ? sets[a.itemSet] : null;
  return (
    <article className={`art-card art-rarity-${a.rarity}`}>
      <img loading="lazy" className="art-img"
           src={`img/artifacts/${a.id}.png`} alt=""
           onError={(e)=>{e.target.style.visibility='hidden';}} />
      <div className="art-body">
        <header className="art-head">
          <h3 className="art-name">{a.name}</h3>
          <div className="art-meta">
            <span className={`art-rarity-chip art-rarity-chip-${a.rarity}`}>{capCase(a.rarity)}</span>
            {a.maxLevel > 1 && <span className="art-level">L1–L{a.maxLevel}</span>}
          </div>
        </header>
        {a.desc && <p className="art-desc">{a.desc}</p>}
        {a.bonuses?.length > 0 && (
          <ul className="art-bonuses">
            {a.bonuses.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
        {a.narrative && <p className="art-narr"><em>{a.narrative}</em></p>}
        {set && (
          <div className="art-set">
            <span className="art-set-label">Set:</span>
            <span className="art-set-name">{set.name}</span>
            <span className="art-set-pieces">({set.items.length} pieces)</span>
          </div>
        )}
      </div>
    </article>
  );
};

window.ArtifactsView = ArtifactsView;
