/* Subclasses view — simplified list. Each subclass shows its 5 required
   skills as icon chips (1 Combat + 1 Magic + 1 School + 2 Utility recipe). */

// 3-letter SKILL_COLUMNS code → canonical skill_id (mirrors build_skills.py)
const CODE_TO_SKILL_ID = {
  OFF: 'skill_assault',     DEF: 'skill_protection',  RES: 'skill_resistance',
  BAT: 'skill_formation',
  SOR: 'skill_sorcery',     WIS: 'skill_mastery',     SUM: 'skill_summoner',
  BMG: 'skill_battlemage',
  DAY: 'skill_magic_day',   NGT: 'skill_magic_night',
  ARC: 'skill_magic_space', PRI: 'skill_magic_primal',
  LD:  'skill_leadership',  LK:  'skill_luck',
  INS: 'skill_enlightenment', DPL: 'skill_diplomacy',
  LOG: 'skill_logistic',    SCT: 'skill_scouting',
  EC:  'skill_economy',     TAC: 'skill_tactics',
};

const SubclassesView = () => {
  const { FACTIONS, SKILL_COLUMNS, SUBCLASSES } = window.OE_DATA;

  // Lookup: skill code → {name, group}
  const skillByCode = Object.fromEntries(SKILL_COLUMNS.map(s => [s.key, s]));

  return (
    <>
      <h1>Subclasses</h1>
      <p className="lede">
        Each of the 12 hero classes has two subclasses, unlocked once the hero
        trains <em>five specific skills to level&nbsp;3 (Expert)</em>. The recipe
        is structurally identical for every subclass:
        <strong> 1 Combat + 1 Magic + 1 School + 2 Utility</strong>.
      </p>

      {FACTIONS.map(f => {
        const subs = SUBCLASSES.filter(s => s.faction === f.id);
        if (!subs.length) return null;
        return (
          <section key={f.id} className="sub-faction-block">
            <div className="faction-band">
              <img className="faction-band-icon" loading="lazy"
                   src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                   onError={(e)=>{e.target.style.visibility='hidden';}} />
              <div>
                <div className="name">{f.name}</div>
                <div className="skill">{f.might} / {f.magic} · faction skill: {f.skill}</div>
              </div>
            </div>
            <div className="sub-grid">
              {subs.map(s => (
                <article key={s.faction + s.name}
                         className={`sub-card sub-${s.kind}`}>
                  <header className="sub-card-head">
                    <span className={s.kind==='might'?'glyph glyph-might':'glyph glyph-magic'}>
                      {s.kind==='might' ? '⚔' : '✦'}
                    </span>
                    <span className="sub-name">{s.name}</span>
                    <span className="sub-class">{s.class}</span>
                  </header>
                  <div className="sub-skills">
                    {s.skills.map(code => {
                      const skill = skillByCode[code];
                      const sid = CODE_TO_SKILL_ID[code];
                      return (
                        <div key={code} className={`sub-skill sub-skill-${skill?.group || ''}`}>
                          <img loading="lazy" className="sub-skill-icon"
                               src={`img/skills/${sid}.png`} alt=""
                               onError={(e)=>{e.target.style.visibility='hidden';}} />
                          <span className="sub-skill-name">{skill?.name || code}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="sub-effect"
                       dangerouslySetInnerHTML={{__html: s.effect}} />
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <p className="note">
        <strong>Class-locked skills.</strong> Two skills never appear in
        subclass conditions because they are tied to class type:{' '}
        <em>Combat</em> (might-only — Heroic Strike) and{' '}
        <em>Thaumaturgy</em> (magic-only — second spell per round). Both are
        useful but irrelevant to subclass progression.{' '}
        <em>Siegecraft</em> and <em>Recruitment</em> are also never required
        — pure side options.
      </p>
    </>
  );
};

window.SubclassesView = SubclassesView;
