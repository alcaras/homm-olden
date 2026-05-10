const MechanicsView = ({ go }) => {
  const M = window.OE_MECHANICS_DATA;
  if (!M) return /* @__PURE__ */ React.createElement("p", null, "Mechanics data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Mechanics 101"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "New to Olden Era \u2014 or coming from HOMM3? This page covers the systems every player needs to internalize before the tournament strategy on the rest of the site makes sense. Synthesized from the Hooded Horse wiki, Steam community guides, and creator commentary; each numeric claim was triangulated against at least two sources."), /* @__PURE__ */ React.createElement("nav", { className: "mech-toc" }, M.SECTIONS.map((s) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: s.id,
      href: `#mech-${s.id}`,
      onClick: (e) => {
        e.preventDefault();
        document.getElementById(`mech-${s.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    s.eyebrow
  )), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#mech-faction-mechanics",
      onClick: (e) => {
        e.preventDefault();
        document.getElementById("mech-faction-mechanics")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    "Per-faction signatures"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#mech-resources",
      onClick: (e) => {
        e.preventDefault();
        document.getElementById("mech-resources")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    "Resources"
  )), M.SECTIONS.map((s) => /* @__PURE__ */ React.createElement("section", { key: s.id, id: `mech-${s.id}`, className: "mech-section" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "mech-eyebrow" }, s.eyebrow), /* @__PURE__ */ React.createElement("span", { className: "mech-title" }, s.title)), s.intro && /* @__PURE__ */ React.createElement("p", { className: "mech-intro" }, s.intro), s.blocks?.map((b, i) => {
    if (b.type === "paragraph") {
      return /* @__PURE__ */ React.createElement("p", { key: i, className: "mech-para", dangerouslySetInnerHTML: { __html: markdownInlineToHtml(b.body) } });
    }
    if (b.type === "callout") {
      return /* @__PURE__ */ React.createElement("div", { key: i, className: "mech-callout" }, /* @__PURE__ */ React.createElement("div", { className: "mech-callout-title" }, b.title), /* @__PURE__ */ React.createElement("div", { className: "mech-callout-body", dangerouslySetInnerHTML: { __html: markdownInlineToHtml(b.body) } }));
    }
    return null;
  }), s.facts?.length > 0 && /* @__PURE__ */ React.createElement("table", { className: "mech-facts" }, /* @__PURE__ */ React.createElement("tbody", null, s.facts.map((row, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("th", null, row[0]), /* @__PURE__ */ React.createElement("td", null, row[1]))))), s.pitfalls?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mech-pitfalls" }, /* @__PURE__ */ React.createElement("div", { className: "mech-pitfalls-head" }, "Common mistakes"), /* @__PURE__ */ React.createElement("ul", null, s.pitfalls.map((p, i) => /* @__PURE__ */ React.createElement("li", { key: i }, p)))), s.links?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mech-links" }, /* @__PURE__ */ React.createElement("span", { className: "mech-links-label" }, "Further reading:"), s.links.map(([label, url], i) => /* @__PURE__ */ React.createElement("a", { key: i, href: url, target: "_blank", rel: "noopener noreferrer" }, label))))), /* @__PURE__ */ React.createElement("section", { id: "mech-faction-mechanics", className: "mech-section" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "mech-eyebrow" }, "Per-faction signatures"), /* @__PURE__ */ React.createElement("span", { className: "mech-title" }, "The faction-defining mechanic in one paragraph")), /* @__PURE__ */ React.createElement("p", { className: "mech-intro" }, "Before any of the tournament tier list / build / law content makes sense, you need the faction's defining mechanic. One paragraph each. Mirrored on the per-faction pages."), /* @__PURE__ */ React.createElement("div", { className: "mech-faction-grid" }, FACTIONS.map((f) => {
    const sig = M.FACTION_SIGNATURE_MECHANICS?.[f.id];
    if (!sig) return null;
    return /* @__PURE__ */ React.createElement(
      "a",
      {
        key: f.id,
        className: "mech-faction-card",
        href: window.OE_routeToUrl(`faction/${f.id}`),
        onClick: (e) => {
          e.preventDefault();
          go(`faction/${f.id}`);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "mech-faction-head" }, /* @__PURE__ */ React.createElement(
        "img",
        {
          loading: "lazy",
          className: "mech-faction-icon",
          src: `img/factions/fraction_${f.unitKey || ""}.png`,
          alt: "",
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, f.name), /* @__PURE__ */ React.createElement("div", { className: "mech-faction-title" }, sig.title))),
      /* @__PURE__ */ React.createElement("div", { className: "mech-faction-body" }, sig.body)
    );
  }))), /* @__PURE__ */ React.createElement("section", { id: "mech-resources", className: "mech-section" }, /* @__PURE__ */ React.createElement("h2", null, /* @__PURE__ */ React.createElement("span", { className: "mech-eyebrow" }, "External resources"), /* @__PURE__ */ React.createElement("span", { className: "mech-title" }, "Where to go deeper")), /* @__PURE__ */ React.createElement("div", { className: "mech-resources" }, M.TOP_RESOURCES.map((r, i) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: i,
      className: "mech-resource",
      href: r.url,
      target: "_blank",
      rel: "noopener noreferrer"
    },
    /* @__PURE__ */ React.createElement("div", { className: "mech-resource-title" }, r.title, " \u2197"),
    /* @__PURE__ */ React.createElement("div", { className: "mech-resource-desc" }, r.desc)
  )))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", M.GENERATED_AT, ". Edit", " ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_mechanics.py"), " and rerun to refresh."));
};
function markdownInlineToHtml(s) {
  const escape = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escape(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>").replace(/`([^`]+)`/g, "<code>$1</code>");
}
window.MechanicsView = MechanicsView;
