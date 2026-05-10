/* Olden Era reference — main app */

const SIMPLE_VIEWS = ['index', 'mechanics', 'factions', 'laws', 'buildings', 'subclasses', 'skills', 'heroes', 'units', 'tier', 'guides', 'draft'];

const parseHash = () => {
  const raw = (window.location.hash || '#index').slice(1);
  // Optional query string after the route path: '#calc/temple?b=Main:2,Wall:3&l=3:1'
  const qIdx = raw.indexOf('?');
  const path = qIdx === -1 ? raw : raw.slice(0, qIdx);
  const query = qIdx === -1 ? '' : raw.slice(qIdx + 1);
  if (path.startsWith('faction/')) {
    return { view: 'faction', factionId: path.slice('faction/'.length), query };
  }
  if (path.startsWith('laws/')) {
    return { view: 'calc-faction', factionId: path.slice('laws/'.length), kind: 'laws', query };
  }
  if (path.startsWith('buildings/')) {
    return { view: 'calc-faction', factionId: path.slice('buildings/'.length), kind: 'buildings', query };
  }
  // Back-compat: old #calc/* URLs redirect to the new top-level routes.
  if (path.startsWith('calc/laws/')) {
    return { view: 'calc-faction', factionId: path.slice('calc/laws/'.length), kind: 'laws', query };
  }
  if (path.startsWith('calc/buildings/')) {
    return { view: 'calc-faction', factionId: path.slice('calc/buildings/'.length), kind: 'buildings', query };
  }
  if (path.startsWith('calc/')) {
    return { view: 'calc-faction', factionId: path.slice('calc/'.length), kind: 'buildings', query };
  }
  if (path === 'calc') {
    return { view: 'buildings', factionId: null, query };
  }
  if (path.startsWith('units/')) {
    return { view: 'units-faction', factionId: path.slice('units/'.length), query };
  }
  if (SIMPLE_VIEWS.includes(path)) return { view: path, factionId: null, query };
  return { view: 'index', factionId: null, query: '' };
};

const App = () => {
  const [route, setRoute] = React.useState(parseHash);

  const go = (target) => {
    const qIdx = typeof target === 'string' ? target.indexOf('?') : -1;
    const path = qIdx === -1 ? target : target.slice(0, qIdx);
    const query = qIdx === -1 ? '' : target.slice(qIdx + 1);
    let next;
    if (typeof path === 'string' && path.startsWith('faction/')) {
      next = { view: 'faction', factionId: path.slice('faction/'.length), query };
    } else if (typeof path === 'string' && path.startsWith('laws/')) {
      next = { view: 'calc-faction', factionId: path.slice('laws/'.length), kind: 'laws', query };
    } else if (typeof path === 'string' && path.startsWith('buildings/')) {
      next = { view: 'calc-faction', factionId: path.slice('buildings/'.length), kind: 'buildings', query };
    } else if (typeof path === 'string' && path.startsWith('units/')) {
      next = { view: 'units-faction', factionId: path.slice('units/'.length), query };
    } else {
      next = { view: path, factionId: null, query };
    }
    setRoute(next);
    window.location.hash = target;
    window.scrollTo({top: 0});
  };

  React.useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const meta = window.OE_DATA
    ? `${window.OE_DATA.HEROES.length} heroes · ${window.OE_DATA.SUBCLASSES.length} subclasses · ${window.OE_DATA.UNITS.length} units · ${window.OE_DATA.FACTIONS.length} factions`
    : '';

  const tabActive = (v) => route.view === v ? 'active' : '';

  return (
    <div className="shell">
      <header className="masthead">
        <div className="brand">
          Olden Era<span className="sub">a reference</span>
        </div>
        <div className="meta">{meta}</div>
      </header>

      <nav className="tabs">
        <button className={tabActive('index')}      onClick={()=>go('index')}>Index</button>
        <button className={tabActive('mechanics')}  onClick={()=>go('mechanics')}>Mechanics</button>
        <button className={tabActive('factions') || (route.view==='faction'?'active':'')}
                onClick={()=>go('factions')}>Factions</button>
        <button className={tabActive('buildings') || (route.view==='calc-faction' && route.kind==='buildings'?'active':'')}
                onClick={()=>go('buildings/temple')}>Buildings</button>
        <button className={tabActive('laws') || (route.view==='calc-faction' && route.kind==='laws'?'active':'')}
                onClick={()=>go('laws/temple')}>Laws</button>
        <button className={tabActive('subclasses')} onClick={()=>go('subclasses')}>Subclasses</button>
        <button className={tabActive('skills')}     onClick={()=>go('skills')}>Skills</button>
        <button className={tabActive('heroes')}     onClick={()=>go('heroes')}>Heroes</button>
        <button className={tabActive('units')}      onClick={()=>go('units')}>Units</button>
        <button className={tabActive('tier')}       onClick={()=>go('tier')}>Tier list</button>
        <button className={tabActive('guides')}     onClick={()=>go('guides')}>Guides</button>
        <button className={tabActive('draft')}      onClick={()=>go('draft')}>Draft</button>
      </nav>

      {route.view==='index'         && <window.IndexView go={go} />}
      {route.view==='mechanics'     && <window.MechanicsView go={go} />}
      {route.view==='factions'      && <window.FactionsHubView go={go} />}
      {route.view==='faction'       && <window.FactionView factionId={route.factionId} go={go} />}
      {route.view==='calc-faction'  && <window.CalcView factionId={route.factionId} kind={route.kind} initialQuery={route.query} go={go} />}
      {route.view==='subclasses' && <window.SubclassesView />}
      {route.view==='skills'     && <window.SkillsView />}
      {route.view==='heroes'     && <window.HeroesView />}
      {route.view==='units'         && <window.UnitsView go={go} />}
      {route.view==='units-faction' && <window.FactionUnitsView factionId={route.factionId} go={go} />}
      {route.view==='tier'       && <window.TierView />}
      {route.view==='guides'     && <window.GuidesView />}
      {route.view==='draft'      && <window.DraftView />}

      <footer className="sitefoot">
        {window.OE_DATA?.META && (
          <span>
            Game build <code>{window.OE_DATA.META.buildGuid.slice(0, 8) || '—'}</code>
            {window.OE_DATA.META.coreDate && (
              <> · <code>Core.zip</code> dated {window.OE_DATA.META.coreDate}</>
            )}
            {' · '}generated {window.OE_DATA.META.generatedAt}
          </span>
        )}
      </footer>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
