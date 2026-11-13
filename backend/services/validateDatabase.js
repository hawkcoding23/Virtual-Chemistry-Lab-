const fs = require("fs");
const path = require("path");

const chemicalsDirectory = path.join(
  __dirname,
  "../data/chemicals"
);

const reactionsDirectory = path.join(
  __dirname,
  "../data/reactions"
);

function loadJSON(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error(
      `❌ Could not read ${path.basename(filePath)}:`,
      error.message
    );

    return [];
  }
}

function findJsonFiles(directory) {
  let files = [];
  if (!fs.existsSync(directory)) return files;

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
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".json")
    ) {
      files.push(fullPath);
    }
  });

  return files;
}

function normalizeEquation(equation) {
  return String(equation || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/→/g, "->")
    .replace(/=/g, "->");
}

function validateDatabase() {
  console.log("");
  console.log("🔍 Validating Chemistry World database...");

  const chemicalFiles = findJsonFiles(chemicalsDirectory);
  const chemicals = chemicalFiles.flatMap((file) => loadJSON(file));

  const chemicalIds = new Set();
  const duplicateChemicalIds = new Set();

  chemicals.forEach((chemical) => {
    if (!chemical?.id) return;

    if (chemicalIds.has(chemical.id)) {
      duplicateChemicalIds.add(chemical.id);
    }

    chemicalIds.add(chemical.id);
  });

  const reactionFiles =
    findJsonFiles(reactionsDirectory).sort();

  const missingChemicals = new Set();

  const reactionIds = new Map();
  const duplicateReactionIds = new Set();

  const equationMap = new Map();

  const invalidReactions = [];

  let reactionCount = 0;

  reactionFiles.forEach((file) => {

  const filePath = file;

  const displayFile = path.relative(
    reactionsDirectory,
    filePath
  );

  const reactions = loadJSON(filePath);

  if (!Array.isArray(reactions)) {
    
      console.log(
        `⚠️ ${file} does not contain a reaction array.`
      );

      return;
    }

    reactions.forEach((reaction, index) => {
      reactionCount++;

      const location = `${file} [${index}]`;

      // ----------------------------------
      // BASIC STRUCTURE CHECK
      // ----------------------------------

      if (
        !reaction ||
        !reaction.id ||
        !Array.isArray(reaction.reactants) ||
        !Array.isArray(reaction.products) ||
        !reaction.equation
      ) {
        invalidReactions.push({
          id: reaction?.id || "UNKNOWN",
          location
        });

        return;
      }

      // ----------------------------------
      // DUPLICATE REACTION ID CHECK
      // ----------------------------------

      if (reactionIds.has(reaction.id)) {
        duplicateReactionIds.add(reaction.id);
      } else {
        reactionIds.set(
          reaction.id,
          location
        );
      }

      // ----------------------------------
      // CHEMICAL REGISTRY CHECK
      // ----------------------------------

      const allChemicals = [
        ...reaction.reactants,
        ...reaction.products
      ];

      allChemicals.forEach((entry) => {
        const chemicalId = entry?.chemicalId;

        if (!chemicalId) {
          return;
        }

        if (!chemicalIds.has(chemicalId)) {
          missingChemicals.add(chemicalId);
        }
      });

      // ----------------------------------
      // DUPLICATE EQUATION CHECK
      // ----------------------------------

      const normalizedEquation =
        normalizeEquation(reaction.equation);

      if (!equationMap.has(normalizedEquation)) {
        equationMap.set(
          normalizedEquation,
          []
        );
      }

      equationMap
        .get(normalizedEquation)
        .push({
          id: reaction.id,
          equation: reaction.equation,
          file: displayFile
        });
    });
  });

  const duplicateEquations =
    [...equationMap.values()].filter(
      (entries) => entries.length > 1
    );

  // ======================================
  // SUMMARY
  // ======================================

  console.log(
    `🧪 Chemicals registered: ${chemicalIds.size}`
  );

  console.log(
    `⚗️ Reaction entries registered: ${reactionCount}`
  );

  // ======================================
  // MISSING CHEMICALS
  // ======================================

  if (missingChemicals.size > 0) {
    console.log("");
    console.log("⚠️ MISSING CHEMICALS:");

    [...missingChemicals]
      .sort()
      .forEach((id) => {
        console.log(`   → ${id}`);
      });
  } else {
    console.log(
      "✅ All reaction chemicals exist."
    );
  }

  // ======================================
  // DUPLICATE CHEMICAL IDS
  // ======================================

  if (duplicateChemicalIds.size > 0) {
    console.log("");
    console.log(
      "⚠️ DUPLICATE CHEMICAL IDs:"
    );

    [...duplicateChemicalIds]
      .sort()
      .forEach((id) => {
        console.log(`   → ${id}`);
      });
  } else {
    console.log(
      "✅ No duplicate chemical IDs."
    );
  }

  // ======================================
  // DUPLICATE REACTION IDS
  // ======================================

  if (duplicateReactionIds.size > 0) {
    console.log("");
    console.log(
      "⚠️ DUPLICATE REACTION IDs:"
    );

    [...duplicateReactionIds]
      .sort()
      .forEach((id) => {
        console.log(`   → ${id}`);
      });
  } else {
    console.log(
      "✅ No duplicate reaction IDs."
    );
  }

  // ======================================
  // DUPLICATE EQUATIONS
  // ======================================

  if (duplicateEquations.length > 0) {
    console.log("");
    console.log(
      "⚠️ DUPLICATE CHEMICAL EQUATIONS:"
    );

    duplicateEquations.forEach(
      (entries, index) => {
        console.log("");
        console.log(
          `   ${index + 1}. ${entries[0].equation}`
        );

        entries.forEach((entry) => {
          console.log(
            `      → ${entry.id} (${entry.file})`
          );
        });
      }
    );
  } else {
    console.log(
      "✅ No duplicate chemical equations."
    );
  }

  // ======================================
  // INVALID REACTIONS
  // ======================================

  if (invalidReactions.length > 0) {
    console.log("");
    console.log(
      "⚠️ INVALID REACTION ENTRIES:"
    );

    invalidReactions.forEach((entry) => {
      console.log(
        `   → ${entry.id} at ${entry.location}`
      );
    });
  } else {
    console.log(
      "✅ All reaction structures valid."
    );
  }

  console.log("");
  console.log(
    "🔍 Database validation complete."
  );
  console.log("");

  return {
    chemicalCount: chemicalIds.size,
    reactionCount,

    missingChemicals:
      [...missingChemicals],

    duplicateChemicalIds:
      [...duplicateChemicalIds],

    duplicateReactionIds:
      [...duplicateReactionIds],

    duplicateEquations,

    invalidReactions
  };
}

module.exports = {
  validateDatabase
};