/* Per-faction unit browser — for one faction, all 7 tiers, with base /
   main upgrade / alt upgrade as 3 column cards each, plus passives,
   abilities, stats, and the narrative blurb. */

const VARIANT_LABEL = {
  base: 'Base',
  upg:  'Upgrade',
  alt:  'Alt upgrade',
};

const ATTACK_GLYPH = {
  Melee:  '⚔',
  Ranged: '🏹',
  Long:   '⤙',
};

const FactionUnitsView = ({ factionId, go }) => {
  const D = window.OE_DATA;
  if (!D) return <p>Data not loaded.</p>;
  const fmeta = D.FACTIONS.find(f => f.id === factionId);
  if (!fmeta) {
    return (
      <div>
        <p>Unknown faction <code>{factionId}</code>.</p>
        <p><a href={window.OE_routeToUrl("units")} onClick={e=>{e.preventDefault();go('units');}}>Back to units</a></p>
      </div>
    );
  }

  const units = D.UNITS.filter(u => u.faction === factionId);
  const tiers = Array.from(new Set(units.map(u => u.tier))).sort((a, b) => a - b);

  return (
    <>
      <FactionUnitsSwitcher current={factionId} factions={D.FACTIONS} go={go} />

      <div className="faction-hero">
        <img className="faction-hero-icon" loading="lazy"
             src={`img/factions/fraction_${fmeta.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="faction-hero-body">
          <h1 className="faction-hero-name">{fmeta.name} — units</h1>
          <div className="faction-hero-classes">
            7 tiers · base / upgrade / alt upgrade
          </div>
        </div>
      </div>

      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl(`faction/${factionId}`)}
           onClick={e=>{e.preventDefault();go(`faction/${factionId}`);}}
           className="faction-page-cta">
          ← {fmeta.name} faction page
        </a>
        {' '}
        <a href={window.OE_routeToUrl("units")}
           onClick={e=>{e.preventDefault();go('units');}}
           className="faction-page-cta">
          All-units sortable table →
        </a>
      </p>

      {tiers.map(tier => {
        const inTier = units.filter(u => u.tier === tier);
        // Order: base, upg, alt
        const ordered = ['base', 'upg', 'alt']
          .map(v => inTier.find(u => u.variant === v))
          .filter(Boolean);
        return (
          <section key={tier} className="ftier-block">
            <div className="ftier-head">
              <span className="ftier-num">Tier {tier}</span>
              <span className="ftier-count">
                {ordered.map(u => u.name).join(' / ')}
              </span>
            </div>
            <div className="ftier-grid">
              {ordered.map(u => <UnitCard key={u.id} u={u} fmeta={fmeta} />)}
            </div>
          </section>
        );
      })}

      <p className="note">
        Generated alongside <code>data.js</code> by{' '}
        <code>build_data_js.py</code>. Stats, passives, and abilities pulled
        directly from the game's JSON files; effect descriptions still contain
        runtime placeholders (rendered as <code>?</code>) until the bonus-arg
        resolver is wired up.
      </p>
    </>
  );
};

const UnitCard = ({u, fmeta}) => {
  const atk = u.attack || 'Melee';
  const dmg = u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}–${u.dmgMax}`;
  return (
    <article className={`ucard ucard-${u.variant}`}>
      <header className="ucard-head">
        <img loading="lazy" className="ucard-icon"
             src={`img/units/${u.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="ucard-head-body">
          <div className="ucard-variant-row">
            <span className={`variant variant-${u.variant}`}>
              {VARIANT_LABEL[u.variant] || u.variant}
            </span>
            <span className={`atk-chip atk-${atk.toLowerCase()}`}>
              <span className="atk-glyph">{ATTACK_GLYPH[atk] || '·'}</span>{atk}
            </span>
          </div>
          <h3 className="ucard-name">{u.name}</h3>
          <div className="ucard-id mono">{u.id}</div>
        </div>
      </header>

      {u.narrative && <p className="ucard-narr">{u.narrative}</p>}

      <div className="ucard-stats">
        <div><span className="lbl">HP</span><b>{u.hp ?? '—'}</b></div>
        <div><span className="lbl">Off</span><b>{u.off ?? '—'}</b></div>
        <div><span className="lbl">Def</span><b>{u.def ?? '—'}</b></div>
        <div><span className="lbl">Dmg</span><b>{dmg}</b></div>
        <div><span className="lbl">Init</span><b>{u.init ?? '—'}</b></div>
        <div><span className="lbl">Spd</span><b>{u.speed ?? '—'}</b></div>
        <div><span className="lbl">Cost</span><b>{u.cost?.toLocaleString() ?? '—'}</b></div>
        <div><span className="lbl">Value</span><b>{u.squadValue?.toLocaleString() ?? '—'}</b></div>
      </div>

      {(u.passives?.length || u.abilities?.length) ? (
        <div className="ucard-effects">
          {u.passives?.length > 0 && (
            <div className="ucard-effect-block">
              <div className="ucard-effect-head">Passives</div>
              <ul className="ucard-effect-list">
                {u.passives.map((p, i) => (
                  <li key={i}>
                    <span className="ucard-effect-name">{p.name}</span>
                    {p.desc && <span className="ucard-effect-desc"> — {(p.desc || '').replace(/\{[0-9]+\}/g, '?')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {u.abilities?.length > 0 && (
            <div className="ucard-effect-block">
              <div className="ucard-effect-head">Active abilities</div>
              <ul className="ucard-effect-list">
                {u.abilities.map((a, i) => (
                  <li key={i}>
                    <span className="ucard-effect-name">{a.name}</span>
                    {a.desc && <span className="ucard-effect-desc"> — {(a.desc || '').replace(/\{[0-9]+\}/g, '?')}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="ucard-no-effects">No special abilities</div>
      )}
    </article>
  );
};

const FactionUnitsSwitcher = ({current, factions, go}) => (
  <div className="faction-switcher">
    {factions.map(f => (
      <a key={f.id}
         href={window.OE_routeToUrl(`units/${f.id}`)}
         onClick={e=>{e.preventDefault();go(`units/${f.id}`);}}
         className={f.id === current ? 'active' : ''}>
        <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.display='none';}} />
        <span>{f.name}</span>
      </a>
    ))}
  </div>
);

window.FactionUnitsView = FactionUnitsView;
