const fs = require("fs");
const path = require("path");

const reactionCataloguePath = path.join(__dirname, "../data/reactionCatalogue.json");
const chemicalsRoot = path.join(__dirname, "../data/chemicals");

let reactions = [];
let knownChemicalIds = new Set();

// ==========================================
// FIND EVERY JSON FILE RECURSIVELY
// ==========================================

function findJsonFiles(directory) {
  let files = [];

  if (!fs.existsSync(directory)) {
    console.error(
      `❌ Reaction directory not found: ${directory}`
    );
    return files;
  }

  const entries = fs.readdirSync(directory, {
    withFileTypes: true
  });

  entries.forEach((entry) => {
    const fullPath = path.join(
      directory,
      entry.name
    );

    if (entry.isDirectory()) {
      files = files.concat(
        findJsonFiles(fullPath)
      );
    }

    else if (
      entry.isFile() &&
      entry.name.endsWith(".json")
    ) {
      files.push(fullPath);
    }
  });

  return files;
}

// ==========================================
// LOAD DATABASE
// ==========================================

function loadReactions() {
  reactions = [];

  knownChemicalIds = new Set();
  findJsonFiles(chemicalsRoot).forEach((filePath) => {
    try {
      const entries = JSON.parse(fs.readFileSync(filePath, "utf8"));
      if (Array.isArray(entries)) entries.forEach((chemical) => {
        if (chemical?.id) knownChemicalIds.add(String(chemical.id).toLowerCase());
      });
    } catch (error) {
      console.warn(`Skipped chemical registry file ${path.basename(filePath)}: ${error.message}`);
    }
  });

  console.log("");
  console.log("📚 Loading reaction database...");
  try {
    const data = JSON.parse(fs.readFileSync(reactionCataloguePath, "utf8"));
    if (!Array.isArray(data)) throw new Error("reactionCatalogue.json must contain an array");
    reactions = data.filter((reaction) => reaction?.id && reaction?.equation
      && Array.isArray(reaction.reactants) && reaction.reactants.length > 0
      && Array.isArray(reaction.products) && reaction.products.length > 0
      && reaction.reactants.every((reactant) => {
        const id = typeof reactant === "string" ? reactant : reactant?.chemicalId;
        return id && knownChemicalIds.has(String(id).toLowerCase());
      }));
    console.log(`   ✓ reactionCatalogue.json (${reactions.length} selectable reactions)`);
  } catch (error) {
    console.error(`❌ Error loading reaction catalogue: ${error.message}`);
    reactions = [];
  }

  console.log("");
  console.log(
    `⚗️ Loaded ${reactions.length} reactions.`
  );

  return reactions;
}

// ==========================================
// NORMALIZE INPUT
// ==========================================

function normalizeChemicalIds(ids) {
  return [...ids]
    .map((id) =>
      String(id)
        .trim()
        .toLowerCase()
    )
    .sort();
}

// ==========================================
// CREATE REACTION KEY
// ==========================================

function createReactionKey(reactants) {
  return normalizeChemicalIds(
    reactants.map((reactant) => typeof reactant === "string" ? reactant : reactant.chemicalId)
  ).join("|");
}

// ==========================================
// BUILD LOOKUP INDEX
// ==========================================

let reactionIndex = new Map();

function buildReactionIndex() {
  reactionIndex = new Map();

  reactions.forEach((reaction) => {
    if (!Array.isArray(reaction.reactants)) {
      return;
    }

    const key = createReactionKey(
      reaction.reactants
    );

    if (!reactionIndex.has(key)) {
      reactionIndex.set(key, []);
    }

    reactionIndex
      .get(key)
      .push(reaction);
  });

  console.log(
    `🧠 Reaction lookup index: ${reactionIndex.size} combinations`
  );
}

// ==========================================
// FIND REACTION
// ==========================================

function findReaction(chemicalIds) {
  if (
    !Array.isArray(chemicalIds) ||
    chemicalIds.length === 0
  ) {
    return null;
  }

  const key = normalizeChemicalIds(
    chemicalIds
  ).join("|");

  const matches =
    reactionIndex.get(key);

  if (!matches || matches.length === 0) {
    return null;
  }

  // For now return first matching reaction.
  // Later conditions can choose between
  // multiple reactions with same reactants.
  return matches[0];
}

// ==========================================
// FIND ALL POSSIBLE REACTIONS
// ==========================================

function findAllReactions(chemicalIds) {
  if (
    !Array.isArray(chemicalIds) ||
    chemicalIds.length === 0
  ) {
    return [];
  }

  const key = normalizeChemicalIds(
    chemicalIds
  ).join("|");

  return reactionIndex.get(key) || [];
}

// ==========================================
// DATABASE STATS
// ==========================================

function getReactionStats() {
  return {
    totalReactions: reactions.length,
    indexedCombinations:
      reactionIndex.size,
    filesLoaded: 1
  };
}

function getAllReactions(classLevel = null) {
  return reactions.filter((reaction) => classLevel == null
    || (Array.isArray(reaction.classes) && reaction.classes.includes(Number(classLevel))));
}

// ==========================================
// INITIALIZE
// ==========================================

loadReactions();
buildReactionIndex();

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  findReaction,
  findAllReactions,
  getAllReactions,
  getReactionStats,
  loadReactions,
  buildReactionIndex
};
