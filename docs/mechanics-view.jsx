/* Mechanics 101 — beginner primer for Olden Era systems */

const MechanicsView = ({go}) => {
  const M = window.OE_MECHANICS_DATA;
  if (!M) return <p>Mechanics data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || [];

  return (
    <>
      <h1>Mechanics 101</h1>
      <nav className="mech-toc">
        {M.SECTIONS.map(s => (
          <a key={s.id} href={`#mech-${s.id}`}
             onClick={e => {
               e.preventDefault();
               document.getElementById(`mech-${s.id}`)?.scrollIntoView({behavior:'smooth', block:'start'});
             }}>
            {s.eyebrow}
          </a>
        ))}
        <a href="#mech-faction-mechanics"
           onClick={e => {
             e.preventDefault();
             document.getElementById('mech-faction-mechanics')?.scrollIntoView({behavior:'smooth', block:'start'});
           }}>Per-faction signatures</a>
        <a href="#mech-resources"
           onClick={e => {
             e.preventDefault();
             document.getElementById('mech-resources')?.scrollIntoView({behavior:'smooth', block:'start'});
           }}>Resources</a>
      </nav>

      {M.SECTIONS.map(s => (
        <section key={s.id} id={`mech-${s.id}`} className="mech-section">
          <h2>
            <span className="mech-eyebrow">{s.eyebrow}</span>
            <span className="mech-title">{s.title}</span>
          </h2>
          {s.intro && <p className="mech-intro">{s.intro}</p>}

          {s.blocks?.map((b, i) => {
            if (b.type === 'paragraph') {
              return <p key={i} className="mech-para" dangerouslySetInnerHTML={{__html: markdownInlineToHtml(b.body)}} />;
            }
            if (b.type === 'callout') {
              return (
                <div key={i} className="mech-callout">
                  <div className="mech-callout-title">{b.title}</div>
                  <div className="mech-callout-body" dangerouslySetInnerHTML={{__html: markdownInlineToHtml(b.body)}} />
                </div>
              );
            }
            return null;
          })}

          {s.facts?.length > 0 && (
            <table className="mech-facts">
              <tbody>
                {s.facts.map((row, i) => (
                  <tr key={i}>
                    <th>{row[0]}</th>
                    <td>{row[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {s.pitfalls?.length > 0 && (
            <div className="mech-pitfalls">
              <div className="mech-pitfalls-head">Common mistakes</div>
              <ul>
                {s.pitfalls.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}

          {s.links?.length > 0 && (
            <div className="mech-links">
              <span className="mech-links-label">Further reading:</span>
              {s.links.map(([label, url], i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">{label}</a>
              ))}
            </div>
          )}
        </section>
      ))}

      <section id="mech-faction-mechanics" className="mech-section">
        <h2>
          <span className="mech-eyebrow">Per-faction signatures</span>
          <span className="mech-title">The faction-defining mechanic in one paragraph</span>
        </h2>
        <p className="mech-intro">
          Before any of the tournament tier list / build / law content makes
          sense, you need the faction's defining mechanic. One paragraph each.
          Mirrored on the per-faction pages.
        </p>
        <div className="mech-faction-grid">
          {FACTIONS.map(f => {
            const sig = M.FACTION_SIGNATURE_MECHANICS?.[f.id];
            if (!sig) return null;
            return (
              <a key={f.id} className="mech-faction-card"
                 href={window.OE_routeToUrl(`faction/${f.id}`)}
                 onClick={e=>{e.preventDefault();go(`faction/${f.id}`);}}>
                <div className="mech-faction-head">
                  <img loading="lazy" className="mech-faction-icon"
                       src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                       onError={(e)=>{e.target.style.display='none';}} />
                  <div>
                    <div className="card-eyebrow">{f.name}</div>
                    <div className="mech-faction-title">{sig.title}</div>
                  </div>
                </div>
                <div className="mech-faction-body">{sig.body}</div>
              </a>
            );
          })}
        </div>
      </section>

      <section id="mech-resources" className="mech-section">
        <h2>
          <span className="mech-eyebrow">External resources</span>
          <span className="mech-title">Where to go deeper</span>
        </h2>
        <div className="mech-resources">
          {M.TOP_RESOURCES.map((r, i) => (
            <a key={i} className="mech-resource"
               href={r.url} target="_blank" rel="noopener noreferrer">
              <div className="mech-resource-title">{r.title} ↗</div>
              <div className="mech-resource-desc">{r.desc}</div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
};

// Minimal **bold** + *italic* + `code` inline-markdown to HTML for the few
// paragraphs that use it. No block-level handling — paragraphs are passed in
// as discrete blocks.
function markdownInlineToHtml(s) {
  const escape = (t) => t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  return escape(s)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

window.MechanicsView = MechanicsView;
