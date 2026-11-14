import { memo, useEffect, useRef, useState } from "react";
import ReactionNarration from "./ReactionNarration";
import { translate, localizeScienceHindi } from "../../i18n";
import { EXPERIMENT_CATEGORIES } from "./simulationEngine";
import soundManager from "../../utils/soundManager";

function formatCategoryLabel(category, language = "en") {
  const map = {
    NEUTRALISATION: { en: "Acid-Base Neutralisation", hi: "अम्ल-क्षार उदासीनीकरण" },
    COMBUSTION: { en: "Combustion Reaction", hi: "दहन अभिक्रिया" },
    PRECIPITATION: { en: "Precipitation (Double Displacement)", hi: "अवक्षेपण (द्विविस्थापन) अभिक्रिया" },
    THERMAL_DECOMPOSITION: { en: "Thermal Decomposition", hi: "ऊष्मीय अपघटन अभिक्रिया" },
    ELECTROLYSIS: { en: "Electrolysis (Electrolytic Decomposition)", hi: "विद्युत अपघटन अभिक्रिया" },
    GAS_EVOLUTION: { en: "Gas Evolution Reaction", hi: "गैस निकास अभिक्रिया" },
    DISPLACEMENT: { en: "Metal Displacement Reaction", hi: "धातु विस्थापन अभिक्रिया" },
    COMBINATION_SYNTHESIS: { en: "Combination & Synthesis", hi: "संयोजन एवं संश्लेषण अभिक्रिया" },
    REVERSIBLE_EQUILIBRIUM: { en: "Reversible Chemical Equilibrium", hi: "उत्क्रमणीय रासायनिक साम्य" },
    GENERAL_REACTION: { en: "Chemical Reaction", hi: "रासायनिक अभिक्रिया" },
  };
  return (map[category] && (language === "hi" ? map[category].hi : map[category].en)) || "Chemical Reaction";
}

function ExperimentOverlay({
  language = "en",
  reaction,
  config,
  explanationText,
  isPlaying,
  playbackSpeed,
  explanationOpen,
  onToggleExplanation,
  onTogglePlay,
  onReset,
  onToggleSpeed,
  onClose,
  onExport,
  exportStatus = "",
  narrationEnabled = true,
  isComplete = false,
  reactionProgress = 0,
}) {
  const [detailsTab, setDetailsTab] = useState("observations"); // "observations" | "explanation" | "products"
  const spokenBeats = useRef(new Set());
  const soundedBeats = useRef(new Set());
  const beat = reactionProgress < 0.18 ? 0 : reactionProgress < 0.42 ? 1 : reactionProgress < 0.7 ? 2 : reactionProgress < 0.92 ? 3 : 4;
  const magnesiumBurning = String(reaction?.id || "").toLowerCase().includes("magnesium") || /2?\s*mg\s*\+\s*o[₂2]\s*→\s*2?\s*mgo/i.test(reaction?.equation || "");
  const beatLines = magnesiumBurning ? (language === "hi" ? [
    "उपकरण तैयार हैं। मैग्नीशियम की पट्टी को बर्नर के पास लाया जा रहा है।",
    "मैग्नीशियम की पट्टी को लौ में गर्म किया जा रहा है।",
    "पट्टी ऑक्सीजन में तेज़ सफ़ेद प्रकाश के साथ जल रही है।",
    "सफ़ेद मैग्नीशियम ऑक्साइड पाउडर ट्रे में इकट्ठा हो रहा है।",
    "अभिक्रिया पूरी हुई: 2Mg और O₂ से 2MgO बना है।",
  ] : [
    "The apparatus is ready. The magnesium ribbon is moving toward the burner.",
    "The ribbon is being heated in the flame.",
    "Magnesium is burning in oxygen with a brilliant white light.",
    "White magnesium oxide powder is collecting in the tray.",
    "The reaction is complete: 2Mg and O₂ formed 2MgO.",
  ]) : (language === "hi" ? [
    "उपकरण तैयार हैं। अभिकारक अभिक्रिया पात्र के पास लाए जा रहे हैं।",
    "नमूने मिल रहे हैं; अब रंग और विलयन में बदलाव देखें।",
    "अभिक्रिया चल रही है। गैस, ऊष्मा, प्रकाश या अवक्षेप बनने पर ध्यान दें।",
    "उत्पाद बन रहे हैं और पात्र में इकट्ठा हो रहे हैं।",
    "अभिक्रिया पूरी हुई। बने उत्पादों को संतुलित समीकरण से मिलाएँ।",
  ] : [
    "The apparatus is ready. The reactants are moving into position.",
    "The samples are being combined. Watch the liquid and colour change.",
    "The reaction is underway. Look for gas, heat, light, or a solid forming.",
    "Products are forming and collecting in the reaction vessel.",
    "The reaction is complete. Compare the products with the balanced equation.",
  ]);

  useEffect(() => {
    spokenBeats.current.clear();
    soundedBeats.current.clear();
    window.speechSynthesis?.cancel();
    return () => window.speechSynthesis?.cancel();
  }, [reaction?.runId, language, narrationEnabled]);

  useEffect(() => {
    if (reactionProgress < 0.18) {
      spokenBeats.current.clear();
      return;
    }
    if (!isPlaying) return;
    const beatIndex = beat - 1;
    if (beatIndex < 0 || spokenBeats.current.has(beatIndex)) return;
    spokenBeats.current.add(beatIndex);
    if (!narrationEnabled || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(beatLines[beat]);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.96;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }, [beat, beatLines, isPlaying, language, narrationEnabled, reactionProgress]);

  useEffect(() => {
    if (reactionProgress < 0.18) {
      soundedBeats.current.clear();
      spokenBeats.current.clear();
      soundManager.stopReactionSound();
      soundManager.stopPourSound();
      return;
    }
    if (!isPlaying) return;
    if (soundedBeats.current.has(beat)) return;
    soundedBeats.current.add(beat);
    if (beat === 1) soundManager.playPourSound(1.2);
    if (beat === 2) soundManager.playReactionSound({
      gas: Boolean(config.gas?.hasGas),
      heat: Boolean(config.isExothermic || config.isEndothermic || config.requiresHeating),
      light: Boolean(reaction?.observations?.lightProduced),
      precipitate: Boolean(config.precipitate?.hasPrecipitate), duration: 3.4,
    });
    if (beat === 3 && config.precipitate?.hasPrecipitate) soundManager.playReactionSound({ precipitate: true, duration: 1.8 });
    if (beat === 4) soundManager.stopReactionSound();
  }, [beat, config, isPlaying, reaction, reactionProgress]);

  const samples = reaction?.samples || [];
  const products = config.products || [];
  const equation = reaction?.equation || "";
  const categoryLabel = formatCategoryLabel(config.category, language);
  const isMagnesiumBurning = String(reaction?.id || "").toLowerCase().includes("magnesium") || /2?\s*mg\s*\+\s*o[₂2]\s*→\s*2?\s*mgo/i.test(equation);
  const observationSummary = isMagnesiumBurning
    ? (language === "hi" ? "मैग्नीशियम तेज़ सफ़ेद प्रकाश के साथ जलता है और सफ़ेद मैग्नीशियम ऑक्साइड बनाता है।" : "Magnesium burns with a brilliant white light and leaves white magnesium oxide.")
    : reaction?.observations?.colorChange === "bright_white_flame"
      ? (language === "hi" ? "तेज़ सफ़ेद ज्वाला दिखाई देती है।" : "A bright white flame is visible.")
      : reaction?.observations?.colorChange || (config.gas?.hasGas ? (language === "hi" ? config.gas.testHi : config.gas.test) : null) || (config.precipitate?.hasPrecipitate ? `${translate(language, "Precipitate:")} ${config.precipitate.name}` : null) || reaction?.observations?.temperatureChange || translate(language, "Track the visible changes as the reaction proceeds.");
  const stationLabel = {
    ignition: language === "hi" ? "केंद्रीय मेज़ · ताप और प्रज्वलन उपकरण" : "Central bench · heating & ignition setup",
    electrolysis: language === "hi" ? "केंद्रीय मेज़ · विद्युत अपघटन उपकरण" : "Central bench · electrolysis setup",
    mixing: language === "hi" ? "केंद्रीय मेज़ · मिश्रण उपकरण" : "Central bench · mixing setup",
  }[config.requiredStation];

  return (
    <div className={`experiment-hud-overlay${explanationOpen ? " has-explanation" : ""}`} role="complementary" aria-label={translate(language, "Virtual experiment workstation")}>
      {/* 1. TOP HEADER BAR */}
      <header className="experiment-hud-topbar">
        <div className="hud-title-cluster">
          <span className="hud-category-badge">{categoryLabel}</span>
          <h1 className="hud-experiment-title">
            {reaction.noReaction
              ? translate(language, "No supported reaction")
              : translate(language, reaction.chapter || "Chemical reaction")}
          </h1>
          <div className="hud-equation-strip">
            <span className="equation-label">{translate(language, "Balanced Equation:")}</span>
            <code className="equation-code">{equation}</code>
          </div>
        </div>

        <div className="hud-header-actions">
          <button
            type="button"
            className="hud-explanation-toggle"
            onClick={onToggleExplanation}
            aria-expanded={explanationOpen}
          >
            <span className="info-icon">💡</span>
            <span>{explanationOpen ? translate(language, "Hide theory") : translate(language, "Scientific theory")}</span>
          </button>

          <button
            type="button"
            className="hud-close-btn"
            onClick={onClose}
            title={translate(language, "Return to laboratory bench")}
            aria-label={translate(language, "Close experiment")}
          >
            ✕
          </button>
        </div>
      </header>

      {/* 2. FLOATING REAL-TIME OBSERVATIONS PANEL (TOP RIGHT) */}
      <div className="hud-observations-floating">
        <div className="obs-panel-header">
          <strong>{translate(language, "Laboratory Observations")}</strong>
          <span className="obs-pulse" />
        </div>

        <div className="obs-items-list">
          {/* Precipitate observation */}
          {config.precipitate.hasPrecipitate && (
            <div className="obs-item precipitate-obs">
              <span className="obs-label">{translate(language, "Precipitate:")}</span>
              <div className="obs-val">
                <i className="color-swatch" style={{ background: config.precipitate.color }} />
                <span>{config.precipitate.name}</span>
              </div>
            </div>
          )}

          {/* Gas evolution observation */}
          {config.gas.hasGas && (
            <div className="obs-item gas-obs">
              <span className="obs-label">{translate(language, "Gas Evolved:")}</span>
              <div className="obs-val">
                <i className="color-swatch" style={{ background: config.gas.color }} />
                <span>{config.gas.name} {config.gas.formula && `(${config.gas.formula})`}</span>
              </div>
              <small className="obs-subtext">
                {language === "hi" ? config.gas.testHi : config.gas.test}
              </small>
            </div>
          )}

          {/* Temperature change */}
          {reaction?.observations?.temperatureChange && (
            <div className="obs-item temp-obs">
              <span className="obs-label">{translate(language, "Thermal Effect:")}</span>
              <span className="obs-val">
                {config.isExothermic
                  ? (language === "hi" ? "ऊष्माक्षेपी (ताप में वृद्धि)" : "Exothermic (Temperature rise)")
                  : config.isEndothermic
                  ? (language === "hi" ? "ऊष्माशोषी (ताप में कमी)" : "Endothermic (Heat absorbed)")
                  : translate(language, reaction.observations.temperatureChange)}
              </span>
            </div>
          )}

          {reaction?.observations?.lightProduced && (
            <div className="obs-item temp-obs">
              <span className="obs-label">{translate(language, "Light produced:")}</span>
              <span className="obs-val">{language === "hi" ? "तेज़ सफ़ेद चमक" : "A bright flash / glow"}</span>
            </div>
          )}

          {reaction?.conditions?.heatRequired && (
            <div className="obs-item temp-obs">
              <span className="obs-label">{translate(language, "Required condition:")}</span>
              <span className="obs-val">{translate(language, "Heat at the ignition bench")}</span>
            </div>
          )}

          {/* Color change */}
          {reaction?.observations?.colorChange && (
            <div className="obs-item color-obs">
              <span className="obs-label">{translate(language, "Colour Transition:")}</span>
              <div className="obs-color-row">
                <i className="color-swatch" style={{ background: config.startColor }} />
                <span>→</span>
                <i className="color-swatch" style={{ background: config.finalColor }} />
              </div>
              <small className="obs-subtext">{observationSummary}</small>
            </div>
          )}
        </div>
      </div>

      <aside className={`hud-reaction-side-details${isComplete ? " is-complete" : ""}`} aria-label={translate(language, "Reaction details")}>
        <h3>{translate(language, isComplete ? "Reaction result" : "Reaction details")}</h3>
        <section><b>{translate(language, "Reactants used")}</b>
          {samples.length ? <div className="hud-detail-chips">{samples.map((sample, index) => <span key={`${sample.id}-${index}`}>{sample.name || sample.id} <code>{sample.formula}</code><small>{sample.mass ?? 5} g</small></span>)}</div> : <p>{translate(language, "Starting materials shown in the equation.")}</p>}
        </section>
        <section><b>{translate(language, "Products formed")}</b>
          {products.length ? <div className="hud-detail-chips product-chips">{products.map((product, index) => {
            const measured = reaction?.outcome?.products?.find((entry) => entry.id === product.id);
            return <span key={product.id || index}>{product.name} <code>{product.formula}</code><small>{measured?.grams != null ? `≈ ${Number(measured.grams).toFixed(2)} g` : product.state || "product"}</small></span>;
          })}</div> : <p>{translate(language, "Products are shown by the balanced equation.")}</p>}
          {isComplete && isMagnesiumBurning && <p className="hud-result-highlight">{language === "hi" ? "सफ़ेद मैग्नीशियम ऑक्साइड पाउडर ट्रे में इकट्ठा हुआ।" : "White magnesium oxide powder has collected in the tray."}</p>}
          {reaction?.outcome?.remaining?.length > 0 && <p className="hud-excess-note"><b>{translate(language, "Left in excess:")}</b> {reaction.outcome.remaining.map((item) => `${item.chemical?.name || item.id} ≈ ${Number(item.grams).toFixed(2)} g`).join(" · ")}</p>}
        </section>
        <section><b>{translate(language, "What to notice")}</b><p>{observationSummary}</p></section>
        <section><b>{translate(language, "Conditions & safety")}</b><p><strong>{language === "hi" ? "अभिक्रिया प्रकार:" : "Reaction type:"}</strong> {categoryLabel}</p><p><strong>{language === "hi" ? "आवश्यक मेज़:" : "Required station:"}</strong> {stationLabel}. {reaction?.conditions?.heatRequired ? `${translate(language, "Heating required")}. ` : ""}{reaction?.conditions?.catalyst ? `${translate(language, "Catalyst:")} ${reaction.conditions.catalyst}. ` : ""}{reaction?.hazardWarning ? (language === "hi" ? localizeScienceHindi(reaction.hazardWarning) : reaction.hazardWarning) : ""}</p><p className="hud-mass-caveat">{translate(language, "Product masses are estimates from the balanced equation and sample masses; real laboratory yield can vary.")}</p></section>
      </aside>

      {/* 3. SCIENTIFIC THEORY & PRODUCTS DRAWER */}
      {explanationOpen && (
        <aside className="hud-explanation-drawer" role="dialog" aria-label={translate(language, "Scientific theory")}>
          <div className="drawer-header">
            <h3>{translate(language, "Scientific Interpretation & Details")}</h3>
            <button type="button" className="drawer-close" onClick={onToggleExplanation}>×</button>
          </div>

          <div className="drawer-tabs">
            <button
              type="button"
              className={detailsTab === "explanation" ? "active" : ""}
              onClick={() => setDetailsTab("explanation")}
            >
              {translate(language, "Mechanism")}
            </button>
            <button
              type="button"
              className={detailsTab === "products" ? "active" : ""}
              onClick={() => setDetailsTab("products")}
            >
              {translate(language, "Products & Yield")}
            </button>
            <button
              type="button"
              className={detailsTab === "observations" ? "active" : ""}
              onClick={() => setDetailsTab("observations")}
            >
              {translate(language, "Safety & Conditions")}
            </button>
          </div>

          <div className="drawer-body">
            {detailsTab === "explanation" && (
              <section className="drawer-section">
                <h4>{translate(language, "Reaction Mechanism")}</h4>
                <p>
                  {language === "hi"
                    ? localizeScienceHindi(reaction.explanation || reaction.hazardWarning || explanationText)
                    : reaction.explanation || reaction.hazardWarning || explanationText}
                </p>

                {config.category === EXPERIMENT_CATEGORIES.ELECTROLYSIS && (
                  <div className="half-reactions-card">
                    <h5>{translate(language, "Electrode Half-Reactions")}</h5>
                    <p><b>{translate(language, "Cathode (Reduction):")}</b> <code>2H⁺ + 2e⁻ → H₂ (g)</code></p>
                    <p><b>{translate(language, "Anode (Oxidation):")}</b> <code>2H₂O → O₂ (g) + 4H⁺ + 4e⁻</code></p>
                    <small>{translate(language, "Hydrogen gas at the cathode collects at twice the volume of oxygen at the anode (2:1 volume ratio).")}</small>
                  </div>
                )}

                {config.category === EXPERIMENT_CATEGORIES.DISPLACEMENT && (
                  <div className="reactivity-card">
                    <h5>{translate(language, "Reactivity Series Explanation")}</h5>
                    <p>{translate(language, "A more reactive metal displaces a less reactive metal from its aqueous salt solution.")}</p>
                    <p className="reactivity-seq"><code>K &gt; Na &gt; Ca &gt; Mg &gt; Al &gt; Zn &gt; Fe &gt; Pb &gt; [H] &gt; Cu &gt; Ag &gt; Au</code></p>
                  </div>
                )}
              </section>
            )}

            {detailsTab === "products" && (
              <section className="drawer-section">
                <h4>{translate(language, "Products Formed")}</h4>
                <div className="hud-products-grid">
                  {products.map((p, idx) => (
                    <article key={p.id || idx} className="hud-product-card">
                      <strong>{p.name}</strong>
                      <code>{p.formula}</code>
                      <span className="state-pill">{p.state || "aqueous"}</span>
                    </article>
                  ))}
                </div>

                {reaction?.outcome?.remaining?.length > 0 && (
                  <div className="excess-reagents-note">
                    <b>{translate(language, "Left in Excess:")}</b>
                    <span>
                      {reaction.outcome.remaining
                        .map((rem) => `${rem.chemical?.name || rem.id} ≈ ${rem.grams?.toFixed(2)} g`)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </section>
            )}

            {detailsTab === "observations" && (
              <section className="drawer-section">
                <h4>{translate(language, "Conditions & Safety Information")}</h4>
                {reaction?.conditions?.heatRequired && (
                  <p className="condition-note">🔥 <b>{translate(language, "Heating Required:")}</b> {translate(language, "This reaction requires sustained heat to overcome activation energy.")}</p>
                )}
                {reaction?.conditions?.catalyst && (
                  <p className="condition-note">⚡ <b>{translate(language, "Catalyst:")}</b> {reaction.conditions.catalyst}</p>
                )}
                {reaction?.hazardWarning && (
                  <div className="safety-alert-box">
                    <strong>⚠️ {translate(language, "Safety & Laboratory Accuracy")}</strong>
                    <p>{language === "hi" ? localizeScienceHindi(reaction.hazardWarning) : reaction.hazardWarning}</p>
                  </div>
                )}

                <div className="export-action-row">
                  <button type="button" onClick={() => onExport("save")}>
                    📷 {translate(language, "Save result image")}
                  </button>
                  <button type="button" onClick={() => onExport("share")}>
                    🔗 {translate(language, "Share with friends")}
                  </button>
                </div>
                {exportStatus && <p className="export-status-note">{exportStatus}</p>}
              </section>
            )}
          </div>
        </aside>
      )}

      {/* 4. BOTTOM INTERACTIVE TIMELINE & CONTROLS */}
      <footer className="experiment-hud-footer">
        <ReactionNarration
          explanation={explanationText}
          isPlaying={isPlaying}
          playbackSpeed={playbackSpeed}
          language={language}
          narrationEnabled={narrationEnabled}
          currentAction={beatLines[beat]}
          onTogglePlay={onTogglePlay}
          onReset={onReset}
          onToggleSpeed={onToggleSpeed}
        />
      </footer>
    </div>
  );
}

export default memo(ExperimentOverlay);
