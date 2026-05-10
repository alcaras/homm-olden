/* Per-faction combined page — tier list + build + laws + army comp + matchups,
   all for a single faction. Reads from tier-data.js, guides-data.js, draft-data.js. */

const TIER_ORDER = ['S', 'A', 'B', 'C'];
const TIER_LABEL = {
  S: 'perma-pick / perma-ban',
  A: 'strong contested',
  B: 'situational / playable',
  C: 'avoid',
};

const FactionView = ({ factionId, go }) => {
  const T = window.OE_TIER_DATA;
  const G = window.OE_GUIDES_DATA;
  const D = window.OE_DRAFT_DATA;
  if (!T || !G || !D) return <p>Faction data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const fmeta = FACTIONS.find(f => f.id === factionId);
  if (!fmeta) {
    return (
      <div>
        <p>Unknown faction <code>{factionId}</code>.</p>
        <p><a href="#factions" onClick={e=>{e.preventDefault();go('factions');}}>Back to factions</a></p>
      </div>
    );
  }

  const tierMeta = (T.FACTION_META && T.FACTION_META[factionId]) || {};
  const heroes   = (T.BY_FACTION && T.BY_FACTION[factionId]) || [];
  const guide    = (G.FACTIONS || []).find(f => f.id === factionId);
  const heroBans = (D.HERO_BANS && D.HERO_BANS[factionId]) || [];
  const myCounter   = D.COUNTERS && D.COUNTERS[factionId];   // I face this faction → my best response
  // Reverse: which factions counter me? Walk COUNTERS where target == this faction.
  const counteredBy = Object.entries(D.COUNTERS || {})
    .filter(([opFid, c]) => c.primary?.factionId === factionId || c.alt?.factionId === factionId)
    .map(([opFid, c]) => ({
      opFid,
      opName: FACTIONS.find(f => f.id === opFid)?.name || opFid,
      primary: c.primary?.factionId === factionId ? c.primary : null,
      alt:     c.alt?.factionId     === factionId ? c.alt     : null,
    }));

  const factionBan  = (D.FACTION_BAN_ORDER  || []).find(r => r.faction === factionId);
  const factionPick = (D.FACTION_PICK_ORDER || []).find(r => r.faction === factionId);

  const PrioBadge = ({p}) => {
    const cls = `prio-badge prio-${p === 'trap' ? 'trap' : p}`;
    const label = p === 'trap' ? 'skip' : p;
    return <span className={cls}>{label}</span>;
  };

  const FactionPill = ({fid}) => {
    const f = FACTIONS.find(x => x.id === fid);
    return (
      <a href={`#faction/${fid}`}
         onClick={e=>{e.preventDefault();go(`faction/${fid}`);}}
         className={`faction-pill faction-${fid}`}>
        {f?.name || fid}
      </a>
    );
  };

  return (
    <>
      <FactionSwitcher current={factionId} factions={FACTIONS} go={go} />

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

      {tierMeta.summary && <p className="lede faction-lede">{tierMeta.summary}</p>}
      {tierMeta.creature_tip && (
        <p className="faction-tip"><em>Creature tip:</em> {tierMeta.creature_tip}</p>
      )}

      {tierMeta.signature_mechanic && (
        <div className="signature-mechanic">
          <div className="signature-mechanic-eyebrow">Signature mechanic</div>
          <div className="signature-mechanic-title">{tierMeta.signature_mechanic.title}</div>
          <p className="signature-mechanic-body">{tierMeta.signature_mechanic.body}</p>
          <p className="signature-mechanic-link">
            <a href="#mechanics" onClick={e=>{e.preventDefault();go('mechanics');}}>
              Mechanics 101 →
            </a>
          </p>
        </div>
      )}

      <div className="faction-meta-cards">
        {factionBan && (
          <div className="meta-card">
            <div className="meta-card-eyebrow">Faction ban priority</div>
            <div className="meta-card-body">
              {typeof factionBan.rank === 'number'
                ? <><b>#{factionBan.rank}</b> opponents will consider banning this faction.</>
                : factionBan.rank === 'anti'
                  ? <b>Anti-pattern — don't ban.</b>
                  : <b>Skip — not a high-priority faction ban.</b>}
            </div>
            <div className="meta-card-why">{factionBan.why}</div>
          </div>
        )}
        {factionPick && (
          <div className="meta-card">
            <div className="meta-card-eyebrow">Faction pick priority</div>
            <div className="meta-card-body">
              <b>#{(D.FACTION_PICK_ORDER.findIndex(r => r.faction === factionId) + 1)}</b>{' '}
              of {D.FACTION_PICK_ORDER.length} when picking faction.
            </div>
            <div className="meta-card-why">{factionPick.why}</div>
          </div>
        )}
      </div>

      {/* ---------------- TIER LIST ---------------- */}
      <h2>Hero tier list</h2>
      <div className="tier-scale">
        <span><b>S</b> perma-pick / perma-ban</span>
        <span><b>A</b> strong contested</span>
        <span><b>B</b> situational / playable</span>
        <span><b>C</b> avoid</span>
        <span className="tier-derived-key"><em>(data)</em> uncited — derived from extracted data</span>
      </div>
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
                      {h.derived && <span className="th-derived">data</span>}
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

      {/* ---------------- WHAT OPPONENTS BAN ---------------- */}
      {heroBans.length > 0 && (
        <>
          <h2>Top hero bans against {fmeta.name}</h2>
          <p className="note">
            These are the heroes opposing players will most likely ban from you (in
            priority order). With the standard 3-ban format, expect the top three to
            be gone — plan to play whichever surviving hero best matches your draft.
          </p>
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

      {/* ---------------- WHAT TO BUILD ---------------- */}
      {guide && (
        <>
          <h2>What to build</h2>
          {guide.summary && <p className="faction-summary">{guide.summary}</p>}

          <div className="guide-grid">
            <div className="guide-col">
              <h3>Build order</h3>
              <table className="guide-table">
                <thead>
                  <tr>
                    <th className="phase-col">Phase</th>
                    <th>Building</th>
                    <th className="prio-col">Prio</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.buildOrder.map((b, i) => (
                    <tr key={i}>
                      <td className="phase-col"><span className="phase">{b.phase}</span></td>
                      <td>
                        <div className="b-name">{b.name}</div>
                        <div className="b-id mono">{b.shortId}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={b.priority} /></td>
                      <td className="note-col">{b.note}</td>
                    </tr>
                  ))}
                  {guide.buildingTraps?.length > 0 && (
                    <tr className="traps-divider">
                      <td colSpan={4}>Traps — explicitly skip</td>
                    </tr>
                  )}
                  {(guide.buildingTraps || []).map((b, i) => (
                    <tr key={`t${i}`} className="trap-row">
                      <td className="phase-col"><span className="phase phase-skip">—</span></td>
                      <td>
                        <div className="b-name">{b.name}</div>
                        <div className="b-id mono">{b.shortId}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={b.priority} /></td>
                      <td className="note-col">{b.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="guide-col">
              <h3>Law priorities</h3>
              <table className="guide-table">
                <thead>
                  <tr>
                    <th className="num-col">#</th>
                    <th>Law</th>
                    <th className="prio-col">Prio</th>
                    <th>Why</th>
                  </tr>
                </thead>
                <tbody>
                  {guide.lawsTop.map((l, i) => (
                    <tr key={i}>
                      <td className="num-col">{l.num}</td>
                      <td>
                        <div className="b-name">{l.name}</div>
                        <div className="l-desc">{(l.desc || '').split('\n')[0]}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={l.priority} /></td>
                      <td className="note-col">{l.note}</td>
                    </tr>
                  ))}
                  {guide.lawsTraps?.length > 0 && (
                    <tr className="traps-divider">
                      <td colSpan={4}>Traps — explicitly skip</td>
                    </tr>
                  )}
                  {(guide.lawsTraps || []).map((l, i) => (
                    <tr key={`t${i}`} className="trap-row">
                      <td className="num-col">{l.num}</td>
                      <td>
                        <div className="b-name">{l.name}</div>
                        <div className="l-desc">{(l.desc || '').split('\n')[0]}</div>
                      </td>
                      <td className="prio-col"><PrioBadge p={l.priority} /></td>
                      <td className="note-col">{l.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ---------------- ARMY COMPOSITION ---------------- */}
      {tierMeta.army_comp && (
        <>
          <h2>Army composition</h2>
          <table className="guide-table army-comp-table">
            <thead>
              <tr>
                <th className="phase-col">Tier</th>
                <th>Preferred unit</th>
                <th>Why</th>
              </tr>
            </thead>
            <tbody>
              {tierMeta.army_comp.map((row, i) => (
                <tr key={i}>
                  <td className="phase-col"><span className="phase">{row[0]}</span></td>
                  <td><div className="b-name">{row[1]}</div></td>
                  <td className="note-col">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tierMeta.army_tactics && (
            <>
              <h3>Key tactics</h3>
              <ul className="tactics-list">
                {tierMeta.army_tactics.map((t, i) => <li key={i}>{t}</li>)}
              </ul>
            </>
          )}

          {tierMeta.army_phases && (
            <>
              <h3>Ideal army comp by tournament phase</h3>
              <p className="note">
                Tournament Pandora-box / camp fights scale across the run:
                <b> 1-2-3</b> camps in week 1, <b>1-3-5</b> in week 2,
                <b> 1-4-7</b> by the week-3 breakthrough and final duel. Your
                army should match.
              </p>
              <div className="phase-grid">
                {tierMeta.army_phases.map((p, i) => (
                  <div className="phase-card" key={i}>
                    <div className="phase-card-head">{p[0]}</div>
                    <div className="phase-card-body">{p[1]}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ---------------- MATCHUPS ---------------- */}
      <h2>Matchups</h2>

      {myCounter && (
        <>
          <h3>If you face {fmeta.name} as opponent — your best counter</h3>
          <table className="guide-table counter-matrix">
            <thead><tr><th>Primary counter</th><th>Why</th><th>Alt counter</th><th>Why</th></tr></thead>
            <tbody>
              <tr>
                <td><FactionPill fid={myCounter.primary.factionId} /></td>
                <td className="note-col">{myCounter.primary.why}</td>
                <td><FactionPill fid={myCounter.alt.factionId} /></td>
                <td className="note-col">{myCounter.alt.why}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      {counteredBy.length > 0 && (
        <>
          <h3>{fmeta.name} as a counter-pick — when to take this faction</h3>
          <p className="note">
            These are the matchups where {fmeta.name} is the recommended response. If
            your opponent commits one of these factions and {fmeta.name} is still
            open, this is a strong counter-pick.
          </p>
          <table className="guide-table">
            <thead>
              <tr>
                <th>Opponent picked</th>
                <th>Role</th>
                <th>Why {fmeta.name} answers it</th>
              </tr>
            </thead>
            <tbody>
              {counteredBy.map((c, i) => (
                <React.Fragment key={i}>
                  {c.primary && (
                    <tr>
                      <td><FactionPill fid={c.opFid} /></td>
                      <td><span className="prio-badge prio-S">primary</span></td>
                      <td className="note-col">{c.primary.why}</td>
                    </tr>
                  )}
                  {c.alt && (
                    <tr>
                      <td><FactionPill fid={c.opFid} /></td>
                      <td><span className="prio-badge prio-B">alt</span></td>
                      <td className="note-col">{c.alt.why}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      )}

      <p className="note">
        Tier-list verdicts from <code>build_tier_list.py</code>;
        build/law plan from <code>build_faction_guides.py</code>;
        ban/counter notes from <code>build_draft_guide.py</code>.
        All grounded in <code>notes-from-videos.md</code> and the extracted game data.
      </p>
    </>
  );
};

const FactionSwitcher = ({current, factions, go}) => (
  <div className="faction-switcher">
    {factions.map(f => (
      <a key={f.id}
         href={`#faction/${f.id}`}
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
  const T = window.OE_TIER_DATA;
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const tips = (window.OE_GUIDES_DATA && window.OE_GUIDES_DATA.UNIVERSAL_TIPS) || [];

  return (
    <>
      <h1>Factions</h1>
      <p className="lede">
        Per-faction tournament playbook for single-hero Exodus PvP. Each card opens
        a combined page: hero tier list, build order, law priorities, army composition,
        bans your opponent will throw at you, and matchup counter-picks.
      </p>

      <div className="card-grid">
        {FACTIONS.map(f => {
          const meta = (T?.FACTION_META && T.FACTION_META[f.id]) || {};
          const heroCount = (T?.BY_FACTION?.[f.id] || []).length;
          const sCount = (T?.BY_FACTION?.[f.id] || []).filter(h => h.tier === 'S').length;
          return (
            <a key={f.id} className="card faction-card"
               href={`#faction/${f.id}`}
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
              {meta.summary && <p className="card-desc">{meta.summary}</p>}
              <div className="card-stats">
                <span><b>{heroCount}</b>heroes</span>
                <span><b>{sCount}</b>S-tier</span>
              </div>
            </a>
          );
        })}
      </div>

      {tips.length > 0 && (
        <>
          <h2>Universal tips</h2>
          <div className="tips">
            {tips.map(t => (
              <div className="tip" key={t.title}>
                <div className="tip-title">{t.title}</div>
                <div className="tip-body">{t.body}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

window.FactionView = FactionView;
window.FactionsHubView = FactionsHubView;
