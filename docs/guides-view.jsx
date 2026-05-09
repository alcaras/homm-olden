/* Faction guides — building order + law priorities per faction */

const GuidesView = () => {
  const G = window.OE_GUIDES_DATA;
  if (!G) return <p>Guides data not loaded.</p>;

  const SITE_FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionMeta = Object.fromEntries(SITE_FACTIONS.map(f => [f.id, f]));

  const [factionId, setFactionId] = React.useState(G.FACTIONS[0]?.id);

  const current = G.FACTIONS.find(f => f.id === factionId) || G.FACTIONS[0];
  const fmeta = factionMeta[current?.id];

  const PrioBadge = ({p}) => {
    const cls = `prio-badge prio-${p === 'trap' ? 'trap' : p}`;
    const label = p === 'trap' ? 'skip' : p;
    return <span className={cls}>{label}</span>;
  };

  return (
    <>
      <h1>Faction guides</h1>
      <p className="lede">
        Tournament/Exodus single-hero PvP. Per-faction build-order priorities and law priority lists,
        synthesized from creator commentary and cross-referenced against game data.
      </p>

      {/* universal tips */}
      <h2>Universal tips</h2>
      <div className="tips">
        {G.UNIVERSAL_TIPS.map(t => (
          <div className="tip" key={t.title}>
            <div className="tip-title">{t.title}</div>
            <div className="tip-body">{t.body}</div>
          </div>
        ))}
      </div>

      {/* faction selector */}
      <div className="controls">
        <div className="filter-group">
          <label>Faction</label>
          <div className="seg">
            {G.FACTIONS.map(f => (
              <button key={f.id}
                      className={f.id === factionId ? 'active' : ''}
                      onClick={() => setFactionId(f.id)}>
                {f.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {current && (
        <section className="faction-guide">
          <div className="faction-band">
            {fmeta && (
              <img className="faction-band-icon" loading="lazy"
                   src={`img/factions/fraction_${fmeta.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
            )}
            <div>
              <div className="name">{current.name}</div>
              {fmeta && <div className="skill">{fmeta.might} / {fmeta.magic}</div>}
            </div>
          </div>
          <p className="faction-summary">{current.summary}</p>

          <div className="guide-grid">
            {/* Build order */}
            <div className="guide-col">
              <h3>Build order</h3>
              <table className="guide-table">
                <thead>
                  <tr>
                    <th className="phase-col">Phase</th>
                    <th>Building</th>
                    <th className="prio-col"></th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {current.buildOrder.map((b, i) => (
                    <tr key={`b${i}`}>
                      <td className="phase-col"><span className="phase">{b.phase}</span></td>
                      <td>
                        <div className="b-name">{b.name}</div>
                        <code className="b-id">{b.shortId}</code>
                      </td>
                      <td className="prio-col"><PrioBadge p={b.priority} /></td>
                      <td className="note-col">{b.note}</td>
                    </tr>
                  ))}
                  {current.buildingTraps.length > 0 && (
                    <tr className="traps-divider"><td colSpan="4">Traps to avoid</td></tr>
                  )}
                  {current.buildingTraps.map((b, i) => (
                    <tr key={`bt${i}`} className="trap-row">
                      <td className="phase-col"><span className="phase phase-skip">—</span></td>
                      <td>
                        <div className="b-name">{b.name}</div>
                        <code className="b-id">{b.shortId}</code>
                      </td>
                      <td className="prio-col"><PrioBadge p={b.priority} /></td>
                      <td className="note-col">{b.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Laws */}
            <div className="guide-col">
              <h3>Law priorities</h3>
              <table className="guide-table">
                <thead>
                  <tr>
                    <th className="num-col">#</th>
                    <th>Law</th>
                    <th className="prio-col"></th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {current.lawsTop.map((l, i) => (
                    <tr key={`l${i}`}>
                      <td className="num-col">{l.num}</td>
                      <td>
                        <div className="b-name">{l.name}</div>
                        <div className="l-desc">{l.desc}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={l.priority} /></td>
                      <td className="note-col">{l.note}</td>
                    </tr>
                  ))}
                  {current.lawsTraps.length > 0 && (
                    <tr className="traps-divider"><td colSpan="4">Traps to avoid</td></tr>
                  )}
                  {current.lawsTraps.map((l, i) => (
                    <tr key={`lt${i}`} className="trap-row">
                      <td className="num-col">{l.num}</td>
                      <td>
                        <div className="b-name">{l.name}</div>
                        <div className="l-desc">{l.desc}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={l.priority} /></td>
                      <td className="note-col">{l.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <p className="note">
        Generated {G.GENERATED_AT}. Edit <code>catalog/scripts/build_faction_guides.py</code> and rerun to refresh.
      </p>
    </>
  );
};

window.GuidesView = GuidesView;
