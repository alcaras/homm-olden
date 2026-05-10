/* Per-faction Law + Building calculator. Pick what you want, see running totals.
   State is encoded into the URL hash so links are shareable:
     #calc/temple?b=Main:2,Wall:3,Magic_Guild:4&l=3:1,30:1                  */

const CalcView = ({ factionId, initialQuery, go }) => {
  const C = window.OE_CALC_DATA;
  if (!C) return <p>Calculator data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || C.FACTIONS;
  const fmeta = FACTIONS.find(f => f.id === factionId);
  const data = factionId ? C.BY_FACTION[factionId] : null;
  // Resolve in-game faction key (e.g. 'human') for law-id reconstruction.
  // OE_DATA.FACTIONS uses `unitKey`; OE_CALC_DATA.FACTIONS uses `unitKey` too.
  const factionKey = fmeta?.unitKey || (C.FACTIONS.find(f => f.id === factionId)?.unitKey);

  // ----- initial state from URL (re-derived only when faction changes) -----
  const initial = React.useMemo(() => parseCalcQuery(initialQuery, factionKey),
                                [factionId]);
  const [pickedBuildings, setPickedBuildings] = React.useState(initial.buildings);
  const [pickedLaws,      setPickedLaws]      = React.useState(initial.laws);
  const [shareCopied,     setShareCopied]     = React.useState(false);

  // Re-seed state when faction changes (different `initial`)
  React.useEffect(() => {
    setPickedBuildings(initial.buildings);
    setPickedLaws(initial.laws);
  }, [factionId, initial]);

  // Sync state → URL via replaceState so we don't pollute history or fire
  // hashchange (which would re-mount the view)
  React.useEffect(() => {
    if (!factionId || !factionKey) return;
    const newHash = '#' + buildCalcHash(factionId, factionKey, pickedBuildings, pickedLaws);
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }, [pickedBuildings, pickedLaws, factionId, factionKey]);

  if (!data) {
    return (
      <>
        <FactionPicker current={factionId} factions={FACTIONS} go={go} prefix="calc" />
        <h1>Faction calculator</h1>
        <p className="lede">
          Pick a faction above to plan its build order and law tree against the actual
          in-game costs and prerequisites.
        </p>
      </>
    );
  }

  // ----- helpers -----
  const buildingsBySid = {};
  for (const cat of data.buildings) for (const b of cat.buildings) buildingsBySid[b.sid] = b;
  const lawsById = {};
  for (const r of data.laws) for (const g of r.groups) for (const l of g.laws) lawsById[l.id] = l;

  // Toggle a building to the given level. Setting N means: levels 1..N are
  // included. Clicking the currently-selected level deselects (sets to N-1).
  // Auto-adds prerequisites at their required levels (or higher if already chosen).
  const setBuildingLevel = (sid, targetLevel) => {
    setPickedBuildings(prev => {
      const next = {...prev};
      const cur = next[sid] || 0;
      const newLevel = (cur === targetLevel) ? targetLevel - 1 : targetLevel;
      next[sid] = newLevel;
      if (newLevel === 0) {
        delete next[sid];
        // We don't auto-remove dependents — leave that as user choice.
        return next;
      }
      // Walk prereq chain: ensure each prereq is at least at the required level.
      const ensure = (s, lvl) => {
        if ((next[s] || 0) >= lvl) return;
        next[s] = lvl;
        const b = buildingsBySid[s];
        if (!b) return;
        const lvlSpec = b.levels[lvl - 1];
        for (const p of (lvlSpec?.prereqs || [])) ensure(p.sid, p.level);
      };
      const lvlSpec = buildingsBySid[sid]?.levels[newLevel - 1];
      for (const p of (lvlSpec?.prereqs || [])) ensure(p.sid, p.level);
      return next;
    });
  };

  // Toggle a law to the given level.
  const setLawLevel = (lawId, targetLevel) => {
    setPickedLaws(prev => {
      const cur = prev[lawId] || 0;
      const newLevel = (cur === targetLevel) ? targetLevel - 1 : targetLevel;
      const next = {...prev};
      if (newLevel === 0) delete next[lawId]; else next[lawId] = newLevel;
      return next;
    });
  };

  // ----- totals -----
  const buildingTotals = {};
  let buildingLevelsCount = 0;
  for (const [sid, lvl] of Object.entries(pickedBuildings)) {
    const b = buildingsBySid[sid];
    if (!b) continue;
    for (let i = 0; i < lvl; i++) {
      buildingLevelsCount += 1;
      const costs = b.levels[i]?.costs || {};
      for (const [r, v] of Object.entries(costs)) {
        buildingTotals[r] = (buildingTotals[r] || 0) + v;
      }
    }
  }

  let lawTotalCost = 0;
  let lawLevelsCount = 0;
  for (const [lid, lvl] of Object.entries(pickedLaws)) {
    const l = lawsById[lid];
    if (!l) continue;
    for (let i = 0; i < lvl; i++) {
      lawLevelsCount += 1;
      lawTotalCost += l.levels[i]?.cost || 0;
    }
  }

  // ----- render -----
  return (
    <>
      <FactionPicker current={factionId} factions={FACTIONS} go={go} prefix="calc" />

      <h1>{fmeta.name} — calculator</h1>
      <p className="lede">
        Pick the laws and buildings you plan to enact. Costs are pulled from the
        actual game files (not editorial). Selecting a building level
        automatically enacts its prerequisites; click a selected level again to
        step back down.
      </p>

      {/* ============== TOTALS (sticky) ============== */}
      <div className="calc-totals">
        <div className="calc-totals-block">
          <div className="calc-totals-eyebrow">
            Buildings — {Object.keys(pickedBuildings).length} buildings, {buildingLevelsCount} levels
          </div>
          <div className="calc-resources">
            {C.RESOURCE_ORDER.map(r => {
              const v = buildingTotals[r] || 0;
              return (
                <div key={r} className={`calc-res calc-res-${r}${v ? ' has' : ' empty'}`}>
                  <span className="calc-res-label">{C.RESOURCE_LABEL[r]}</span>
                  <span className="calc-res-value">{v.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="calc-totals-block">
          <div className="calc-totals-eyebrow">
            Laws — {Object.keys(pickedLaws).length} laws, {lawLevelsCount} levels enacted
          </div>
          <div className="calc-lp">
            <span className="calc-lp-value">{lawTotalCost}</span>
            <span className="calc-lp-label">law points spent</span>
          </div>
        </div>
        <div className="calc-totals-actions">
          <button onClick={() => {
            navigator.clipboard?.writeText(window.location.href).then(
              () => { setShareCopied(true); setTimeout(()=>setShareCopied(false), 1800); },
              () => {}
            );
          }}>{shareCopied ? '✓ Copied' : 'Copy share link'}</button>
          <button onClick={() => { setPickedBuildings({}); setPickedLaws({}); }}>Reset all</button>
        </div>
      </div>

      {/* ============== BUILDINGS ============== */}
      <h2>Buildings</h2>
      <p className="note">
        Click a level to select it. Selecting auto-enacts prerequisite buildings.
        Click an already-selected level to step back. Costs are per-level (not cumulative).
      </p>
      {data.buildings.map(cat => (
        <section key={cat.id} className="calc-cat">
          <h3>{cat.label}</h3>
          <div className="calc-buildings">
            {cat.buildings.map(b => {
              const cur = pickedBuildings[b.sid] || 0;
              const isFortishLong = b.shortId.length > 14;
              return (
                <div key={b.sid} className="calc-building">
                  <div className="calc-building-head">
                    <span className={'calc-building-name' + (isFortishLong ? ' tight' : '')}>
                      {b.levels[0].name}
                    </span>
                    <span className="calc-building-id mono">{b.shortId}</span>
                  </div>
                  <div className="calc-levels">
                    {b.levels.map(lvl => {
                      const active = cur >= lvl.level;
                      const cleanedDesc = (lvl.desc || '').replace(/\{[0-9]+\}/g, '?');
                      return (
                        <div key={lvl.level} className="calc-level-row">
                          <button
                            className={'calc-level-btn' + (active ? ' active' : '')}
                            onClick={() => setBuildingLevel(b.sid, lvl.level)}
                            title={lvl.name + (cleanedDesc ? '\n\n' + cleanedDesc : '')}>
                            <span className="calc-level-num">L{lvl.level}</span>
                            <span className="calc-level-cost">
                              {Object.entries(lvl.costs).map(([r, v]) => (
                                <span key={r} className={`calc-cost calc-cost-${r}`}>
                                  {v.toLocaleString()}{abbreviateRes(r)}
                                </span>
                              ))}
                            </span>
                          </button>
                          {cleanedDesc && (
                            <div className={'calc-level-effect' + (active ? ' active' : '')}>
                              {lvl.level > 1 && b.levels[0]?.name !== lvl.name && (
                                <span className="calc-level-effect-name">{lvl.name}: </span>
                              )}
                              {cleanedDesc}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {/* ============== LAWS ============== */}
      <h2>Laws</h2>
      <p className="note">
        Laws are organized into 5 rows. Each row unlocks once you've spent the cumulative
        threshold of law points on earlier-row laws. Click a level to enact; click again to step back.
      </p>

      {data.laws.map(row => {
        // cumulative LP spent on rows BEFORE this one — used to gate unlock display
        let priorLp = 0;
        for (const r2 of data.laws) {
          if (r2.rowIndex >= row.rowIndex) break;
          for (const g of r2.groups) for (const l of g.laws) {
            const cur = pickedLaws[l.id] || 0;
            for (let i = 0; i < cur; i++) priorLp += l.levels[i]?.cost || 0;
          }
        }
        const unlocked = priorLp >= row.countToUnlock;
        return (
          <section key={row.rowIndex} className={'calc-law-row' + (unlocked ? ' unlocked' : ' locked')}>
            <div className="calc-law-row-head">
              <span className="calc-law-row-num">Row {row.rowIndex}</span>
              <span className="calc-law-row-unlock">
                {row.countToUnlock === 0
                  ? 'Unlocked from start'
                  : <>Unlocks at <b>{row.countToUnlock} LP</b> spent on earlier rows
                      {' '}— you have <b>{priorLp}</b>
                      {!unlocked && <span className="calc-law-locked-note"> (locked)</span>}
                    </>}
              </span>
            </div>
            <div className="calc-law-groups">
              {row.groups.map((g, gi) => (
                <div key={gi} className="calc-law-group">
                  {g.laws.map(law => {
                    const cur = pickedLaws[law.id] || 0;
                    return (
                      <div key={law.id} className="calc-law">
                        <div className="calc-law-head">
                          <span className="calc-law-name">{law.name}</span>
                          <span className="calc-law-num">#{law.num}</span>
                        </div>
                        {law.desc && (
                          <div className="calc-law-desc">
                            {law.desc.replace(/\{[0-9]+\}/g, '?')}
                          </div>
                        )}
                        <div className="calc-levels">
                          {law.levels.map(lvl => {
                            const active = cur >= lvl.level;
                            return (
                              <button
                                key={lvl.level}
                                className={'calc-level-btn calc-level-law' + (active ? ' active' : '')}
                                onClick={() => setLawLevel(law.id, lvl.level)}>
                                <span className="calc-level-num">L{lvl.level}</span>
                                <span className="calc-level-cost">
                                  {lvl.cost} LP
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="note">
        Generated {C.GENERATED_AT}. Data extracted by{' '}
        <code>catalog/scripts/build_calc.py</code> from the game's JSON files.
      </p>
    </>
  );
};

function abbreviateRes(r) {
  return {
    gold: 'g', wood: 'w', ore: 'o', gemstones: 'gem',
    crystals: 'cr', mercury: 'me', graal: 'graal',
  }[r] || r;
}

// ---------- URL state encoding (#calc/<id>?b=...&l=...) ----------
function encodeBuildings(picked) {
  const out = [];
  for (const [sid, lvl] of Object.entries(picked)) {
    if (!lvl) continue;
    // Strip "Build_" prefix to keep the URL short.
    const short = sid.startsWith('Build_') ? sid.slice('Build_'.length) : sid;
    out.push(`${short}:${lvl}`);
  }
  return out.join(',');
}

function encodeLaws(picked, factionKey) {
  const out = [];
  const prefix = `fraction_law_${factionKey}_`;
  for (const [lid, lvl] of Object.entries(picked)) {
    if (!lvl) continue;
    // Strip "fraction_law_<key>_" — store just the law number.
    const num = lid.startsWith(prefix) ? lid.slice(prefix.length) : lid;
    out.push(`${num}:${lvl}`);
  }
  return out.join(',');
}

function decodeBuildings(s) {
  if (!s) return {};
  const out = {};
  for (const part of s.split(',')) {
    const [short, lvlStr] = part.split(':');
    const lvl = parseInt(lvlStr, 10);
    if (!short || !lvl) continue;
    out[short.startsWith('Build_') ? short : `Build_${short}`] = lvl;
  }
  return out;
}

function decodeLaws(s, factionKey) {
  if (!s || !factionKey) return {};
  const out = {};
  for (const part of s.split(',')) {
    const [num, lvlStr] = part.split(':');
    const lvl = parseInt(lvlStr, 10);
    if (!num || !lvl) continue;
    const key = num.startsWith('fraction_law_') ? num : `fraction_law_${factionKey}_${num}`;
    out[key] = lvl;
  }
  return out;
}

function parseCalcQuery(query, factionKey) {
  const sp = new URLSearchParams(query || '');
  return {
    buildings: decodeBuildings(sp.get('b') || ''),
    laws:      decodeLaws(sp.get('l') || '', factionKey),
  };
}

function buildCalcHash(factionId, factionKey, pickedBuildings, pickedLaws) {
  const parts = [];
  const b = encodeBuildings(pickedBuildings);
  const l = encodeLaws(pickedLaws, factionKey);
  if (b) parts.push(`b=${b}`);
  if (l) parts.push(`l=${l}`);
  const qs = parts.length ? '?' + parts.join('&') : '';
  return `calc/${factionId}${qs}`;
}

const FactionPicker = ({current, factions, go, prefix}) => (
  <div className="faction-switcher">
    {factions.map(f => (
      <a key={f.id}
         href={`#${prefix}/${f.id}`}
         onClick={e=>{e.preventDefault();go(`${prefix}/${f.id}`);}}
         className={f.id === current ? 'active' : ''}>
        <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.display='none';}} />
        <span>{f.name}</span>
      </a>
    ))}
  </div>
);

const CalcHubView = ({go}) => {
  const FACTIONS = window.OE_DATA?.FACTIONS || (window.OE_CALC_DATA?.FACTIONS) || [];
  return (
    <>
      <h1>Calculator</h1>
      <p className="lede">
        Plan your faction's law tree and building order against actual game-data
        costs. Pick the laws and buildings you intend to enact, see running
        totals of resources spent and law points used, with prerequisites
        auto-enforced.
      </p>
      <div className="card-grid">
        {FACTIONS.map(f => (
          <a key={f.id} className="card faction-card"
             href={`#calc/${f.id}`}
             onClick={e=>{e.preventDefault();go(`calc/${f.id}`);}}>
            <div className="faction-card-head">
              <img loading="lazy" className="faction-card-icon"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.display='none';}} />
              <div>
                <div className="card-eyebrow">{f.might} / {f.magic}</div>
                <div className="card-title">{f.name}</div>
              </div>
            </div>
            <p className="card-desc">Plan {f.name}'s tech tree.</p>
          </a>
        ))}
      </div>
    </>
  );
};

window.CalcView = CalcView;
window.CalcHubView = CalcHubView;
