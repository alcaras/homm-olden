const SIMPLE_VIEWS = [
  "index",
  "mechanics",
  "factions",
  "subclasses",
  "skills",
  "heroes",
  "units",
  "tier",
  "guides",
  "draft",
  "spells"
];
const BASE = (() => {
  const p = window.location.pathname;
  const m = p.match(/^(\/homm-olden\/)/);
  return m ? m[1] : "/";
})();
const stripBase = (pathname) => pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "");
const routeToUrl = (route, query) => {
  const r = route.replace(/^\//, "");
  return BASE + r + (query ? "?" + query : "");
};
const parsePath = () => {
  const raw = stripBase(window.location.pathname || "");
  const search = window.location.search.slice(1) || "";
  const path = raw || "index";
  if (path.startsWith("faction/")) {
    return { view: "faction", factionId: path.slice("faction/".length), query: search };
  }
  if (path.startsWith("laws/")) {
    return { view: "calc-faction", factionId: path.slice("laws/".length), kind: "laws", query: search };
  }
  if (path.startsWith("buildings/")) {
    return { view: "calc-faction", factionId: path.slice("buildings/".length), kind: "buildings", query: search };
  }
  if (path.startsWith("units/")) {
    return { view: "units-faction", factionId: path.slice("units/".length), query: search };
  }
  const hashRaw = (window.location.hash || "").replace(/^#/, "");
  if (hashRaw) {
    const newRoute = parseHashLegacy(hashRaw);
    if (newRoute) {
      const fullUrl = routeToUrl(newRoute.path, newRoute.query);
      history.replaceState(null, "", fullUrl);
      return parsePath();
    }
  }
  if (path === "laws") return { view: "calc-faction", factionId: "temple", kind: "laws", query: search };
  if (path === "buildings") return { view: "calc-faction", factionId: "temple", kind: "buildings", query: search };
  if (SIMPLE_VIEWS.includes(path)) return { view: path, factionId: null, query: search };
  return { view: "index", factionId: null, query: "" };
};
const parseHashLegacy = (hashRaw) => {
  const qIdx = hashRaw.indexOf("?");
  const hpath = qIdx === -1 ? hashRaw : hashRaw.slice(0, qIdx);
  const hquery = qIdx === -1 ? "" : hashRaw.slice(qIdx + 1);
  if (hpath.startsWith("calc/laws/")) return { path: "laws/" + hpath.slice("calc/laws/".length), query: hquery };
  if (hpath.startsWith("calc/buildings/")) return { path: "buildings/" + hpath.slice("calc/buildings/".length), query: hquery };
  if (hpath.startsWith("calc/")) return { path: "buildings/" + hpath.slice("calc/".length), query: hquery };
  if (hpath === "calc") return { path: "buildings/temple", query: hquery };
  if (hpath === "index" || hpath === "") return { path: "", query: hquery };
  return { path: hpath, query: hquery };
};
const titleFor = (route) => {
  const factionName = (fid) => {
    const f = window.OE_DATA?.FACTIONS?.find((x) => x.id === fid);
    return f?.name || fid || "";
  };
  const t = (label) => `${label} \u2014 Olden Era`;
  switch (route.view) {
    case "index":
      return "Olden Era \u2014 Reference";
    case "mechanics":
      return t("Mechanics 101");
    case "factions":
      return t("Factions");
    case "faction":
      return t(`${factionName(route.factionId)} Faction`);
    case "units-faction":
      return t(`${factionName(route.factionId)} Units`);
    case "calc-faction":
      return t(`${factionName(route.factionId)} ${route.kind === "laws" ? "Laws" : "Buildings"}`);
    case "subclasses":
      return t("Subclasses");
    case "skills":
      return t("Skills");
    case "spells":
      return t("Spells");
    case "heroes":
      return t("Heroes");
    case "units":
      return t("Units");
    case "tier":
      return t("Tier list");
    case "guides":
      return t("Guides");
    case "draft":
      return t("Draft");
    case "laws":
      return t("Laws");
    case "buildings":
      return t("Buildings");
    default:
      return "Olden Era";
  }
};
const App = () => {
  const [route, setRoute] = React.useState(parsePath);
  const go = (target) => {
    const qIdx = typeof target === "string" ? target.indexOf("?") : -1;
    const path = qIdx === -1 ? target : target.slice(0, qIdx);
    const query = qIdx === -1 ? "" : target.slice(qIdx + 1);
    let next;
    if (typeof path === "string" && path.startsWith("faction/")) {
      next = { view: "faction", factionId: path.slice("faction/".length), query };
    } else if (typeof path === "string" && path.startsWith("laws/")) {
      next = { view: "calc-faction", factionId: path.slice("laws/".length), kind: "laws", query };
    } else if (typeof path === "string" && path.startsWith("buildings/")) {
      next = { view: "calc-faction", factionId: path.slice("buildings/".length), kind: "buildings", query };
    } else if (typeof path === "string" && path.startsWith("units/")) {
      next = { view: "units-faction", factionId: path.slice("units/".length), query };
    } else {
      next = { view: path, factionId: null, query };
    }
    setRoute(next);
    const url2 = routeToUrl(target, "");
    if (window.location.pathname + window.location.search !== url2) {
      history.pushState(null, "", url2);
    }
    window.scrollTo({ top: 0 });
  };
  React.useEffect(() => {
    const onPop = () => setRoute(parsePath());
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onPop);
    };
  }, []);
  React.useEffect(() => {
    document.title = titleFor(route);
  }, [route]);
  const meta = window.OE_DATA ? `${window.OE_DATA.HEROES.length} heroes \xB7 ${window.OE_DATA.SUBCLASSES.length} subclasses \xB7 ${window.OE_DATA.UNITS.length} units \xB7 ${window.OE_DATA.FACTIONS.length} factions` : "";
  const tabActive = (v) => route.view === v ? "active" : "";
  const url = (target) => routeToUrl(target, "");
  return /* @__PURE__ */ React.createElement("div", { className: "shell" }, /* @__PURE__ */ React.createElement("header", { className: "masthead" }, /* @__PURE__ */ React.createElement("a", { className: "brand", href: url(""), onClick: (e) => {
    e.preventDefault();
    go("index");
  } }, "Olden Era", /* @__PURE__ */ React.createElement("span", { className: "sub" }, "a reference")), /* @__PURE__ */ React.createElement("div", { className: "meta" }, meta)), /* @__PURE__ */ React.createElement("nav", { className: "tabs" }, /* @__PURE__ */ React.createElement("a", { className: tabActive("index"), href: url(""), onClick: (e) => {
    e.preventDefault();
    go("index");
  } }, "Index"), /* @__PURE__ */ React.createElement("a", { className: tabActive("mechanics"), href: url("mechanics"), onClick: (e) => {
    e.preventDefault();
    go("mechanics");
  } }, "Mechanics"), /* @__PURE__ */ React.createElement(
    "a",
    {
      className: tabActive("factions") || (route.view === "faction" ? "active" : ""),
      href: url("factions"),
      onClick: (e) => {
        e.preventDefault();
        go("factions");
      }
    },
    "Factions"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      className: tabActive("buildings") || (route.view === "calc-faction" && route.kind === "buildings" ? "active" : ""),
      href: url("buildings/temple"),
      onClick: (e) => {
        e.preventDefault();
        go("buildings/temple");
      }
    },
    "Buildings"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      className: tabActive("laws") || (route.view === "calc-faction" && route.kind === "laws" ? "active" : ""),
      href: url("laws/temple"),
      onClick: (e) => {
        e.preventDefault();
        go("laws/temple");
      }
    },
    "Laws"
  ), /* @__PURE__ */ React.createElement("a", { className: tabActive("subclasses"), href: url("subclasses"), onClick: (e) => {
    e.preventDefault();
    go("subclasses");
  } }, "Subclasses"), /* @__PURE__ */ React.createElement("a", { className: tabActive("skills"), href: url("skills"), onClick: (e) => {
    e.preventDefault();
    go("skills");
  } }, "Skills"), /* @__PURE__ */ React.createElement("a", { className: tabActive("spells"), href: url("spells"), onClick: (e) => {
    e.preventDefault();
    go("spells");
  } }, "Spells"), /* @__PURE__ */ React.createElement("a", { className: tabActive("heroes"), href: url("heroes"), onClick: (e) => {
    e.preventDefault();
    go("heroes");
  } }, "Heroes"), /* @__PURE__ */ React.createElement("a", { className: tabActive("units"), href: url("units"), onClick: (e) => {
    e.preventDefault();
    go("units");
  } }, "Units"), /* @__PURE__ */ React.createElement("a", { className: tabActive("tier"), href: url("tier"), onClick: (e) => {
    e.preventDefault();
    go("tier");
  } }, "Tier list"), /* @__PURE__ */ React.createElement("a", { className: tabActive("guides"), href: url("guides"), onClick: (e) => {
    e.preventDefault();
    go("guides");
  } }, "Guides"), /* @__PURE__ */ React.createElement("a", { className: tabActive("draft"), href: url("draft"), onClick: (e) => {
    e.preventDefault();
    go("draft");
  } }, "Draft")), route.view === "index" && /* @__PURE__ */ React.createElement(window.IndexView, { go }), route.view === "mechanics" && /* @__PURE__ */ React.createElement(window.MechanicsView, { go }), route.view === "factions" && /* @__PURE__ */ React.createElement(window.FactionsHubView, { go }), route.view === "faction" && /* @__PURE__ */ React.createElement(window.FactionView, { factionId: route.factionId, go }), route.view === "calc-faction" && /* @__PURE__ */ React.createElement(window.CalcView, { factionId: route.factionId, kind: route.kind, initialQuery: route.query, go }), route.view === "subclasses" && /* @__PURE__ */ React.createElement(window.SubclassesView, null), route.view === "skills" && /* @__PURE__ */ React.createElement(window.SkillsView, null), route.view === "spells" && /* @__PURE__ */ React.createElement(window.SpellsView, null), route.view === "heroes" && /* @__PURE__ */ React.createElement(window.HeroesView, null), route.view === "units" && /* @__PURE__ */ React.createElement(window.UnitsView, { go }), route.view === "units-faction" && /* @__PURE__ */ React.createElement(window.FactionUnitsView, { factionId: route.factionId, go }), route.view === "tier" && /* @__PURE__ */ React.createElement(window.TierView, null), route.view === "guides" && /* @__PURE__ */ React.createElement(window.GuidesView, null), route.view === "draft" && /* @__PURE__ */ React.createElement(window.DraftView, null), /* @__PURE__ */ React.createElement("footer", { className: "sitefoot" }, window.OE_DATA?.META && /* @__PURE__ */ React.createElement("span", null, "Game build ", /* @__PURE__ */ React.createElement("code", null, window.OE_DATA.META.buildGuid.slice(0, 8) || "\u2014"), window.OE_DATA.META.coreDate && /* @__PURE__ */ React.createElement(React.Fragment, null, " \xB7 ", /* @__PURE__ */ React.createElement("code", null, "Core.zip"), " dated ", window.OE_DATA.META.coreDate), " \xB7 ", "generated ", window.OE_DATA.META.generatedAt)));
};
window.OE_routeToUrl = routeToUrl;
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ React.createElement(App, null));
