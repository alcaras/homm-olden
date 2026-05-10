/* Single-spell detail page. Shows the in-game icon, school, tier, mana,
   cooldown, full description, and which heroes start with this spell. */

const SpellView = ({ spellId, go }) => {
  const S = window.OE_SPELLS_DATA;
  if (!S) return <p>Spells data not loaded.</p>;
  const sp = S.SPELLS.find(x => x.id === spellId);
  if (!sp) {
    return (
      <div>
        <p>Unknown spell <code>{spellId}</code>.</p>
        <p><a href={window.OE_routeToUrl("spells")}
              onClick={e=>{e.preventDefault();go('spells');}}>← All spells</a></p>
      </div>
    );
  }
  const school = (S.SCHOOLS || []).find(s => s.id === sp.school);
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const facById = Object.fromEntries(FACTIONS.map(f => [f.id, f]));
  const manaUniq = Array.from(new Set(sp.manaCost));
  const manaText = manaUniq.length === 1
    ? `${manaUniq[0]} mana`
    : `${Math.min(...sp.manaCost)}–${Math.max(...sp.manaCost)} mana`;

  return (
    <>
      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl("spells")}
           onClick={e=>{e.preventDefault();go('spells');}}
           className="faction-page-cta">← All spells</a>
      </p>

      <div className="spell-page-head">
        <img loading="lazy" className="spell-page-icon"
             src={`img/spells/${sp.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div>
          <h1 className="spell-page-name">{sp.name}</h1>
          <div className="spell-page-meta">
            {school && <span className={`mt-tag mt-tag-${sp.school}`}>{school.name}</span>}
            {' '}
            {sp.tier > 0 && <span className="mt-tag">Tier {sp.tier}</span>}
            {' '}
            {sp.scope === 'world' && <span className="mt-tag mt-tag-tournament">World</span>}
            {' '}
            {sp.magicType && <span className="mt-tag mt-tag-size">{sp.magicType}</span>}
            {' '}
            <span className="mt-tag mt-tag-players">{manaText}</span>
            {sp.cooldown && <> <span className="mt-tag mt-tag-players">CD {sp.cooldown}r</span></>}
          </div>
          <div className="spell-page-id mono">{sp.id}</div>
        </div>
      </div>

      {(sp.descResolved || sp.desc) && (
        <section className="hero-section">
          <h2>Effect</h2>
          <p className="spell-page-desc">{sp.descResolved || sp.desc.replace(/\{[0-9]+\}/g, '?')}</p>
        </section>
      )}

      {sp.starters?.length > 0 && (
        <section className="hero-section">
          <h2>Heroes who start with this spell</h2>
          <div className="hero-roster">
            {sp.starters.map(h => (
              <a key={h.id}
                 href={window.OE_routeToUrl(`hero/${h.id}`)}
                 onClick={e=>{e.preventDefault();go(`hero/${h.id}`);}}
                 className="hero-roster-card">
                <img loading="lazy" className="hero-roster-portrait"
                     src={`img/heroes/${h.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <span className="hero-roster-name">{h.name}</span>
                {facById[h.faction] && (
                  <span className={`faction-pill faction-${h.faction}`}>{facById[h.faction].name}</span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

window.SpellView = SpellView;
