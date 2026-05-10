const TIER_ORDER = ["S", "A", "B", "C"];
const TIER_LABEL = {
  S: "perma-pick / perma-ban",
  A: "strong contested",
  B: "situational / playable",
  C: "avoid"
};
const FactionView = ({ factionId, go }) => {
  const T = window.OE_TIER_DATA;
  const G = window.OE_GUIDES_DATA;
  const D = window.OE_DRAFT_DATA;
  if (!T || !G || !D) return /* @__PURE__ */ React.createElement("p", null, "Faction data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const fmeta = FACTIONS.find((f) => f.id === factionId);
  if (!fmeta) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", null, "Unknown faction ", /* @__PURE__ */ React.createElement("code", null, factionId), "."), /* @__PURE__ */ React.createElement("p", null, /* @__PURE__ */ React.createElement("a", { href: window.OE_routeToUrl("factions"), onClick: (e) => {
      e.preventDefault();
      go("factions");
    } }, "Back to factions")));
  }
  const tierMeta = T.FACTION_META && T.FACTION_META[factionId] || {};
  const heroes = T.BY_FACTION && T.BY_FACTION[factionId] || [];
  const guide = (G.FACTIONS || []).find((f) => f.id === factionId);
  const heroBans = D.HERO_BANS && D.HERO_BANS[factionId] || [];
  const myCounter = D.COUNTERS && D.COUNTERS[factionId];
  const counteredBy = Object.entries(D.COUNTERS || {}).filter(([opFid, c]) => c.primary?.factionId === factionId || c.alt?.factionId === factionId).map(([opFid, c]) => ({
    opFid,
    opName: FACTIONS.find((f) => f.id === opFid)?.name || opFid,
    primary: c.primary?.factionId === factionId ? c.primary : null,
    alt: c.alt?.factionId === factionId ? c.alt : null
  }));
  const factionBan = (D.FACTION_BAN_ORDER || []).find((r) => r.faction === factionId);
  const factionPick = (D.FACTION_PICK_ORDER || []).find((r) => r.faction === factionId);
  const PrioBadge = ({ p }) => {
    const cls = `prio-badge prio-${p === "trap" ? "trap" : p}`;
    const label = p === "trap" ? "skip" : p;
    return /* @__PURE__ */ React.createElement("span", { className: cls }, label);
  };
  const FactionPill = ({ fid }) => {
    const f = FACTIONS.find((x) => x.id === fid);
    return /* @__PURE__ */ React.createElement(
      "a",
      {
        href: window.OE_routeToUrl(`faction/${fid}`),
        onClick: (e) => {
          e.preventDefault();
          go(`faction/${fid}`);
        },
        className: `faction-pill faction-${fid}`
      },
      f?.name || fid
    );
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(FactionSwitcher, { current: factionId, factions: FACTIONS, go }), /* @__PURE__ */ React.createElement("p", { className: "faction-page-actions" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`buildings/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`buildings/${factionId}`);
      },
      className: "faction-page-cta"
    },
    fmeta.name,
    " buildings calc \u2192"
  ), " ", /* @__PURE__ */ React.createElement(
    "a",
    {
      href: window.OE_routeToUrl(`laws/${factionId}`),
      onClick: (e) => {
        e.preventDefault();
        go(`laws/${factionId}`);
      },
      className: "faction-page-cta"
    },
    fmeta.name,
    " laws calc \u2192"
  )), /* @__PURE__ */ React.createElement("div", { className: "faction-hero" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      className: "faction-hero-icon",
      loading: "lazy",
      src: `img/factions/fraction_${fmeta.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-body" }, /* @__PURE__ */ React.createElement("h1", { className: "faction-hero-name" }, fmeta.name), /* @__PURE__ */ React.createElement("div", { className: "faction-hero-classes" }, /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-might" }, "\u2694"), " ", fmeta.might, " \xB7 ", /* @__PURE__ */ React.createElement("span", { className: "glyph glyph-magic" }, "\u2726"), " ", fmeta.magic, fmeta.skill && /* @__PURE__ */ React.createElement("span", { className: "faction-hero-skill" }, " \xB7 ", fmeta.skill)))), tierMeta.summary && /* @__PURE__ */ React.createElement("p", { className: "lede faction-lede" }, tierMeta.summary), tierMeta.creature_tip && /* @__PURE__ */ React.createElement("p", { className: "faction-tip" }, /* @__PURE__ */ React.createElement("em", null, "Creature tip:"), " ", tierMeta.creature_tip), tierMeta.signature_mechanic && /* @__PURE__ */ React.createElement("div", { className: "signature-mechanic" }, /* @__PURE__ */ React.createElement("div", { className: "signature-mechanic-eyebrow" }, "Signature mechanic"), /* @__PURE__ */ React.createElement("div", { className: "signature-mechanic-title" }, tierMeta.signature_mechanic.title), /* @__PURE__ */ React.createElement("p", { className: "signature-mechanic-body" }, tierMeta.signature_mechanic.body), /* @__PURE__ */ React.createElement("p", { className: "signature-mechanic-link" }, /* @__PURE__ */ React.createElement("a", { href: window.OE_routeToUrl("mechanics"), onClick: (e) => {
    e.preventDefault();
    go("mechanics");
  } }, "Mechanics 101 \u2192"))), /* @__PURE__ */ React.createElement("div", { className: "faction-meta-cards" }, factionBan && /* @__PURE__ */ React.createElement("div", { className: "meta-card" }, /* @__PURE__ */ React.createElement("div", { className: "meta-card-eyebrow" }, "Faction ban priority"), /* @__PURE__ */ React.createElement("div", { className: "meta-card-body" }, typeof factionBan.rank === "number" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("b", null, "#", factionBan.rank), " opponents will consider banning this faction.") : factionBan.rank === "anti" ? /* @__PURE__ */ React.createElement("b", null, "Anti-pattern \u2014 don't ban.") : /* @__PURE__ */ React.createElement("b", null, "Skip \u2014 not a high-priority faction ban.")), /* @__PURE__ */ React.createElement("div", { className: "meta-card-why" }, factionBan.why)), factionPick && /* @__PURE__ */ React.createElement("div", { className: "meta-card" }, /* @__PURE__ */ React.createElement("div", { className: "meta-card-eyebrow" }, "Faction pick priority"), /* @__PURE__ */ React.createElement("div", { className: "meta-card-body" }, /* @__PURE__ */ React.createElement("b", null, "#", D.FACTION_PICK_ORDER.findIndex((r) => r.faction === factionId) + 1), " ", "of ", D.FACTION_PICK_ORDER.length, " when picking faction."), /* @__PURE__ */ React.createElement("div", { className: "meta-card-why" }, factionPick.why))), /* @__PURE__ */ React.createElement("h2", null, "Hero tier list"), /* @__PURE__ */ React.createElement("div", { className: "tier-scale" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "S"), " perma-pick / perma-ban"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "A"), " strong contested"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "B"), " situational / playable"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "C"), " avoid"), /* @__PURE__ */ React.createElement("span", { className: "tier-derived-key" }, /* @__PURE__ */ React.createElement("em", null, "(data)"), " uncited \u2014 derived from extracted data")), TIER_ORDER.map((tier) => {
    const t_rows = heroes.filter((r) => r.tier === tier);
    if (t_rows.length === 0) return null;
    return /* @__PURE__ */ React.createElement("div", { key: tier, className: `tier-block tier-block-${tier}` }, /* @__PURE__ */ React.createElement("div", { className: "tier-head" }, /* @__PURE__ */ React.createElement("span", { className: `tier-badge tier-${tier}` }, tier), /* @__PURE__ */ React.createElement("span", { className: "tier-label" }, TIER_LABEL[tier]), /* @__PURE__ */ React.createElement("span", { className: "tier-count" }, t_rows.length)), /* @__PURE__ */ React.createElement("ul", { className: "tier-heroes" }, t_rows.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id, className: "tier-hero" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "th-portrait",
        src: `img/heroes/${h.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", { className: "th-body" }, /* @__PURE__ */ React.createElement("div", { className: "th-name-row" }, /* @__PURE__ */ React.createElement("span", { className: "th-name" }, h.name), /* @__PURE__ */ React.createElement("span", { className: h.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, h.kind === "might" ? "\u2694" : "\u2726"), /* @__PURE__ */ React.createElement("span", { className: "th-class" }, h.kind === "might" ? fmeta.might : fmeta.magic), /* @__PURE__ */ React.createElement("span", { className: "th-specialty" }, h.specialty), h.derived && /* @__PURE__ */ React.createElement("span", { className: "th-derived" }, "data")), /* @__PURE__ */ React.createElement("div", { className: "th-army" }, h.army), /* @__PURE__ */ React.createElement("div", { className: "th-note" }, h.note))))));
  }), heroBans.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Top hero bans against ", fmeta.name), /* @__PURE__ */ React.createElement("p", { className: "note" }, "These are the heroes opposing players will most likely ban from you (in priority order). With the standard 3-ban format, expect the top three to be gone \u2014 plan to play whichever surviving hero best matches your draft."), /* @__PURE__ */ React.createElement("ol", { className: "ban-list ban-list-tall" }, heroBans.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id }, /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      className: "ban-portrait",
      src: `img/heroes/${h.id}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.visibility = "hidden";
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "ban-body" }, /* @__PURE__ */ React.createElement("div", { className: "ban-name" }, h.name), /* @__PURE__ */ React.createElement("div", { className: "ban-why" }, h.why)))))), guide && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "What to build"), guide.summary && /* @__PURE__ */ React.createElement("p", { className: "faction-summary" }, guide.summary), /* @__PURE__ */ React.createElement("div", { className: "guide-grid" }, /* @__PURE__ */ React.createElement("div", { className: "guide-col" }, /* @__PURE__ */ React.createElement("h3", null, "Build order"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "phase-col" }, "Phase"), /* @__PURE__ */ React.createElement("th", null, "Building"), /* @__PURE__ */ React.createElement("th", { className: "prio-col" }, "Prio"), /* @__PURE__ */ React.createElement("th", null, "Note"))), /* @__PURE__ */ React.createElement("tbody", null, guide.buildOrder.map((b, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { className: "phase-col" }, /* @__PURE__ */ React.createElement("span", { className: "phase" }, b.phase)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, b.name), /* @__PURE__ */ React.createElement("div", { className: "b-id mono" }, b.shortId)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: b.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, b.note))), guide.buildingTraps?.length > 0 && /* @__PURE__ */ React.createElement("tr", { className: "traps-divider" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4 }, "Traps \u2014 explicitly skip")), (guide.buildingTraps || []).map((b, i) => /* @__PURE__ */ React.createElement("tr", { key: `t${i}`, className: "trap-row" }, /* @__PURE__ */ React.createElement("td", { className: "phase-col" }, /* @__PURE__ */ React.createElement("span", { className: "phase phase-skip" }, "\u2014")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, b.name), /* @__PURE__ */ React.createElement("div", { className: "b-id mono" }, b.shortId)), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: b.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, b.note)))))), /* @__PURE__ */ React.createElement("div", { className: "guide-col" }, /* @__PURE__ */ React.createElement("h3", null, "Law priorities"), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "num-col" }, "#"), /* @__PURE__ */ React.createElement("th", null, "Law"), /* @__PURE__ */ React.createElement("th", { className: "prio-col" }, "Prio"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, guide.lawsTop.map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { className: "num-col" }, l.num), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, l.name), /* @__PURE__ */ React.createElement("div", { className: "l-desc" }, (l.desc || "").split("\n")[0])), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: l.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, l.note))), guide.lawsTraps?.length > 0 && /* @__PURE__ */ React.createElement("tr", { className: "traps-divider" }, /* @__PURE__ */ React.createElement("td", { colSpan: 4 }, "Traps \u2014 explicitly skip")), (guide.lawsTraps || []).map((l, i) => /* @__PURE__ */ React.createElement("tr", { key: `t${i}`, className: "trap-row" }, /* @__PURE__ */ React.createElement("td", { className: "num-col" }, l.num), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, l.name), /* @__PURE__ */ React.createElement("div", { className: "l-desc" }, (l.desc || "").split("\n")[0])), /* @__PURE__ */ React.createElement("td", { className: "prio-col" }, /* @__PURE__ */ React.createElement(PrioBadge, { p: l.priority })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, l.note)))))))), tierMeta.army_comp && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Army composition"), /* @__PURE__ */ React.createElement("table", { className: "guide-table army-comp-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", { className: "phase-col" }, "Tier"), /* @__PURE__ */ React.createElement("th", null, "Preferred unit"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, tierMeta.army_comp.map((row, i) => /* @__PURE__ */ React.createElement("tr", { key: i }, /* @__PURE__ */ React.createElement("td", { className: "phase-col" }, /* @__PURE__ */ React.createElement("span", { className: "phase" }, row[0])), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "b-name" }, row[1])), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, row[2]))))), tierMeta.army_tactics && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h3", null, "Key tactics"), /* @__PURE__ */ React.createElement("ul", { className: "tactics-list" }, tierMeta.army_tactics.map((t, i) => /* @__PURE__ */ React.createElement("li", { key: i }, t)))), tierMeta.army_phases && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h3", null, "Ideal army comp by tournament phase"), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Tournament Pandora-box / camp fights scale across the run:", /* @__PURE__ */ React.createElement("b", null, " 1-2-3"), " camps in week 1, ", /* @__PURE__ */ React.createElement("b", null, "1-3-5"), " in week 2,", /* @__PURE__ */ React.createElement("b", null, " 1-4-7"), " by the week-3 breakthrough and final duel. Your army should match."), /* @__PURE__ */ React.createElement("div", { className: "phase-grid" }, tierMeta.army_phases.map((p, i) => /* @__PURE__ */ React.createElement("div", { className: "phase-card", key: i }, /* @__PURE__ */ React.createElement("div", { className: "phase-card-head" }, p[0]), /* @__PURE__ */ React.createElement("div", { className: "phase-card-body" }, p[1])))))), /* @__PURE__ */ React.createElement("h2", null, "Matchups"), myCounter && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h3", null, "If you face ", fmeta.name, " as opponent \u2014 your best counter"), /* @__PURE__ */ React.createElement("table", { className: "guide-table counter-matrix" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Primary counter"), /* @__PURE__ */ React.createElement("th", null, "Why"), /* @__PURE__ */ React.createElement("th", null, "Alt counter"), /* @__PURE__ */ React.createElement("th", null, "Why"))), /* @__PURE__ */ React.createElement("tbody", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: myCounter.primary.factionId })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, myCounter.primary.why), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: myCounter.alt.factionId })), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, myCounter.alt.why))))), counteredBy.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h3", null, fmeta.name, " as a counter-pick \u2014 when to take this faction"), /* @__PURE__ */ React.createElement("p", { className: "note" }, "These are the matchups where ", fmeta.name, " is the recommended response. If your opponent commits one of these factions and ", fmeta.name, " is still open, this is a strong counter-pick."), /* @__PURE__ */ React.createElement("table", { className: "guide-table" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Opponent picked"), /* @__PURE__ */ React.createElement("th", null, "Role"), /* @__PURE__ */ React.createElement("th", null, "Why ", fmeta.name, " answers it"))), /* @__PURE__ */ React.createElement("tbody", null, counteredBy.map((c, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, c.primary && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: c.opFid })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "prio-badge prio-S" }, "primary")), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, c.primary.why)), c.alt && /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(FactionPill, { fid: c.opFid })), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "prio-badge prio-B" }, "alt")), /* @__PURE__ */ React.createElement("td", { className: "note-col" }, c.alt.why))))))), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Tier-list verdicts from ", /* @__PURE__ */ React.createElement("code", null, "build_tier_list.py"), "; build/law plan from ", /* @__PURE__ */ React.createElement("code", null, "build_faction_guides.py"), "; ban/counter notes from ", /* @__PURE__ */ React.createElement("code", null, "build_draft_guide.py"), ". All grounded in ", /* @__PURE__ */ React.createElement("code", null, "notes-from-videos.md"), " and the extracted game data."));
};
const FactionSwitcher = ({ current, factions, go }) => /* @__PURE__ */ React.createElement("div", { className: "faction-switcher" }, factions.map((f) => /* @__PURE__ */ React.createElement(
  "a",
  {
    key: f.id,
    href: window.OE_routeToUrl(`faction/${f.id}`),
    onClick: (e) => {
      e.preventDefault();
      go(`faction/${f.id}`);
    },
    className: f.id === current ? "active" : ""
  },
  /* @__PURE__ */ React.createElement(
    "img",
    {
      loading: "lazy",
      src: `img/factions/fraction_${f.unitKey || ""}.png`,
      alt: "",
      onError: (e) => {
        e.target.style.display = "none";
      }
    }
  ),
  /* @__PURE__ */ React.createElement("span", null, f.name)
)));
const FactionsHubView = ({ go }) => {
  const T = window.OE_TIER_DATA;
  const FACTIONS = window.OE_DATA?.FACTIONS || [];
  const tips = window.OE_GUIDES_DATA && window.OE_GUIDES_DATA.UNIVERSAL_TIPS || [];
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Factions"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Per-faction tournament playbook for single-hero Exodus PvP. Each card opens a combined page: hero tier list, build order, law priorities, army composition, bans your opponent will throw at you, and matchup counter-picks."), /* @__PURE__ */ React.createElement("div", { className: "card-grid" }, FACTIONS.map((f) => {
    const meta = T?.FACTION_META && T.FACTION_META[f.id] || {};
    const heroCount = (T?.BY_FACTION?.[f.id] || []).length;
    const sCount = (T?.BY_FACTION?.[f.id] || []).filter((h) => h.tier === "S").length;
    return /* @__PURE__ */ React.createElement(
      "a",
      {
        key: f.id,
        className: "card faction-card",
        href: window.OE_routeToUrl(`faction/${f.id}`),
        onClick: (e) => {
          e.preventDefault();
          go(`faction/${f.id}`);
        }
      },
      /* @__PURE__ */ React.createElement("div", { className: "faction-card-head" }, /* @__PURE__ */ React.createElement(
        "img",
        {
          loading: "lazy",
          className: "faction-card-icon",
          src: `img/factions/fraction_${f.unitKey || ""}.png`,
          alt: "",
          onError: (e) => {
            e.target.style.display = "none";
          }
        }
      ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-eyebrow" }, f.might, " / ", f.magic), /* @__PURE__ */ React.createElement("div", { className: "card-title" }, f.name))),
      meta.summary && /* @__PURE__ */ React.createElement("p", { className: "card-desc" }, meta.summary),
      /* @__PURE__ */ React.createElement("div", { className: "card-stats" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, heroCount), "heroes"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, sCount), "S-tier"))
    );
  })), tips.length > 0 && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h2", null, "Universal tips"), /* @__PURE__ */ React.createElement("div", { className: "tips" }, tips.map((t) => /* @__PURE__ */ React.createElement("div", { className: "tip", key: t.title }, /* @__PURE__ */ React.createElement("div", { className: "tip-title" }, t.title), /* @__PURE__ */ React.createElement("div", { className: "tip-body" }, t.body))))));
};
window.FactionView = FactionView;
window.FactionsHubView = FactionsHubView;
