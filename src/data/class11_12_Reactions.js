// NCERT Class 11 and Class 12 Landmark Chemical Reactions
// Curated syllabus experiments covering Redox, Thermodynamics, Hydrocarbons,
// Haloalkanes, Alcohols & Phenols, Carbonyls, Amines, and Coordination Compounds.

const makeReaction = (id, chapter, equation, reactants, products, type, observation = {}, conditions = {}, classes = [12]) => ({
  id,
  classes,
  chapter,
  reactants: reactants.map(([chemicalId, coefficient = 1]) => ({ chemicalId, coefficient })),
  products: products.map(([chemicalId, coefficient = 1]) => ({ chemicalId, coefficient })),
  equation,
  reactionType: Array.isArray(type) ? type : [type],
  conditions: { heatRequired: false, lightRequired: false, catalyst: null, ...conditions },
  observations: { gas: null, precipitate: null, colorChange: null, temperatureChange: null, lightProduced: false, ...observation },
  gameEffect: {
    bubbles: Boolean(observation.gas),
    precipitate: Boolean(observation.precipitate),
    heat: observation.temperatureChange === "increase",
    glow: Boolean(observation.lightProduced),
    finalColor: observation.precipitate ? (observation.precipitateColor || "#ead34f") : (observation.finalColor || "#e8f4f8")
  },
  source: { curriculum: "NCERT", class: classes[0], chapter },
});

export const CLASS_11_12_REACTIONS = [
  // ==================== CLASS 11: REDOX & THERMODYNAMICS ====================
  makeReaction(
    "redox_kmno4_oxalic_acid",
    "Redox Reactions (Class 11)",
    "2KMnO4 + 5H2C2O4 + 3H2SO4 → K2SO4 + 2MnSO4 + 10CO2 + 8H2O",
    [["potassium_permanganate", 2], ["oxalic_acid", 5], ["sulfuric_acid", 3]],
    [["potassium_sulfate"], ["manganese_sulfate", 2], ["carbon_dioxide", 10], ["water", 8]],
    "redox_titration",
    { colorChange: "intense purple KMnO4 decolorizes to colorless Mn2+", gas: "carbon dioxide" },
    { heatRequired: true },
    [11]
  ),

  makeReaction(
    "redox_k2cr2o7_feso4",
    "Redox Reactions (Class 11)",
    "K2Cr2O7 + 6FeSO4 + 7H2SO4 → Cr2(SO4)3 + 3Fe2(SO4)3 + K2SO4 + 7H2O",
    [["potassium_dichromate"], ["iron_sulfate", 6], ["sulfuric_acid", 7]],
    [["chromium_sulfate"], ["iron_iii_sulfate", 3], ["potassium_sulfate"], ["water", 7]],
    "redox",
    { colorChange: "vibrant orange dichromate turns deep emerald green Cr3+" },
    {},
    [11]
  ),

  makeReaction(
    "h2o2_decomposition",
    "Redox Reactions (Class 11)",
    "2H2O2 → 2H2O + O2",
    [["hydrogen_peroxide", 2]],
    [["water", 2], ["oxygen"]],
    "disproportionation",
    { gas: "oxygen gas bubbles vigorously", temperatureChange: "increase" },
    { catalyst: "manganese dioxide" },
    [11]
  ),

  makeReaction(
    "kclo3_thermal_decomposition",
    "Equilibrium and Redox (Class 11)",
    "2KClO3 → 2KCl + 3O2",
    [["potassium_chlorate", 2]],
    [["potassium_chloride", 2], ["oxygen", 3]],
    "thermal_decomposition",
    { gas: "oxygen gas evolves rapidly", lightProduced: false },
    { heatRequired: true, catalyst: "manganese dioxide" },
    [11]
  ),

  makeReaction(
    "haber_process",
    "Equilibrium (Class 11)",
    "N2 + 3H2 ⇌ 2NH3",
    [["nitrogen"], ["hydrogen", 3]],
    [["ammonia", 2]],
    "synthesis",
    { gas: "ammonia gas with sharp pungent odor", temperatureChange: "increase" },
    { heatRequired: true, catalyst: "iron and molybdenum promoter" },
    [11]
  ),

  makeReaction(
    "so2_contact_process",
    "Equilibrium (Class 11)",
    "2SO2 + O2 ⇌ 2SO3",
    [["sulfur_dioxide", 2], ["oxygen"]],
    [["sulfur_trioxide", 2]],
    "oxidation",
    { gas: "sulfur trioxide fumes evolve" },
    { heatRequired: true, catalyst: "vanadium pentoxide" },
    [11]
  ),

  makeReaction(
    "wurtz_reaction",
    "Hydrocarbons (Class 11)",
    "2CH3Cl + 2Na → C2H6 + 2NaCl",
    [["methyl_chloride", 2], ["sodium", 2]],
    [["ethane"], ["sodium_chloride", 2]],
    "named_reaction",
    { gas: "ethane gas evolved", temperatureChange: "increase" },
    { catalyst: "dry ether" },
    [11]
  ),

  makeReaction(
    "friedel_crafts_alkylation",
    "Hydrocarbons (Class 11)",
    "C6H6 + CH3Cl → C6H5CH3 + HCl",
    [["benzene"], ["methyl_chloride"]],
    [["toluene"], ["hydrochloric_acid"]],
    "electrophilic_substitution",
    { colorChange: "liquid toluene forms with acidic fumes" },
    { catalyst: "anhydrous aluminium chloride" },
    [11]
  ),

  makeReaction(
    "ethene_bromination",
    "Hydrocarbons (Class 11)",
    "C2H4 + Br2 → C2H4Br2",
    [["ethene"], ["bromine"]],
    [["ethene_dibromide"]],
    "halogenation",
    { colorChange: "reddish-brown bromine water completely decolorizes" },
    {},
    [11]
  ),

  makeReaction(
    "methane_combustion",
    "Thermodynamics (Class 11)",
    "CH4 + 2O2 → CO2 + 2H2O",
    [["methane"], ["oxygen", 2]],
    [["carbon_dioxide"], ["water", 2]],
    "combustion",
    { gas: "carbon dioxide", temperatureChange: "increase", lightProduced: true },
    { heatRequired: true },
    [11]
  ),

  makeReaction(
    "ethane_combustion",
    "Thermodynamics (Class 11)",
    "2C2H6 + 7O2 → 4CO2 + 6H2O",
    [["ethane", 2], ["oxygen", 7]],
    [["carbon_dioxide", 4], ["water", 6]],
    "combustion",
    { gas: "carbon dioxide", temperatureChange: "increase", lightProduced: true },
    { heatRequired: true },
    [11]
  ),

  makeReaction(
    "ethyne_combustion",
    "Thermodynamics (Class 11)",
    "2C2H2 + 5O2 → 4CO2 + 2H2O",
    [["ethyne", 2], ["oxygen", 5]],
    [["carbon_dioxide", 4], ["water", 2]],    
    "combustion",
    { gas: "carbon dioxide", temperatureChange: "increase", lightProduced: true },
    { heatRequired: true },
    [11]
  ),

  // ==================== CLASS 12: HALOALKANES & HALOARENES ====================
  makeReaction(
    "finkelstein_reaction",
    "Haloalkanes and Haloarenes (Class 12)",
    "C2H5Cl + NaI → C2H5I + NaCl",
    [["ethyl_chloride"], ["sodium_iodide"]],
    [["ethyl_iodide"], ["sodium_chloride"]],
    "named_reaction",
    { precipitate: "white sodium chloride precipitates in dry acetone" },
    { catalyst: "dry acetone" },
    [12]
  ),

  makeReaction(
    "swarts_reaction",
    "Haloalkanes and Haloarenes (Class 12)",
    "CH3Br + AgF → CH3F + AgBr",
    [["methyl_bromide"], ["silver_fluoride"]],
    [["methyl_fluoride"], ["silver_bromide"]],
    "named_reaction",
    { precipitate: "pale yellow silver bromide precipitates", gas: "fluoromethane gas" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "wurtz_fittig_reaction",
    "Haloalkanes and Haloarenes (Class 12)",
    "C6H5Cl + CH3Cl + 2Na → C6H5CH3 + 2NaCl",
    [["chlorobenzene"], ["methyl_chloride"], ["sodium", 2]],
    [["toluene"], ["sodium_chloride", 2]],
    "named_reaction",
    { colorChange: "toluene is formed with white sodium chloride", temperatureChange: "increase" },
    { catalyst: "dry ether" },
    [12]
  ),

  makeReaction(
    "fittig_reaction",
    "Haloalkanes and Haloarenes (Class 12)",
    "2C6H5Cl + 2Na → C12H10 + 2NaCl",
    [["chlorobenzene", 2], ["sodium", 2]],
    [["biphenyl"], ["sodium_chloride", 2]],
    "named_reaction",
    { precipitate: "crystalline biphenyl solid forms" },
    { catalyst: "dry ether" },
    [12]
  ),

  // ==================== CLASS 12: ALCOHOLS, PHENOLS & ETHERS ====================
  makeReaction(
    "williamson_ether_synthesis",
    "Alcohols, Phenols and Ethers (Class 12)",
    "C2H5ONa + C2H5Br → (C2H5)2O + NaBr",
    [["sodium_ethoxide"], ["ethyl_bromide"]],
    [["diethyl_ether"], ["sodium_bromide"]],
    "named_reaction",
    { colorChange: "clear sweet-smelling diethyl ether liquid forms" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "kolbe_reaction",
    "Alcohols, Phenols and Ethers (Class 12)",
    "C6H5OH + CO2 + 2NaOH → C7H6O3 + Na2CO3",
    [["phenol"], ["carbon_dioxide"], ["sodium_hydroxide", 2]],
    [["salicylic_acid"], ["sodium_carbonate"]],
    "named_reaction",
    { colorChange: "salicylic acid formed through phenoxide carboxylation" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "reimer_tiemann_reaction",
    "Alcohols, Phenols and Ethers (Class 12)",
    "C6H5OH + CHCl3 + 3NaOH → C7H6O2 + 3NaCl + 2H2O",
    [["phenol"], ["chloroform"], ["sodium_hydroxide", 3]],
    [["salicylaldehyde"], ["sodium_chloride", 3], ["water", 2]],
    "named_reaction",
    { colorChange: "yellowish salicylaldehyde forms with sweet fragrance" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "ethanol_dichromate_oxidation",
    "Alcohols, Phenols and Ethers (Class 12)",
    "3C2H5OH + 2K2Cr2O7 + 8H2SO4 → 3CH3COOH + 2Cr2(SO4)3 + 2K2SO4 + 11H2O",
    [["ethanol", 3], ["potassium_dichromate", 2], ["sulfuric_acid", 8]],
    [["ethanoic_acid", 3], ["chromium_sulfate", 2], ["potassium_sulfate", 2], ["water", 11]],
    "oxidation",
    { colorChange: "orange potassium dichromate turns deep chrome green (breathalyzer test)" },
    { heatRequired: true },
    [12]
  ),

  // ==================== CLASS 12: ALDEHYDES, KETONES & ACIDS ====================
  makeReaction(
    "aldol_condensation",
    "Aldehydes, Ketones and Carboxylic Acids (Class 12)",
    "2CH3CHO → C4H8O2",
    [["acetaldehyde", 2]],
    [["aldol_product"]],
    "aldol_condensation",
    { colorChange: "pale viscous 3-hydroxybutanal aldol liquid forms" },
    { catalyst: "dilute sodium hydroxide" },
    [12]
  ),

  makeReaction(
    "cannizzaro_reaction",
    "Aldehydes, Ketones and Carboxylic Acids (Class 12)",
    "2HCHO + NaOH → HCOONa + CH3OH",
    [["formaldehyde", 2], ["sodium_hydroxide"]],
    [["sodium_formate"], ["methanol"]],
    "named_reaction",
    { colorChange: "disproportionation yields methanol and sodium formate" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "tollens_test",
    "Aldehydes, Ketones and Carboxylic Acids (Class 12)",
    "CH3CHO + 2AgNO3 + 2NH4OH → 2Ag + CH3COOH + 2NH4NO3 + H2O",
    [["acetaldehyde"], ["silver_nitrate", 2], ["ammonium_hydroxide", 2]],
    [["silver_mirror", 2], ["ethanoic_acid"], ["water", 2]],
    "functional_group_test",
    { precipitate: "brilliant shining silver mirror deposits on glass walls", precipitateColor: "#c0c0c0" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "fehling_test",
    "Aldehydes, Ketones and Carboxylic Acids (Class 12)",
    "CH3CHO + 2CuSO4 + 4NaOH → Cu2O + CH3COOH + 2Na2SO4 + 2H2O",
    [["acetaldehyde"], ["copper_sulfate", 2], ["sodium_hydroxide", 4]],
    [["copper_i_oxide"], ["ethanoic_acid"], ["water", 2]],
    "functional_group_test",
    { precipitate: "dense brick-red precipitate of copper(I) oxide forms", precipitateColor: "#b71c1c" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "iodoform_test",
    "Aldehydes, Ketones and Carboxylic Acids (Class 12)",
    "CH3COCH3 + 3I2 + 4NaOH → CHI3 + CH3COONa + 3NaI + 3H2O",
    [["acetone"], ["iodine", 3], ["sodium_hydroxide", 4]],
    [["iodoform"], ["sodium_ethanoate"], ["water", 3]],
    "functional_group_test",
    { precipitate: "bright canary-yellow iodoform crystals with antiseptic smell", precipitateColor: "#fdd835" },
    { heatRequired: true },
    [12]
  ),

  // ==================== CLASS 12: AMINES ====================
  makeReaction(
    "carbylamine_test",
    "Amines (Class 12)",
    "C6H5NH2 + CHCl3 + 3KOH → C6H5NC + 3KCl + 3H2O",
    [["aniline"], ["chloroform"], ["potassium_hydroxide", 3]],
    [["phenyl_isocyanide"], ["potassium_chloride", 3], ["water", 3]],
    "functional_group_test",
    { colorChange: "extremely foul, pungent carbylamine odor detected" },
    { heatRequired: true },
    [12]
  ),

  makeReaction(
    "diazotisation",
    "Amines (Class 12)",
    "C6H5NH2 + NaNO2 + 2HCl → C6H5N2Cl + NaCl + 2H2O",
    [["aniline"], ["sodium_nitrite"], ["hydrochloric_acid", 2]],
    [["benzene_diazonium_chloride"], ["sodium_chloride"], ["water", 2]],
    "diazotisation",
    { colorChange: "diazonium salt solution forms at cold temperature" },
    { catalyst: "ice-cold temperature (0–5 °C)" },
    [12]
  ),

  makeReaction(
    "azo_dye_coupling",
    "Amines (Class 12)",
    "C6H5N2Cl + C10H7OH + NaOH → C16H12N2O + NaCl + H2O",
    [["benzene_diazonium_chloride"], ["two_naphthol"], ["sodium_hydroxide"]],
    [["orange_azo_dye"], ["sodium_chloride"], ["water"]],
    "azo_coupling",
    { precipitate: "vibrant scarlet-orange azo dye precipitate forms immediately", precipitateColor: "#ff6f00" },
    {},
    [12]
  ),

  // ==================== CLASS 12: COORDINATION COMPOUNDS ====================
  makeReaction(
    "prussian_blue_test",
    "Coordination Compounds (Class 12)",
    "4FeCl3 + 3K4[Fe(CN)6] → Fe4[Fe(CN)6]3 + 12KCl",
    [["iron_chloride", 4], ["potassium_ferrocyanide", 3]],
    [["prussian_blue"], ["potassium_chloride", 12]],
    "complex_formation",
    { precipitate: "intense midnight-blue Prussian Blue precipitate forms instantly", precipitateColor: "#0d2b45" },
    {},
    [12]
  ),

  makeReaction(
    "blood_red_thiocyanate_test",
    "Coordination Compounds (Class 12)",
    "FeCl3 + 3KSCN → Fe(SCN)3 + 3KCl",
    [["iron_chloride"], ["potassium_thiocyanate", 3]],
    [["iron_thiocyanate"], ["potassium_chloride", 3]],
    "complex_formation",
    { colorChange: "dramatic blood-red ferric thiocyanate complex forms" },
    {},
    [12]
  ),

  makeReaction(
    "copper_tetraammine_complex",
    "Coordination Compounds (Class 12)",
    "CuSO4 + 4NH4OH → [Cu(NH3)4]SO4 + 4H2O",
    [["copper_sulfate"], ["ammonium_hydroxide", 4]],
    [["copper_tetraammine_sulfate"], ["water", 4]],
    "complex_formation",
    { colorChange: "solution transforms into deep royal azure blue tetraammine complex" },
    {},
    [12]
  ),

  makeReaction(
    "nickel_dmg_test",
    "Coordination Compounds (Class 12)",
    "NiCl2 + 2C4H8N2O2 + 2NH4OH → Ni(C4H7N2O2)2 + 2NH4Cl + 2H2O",
    [["nickel_chloride"], ["dimethylglyoxime", 2], ["ammonium_hydroxide", 2]],
    [["nickel_dmg_complex"], ["water", 2]],
    "complex_formation",
    { precipitate: "brilliant rosy scarlet precipitate of nickel DMG forms", precipitateColor: "#b71c1c" },
    {},
    [12]
  ),
];
