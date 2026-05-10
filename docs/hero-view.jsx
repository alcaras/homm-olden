/* Single-hero detail page — game-derived data only (portrait, faction/class,
   stats, starting skills, starting spells, starting army, specialization).
   Plus the lexiav-grounded tier-list note for this hero (if any). */

const HeroView = ({ heroId, go }) => {
  const D = window.OE_DATA;
  const T = window.OE_TIER_DATA;
  if (!D) return <p>Data not loaded.</p>;

  const h = D.HEROES.find(x => x.id === heroId);
  if (!h) {
    return (
      <div>
        <p>Unknown hero <code>{heroId}</code>.</p>
        <p>
          <a href={window.OE_routeToUrl("heroes")}
             onClick={e=>{e.preventDefault();go('heroes');}}>← Back to heroes</a>
        </p>
      </div>
    );
  }

  const fmeta = D.FACTIONS.find(f => f.id === h.faction);
  const className = h.kind === 'might' ? fmeta?.might : fmeta?.magic;

  // Tier-list entry for this hero (lexiav-sourced)
  let tierEntry = null;
  if (T?.BY_FACTION) {
    const list = T.BY_FACTION[h.faction] || [];
    tierEntry = list.find(r => r.id === heroId);
  }

  // Other heroes in this faction (for navigation)
  const factionRoster = D.HEROES.filter(x => x.faction === h.faction);

  return (
    <>
      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl(`faction/${h.faction}`)}
           onClick={e=>{e.preventDefault();go(`faction/${h.faction}`);}}
           className="faction-page-cta">
          ← {fmeta?.name} faction
        </a>
        {' '}
        <a href={window.OE_routeToUrl("heroes")}
           onClick={e=>{e.preventDefault();go('heroes');}}
           className="faction-page-cta">
          All heroes
        </a>
      </p>

      <div className="hero-page-head">
        <img loading="lazy" className="hero-page-portrait"
             src={`img/heroes/${h.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="hero-page-titles">
          <h1 className="hero-page-name">{h.name}</h1>
          <div className="hero-page-class">
            <span className={h.kind==='might'?'glyph glyph-might':'glyph glyph-magic'}>
              {h.kind==='might' ? '⚔' : '✦'}
            </span>{' '}
            {className}
            {fmeta && <> · <span className={`faction-pill faction-${h.faction}`}>{fmeta.name}</span></>}
          </div>
          <div className="hero-page-id mono">{h.id}</div>
        </div>
      </div>

      {/* Specialization */}
      {h.specialty && (
        <section className="hero-section">
          <h2>Specialization</h2>
          <div className="hero-spec">
            {h.specId && (
              <img loading="lazy" className="hero-spec-icon"
                   src={`img/specs/${h.specId}.png`} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
            )}
            <div>
              <div className="hero-spec-name">{h.specialty}</div>
              {h.specDesc && <p className="hero-spec-desc">{h.specDesc}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Starting stats */}
      <section className="hero-section">
        <h2>Starting stats</h2>
        <div className="hero-stats">
          <div><span className="lbl">Attack</span><b>{h.stats.A}</b></div>
          <div><span className="lbl">Defense</span><b>{h.stats.D}</b></div>
          <div><span className="lbl">Power</span><b>{h.stats.P}</b></div>
          <div><span className="lbl">Knowledge</span><b>{h.stats.K}</b></div>
        </div>
      </section>

      {/* Starting skills */}
      {h.skills?.length > 0 && (
        <section className="hero-section">
          <h2>Starting skills</h2>
          <div className="hero-chips">
            {h.skills.map((s, i) => <span key={i} className="skill-chip">{s}</span>)}
          </div>
        </section>
      )}

      {/* Starting spells */}
      {h.spells?.length > 0 && (
        <section className="hero-section">
          <h2>Starting spells</h2>
          <ul className="hero-spell-list">
            {h.spells.map(s => (
              <li key={s.id} className="hero-spell-row">
                <img loading="lazy" className="hero-spell-icon"
                     src={`img/spells/${s.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <div>
                  <div className="hero-spell-name">{s.name}</div>
                  <div className="hero-spell-meta">L{s.level} {s.learned ? '· learned' : ''}</div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Starting army */}
      {h.army && (
        <section className="hero-section">
          <h2>Starting army</h2>
          <p className="hero-army">{h.army}</p>
          {h.armyScore != null && (
            <p className="hero-army-score">Army score: <b>{h.armyScore.toLocaleString()}</b></p>
          )}
        </section>
      )}

      {/* Tier-list entry (lexiav) */}
      {tierEntry && (
        <section className="hero-section">
          <h2>Tier list (lexiav)</h2>
          <div className="hero-tier-row">
            <span className={`tier-badge tier-${tierEntry.tier}`}>{tierEntry.tier}</span>
            <span className="hero-tier-note">{tierEntry.note}</span>
          </div>
        </section>
      )}

      {/* Other heroes in this faction */}
      <section className="hero-section">
        <h2>Other {fmeta?.name} heroes</h2>
        <div className="hero-roster">
          {factionRoster.map(r => (
            <a key={r.id}
               href={window.OE_routeToUrl(`hero/${r.id}`)}
               onClick={e=>{e.preventDefault();go(`hero/${r.id}`);}}
               className={`hero-roster-card${r.id === h.id ? ' current' : ''}`}>
              <img loading="lazy" className="hero-roster-portrait"
                   src={`img/heroes/${r.id}.png`} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
              <span className="hero-roster-name">{r.name}</span>
              <span className="hero-roster-spec">{r.specialty}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

window.HeroView = HeroView;
