const express = require("express");
const { findReaction, getAllReactions, getReactionStats } = require("../services/reactionEngine");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Chemistry World Reaction API",
    ...getReactionStats(),
  });
});

router.get("/catalogue", (req, res) => {
  const classLevel = req.query.classLevel == null ? null : Number.parseInt(req.query.classLevel, 10);
  if (classLevel != null && ![9, 10, 11, 12].includes(classLevel)) {
    return res.status(400).json({ success: false, message: "classLevel must be 9, 10, 11, or 12." });
  }
  const reactions = getAllReactions(classLevel);
  return res.json({ success: true, classLevel, reactionCount: reactions.length, reactions });
});

router.post("/react", (req, res) => {
  try {
    const { chemicals } = req.body;

    if (!Array.isArray(chemicals)) {
      return res.status(400).json({
        success: false,
        message: "chemicals must be an array."
      });
    }

    if (chemicals.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "Select exactly two chemicals for this prototype."
      });
    }

    const reaction = findReaction(chemicals);

    if (!reaction) {
      return res.json({
        success: false,
        reactionFound: false,
        message: "No supported NCERT reaction found."
      });
    }

    return res.json({
      success: true,
      reactionFound: true,
      reaction
    });

  } catch (error) {
    console.error("Reaction engine error:", error);

    return res.status(500).json({
      success: false,
      message: "Reaction engine error."
    });
  }
});

module.exports = router;
