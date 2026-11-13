const OBSERVED_COLORS = {
  aluminium: "#aeb9c1",
  aluminium_oxide: "#e4e3dc",
  barium_sulfate: "#f1efe7",
  bromine: "#943d29",
  carbon: "#292c31",
  carbon_dioxide: "#d4e0e5",
  chlorine: "#bcc958",
  copper: "#b66c43",
  copper_chloride: "#4ca695",
  copper_oxide: "#202226",
  copper_sulfate: "#328fc6",
  iron: "#70767c",
  iron_ii_sulfate: "#91ad7d",
  iron_oxide_fe2o3: "#8b3f27",
  iron_oxide_fe3o4: "#28252a",
  lead_iodide: "#e2c534",
  magnesium: "#c3ccd2",
  manganese_dioxide: "#39343a",
  nitrogen_dioxide: "#9a5733",
  oxygen: "#b8d8e9",
  potassium_permanganate: "#6a1b9a",
  potassium_dichromate: "#e65100",
  chromium_sulfate: "#2e7d32",
  prussian_blue: "#0d2b45",
  iron_thiocyanate: "#880e4f",
  copper_tetraammine_sulfate: "#1565c0",
  nickel_dmg_complex: "#b71c1c",
  iodoform: "#fdd835",
  copper_i_oxide: "#b71c1c",
  orange_azo_dye: "#ff6f00",
  silver_mirror: "#c0c0c0",
  nickel_chloride: "#43a047",
  silver_chloride: "#eeede5",
  sulfur: "#e5c83c",
  zinc: "#929da4",
  zinc_oxide: "#e6e3d9",
};

const PALETTES = {
  acid: ["#e88f83", "#dc9f76", "#d17c75", "#e7b07e"],
  base: ["#73b6d1", "#7fc2ad", "#83a9d2", "#6da6bf"],
  salt: ["#d8bd62", "#86b5ca", "#bf9ac9", "#91b986", "#df9d77", "#7ebcb6"],
  indicator: ["#e86e9c", "#bc73d0", "#e2a140", "#5d9bd3", "#77bd74"],
  element: ["#b8c2c9", "#9aabb7", "#d2a252", "#88a9c5", "#9e9386"],
  oxide: ["#a65c42", "#555a60", "#c5ad6b", "#93624f"],
  organic: ["#5da982", "#d1b66a", "#7bb8ad", "#b88466"],
  gas: ["#9dceda", "#c9d9df", "#dfc781", "#b3c8d2"],
  other: ["#88b8c5", "#b39bc9", "#83b38e", "#d0a565"],
};

function visualGroup(chemical) {
  const type = String(chemical?.sourceCategory ?? chemical?.category ?? "").toLowerCase();
  if (type.includes("acid")) return "acid";
  if (type.includes("base") || type.includes("hydroxide")) return "base";
  if (type.includes("oxide")) return "oxide";
  if (type.includes("indicator")) return "indicator";
  if (["alkali_metal", "alkaline_earth_metal", "transition_metal", "post_transition_metal", "metalloid", "nonmetal", "halogen", "noble_gas", "lanthanide", "actinide", "element"].some((key) => type.includes(key))) return "element";
  if (["organic", "alcohol", "hydrocarbon", "ester"].some((key) => type.includes(key))) return "organic";
  if (type.includes("gas") || chemical?.state === "gas") return "gas";
  if (type.includes("salt")) return "salt";
  return "other";
}

export function getChemicalColor(chemical = {}) {
  const id = String(chemical.id ?? "").toLowerCase();
  if (OBSERVED_COLORS[id]) return OBSERVED_COLORS[id];

  const palette = PALETTES[visualGroup(chemical)];
  let hash = 0;
  for (const character of id || chemical.name || "sample") hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  return palette[hash % palette.length];
}

export function getReactionColor(reaction) {
  const change = String(reaction?.observations?.colorChange ?? "").toLowerCase();
  const precipitate = String(reaction?.observations?.precipitate ?? "").toLowerCase();
  const observation = `${change} ${precipitate}`;
  if (precipitate.includes("yellow") || change.includes("yellow")) return "#e2c534";
  if (reaction?.id?.includes("thermite")) return "#f28c32";
  if (change.includes("toward green") || change.includes("blue-green") || change.includes("blue green")) return "#4b9c69";
  if (change.includes("decreases") || change.includes("clears")) return "#dce8e7";
  if (change.includes("deposited") || change.includes("displaced")) {
    const depositedMetal = reaction?.outcome?.products?.find((item) => ["copper", "silver", "iron"].includes(item.id));
    if (depositedMetal?.chemical) return depositedMetal.chemical.color || getChemicalColor(depositedMetal.chemical);
  }
  if (change.includes("brown") || change.includes("reddish")) return "#8b3f27";
  if (change.includes("black") || change.includes("dark")) return "#292c31";
  if (observation.includes("white") || observation.includes("milky")) return "#e4e3dc";
  if (change.includes("blue")) return "#328fc6";
  if (change.includes("green")) return "#4b9c69";
  if (reaction?.observations?.lightProduced && !reaction?.id?.includes("magnesium")) return "#f2a144";
  const firstProduct = reaction?.outcome?.products?.find((product) => product.chemical?.id !== "water" && product.chemical?.state !== "gas");
  if (firstProduct?.chemical) return firstProduct.chemical.color || getChemicalColor(firstProduct.chemical);
  const firstSample = reaction?.samples?.[0];
  return firstSample?.color || getChemicalColor(firstSample);
}
