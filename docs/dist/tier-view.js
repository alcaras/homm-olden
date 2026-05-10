const TierView = () => {
  const T = window.OE_TIER_DATA;
  if (!T) return /* @__PURE__ */ React.createElement("p", null, "Tier data not loaded.");
  const FACTIONS = window.OE_DATA?.FACTIONS || T.FACTIONS;
  const factionById = Object.fromEntries(FACTIONS.map((f) => [f.id, f]));
  const [factionSet, setFactionSet] = React.useState(/* @__PURE__ */ new Set());
  const [tierSet, setTierSet] = React.useState(/* @__PURE__ */ new Set());
  const [hideDerived, setHideDerived] = React.useState(false);
  const toggleFaction = (id) => {
    setFactionSet((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const toggleTier = (t) => {
    setTierSet((prev) => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t);
      else n.add(t);
      return n;
    });
  };
  const TIER_ORDER = ["S", "A", "B", "C"];
  const factionVisible = (fid) => factionSet.size === 0 || factionSet.has(fid);
  const tierVisible = (t) => tierSet.size === 0 || tierSet.has(t);
  const countVisible = (fid) => {
    const rows = T.BY_FACTION[fid] || [];
    return rows.filter((r) => tierVisible(r.tier) && (!hideDerived || !r.derived)).length;
  };
  const totalVisible = FACTIONS.reduce((acc, f) => acc + (factionVisible(f.id) ? countVisible(f.id) : 0), 0);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Tournament tier list"), /* @__PURE__ */ React.createElement("p", { className: "lede" }, "Single-hero PvP, Exodus-flavored. Rankings synthesized from creator commentary in ", /* @__PURE__ */ React.createElement("code", null, "notes-from-videos.md"), " plus extracted hero/spec/army data."), /* @__PURE__ */ React.createElement("div", { className: "tier-scale" }, /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "S"), " perma-pick / perma-ban"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "A"), " strong contested"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "B"), " situational / playable"), /* @__PURE__ */ React.createElement("span", null, /* @__PURE__ */ React.createElement("b", null, "C"), " avoid in single-hero Exodus"), /* @__PURE__ */ React.createElement("span", { className: "tier-derived-key" }, /* @__PURE__ */ React.createElement("em", null, "(data)"), " uncited \u2014 derived from extracted data only")), /* @__PURE__ */ React.createElement("h2", null, "Opening-pick archetypes"), /* @__PURE__ */ React.createElement("div", { className: "archetypes" }, T.OPENING_PICKS.map((p) => /* @__PURE__ */ React.createElement("div", { className: "archetype", key: p.title }, /* @__PURE__ */ React.createElement("div", { className: "archetype-title" }, p.title), /* @__PURE__ */ React.createElement("div", { className: "archetype-body" }, p.body)))), /* @__PURE__ */ React.createElement("h2", null, "Per-faction tiers"), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Factions"), /* @__PURE__ */ React.createElement("div", { className: "seg multi" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: factionSet.size === 0 ? "active" : "",
      onClick: () => setFactionSet(/* @__PURE__ */ new Set())
    },
    "All"
  ), FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: f.id,
      className: factionSet.has(f.id) ? "active" : "",
      onClick: () => toggleFaction(f.id)
    },
    f.name
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Tiers"), /* @__PURE__ */ React.createElement("div", { className: "seg multi" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      className: tierSet.size === 0 ? "active" : "",
      onClick: () => setTierSet(/* @__PURE__ */ new Set())
    },
    "All"
  ), TIER_ORDER.map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t,
      className: tierSet.has(t) ? `active tier-${t}` : `tier-${t}`,
      onClick: () => toggleTier(t)
    },
    t
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: hideDerived,
      onChange: (e) => setHideDerived(e.target.checked)
    }
  ), " ", "Hide data-derived")), /* @__PURE__ */ React.createElement("span", { className: "count" }, totalVisible, " heroes")), FACTIONS.filter((f) => factionVisible(f.id)).map((f) => {
    const meta = T.FACTION_META[f.id] || {};
    const rows = (T.BY_FACTION[f.id] || []).filter((r) => tierVisible(r.tier) && (!hideDerived || !r.derived));
    if (rows.length === 0) return null;
    return /* @__PURE__ */ React.createElement("section", { key: f.id, className: "faction-section" }, /* @__PURE__ */ React.createElement("div", { className: "faction-band" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        className: "faction-band-icon",
        loading: "lazy",
        src: `img/factions/fraction_${f.unitKey || ""}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    ), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "name" }, f.name), /* @__PURE__ */ React.createElement("div", { className: "skill" }, f.might, " / ", f.magic)), /* @__PURE__ */ React.createElement("div", { className: "counts" }, rows.length, " heroes")), meta.summary && /* @__PURE__ */ React.createElement("p", { className: "faction-summary" }, meta.summary), meta.creature_tip && /* @__PURE__ */ React.createElement("p", { className: "faction-tip" }, /* @__PURE__ */ React.createElement("em", null, "Creature tip:"), " ", meta.creature_tip), TIER_ORDER.map((tier) => {
      const t_rows = rows.filter((r) => r.tier === tier);
      if (t_rows.length === 0) return null;
      return /* @__PURE__ */ React.createElement("div", { key: tier, className: `tier-block tier-block-${tier}` }, /* @__PURE__ */ React.createElement("div", { className: "tier-head" }, /* @__PURE__ */ React.createElement("span", { className: `tier-badge tier-${tier}` }, tier), /* @__PURE__ */ React.createElement("span", { className: "tier-label" }, tier === "S" && "perma-pick / perma-ban", tier === "A" && "strong contested", tier === "B" && "situational / playable", tier === "C" && "avoid"), /* @__PURE__ */ React.createElement("span", { className: "tier-count" }, t_rows.length)), /* @__PURE__ */ React.createElement("ul", { className: "tier-heroes" }, t_rows.map((h) => /* @__PURE__ */ React.createElement("li", { key: h.id, className: "tier-hero" }, /* @__PURE__ */ React.createElement(
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
      ), /* @__PURE__ */ React.createElement("div", { className: "th-body" }, /* @__PURE__ */ React.createElement("div", { className: "th-name-row" }, /* @__PURE__ */ React.createElement("span", { className: "th-name" }, h.name), /* @__PURE__ */ React.createElement("span", { className: h.kind === "might" ? "glyph glyph-might" : "glyph glyph-magic" }, h.kind === "might" ? "\u2694" : "\u2726"), /* @__PURE__ */ React.createElement("span", { className: "th-class" }, h.kind === "might" ? f.might : f.magic), /* @__PURE__ */ React.createElement("span", { className: "th-specialty" }, h.specialty), h.derived && /* @__PURE__ */ React.createElement("span", { className: "th-derived" }, "data")), /* @__PURE__ */ React.createElement("div", { className: "th-army" }, h.army), /* @__PURE__ */ React.createElement("div", { className: "th-note" }, h.note))))));
    }));
  }), /* @__PURE__ */ React.createElement("p", { className: "note" }, "Generated ", T.GENERATED_AT, ". Edit ", /* @__PURE__ */ React.createElement("code", null, "catalog/scripts/build_tier_list.py"), "and rerun to refresh."));
};
window.TierView = TierView;
