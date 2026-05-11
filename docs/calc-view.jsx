/* Per-faction Law / Building calculator. Two separate pages — Buildings
   (/buildings/<id>) and Laws (/laws/<id>) — sharing one component
   parameterized by `kind`. State for each kind is encoded into the URL
   query string so links are shareable.

   URL forms:
     /buildings/temple?b=Main:2,Wall:3,Magic_Guild:4
     /laws/temple?l=3:1,30:1                                           */

const CalcView = ({ factionId, kind, initialQuery, go }) => {
  const k = kind === 'laws' ? 'laws' : 'buildings';

  const C = window.OE_CALC_DATA;
  if (!C) return <p>Calculator data not loaded.</p>;

  const FACTIONS = window.OE_DATA?.FACTIONS || C.FACTIONS;
  const fmeta = FACTIONS.find(f => f.id === factionId);
  const data = factionId ? C.BY_FACTION[factionId] : null;
  const factionKey = fmeta?.unitKey || (C.FACTIONS.find(f => f.id === factionId)?.unitKey);

  // ----- initial state from URL (re-derived only when faction changes) -----
  const initial = React.useMemo(() => parseCalcQuery(initialQuery, factionKey),
                                [factionId]);
  const [picked, setPicked] = React.useState(k === 'laws' ? initial.laws : initial.buildings);
  const [shareCopied, setShareCopied] = React.useState(false);

  // Re-seed when faction or kind changes
  React.useEffect(() => {
    setPicked(k === 'laws' ? initial.laws : initial.buildings);
  }, [factionId, k, initial]);

  // Sync picked → URL search params via replaceState (no popstate, no view re-mount)
  React.useEffect(() => {
    if (!factionId || !factionKey) return;
    const route = `${k}/${factionId}`;
    const queryStr = buildCalcQuery(k, factionKey, picked);
    const url = window.OE_routeToUrl(route + (queryStr ? '?' + queryStr : ''));
    if (window.location.pathname + window.location.search !== url) {
      history.replaceState(null, '', url);
    }
  }, [picked, factionId, factionKey, k]);

  if (!data) {
    return (
      <>
        <FactionPicker current={factionId} factions={FACTIONS} go={go} kind={k} />
        <h1>{k === 'laws' ? 'Laws' : 'Buildings'} calculator</h1>
      </>
    );
  }

  return k === 'laws'
    ? <LawsCalc {...{ data, factionId, factionKey, fmeta, FACTIONS, go,
                       picked, setPicked, shareCopied, setShareCopied }} />
    : <BuildingsCalc {...{ data, factionId, factionKey, fmeta, FACTIONS, go,
                       picked, setPicked, shareCopied, setShareCopied, C }} />;
};


// ---------- BUILDINGS ----------
const BuildingsCalc = ({ data, factionId, factionKey, fmeta, FACTIONS, go,
                          picked, setPicked, shareCopied, setShareCopied, C }) => {
  const buildingsBySid = {};
  for (const cat of data.buildings) for (const b of cat.buildings) buildingsBySid[b.sid] = b;

  const setBuildingLevel = (sid, targetLevel) => {
    setPicked(prev => {
      const next = {...prev};
      const cur = next[sid] || 0;
      const newLevel = (cur === targetLevel) ? targetLevel - 1 : targetLevel;
      next[sid] = newLevel;
      if (newLevel === 0) {
        delete next[sid];
        return next;
      }
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

  // Totals
  const totals = {};
  let levelsCount = 0;
  for (const [sid, lvl] of Object.entries(picked)) {
    const b = buildingsBySid[sid];
    if (!b) continue;
    for (let i = 0; i < lvl; i++) {
      levelsCount += 1;
      const costs = b.levels[i]?.costs || {};
      for (const [r, v] of Object.entries(costs)) {
        totals[r] = (totals[r] || 0) + v;
      }
    }
  }

  return (
    <>
      <FactionPicker current={factionId} factions={FACTIONS} go={go} kind="buildings" />
      <KindSwitcher current="buildings" factionId={factionId} go={go} />

      <h1>{fmeta.name} — Buildings</h1>
      <div className="calc-totals">
        <div className="calc-totals-block calc-totals-wide">
          <div className="calc-totals-eyebrow">
            {Object.keys(picked).length} buildings, {levelsCount} levels
          </div>
          <div className="calc-resources">
            {C.RESOURCE_ORDER.map(r => {
              const v = totals[r] || 0;
              return (
                <div key={r} className={`calc-res calc-res-${r}${v ? ' has' : ' empty'}`}>
                  <span className="calc-res-label">{C.RESOURCE_LABEL[r]}</span>
                  <span className="calc-res-value">{v.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="calc-totals-actions">
          <button onClick={() => copyShareLink(setShareCopied)}>
            {shareCopied ? '✓ Copied' : 'Copy share link'}
          </button>
          <button onClick={() => setPicked({})}>Reset all</button>
        </div>
      </div>

      {data.buildings.map(cat => (
        <section key={cat.id} className="calc-cat">
          <h3>{cat.label}</h3>
          <div className="calc-buildings">
            {cat.buildings.map(b => {
              const cur = picked[b.sid] || 0;
              // Show the highest-level effect when something's picked; otherwise
              // preview the L1 effect so the card always carries meaning.
              const shownLvl = cur > 0 ? b.levels[cur - 1] : b.levels[0];
              const shownDesc = shownLvl?.descResolved
                || (shownLvl?.desc || '').replace(/\{[0-9]+\}/g, '?');
              const isLong = b.shortId.length > 14;
              return (
                <div key={b.sid} className={'calc-building' + (cur > 0 ? ' picked' : '')}>
                  <div className="calc-building-head">
                    {b.levels[0]?.icon && (
                      <img loading="lazy" className="calc-building-icon"
                           src={b.levels[0].icon} alt=""
                           onError={(e)=>{e.target.style.display='none';}} />
                    )}
                    <div className="calc-building-titles">
                      <span className={'calc-building-name' + (isLong ? ' tight' : '')}>
                        {shownLvl?.name || b.levels[0].name}
                      </span>
                      <span className="calc-building-id mono">{b.shortId}</span>
                    </div>
                  </div>
                  <div className="calc-level-chips">
                    {b.levels.map(lvl => {
                      const active = cur >= lvl.level;
                      const cleanedDesc = lvl.descResolved
                        || (lvl.desc || '').replace(/\{[0-9]+\}/g, '?');
                      return (
                        <button
                          key={lvl.level}
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
                      );
                    })}
                  </div>
                  {shownDesc && (
                    <div className={'calc-level-effect' + (cur > 0 ? ' active' : '')}>
                      {shownDesc}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
};


// ---------- LAWS ----------
const LawsCalc = ({ data, factionId, factionKey, fmeta, FACTIONS, go,
                     picked, setPicked, shareCopied, setShareCopied }) => {
  const lawsById = {};
  for (const r of data.laws) for (const g of r.groups) for (const l of g.laws) lawsById[l.id] = l;

  const setLawLevel = (lawId, targetLevel) => {
    setPicked(prev => {
      const cur = prev[lawId] || 0;
      const newLevel = (cur === targetLevel) ? targetLevel - 1 : targetLevel;
      const next = {...prev};
      if (newLevel === 0) delete next[lawId]; else next[lawId] = newLevel;
      return next;
    });
  };

  let lpTotal = 0;
  let levelsCount = 0;
  for (const [lid, lvl] of Object.entries(picked)) {
    const l = lawsById[lid];
    if (!l) continue;
    for (let i = 0; i < lvl; i++) {
      levelsCount += 1;
      lpTotal += l.levels[i]?.cost || 0;
    }
  }

  return (
    <>
      <FactionPicker current={factionId} factions={FACTIONS} go={go} kind="laws" />
      <KindSwitcher current="laws" factionId={factionId} go={go} />

      <h1>{fmeta.name} — Laws</h1>
      <div className="calc-totals">
        <div className="calc-totals-block calc-totals-wide">
          <div className="calc-totals-eyebrow">
            {Object.keys(picked).length} laws, {levelsCount} levels enacted
          </div>
          <div className="calc-lp">
            <span className="calc-lp-value">{lpTotal}</span>
            <span className="calc-lp-label">law points spent</span>
          </div>
        </div>
        <div className="calc-totals-actions">
          <button onClick={() => copyShareLink(setShareCopied)}>
            {shareCopied ? '✓ Copied' : 'Copy share link'}
          </button>
          <button onClick={() => setPicked({})}>Reset all</button>
        </div>
      </div>

      {data.laws.map(row => {
        let priorLp = 0;
        for (const r2 of data.laws) {
          if (r2.rowIndex >= row.rowIndex) break;
          for (const g of r2.groups) for (const l of g.laws) {
            const cur = picked[l.id] || 0;
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
              {row.groups.flatMap((g, gi) => g.laws.map(law => {
                const cur = picked[law.id] || 0;
                // Show the active level's effect, or L1's as preview.
                const shownLvl = cur > 0 ? law.levels[cur - 1] : law.levels[0];
                const shownDesc = shownLvl?.descResolved
                  || (shownLvl?.desc || '').replace(/\{[0-9]+\}/g, '?');
                return (
                  <div key={law.id} className={'calc-law' + (cur > 0 ? ' picked' : '')}>
                    <div className="calc-law-head">
                      {law.icon && (
                        <img loading="lazy" className="calc-law-icon"
                             src={law.icon} alt=""
                             onError={(e)=>{e.target.style.display='none';}} />
                      )}
                      <div className="calc-law-titles">
                        <span className="calc-law-name">{law.name}</span>
                        <span className="calc-law-num">#{law.num}</span>
                      </div>
                    </div>
                    <div className="calc-level-chips">
                      {law.levels.map(lvl => {
                        const active = cur >= lvl.level;
                        return (
                          <button
                            key={lvl.level}
                            className={'calc-level-btn calc-level-law' + (active ? ' active' : '')}
                            onClick={() => setLawLevel(law.id, lvl.level)}
                            title={lvl.descResolved || ''}>
                            <span className="calc-level-num">L{lvl.level}</span>
                            <span className="calc-level-cost">{lvl.cost} LP</span>
                          </button>
                        );
                      })}
                    </div>
                    {shownDesc && (
                      <div className={'calc-level-effect' + (cur > 0 ? ' active' : '')}>
                        {shownDesc}
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </section>
        );
      })}
    </>
  );
};


// ---------- helpers ----------
function copyShareLink(setShareCopied) {
  navigator.clipboard?.writeText(window.location.href).then(
    () => { setShareCopied(true); setTimeout(()=>setShareCopied(false), 1800); },
    () => {}
  );
}

function abbreviateRes(r) {
  return {
    gold: 'g', wood: 'w', ore: 'o', gemstones: 'gem',
    crystals: 'cr', mercury: 'me', graal: 'graal',
  }[r] || r;
}

// ---------- URL state encoding ----------
function encodeBuildings(picked) {
  const out = [];
  for (const [sid, lvl] of Object.entries(picked)) {
    if (!lvl) continue;
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

function buildCalcQuery(kind, factionKey, picked) {
  const parts = [];
  if (kind === 'laws') {
    const l = encodeLaws(picked, factionKey);
    if (l) parts.push(`l=${l}`);
  } else {
    const b = encodeBuildings(picked);
    if (b) parts.push(`b=${b}`);
  }
  return parts.join('&');
}


// ---------- shared UI ----------
const FactionPicker = ({current, factions, go, kind}) => (
  <div className="faction-switcher">
    {factions.map(f => (
      <a key={f.id}
         href={window.OE_routeToUrl(`${kind}/${f.id}`)}
         onClick={e=>{e.preventDefault();go(`${kind}/${f.id}`);}}
         className={f.id === current ? 'active' : ''}>
        <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
             onError={(e)=>{e.target.style.display='none';}} />
        <span>{f.name}</span>
      </a>
    ))}
  </div>
);

const KindSwitcher = ({current, factionId, go}) => (
  <div className="calc-kind-switcher">
    <a href={window.OE_routeToUrl(`buildings/${factionId}`)}
       onClick={e=>{e.preventDefault();go(`buildings/${factionId}`);}}
       className={current === 'buildings' ? 'active' : ''}>Buildings</a>
    <a href={window.OE_routeToUrl(`laws/${factionId}`)}
       onClick={e=>{e.preventDefault();go(`laws/${factionId}`);}}
       className={current === 'laws' ? 'active' : ''}>Laws</a>
  </div>
);


const CalcHubView = ({go}) => {
  const FACTIONS = window.OE_DATA?.FACTIONS || (window.OE_CALC_DATA?.FACTIONS) || [];
  return (
    <>
      <h1>Calculator</h1>
      <div className="card-grid">
        {FACTIONS.map(f => (
          <div key={f.id} className="card faction-card calc-hub-card">
            <div className="faction-card-head">
              <img loading="lazy" className="faction-card-icon"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.display='none';}} />
              <div>
                <div className="card-eyebrow">{f.might} / {f.magic}</div>
                <div className="card-title">{f.name}</div>
              </div>
            </div>
            <div className="calc-hub-actions">
              <a href={window.OE_routeToUrl(`buildings/${f.id}`)}
                 onClick={e=>{e.preventDefault();go(`buildings/${f.id}`);}}>
                Buildings →
              </a>
              <a href={window.OE_routeToUrl(`laws/${f.id}`)}
                 onClick={e=>{e.preventDefault();go(`laws/${f.id}`);}}>
                Laws →
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

window.CalcView = CalcView;
window.CalcHubView = CalcHubView;
