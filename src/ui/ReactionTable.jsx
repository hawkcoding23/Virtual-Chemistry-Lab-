import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n";

const reactantIds = (reaction) => (reaction.reactants ?? []).map((item) =>
  (typeof item === "string" ? item : item.chemicalId)?.toLowerCase()).filter(Boolean);

export default function ReactionTable({ chemicals, allChemicals, selected, onCollectChemical, onToggle, onMix, onLoadRecipe, reactions, sampleMass = 5, onSampleMassChange, lockedClassLevel = null, studyTrack = "ncert" }) {
  const { t } = useLanguage();
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [reactionClass, setReactionClass] = useState(lockedClassLevel == null ? "all" : String(lockedClassLevel));
  const [chemicalSearch, setChemicalSearch] = useState("");
  useEffect(() => {
    setReactionClass(lockedClassLevel == null ? "all" : String(lockedClassLevel));
  }, [lockedClassLevel]);
  const chemicalLibrary = useMemo(() => Object.values(allChemicals ?? {}).sort((a, b) => a.name.localeCompare(b.name)), [allChemicals]);
  const collectedIds = useMemo(() => new Set(chemicals.map((chemical) => chemical.id)), [chemicals]);
  const matchingChemicals = useMemo(() => {
    const query = chemicalSearch.trim().toLowerCase();
    return chemicalLibrary.filter((chemical) => !collectedIds.has(chemical.id)
      && (!query || `${chemical.name} ${chemical.formula} ${chemical.category}`.toLowerCase().includes(query))).slice(0, 24);
  }, [chemicalLibrary, chemicalSearch, collectedIds]);
  const classCounts = [9, 10, 11, 12].reduce((counts, level) => {
    counts[level] = reactions.filter((reaction) => (reaction.classes ?? []).some((reactionLevel) => reactionLevel <= level)).length;
    return counts;
  }, {});
  const visibleReactions = reactionClass === "all" ? reactions
    : reactions.filter((reaction) => (reaction.classes ?? []).some((level) => level <= Number(reactionClass)));
  const chapters = [...new Set(visibleReactions.map((reaction) => reaction.chapter))];
  const stationHeading = "Central reaction bench";
  const stationDescription = "One large workstation with the apparatus needed for each supported reaction type.";
  return <section className="table-panel" aria-label={t("Reaction table")}>
    <div className="table-head"><div><span className="eyebrow">{t("WORKSTATION")}</span><h2>{t(stationHeading)}</h2>
      <p>{t(stationDescription)}</p></div>
      <button className="mix-button" onClick={onMix} disabled={selected.length === 0}>{t("Run reaction")} <span>{selected.length}/4</span></button>
    </div>
    <div className="reaction-sample-size" role="group" aria-label={t("Choose sample size")}>
      <strong>{t("Choose sample size")}</strong>
      <div>{[5, 10, 20].map((amount) => <button type="button" key={amount} className={sampleMass === amount ? "chosen" : ""}
        aria-pressed={sampleMass === amount} onClick={() => onSampleMassChange?.(amount)}>{amount} g</button>)}</div>
    </div>
    <div className="bench-slots">
      {[0, 1, 2, 3].map((index) => {
        const chemical = chemicals.find((item) => item.id === selected[index]);
        return <button key={index} className={`bench-slot ${chemical ? "filled" : ""}`} onClick={() => chemical && onToggle(chemical.id)}>
          <span className="slot-number">{index + 1}</span><strong>{chemical?.name ?? t("Empty sample slot")}</strong>
          <small>{chemical ? `${chemical.formula} · ${chemical.mass} g` : t("Select from inventory below")}</small>
        </button>;
      })}
    </div>
    <div className="inventory-pick"><h3>{t("Your inventory")}</h3>{chemicals.length ? <div className="pick-list">
      {chemicals.map((chemical) => <button key={chemical.id} onClick={() => onToggle(chemical.id)} className={selected.includes(chemical.id) ? "picked" : ""}>
        <i style={{ background: chemical.color }} /><span>{chemical.name}<small>{chemical.formula} · {chemical.mass} g</small></span><b>{selected.includes(chemical.id) ? t("Added") : t("Add")}</b>
      </button>)}
    </div> : <p className="muted">{t("Collect chemicals from the labelled cabinets first.")}</p>}</div>
    <details className="chemical-catalog">
      <summary>{lockedClassLevel == null ? t("Full chemical library") : `${t(`Class ${lockedClassLevel}`)}${t(" chemical library")}`} <span>{chemicalLibrary.length}{t(" substances")}</span></summary>
      <label className="chemical-search-label">{t("Search by name, formula, or group")}
        <input className="chemical-search" type="search" value={chemicalSearch} onChange={(event) => setChemicalSearch(event.target.value)} aria-label={t("Search chemicals by name, formula, or category")} />
      </label>
      <div className="chemical-library-results" aria-live="polite">
        {matchingChemicals.map((chemical) => <button key={chemical.id} type="button" onClick={() => onCollectChemical(chemical)}>
          <i style={{ background: chemical.color }} /><span>{chemical.name}<small>{chemical.formula} · {chemical.category}</small></span><b>{t("Add")}</b>
        </button>)}
        {!matchingChemicals.length && <p className="muted">{t("No matching chemicals left to collect.")}</p>}
      </div>
      {matchingChemicals.length === 24 && <small className="chemical-search-hint">{t("Showing the first 24 matches. Refine your search to find more.")}</small>}
    </details>
    <details className="reaction-catalog" onToggle={(event) => setCatalogOpen(event.currentTarget.open)}>
      <summary>{t(studyTrack === "jee" ? "JEE + NCERT reaction catalogue" : studyTrack === "neet" ? "NEET + NCERT reaction catalogue" : studyTrack === "all" ? "All classes reaction catalogue" : "NCERT reaction catalogue")} <span>{reactions.length}{t(" simulations · ")}{lockedClassLevel == null ? t("Classes 9–12") : t(`Class ${lockedClassLevel}`)}</span></summary>
      {catalogOpen && <label className="reaction-class-filter">{t("Show reactions for")}
        <select value={reactionClass} onChange={(event) => setReactionClass(event.target.value)} disabled={lockedClassLevel != null}>
          {lockedClassLevel == null && <option value="all">{t("All classes")} ({reactions.length})</option>}
          {lockedClassLevel != null
            ? <option value={lockedClassLevel}>{t(`Class ${lockedClassLevel}`)}{t(" and earlier")} ({classCounts[lockedClassLevel] ?? reactions.length})</option>
            : [9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)}{t(" + earlier")} ({classCounts[level]})</option>)}
        </select>
      </label>}
      {catalogOpen && chapters.map((chapter) => <div className="catalog-chapter" key={chapter}>
        <h3>{t(chapter)}</h3><div className="catalog-list">{visibleReactions.filter((reaction) => reaction.chapter === chapter).map((reaction) => {
          const ids = reactantIds(reaction);
          return <button key={reaction.id} onClick={() => onLoadRecipe(ids)} title={reaction.equation}>
            <strong>{reaction.equation}</strong><small>{ids.map((id) => chemicals.find((chemical) => chemical.id === id)?.name ?? id.replaceAll("_", " ")).join(" + ")}</small><span>{t("Load samples")}</span>
          </button>;
        })}</div>
      </div>)}
      {catalogOpen && visibleReactions.length === 0 && <p className="muted">{t("No reactions are listed for this class yet.")}</p>}
    </details>
  </section>;
}
