/* Single-unit detail page. Stats, attack type, passives, abilities, all
   variants of the same creature line. */

const UnitView = ({ unitId, go }) => {
  const D = window.OE_DATA;
  if (!D) return <p>Data not loaded.</p>;
  const u = D.UNITS.find(x => x.id === unitId);
  if (!u) {
    return (
      <div>
        <p>Unknown unit <code>{unitId}</code>.</p>
        <p><a href={window.OE_routeToUrl("units")}
              onClick={e=>{e.preventDefault();go('units');}}>← All units</a></p>
      </div>
    );
  }
  const fmeta = D.FACTIONS.find(f => f.id === u.faction);
  // All variants in this creature line — same faction + tier
  const variants = D.UNITS.filter(x => x.faction === u.faction && x.tier === u.tier)
                          .sort((a, b) => ['base','upg','alt'].indexOf(a.variant) - ['base','upg','alt'].indexOf(b.variant));

  // Heroes that start with this unit
  const starters = (D.HEROES || []).filter(h =>
    (h.armySegs || []).some(seg => seg.id === u.id));

  const dmg = u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}–${u.dmgMax}`;
  const atkGlyph = ({Melee:'⚔', Ranged:'🏹', Long:'⤙'})[u.attack] || '·';

  return (
    <>
      <p className="faction-page-actions">
        {fmeta && (
          <a href={window.OE_routeToUrl(`units/${u.faction}`)}
             onClick={e=>{e.preventDefault();go(`units/${u.faction}`);}}
             className="faction-page-cta">← {fmeta.name} units</a>
        )}{' '}
        <a href={window.OE_routeToUrl("units")}
           onClick={e=>{e.preventDefault();go('units');}}
           className="faction-page-cta">All units</a>
      </p>

      <div className="hero-page-head">
        <img loading="lazy" className="hero-page-portrait"
             src={`img/units/${u.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="hero-page-titles">
          <h1 className="hero-page-name">{u.name}</h1>
          <div className="hero-page-class">
            Tier {u.tier}{' · '}
            <span className={`variant variant-${u.variant}`}>
              {({base:'Base', upg:'Upgrade', alt:'Alt upgrade'})[u.variant] || u.variant}
            </span>
            {' · '}<span className={`atk-chip atk-${(u.attack||'').toLowerCase()}`}>
              <span className="atk-glyph">{atkGlyph}</span>{u.attack}
            </span>
            {fmeta && <> · <span className={`faction-pill faction-${u.faction}`}>{fmeta.name}</span></>}
          </div>
          <div className="hero-page-id mono">{u.id}</div>
        </div>
      </div>

      {u.narrative && (
        <section className="hero-section">
          <p className="hero-army" style={{maxWidth:'60em'}}>{u.narrative}</p>
        </section>
      )}

      <section className="hero-section">
        <h2>Stats</h2>
        <div className="hero-stats">
          <div><span className="lbl">HP</span><b>{u.hp ?? '—'}</b></div>
          <div><span className="lbl">Off</span><b>{u.off ?? '—'}</b></div>
          <div><span className="lbl">Def</span><b>{u.def ?? '—'}</b></div>
          <div><span className="lbl">Dmg</span><b>{dmg}</b></div>
          <div><span className="lbl">Init</span><b>{u.init ?? '—'}</b></div>
          <div><span className="lbl">Spd</span><b>{u.speed ?? '—'}</b></div>
          <div><span className="lbl">Cost</span><b>{u.cost?.toLocaleString() ?? '—'}</b></div>
          <div><span className="lbl">Squad val</span><b>{u.squadValue?.toLocaleString() ?? '—'}</b></div>
        </div>
      </section>

      {u.passives?.length > 0 && (
        <section className="hero-section">
          <h2>Passives</h2>
          <ul className="ucard-effect-list">
            {u.passives.map((p, i) => (
              <li key={i}>
                <span className="ucard-effect-name">{p.name}</span>
                {p.desc && <span className="ucard-effect-desc"> — {(p.desc || '').replace(/\{[0-9]+\}/g, '?')}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {u.abilities?.length > 0 && (
        <section className="hero-section">
          <h2>Active abilities</h2>
          <ul className="ucard-effect-list">
            {u.abilities.map((a, i) => (
              <li key={i}>
                <span className="ucard-effect-name">{a.name}</span>
                {a.desc && <span className="ucard-effect-desc"> — {(a.desc || '').replace(/\{[0-9]+\}/g, '?')}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {variants.length > 1 && (
        <section className="hero-section">
          <h2>Other variants in this creature line</h2>
          <div className="hero-roster">
            {variants.map(v => (
              <a key={v.id}
                 href={window.OE_routeToUrl(`unit/${v.id}`)}
                 onClick={e=>{e.preventDefault();go(`unit/${v.id}`);}}
                 className={`hero-roster-card${v.id === u.id ? ' current' : ''}`}>
                <img loading="lazy" className="hero-roster-portrait"
                     src={`img/units/${v.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <span className="hero-roster-name">{v.name}</span>
                <span className="hero-roster-spec">{({base:'Base', upg:'Upgrade', alt:'Alt'})[v.variant]}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {starters.length > 0 && (
        <section className="hero-section">
          <h2>Heroes who start with this unit</h2>
          <div className="hero-roster">
            {starters.map(h => (
              <a key={h.id}
                 href={window.OE_routeToUrl(`hero/${h.id}`)}
                 onClick={e=>{e.preventDefault();go(`hero/${h.id}`);}}
                 className="hero-roster-card">
                <img loading="lazy" className="hero-roster-portrait"
                     src={`img/heroes/${h.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <span className="hero-roster-name">{h.name}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
};

window.UnitView = UnitView;
