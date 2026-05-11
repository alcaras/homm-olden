/* Hotkeys reference. Action labels and section grouping are pulled from the
   game's localization (Lang/english/texts/menu.json → hotkeys_*); default
   key bindings are sourced from the in-game Settings → Hotkeys screen. */

const _renderKey = (key) => {
  if (!key) return <span className="hk-key hk-key-empty">—</span>;
  // Split on " + " (modifier chord) and on " or "/"/" (alternates) so each token
  // can render as its own kbd-style chip.
  return (
    <span className="hk-key">
      {key.split(/(\s+or\s+|\s+\/\s+)/).map((part, i) => {
        const trimmed = part.trim();
        if (/^or$/i.test(trimmed)) {
          return <span key={i} className="hk-or"> or </span>;
        }
        if (trimmed === '/') {
          return <span key={i} className="hk-or"> / </span>;
        }
        // chord: tokens joined by ' + '
        return (
          <span key={i} className="hk-chord">
            {trimmed.split(/\s*\+\s*/).map((tok, j) => (
              <React.Fragment key={j}>
                {j > 0 && <span className="hk-plus">+</span>}
                <kbd className="hk-kbd">{tok}</kbd>
              </React.Fragment>
            ))}
          </span>
        );
      })}
    </span>
  );
};

const HotkeysView = () => {
  const D = window.OE_HOTKEYS_DATA;
  if (!D) return <p>Hotkeys data not loaded.</p>;
  const [showUnkeyed, setShowUnkeyed] = React.useState(false);

  // Quick-reference: drop unkeyed rows by default so the page reads as a
  // compact cheat sheet. A toggle reveals them for the curious.
  const sections = D.SECTIONS.map(sec => ({
    ...sec,
    rows: showUnkeyed ? sec.rows : sec.rows.filter(r => r.key),
  })).filter(s => s.rows.length);

  return (
    <>
      <div className="hk-head">
        <h1>Hotkeys</h1>
        <label className="hk-toggle">
          <input type="checkbox" checked={showUnkeyed}
                 onChange={e => setShowUnkeyed(e.target.checked)} />
          <span>Show actions without default keys</span>
        </label>
      </div>

      <div className="hk-grid">
        {sections.map(sec => (
          <section key={sec.id} className="hk-section">
            <h2 className="hk-section-h">{sec.name}</h2>
            <table className="hk-table">
              <tbody>
                {sec.rows.map(r => (
                  <tr key={r.sid} className={r.key ? '' : 'hk-row-unkeyed'}>
                    <td className="hk-name">{r.name}</td>
                    <td className="hk-key-cell">{_renderKey(r.key)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </>
  );
};

window.HotkeysView = HotkeysView;
