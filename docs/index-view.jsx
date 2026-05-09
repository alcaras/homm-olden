/* Index / overview view */

const IndexView = ({ go }) => {
  const { FACTIONS, HEROES, SUBCLASSES, UNITS } = window.OE_DATA;

  return (
    <div>
      <h1>HOMM Olden Era — Reference</h1>
      <p className="lede">
        Hero classes, subclasses, and starting loadouts for{' '}
        <em>Heroes of Might and Magic: Olden Era</em>. Datamined from the game's JSON
        files; updated to match the current build.
      </p>

      <h2>Pages</h2>
      <div className="card-grid">
        <a className="card" href="#subclasses" onClick={(e)=>{e.preventDefault();go('subclasses');}}>
          <div className="card-eyebrow">Reference matrix</div>
          <div className="card-title">Subclasses & Required Skills</div>
          <p className="card-desc">
            Every subclass — two per class, twelve classes — and the five skills each needs
            at level&nbsp;3, plus the unique passive effect. Surfaces the fixed{' '}
            <em>1 Combat + 1 Magic + 1 School + 2 Utility</em> recipe at a glance.
          </p>
          <div className="card-stats">
            <span><b>{SUBCLASSES.length}</b>subclasses</span>
            <span><b>20</b>skill columns</span>
            <span><b>12</b>classes</span>
          </div>
        </a>

        <a className="card" href="#heroes" onClick={(e)=>{e.preventDefault();go('heroes');}}>
          <div className="card-eyebrow">Roster</div>
          <div className="card-title">Heroes — Stats, Skills & Armies</div>
          <p className="card-desc">
            All {HEROES.length} stock heroes by faction, with starting Attack / Defense /
            Power / Knowledge, starting skills (faction skill plus one other), starting
            army composition, and the hero's signature specialization. Filterable by
            faction, class, or any text.
          </p>
          <div className="card-stats">
            <span><b>{HEROES.length}</b>heroes</span>
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>2</b>classes each</span>
          </div>
        </a>

        <a className="card" href="#units" onClick={(e)=>{e.preventDefault();go('units');}}>
          <div className="card-eyebrow">Bestiary</div>
          <div className="card-title">Units — Creature Stats</div>
          <p className="card-desc">
            Every recruitable creature in three variants — base, upgrade, alt
            upgrade — with HP, attack, defense, damage, initiative, speed, the
            game's internal squad-value scalar, and gold cost. Sortable on every
            stat; filter by faction, tier, or variant.
          </p>
          <div className="card-stats">
            <span><b>{UNITS.length}</b>unit entries</span>
            <span><b>7</b>tiers</span>
            <span><b>{FACTIONS.length + 1}</b>factions + neutral</span>
          </div>
        </a>

        <a className="card" href="#tier" onClick={(e)=>{e.preventDefault();go('tier');}}>
          <div className="card-eyebrow">Tournament meta</div>
          <div className="card-title">Tier list — Tournament Heroes</div>
          <p className="card-desc">
            Single-hero PvP rankings (S/A/B/C) for all {HEROES.length} heroes,
            grouped by faction. Synthesized from creator commentary plus extracted
            data; uncited verdicts are tagged so you can tell meta consensus from
            inference. Includes top-10 ban list and opening-pick archetypes.
          </p>
          <div className="card-stats">
            <span><b>{HEROES.length}</b>ranked</span>
            <span><b>10</b>top bans</span>
            <span><b>5</b>archetypes</span>
          </div>
        </a>

        <a className="card" href="#guides" onClick={(e)=>{e.preventDefault();go('guides');}}>
          <div className="card-eyebrow">Tournament prep</div>
          <div className="card-title">Faction Guides — Buildings & Laws</div>
          <p className="card-desc">
            Per-faction tournament gameplan: turn-by-turn build order with priority
            tiers and traps to avoid, plus law-priority lists with full in-game
            effect text. Building names and law numbers cross-referenced against
            extracted game data.
          </p>
          <div className="card-stats">
            <span><b>{FACTIONS.length}</b>factions</span>
            <span><b>5</b>universal tips</span>
            <span><b>S/A/B</b>priorities</span>
          </div>
        </a>

        <a className="card" href="#draft" onClick={(e)=>{e.preventDefault();go('draft');}}>
          <div className="card-eyebrow">Pick / ban</div>
          <div className="card-title">Draft — Quick Reference</div>
          <p className="card-desc">
            Tournament/Exodus draft cheat sheet: faction ban + pick priority, going
            first vs going second playbooks, faction counter-pick matrix, and the
            top-5 hero bans for each opponent faction. Use during a draft.
          </p>
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
          <div key={f.id}>
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
          </div>
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
