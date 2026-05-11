/* Hero builder — interactive level-up simulator.

   Each level-up does two things in the game:
     1. One stat (Attack/Defense/Power/Knowledge) goes up by 1, picked by a
        weighted random roll over the class table (rollPre24 below the L24
        breakpoint, rollPost24 at/after).
     2. The game offers two skills drawn from the eligible pool weighted by
        each skill's `chance`. Player picks one. The chosen skill advances
        from 0 → L1 (Basic), L1 → L2 (Advanced), L2 → L3 (Expert). At L3 the
        skill drops from the offer pool.

   We model both rolls and let the user pick from the offered pair.

   Scope: main skills only. Subskills are not modelled yet.
*/

const SKILL_LVL_LABEL = { 1: 'Basic', 2: 'Advanced', 3: 'Expert' };

// class.skills[].key → in-game skill_id (matches docs/img/skills/<id>.png).
// Faction skills carry their own `sid` field, used directly.
const SKILL_ICON_ID = {
  offence:      'skill_assault',
  defence:      'skill_protection',
  resistance:   'skill_resistance',
  battlecraft:  'skill_formation',
  combat:       'skill_battle_artistry',
  sorcery:      'skill_sorcery',
  intelligence: 'skill_mastery',
  summonAvatar: 'skill_summoner',
  battleMagic:  'skill_battlemage',
  thaumaturgy:  'skill_wisdom',
  daylight:     'skill_magic_day',
  nightshade:   'skill_magic_night',
  arcane:       'skill_magic_space',
  primal:       'skill_magic_primal',
  leadership:   'skill_leadership',
  luck:         'skill_luck',
  insight:      'skill_enlightenment',
  diplomacy:    'skill_diplomacy',
  logistics:    'skill_logistic',
  scouting:     'skill_scouting',
  economy:      'skill_economy',
  tactics:      'skill_tactics',
  siegecraft:   'skill_siege',
  recruitment:  'skill_trainer',
};
// Resolve a skill icon path for a given level (1=base, 2=L2 png, 3=L3 png).
const _skillIcon = (skill, level) => {
  const base = skill.isFaction ? (skill.sid || '') : (SKILL_ICON_ID[skill.key] || '');
  if (!base) return null;
  return level >= 3 ? `img/skills/${base}_L3.png`
       : level >= 2 ? `img/skills/${base}_L2.png`
       : `img/skills/${base}.png`;
};

// Weighted pick from a list of {chance, ...} entries.
const _weightedPick = (pool) => {
  const tot = pool.reduce((a, s) => a + s.chance, 0);
  if (tot <= 0) return null;
  let r = Math.random() * tot;
  for (const s of pool) { r -= s.chance; if (r <= 0) return s; }
  return pool[pool.length - 1];
};


const HeroBuilderView = ({ heroId, initialQuery, go }) => {
  const D = window.OE_DATA;
  const C = window.OE_CLASSES_DATA;
  if (!D || !C) return <p>Builder data not loaded.</p>;

  // ---- no hero picked → faction grid ----
  if (!heroId) return <HeroPicker D={D} go={go} />;

  const hero = D.HEROES.find(h => h.id === heroId);
  if (!hero) {
    return (
      <>
        <p>Unknown hero <code>{heroId}</code>.</p>
        <p><a href={window.OE_routeToUrl('builder')}
              onClick={(e)=>{e.preventDefault();go('builder');}}>← All heroes</a></p>
      </>
    );
  }

  const cls = C.CLASSES.find(c =>
    c.factionId === ({temple:'human', necropolis:'undead', grove:'nature',
                      hive:'demon', schism:'unfrozen', dungeon:'dungeon'})[hero.faction]
    && c.classType === hero.kind);
  if (!cls) return <p>No class table for {hero.name}.</p>;

  const fmeta = D.FACTIONS.find(f => f.id === hero.faction);
  const breakpoint = cls.breakpoint || 24;

  // Class's full skill pool (regular skills + faction skill).
  const fullSkillPool = React.useMemo(() => {
    const out = cls.skills.filter(s => s.chance > 0).map(s => ({...s}));
    if (cls.factionSkill?.chance > 0) {
      out.push({
        key: 'faction', name: cls.factionSkill.name,
        group: 'utility', chance: cls.factionSkill.chance,
        isFaction: true, sid: cls.factionSkill.sid,
      });
    }
    return out;
  }, [cls]);

  // Parse the hero's starting skills (e.g., "Diplomacy L1") into a map.
  const initialSkills = React.useMemo(() => {
    const m = {};
    for (const s of (hero.skills || [])) {
      const match = s.match(/^(.*?) L(\d+)$/);
      if (match) m[match[1]] = parseInt(match[2], 10);
    }
    return m;
  }, [hero]);

  // ---- simulator state ----
  const initialState = React.useCallback(() => ({
    level: 1,
    stats: { ...hero.stats },
    skills: { ...initialSkills },
    subSkills: {},   // { mainSkillName: [subSkillId, subSkillId] }
    // pending: { stat, offered: [skill,...], levelTarget,
    //            pickedMain?: skill, subOptions?: [subSkill,...] }
    pending: null,
    log: [],         // [{ level, stat, skillName, skillLvlAfter, subSkill? }]
    items: {},       // { slot: artifactId }
    pickerSlot: null,
  }), [hero, initialSkills]);

  const [sim, setSim] = React.useState(initialState);

  // Re-seed when hero changes.
  React.useEffect(() => { setSim(initialState()); }, [heroId]);

  // Active stat-roll table for the current level.
  const rollTable = React.useMemo(
    () => (sim.level + 1) < breakpoint ? cls.rollPre : cls.rollPost,
    [sim.level, breakpoint, cls]);

  // Eligible skills for the next offer = skill not yet at L3.
  const eligible = React.useMemo(() => {
    return fullSkillPool.filter(s => (sim.skills[s.name] || 0) < 3);
  }, [fullSkillPool, sim.skills]);

  // Build a 3-slot offer following Olden Era's documented composition rule:
  // one guaranteed UPGRADE (existing skill, cur 1..2), one guaranteed NEW
  // (cur === 0), and one joker slot that's roughly 50/50 either way.
  // Each individual pick is weighted by the class's `chance` table.
  // Falls back gracefully when one of the pools is empty.
  const buildOffer = (skillsState) => {
    const eligibleSkills = fullSkillPool.filter(s => (skillsState[s.name] || 0) < 3);
    const newPool = eligibleSkills.filter(s => !skillsState[s.name]);
    const upgPool = eligibleSkills.filter(s => (skillsState[s.name] || 0) >= 1);

    const taken = new Set();
    const pickFrom = (pool) => {
      const filtered = pool.filter(s => !taken.has(s.name));
      const p = _weightedPick(filtered);
      if (p) taken.add(p.name);
      return p;
    };

    const offered = [];
    // Slot 1: guaranteed UPGRADE if possible, else fall back to a new skill.
    let s = pickFrom(upgPool) || pickFrom(newPool);
    if (s) offered.push(s);
    // Slot 2: guaranteed NEW if possible, else fall back to an upgrade.
    s = pickFrom(newPool) || pickFrom(upgPool);
    if (s) offered.push(s);
    // Slot 3 — joker: ~50/50 new vs upgrade; flip preference if first choice
    // pool is empty.
    const preferUpg = Math.random() < 0.5;
    s = pickFrom(preferUpg ? upgPool : newPool) ||
        pickFrom(preferUpg ? newPool : upgPool);
    if (s) offered.push(s);
    return offered;
  };

  // --- actions ---
  const rollLevelUp = () => {
    if (sim.pending) return;
    // Stat roll
    const tableEntries = [
      {key: 'A', chance: rollTable.A || 0},
      {key: 'D', chance: rollTable.D || 0},
      {key: 'P', chance: rollTable.P || 0},
      {key: 'K', chance: rollTable.K || 0},
    ];
    const stat = _weightedPick(tableEntries)?.key || 'K';
    const offered = buildOffer(sim.skills);
    setSim(prev => ({...prev, pending: { stat, offered, levelTarget: prev.level + 1 }}));
  };

  // Resolve the OE_SKILLS_DATA record for one of our class-pool skill objects.
  const SK = window.OE_SKILLS_DATA;
  const skillById = React.useMemo(() => {
    const m = {};
    for (const s of (SK?.SKILLS || [])) m[s.id] = s;
    return m;
  }, [SK]);
  const skillRecordFor = (s) => {
    const id = s.isFaction ? s.sid : SKILL_ICON_ID[s.key];
    return id ? skillById[id] : null;
  };

  // Stage 1: user clicks one of the offered main skills.
  // If the new level (L2 or L3) has sub-skills, transition to the sub-skill
  // pick stage; otherwise finalize the level-up immediately.
  const pickSkill = (s) => {
    if (!sim.pending) return;
    const newLvl = (sim.skills[s.name] || 0) + 1;
    const rec = skillRecordFor(s);
    const subs = rec?.levels?.[newLvl - 1]?.subskills || [];
    if (subs.length > 0) {
      setSim(prev => ({
        ...prev,
        pending: { ...prev.pending, pickedMain: s, subOptions: subs },
      }));
    } else {
      finalizeLevelUp(s, null);
    }
  };

  // Stage 2 (or single-stage if no subskill): commit the level-up.
  const finalizeLevelUp = (mainSkill, subSkill) => {
    setSim(prev => {
      const { stat, levelTarget } = prev.pending;
      const newLvl = (prev.skills[mainSkill.name] || 0) + 1;
      const subsForSkill = subSkill
        ? [ ...(prev.subSkills[mainSkill.name] || []), subSkill.id ]
        : (prev.subSkills[mainSkill.name] || []);
      return {
        ...prev,
        level: levelTarget,
        stats: { ...prev.stats, [stat]: prev.stats[stat] + 1 },
        skills: { ...prev.skills, [mainSkill.name]: newLvl },
        subSkills: { ...prev.subSkills, [mainSkill.name]: subsForSkill },
        pending: null,
        log: [...prev.log, {
          level: levelTarget, stat,
          skillName: mainSkill.name, skillLvlAfter: newLvl,
          skillGroup: mainSkill.group,
          subSkillId: subSkill?.id || null,
          subSkillName: subSkill?.name || null,
        }],
      };
    });
  };

  const pickSubSkill = (sub) => {
    if (!sim.pending?.pickedMain) return;
    finalizeLevelUp(sim.pending.pickedMain, sub);
  };

  const reroll = () => {
    if (!sim.pending) return;
    let pool = [...eligible];
    const offered = [];
    for (let i = 0; i < 3 && pool.length > 0; i++) {
      const pick = _weightedPick(pool);
      if (!pick) break;
      offered.push(pick);
      pool = pool.filter(s => s.name !== pick.name);
    }
    setSim(prev => ({...prev, pending: {...prev.pending, offered}}));
  };

  const undoLastLevel = () => {
    setSim(prev => {
      if (prev.pending) return {...prev, pending: null};
      if (prev.log.length === 0) return prev;
      const last = prev.log[prev.log.length - 1];
      // Reverse the change. For skills that drop back to 0, delete the key
      // unless it was a starting skill — preserve the starting level.
      const skills = {...prev.skills};
      const newLvl = (skills[last.skillName] || 0) - 1;
      const startingLvl = initialSkills[last.skillName] || 0;
      if (newLvl <= startingLvl) {
        if (startingLvl > 0) skills[last.skillName] = startingLvl;
        else delete skills[last.skillName];
      } else {
        skills[last.skillName] = newLvl;
      }
      // Also reverse the sub-skill if one was added for this level-up.
      const subSkills = { ...prev.subSkills };
      if (last.subSkillId && subSkills[last.skillName]) {
        const filtered = subSkills[last.skillName].filter((id, idx, a) =>
          // remove the last occurrence (most recently added)
          !(id === last.subSkillId && idx === a.lastIndexOf(last.subSkillId)));
        if (filtered.length === 0) delete subSkills[last.skillName];
        else subSkills[last.skillName] = filtered;
      }
      return {
        ...prev,
        level: prev.level - 1,
        stats: { ...prev.stats, [last.stat]: prev.stats[last.stat] - 1 },
        skills,
        subSkills,
        log: prev.log.slice(0, -1),
        pending: null,
      };
    });
  };

  const reset = () => setSim(initialState());

  // --- items / artifacts ---
  const A = window.OE_ARTIFACTS_DATA;
  const artifactsBySlot = React.useMemo(() => {
    const g = {};
    for (const a of (A?.ARTIFACTS || [])) {
      (g[a.slot] = g[a.slot] || []).push(a);
    }
    // Sort each slot by rarity (legendary > epic > rare > common) then name.
    const rOrder = { legendary: 0, epic: 1, rare: 2, common: 3 };
    for (const k of Object.keys(g)) {
      g[k].sort((x, y) =>
        (rOrder[x.rarity] ?? 9) - (rOrder[y.rarity] ?? 9)
        || x.name.localeCompare(y.name));
    }
    return g;
  }, [A]);
  const artifactById = React.useMemo(() => {
    const m = {};
    for (const a of (A?.ARTIFACTS || [])) m[a.id] = a;
    return m;
  }, [A]);

  const openPicker = (slot) =>
    setSim(prev => ({...prev, pickerSlot: prev.pickerSlot === slot ? null : slot}));
  const equip = (slot, artifactId) =>
    setSim(prev => ({
      ...prev,
      items: { ...prev.items, [slot]: artifactId },
      pickerSlot: null,
    }));
  const unequip = (slot) =>
    setSim(prev => {
      const items = {...prev.items}; delete items[slot];
      return {...prev, items};
    });

  // --- derived ---
  const STAT_LABEL = { A: 'Attack', D: 'Defense', P: 'Power', K: 'Knowledge' };
  const skillTotal = fullSkillPool.reduce((a, s) => a + s.chance, 0);

  return (
    <>
      <p className="faction-page-actions">
        <a href={window.OE_routeToUrl('builder')}
           onClick={(e)=>{e.preventDefault();go('builder');}}
           className="faction-page-cta">← All heroes</a>
      </p>

      <div className="hero-page-head">
        <img loading="lazy" className="hero-page-portrait"
             src={`img/heroes/${hero.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="hero-page-titles">
          <h1 className="hero-page-name">{hero.name}</h1>
          <div className="hero-page-class">
            {fmeta && <span className={`faction-pill faction-${hero.faction}`}>{fmeta.name}</span>}{' '}
            <span className="mono">{cls.name}</span>
            {' · '}<em>{hero.specialty}</em>
          </div>
        </div>
      </div>

      {/* === Stats panel === */}
      <section className="hb-section">
        <div className="hb-level-head">
          <h2>Level <span className="hb-level-val">{sim.level}</span></h2>
          {sim.level + 1 >= breakpoint && (
            <span className="hb-bp-note">post-{breakpoint} roll table active from L{breakpoint}</span>
          )}
          <div className="hb-actions">
            {!sim.pending && (
              <button className="hb-btn hb-btn-primary" onClick={rollLevelUp}>
                Level up →
              </button>
            )}
            <button className="hb-btn" onClick={undoLastLevel}
                    disabled={sim.log.length === 0 && !sim.pending}>
              Undo
            </button>
            <button className="hb-btn" onClick={reset}>Reset</button>
          </div>
        </div>

        <div className="hb-stats">
          {['A','D','P','K'].map(k => {
            const flashing = sim.pending?.stat === k;
            return (
              <div key={k} className={'hb-stat' + (flashing ? ' rolled' : '')}>
                <div className="hb-stat-lbl">{STAT_LABEL[k]}</div>
                <div className="hb-stat-val">
                  {sim.stats[k]}
                  {flashing && <span className="hb-stat-delta">+1</span>}
                </div>
                <div className="hb-stat-base">start {hero.stats[k]}</div>
              </div>
            );
          })}
        </div>
        <p className="hb-foot mono">
          Next-level stat-roll weights:
          {' '}A {Math.round(100 * (rollTable.A || 0))}%
          {' · '}D {Math.round(100 * (rollTable.D || 0))}%
          {' · '}P {Math.round(100 * (rollTable.P || 0))}%
          {' · '}K {Math.round(100 * (rollTable.K || 0))}%
        </p>
      </section>

      {/* === Skill offer prompt (stage 1: main skill) === */}
      {sim.pending && !sim.pending.pickedMain && (
        <section className="hb-section hb-prompt">
          <h2>L{sim.pending.levelTarget} — pick a skill</h2>
          <p className="hb-note">
            Stat roll: <b>+1 {STAT_LABEL[sim.pending.stat]}</b>. Choose one of the offered skills:
          </p>
          {sim.pending.offered.length === 0 ? (
            <p className="hb-foot">All skills at Expert — no offers remaining.</p>
          ) : (
            <div className="hb-offers">
              {sim.pending.offered.map(s => {
                const cur = sim.skills[s.name] || 0;
                const nextLvl = cur + 1;
                const icon = _skillIcon(s, nextLvl);
                return (
                  <button key={s.name}
                          className={`hb-offer hb-offer-${s.group}` + (cur > 0 ? ' upgrade' : ' new')}
                          onClick={() => pickSkill(s)}>
                    {icon && (
                      <img loading="lazy" className="hb-offer-icon"
                           src={icon} alt=""
                           onError={(e)=>{e.target.style.visibility='hidden';}} />
                    )}
                    <span className="hb-offer-name">{s.name}</span>
                    <span className="hb-offer-state">
                      {cur === 0
                        ? <><b>Learn</b> {SKILL_LVL_LABEL[nextLvl]}</>
                        : <><b>Advance</b> {SKILL_LVL_LABEL[cur]} → {SKILL_LVL_LABEL[nextLvl]}</>}
                    </span>
                    <span className="hb-offer-chance mono">
                      {(100 * s.chance / skillTotal).toFixed(1)}%
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          <button className="hb-btn hb-btn-sm" onClick={reroll}>Reroll offers</button>
        </section>
      )}

      {/* === Sub-skill prompt (stage 2: after picking a main skill that hit L2/L3) === */}
      {sim.pending?.pickedMain && (
        <section className="hb-section hb-prompt">
          <h2>{sim.pending.pickedMain.name} —
            pick a {SKILL_LVL_LABEL[(sim.skills[sim.pending.pickedMain.name] || 0) + 1]?.toLowerCase()} bonus</h2>
          <p className="hb-note">
            Sub-skill unlocked by advancing {sim.pending.pickedMain.name}. Pick one:
          </p>
          <div className="hb-offers">
            {sim.pending.subOptions.map(sub => (
              <button key={sub.id}
                      className={`hb-offer hb-offer-${sim.pending.pickedMain.group} subskill`}
                      onClick={() => pickSubSkill(sub)}>
                <img loading="lazy" className="hb-offer-icon"
                     src={`img/subskills/${sub.id}.png`} alt=""
                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                <span className="hb-offer-name">{sub.name}</span>
                <span className="hb-offer-desc">
                  {(sub.desc || '').replace(/\{[0-9]+\}/g, '?')}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* === Equipped items === */}
      {A && (
        <section className="hb-section">
          <h2>Items ({Object.keys(sim.items).length}/{A.SLOT_ORDER.length})</h2>
          <div className="hb-slots">
            {A.SLOT_ORDER.map(slot => {
              const equipped = sim.items[slot] ? artifactById[sim.items[slot]] : null;
              const open = sim.pickerSlot === slot;
              return (
                <div key={slot} className={'hb-slot' + (open ? ' open' : '') + (equipped ? ' filled' : ' empty')}>
                  <button className="hb-slot-btn" onClick={() => openPicker(slot)}>
                    <span className="hb-slot-lbl">{A.SLOT_LABEL[slot]}</span>
                    {equipped ? (
                      <>
                        <img loading="lazy" className="hb-slot-img"
                             src={`img/artifacts/${equipped.id}.png`} alt=""
                             onError={(e)=>{e.target.style.visibility='hidden';}} />
                        <span className={`hb-slot-name hb-rarity-${equipped.rarity}`}>
                          {equipped.name}
                        </span>
                      </>
                    ) : (
                      <span className="hb-slot-empty">— empty —</span>
                    )}
                  </button>
                  {equipped && (
                    <button className="hb-slot-x" onClick={() => unequip(slot)}
                            title="Unequip">×</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Inline picker for the open slot */}
          {sim.pickerSlot && (
            <ArtifactPicker
              slot={sim.pickerSlot}
              slotLabel={A.SLOT_LABEL[sim.pickerSlot]}
              candidates={artifactsBySlot[sim.pickerSlot] || []}
              currentId={sim.items[sim.pickerSlot]}
              onPick={(id) => equip(sim.pickerSlot, id)}
              onClose={() => setSim(prev => ({...prev, pickerSlot: null}))}
            />
          )}

          {/* Combined bonuses across all equipped items */}
          {Object.keys(sim.items).length > 0 && (
            <div className="hb-item-bonuses">
              <div className="hb-base-eyebrow">Bonuses from equipped items</div>
              <ul className="hb-bonus-list">
                {Object.values(sim.items).map(id => artifactById[id]).filter(Boolean)
                  .flatMap(a => (a.bonuses || []).map((b, i) => ({a, b, key: `${a.id}-${i}`})))
                  .map(({a, b, key}) => (
                    <li key={key}>
                      <span className={`hb-rarity-${a.rarity}`}>{a.name}</span>
                      <span className="hb-bonus-sep"> · </span>
                      <span>{b}</span>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* === Current skills === */}
      <section className="hb-section">
        <h2>Skills ({Object.keys(sim.skills).length})</h2>
        {Object.keys(sim.skills).length === 0 ? (
          <p className="hb-foot">No skills yet — level up to acquire.</p>
        ) : (
          <div className="hb-skill-list">
            {Object.entries(sim.skills)
              .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
              .map(([name, lvl]) => {
                const skill = fullSkillPool.find(s => s.name === name);
                const grp = skill?.group || 'utility';
                const icon = skill ? _skillIcon(skill, lvl) : null;
                const isStarting = (initialSkills[name] || 0) > 0;
                const subs = sim.subSkills[name] || [];
                return (
                  <div key={name} className={`hb-skill-row hb-skill-${grp}`}>
                    {icon && (
                      <img loading="lazy" className="hb-skill-row-img"
                           src={icon} alt=""
                           onError={(e)=>{e.target.style.visibility='hidden';}} />
                    )}
                    <div className="hb-skill-row-body">
                      <div className="hb-skill-row-head">
                        <span className="hb-skill-row-name">{name}</span>
                        <span className="hb-skill-row-lvl">{SKILL_LVL_LABEL[lvl] || `L${lvl}`}</span>
                        {isStarting && <span className="hb-skill-tag">start</span>}
                      </div>
                      {subs.length > 0 && (
                        <div className="hb-subskill-chips">
                          {subs.map(subId => {
                            const skillRec = skillRecordFor(skill || {key: 'faction', isFaction: true, sid: name});
                            const subRec = skillRec?.levels.flatMap(l => l.subskills || []).find(s => s.id === subId);
                            return (
                              <span key={subId} className="hb-subskill-chip">
                                <img loading="lazy" className="hb-subskill-chip-icon"
                                     src={`img/subskills/${subId}.png`} alt=""
                                     onError={(e)=>{e.target.style.visibility='hidden';}} />
                                {subRec?.name || subId}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      {/* === Level log === */}
      {sim.log.length > 0 && (
        <section className="hb-section">
          <h2>Level-up log</h2>
          <table className="hb-log-table">
            <thead>
              <tr><th>Lvl</th><th>Stat</th><th>Skill picked</th></tr>
            </thead>
            <tbody>
              {sim.log.slice().reverse().map((row, i) => {
                const skill = fullSkillPool.find(s => s.name === row.skillName);
                const icon = skill ? _skillIcon(skill, row.skillLvlAfter) : null;
                return (
                  <tr key={sim.log.length - i}>
                    <td className="mono">L{row.level}</td>
                    <td>+1 {STAT_LABEL[row.stat]}</td>
                    <td className="hb-log-skill">
                      {icon && (
                        <img loading="lazy" className="hb-log-icon"
                             src={icon} alt=""
                             onError={(e)=>{e.target.style.visibility='hidden';}} />
                      )}
                      <span>
                        {row.skillName} → {SKILL_LVL_LABEL[row.skillLvlAfter]}
                        {row.subSkillName && (
                          <span className="hb-log-sub"> · {row.subSkillName}</span>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* === Starting baseline (read-only context) === */}
      <section className="hb-section">
        <h2>Starting baseline</h2>
        <div className="hb-base-grid">
          {hero.spells?.length > 0 && (
            <div className="hb-base-block">
              <div className="hb-base-eyebrow">Spells</div>
              <div className="hb-chips">
                {hero.spells.map(sp => (
                  <a key={sp.id} className={'hb-chip hb-chip-spell' + (sp.masterful ? ' masterful' : '')}
                     href={window.OE_routeToUrl(`spell/${sp.id}`)}
                     onClick={(e) => { e.preventDefault(); go(`spell/${sp.id}`); }}>
                    {sp.masterful && <em>Masterful</em>}{sp.name}
                  </a>
                ))}
              </div>
            </div>
          )}
          {hero.armySegs?.length > 0 && (
            <div className="hb-base-block">
              <div className="hb-base-eyebrow">Army</div>
              <div className="hb-chips">
                {hero.armySegs.map(seg => (
                  <a key={seg.id} className="hb-chip"
                     href={window.OE_routeToUrl(`unit/${seg.id}`)}
                     onClick={(e) => { e.preventDefault(); go(`unit/${seg.id}`); }}>
                    <span className="hb-army-count mono">{seg.min}–{seg.max}</span> {seg.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        {hero.specDesc && (
          <p className="hb-spec mono">
            <b>{hero.specialty}.</b>{' '}
            {hero.specDesc.replace(/\{[0-9]+\}/g, '?')}
          </p>
        )}
      </section>

      {/* === Skill roll table — reference === */}
      <section className="hb-section">
        <h2>Skill roll table (reference)</h2>
        <p className="hb-note">
          Single-roll probability over the full class skill pool. Picked skills
          that reach L3 (Expert) drop out and the others re-normalize.
        </p>
        <table className="hb-skill-table">
          <thead>
            <tr><th>Skill</th><th>Group</th><th className="hb-num">Weight</th><th className="hb-num">P(roll)</th></tr>
          </thead>
          <tbody>
            {[...fullSkillPool].sort((a, b) => b.chance - a.chance).map(s => {
              const cur = sim.skills[s.name] || 0;
              const isStarting = (initialSkills[s.name] || 0) > 0;
              const icon = _skillIcon(s, Math.max(1, cur));
              return (
                <tr key={s.key || s.name}
                    className={cur >= 3 ? 'hb-skill-maxed' : (isStarting ? 'hb-skill-starting' : '')}>
                  <td className="hb-skill-cell">
                    {icon && (
                      <img loading="lazy" className="hb-skill-row-icon"
                           src={icon} alt=""
                           onError={(e)=>{e.target.style.visibility='hidden';}} />
                    )}
                    <span>{s.name}</span>
                    {cur > 0 && <span className="hb-skill-cur"> L{cur}</span>}
                    {cur >= 3 && <span className="hb-skill-tag hb-skill-tag-max">maxed</span>}
                  </td>
                  <td className="hb-skill-group">{s.group}</td>
                  <td className="hb-num mono">{s.chance}</td>
                  <td className="hb-num mono">
                    {(100 * s.chance / skillTotal).toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};

// ---- hero picker (faction → hero grid) ----
const HeroPicker = ({ D, go }) => {
  const [faction, setFaction] = React.useState('temple');
  const heroes = D.HEROES.filter(h => h.faction === faction)
                          .sort((a, b) => a.name.localeCompare(b.name));
  return (
    <>
      <h1>Hero Level-Up Simulator</h1>
      <p className="hero-army" style={{maxWidth:'62em'}}>
        Pick a hero, then simulate their level-ups: each click rolls a stat
        increase + 2 skill offers, and you pick one. Undo + reset any time.
      </p>
      <div className="hb-fac-row">
        {D.FACTIONS.map(f => (
          <button key={f.id} type="button"
                  className={`cs-fac-pill faction-${f.id}${faction === f.id ? ' selected' : ''}`}
                  onClick={() => setFaction(f.id)}>
            <img loading="lazy" src={`img/factions/fraction_${f.unitKey || ''}.png`} alt=""
                 onError={(e)=>{e.target.style.visibility='hidden';}} />
            <span>{f.name}</span>
          </button>
        ))}
      </div>
      <div className="hb-hero-grid">
        {heroes.map(h => (
          <a key={h.id}
             className={`hb-hero-card hb-${h.kind}`}
             href={window.OE_routeToUrl(`builder/${h.id}`)}
             onClick={(e) => { e.preventDefault(); go(`builder/${h.id}`); }}
             title={`${h.name} — ${h.specialty}`}>
            <img loading="lazy" className="hb-hero-portrait"
                 src={`img/heroes/${h.id}.png`} alt=""
                 onError={(e)=>{e.target.style.visibility='hidden';}} />
            <div className="hb-hero-name">{h.name}</div>
            <div className="hb-hero-spec">{h.specialty}</div>
          </a>
        ))}
      </div>
    </>
  );
};

// ---- artifact picker (per-slot grid with rarity filter) ----
const ArtifactPicker = ({ slot, slotLabel, candidates, currentId, onPick, onClose }) => {
  const [rarity, setRarity] = React.useState('all');
  const filtered = rarity === 'all' ? candidates : candidates.filter(a => a.rarity === rarity);

  return (
    <div className="hb-picker">
      <div className="hb-picker-head">
        <span className="hb-picker-title">{slotLabel} — pick an item</span>
        <div className="hb-picker-filter">
          {['all','legendary','epic','rare','common'].map(r => (
            <button key={r}
                    className={'hb-picker-rarity hb-rarity-' + r + (rarity === r ? ' active' : '')}
                    onClick={() => setRarity(r)}>{r}</button>
          ))}
        </div>
        <button className="hb-btn hb-btn-sm" onClick={onClose}>Close</button>
      </div>
      <div className="hb-picker-grid">
        {filtered.map(a => (
          <button key={a.id}
                  className={'hb-art-card hb-rarity-' + a.rarity + (a.id === currentId ? ' selected' : '')}
                  onClick={() => onPick(a.id)}
                  title={a.bonuses?.join('\n') || a.desc || ''}>
            <img loading="lazy" className="hb-art-icon"
                 src={`img/artifacts/${a.id}.png`} alt=""
                 onError={(e)=>{e.target.style.visibility='hidden';}} />
            <span className="hb-art-name">{a.name}</span>
            {a.bonuses?.length > 0 && (
              <span className="hb-art-bonus">{a.bonuses[0]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

window.HeroBuilderView = HeroBuilderView;
