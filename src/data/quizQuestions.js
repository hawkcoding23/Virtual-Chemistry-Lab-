import class9Seeds from "../../backend/data/quizzes/class9.json";
import class10Seeds from "../../backend/data/quizzes/class10.json";
import class11Seeds from "../../backend/data/quizzes/class11.json";
import class12Seeds from "../../backend/data/quizzes/class12.json";

const BANK_SIZE = 200;
const questionVariants = [
  (question) => question,
  (question) => `Quick recall: ${question}`,
  (question) => `In chemistry, ${question.charAt(0).toLowerCase()}${question.slice(1)}`,
  (question) => `Select the correct response: ${question}`,
];

function expandBank(seeds, classLevel) {
  if (!seeds.length) return [];
  return Array.from({ length: BANK_SIZE }, (_, index) => {
    const seedIndex = index % seeds.length;
    const variantIndex = Math.floor(index / seeds.length) % questionVariants.length;
    const question = seeds[seedIndex];
    return {
      ...question,
      id: `${classLevel}-${seedIndex + 1}-${variantIndex + 1}`,
      sourceQuestionId: question.id ?? `${classLevel}-seed-${seedIndex + 1}`,
      classLevel,
      question: questionVariants[variantIndex](question.question),
    };
  });
}

export const QUIZ_QUESTION_BANKS = {
  9: expandBank(class9Seeds, 9),
  10: expandBank(class10Seeds, 10),
  11: expandBank(class11Seeds, 11),
  12: expandBank(class12Seeds, 12),
};

export const QUIZ_QUESTIONS = Object.values(QUIZ_QUESTION_BANKS).flat();

function sampleWithoutReplacement(items, count) {
  // Alternate wording stays useful in the 200-entry bank, but each round
  // samples at most one wording of a given source question.
  const unique = new Map();
  items.forEach((item) => {
    const key = item.sourceQuestionId ?? item.id;
    const variants = unique.get(key) ?? [];
    variants.push(item);
    unique.set(key, variants);
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

export async function loadRandomQuizQuestions(count = 10, { signal, classLevel = 9 } = {}) {
  try {
    const params = new URLSearchParams({ count: String(count), classLevel: String(classLevel) });
    const response = await fetch(`http://localhost:5000/api/quizzes/random?${params}`, { signal });
    if (!response.ok) throw new Error("Quiz service is unavailable");
    const result = await response.json();
    if (!result.success || !Array.isArray(result.questions) || result.questions.length !== count) {
      throw new Error("The quiz service returned an incomplete quiz");
    }
    return result.questions;
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return sampleWithoutReplacement(QUIZ_QUESTION_BANKS[classLevel] ?? [], count);
  }
}
