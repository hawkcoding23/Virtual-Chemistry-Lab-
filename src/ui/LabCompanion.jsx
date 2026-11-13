import { useEffect, useState } from "react";

const ELEMENTS = [
  ["H", "Hydrogen"], ["O", "Oxygen"], ["Na", "Sodium"], ["Mg", "Magnesium"],
  ["Fe", "Iron"], ["Cu", "Copper"], ["C", "Carbon"], ["Cl", "Chlorine"],
];

const TIPS = {
  en: [
    "Explore the lab with WASD or the arrow keys.",
    "Click a labelled bottle to collect a chemical sample.",
    "Look at the periodic table and select an element to learn about it.",
    "Bring samples to the central reaction bench to explore supported reactions.",
    "Walk close to a chart or the Doubt Corner and press E to open it.",
    "Open Chapter notes or visit the quiz room to practise what you learn.",
  ],
  hi: [
    "WASD या तीर वाली कुंजियों से लैब में घूमें।",
    "रसायन का नमूना लेने के लिए नाम वाली बोतल पर क्लिक करें।",
    "आवर्त सारणी में किसी तत्व को चुनकर उसके बारे में जानें।",
    "अभिक्रियाएँ देखने के लिए नमूने केंद्रीय अभिक्रिया बेंच पर लाएँ।",
    "चार्ट या डाउट कॉर्नर के पास जाकर खोलने के लिए E दबाएँ।",
    "अभ्यास के लिए अध्याय नोट्स या क्विज़ कक्ष देखें।",
  ],
};

export default function LabCompanion({ language = "en" }) {
  const [elementIndex, setElementIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const hindi = language === "hi";
  const [symbol, name] = ELEMENTS[elementIndex];
  const tips = TIPS[hindi ? "hi" : "en"];

  useEffect(() => {
    const timer = window.setInterval(() => setElementIndex((index) => (index + 1) % ELEMENTS.length), 1900);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setTipIndex((index) => (index + 1) % tips.length), 9000);
    return () => window.clearInterval(timer);
  }, [tips.length]);

  const nextTip = () => setTipIndex((index) => (index + 1) % tips.length);

  return <aside className="lab-companion" aria-label={hindi ? "सहायक रोबोट" : "Robot companion"}>
    <button type="button" className="companion-tip" onClick={nextTip} aria-label={`${tips[tipIndex]} ${hindi ? "अगला सुझाव देखने के लिए दबाएँ" : "Click for another tip"}`} aria-live="polite">
      <span>{tips[tipIndex]}</span>
    </button>
    <div className="companion-robot" role="img" aria-label={`${hindi ? "रोबोट की आँखों में तत्व" : "Element in robot eyes"}: ${name}`}>
      <svg className="companion-robot-svg" viewBox="0 0 150 190" aria-hidden="true">
        <defs>
          <linearGradient id="flaskGlass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f7ffff" stopOpacity=".96"/><stop offset=".55" stopColor="#a8efff" stopOpacity=".72"/><stop offset="1" stopColor="#39bcf4" stopOpacity=".92"/></linearGradient>
          <linearGradient id="labLiquid" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#1be3ff"/><stop offset="1" stopColor="#0877dd"/></linearGradient>
          <linearGradient id="robotMetal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f8ffff"/><stop offset=".6" stopColor="#aac7de"/><stop offset="1" stopColor="#6489ad"/></linearGradient>
          <filter id="eyeGlow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <ellipse cx="75" cy="181" rx="41" ry="6" fill="#102c3b" opacity=".3"/>
        <path d="M32 107 14 129q-5 7 2 13l20 15 9-11-14-12 16-14M118 107l18 20q6 7 0 13l-17 15-10-11 13-12-16-14" fill="none" stroke="#253c55" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M35 107 17 129l21 17 8-11-12-11 15-14M115 107l18 20-19 17-9-11 12-11-15-14" fill="none" stroke="url(#robotMetal)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M60 153v18m30-18v18" stroke="#293e59" strokeWidth="13" strokeLinecap="round"/><path d="M60 153v16m30-16v16" stroke="url(#robotMetal)" strokeWidth="8" strokeLinecap="round"/>
        <path d="M48 169q-10 0-11 8t8 8h22v-9q-2-7-19-7m42 0q-10 0-11 7v9h22q10 0 8-9t-19-7" fill="url(#robotMetal)" stroke="#324c68" strokeWidth="3"/>
        <path d="M66 40V20h18v20" fill="url(#flaskGlass)" stroke="#45bde6" strokeWidth="4"/>
        <path d="M59 8q0-5 5-5h22q5 0 5 5v15H59z" fill="#9b6841" stroke="#69452f" strokeWidth="3"/><path d="M64 7 86 20m-21-15 22 13" stroke="#bf9262" strokeWidth="2" opacity=".8"/>
        <path d="M61 36h28v10q0 11 9 20l20 23q8 9 8 20v25q0 10-10 10H34q-10 0-10-10v-25q0-11 8-20l20-23q9-10 9-20z" fill="url(#flaskGlass)" stroke="#58c9ee" strokeWidth="4"/>
        <path d="M29 111q22-7 46 0t47 0v24q0 5-7 5H36q-7 0-7-6z" fill="url(#labLiquid)" opacity=".9"/>
        <path d="M32 112q19-6 43 0t43 0" fill="none" stroke="#a8ffff" strokeWidth="3" opacity=".85"/>
        <rect x="35" y="69" width="80" height="43" rx="16" fill="#102b43" stroke="#5fe4ff" strokeWidth="3"/>
        <text className="companion-eye-symbol" x="75" y="88" textAnchor="middle" fill="#53f2ff">{symbol}</text>
        <text className="companion-eye-name" x="75" y="102" textAnchor="middle" fill="#c8ffff">{name}</text>
        <circle cx="43" cy="79" r="2.5" fill="#72f5ff" filter="url(#eyeGlow)"/><circle cx="107" cy="79" r="2.5" fill="#72f5ff" filter="url(#eyeGlow)"/>
        <path d="M49 126q26 11 52 0" fill="none" stroke="#d7ffff" strokeWidth="3" strokeLinecap="round" opacity=".8"/>
        <circle cx="45" cy="119" r="3" fill="#d4ffff" opacity=".8"/><circle cx="104" cy="133" r="2.5" fill="#d4ffff" opacity=".8"/>
        <path d="M13 134h8m108-3h8" stroke="#16caff" strokeWidth="3" strokeLinecap="round" filter="url(#eyeGlow)"/>
        <path d="M55 170h14m14 0h14" stroke="#2dd8ff" strokeWidth="4" strokeLinecap="round" filter="url(#eyeGlow)"/>
      </svg>
    </div>
  </aside>;
}
