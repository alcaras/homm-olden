/* Map templates — multiplayer template browser, filterable by mode + size. */

const MapTemplatesView = () => {
  const D = window.OE_MAP_TEMPLATES_DATA;
  if (!D) return <p>Template data not loaded.</p>;

  const [mode, setMode] = React.useState('all');
  const [size, setSize] = React.useState('all');

  // Collect all unique modes + sizes for filter UI
  const allModes = Array.from(new Set(D.TEMPLATES.flatMap(t => t.modes))).sort();
  const allSizes = Array.from(new Set(D.TEMPLATES.map(t => t.size))).sort();

  const filtered = D.TEMPLATES.filter(t => {
    if (mode !== 'all' && !t.modes.includes(mode)) return false;
    if (size !== 'all' && t.size !== size) return false;
    return true;
  });

  return (
    <>
      <h1>Map templates</h1>
      <p className="lede">
        Every generated multiplayer template the game ships with. Names and
        descriptions are pulled from <code>ui.json</code>; mode tags
        cross-reference <code>quickStart.json</code>'s classic /
        single-hero / scenario lists. The game doesn't ship per-template
        preview images — each template shows a placeholder icon until we
        have a source for those.
      </p>

      <div className="controls">
        <div className="filter-group">
          <label>Mode</label>
          <div className="seg">
            <button className={mode==='all'?'active':''} onClick={()=>setMode('all')}>All</button>
            {allModes.map(m => (
              <button key={m}
                      className={mode===m?'active':''}
                      onClick={()=>setMode(m)}>{labelMode(m)}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Size</label>
          <div className="seg">
            <button className={size==='all'?'active':''} onClick={()=>setSize('all')}>All</button>
            {allSizes.map(s => (
              <button key={s}
                      className={size===s?'active':''}
                      onClick={()=>setSize(s)}>{labelSize(s)}</button>
            ))}
          </div>
        </div>
        <span className="count">{filtered.length} templates</span>
      </div>

      <div className="mt-grid">
        {filtered.map(t => <TemplateCard key={t.id} t={t} />)}
      </div>

      <p className="note">
        Generated {D.GENERATED_AT}. Size is heuristic from description text;
        flag wrong inferences in <code>build_map_templates.py</code>.
      </p>
    </>
  );
};

function labelMode(m) {
  return ({
    'classic': 'Classic', 'single-hero': 'Single-hero', 'pve': 'PvE',
    'scenario': 'Scenario', 'tournament': 'Tournament', 'multiplayer': 'Multiplayer',
  })[m] || m;
}
function labelSize(s) {
  return ({small: 'Small', medium: 'Medium', large: 'Large'})[s] || s;
}

const TemplateCard = ({t}) => (
  <article className="mt-card">
    <img loading="lazy" className="mt-img"
         src={`img/map_objects/${t.id}.png`} alt=""
         onError={(e)=>{e.target.src = 'img/factions/temple.png'; e.target.style.opacity = 0.15;}} />
    <div className="mt-body">
      <header className="mt-head">
        <h3 className="mt-name">{t.name}</h3>
        <div className="mt-tags">
          {t.modes.map(m => <span key={m} className={`mt-tag mt-tag-${m}`}>{labelMode(m)}</span>)}
          <span className={`mt-tag mt-tag-size mt-tag-size-${t.size}`}>{labelSize(t.size)}</span>
          {t.playerCount && <span className="mt-tag mt-tag-players">{t.playerCount}p</span>}
        </div>
      </header>
      <p className="mt-desc">{t.desc}</p>
    </div>
  </article>
);

window.MapTemplatesView = MapTemplatesView;
