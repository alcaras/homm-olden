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
  const [showUnkeyed, setShowUnkeyed] = React.useState(false);
  const sections = D.SECTIONS.map((sec) => ({
    ...sec,
    rows: showUnkeyed ? sec.rows : sec.rows.filter((r) => r.key)
  })).filter((s) => s.rows.length);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "hk-head" }, /* @__PURE__ */ React.createElement("h1", null, "Hotkeys"), /* @__PURE__ */ React.createElement("label", { className: "hk-toggle" }, /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "checkbox",
      checked: showUnkeyed,
      onChange: (e) => setShowUnkeyed(e.target.checked)
    }
  ), /* @__PURE__ */ React.createElement("span", null, "Show actions without default keys"))), /* @__PURE__ */ React.createElement("div", { className: "hk-grid" }, sections.map((sec) => /* @__PURE__ */ React.createElement("section", { key: sec.id, className: "hk-section" }, /* @__PURE__ */ React.createElement("h2", { className: "hk-section-h" }, sec.name), /* @__PURE__ */ React.createElement("table", { className: "hk-table" }, /* @__PURE__ */ React.createElement("tbody", null, sec.rows.map((r) => /* @__PURE__ */ React.createElement("tr", { key: r.sid, className: r.key ? "" : "hk-row-unkeyed" }, /* @__PURE__ */ React.createElement("td", { className: "hk-name" }, r.name), /* @__PURE__ */ React.createElement("td", { className: "hk-key-cell" }, _renderKey(r.key))))))))));
};
window.HotkeysView = HotkeysView;
