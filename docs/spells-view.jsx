/* Spells page — every battle + world spell, grouped by school and tier. */

const SCHOOL_LABEL_BY_ID = {
  day: 'Daylight', night: 'Nightshade', space: 'Arcane',
  primal: 'Primal', neutral: 'Neutral',
};

const SpellsView = () => {
  const S = window.OE_SPELLS_DATA;
  if (!S) return <p>Spells data not loaded.</p>;

  const [school, setSchool] = React.useState('all');
  const [scope,  setScope]  = React.useState('all');   // all | battle | world
  const [tier,   setTier]   = React.useState('all');

  const tiers = Array.from(new Set(S.SPELLS.map(s => s.tier))).sort((a,b)=>a-b);

  const filtered = S.SPELLS.filter(sp => {
    if (school !== 'all' && sp.school !== school) return false;
    if (scope !== 'all' && sp.scope !== scope) return false;
    if (tier !== 'all' && sp.tier !== Number(tier)) return false;
    return true;
  });

  // Group by school, then tier
  const bySchool = {};
  for (const sp of filtered) {
    const k = sp.school;
    (bySchool[k] = bySchool[k] || {});
    (bySchool[k][sp.tier] = bySchool[k][sp.tier] || []).push(sp);
  }

  return (
    <>
      <h1>Spells</h1>
      <p className="lede">
        Every spell in the game — battle and world — pulled from the magic
        JSONs. Grouped by school (Daylight / Nightshade / Arcane / Primal /
        Neutral) and tier. Mana costs are listed per spell-level (L1–L4 of
        each spell).
      </p>

      <div className="controls">
        <div className="filter-group">
          <label>School</label>
          <div className="seg">
            <button className={school==='all'?'active':''} onClick={()=>setSchool('all')}>All</button>
            {S.SCHOOLS.map(sk => (
              <button key={sk.id}
                      className={school===sk.id?'active':''}
                      onClick={()=>setSchool(sk.id)}>{sk.name}</button>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <label>Scope</label>
          <div className="seg">
            <button className={scope==='all'?'active':''} onClick={()=>setScope('all')}>All</button>
            <button className={scope==='battle'?'active':''} onClick={()=>setScope('battle')}>Battle</button>
            <button className={scope==='world'?'active':''} onClick={()=>setScope('world')}>World</button>
          </div>
        </div>
        <div className="filter-group">
          <label>Tier</label>
          <div className="seg">
            <button className={tier==='all'?'active':''} onClick={()=>setTier('all')}>All</button>
            {tiers.filter(t => t > 0).map(t => (
              <button key={t}
                      className={tier===String(t)?'active':''}
                      onClick={()=>setTier(String(t))}>T{t}</button>
            ))}
          </div>
        </div>
        <span className="count">{filtered.length} spells</span>
      </div>

      {S.SCHOOLS.filter(sk => bySchool[sk.id]).map(sk => (
        <section key={sk.id} className={`spell-school spell-school-${sk.id}`}>
          <h2>{sk.name}</h2>
          {tiers.map(t => {
            const list = bySchool[sk.id]?.[t] || [];
            if (list.length === 0) return null;
            return (
              <div key={t} className="spell-tier-block">
                <div className="spell-tier-head">
                  {t === 0 ? 'Untiered / passive' : `Tier ${t}`}
                  {t > 0 && <span className="spell-tier-cd"> · cooldown {t + 1} rounds</span>}
                </div>
                <div className="spell-grid">
                  {list.map(sp => <SpellCard key={sp.id} sp={sp} />)}
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <p className="note">
        Generated {S.GENERATED_AT}. Data extracted by{' '}
        <code>catalog/scripts/build_spells.py</code> from{' '}
        <code>DB/magics/</code> and <code>Lang/english/texts/magic.json</code>.
      </p>
    </>
  );
};

const SpellCard = ({sp}) => {
  // Each spell has a manaCost array of up to 4 entries (one per spell upgrade
  // level inside a guild). We display the unique values.
  const manaUniq = Array.from(new Set(sp.manaCost));
  const manaText = manaUniq.length === 1
    ? `${manaUniq[0]} mana`
    : `${Math.min(...sp.manaCost)}–${Math.max(...sp.manaCost)} mana`;

  return (
    <article className="spell-card">
      <header className="spell-head">
        <img loading="lazy" className="spell-icon"
             src={`img/spells/${sp.id}.png`} alt=""
             onError={(e)=>{e.target.style.visibility='hidden';}} />
        <div className="spell-head-body">
          <div className="spell-name-row">
            <h3 className="spell-name">{sp.name}</h3>
            {sp.scope === 'world' && <span className="spell-scope">World</span>}
          </div>
          <div className="spell-meta">
            {sp.magicType && <span className="spell-magic-type">{sp.magicType}</span>}
            <span className="spell-mana">{manaText}</span>
          </div>
        </div>
      </header>
      {sp.desc && (
        <p className="spell-desc">
          {sp.descResolved || sp.desc.replace(/\{[0-9]+\}/g, '?')}
        </p>
      )}
    </article>
  );
};

window.SpellsView = SpellsView;
