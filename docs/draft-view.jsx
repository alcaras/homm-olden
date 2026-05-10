/* Draft strategy quick-reference */

const DraftView = () => {
  const D = window.OE_DRAFT_DATA;
  if (!D) return <p>Draft data not loaded.</p>;

  const SITE_FACTIONS = window.OE_DATA?.FACTIONS || [];
  const factionMeta = Object.fromEntries(SITE_FACTIONS.map(f => [f.id, f]));

  const FactionPill = ({fid, label}) => (
    <span className={`faction-pill faction-${fid}`}>{label || factionMeta[fid]?.name || fid}</span>
  );

  // --- ban-rank badge mirrors prio-badge ---
  const BanRank = ({rank}) => {
    if (rank === 'skip') return <span className="prio-badge prio-trap">skip</span>;
    if (rank === 'anti') return <span className="prio-badge prio-trap">anti</span>;
    return <span className="prio-badge prio-S" style={{minWidth:'1.4em',textAlign:'center',background:rank===1?'#9a4818':rank===2?'#b8861b':'#2c5d83'}}>{rank}</span>;
  };

  return (
    <>
      <h1>Draft strategy</h1>
      <p className="lede">
        Quick reference for tournament/Exodus pick-ban. Use this during a draft.
      </p>

      <h2>Format</h2>
      <ul className="format-list">
        {D.FORMAT.map((f, i) => <li key={i}>{f}</li>)}
      </ul>

      <h2>Faction ban priority</h2>
      <table className="guide-table">
        <thead><tr><th className="prio-col">#</th><th>Faction</th><th>Why</th></tr></thead>
        <tbody>
          {D.FACTION_BAN_ORDER.map(r => (
            <tr key={r.faction} className={typeof r.rank !== 'number' ? 'trap-row' : ''}>
              <td className="prio-col"><BanRank rank={r.rank} /></td>
              <td><FactionPill fid={r.faction} /></td>
              <td className="note-col">{r.why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Faction pick priority</h2>
      <table className="guide-table">
        <thead><tr><th className="num-col">#</th><th>Faction</th><th>Why</th></tr></thead>
        <tbody>
          {D.FACTION_PICK_ORDER.map((r, i) => (
            <tr key={r.faction}>
              <td className="num-col">{i+1}</td>
              <td><FactionPill fid={r.faction} /></td>
              <td className="note-col">{r.why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Going first vs second</h2>
      <div className="draft-cols">
        {[D.GOING_FIRST, D.GOING_SECOND].map((g, gi) => (
          <div className="draft-col" key={gi}>
            <h3>{g.title}</h3>
            <p className="draft-summary">{g.summary}</p>
            <ul className="draft-steps">
              {g.steps.map((s, i) => (
                <li key={i}>
                  <span className="step-label">{s[0]}</span>
                  <span className="step-body">{s[1]}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2>Counter-pick matrix</h2>
      <p>If your opponent picks faction X, your best response:</p>
      <table className="guide-table counter-matrix">
        <thead>
          <tr>
            <th>Opponent picked</th>
            <th>Primary counter</th>
            <th>Why</th>
            <th>Alt counter</th>
            <th>Why</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(D.COUNTERS).map(([fid, c]) => (
            <tr key={fid}>
              <td><FactionPill fid={fid} /></td>
              <td><FactionPill fid={c.primary.factionId} label={c.primary.name} /></td>
              <td className="note-col">{c.primary.why}</td>
              <td><FactionPill fid={c.alt.factionId} label={c.alt.name} /></td>
              <td className="note-col">{c.alt.why}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Hero bans</h2>
      <p className="note">
        Once your opponent has committed their faction, your 3 hero bans come
        from <em>that</em> faction's roster — never your own. Each per-faction
        page lists the top heroes you'll want to ban first against that
        opponent.
      </p>
      <div className="card-grid">
        {SITE_FACTIONS.map(f => (
          <a key={f.id} className="card faction-card"
             href={`#faction/${f.id}`}
             onClick={e=>{e.preventDefault();window.location.hash = `faction/${f.id}`;window.scrollTo({top:0});}}>
            <div className="faction-card-head">
              <img loading="lazy" className="faction-card-icon"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.display='none';}} />
              <div>
                <div className="card-eyebrow">vs {f.name}</div>
                <div className="card-title">Bans + counter-pick →</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      <p className="note">
        Generated {D.GENERATED_AT}. Edit <code>catalog/scripts/build_draft_guide.py</code> and rerun.
      </p>
    </>
  );
};

window.DraftView = DraftView;
