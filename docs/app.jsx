/* Olden Era reference — main app.

   Path-routed SPA: real URLs (right-click "Open in new tab" works), no Babel
   in-browser parse. The site lives at https://alcaras.github.io/homm-olden/
   in production and at http://localhost:8000/ locally — BASE detects which.

   Deep links work because docs/404.html runs the spa-github-pages fallback
   that replays the path through index.html via a query param.                */

const SIMPLE_VIEWS = ['index', 'mechanics', 'factions',
                      'subclasses', 'skills', 'heroes', 'units',
                      'tier', 'guides', 'draft', 'spells',
                      'map-objects', 'map-templates', 'resources', 'artifacts'];

// Detect the base path. On GitHub Pages this is '/homm-olden/'; locally '/'.
const BASE = (() => {
  const p = window.location.pathname;
  const m = p.match(/^(\/homm-olden\/)/);
  return m ? m[1] : '/';
})();

// Strip BASE from a pathname → route string (e.g. '/units/temple').
const stripBase = (pathname) =>
  pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, '');

// Build a full URL from a route string ('units/temple' → '/homm-olden/units/temple').
const routeToUrl = (route, query) => {
  const r = route.replace(/^\//, '');
  return BASE + r + (query ? '?' + query : '');
};

const parsePath = () => {
  const raw = stripBase(window.location.pathname || '');
  const search = window.location.search.slice(1) || '';
  const path = raw || 'index';
  if (path.startsWith('faction/')) {
    return { view: 'faction', factionId: path.slice('faction/'.length), query: search };
  }
  if (path.startsWith('laws/')) {
    return { view: 'calc-faction', factionId: path.slice('laws/'.length), kind: 'laws', query: search };
  }
  if (path.startsWith('buildings/')) {
    return { view: 'calc-faction', factionId: path.slice('buildings/'.length), kind: 'buildings', query: search };
  }
  if (path.startsWith('units/')) {
    return { view: 'units-faction', factionId: path.slice('units/'.length), query: search };
  }
  if (path.startsWith('hero/')) {
    return { view: 'hero', heroId: path.slice('hero/'.length), query: search };
  }
  if (path.startsWith('spell/')) {
    return { view: 'spell', spellId: path.slice('spell/'.length), query: search };
  }
  if (path.startsWith('unit/')) {
    return { view: 'unit', unitId: path.slice('unit/'.length), query: search };
  }
  // Back-compat: old #-fragment hash routes — recover from window.location.hash.
  const hashRaw = (window.location.hash || '').replace(/^#/, '');
  if (hashRaw) {
    const newRoute = parseHashLegacy(hashRaw);
    if (newRoute) {
      // Replace URL with path version, then return parsed
      const fullUrl = routeToUrl(newRoute.path, newRoute.query);
      history.replaceState(null, '', fullUrl);
      return parsePath();
    }
  }
  // Bare /laws and /buildings → default to the lead faction so the calc renders.
  if (path === 'laws')      return { view: 'calc-faction', factionId: 'temple', kind: 'laws', query: search };
  if (path === 'buildings') return { view: 'calc-faction', factionId: 'temple', kind: 'buildings', query: search };
  if (SIMPLE_VIEWS.includes(path)) return { view: path, factionId: null, query: search };
  return { view: 'index', factionId: null, query: '' };
};

// Legacy #-fragment recovery: if a user lands on the old hash URL, convert it
// once to the new path form via replaceState (no hashchange event fires for
// replaceState in modern browsers).
const parseHashLegacy = (hashRaw) => {
  const qIdx = hashRaw.indexOf('?');
  const hpath = qIdx === -1 ? hashRaw : hashRaw.slice(0, qIdx);
  const hquery = qIdx === -1 ? '' : hashRaw.slice(qIdx + 1);
  // Map known hash forms to path forms (kind/<id> for calc/laws/buildings).
  if (hpath.startsWith('calc/laws/')) return { path: 'laws/' + hpath.slice('calc/laws/'.length), query: hquery };
  if (hpath.startsWith('calc/buildings/')) return { path: 'buildings/' + hpath.slice('calc/buildings/'.length), query: hquery };
  if (hpath.startsWith('calc/')) return { path: 'buildings/' + hpath.slice('calc/'.length), query: hquery };
  if (hpath === 'calc') return { path: 'buildings/temple', query: hquery };
  if (hpath === 'index' || hpath === '') return { path: '', query: hquery };
  return { path: hpath, query: hquery };
};

// Given a route, return the document.title to set.
const titleFor = (route) => {
  const factionName = (fid) => {
    const f = window.OE_DATA?.FACTIONS?.find(x => x.id === fid);
    return f?.name || fid || '';
  };
  const t = (label) => `${label} — Olden Era`;
  switch (route.view) {
    case 'index':         return 'Olden Era — Reference';
    case 'mechanics':     return t('Mechanics 101');
    case 'factions':      return t('Factions');
    case 'faction':       return t(`${factionName(route.factionId)} Faction`);
    case 'units-faction': return t(`${factionName(route.factionId)} Units`);
    case 'hero': {
      const h = window.OE_DATA?.HEROES?.find(x => x.id === route.heroId);
      return t(h?.name || 'Hero');
    }
    case 'spell': {
      const s = window.OE_SPELLS_DATA?.SPELLS?.find(x => x.id === route.spellId);
      return t(s?.name || 'Spell');
    }
    case 'unit': {
      const u = window.OE_DATA?.UNITS?.find(x => x.id === route.unitId);
      return t(u?.name || 'Unit');
    }
    case 'calc-faction':
      return t(`${factionName(route.factionId)} ${route.kind === 'laws' ? 'Laws' : 'Buildings'}`);
    case 'subclasses':    return t('Subclasses');
    case 'skills':        return t('Skills');
    case 'spells':        return t('Spells');
    case 'map-objects':   return t('Map Objects');
    case 'map-templates': return t('Map Templates');
    case 'resources':     return t('Resources');
    case 'artifacts':     return t('Artifacts');
    case 'heroes':        return t('Heroes');
    case 'units':         return t('Units');
    case 'tier':          return t('Tier list');
    case 'guides':        return t('Guides');
    case 'draft':         return t('Draft');
    case 'laws':          return t('Laws');
    case 'buildings':     return t('Buildings');
    default:              return 'Olden Era';
  }
};

const App = () => {
  const [route, setRoute] = React.useState(parsePath);

  const go = (target) => {
    // target is either a route string ('units/temple') or 'units/temple?b=...'
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
    } else if (typeof path === 'string' && path.startsWith('hero/')) {
      next = { view: 'hero', heroId: path.slice('hero/'.length), query };
    } else if (typeof path === 'string' && path.startsWith('spell/')) {
      next = { view: 'spell', spellId: path.slice('spell/'.length), query };
    } else if (typeof path === 'string' && path.startsWith('unit/')) {
      next = { view: 'unit', unitId: path.slice('unit/'.length), query };
    } else {
      next = { view: path, factionId: null, query };
    }
    setRoute(next);
    const url = routeToUrl(target, '');
    if (window.location.pathname + window.location.search !== url) {
      history.pushState(null, '', url);
    }
    window.scrollTo({top: 0});
  };

  React.useEffect(() => {
    const onPop = () => setRoute(parsePath());
    window.addEventListener('popstate', onPop);
    // Keep legacy hashchange listener so old in-page hash links still work
    // through this boundary too (rare, but cheap).
    window.addEventListener('hashchange', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      window.removeEventListener('hashchange', onPop);
    };
  }, []);

  // Update document.title every time the route changes.
  React.useEffect(() => {
    document.title = titleFor(route);
  }, [route]);

  const meta = window.OE_DATA
    ? `${window.OE_DATA.HEROES.length} heroes · ${window.OE_DATA.SUBCLASSES.length} subclasses · ${window.OE_DATA.UNITS.length} units · ${window.OE_DATA.FACTIONS.length} factions`
    : '';

  const tabActive = (v) => route.view === v ? 'active' : '';

  // Build a full URL for a tab/link. Used for href so right-click → New tab works.
  const url = (target) => routeToUrl(target, '');

  return (
    <div className="shell">
      <header className="masthead">
        <a className="brand" href={url('')} onClick={(e)=>{e.preventDefault();go('index');}}>
          Olden Era<span className="sub">a reference</span>
        </a>
        <div className="meta">{meta}</div>
      </header>

      <nav className="tabs">
        <a className={tabActive('index')}      href={url('')}            onClick={(e)=>{e.preventDefault();go('index');}}>Index</a>
        <a className={tabActive('mechanics')}  href={url('mechanics')}   onClick={(e)=>{e.preventDefault();go('mechanics');}}>Mechanics</a>
        <a className={tabActive('factions') || (route.view==='faction'?'active':'')}
           href={url('factions')} onClick={(e)=>{e.preventDefault();go('factions');}}>Factions</a>
        <a className={tabActive('buildings') || (route.view==='calc-faction' && route.kind==='buildings'?'active':'')}
           href={url('buildings/temple')} onClick={(e)=>{e.preventDefault();go('buildings/temple');}}>Buildings</a>
        <a className={tabActive('laws') || (route.view==='calc-faction' && route.kind==='laws'?'active':'')}
           href={url('laws/temple')} onClick={(e)=>{e.preventDefault();go('laws/temple');}}>Laws</a>
        <a className={tabActive('subclasses')} href={url('subclasses')}  onClick={(e)=>{e.preventDefault();go('subclasses');}}>Subclasses</a>
        <a className={tabActive('skills')}     href={url('skills')}      onClick={(e)=>{e.preventDefault();go('skills');}}>Skills</a>
        <a className={tabActive('spells')}     href={url('spells')}      onClick={(e)=>{e.preventDefault();go('spells');}}>Spells</a>
        <a className={tabActive('map-objects')}   href={url('map-objects')}   onClick={(e)=>{e.preventDefault();go('map-objects');}}>Map objects</a>
        <a className={tabActive('map-templates')} href={url('map-templates')} onClick={(e)=>{e.preventDefault();go('map-templates');}}>Templates</a>
        <a className={tabActive('resources')}     href={url('resources')}     onClick={(e)=>{e.preventDefault();go('resources');}}>Resources</a>
        <a className={tabActive('artifacts')}     href={url('artifacts')}     onClick={(e)=>{e.preventDefault();go('artifacts');}}>Artifacts</a>
        <a className={tabActive('heroes')}     href={url('heroes')}      onClick={(e)=>{e.preventDefault();go('heroes');}}>Heroes</a>
        <a className={tabActive('units')}      href={url('units')}       onClick={(e)=>{e.preventDefault();go('units');}}>Units</a>
        <a className={tabActive('tier')}       href={url('tier')}        onClick={(e)=>{e.preventDefault();go('tier');}}>Tier list</a>
        <a className={tabActive('guides')}     href={url('guides')}      onClick={(e)=>{e.preventDefault();go('guides');}}>Guides</a>
        <a className={tabActive('draft')}      href={url('draft')}       onClick={(e)=>{e.preventDefault();go('draft');}}>Draft</a>
      </nav>

      {route.view==='index'         && <window.IndexView go={go} />}
      {route.view==='mechanics'     && <window.MechanicsView go={go} />}
      {route.view==='factions'      && <window.FactionsHubView go={go} />}
      {route.view==='faction'       && <window.FactionView factionId={route.factionId} go={go} />}
      {route.view==='calc-faction'  && <window.CalcView factionId={route.factionId} kind={route.kind} initialQuery={route.query} go={go} />}
      {route.view==='subclasses' && <window.SubclassesView />}
      {route.view==='skills'     && <window.SkillsView />}
      {route.view==='spells'        && <window.SpellsView />}
      {route.view==='map-objects'   && <window.MapObjectsView />}
      {route.view==='map-templates' && <window.MapTemplatesView />}
      {route.view==='resources'     && <window.ResourcesView />}
      {route.view==='artifacts'     && <window.ArtifactsView />}
      {route.view==='heroes'     && <window.HeroesView go={go} />}
      {route.view==='units'         && <window.UnitsView go={go} />}
      {route.view==='units-faction' && <window.FactionUnitsView factionId={route.factionId} go={go} />}
      {route.view==='hero'          && <window.HeroView heroId={route.heroId} go={go} />}
      {route.view==='spell'         && <window.SpellView spellId={route.spellId} go={go} />}
      {route.view==='unit'          && <window.UnitView unitId={route.unitId} go={go} />}
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

// Expose route helper so other view files (compiled separately) can build URLs.
window.OE_routeToUrl = routeToUrl;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
