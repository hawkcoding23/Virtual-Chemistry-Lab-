const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const router = express.Router();
const quizDirectory = path.join(__dirname, "../data/quizzes");
const classFiles = [
  { classLevel: 9, file: "class9.json" },
  { classLevel: 10, file: "class10.json" },
  { classLevel: 11, file: "class11.json" },
  { classLevel: 12, file: "class12.json" },
];
const QUESTION_BANK_SIZE = 200;
const QUESTION_VARIANTS = [
  (question) => question,
  (question) => `Quick recall: ${question}`,
  (question) => `In chemistry, ${question.charAt(0).toLowerCase()}${question.slice(1)}`,
  (question) => `Select the correct response: ${question}`,
];

function expandQuestionBank(seedQuestions, classLevel) {
  if (!seedQuestions.length) return [];
  return Array.from({ length: QUESTION_BANK_SIZE }, (_, index) => {
    const seedIndex = index % seedQuestions.length;
    const variantIndex = Math.floor(index / seedQuestions.length) % QUESTION_VARIANTS.length;
    const question = seedQuestions[seedIndex];
    return {
      ...question,
      id: `${classLevel}-${seedIndex + 1}-${variantIndex + 1}`,
      sourceQuestionId: question.id ?? `${classLevel}-seed-${seedIndex + 1}`,
      classLevel,
      question: QUESTION_VARIANTS[variantIndex](question.question),
    };
  });
}

function readClassQuestionBank(classLevel) {
  const entry = classFiles.find((item) => item.classLevel === classLevel);
  if (!entry) return [];
  const questions = JSON.parse(fs.readFileSync(path.join(quizDirectory, entry.file), "utf8"));
  if (!Array.isArray(questions)) throw new Error(`${entry.file} must contain a JSON array`);
  return expandQuestionBank(questions, classLevel);
}

function readQuestionBank(classLevel = null) {
  return classFiles.filter((entry) => classLevel == null || entry.classLevel === classLevel)
    .flatMap(({ classLevel: level }) => {
      return readClassQuestionBank(level);
    });
}

function sampleWithoutReplacement(items, count) {
  // Keep alternate phrasings of a seed question from appearing together in
  // the same round; every quiz should test distinct source questions.
  const unique = new Map();
  items.forEach((item) => {
    const key = item.sourceQuestionId ?? item.id;
    const current = unique.get(key) ?? [];
    current.push(item);
    unique.set(key, current);
  });
  const pool = [...unique.values()].map((variants) => variants[Math.floor(Math.random() * variants.length)]);
  for (let index = pool.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool.slice(0, count).map((question) => {
    const options = question.options.map((label, index) => ({ label, correct: index === question.answer }));
    for (let index = options.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [options[index], options[swapIndex]] = [options[swapIndex], options[index]];
    }
    return { ...question, options: options.map((option) => option.label), answer: options.findIndex((option) => option.correct) };
  });
}

router.get("/", (_req, res) => {
  try {
    const classes = classFiles.map(({ classLevel }) => ({
      classLevel,
      questionCount: readClassQuestionBank(classLevel).length,
    }));
    return res.json({ success: true, questionCount: classes.reduce((sum, item) => sum + item.questionCount, 0), classes });
  } catch (error) {
    console.error("Quiz bank error:", error);
    return res.status(500).json({ success: false, message: "Could not load the chemistry quiz bank." });
  }
});

router.get("/random", (req, res) => {
  const count = Number.parseInt(req.query.count ?? "10", 10);
  const classLevel = req.query.classLevel == null ? null : Number.parseInt(req.query.classLevel, 10);
  if (!Number.isInteger(count) || count < 1 || count > 20) {
    return res.status(400).json({ success: false, message: "count must be between 1 and 20." });
  }
  if (classLevel != null && !classFiles.some((entry) => entry.classLevel === classLevel)) {
    return res.status(400).json({ success: false, message: "classLevel must be 9, 10, 11, or 12." });
  }

  try {
    const bank = readQuestionBank(classLevel);
    if (bank.length < count) {
      return res.status(503).json({ success: false, message: "The quiz bank has fewer questions than requested." });
    }
    return res.json({ success: true, questionCount: bank.length, classLevel, questions: sampleWithoutReplacement(bank, count) });
  } catch (error) {
    console.error("Quiz request error:", error);
    return res.status(500).json({ success: false, message: "Could not load quiz questions." });
  }
});

module.exports = router;
