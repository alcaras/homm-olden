/* Olden Era reference — main app */

const SIMPLE_VIEWS = ['index', 'mechanics', 'factions', 'subclasses', 'heroes', 'units', 'tier', 'guides', 'draft'];

const parseHash = () => {
  const raw = (window.location.hash || '#index').slice(1);
  if (raw.startsWith('faction/')) {
    return { view: 'faction', factionId: raw.slice('faction/'.length) };
  }
  if (SIMPLE_VIEWS.includes(raw)) return { view: raw, factionId: null };
  return { view: 'index', factionId: null };
};

const App = () => {
  const [route, setRoute] = React.useState(parseHash);

  const go = (target) => {
    const next = (typeof target === 'string' && target.startsWith('faction/'))
      ? { view: 'faction', factionId: target.slice('faction/'.length) }
      : { view: target, factionId: null };
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
        <button className={tabActive('subclasses')} onClick={()=>go('subclasses')}>Subclasses</button>
        <button className={tabActive('heroes')}     onClick={()=>go('heroes')}>Heroes</button>
        <button className={tabActive('units')}      onClick={()=>go('units')}>Units</button>
        <button className={tabActive('tier')}       onClick={()=>go('tier')}>Tier list</button>
        <button className={tabActive('guides')}     onClick={()=>go('guides')}>Guides</button>
        <button className={tabActive('draft')}      onClick={()=>go('draft')}>Draft</button>
      </nav>

      {route.view==='index'      && <window.IndexView go={go} />}
      {route.view==='mechanics'  && <window.MechanicsView go={go} />}
      {route.view==='factions'   && <window.FactionsHubView go={go} />}
      {route.view==='faction'    && <window.FactionView factionId={route.factionId} go={go} />}
      {route.view==='subclasses' && <window.SubclassesView />}
      {route.view==='heroes'     && <window.HeroesView />}
      {route.view==='units'      && <window.UnitsView />}
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
