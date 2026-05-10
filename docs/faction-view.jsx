/* Per-faction page — keeps lexiav-grounded tier list + game-derived structure
   only. Synthesized commentary (build orders, army comp, signature mechanic
   summaries, faction guide notes, counter-pick narratives) was removed at
   the user's request — those weren't directly in the source materials. */

const TIER_ORDER = ['S', 'A', 'B', 'C'];
const TIER_LABEL = {
  S: 'perma-pick / perma-ban',
  A: 'strong contested',
  B: 'situational / playable',
  C: 'avoid',
};

const FactionView = ({ factionId, go }) => {
  const T = window.OE_TIER_DATA;
  const D = window.OE_DRAFT_DATA;
  if (!T) return <p>Tier data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const fmeta = FACTIONS.find(f => f.id === factionId);
  if (!fmeta) {
    return (
      <div>
        <p>Unknown faction <code>{factionId}</code>.</p>
        <p><a href={window.OE_routeToUrl("factions")} onClick={e=>{e.preventDefault();go('factions');}}>Back to factions</a></p>
      </div>
    );
  }

  const heroes   = (T.BY_FACTION && T.BY_FACTION[factionId]) || [];
  const heroBans = (D?.HERO_BANS && D.HERO_BANS[factionId]) || [];

  return (
    <>
      <FactionSwitcher current={factionId} factions={FACTIONS} go={go} />

      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl(`buildings/${factionId}`)}
           onClick={e=>{e.preventDefault();go(`buildings/${factionId}`);}}
           className="faction-page-cta">
          {fmeta.name} buildings calc →
        </a>
        {' '}
        <a href={window.OE_routeToUrl(`laws/${factionId}`)}
           onClick={e=>{e.preventDefault();go(`laws/${factionId}`);}}
           className="faction-page-cta">
          {fmeta.name} laws calc →
        </a>
        {' '}
        <a href={window.OE_routeToUrl(`units/${factionId}`)}
           onClick={e=>{e.preventDefault();go(`units/${factionId}`);}}
           className="faction-page-cta">
          {fmeta.name} units →
        </a>
      </p>

      <div className="faction-hero">
        <img className="faction-hero-icon" loading="lazy"
             src={`img/factions/fraction_${fmeta.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="faction-hero-body">
          <h1 className="faction-hero-name">{fmeta.name}</h1>
          <div className="faction-hero-classes">
            <span className="glyph glyph-might">⚔</span> {fmeta.might}
            {' · '}
            <span className="glyph glyph-magic">✦</span> {fmeta.magic}
            {fmeta.skill && <span className="faction-hero-skill"> · {fmeta.skill}</span>}
          </div>
        </div>
      </div>

      {/* Hero tier list — sourced from advice/lexiav.md */}
      <h2>Hero tier list</h2>
      {TIER_ORDER.map(tier => {
        const t_rows = heroes.filter(r => r.tier === tier);
        if (t_rows.length === 0) return null;
        return (
          <div key={tier} className={`tier-block tier-block-${tier}`}>
            <div className="tier-head">
              <span className={`tier-badge tier-${tier}`}>{tier}</span>
              <span className="tier-label">{TIER_LABEL[tier]}</span>
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
                        {h.kind==='might' ? fmeta.might : fmeta.magic}
                      </span>
                      <span className="th-specialty">{h.specialty}</span>
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

      {/* Top hero bans — derived from the lexiav tier list */}
      {heroBans.length > 0 && (
        <>
          <h2>Top hero bans against {fmeta.name}</h2>
          <ol className="ban-list ban-list-tall">
            {heroBans.map(h => (
              <li key={h.id}>
                <img loading="lazy" className="ban-portrait"
                     src={`img/heroes/${h.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <div className="ban-body">
                  <div className="ban-name">{h.name}</div>
                  <div className="ban-why">{h.why}</div>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </>
  );
};

const FactionSwitcher = ({current, factions, go}) => (
  <div className="faction-switcher">
    {factions.map(f => (
      <a key={f.id}
         href={window.OE_routeToUrl(`faction/${f.id}`)}
         onClick={e=>{e.preventDefault();go(`faction/${f.id}`);}}
         className={f.id === current ? 'active' : ''}>
        <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.display='none';}} />
        <span>{f.name}</span>
      </a>
    ))}
  </div>
);

const FactionsHubView = ({go}) => {
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  return (
    <>
      <h1>Factions</h1>
      <div className="card-grid">
        {FACTIONS.map(f => (
          <a key={f.id} className="card faction-card"
             href={window.OE_routeToUrl(`faction/${f.id}`)}
             onClick={e=>{e.preventDefault();go(`faction/${f.id}`);}}>
            <div className="faction-card-head">
              <img loading="lazy" className="faction-card-icon"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.display='none';}} />
              <div>
                <div className="card-eyebrow">{f.might} / {f.magic}</div>
                <div className="card-title">{f.name}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </>
  );
};

window.FactionView = FactionView;
window.FactionsHubView = FactionsHubView;
