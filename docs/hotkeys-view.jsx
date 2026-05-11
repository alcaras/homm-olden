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

  return (
    <>
      <h1>Hotkeys</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Action names and section grouping are sourced from the game's localization
        files. Default key bindings come from the in-game{' '}
        <em>Settings → Hotkeys</em> screen — entries shown as <span className="hk-key-empty">—</span>{' '}
        are real game actions whose default key isn't surfaced here yet.
        Customised in-game bindings will diverge from this list.
      </p>

      <div className="hk-grid">
        {D.SECTIONS.map(sec => (
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

      <p className="combat-caveat" style={{marginTop:'1.5rem'}}>
        Reference card: "All Hotkeys for HoMM: Olden Era" by Kotletiy LLC.
        Verify against your in-game Settings → Hotkeys before remapping.
      </p>
    </>
  );
};

window.HotkeysView = HotkeysView;
