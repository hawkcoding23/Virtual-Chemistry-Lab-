import { memo, useMemo, useState } from "react";
import { translate } from "../i18n";

export const SHOWCASE_SETUPS = [
  // ==================== CLASS 9 ====================
  {
    id: "magnesium_hydrochloric_acid",
    classLevel: 9,
    title: "Magnesium Ribbon + Dilute HCl",
    category: "Gas Evolution",
    badgeColor: "#10b981",
    equation: "Mg + 2HCl → MgCl₂ + H₂",
    observation: "Vigorous effervescence; H₂ gas evolves rapidly",
    icon: "⚗️",
    setupName: "Conical Flask + Metal Strip",
    setupSteps: [
      "Take a conical flask with dilute hydrochloric acid.",
      "Add clean magnesium ribbon strip.",
      "Observe rapid bubbles of hydrogen gas forming.",
    ],
    reactants: ["magnesium", "hydrochloric_acid"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "lead_nitrate_potassium_iodide",
    classLevel: 9,
    title: "Lead Nitrate + Potassium Iodide",
    category: "Precipitation Reaction",
    badgeColor: "#facc15",
    equation: "Pb(NO₃)₂ + 2KI → PbI₂↓ + 2KNO₃",
    observation: "Brilliant canary-yellow precipitate of PbI₂ forms instantly",
    icon: "🧪",
    setupName: "Beaker + Precision Dropper",
    setupSteps: [
      "Fill beaker with transparent lead nitrate solution.",
      "Add potassium iodide drops using the pipette.",
      "Observe dazzling yellow precipitate clouds billow.",
    ],
    reactants: ["lead_nitrate", "potassium_iodide"],
    actionLabel: "Start Experiment ▶",
  },

  // ==================== CLASS 10 ====================
  {
    id: "photosynthesis_chromatography",
    classLevel: 10,
    title: "Photosynthesis Pigment Test",
    category: "Paper Chromatography",
    badgeColor: "#38bdf8",
    equation: "Capillary partition separation of leaf chloroplast pigments",
    observation: "Four distinct pigment bands (Carotene, Xanthophyll, Chlorophyll a & b)",
    icon: "🌿",
    setupName: "Beaker + Chromatography Strip on Support Rod",
    setupSteps: [
      "Take chromatography paper with leaf extract spot.",
      "Suspend strip in beaker containing organic solvent.",
      "Observe capillary rise and 4 separated pigment bands.",
    ],
    reactants: ["ethanol", "water"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "iron_copper_sulfate",
    classLevel: 10,
    title: "Iron Nail in Copper Sulphate",
    category: "Displacement Reaction",
    badgeColor: "#3b82f6",
    equation: "Fe + CuSO₄ → FeSO₄ + Cu",
    observation: "Blue solution turns light green; reddish-brown Cu deposits on nail",
    icon: "🔩",
    setupName: "Beaker + Immersed Metal Specimen",
    setupSteps: [
      "Fill beaker with deep blue copper sulphate solution.",
      "Immerse clean iron nail into the solution.",
      "Observe copper metal coating the iron nail surface.",
    ],
    reactants: ["iron", "copper_sulfate"],
    actionLabel: "Start Experiment ▶",
  },

  // ==================== CLASS 11 ====================
  {
    id: "bottle_mixing_exothermic",
    classLevel: 11,
    title: "Bottle Mixing (Exothermic Reaction)",
    category: "Exothermic Expansion",
    badgeColor: "#a855f7",
    equation: "NaOH + HCl → NaCl + H₂O + Heat",
    observation: "Temperature climbs to 68°C; rubber balloon inflates on bottle mouth!",
    icon: "🎈",
    setupName: "Reagent Bottle with Expanding Rubber Balloon",
    setupSteps: [
      "Take a glass bottle and add NaOH and HCl.",
      "Attach elastic rubber balloon tightly over the neck.",
      "Observe temperature climb as heated gas inflates balloon.",
    ],
    reactants: ["sodium_hydroxide", "hydrochloric_acid"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "copper_carbonate_thermal_decomposition",
    classLevel: 11,
    title: "Heating of Copper Carbonate",
    category: "Thermal Decomposition",
    badgeColor: "#f97316",
    equation: "CuCO₃ → CuO + CO₂",
    observation: "Turquoise green CuCO₃ decomposes into velvety black CuO with gas evolution",
    icon: "🔥",
    setupName: "Clamped Test Tube + Roaring Bunsen Burner",
    setupSteps: [
      "Place green copper carbonate in clamped boiling tube.",
      "Ignite Bunsen burner with roaring flame under tube.",
      "Observe green solid turn black and CO₂ evolve.",
    ],
    reactants: ["copper_carbonate"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "hydrochloric_acid_sodium_hydroxide",
    classLevel: 11,
    title: "Neutralisation Titration",
    category: "Acid-Base Neutralisation",
    badgeColor: "#10b981",
    equation: "HCl + NaOH → NaCl + H₂O",
    observation: "Burette drops NaOH into HCl; phenolphthalein turns pink at pH = 7",
    icon: "🔬",
    setupName: "Conical Flask + Calibrated Burette Setup",
    setupSteps: [
      "Add HCl and indicator into the conical flask.",
      "Mount calibrated burette filled with NaOH on stand.",
      "Titrate dropwise until sharp indicator endpoint.",
    ],
    reactants: ["hydrochloric_acid", "sodium_hydroxide"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "hydrogen_preparation",
    classLevel: 11,
    title: "Preparation of Hydrogen Gas",
    category: "Gas Collection over Water",
    badgeColor: "#06b6d4",
    equation: "Zn + H₂SO₄ → ZnSO₄ + H₂",
    observation: "H₂ gas bubbles through delivery tube, displacing water in inverted jar",
    icon: "🧫",
    setupName: "Flask + Delivery Tube into Inverted Gas Jar in Trough",
    setupSteps: [
      "Add zinc granules and dilute sulfuric acid in flask.",
      "Fit stopper with double-bent glass delivery tube.",
      "Collect rising H₂ bubbles by downward displacement of water.",
    ],
    reactants: ["zinc", "sulfuric_acid"],
    actionLabel: "Start Experiment ▶",
  },

  // ==================== CLASS 12 ====================
  {
    id: "sodium_water",
    classLevel: 12,
    title: "Sodium in Water (Reactive Metal)",
    category: "Violent Metal Reaction",
    badgeColor: "#ea580c",
    equation: "2Na + 2H₂O → 2NaOH + H₂",
    observation: "Tweezers drop sodium cube; skims water surface fizzing with H₂ and flame",
    icon: "⚡",
    setupName: "Beaker of Water + Laboratory Tweezers / Tongs",
    setupSteps: [
      "Fill glass beaker with clean room-temperature water.",
      "Grasp metallic sodium cube using laboratory tweezers.",
      "Release into water; observe vigorous surface darting and flame.",
    ],
    reactants: ["sodium", "water"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "ethanol_ethanoic_acid_esterification",
    classLevel: 12,
    title: "Esterification (Organic Synthesis)",
    category: "Condensation & Reflux",
    badgeColor: "#0284c7",
    equation: "CH₃COOH + C₂H₅OH → CH₃COOC₂H₅ + H₂O",
    observation: "Refluxed vapors condense through Liebig condenser into sweet-smelling ester",
    icon: "🧴",
    setupName: "Round-Bottom Flask + Liebig Water Condenser",
    setupSteps: [
      "Mix ethanoic acid and ethanol with conc. H₂SO₄ catalyst.",
      "Heat under reflux with angled Liebig cooling condenser.",
      "Collect pure aromatic ethyl ethanoate in receiver beaker.",
    ],
    reactants: ["acetic_acid", "ethanol", "sulfuric_acid"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "silver_nitrate_sodium_chloride",
    classLevel: 12,
    title: "Precipitation of Silver Chloride",
    category: "Precipitation Reaction",
    badgeColor: "#e2e8f0",
    equation: "AgNO₃ + NaCl → AgCl↓ + NaNO₃",
    observation: "Dropper releases AgNO₃ into NaCl; curd-white precipitate forms instantly",
    icon: "☁️",
    setupName: "Beaker + Squeeze Bulb Pipette Dropper",
    setupSteps: [
      "Fill beaker with transparent sodium chloride solution.",
      "Dispense silver nitrate dropwise from suspended dropper.",
      "Watch curd-white AgCl precipitate clouds billow and settle.",
    ],
    reactants: ["silver_nitrate", "sodium_chloride"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "redox_kmno4_oxalic_acid",
    classLevel: 12,
    title: "Redox Reaction (KMnO₄ Decolourisation)",
    category: "Redox Titration",
    badgeColor: "#c084fc",
    equation: "2KMnO₄ + 5H₂C₂O₄ + 3H₂SO₄ → K₂SO₄ + 2MnSO₄ + 10CO₂ + 8H₂O",
    observation: "Deep royal purple KMnO₄ completely decolourises to water-clear Mn²⁺",
    icon: "🔮",
    setupName: "Reaction Beaker + Dropper + Effervescence",
    setupSteps: [
      "Fill beaker with intense purple potassium permanganate.",
      "Add oxalic acid reducing agent dropwise into solution.",
      "Observe rapid decolourisation to clear colorless liquid.",
    ],
    reactants: ["potassium_permanganate", "oxalic_acid", "sulfuric_acid"],
    actionLabel: "Start Experiment ▶",
  },
  {
    id: "water_electrolysis",
    classLevel: 12,
    title: "Electrolysis of Water (DC Power Supply)",
    category: "Electrochemical Decomposition",
    badgeColor: "#10b981",
    equation: "2H₂O → 2H₂ (Cathode) + O₂ (Anode)",
    observation: "DC 12V applied; 2:1 ratio of H₂ gas at cathode and O₂ gas at anode",
    icon: "🔋",
    setupName: "Electrolysis Voltameter + DC Power Supply Box",
    setupSteps: [
      "Set up electrolysis cell with graphite electrodes.",
      "Connect red (+) and black (-) leads to DC power supply.",
      "Switch on 12V DC power; observe gas collection in tubes.",
    ],
    reactants: ["water"],
    actionLabel: "Start Experiment ▶",
  },
];

function ReactionShowcaseModal({
  language = "en",
  onSelectReaction,
  onClose,
}) {
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredSetups = useMemo(() => {
    if (selectedTab === "all") return SHOWCASE_SETUPS;
    const classNum = parseInt(selectedTab, 10);
    return SHOWCASE_SETUPS.filter((setup) => setup.classLevel === classNum);
  }, [selectedTab]);

  return (
    <div
      className="reaction-showcase-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="reaction-showcase-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reaction-showcase-title"
      >
        {/* Header matching image banner */}
        <div className="showcase-header">
          <div className="showcase-header-left">
            <span className="showcase-flask-icon">⚗️</span>
            <div>
              <h2 id="reaction-showcase-title">
                {language === "hi"
                  ? "प्रयोग सेटअप प्रदर्शन (Reaction Setup Showcase)"
                  : "Reaction Setup Showcase"}
              </h2>
              <p>
                {language === "hi"
                  ? "विभिन्न रासायनिक अभिक्रियाएं · 3D प्रयोगशाला उपकरण · कक्षा 9–12 NCERT"
                  : "Different Reactions · 3D Lab Apparatus Setups · All Classes (9th – 12th)"}
              </p>
            </div>
          </div>

          <div className="showcase-header-right">
            <div className="showcase-trophy-badge">
              <span>🏆</span>
              <div>
                <strong>Learn.</strong>
                <small>Experiment. Excel!</small>
              </div>
            </div>
            <button
              type="button"
              className="showcase-close-btn"
              onClick={onClose}
              aria-label="Close Showcase"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Navigation Tabs */}
        <div className="showcase-tabs-bar" role="tablist">
          {[
            { id: "all", label: language === "hi" ? "सभी कक्षाएं (All)" : "All Reactions" },
            { id: "9", label: "Class 9th" },
            { id: "10", label: "Class 10th" },
            { id: "11", label: "Class 11th" },
            { id: "12", label: "Class 12th" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selectedTab === tab.id}
              className={`showcase-tab-btn ${selectedTab === tab.id ? "is-active" : ""}`}
              onClick={() => setSelectedTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="showcase-cards-grid">
          {filteredSetups.map((setup) => (
            <div
              key={setup.id}
              className={`showcase-card showcase-card-class-${setup.classLevel}`}
            >
              {/* Top Class Tag */}
              <div className="showcase-card-top">
                <span
                  className="showcase-class-pill"
                  style={{ borderColor: setup.badgeColor, color: setup.badgeColor }}
                >
                  {`Class ${setup.classLevel}th`}
                </span>
                <span className="showcase-category-tag">{setup.category}</span>
              </div>

              {/* Title & Observation */}
              <h3 className="showcase-card-title">{setup.title}</h3>
              <div className="showcase-equation-tag">
                <code>{setup.equation}</code>
              </div>
              <p className="showcase-obs-snippet">
                <strong>Observation:</strong> {setup.observation}
              </p>

              {/* Apparatus Setup Badge */}
              <div className="showcase-apparatus-badge">
                <span className="apparatus-icon">{setup.icon}</span>
                <span>{setup.setupName}</span>
              </div>

              {/* 3 Step Guide List */}
              <div className="showcase-steps-list">
                <h4>Setup Steps:</h4>
                <ol>
                  {setup.setupSteps.map((step, idx) => (
                    <li key={idx}>
                      <span className="step-num">{idx + 1}</span>
                      <span className="step-text">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Action Button */}
              <button
                type="button"
                className="showcase-launch-btn"
                onClick={() => {
                  onSelectReaction(setup);
                  onClose();
                }}
              >
                <span>{setup.actionLabel}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default memo(ReactionShowcaseModal);
