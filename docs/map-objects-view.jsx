/* Map objects browser — every interactable thing on the adventure map. */

const MapObjectsView = () => {
  const M = window.OE_MAP_OBJECTS_DATA;
  if (!M) return <p>Map-object data not loaded.</p>;

  const [filter, setFilter] = React.useState('all');

  const visibleCats = filter === 'all'
    ? M.OBJECTS
    : M.OBJECTS.filter(c => c.id === filter);

  const total = M.OBJECTS.reduce((n, c) => n + c.items.length, 0);

  return (
    <>
      <h1>Map objects</h1>
      <div className="controls">
        <div className="filter-group">
          <label>Category</label>
          <div className="seg">
            <button className={filter==='all'?'active':''}
                    onClick={()=>setFilter('all')}>All</button>
            {M.OBJECTS.map(c => (
              <button key={c.id}
                      className={filter===c.id?'active':''}
                      onClick={()=>setFilter(c.id)}>
                {shortLabel(c.id)} ({c.items.length})
              </button>
            ))}
          </div>
        </div>
        <span className="count">{total} objects</span>
      </div>

      {visibleCats.map(cat => (
        <section key={cat.id} className="mo-cat">
          <h2>{cat.label}</h2>
          <div className="mo-grid">
            {cat.items.map(o => <MapObjectCard key={o.id} o={o} />)}
          </div>
        </section>
      ))}
    </>
  );
};

function shortLabel(id) {
  return ({
    resources: 'Resources', treasure: 'Treasure', shrines: 'Shrines',
    dwellings: 'Dwellings', banks: 'Banks', travel: 'Travel',
    markets: 'Markets', special: 'Special', other: 'Other',
  })[id] || id;
}

const MapObjectCard = ({o}) => (
  <article className="mo-card">
    <img loading="lazy" className="mo-img"
         src={`img/map_objects/${o.id}.png`} alt=""
         onError={(e)=>{e.target.style.visibility='hidden';}} />
    <div className="mo-body">
      <h3 className="mo-name">{o.name}</h3>
      {o.desc && <p className="mo-desc">{o.desc}</p>}
      {o.narrative && (
        <p className="mo-narr"><em>{o.narrative}</em></p>
      )}
    </div>
  </article>
);

window.MapObjectsView = MapObjectsView;
