import chemicalAdditions from "./ncertChemicalAdditions.json";
import reactionCatalogue from "../../backend/data/reactionCatalogue.json";
import class9CurrentReactions from "../../backend/data/reactions/class9_current_ncert.json";
import { NCERT_SUPPLEMENTARY_REACTIONS } from "./ncertSupplementaryReactions";
import { CLASS_11_12_REACTIONS } from "./class11_12_Reactions";
import { ENTRANCE_REACTION_ADDITIONS } from "./entranceReactionAdditions";
import { getChemicalColor } from "./chemicalVisuals";

// The exhibition build runs entirely in the browser. Keep its small, curated
// Class 9–12 reference data bundled locally so a backend or internet connection
// is not needed at school.
const chemicalFiles = import.meta.glob("../../backend/data/chemicals/*.json", {
  eager: true,
  import: "default",
});

const asArray = (value) => Array.isArray(value) ? value : value?.reactions ?? [];
const idOf = (item) => (typeof item === "string" ? item : item?.chemicalId ?? "").toLowerCase();
const DIATOMIC_GASES = new Set(["hydrogen", "nitrogen", "oxygen", "fluorine", "chlorine", "bromine", "iodine"]);

function displayFormula(chemical) {
  if (!DIATOMIC_GASES.has(chemical.id) || /[2₂]$/.test(chemical.formula ?? "")) return chemical.formula;
  return `${chemical.formula ?? chemical.symbol}₂`;
}

function shelfCategory(chemical) {
  const source = String(chemical.category ?? "").toLowerCase();
  if (source.includes("oxide")) return "Oxides";
  if (source === "acid" || source.endsWith("_acid")) return "Acids";
  if (source.includes("base") || source.includes("hydroxide")) return "Bases";
  if (source.includes("salt")) return "Salts";
  if (source.includes("indicator")) return "Indicators";
  if (["hydrocarbon", "alcohol", "ester", "organic"].some((kind) => source.includes(kind))) return "Organics";
  if (["metal", "nonmetal", "metalloid", "halogen", "noble_gas", "element"].some((kind) => source.includes(kind))) return "Elements";
  if (chemical.state === "gas") return "Gases";
  return "Salts";
}

const entranceReactionIds = new Set(CLASS_11_12_REACTIONS.map((reaction) => reaction.id));
const storedReactions = [...reactionCatalogue, ...class9CurrentReactions, ...NCERT_SUPPLEMENTARY_REACTIONS,
  ...ENTRANCE_REACTION_ADDITIONS]
  .filter((reaction) => reaction?.id && reaction?.equation
    && Array.isArray(reaction.reactants) && reaction.reactants.length
    && Array.isArray(reaction.products) && reaction.products.length)
  // The entrance-track catalogue has curated grade and chapter metadata. Add
  // that tag to the matching records already bundled in the larger catalogue.
  .map((reaction) => {
    const tagged = entranceReactionIds.has(reaction.id)
      ? { ...reaction, tracks: ["jee", "neet"] }
      : reaction;
    if (reaction.id !== "sodium_water") return tagged;
    return {
      ...tagged,
      hazardWarning: "This is a vigorous, exothermic reaction that releases hydrogen. Heat can ignite hydrogen or sodium, so fires or an explosion are possible in some conditions, but an explosion is not a guaranteed outcome. This virtual model shows gas and heat without depicting a predictable blast.",
      gameEffect: { ...tagged.gameEffect, rapidGasRelease: true },
    };
  });
const registeredChemicalIds = new Set([
  ...Object.values(chemicalFiles).flatMap(asArray).map((chemical) => String(chemical?.id ?? "").toLowerCase()),
  ...chemicalAdditions.map((chemical) => String(chemical?.id ?? "").toLowerCase()),
]);
const reactionsById = new Map();
[...storedReactions]
  .filter((reaction) => [...(reaction.reactants ?? []), ...(reaction.products ?? [])]
    .every((item) => registeredChemicalIds.has(idOf(item))))
  .forEach((reaction) => {
  if (reaction?.id && !reactionsById.has(reaction.id)) reactionsById.set(reaction.id, reaction);
  });
export const NCERT_REACTIONS = [...reactionsById.values()];
const additionsById = Object.fromEntries(chemicalAdditions.map((item) => [item.id, item]));

export async function loadChemicals({ includeAll = false } = {}) {
  const needed = new Set();
  for (const reaction of NCERT_REACTIONS) {
    [...(reaction.reactants ?? []), ...(reaction.products ?? [])].forEach((item) => {
      const id = idOf(item);
      if (id) needed.add(id);
    });
  }
  // Ensure all curated chemicals are placed on the shelves
  chemicalAdditions.forEach((chem) => {
    if (chem.id) needed.add(chem.id.toLowerCase());
  });

  const byId = new Map();
  Object.values(chemicalFiles).flatMap(asArray).forEach((chemical) => {
    const id = String(chemical.id ?? "").toLowerCase();
    if (!includeAll && !needed.has(id)) return;
    byId.set(id, {
      ...chemical,
      id,
      formula: displayFormula({ ...chemical, id }),
      sourceCategory: chemical.category,
      category: shelfCategory(chemical),
      color: chemical.color ?? additionsById[id]?.color ?? getChemicalColor({ ...chemical, id }),
    });
  });

  chemicalAdditions.forEach((chemical) => {
    if (includeAll || needed.has(chemical.id)) byId.set(chemical.id, {
      ...chemical,
      formula: displayFormula(chemical),
      sourceCategory: chemical.category,
      category: shelfCategory(chemical),
    });
  });

  return Object.fromEntries(byId);
}

export const REACTION_PARTNERS = NCERT_REACTIONS.reduce((partners, reaction) => {
  const ids = (reaction.reactants ?? []).map(idOf).filter(Boolean);
  ids.forEach((id) => {
    partners[id] = [...new Set([...(partners[id] ?? []), ...ids.filter((other) => other !== id)])];
  });
  return partners;
}, {});
