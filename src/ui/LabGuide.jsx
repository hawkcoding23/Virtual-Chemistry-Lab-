import { useState } from "react";

const GUIDE = [
  {
    title: { en: "Move around the lab", hi: "लैब में चलें" },
    body: { en: "Use W A S D to walk. Hold Shift while moving to sprint, and press Space to jump.", hi: "चलने के लिए W A S D दबाएँ। चलते समय Shift दबाकर दौड़ें और Space दबाकर कूदें।" },
    keys: ["W", "A", "S", "D", "Shift", "Space"], icon: "⌨",
  },
  {
    title: { en: "Interact with the lab", hi: "लैब की चीज़ों से जुड़ें" },
    body: { en: "Walk close to a door, chart, periodic table, or quiz chair. Press E when the prompt appears. Use the mouse to look around.", hi: "दरवाज़े, चार्ट, आवर्त सारणी या क्विज़ की कुर्सी के पास जाएँ। संकेत दिखे तो E दबाएँ। देखने के लिए माउस चलाएँ।" },
    keys: ["E", "Mouse"], icon: "✦",
  },
  {
    title: { en: "Collect and combine chemicals", hi: "रसायन लें और मिलाएँ" },
    body: { en: "Click labelled bottles on the shelves to collect them. At the central reaction bench, choose samples and run a supported reaction to see what forms.", hi: "रैक पर लेबल वाली बोतलों पर क्लिक करके रसायन लें। केंद्रीय reaction bench पर नमूने चुनें और reaction चलाकर बने उत्पाद देखें।" },
    keys: ["Click", "Reaction bench"], icon: "⚗",
  },
  {
    title: { en: "Try the quizzes", hi: "क्विज़ हल करें" },
    body: { en: "Enter the quiz room, sit at a chair when prompted, then start a class quiz. Your score appears when you finish.", hi: "क्विज़ रूम में जाएँ और संकेत आने पर कुर्सी पर बैठें। फिर कक्षा का क्विज़ शुरू करें; पूरा होने पर स्कोर दिखेगा।" },
    keys: ["E", "Quiz"], icon: "✓",
  },
  {
    title: { en: "Open chapter notes", hi: "अध्याय नोट्स खोलें" },
    body: { en: "Use Chapter notes at the top of the screen for class-wise lessons. Click wall charts when you want a quick explanation.", hi: "कक्षा के अनुसार पाठ देखने के लिए स्क्रीन के ऊपर Chapter notes खोलें। छोटी व्याख्या के लिए दीवार के चार्ट पर क्लिक करें।" },
    keys: ["Chapter notes", "Charts"], icon: "▤",
  },
];

export default function LabGuide({ language = "en", onClose }) {
  const [step, setStep] = useState(0);
  const item = GUIDE[step];
  const hindi = language === "hi";
  return <div className="lab-guide-backdrop" role="presentation">
    <section className="lab-guide-card" role="dialog" aria-modal="true" aria-labelledby="lab-guide-title">
      <button type="button" className="lab-guide-skip" onClick={onClose}>{hindi ? "छोड़ें" : "Skip guide"}</button>
      <div className="lab-guide-progress" aria-label={`${step + 1} of ${GUIDE.length}`}>
        {GUIDE.map((_, index) => <span key={index} className={index <= step ? "active" : ""} />)}
      </div>
      <div className="lab-guide-icon" aria-hidden="true">{item.icon}</div>
      <span className="lab-guide-eyebrow">{hindi ? `लैब टूर · ${step + 1}/${GUIDE.length}` : `QUICK LAB TOUR · ${step + 1}/${GUIDE.length}`}</span>
      <h2 id="lab-guide-title">{item.title[language] ?? item.title.en}</h2>
      <p>{item.body[language] ?? item.body.en}</p>
      <div className="lab-guide-keys">{item.keys.map((key) => <kbd key={key}>{key}</kbd>)}</div>
      <div className="lab-guide-actions">
        <button type="button" className="lab-guide-back" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}>{hindi ? "पीछे" : "Back"}</button>
        <button type="button" className="lab-guide-next" onClick={() => step === GUIDE.length - 1 ? onClose() : setStep((current) => current + 1)}>{step === GUIDE.length - 1 ? (hindi ? "लैब शुरू करें" : "Start exploring") : (hindi ? "आगे" : "Next")}</button>
      </div>
    </section>
  </div>;
}
