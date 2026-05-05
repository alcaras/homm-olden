/* Subclass matrix view */

const SubclassesView = () => {
  const { FACTIONS, SKILL_COLUMNS, SUBCLASSES } = window.OE_DATA;
  const [hoverCol, setHoverCol] = React.useState(null);

  // Group skill columns
  const groupOf = {};
  SKILL_COLUMNS.forEach(s => groupOf[s.key] = s.group);
  const groupBoundary = (i) => {
    if (i === 0) return true;
    return SKILL_COLUMNS[i].group !== SKILL_COLUMNS[i-1].group;
  };
  const groupRunStart = (i) => groupBoundary(i);
  const groupSpan = (g) => SKILL_COLUMNS.filter(s => s.group === g).length;

  // Build rows: faction header rows interleaved with subclass rows
  const rows = [];
  FACTIONS.forEach(f => {
    rows.push({ kind: 'faction', faction: f });
    SUBCLASSES.filter(s => s.faction === f.id).forEach(s => {
      rows.push({ kind: 'sub', sub: s });
    });
  });

  // Group caps row
  const groups = [
    { id:'combat',  label:'Combat (1)', span: groupSpan('combat') },
    { id:'magic',   label:'Magic (1)',  span: groupSpan('magic') },
    { id:'school',  label:'School (1)', span: groupSpan('school') },
    { id:'utility', label:'Utility (2)',span: groupSpan('utility') },
  ];

  return (
    <div>
      <h1>Subclasses & Required Skills</h1>
      <p className="lede">
        Each of the 12 hero classes has two subclasses, unlocked by training five specific
        skills to level&nbsp;3 (Expert). The matrix below lays out all 24 recipes — read
        across a row to see what one subclass needs; read down a column to see who needs
        that skill.
      </p>

      <div className="legend">
        <span><span className="swatch combat" />Combat</span>
        <span><span className="swatch magic" />Magic</span>
        <span><span className="swatch school" />School</span>
        <span><span className="swatch utility" />Utility</span>
        <span style={{color:'var(--faint)'}}>Hover a column header for the full skill name.</span>
      </div>

      <div className="matrix-wrap">
        <table className="matrix">
          <thead>
            {/* Group caps */}
            <tr>
              <th className="row-glyph" rowSpan="2"></th>
              <th className="row-head" rowSpan="2">Subclass</th>
              {groups.map((g,i) => (
                <th key={g.id} colSpan={g.span}
                    className={`group-cap ${g.id} ${i>0?'group-edge':''}`}>
                  {g.label}
                </th>
              ))}
              <th className="col-effect group-edge" rowSpan="2">Subclass effect</th>
            </tr>
            <tr>
              {SKILL_COLUMNS.map((s,i) => (
                <th key={s.key}
                    className={`${groupRunStart(i) && i>0 ? 'group-edge' : ''} ${hoverCol===i?'col-hl':''}`}
                    title={s.name}
                    onMouseEnter={() => setHoverCol(i)}
                    onMouseLeave={() => setHoverCol(null)}>
                  {s.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => {
              if (row.kind === 'faction') {
                return (
                  <tr key={'f'+row.faction.id} className="faction-row">
                    <td colSpan={2 + SKILL_COLUMNS.length + 1}>
                      {row.faction.name}
                      <span className="fac-skill">faction skill: {row.faction.skill}</span>
                    </td>
                  </tr>
                );
              }
              const s = row.sub;
              const set = new Set(s.skills);
              return (
                <tr key={s.faction+s.name}>
                  <td className="row-glyph">
                    <span className={s.kind==='might'?'glyph glyph-might':'glyph glyph-magic'}>
                      {s.kind==='might' ? '⚔' : '✦'}
                    </span>
                  </td>
                  <td className="row-head">
                    {s.name}
                    <span className="row-class">{s.class}</span>
                  </td>
                  {SKILL_COLUMNS.map((col,i) => {
                    const on = set.has(col.key);
                    const cls = ['skill-cell', col.group, on ? 'on' : ''];
                    if (groupRunStart(i) && i>0) cls.push('group-edge');
                    if (hoverCol === i) cls.push('col-hl');
                    return (
                      <td key={col.key} className={cls.join(' ')}
                          onMouseEnter={() => setHoverCol(i)}
                          onMouseLeave={() => setHoverCol(null)}>
                        {on ? <span className="dot" aria-label={col.name} /> : ''}
                      </td>
                    );
                  })}
                  <td className="col-effect group-edge"
                      dangerouslySetInnerHTML={{__html: s.effect}} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="note">
        <strong>Structural pattern.</strong> Every subclass requires exactly{' '}
        <strong>1 Combat + 1 Magic + 1 School + 2 Utility</strong> — the recipe is fixed.
        Of the four magic schools, only one is required per subclass. Of the ten utility
        skills, only eight ever appear in any subclass requirement: <em>Siegecraft</em>{' '}
        and <em>Recruitment</em> are never required, making them pure side-options.
      </p>
      <p className="note">
        <strong>Class-locked skills.</strong> Two skills are tied to class type and never
        appear in subclass conditions: <em>Combat</em> (might-only, Heroic Strike cooldown)
        and <em>Thaumaturgy</em> (magic-only, second spell per round). Both are useful but
        unrelated to subclass progression.
      </p>
    </div>
  );
};

window.SubclassesView = SubclassesView;
