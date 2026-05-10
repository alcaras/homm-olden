/* Map templates — multiplayer template browser, filterable by mode + size. */

const MapTemplatesView = () => {
  const D = window.OE_MAP_TEMPLATES_DATA;
  if (!D) return <p>Template data not loaded.</p>;

  const [mode, setMode] = React.useState('all');
  const [size, setSize] = React.useState('all');

  const allModes = Array.from(new Set(D.TEMPLATES.map(t => t.mode))).sort();
  const allSizes = ['small', 'medium', 'large', 'huge'];

  const filtered = D.TEMPLATES.filter(t => {
    if (mode !== 'all' && t.mode !== mode) return false;
    if (size !== 'all' && t.size !== size) return false;
    return true;
  });

  return (
    <>
      <h1>Map templates</h1>
      <p className="lede">
        Every generated multiplayer template the game ships with — pulled
        directly from{' '}
        <code>StreamingAssets/map_templates/*.rmg.json</code>. Each card has
        the in-game preview image, the actual map dimensions, the game-mode
        tag (Classic / Single-hero), the hero-count range, and the
        localized description from <code>ui.json</code>.
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
        Generated {D.GENERATED_AT}. Size buckets:{' '}
        <em>small</em> ≤96, <em>medium</em> ≤128, <em>large</em> ≤176,{' '}
        <em>huge</em> &gt;176 (max axis).
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
  return ({small: 'Small', medium: 'Medium', large: 'Large', huge: 'Huge'})[s] || s;
}

const TemplateCard = ({t}) => {
  const heroes = t.heroMin && t.heroMax
    ? (t.heroMin === t.heroMax ? `${t.heroMin}` : `${t.heroMin}–${t.heroMax}`)
    : null;
  return (
    <article className="mt-card">
      {t.image && (
        <img loading="lazy" className="mt-img"
             src={t.image} alt={t.name}
             onError={(e)=>{e.target.style.visibility='hidden';}} />
      )}
      <div className="mt-body">
        <header className="mt-head">
          <h3 className="mt-name">{t.name}</h3>
          <div className="mt-tags">
            <span className={`mt-tag mt-tag-${t.mode}`}>{labelMode(t.mode)}</span>
            <span className={`mt-tag mt-tag-size mt-tag-size-${t.size}`}>
              {labelSize(t.size)} ({t.sizeX}×{t.sizeZ})
            </span>
            {heroes && <span className="mt-tag mt-tag-players">{heroes} hero{heroes==='1'?'':'es'}</span>}
          </div>
        </header>
        <p className="mt-desc">{t.desc}</p>
      </div>
    </article>
  );
};

window.MapTemplatesView = MapTemplatesView;
