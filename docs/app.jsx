/* Olden Era reference — main app */

const App = () => {
  const VIEWS = ['index', 'subclasses', 'heroes', 'units', 'tier', 'guides'];
  const initial = (window.location.hash || '#index').slice(1);
  const [view, setView] = React.useState(
    VIEWS.includes(initial) ? initial : 'index'
  );

  const go = (v) => {
    setView(v);
    window.location.hash = v;
    window.scrollTo({top: 0});
  };

  React.useEffect(() => {
    const onHash = () => {
      const v = (window.location.hash || '#index').slice(1);
      if (VIEWS.includes(v)) setView(v);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const meta = window.OE_DATA
    ? `${window.OE_DATA.HEROES.length} heroes · ${window.OE_DATA.SUBCLASSES.length} subclasses · ${window.OE_DATA.UNITS.length} units · ${window.OE_DATA.FACTIONS.length} factions`
    : '';

  return (
    <div className="shell">
      <header className="masthead">
        <div className="brand">
          Olden Era<span className="sub">a reference</span>
        </div>
        <div className="meta">{meta}</div>
      </header>

      <nav className="tabs">
        <button className={view==='index'?'active':''} onClick={()=>go('index')}>Index</button>
        <button className={view==='subclasses'?'active':''} onClick={()=>go('subclasses')}>Subclasses</button>
        <button className={view==='heroes'?'active':''} onClick={()=>go('heroes')}>Heroes</button>
        <button className={view==='units'?'active':''} onClick={()=>go('units')}>Units</button>
        <button className={view==='tier'?'active':''} onClick={()=>go('tier')}>Tier list</button>
        <button className={view==='guides'?'active':''} onClick={()=>go('guides')}>Guides</button>
      </nav>

      {view==='index'      && <window.IndexView go={go} />}
      {view==='subclasses' && <window.SubclassesView />}
      {view==='heroes'     && <window.HeroesView />}
      {view==='units'      && <window.UnitsView />}
      {view==='tier'       && <window.TierView />}
      {view==='guides'     && <window.GuidesView />}

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
