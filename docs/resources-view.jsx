/* Resources page — every resource the game tracks, with the in-game icon. */

const ResourcesView = () => {
  const R = window.OE_RESOURCES_DATA;
  if (!R) return <p>Resources data not loaded.</p>;

  // Group by category
  const byCat = {};
  for (const r of R.RESOURCES) (byCat[r.category] = byCat[r.category] || []).push(r);

  return (
    <>
      <h1>Resources</h1>
      <p className="lede">
        The eight resources the game tracks — primary (Gold / Wood / Ore),
        rare (Gems / Crystal / Mercury), plus Alchemical Dust and Graal.
        Icons pulled from <code>resources.assets</code>; tactical notes
        synthesized for tournament/Exodus play.
      </p>

      {Object.keys(R.CATEGORY_LABEL).map(catKey => {
        const items = byCat[catKey] || [];
        if (!items.length) return null;
        return (
          <section key={catKey} className="res-section">
            <h2>{R.CATEGORY_LABEL[catKey]}</h2>
            <div className="res-grid">
              {items.map(r => <ResourceCard key={r.id} r={r} />)}
            </div>
          </section>
        );
      })}

      <p className="note">
        Generated {R.GENERATED_AT}.
      </p>
    </>
  );
};

const ResourceCard = ({r}) => (
  <article className={`res-card res-card-${r.id}`}>
    <img loading="lazy" className="res-img"
         src={`img/resources/${r.id}.png`} alt=""
         onError={(e)=>{e.target.style.visibility='hidden';}} />
    <div className="res-body">
      <h3 className="res-name">{r.name}</h3>
      {r.narrative && <p className="res-narr"><em>{r.narrative}</em></p>}
      {r.tactical && <p className="res-tactical">{r.tactical}</p>}
    </div>
  </article>
);

window.ResourcesView = ResourcesView;
