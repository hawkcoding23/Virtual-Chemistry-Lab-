import { getChemicalColor, getReactionColor } from "../../data/chemicalVisuals.js";

export const EXPERIMENT_CATEGORIES = {
  NEUTRALISATION: "NEUTRALISATION",
  COMBUSTION: "COMBUSTION",
  PRECIPITATION: "PRECIPITATION",
  THERMAL_DECOMPOSITION: "THERMAL_DECOMPOSITION",
  ELECTROLYSIS: "ELECTROLYSIS",
  GAS_EVOLUTION: "GAS_EVOLUTION",
  DISPLACEMENT: "DISPLACEMENT",
  COMBINATION_SYNTHESIS: "COMBINATION_SYNTHESIS",
  REVERSIBLE_EQUILIBRIUM: "REVERSIBLE_EQUILIBRIUM",
  GENERAL_REACTION: "GENERAL_REACTION",
};

export const EXPERIMENT_STAGES = [
  { id: "preparation", label: "Preparation", labelHi: "तैयारी", threshold: 0.18 },
  { id: "initial_observation", label: "Initial Observation", labelHi: "प्रारंभिक प्रेक्षण", threshold: 0.42 },
  { id: "reaction_event", label: "Reaction Event", labelHi: "अभिक्रिया घटना", threshold: 0.70 },
  { id: "final_observation", label: "Final Observation", labelHi: "अंतिम प्रेक्षण", threshold: 0.92 },
  { id: "scientific_interpretation", label: "Scientific Interpretation", labelHi: "वैज्ञानिक व्याख्या", threshold: 1.0 },
];

// Known precipitate colors from verified NCERT chemistry observations
const PRECIPITATE_COLORS = {
  lead_iodide: "#e2c534", // Brilliant bright yellow
  barium_sulfate: "#f5f6f2", // Dense white precipitate
  calcium_carbonate: "#eef2f3", // Milky white precipitate
  silver_chloride: "#eeede5", // Curdy white
  copper_hydroxide: "#429bc1", // Pale blue
  iron_ii_hydroxide: "#4b8265", // Dirty green
  iron_iii_hydroxide: "#8b3f27", // Reddish brown
  zinc_hydroxide: "#e8eaeb", // Gelatinous white
  lead_sulfate: "#f0f2f2", // White
  calcium_sulfate: "#f0f2f2", // White
  barium_carbonate: "#f2f4f4", // White
  silver_iodide: "#dfd875", // Pale yellow
  silver_bromide: "#e8e5a7", // Cream / pale yellow
};

// Known gas colors and identification tests
const GAS_PROPERTIES = {
  hydrogen: {
    color: "#d8ebf2",
    test: "Burns with a characteristic 'pop' sound when a burning splint is introduced",
    testHi: "जलती हुई तीली लाने पर 'पॉप' ध्वनि के साथ जलती है",
    density: "rapid",
  },
  oxygen: {
    color: "#c8e4f0",
    test: "Relights a glowing wooden splint",
    testHi: "सुलगती हुई तीली को फिर से प्रज्वलित करती है",
    density: "moderate",
  },
  carbon_dioxide: {
    color: "#d5e2e8",
    test: "Turns clear lime water Ca(OH)₂ milky white due to formation of insoluble CaCO₃",
    testHi: "चूने के पानी को अघुलनशील CaCO₃ बनने के कारण दूधिया कर देती है",
    density: "rapid",
  },
  chlorine: {
    color: "#c2d665", // Pale greenish-yellow
    test: "Greenish-yellow gas with pungent suffocating smell; bleaches moist litmus paper",
    testHi: "तीखी गंध वाली हरी-पीली गैस; नम लिटमस पेपर को विरंजित करती है",
    density: "moderate",
  },
  nitrogen_dioxide: {
    color: "#9e552d", // Reddish-brown fumes
    test: "Characteristic pungent reddish-brown fumes that turn moist blue litmus red",
    testHi: "विशिष्ट तीखी भूरे रंग की गैस जो नीले लिटमस को लाल करती है",
    density: "dense",
  },
  sulfur_dioxide: {
    color: "#d6e0e2",
    test: "Suffocating choking smell of burning sulfur; turns acidified K₂Cr₂O₇ from orange to green",
    testHi: "सल्फर के जलने जैसी तीखी गंध; अम्लीय K₂Cr₂O₇ को नारंगी से हरा करती है",
    density: "moderate",
  },
  ammonia: {
    color: "#d9e8ed",
    test: "Pungent smell; turns moist red litmus blue and gives dense white fumes with HCl",
    testHi: "तीखी गंध; नम लाल लिटमस को नीला करती है और HCl के साथ घने सफेद धुएँ देती है",
    density: "moderate",
  },
};

/**
 * Classifies a reaction into one of the specialized 3D simulation categories.
 */
export function classifyReactionCategory(reaction) {
  if (!reaction || reaction.noReaction) return EXPERIMENT_CATEGORIES.GENERAL_REACTION;

  const id = String(reaction.id || "").toLowerCase();
  const rawTypes = Array.isArray(reaction.reactionType)
    ? reaction.reactionType
    : [reaction.reactionType || reaction.type || ""];
  const types = rawTypes.filter(Boolean).map((t) => String(t).toLowerCase().replace(/[- ]+/g, "_"));
  const conditions = reaction.conditions || {};
  const observations = reaction.observations || {};
  const equation = String(reaction.equation || "");

  // Magnesium burns in oxygen to form magnesium oxide. Some curriculum records
  // label it only as a combination reaction, so identify the experiment by its
  // chemistry as well as by its category label.
  const reactantIds = (reaction.reactants || []).map((item) => String(typeof item === "string" ? item : item.chemicalId || item.id || "").toLowerCase());
  const isMagnesiumBurning = id.includes("magnesium_oxygen") ||
    (/2?\s*mg\s*\+\s*o2?\s*[→=]/i.test(equation.replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit))))) ||
    (reactantIds.includes("magnesium") && reactantIds.includes("oxygen") && (observations.lightProduced || conditions.heatRequired));
  const isMagnesiumAcid = (reactantIds.some((x) => x.includes("magnesium") || x === "mg")
    && reactantIds.some((x) => /hydrochloric|hcl|hydrogen_chloride/.test(x)))
    || /mg\s*\+\s*2?\s*hcl/i.test(equation.replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit))))
    || /magnesium.*(hydrochloric|hcl)|(hydrochloric|hcl).*magnesium/i.test(`${id} ${equation}`);

  // 1. Electrolysis
  if (
    types.some((t) => t.includes("electroly")) ||
    id.includes("electrolysis") ||
    String(conditions.catalyst || "").toLowerCase().includes("electric")
  ) {
    return EXPERIMENT_CATEGORIES.ELECTROLYSIS;
  }

  // 2. Reversible / Chemical equilibrium (prioritize over generic gas/combination)
  if (
    types.some((t) => t.includes("equilibrium")) ||
    ["haber_process", "so2_contact_process", "REDOX-034", "REDOX-095"].includes(reaction.id) ||
    equation.includes("⇌") ||
    equation.includes("<=>")
  ) {
    return EXPERIMENT_CATEGORIES.REVERSIBLE_EQUILIBRIUM;
  }

  // Magnesium with dilute hydrochloric acid evolves hydrogen; it is not burning.
  if (isMagnesiumAcid) return EXPERIMENT_CATEGORIES.GAS_EVOLUTION;

  // 3. Combustion
  if (
    isMagnesiumBurning ||
    types.some((t) => t.includes("combust")) ||
    (observations.lightProduced && conditions.heatRequired) ||
    id.includes("combustion")
  ) {
    return EXPERIMENT_CATEGORIES.COMBUSTION;
  }

  // 4. Thermal decomposition
  if (
    types.some((t) => t.includes("thermal_decomp")) ||
    (conditions.heatRequired && types.some((t) => t.includes("decomposition"))) ||
    id.includes("thermal_decomposition")
  ) {
    return EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION;
  }

  // 5. Acid-base neutralisation
  if (
    types.some((t) => t.includes("neutral")) ||
    types.some((t) => t.includes("acid_base")) ||
    id.includes("neutralisation") ||
    id.includes("neutralization")
  ) {
    return EXPERIMENT_CATEGORIES.NEUTRALISATION;
  }

  // 6. Precipitation
  if (
    Boolean(observations.precipitate) ||
    types.some((t) => t.includes("precipitat")) ||
    (types.some((t) => t.includes("double_displacement")) && observations.precipitate)
  ) {
    return EXPERIMENT_CATEGORIES.PRECIPITATION;
  }

  // 7. Displacement
  if (
    types.some((t) => t === "displacement" || t === "metal_displacement" || t === "single_displacement")
  ) {
    return EXPERIMENT_CATEGORIES.DISPLACEMENT;
  }

  // 8. Gas evolution
  if (
    types.some((t) => t.includes("gas_evolution") || t.includes("acid_carbonate") || t.includes("acid_hydrogencarbonate")) ||
    Boolean(observations.gas)
  ) {
    return EXPERIMENT_CATEGORIES.GAS_EVOLUTION;
  }

  // 9. Combination and synthesis
  if (
    types.some((t) => t.includes("combination") || t.includes("synthesis") || t.includes("addition"))
  ) {
    return EXPERIMENT_CATEGORIES.COMBINATION_SYNTHESIS;
  }

  return EXPERIMENT_CATEGORIES.GENERAL_REACTION;
}

/** The table a student must use to perform a reaction. */
export function getReactionStation(reaction) {
  const category = classifyReactionCategory(reaction);
  const id = String(reaction?.id || "").toLowerCase();
  const equation = String(reaction?.equation || "");
  const isMagnesiumBurning = id.includes("magnesium_oxygen") || /2?\s*mg\s*\+\s*o[₂2]\s*→\s*2?\s*mgo/i.test(equation);
  const isMagnesiumAcid = id.includes("magnesium") && /hcl|hydrochloric/i.test(`${equation} ${JSON.stringify(reaction.reactants || [])}`)
    || /mg\s*\+\s*2?\s*hcl/i.test(equation.replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit))))
    || /magnesium.*(hydrochloric|hcl)|(hydrochloric|hcl).*magnesium/i.test(`${id} ${equation}`);
  if (
    isMagnesiumBurning ||
    (!isMagnesiumAcid && (reaction?.conditions?.heatRequired || reaction?.observations?.lightProduced)) ||
    (!isMagnesiumAcid && [EXPERIMENT_CATEGORIES.COMBUSTION, EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION].includes(category))
  ) return "ignition";
  if (category === EXPERIMENT_CATEGORIES.ELECTROLYSIS) return "electrolysis";
  return "mixing";
}

/**
 * Extracts gas information from products and observations.
 */
function resolveGasData(reaction, products) {
  const knownGasIds = new Set([
    "carbon_dioxide", "hydrogen", "oxygen", "chlorine", "nitrogen_dioxide",
    "sulfur_dioxide", "ammonia", "carbon_monoxide", "methane", "nitrogen",
  ]);

  const rawGasObs = String(reaction?.observations?.gas || "").toLowerCase().replace(/[-_ ]+/g, "_");
  
  // Find gas product from state or known gas IDs or observations
  const gasProduct =
    products.find((p) => p.state === "gas" || knownGasIds.has(p.id)) ||
    products.find((p) => rawGasObs.includes(p.id)) ||
    null;

  let gasId = gasProduct?.id || null;
  if (!gasId) {
    for (const id of knownGasIds) {
      if (rawGasObs.includes(id) || rawGasObs.includes(id.replace(/_/g, ""))) {
        gasId = id;
        break;
      }
    }
  }

  const gasProp = gasId && GAS_PROPERTIES[gasId] ? GAS_PROPERTIES[gasId] : null;
  const gasNote = String(reaction?.observations?.gas || "").toLowerCase().replace(/_/g, " ");
  let fallbackColor = "#d6e0e3";
  let detectedTest = null;
  let detectedTestHi = null;

  if (gasNote.includes("carbon dioxide") || gasNote.includes("co2") || gasId === "carbon_dioxide") {
    fallbackColor = GAS_PROPERTIES.carbon_dioxide.color;
    detectedTest = GAS_PROPERTIES.carbon_dioxide.test;
    detectedTestHi = GAS_PROPERTIES.carbon_dioxide.testHi;
  } else if (gasNote.includes("hydrogen") || gasNote.includes("h2") || gasId === "hydrogen") {
    fallbackColor = GAS_PROPERTIES.hydrogen.color;
    detectedTest = GAS_PROPERTIES.hydrogen.test;
    detectedTestHi = GAS_PROPERTIES.hydrogen.testHi;
  } else if (gasNote.includes("nitrogen dioxide") || gasNote.includes("no2") || gasId === "nitrogen_dioxide") {
    fallbackColor = GAS_PROPERTIES.nitrogen_dioxide.color;
    detectedTest = GAS_PROPERTIES.nitrogen_dioxide.test;
    detectedTestHi = GAS_PROPERTIES.nitrogen_dioxide.testHi;
  } else if (gasNote.includes("chlorine") || gasNote.includes("cl2") || gasId === "chlorine") {
    fallbackColor = GAS_PROPERTIES.chlorine.color;
    detectedTest = GAS_PROPERTIES.chlorine.test;
    detectedTestHi = GAS_PROPERTIES.chlorine.testHi;
  } else if (gasNote.includes("oxygen") || gasNote.includes("o2") || gasId === "oxygen") {
    fallbackColor = GAS_PROPERTIES.oxygen.color;
    detectedTest = GAS_PROPERTIES.oxygen.test;
    detectedTestHi = GAS_PROPERTIES.oxygen.testHi;
  }

  return {
    hasGas: Boolean(gasProduct || gasId || reaction?.observations?.gas || reaction?.gameEffect?.bubbles),
    name: gasProduct?.name || (gasId ? gasId.replace(/_/g, " ") : reaction?.observations?.gas || "Gas"),
    formula: gasProduct?.formula || (gasId === "carbon_dioxide" ? "CO₂" : gasId === "hydrogen" ? "H₂" : gasId === "oxygen" ? "O₂" : ""),
    color: gasProp?.color || fallbackColor,
    density: gasProp?.density || (reaction?.gameEffect?.rapidGasRelease ? "rapid" : "moderate"),
    test: gasProp?.test || detectedTest || "Gas bubbles escape the reaction mixture",
    testHi: gasProp?.testHi || detectedTestHi || "अभिक्रिया मिश्रण से गैस के बुलबुले निकलते हैं",
  };
}

/**
 * Extracts precipitate information from products and observations.
 */
function resolvePrecipitateData(reaction, products) {
  const precipNote = String(reaction?.observations?.precipitate || "").toLowerCase().replace(/ /g, "_");
  const solidProduct = products.find((p) => p.id === precipNote) || products.find((p) => p.state === "solid") || null;
  const solidId = solidProduct?.id || precipNote;

  let color = "#e4e3dc"; // fallback neutral white
  if (PRECIPITATE_COLORS[solidId]) {
    color = PRECIPITATE_COLORS[solidId];
  } else if (precipNote.includes("yellow")) {
    color = "#e2c534";
  } else if (precipNote.includes("green")) {
    color = "#4b9c69";
  } else if (precipNote.includes("blue")) {
    color = "#328fc6";
  } else if (precipNote.includes("brown") || precipNote.includes("red")) {
    color = "#8b3f27";
  } else if (precipNote.includes("white") || precipNote.includes("milky")) {
    color = "#f4f5f0";
  } else if (reaction?.gameEffect?.precipitateColor) {
    color = reaction.gameEffect.precipitateColor;
  }

  const hasPrecipitate = Boolean(
    reaction?.observations?.precipitate ||
    reaction?.gameEffect?.precipitate ||
    (reaction?.reactionType && JSON.stringify(reaction.reactionType).toLowerCase().includes("precipitat"))
  );

  return {
    hasPrecipitate,
    name: solidProduct?.name || String(reaction?.observations?.precipitate || "Insoluble precipitate").replace(/_/g, " "),
    formula: solidProduct?.formula || "",
    color,
    settles: solidId === "barium_sulfate" || solidId === "lead_iodide" || solidId === "silver_chloride",
  };
}

/**
 * Builds the complete, data-driven simulation configuration for any reaction.
 */
export function buildExperimentConfig(reaction, allChemicals = {}) {
  const category = classifyReactionCategory(reaction);
  const requiredStation = getReactionStation(reaction);
  const samples = reaction?.samples || [];
  
  // Resolve product details with chemicals metadata
  const products = (reaction?.products || []).map((item) => {
    const id = (typeof item === "string" ? item : item.chemicalId)?.toLowerCase();
    const meta = allChemicals[id] || {};
    return {
      id,
      name: meta.name || id?.replace(/_/g, " ") || "Product",
      formula: meta.formula || "",
      state: meta.state || "liquid",
      color: meta.color || getChemicalColor({ ...meta, id }),
    };
  });

  const gasData = resolveGasData(reaction, products);
  const precipitateData = resolvePrecipitateData(reaction, products);

  // Colors
  const solutionSample = samples.find((s) => s.state === "liquid") || samples[0] || null;
  const startColor = solutionSample ? (solutionSample.color || getChemicalColor(solutionSample)) : "#70b8c4";
  const finalColor = reaction?.gameEffect?.finalColor || getReactionColor(reaction) || "#48a39a";

  // Indicator logic for neutralisation
  let indicatorType = "phenolphthalein";
  let indicatorStartColor = "#f43f8e"; // base + phenolphthalein = pink
  let indicatorEndColor = "#e6f3f5"; // neutralised = colourless
  let indicatorName = "Phenolphthalein indicator";
  let indicatorNameHi = "फ़िनॉल्फ़थेलिन सूचक";

  if (reaction?.id?.includes("copper_oxide") || samples.some((s) => s.id?.includes("oxide"))) {
    indicatorType = "metal_oxide_dissolution";
    indicatorStartColor = "#1a1c1e"; // black solid
    indicatorEndColor = "#2da695"; // blue-green solution
    indicatorName = "Direct reaction";
    indicatorNameHi = "सीधी अभिक्रिया";
  }

  // Displacement logic
  let displacedMetal = "copper";
  let solidSpecimen = "iron_nail";
  let depositColor = "#b66c43"; // red-brown copper deposit
  if (reaction?.id?.includes("zinc")) {
    solidSpecimen = "zinc_strip";
  } else if (reaction?.id?.includes("copper") && reaction?.id?.includes("silver")) {
    solidSpecimen = "copper_wire";
    depositColor = "#d6d8db"; // silver crystals
    displacedMetal = "silver";
  }

  // Apparatus list per category
  let apparatusList = [];
  let primaryVessel = "conical_flask";
  let heatingTool = "none";
  let deliverySetup = "none";

  switch (category) {
    case EXPERIMENT_CATEGORIES.NEUTRALISATION:
      apparatusList = ["conical_flask", "burette_stand", "indicator_dropper", "thermometer", "waste_beaker"];
      primaryVessel = "conical_flask";
      break;
    case EXPERIMENT_CATEGORIES.COMBUSTION:
      apparatusList = ["combustion_crucible", "ignition_splint", "heat_mat", "safety_screen"];
      primaryVessel = "crucible";
      heatingTool = "ignition_flame";
      break;
    case EXPERIMENT_CATEGORIES.PRECIPITATION:
      apparatusList = ["glass_beaker", "reagent_flask", "glass_stirrer", "measuring_cylinder"];
      primaryVessel = "glass_beaker";
      break;
    case EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION:
      apparatusList = ["boiling_tube", "retort_stand", "bunsen_burner", "delivery_tube", "gas_collector"];
      primaryVessel = "boiling_tube";
      heatingTool = "bunsen_burner";
      deliverySetup = "bent_tube";
      break;
    case EXPERIMENT_CATEGORIES.ELECTROLYSIS:
      apparatusList = ["electrolysis_cell", "dc_power_supply", "graphite_electrodes", "graduated_tubes", "connecting_leads"];
      primaryVessel = "electrolysis_cell";
      break;
    case EXPERIMENT_CATEGORIES.GAS_EVOLUTION:
      apparatusList = ["conical_flask", "thistle_dropper", "delivery_tube", "gas_collection_jar", "pneumatic_trough"];
      primaryVessel = "conical_flask";
      deliverySetup = "bent_tube";
      break;
    case EXPERIMENT_CATEGORIES.DISPLACEMENT:
      apparatusList = ["glass_beaker", "metal_strip_holder", "sandpaper_pad", "measuring_cylinder"];
      primaryVessel = "glass_beaker";
      break;
    case EXPERIMENT_CATEGORIES.COMBINATION_SYNTHESIS:
      apparatusList = ["reaction_beaker", "crucible_tongs", "bunsen_burner", "watch_glass"];
      primaryVessel = reaction?.conditions?.heatRequired ? "crucible" : "reaction_beaker";
      heatingTool = reaction?.conditions?.heatRequired ? "bunsen_burner" : "none";
      break;
    case EXPERIMENT_CATEGORIES.REVERSIBLE_EQUILIBRIUM:
      apparatusList = ["catalytic_reaction_chamber", "pressure_gauge", "heating_jacket", "equilibrium_readout"];
      primaryVessel = "catalytic_chamber";
      heatingTool = "electric_heater";
      break;
    default:
      apparatusList = ["glass_beaker", "reagent_vial", "glass_stirrer"];
      primaryVessel = "glass_beaker";
  }

  return {
    category,
    requiredStation,
    apparatusList,
    primaryVessel,
    heatingTool,
    deliverySetup,
    stages: EXPERIMENT_STAGES,
    startColor,
    finalColor,
    indicator: {
      type: indicatorType,
      name: indicatorName,
      nameHi: indicatorNameHi,
      startColor: indicatorStartColor,
      endColor: indicatorEndColor,
    },
    displacement: {
      specimen: solidSpecimen,
      displacedMetal,
      depositColor,
    },
    gas: gasData,
    precipitate: precipitateData,
    isExothermic: Boolean(
      reaction?.observations?.temperatureChange === "increase" ||
      reaction?.observations?.lightProduced ||
      category === EXPERIMENT_CATEGORIES.COMBUSTION ||
      category === EXPERIMENT_CATEGORIES.NEUTRALISATION
    ),
    isEndothermic: Boolean(
      reaction?.observations?.temperatureChange === "decrease" ||
      category === EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION ||
      category === EXPERIMENT_CATEGORIES.ELECTROLYSIS
    ),
    requiresHeating: Boolean(reaction?.conditions?.heatRequired || category === EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION),
  };
}
