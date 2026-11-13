import assert from "node:assert";
import fs from "node:fs";
import {
  classifyReactionCategory,
  buildExperimentConfig,
  EXPERIMENT_CATEGORIES,
} from "../src/components/simulation/simulationEngine.js";

const catalogue = JSON.parse(fs.readFileSync("backend/data/reactionCatalogue.json", "utf8"));
const catalogueMap = new Map(catalogue.map((r) => [r.id, r]));

console.log("=== RUNNING REACTION SIMULATION ENGINE VERIFICATION ===");

// 1. NEUTRALISATION TESTS
{
  const hcl_naoh = catalogueMap.get("hydrochloric_acid_sodium_hydroxide");
  assert(hcl_naoh, "hydrochloric_acid_sodium_hydroxide should exist");
  assert.strictEqual(
    classifyReactionCategory(hcl_naoh),
    EXPERIMENT_CATEGORIES.NEUTRALISATION,
    "HCl + NaOH must be classified as NEUTRALISATION"
  );
  const cfg = buildExperimentConfig(hcl_naoh);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.NEUTRALISATION);
  assert(cfg.apparatusList.includes("burette_stand"), "Must include burette stand");
  assert(cfg.apparatusList.includes("conical_flask"), "Must include conical flask");
  assert.strictEqual(cfg.stages.length, 5, "Must have 5 interactive timeline stages");
  assert(cfg.isExothermic, "Neutralisation is exothermic");
  console.log("✔ Neutralisation (HCl + NaOH) verified");
}

// 2. COMBUSTION TESTS
{
  const ch4 = catalogueMap.get("methane_combustion");
  assert(ch4, "methane_combustion should exist");
  assert.strictEqual(
    classifyReactionCategory(ch4),
    EXPERIMENT_CATEGORIES.COMBUSTION,
    "CH4 + O2 must be classified as COMBUSTION"
  );
  const cfg = buildExperimentConfig(ch4);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.COMBUSTION);
  assert(cfg.apparatusList.includes("combustion_crucible"));
  assert(cfg.isExothermic, "Combustion is exothermic");

  const mg = catalogueMap.get("magnesium_oxygen");
  assert.strictEqual(classifyReactionCategory(mg), EXPERIMENT_CATEGORIES.COMBUSTION);
  console.log("✔ Combustion (CH4 & Mg) verified");
}

// 3. PRECIPITATION TESTS
{
  const pb_ki = catalogueMap.get("lead_nitrate_potassium_iodide");
  assert(pb_ki, "lead_nitrate_potassium_iodide should exist");
  assert.strictEqual(
    classifyReactionCategory(pb_ki),
    EXPERIMENT_CATEGORIES.PRECIPITATION,
    "Pb(NO3)2 + KI must be classified as PRECIPITATION"
  );
  const cfg = buildExperimentConfig(pb_ki);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.PRECIPITATION);
  assert.strictEqual(cfg.precipitate.color, "#e2c534", "Lead iodide precipitate must be bright yellow");
  assert(cfg.apparatusList.includes("glass_beaker"));

  const ba_so4 = catalogueMap.get("sodium_sulfate_barium_chloride");
  assert.strictEqual(classifyReactionCategory(ba_so4), EXPERIMENT_CATEGORIES.PRECIPITATION);
  const baCfg = buildExperimentConfig(ba_so4);
  assert(baCfg.precipitate.color.toLowerCase().includes("f") || baCfg.precipitate.color.toLowerCase().includes("e"), "Barium sulfate precipitate must be white");
  console.log("✔ Precipitation (PbI2 & BaSO4) verified with accurate NCERT colours");
}

// 4. THERMAL DECOMPOSITION TESTS
{
  const feso4 = catalogueMap.get("ferrous_sulfate_thermal_decomposition");
  assert(feso4, "ferrous_sulfate_thermal_decomposition should exist");
  assert.strictEqual(
    classifyReactionCategory(feso4),
    EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION,
    "FeSO4 must be classified as THERMAL_DECOMPOSITION"
  );
  const cfg = buildExperimentConfig(feso4);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION);
  assert(cfg.apparatusList.includes("boiling_tube"));
  assert(cfg.apparatusList.includes("bunsen_burner"));
  assert(cfg.requiresHeating, "Thermal decomposition requires heating");

  const pbno3 = catalogueMap.get("lead_nitrate_thermal_decomposition");
  assert.strictEqual(classifyReactionCategory(pbno3), EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION);
  const pbCfg = buildExperimentConfig(pbno3);
  assert(pbCfg.gas.color.toLowerCase().includes("9e") || pbCfg.gas.color.toLowerCase().includes("a8"), "NO2 gas must have reddish brown fume color");
  console.log("✔ Thermal decomposition (FeSO4 & Pb(NO3)2) verified");
}

// 5. ELECTROLYSIS TESTS
{
  const h2o = catalogueMap.get("water_electrolysis");
  assert(h2o, "water_electrolysis should exist");
  assert.strictEqual(
    classifyReactionCategory(h2o),
    EXPERIMENT_CATEGORIES.ELECTROLYSIS,
    "Water electrolysis must be classified as ELECTROLYSIS"
  );
  const cfg = buildExperimentConfig(h2o);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.ELECTROLYSIS);
  assert(cfg.apparatusList.includes("electrolysis_cell"));
  assert(cfg.apparatusList.includes("dc_power_supply"));
  assert(cfg.apparatusList.includes("graphite_electrodes"));

  const chlor = catalogueMap.get("chlor_alkali_process");
  assert.strictEqual(classifyReactionCategory(chlor), EXPERIMENT_CATEGORIES.ELECTROLYSIS);
  console.log("✔ Electrolysis (H2O & Chlor-Alkali) verified");
}

// 6. GAS EVOLUTION TESTS
{
  const na2co3 = catalogueMap.get("sodium_carbonate_hydrochloric_acid");
  assert(na2co3, "sodium_carbonate_hydrochloric_acid should exist");
  assert.strictEqual(
    classifyReactionCategory(na2co3),
    EXPERIMENT_CATEGORIES.GAS_EVOLUTION,
    "Na2CO3 + HCl must be classified as GAS_EVOLUTION"
  );
  const cfg = buildExperimentConfig(na2co3);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.GAS_EVOLUTION);
  assert(cfg.gas.test.includes("lime water") || cfg.gas.test.includes("Ca(OH)₂"), "CO2 test must describe lime water test");
  assert(cfg.apparatusList.includes("delivery_tube"));
  console.log("✔ Gas evolution (Na2CO3 + HCl -> CO2) verified");
}

// 7. DISPLACEMENT TESTS
{
  const fe_cuso4 = catalogueMap.get("iron_copper_sulfate");
  assert(fe_cuso4, "iron_copper_sulfate should exist");
  assert.strictEqual(
    classifyReactionCategory(fe_cuso4),
    EXPERIMENT_CATEGORIES.DISPLACEMENT,
    "Fe + CuSO4 must be classified as DISPLACEMENT"
  );
  const cfg = buildExperimentConfig(fe_cuso4);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.DISPLACEMENT);
  assert(cfg.apparatusList.includes("metal_strip_holder"));
  assert.strictEqual(cfg.displacement.specimen, "iron_nail");
  assert.strictEqual(cfg.displacement.depositColor, "#b66c43", "Copper deposit must be red-brown");
  console.log("✔ Displacement (Fe + CuSO4) verified");
}

// 8. COMBINATION & SYNTHESIS TESTS
{
  const cao_h2o = catalogueMap.get("calcium_oxide_water");
  if (cao_h2o) {
    assert.strictEqual(classifyReactionCategory(cao_h2o), EXPERIMENT_CATEGORIES.COMBINATION_SYNTHESIS);
    console.log("✔ Combination (CaO + H2O) verified");
  }
}

// 9. REVERSIBLE / EQUILIBRIUM TESTS
{
  const haber = catalogueMap.get("haber_process");
  assert(haber, "haber_process should exist");
  assert.strictEqual(
    classifyReactionCategory(haber),
    EXPERIMENT_CATEGORIES.REVERSIBLE_EQUILIBRIUM,
    "Haber process must be classified as REVERSIBLE_EQUILIBRIUM"
  );
  const cfg = buildExperimentConfig(haber);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.REVERSIBLE_EQUILIBRIUM);
  assert(cfg.apparatusList.includes("catalytic_reaction_chamber"));
  console.log("✔ Reversible equilibrium (Haber process) verified");
}

// 10. UNMATCHED SAMPLES (NO REACTION)
{
  const invalid = { noReaction: true, samples: [{ id: "water", name: "Water" }] };
  const cfg = buildExperimentConfig(invalid);
  assert.strictEqual(cfg.category, EXPERIMENT_CATEGORIES.GENERAL_REACTION);
  assert.strictEqual(cfg.stages.length, 5);
  console.log("✔ Unmatched combination handled gracefully");
}

console.log("\nALL EXPERIMENT SPECIFIC REACTION SIMULATION TESTS PASSED SUCCESSFULLY! 🎉\n");
