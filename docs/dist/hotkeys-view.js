const _renderKey = (key) => {
  if (!key) return /* @__PURE__ */ React.createElement("span", { className: "hk-key hk-key-empty" }, "\u2014");
  return /* @__PURE__ */ React.createElement("span", { className: "hk-key" }, key.split(/(\s+or\s+|\s+\/\s+)/).map((part, i) => {
    const trimmed = part.trim();
    if (/^or$/i.test(trimmed)) {
      return /* @__PURE__ */ React.createElement("span", { key: i, className: "hk-or" }, " or ");
    }
    if (trimmed === "/") {
      return /* @__PURE__ */ React.createElement("span", { key: i, className: "hk-or" }, " / ");
    }
    return /* @__PURE__ */ React.createElement("span", { key: i, className: "hk-chord" }, trimmed.split(/\s*\+\s*/).map((tok, j) => /* @__PURE__ */ React.createElement(React.Fragment, { key: j }, j > 0 && /* @__PURE__ */ React.createElement("span", { className: "hk-plus" }, "+"), /* @__PURE__ */ React.createElement("kbd", { className: "hk-kbd" }, tok))));
  }));
};
const HotkeysView = () => {
  const D = window.OE_HOTKEYS_DATA;
  if (!D) return /* @__PURE__ */ React.createElement("p", null, "Hotkeys data not loaded.");
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("h1", null, "Hotkeys"), /* @__PURE__ */ React.createElement("p", { className: "hero-army", style: { maxWidth: "62em" } }, "Action names and section grouping are sourced from the game's localization files. Default key bindings come from the in-game", " ", /* @__PURE__ */ React.createElement("em", null, "Settings \u2192 Hotkeys"), " screen \u2014 entries shown as ", /* @__PURE__ */ React.createElement("span", { className: "hk-key-empty" }, "\u2014"), " ", "are real game actions whose default key isn't surfaced here yet. Customised in-game bindings will diverge from this list."), /* @__PURE__ */ React.createElement("div", { className: "hk-grid" }, D.SECTIONS.map((sec) => /* @__PURE__ */ React.createElement("section", { key: sec.id, className: "hk-section" }, /* @__PURE__ */ React.createElement("h2", { className: "hk-section-h" }, sec.name), /* @__PURE__ */ React.createElement("table", { className: "hk-table" }, /* @__PURE__ */ React.createElement("tbody", null, sec.rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.sid, className: r.key ? "" : "hk-row-unkeyed" }, /* @__PURE__ */ React.createElement("td", { className: "hk-name" }, r.name), /* @__PURE__ */ React.createElement("td", { className: "hk-key-cell" }, _renderKey(r.key))))))))), /* @__PURE__ */ React.createElement("p", { className: "combat-caveat", style: { marginTop: "1.5rem" } }, 'Reference card: "All Hotkeys for HoMM: Olden Era" by Kotletiy LLC. Verify against your in-game Settings \u2192 Hotkeys before remapping.'));
};
window.HotkeysView = HotkeysView;
