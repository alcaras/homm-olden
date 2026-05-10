const UnitsView = ({ go }) => {
  const { FACTIONS, UNITS } = window.OE_DATA;
  const [q, setQ] = React.useState("");
  const [faction, setFaction] = React.useState("all");
  const [factionSet, setFactionSet] = React.useState(/* @__PURE__ */ new Set());
  const [tier, setTier] = React.useState("all");
  const [variant, setVariant] = React.useState("all");
  const [atkType, setAtkType] = React.useState("all");
  const [sort, setSort] = React.useState({ key: "tier", dir: 1 });
  const setFactionMode = (mode) => {
    setFaction(mode);
    setFactionSet(/* @__PURE__ */ new Set());
  };
  const toggleFaction = (id) => {
    setFactionSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setFaction("multi");
  };
  const factionOptions = [
    ...FACTIONS.map((f) => ({ id: f.id, label: f.name })),
    { id: "neutral", label: "Neutral" }
  ];
  const factionLabel = Object.fromEntries(factionOptions.map((o) => [o.id, o.label]));
  const tiers = Array.from(new Set(UNITS.map((u) => u.tier))).sort((a, b) => a - b);
  const ql = q.trim().toLowerCase();
  const filtered = UNITS.filter((u) => {
    if (faction === "factions" && u.faction === "neutral") return false;
    if (faction === "multi") {
      if (factionSet.size > 0 && !factionSet.has(u.faction)) return false;
    } else if (faction !== "all" && faction !== "factions" && u.faction !== faction) {
      return false;
    }
    if (tier !== "all" && u.tier !== Number(tier)) return false;
    if (variant !== "all" && u.variant !== variant) return false;
    if (atkType !== "all" && u.attack !== atkType) return false;
    if (!ql) return true;
    if (u.name.toLowerCase().includes(ql)) return true;
    if (u.id.toLowerCase().includes(ql)) return true;
    if ((u.ai || "").toLowerCase().includes(ql)) return true;
    if ((u.tags || []).some((t) => t.toLowerCase().includes(ql))) return true;
    return false;
  });
  const sorted = [...filtered].sort((a, b) => {
    const k = sort.key;
    let av = a[k], bv = b[k];
    if (k === "name") {
      av = av.toLowerCase();
      bv = bv.toLowerCase();
    }
    if (k === "faction") {
      av = factionLabel[av] || av;
      bv = factionLabel[bv] || bv;
    }
    if (k === "dmgAvg") {
      av = (a.dmgMin + a.dmgMax) / 2;
      bv = (b.dmgMin + b.dmgMax) / 2;
    }
    if (k === "valuePerCost") {
      av = a.cost ? a.squadValue / a.cost : 0;
      bv = b.cost ? b.squadValue / b.cost : 0;
    }
    if (av < bv) return -1 * sort.dir;
    if (av > bv) return 1 * sort.dir;
    if (a.tier !== b.tier) return a.tier - b.tier;
    return a.name.localeCompare(b.name);
  });
  const SortHead = ({ label, k, num }) => {
    const active = sort.key === k;
    const arrow = active ? sort.dir > 0 ? "\u2191" : "\u2193" : "";
    return /* @__PURE__ */ React.createElement(
      "th",
      {
        className: `sortable${active ? " active" : ""}${num ? " num" : ""}`,
        onClick: () => setSort(
          (s) => s.key === k ? { key: k, dir: -s.dir } : { key: k, dir: 1 }
        )
      },
      label,
      " ",
      /* @__PURE__ */ React.createElement("span", { className: "sort-arrow" }, arrow)
    );
  };
  const variantLabel = { base: "Base", upg: "Upgrade", alt: "Alt Upg" };
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", null, "Units \u2014 Creature Stats"), /* @__PURE__ */ React.createElement("h2", null, "Browse by faction"), /* @__PURE__ */ React.createElement("div", { className: "faction-strip" }, FACTIONS.map((f) => /* @__PURE__ */ React.createElement(
    "a",
    {
      key: f.id,
      href: window.OE_routeToUrl(`units/${f.id}`),
      onClick: (e) => {
        if (go) {
          e.preventDefault();
          go(`units/${f.id}`);
        }
      }
    },
    /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "faction-icon",
        src: `img/factions/${f.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.display = "none";
        }
      }
    ),
    /* @__PURE__ */ React.createElement("div", { className: "name" }, f.name),
    /* @__PURE__ */ React.createElement("div", { className: "skill" }, f.might, " / ", f.magic)
  ))), /* @__PURE__ */ React.createElement("h2", null, "All units (sortable table)"), /* @__PURE__ */ React.createElement("div", { className: "controls" }, /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Search"), /* @__PURE__ */ React.createElement(
    "input",
    {
      className: "search",
      placeholder: "name, id, tag, ai\u2026",
      value: q,
      onChange: (e) => setQ(e.target.value)
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Faction"), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "seg multi",
      title: "Select one or more, or use 'All' / 'Factions' shortcuts"
    },
    /* @__PURE__ */ React.createElement(
      "button",
      {
        className: faction === "all" ? "active" : "",
        onClick: () => setFactionMode("all")
      },
      "All"
    ),
    /* @__PURE__ */ React.createElement(
      "button",
      {
        className: faction === "factions" ? "active" : "",
        title: "All playable factions (excludes Neutral)",
        onClick: () => setFactionMode("factions")
      },
      "Factions"
    ),
    factionOptions.map((o) => {
      const on = faction === "multi" ? factionSet.has(o.id) : false;
      return /* @__PURE__ */ React.createElement(
        "button",
        {
          key: o.id,
          className: on ? "active" : "",
          onClick: () => toggleFaction(o.id)
        },
        o.label
      );
    })
  )), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Tier"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: tier === "all" ? "active" : "", onClick: () => setTier("all") }, "All"), tiers.map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t,
      className: tier === String(t) ? "active" : "",
      onClick: () => setTier(String(t))
    },
    t
  )))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Variant"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: variant === "all" ? "active" : "", onClick: () => setVariant("all") }, "All"), /* @__PURE__ */ React.createElement("button", { className: variant === "base" ? "active" : "", onClick: () => setVariant("base") }, "Base"), /* @__PURE__ */ React.createElement("button", { className: variant === "upg" ? "active" : "", onClick: () => setVariant("upg") }, "Upgrade"), /* @__PURE__ */ React.createElement("button", { className: variant === "alt" ? "active" : "", onClick: () => setVariant("alt") }, "Alt"))), /* @__PURE__ */ React.createElement("div", { className: "filter-group" }, /* @__PURE__ */ React.createElement("label", null, "Attack"), /* @__PURE__ */ React.createElement("div", { className: "seg" }, /* @__PURE__ */ React.createElement("button", { className: atkType === "all" ? "active" : "", onClick: () => setAtkType("all") }, "All"), /* @__PURE__ */ React.createElement("button", { className: atkType === "Melee" ? "active" : "", onClick: () => setAtkType("Melee") }, "\u2694 Melee"), /* @__PURE__ */ React.createElement("button", { className: atkType === "Long" ? "active" : "", onClick: () => setAtkType("Long") }, "\u2194 Long"), /* @__PURE__ */ React.createElement("button", { className: atkType === "Ranged" ? "active" : "", onClick: () => setAtkType("Ranged") }, "\u{1F3F9} Ranged"))), /* @__PURE__ */ React.createElement("span", { className: "count" }, sorted.length, " units")), /* @__PURE__ */ React.createElement("div", { className: "units-wrap" }, /* @__PURE__ */ React.createElement("table", { className: "units" }, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null), /* @__PURE__ */ React.createElement(SortHead, { label: "Tier", k: "tier", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Faction", k: "faction" }), /* @__PURE__ */ React.createElement(SortHead, { label: "Unit", k: "name" }), /* @__PURE__ */ React.createElement("th", null, "Var."), /* @__PURE__ */ React.createElement(SortHead, { label: "Atk", k: "attack" }), /* @__PURE__ */ React.createElement(SortHead, { label: "HP", k: "hp", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Off", k: "off", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Def", k: "def", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Dmg", k: "dmgAvg", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Init", k: "init", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Spd", k: "speed", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "SV", k: "squadValue", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "Cost", k: "cost", num: true }), /* @__PURE__ */ React.createElement(SortHead, { label: "SV/g", k: "valuePerCost", num: true }))), /* @__PURE__ */ React.createElement("tbody", null, sorted.map((u) => {
    const dmgAvg = (u.dmgMin + u.dmgMax) / 2;
    const ratio = u.cost ? u.squadValue / u.cost : 0;
    const atkGlyph = u.attack === "Melee" ? "\u2694" : u.attack === "Long" ? "\u2194" : u.attack === "Ranged" ? "\u{1F3F9}" : "";
    return /* @__PURE__ */ React.createElement("tr", { key: u.id }, /* @__PURE__ */ React.createElement("td", { className: "u-icon-cell" }, /* @__PURE__ */ React.createElement(
      "img",
      {
        loading: "lazy",
        className: "u-icon",
        src: `img/units/${u.id}.png`,
        alt: "",
        onError: (e) => {
          e.target.style.visibility = "hidden";
        }
      }
    )), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.tier), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `faction-pill faction-${u.faction}` }, factionLabel[u.faction] || u.faction)), /* @__PURE__ */ React.createElement("td", { className: "u-name-cell" }, /* @__PURE__ */ React.createElement("span", { className: "u-name-wrap" }, /* @__PURE__ */ React.createElement("span", { className: "u-name" }, u.name), /* @__PURE__ */ React.createElement("span", { className: "u-id" }, u.id), (u.passives?.length || u.abilities?.length || u.narrative) && /* @__PURE__ */ React.createElement("div", { className: "u-tooltip" }, u.narrative && /* @__PURE__ */ React.createElement("div", { className: "tt-narr" }, u.narrative), u.passives?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tt-section" }, /* @__PURE__ */ React.createElement("div", { className: "tt-head" }, "Passives"), u.passives.map((p, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "tt-entry" }, /* @__PURE__ */ React.createElement("span", { className: "tt-name" }, p.name), p.desc && /* @__PURE__ */ React.createElement("span", { className: "tt-desc" }, " ", p.desc)))), u.abilities?.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "tt-section" }, /* @__PURE__ */ React.createElement("div", { className: "tt-head" }, "Abilities"), u.abilities.map((a, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "tt-entry" }, /* @__PURE__ */ React.createElement("span", { className: "tt-name" }, a.name), a.desc && /* @__PURE__ */ React.createElement("span", { className: "tt-desc" }, " ", a.desc))))))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `variant variant-${u.variant}` }, variantLabel[u.variant] || u.variant)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: `atk-chip atk-${u.attack.toLowerCase()}` }, /* @__PURE__ */ React.createElement("span", { className: "atk-glyph" }, atkGlyph), u.attack)), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.hp ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.off ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.def ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num dmg" }, u.dmgMin === u.dmgMax ? u.dmgMin : `${u.dmgMin}\u2013${u.dmgMax}`), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.init ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.speed ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.squadValue ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num" }, u.cost ?? "\u2014"), /* @__PURE__ */ React.createElement("td", { className: "num ratio" }, u.cost ? ratio.toFixed(2) : "\u2014"));
  })))), sorted.length === 0 && /* @__PURE__ */ React.createElement("p", { style: { color: "var(--muted)", fontStyle: "italic", marginTop: "2rem" } }, "No units match those filters."));
};
window.UnitsView = UnitsView;
