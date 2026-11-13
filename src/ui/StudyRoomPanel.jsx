import { useEffect, useMemo, useState } from "react";
import { EXAM_REVISION, STUDY_LESSON_PAGES, STUDY_NOTES } from "../data/studyNotes";
import { STUDY_NOTES_HI } from "../data/studyNotesHindi";
import { STUDY_NOTE_EXTENSIONS } from "../data/studyNoteExtensions";
import { STUDY_NOTE_DEEP_DIVES } from "../data/studyNoteDeepDives";
import { localizeScienceHindi, useLanguage } from "../i18n";

const visualType = (chapter = "") => {
  const name = chapter.toLowerCase();
  if (/atom|electron/.test(name)) return "atom";
  if (/bond|hydrocarbon|organic|coordination|polymer|biomolecule|amine|alcohol|carbonyl/.test(name)) return "bond";
  if (/thermodynamic|kinetic|equilibrium|electrochem|redox/.test(name)) return "energy";
  if (/solution|pure|surface|solid state|isolation/.test(name)) return "separation";
  if (/periodic|classification/.test(name)) return "periodic";
  if (/matter|state/.test(name)) return "particles";
  return "reaction";
};

function LessonIllustration({ chapter, page, t }) {
  const type = visualType(chapter);
  const captions = ["A model helps us picture what cannot be seen directly.", "Follow the evidence from particles to a measurable result.", "Use the model to explain a new example, then check its limits.", "Apply the idea to a new example, then check what the evidence can and cannot tell you.", "Connect the chapter’s ideas and test the explanation with a new question."];
  return <figure className="study-lesson-visual">
    <svg viewBox="0 0 360 190" role="img" aria-label={`${t(chapter)} ${t("chemistry illustration")}`}>
      <defs>
        <linearGradient id="lesson-glow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#71dfce" /><stop offset="1" stopColor="#54aee2" /></linearGradient>
      </defs>
      {type === "atom" && <g fill="none" stroke="#5ac8bd" strokeWidth="2">
        <ellipse cx="180" cy="92" rx="100" ry="38" /><ellipse cx="180" cy="92" rx="100" ry="38" transform="rotate(58 180 92)" /><ellipse cx="180" cy="92" rx="100" ry="38" transform="rotate(-58 180 92)" />
        <circle cx="180" cy="92" r="21" fill="#e9b75d" stroke="none" /><circle cx="260" cy="73" r="7" fill="#79e2d1" stroke="none" /><circle cx="127" cy="33" r="7" fill="#77c7f0" stroke="none" /><circle cx="126" cy="150" r="7" fill="#77c7f0" stroke="none" />
      </g>}
      {type === "bond" && <g stroke="#78ddcf" strokeWidth="5" strokeLinecap="round">
        <line x1="105" y1="100" x2="170" y2="60" /><line x1="170" y1="60" x2="245" y2="100" /><line x1="105" y1="100" x2="170" y2="140" /><line x1="170" y1="140" x2="245" y2="100" />
        <circle cx="105" cy="100" r="24" fill="#193e4b" stroke="#78ddcf" /><circle cx="170" cy="60" r="24" fill="#193e4b" stroke="#f1c56d" /><circle cx="245" cy="100" r="24" fill="#193e4b" stroke="#77c7f0" /><circle cx="170" cy="140" r="24" fill="#193e4b" stroke="#b698ee" />
      </g>}
      {type === "energy" && <g>
        <path d="M48 150H316M55 153V30" fill="none" stroke="#7898a0" strokeWidth="2" />
        <path d={page === 2 ? "M65 130C112 130 118 45 174 45S226 130 300 130" : "M65 130C112 130 125 68 176 68S224 130 300 130"} fill="none" stroke="url(#lesson-glow)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="65" cy="130" r="7" fill="#f1c56d" /><circle cx="300" cy="130" r="7" fill="#77c7f0" />
        <text x="64" y="174" fill="#bed3d2" fontSize="12">{t("reactants")}</text><text x="254" y="174" fill="#bed3d2" fontSize="12">{t("products")}</text><text x="80" y="28" fill="#79dfce" fontSize="12">{t("energy pathway")}</text>
      </g>}
      {type === "separation" && <g>
        <path d="M128 28H230M145 28V112L112 153Q108 163 125 163H234Q251 163 247 153L214 112V28" fill="none" stroke="#83d8ce" strokeWidth="4" strokeLinejoin="round" />
        <path d="M130 130H229L245 153Q247 160 234 160H125Q111 160 118 151Z" fill="#55b8b3" opacity=".45" />
        <circle cx="152" cy="140" r="6" fill="#f1c56d" /><circle cx="183" cy="148" r="6" fill="#b698ee" /><circle cx="211" cy="137" r="6" fill="#77c7f0" />
        <path d="M65 54H104M256 54H295" stroke="#7898a0" strokeWidth="2" strokeDasharray="5 7" />
        <text x="126" y="185" fill="#bed3d2" fontSize="12">{t("separate by a property")}</text>
      </g>}
      {type === "periodic" && <g>{Array.from({ length: 18 }, (_, i) => {
        const x = 42 + (i % 6) * 47; const y = 43 + Math.floor(i / 6) * 40;
        return <g key={i}><rect x={x} y={y} width="36" height="30" rx="5" fill={i % 3 === 0 ? "#247c81" : i % 3 === 1 ? "#345a77" : "#574c81"} stroke="#8be1d2" strokeOpacity=".5" /><circle cx={x + 18} cy={y + 15} r="4" fill={i % 2 ? "#f1c56d" : "#8ee3d4"} /></g>;
      })}<path d="M45 174H310" stroke="#79dfce" strokeWidth="2" /><path d="m301 168 10 6-10 6" fill="none" stroke="#79dfce" strokeWidth="2" /></g>}
      {(type === "particles" || type === "reaction") && <g>
        {[[75,65,"#79dfce"],[105,104,"#f1c56d"],[75,145,"#77c7f0"],[270,65,"#b698ee"],[300,105,"#79dfce"],[270,145,"#f1c56d"]].map(([x,y,color], i) => <circle key={i} cx={x} cy={y} r="12" fill={color} opacity=".95" />)}
        <path d={type === "particles" ? "M120 105H228" : "M124 105H232"} stroke="#d2e8e2" strokeWidth="3" /><path d="m220 97 12 8-12 8" fill="none" stroke="#d2e8e2" strokeWidth="3" />
        <rect x="142" y="55" width="62" height="100" rx="13" fill="#163641" stroke="#78ddcf" strokeWidth="2" /><path d="M149 118Q173 106 197 118V145H149Z" fill="#58c2b5" opacity=".55" />
        <text x="145" y="177" fill="#bed3d2" fontSize="12">{t(type === "particles" ? "motion · spacing · attraction" : "reactants → products")}</text>
      </g>}
    </svg>
    <figcaption><b>{t(page === 0 ? "Build the picture" : page === 1 ? "Trace the chemistry" : page === 2 ? "Explain the evidence" : "Connect the chapter")}</b>{t(captions[page] ?? captions[2])}</figcaption>
  </figure>;
}

export default function StudyRoomPanel({ initialClassLevel = 9, track = "ncert", onClose }) {
  const { language, t } = useLanguage();
  const [classLevel, setClassLevel] = useState(String(initialClassLevel));
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const chapters = STUDY_NOTES[classLevel] ?? STUDY_NOTES[9];
  const selected = chapters.find((entry) => entry.chapter === selectedChapter) ?? null;
  const hindiLesson = selected ? STUDY_NOTES_HI[selected.chapter] : null;
  const pages = selected ? [
    ...(language === "hi" && hindiLesson ? hindiLesson.pages : STUDY_LESSON_PAGES[selected.chapter])
      .map(([title, explanation, check]) => language === "hi"
        ? [title, localizeScienceHindi(explanation), localizeScienceHindi(check)]
        : [title, explanation, check]),
    [t("Apply the chapter"), ...(STUDY_NOTE_EXTENSIONS[selected.chapter]?.[language] ?? STUDY_NOTE_EXTENSIONS[selected.chapter]?.en ?? [])
      .map((line) => language === "hi" ? localizeScienceHindi(line) : line)],
    [t("Go one step further"), ...(STUDY_NOTE_DEEP_DIVES[selected.chapter]?.[language] ?? STUDY_NOTE_DEEP_DIVES[selected.chapter]?.en ?? [])
      .map((line) => language === "hi" ? localizeScienceHindi(line) : line)],
  ] : null;
  const examLabel = track === "jee" || track === "neet" ? track.toUpperCase() : null;
  const pageCount = pages?.length ?? 0;
  const currentPage = pages?.[pageIndex];
  const chapterNumber = selected ? chapters.indexOf(selected) + 1 : 0;
  const currentQuickNote = language === "hi" && hindiLesson
    ? hindiLesson.notes[Math.min(pageIndex, hindiLesson.notes.length - 1)]
    : selected?.notes[Math.min(pageIndex, selected.notes.length - 1)];
  const pageTitle = useMemo(() => t(selected?.chapter ?? "Study room"), [selected, language]);

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose?.();
      if (!selected || event.target instanceof HTMLSelectElement) return;
      if (event.key === "ArrowRight") setPageIndex((index) => Math.min(index + 1, pageCount - 1));
      if (event.key === "ArrowLeft") setPageIndex((index) => Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose, selected, pageCount]);

  const openChapter = (chapter) => { setSelectedChapter(chapter); setPageIndex(0); };
  const backToChapters = () => { setSelectedChapter(null); setPageIndex(0); };
  const changeClass = (value) => { setClassLevel(value); setSelectedChapter(null); setPageIndex(0); };

  return <div className="study-notes-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose?.(); }}>
    <section className="study-notes-panel" role="dialog" aria-modal="true" aria-labelledby="study-notes-title">
      <button type="button" className="welcome-info-close" aria-label={t("Close study notes")} onClick={() => onClose?.()}>×</button>
      <span className="welcome-info-eyebrow">{t("VIRTUAL CHEMISTRY LIBRARY")}</span>
      <h2 id="study-notes-title">{pageTitle}</h2>
      <p className="study-notes-intro">{t("Original chapter guides with illustrated concepts, worked reasoning, and a quick check.")}</p>
      <div className="study-notes-controls">
        <label>{t("Browse class")}<select value={classLevel} onChange={(event) => changeClass(event.target.value)}>
          {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)} · NCERT</option>)}
        </select></label>
        {examLabel && <span className="study-exam-badge">{t(`${examLabel} REVISION`)}</span>}
      </div>
      {examLabel && !selected && <aside className="exam-revision-card"><b>{t(`${examLabel} focus`)}</b><ul>{EXAM_REVISION[track].map((note) => <li key={note}>{t(note)}</li>)}</ul></aside>}
      {!selected ? <>
        <div className="study-chapter-heading"><h3>{t(`Class ${classLevel}`)} {t("chapters")}</h3><span>{chapters.length} {t("chapter guides · open any chapter to read 5 pages")}</span></div>
        <div className="study-chapter-list">
          {chapters.map((entry, index) => <button className="study-chapter-card" type="button" key={entry.chapter} onClick={() => openChapter(entry.chapter)}>
            <span>{t("CHAPTER ")}{String(index + 1).padStart(2, "0")}</span><h3>{t(entry.chapter)}</h3>
            <p>{language === "hi" ? localizeScienceHindi(STUDY_NOTES_HI[entry.chapter]?.pages[0][1]) : entry.notes[0]}</p><span className="study-chapter-open">{t("Read illustrated guide")} →</span>
          </button>)}
        </div>
      </> : <>
        <button className="study-back-to-chapters" type="button" onClick={backToChapters}>← {t("All Class ")}{classLevel} {t("chapters")}</button>
        <div className="study-lesson" key={`${selected.chapter}-${pageIndex}`}>
          <article className="study-lesson-copy">
            <span>{t("Chapter ")}{String(chapterNumber).padStart(2, "0")}{t(" · Page ")}{pageIndex + 1}</span>
            <h3>{currentPage[0]}</h3>
            <p>{currentPage[1]}</p>
            <div className="study-lesson-takeaway"><b>{t(pageIndex >= 2 ? "Try this" : "Key idea")}</b><br />{currentPage[2] ?? currentQuickNote}</div>
          </article>
          <LessonIllustration chapter={selected.chapter} page={pageIndex} t={t} />
        </div>
        <nav className="study-lesson-nav" aria-label={t("Chapter pages")}>
          <button type="button" onClick={() => setPageIndex((index) => Math.max(index - 1, 0))} disabled={pageIndex === 0}>{t("← Previous")}</button>
          <span className="study-lesson-count">{t(`Page ${pageIndex + 1} of ${pageCount}`)}</span>
          <button type="button" onClick={() => setPageIndex((index) => Math.min(index + 1, pageCount - 1))} disabled={pageIndex === pageCount - 1}>{t("Next page →")}</button>
        </nav>
        <div className="study-page-dots" aria-label={`Page ${pageIndex + 1} of ${pageCount}`}>
          {pages.map((page, index) => <button key={page[0]} type="button" aria-label={`${t("Open page ")}${index + 1}: ${page[0]}`} aria-current={pageIndex === index ? "page" : undefined} onClick={() => setPageIndex(index)} />)}
        </div>
      </>}
      <small className="profile-storage-note">{t("These are original revision guides based on the topics in this lab. Follow your school’s prescribed text and current exam syllabus.")}</small>
    </section>
  </div>;
}
