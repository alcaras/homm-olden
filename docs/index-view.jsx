/* Index / overview view */

const IndexView = ({ go }) => {
  const { FACTIONS, HEROES, SUBCLASSES, UNITS } = window.OE_DATA;

  return (
    <div>
      <h1>HOMM Olden Era — Reference</h1>
      <h2>Pages</h2>
      <div className="card-grid">
        <a className="card" href={window.OE_routeToUrl("mechanics")} onClick={(e)=>{e.preventDefault();go('mechanics');}}>
          <div className="card-eyebrow">Beginner primer</div>
          <div className="card-title">Mechanics 101</div>
          <div className="card-stats">
            <span><b>7</b>sections</span>
            <span><b>6</b>faction signatures</span>
            <span><b>20+</b>linked sources</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("buildings/temple")} onClick={(e)=>{e.preventDefault();go('buildings/temple');}}>
          <div className="card-eyebrow">Interactive tool</div>
          <div className="card-title">Buildings — Per-Faction Calculator</div>
          <div className="card-stats">
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>~30</b>buildings each</span>
            <span><b>7</b>resources tracked</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("laws/temple")} onClick={(e)=>{e.preventDefault();go('laws/temple');}}>
          <div className="card-eyebrow">Interactive tool</div>
          <div className="card-title">Laws — Per-Faction Calculator</div>
          <div className="card-stats">
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>30+</b>laws each</span>
            <span><b>5</b>unlock rows</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("factions")} onClick={(e)=>{e.preventDefault();go('factions');}}>
          <div className="card-eyebrow">Tournament playbook</div>
          <div className="card-title">Factions — Per-Faction Pages</div>
          <div className="card-stats">
            <span><b>{FACTIONS.length}</b>pages</span>
            <span><b>1</b>combined view</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("artifacts")} onClick={(e)=>{e.preventDefault();go('artifacts');}}>
          <div className="card-eyebrow">Bestiary</div>
          <div className="card-title">Artifacts</div>
          <div className="card-stats">
            <span><b>117</b>artifacts</span>
            <span><b>9</b>slots</span>
            <span><b>24</b>sets</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("resources")} onClick={(e)=>{e.preventDefault();go('resources');}}>
          <div className="card-eyebrow">Reference</div>
          <div className="card-title">Resources</div>
          <div className="card-stats">
            <span><b>8</b>resources</span>
            <span><b>3</b>tiers</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("map-objects")} onClick={(e)=>{e.preventDefault();go('map-objects');}}>
          <div className="card-eyebrow">Bestiary</div>
          <div className="card-title">Map Objects</div>
          <div className="card-stats">
            <span><b>145</b>objects</span>
            <span><b>9</b>categories</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("map-templates")} onClick={(e)=>{e.preventDefault();go('map-templates');}}>
          <div className="card-eyebrow">Multiplayer</div>
          <div className="card-title">Map Templates</div>
          <div className="card-stats">
            <span><b>56</b>templates</span>
            <span><b>2</b>modes</span>
            <span><b>4</b>sizes</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("spells")} onClick={(e)=>{e.preventDefault();go('spells');}}>
          <div className="card-eyebrow">Reference</div>
          <div className="card-title">Spells</div>
          <div className="card-stats">
            <span><b>103</b>spells</span>
            <span><b>5</b>schools</span>
            <span><b>5</b>tiers</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("skills")} onClick={(e)=>{e.preventDefault();go('skills');}}>
          <div className="card-eyebrow">Reference</div>
          <div className="card-title">Skills — Deep Dive</div>
          <div className="card-stats">
            <span><b>30</b>skills</span>
            <span><b>~200</b>sub-skills</span>
            <span><b>Basic / Adv / Expert</b></span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("subclasses")} onClick={(e)=>{e.preventDefault();go('subclasses');}}>
          <div className="card-eyebrow">Reference matrix</div>
          <div className="card-title">Subclasses & Required Skills</div>
          <div className="card-stats">
            <span><b>{SUBCLASSES.length}</b>subclasses</span>
            <span><b>20</b>skill columns</span>
            <span><b>12</b>classes</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("heroes")} onClick={(e)=>{e.preventDefault();go('heroes');}}>
          <div className="card-eyebrow">Roster</div>
          <div className="card-title">Heroes — Stats, Skills & Armies</div>
          <div className="card-stats">
            <span><b>{HEROES.length}</b>heroes</span>
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>2</b>classes each</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("units")} onClick={(e)=>{e.preventDefault();go('units');}}>
          <div className="card-eyebrow">Bestiary</div>
          <div className="card-title">Units — Creature Stats</div>
          <div className="card-stats">
            <span><b>{UNITS.length}</b>unit entries</span>
            <span><b>7</b>tiers</span>
            <span><b>{FACTIONS.length + 1}</b>factions + neutral</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("tier")} onClick={(e)=>{e.preventDefault();go('tier');}}>
          <div className="card-eyebrow">Tournament meta</div>
          <div className="card-title">Tier list — Tournament Heroes</div>
          <div className="card-stats">
            <span><b>{HEROES.length}</b>ranked</span>
            <span><b>10</b>top bans</span>
            <span><b>5</b>archetypes</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("guides")} onClick={(e)=>{e.preventDefault();go('guides');}}>
          <div className="card-eyebrow">Tournament prep</div>
          <div className="card-title">Faction Guides — Buildings & Laws</div>
          <div className="card-stats">
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>5</b>universal tips</span>
            <span><b>S/A/B</b>priorities</span>
          </div>
        </a>

        <a className="card" href={window.OE_routeToUrl("draft")} onClick={(e)=>{e.preventDefault();go('draft');}}>
          <div className="card-eyebrow">Pick / ban</div>
          <div className="card-title">Draft — Quick Reference</div>
          <div className="card-stats">
            <span><b>6×6</b>counter-matrix</span>
            <span><b>30</b>hero bans</span>
            <span><b>2</b>playbooks</span>
          </div>
        </a>
      </div>

      <h2>Factions</h2>
      <div className="faction-strip">
        {FACTIONS.map(f => (
          <a key={f.id}
             href={window.OE_routeToUrl(`faction/${f.id}`)}
             onClick={(e)=>{e.preventDefault();go(`faction/${f.id}`);}}>
            <img loading="lazy" className="faction-icon"
                 src={`img/factions/${f.id}.png`} alt=""
                 onError={(e)=>{e.target.style.display='none';}} />
            <div className="name">{f.name}</div>
            <div className="skill">{f.skill}</div>
            <div className="classes">
              <span className="glyph glyph-might">⚔</span> {f.might}
              <br/>
              <span className="glyph glyph-magic">✦</span> {f.magic}
            </div>
          </a>
        ))}
      </div>

      <h2>Notes</h2>
      <ul style={{maxWidth:'56em', color:'var(--ink-2)', paddingLeft:'1.1rem'}}>
        <li style={{marginBottom:'0.4em'}}>
          Six playable factions: Temple (human), Necropolis (undead), Grove (nature),
          Hive (demon), Schism (unfrozen), Dungeon. Each has 18 heroes split into two
          classes — Might and Magic.
        </li>
        <li style={{marginBottom:'0.4em'}}>
          Two skills are class-locked and never appear in subclass conditions:{' '}
          <em>Combat</em> (Might-only) and <em>Thaumaturgy</em> (Magic-only).{' '}
          <em>Siegecraft</em> and <em>Recruitment</em> are also never required for any
          subclass.
        </li>
        <li>
          Effect text is preserved verbatim; placeholders like <code>{'{0}'}</code> are
          filled at runtime from each subclass's <code>bonuses</code> block.
        </li>
      </ul>

    </div>
  );
};

window.IndexView = IndexView;
