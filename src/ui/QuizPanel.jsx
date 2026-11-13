import { useEffect, useState } from "react";
import { loadRandomQuizQuestions } from "../data/quizQuestions";
import soundManager from "../utils/soundManager";
import { loadHindiQuestions } from "../data/quizHindi";
import { localizeScienceHindi, useLanguage } from "../i18n";

const QUIZ_LENGTH = 10;

export default function QuizPanel({ onClose, initialClassLevel = 9 }) {
  const { language, t } = useLanguage();
  const [classLevel, setClassLevel] = useState(initialClassLevel);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [round, setRound] = useState(0);
  const question = questions[questionIndex];
  const shownQuestion = question && language === "hi" ? {
    ...question,
    question: localizeScienceHindi(question.question),
    options: question.options.map(localizeScienceHindi),
    explanation: localizeScienceHindi(question.explanation),
    topic: localizeScienceHindi(question.topic),
  } : question;

  const handleSelectOption = (index) => {
    if (choice !== null) return;
    setChoice(index);
    if (index === question?.answer) {
      soundManager.playCorrectSound();
    } else soundManager.playIncorrectSound();
  };

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    (language === "hi"
      ? Promise.resolve(loadHindiQuestions(classLevel, QUIZ_LENGTH))
      : loadRandomQuizQuestions(QUIZ_LENGTH, { signal: controller.signal, classLevel })).then((loadedQuestions) => {
      setQuestions(loadedQuestions);
      setLoading(false);
    }).catch((error) => {
      if (error.name !== "AbortError") setLoading(false);
    });
    return () => controller.abort();
  }, [round, classLevel, language]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const submitAnswer = () => {
    if (choice === null) return;
    if (choice === question.answer) setScore((current) => current + 1);
    if (questionIndex === questions.length - 1) setFinished(true);
    else {
      setQuestionIndex((current) => current + 1);
      setChoice(null);
    }
  };

  const restartQuiz = () => {
    setQuestionIndex(0);  
    setChoice(null);
    setScore(0);
    setFinished(false);
    setRound((current) => current + 1);
  };

  return <div className="quiz-backdrop" onMouseDown={(event) => {
    if (event.target === event.currentTarget) onClose();
  }}>
    <section className="quiz-panel" role="dialog" aria-modal="true" aria-labelledby="quiz-title">
      <button className="quiz-close" onClick={onClose} aria-label={t("Close quiz")}>×</button>
      <span className="eyebrow">{t("VIRTUAL LAB · CLASSES 9–12")}</span>
      <h2 id="quiz-title">{t("Chemistry quiz")}</h2>
      <p className="quiz-intro">{t("Choose your class. Each round draws ten random questions from its chemistry bank.")}</p>
      <label className="quiz-class-label">{t("Choose class")}
        <select className="quiz-class-select" value={classLevel} onChange={(event) => {
          setClassLevel(Number(event.target.value));
          setQuestionIndex(0);
          setChoice(null);
          setScore(0);
          setFinished(false);
        }}>
          {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)}</option>)}
        </select>
      </label>
      {loading ? <p className="quiz-loading" role="status">{t("Loading ten questions for Class")} {classLevel}…</p> : finished ? <div className="quiz-results">
        <div className="quiz-score">{score}<span> / {QUIZ_LENGTH}</span></div>
        <h3>{t(score === QUIZ_LENGTH ? "Perfect score!" : score >= 3 ? "Nice work!" : "Keep exploring!")}</h3>
        <p>{t(score >= 3 ? "You’ve got a good handle on these chemistry ideas." : "Review the explanations, then try another round.")}</p>
        <div className="quiz-result-actions"><button className="quiz-primary" onClick={restartQuiz}>{t("Try another quiz")}</button><button className="quiz-secondary" onClick={onClose}>{t("Back to the lab")}</button></div>
      </div> : question ? <>
        <div className="quiz-progress-row"><span>{t(`CLASS ${classLevel}`)} · {shownQuestion.topic}</span><span>{t(`Question ${questionIndex + 1} of ${questions.length}`)}</span></div>
        <div className="quiz-progress-track"><span style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>
        <h3 className="quiz-question">{shownQuestion.question}</h3>
        <div className="quiz-options">
          {shownQuestion.options.map((option, index) => <button key={option}
            className={`quiz-option ${choice === index ? "selected" : ""} ${choice !== null && index === question.answer ? "correct" : ""} ${choice === index && choice !== question.answer ? "incorrect" : ""}`}
            onClick={() => handleSelectOption(index)} disabled={choice !== null}>
            <span>{String.fromCharCode(65 + index)}</span>{option}
          </button>)}
        </div>
        {choice !== null && <p className={`quiz-explanation ${choice === question.answer ? "is-correct" : "is-incorrect"}`}>
          <b>{choice === question.answer ? t("Correct! ") : t("Not quite. ")}</b>{shownQuestion.explanation}
        </p>}
        <div className="quiz-footer"><span>{t("Your score: ")}{score}{choice === question.answer ? " + 1" : ""}</span>
          <button className="quiz-primary" onClick={submitAnswer} disabled={choice === null}>{t(questionIndex === questions.length - 1 ? "See result" : "Next question")} →</button>
        </div>
      </> : <p className="quiz-loading" role="status">{t("Could not load questions. Close the quiz and try again.")}</p>}
    </section>
  </div>;
}
