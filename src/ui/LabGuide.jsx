import { useState } from "react";

const TUTORIAL_STEPS = [
  {
    id: "movement",
    category: "CONTROLS",
    categoryHi: "कंट्रोल",
    title: "Move and interact",
    titleHi: "चलें और इंटरैक्ट करें",
    icon: "🎮",
    badge: "Start here",
    body: "On a phone, hold the arrow buttons to walk, drag the open scene to look, tap the hand to interact, and tap ▲ to jump. On a computer, use WASD to walk, Shift to sprint, Space to jump, and E to interact.",
    bodyHi: "फोन पर चलने के लिए तीर बटन दबाकर रखें, देखने के लिए खाली दृश्य पर उँगली चलाएँ, हाथ से इंटरैक्ट करें और ▲ से कूदें। कंप्यूटर पर चलने के लिए WASD, तेज़ चलने के लिए Shift, कूदने के लिए Space और इंटरैक्ट के लिए E दबाएँ।",
  },
  {
    id: "welcome",
    category: "WELCOME",
    categoryHi: "स्वागत",
    title: "Welcome to the Virtual Chemistry Lab",
    titleHi: "वर्चुअल केमिस्ट्री लैब (राष्ट्रीय संस्करण) में आपका स्वागत है",
    icon: "🏛️",
    badge: "NCERT & JEE / NEET",
    body: "Explore the 3D lab, collect a supported sample pair, and run a guided reaction. The models demonstrate the listed observations; they are learning simulations, not physical experiments.",
    bodyHi: "3D लैब देखें, दी गई रासायनिक जोड़ी चुनें और निर्देशित अभिक्रिया चलाएँ। मॉडल में दिखाई गई बातें सीखने के लिए हैं; यह वास्तविक प्रयोग नहीं है।",
    highlights: [
      { icon: "🧪", label: "Real 3D Apparatus", labelHi: "वास्तविक 3D उपकरण" },
      { icon: "⚡", label: "High-Fidelity Visuals", labelHi: "उच्च-गुणवत्ता प्रभाव" },
      { icon: "📱", label: "Touch & Keyboard", labelHi: "मोबाइल व कीबोर्ड नियंत्रण" },
    ],
  },
  {
    id: "chemicals",
    category: "STEP 1 · CHEMICALS",
    categoryHi: "चरण 1 · रसायन",
    title: "Pick Your First Chemicals",
    titleHi: "अपने पहले रसायन चुनें",
    icon: "🧪",
    badge: "Inventory & Shelf",
    body: "Choose a starter pair below, or tap a labelled shelf bottle / Find a Chemical. Samples are added to your inventory directly; you do not need to carry bottles through the room.",
    bodyHi: "नीचे शुरुआती रासायनिक जोड़ी चुनें या रैक की बोतल / रसायन खोजें पर टैप करें। नमूने सीधे इन्वेंटरी में जुड़ते हैं; बोतल लेकर चलने की ज़रूरत नहीं है।",
    quickPairs: [
      {
        name: "NaHCO₃ + vinegar (CO₂ bubbles)",
        nameHi: "NaHCO₃ + सिरका (CO₂ बुलबुले)",
        classLevel: "Class 9",
        ids: ["sodium_bicarbonate", "acetic_acid"],
      },
      {
        name: "Mg + O₂ (bright light; MgO powder)",
        nameHi: "Mg + O₂ (तेज़ प्रकाश; MgO पाउडर)",
        classLevel: "Class 10",
        ids: ["magnesium", "oxygen"],
      },
      {
        name: "Mg + Dilute HCl (H₂ Gas Evolution)",
        nameHi: "मैग्नीशियम + तनु HCl (H₂ गैस निकास)",
        classLevel: "Class 10",
        ids: ["magnesium", "hydrochloric_acid"],
      },
      {
        name: "Pb(NO₃)₂ + KI (Canary Yellow Ppt)",
        nameHi: "लेड नाइट्रेट + पोटैशियम आयोडाइड (पीला अवक्षेप)",
        classLevel: "Class 10",
        ids: ["lead_nitrate", "potassium_iodide"],
      },
      {
        name: "Fe + CuSO₄ (Displacement Reaction)",
        nameHi: "आयरन + कॉपर सल्फेट (विस्थापन अभिक्रिया)",
        classLevel: "Class 10",
        ids: ["iron", "copper_sulfate"],
      },
    ],
  },
  {
    id: "bench",
    category: "STEP 2 · REACTION BENCH",
    categoryHi: "चरण 2 · अभिक्रिया मंच",
    title: "Approach the Central Reaction Bench",
    titleHi: "केंद्रीय अभिक्रिया टेबल के पास जाएँ",
    icon: "🔬",
    badge: "Reaction Station",
    body: "Walk to the central bench. When its reaction panel opens, choose the matching reaction card and press React. Only listed reactant pairs are simulated.",
    bodyHi: "बीच की रिएक्शन बेंच तक चलें। रिएक्शन पैनल खुलने पर सही कार्ड चुनें और React दबाएँ। केवल सूची में दी गई रासायनिक जोड़ियाँ सिम्युलेट होती हैं।",
    tip: "On mobile, hold the ▲ arrow on the left D-pad to walk forward. Drag the screen to look around.",
    tipHi: "मोबाइल पर आगे बढ़ने के लिए बाएँ D-pad का ▲ तीर दबाकर रखें। चारों ओर देखने के लिए स्क्रीन पर उँगली चलाएँ।",
  },
  {
    id: "react",
    category: "STEP 3 · SIMULATION",
    categoryHi: "चरण 3 · 3D सिमुलेशन",
    title: "Run the Reaction & Observe 3D Simulation",
    titleHi: "अभिक्रिया शुरू करें और 3D में देखें",
    icon: "⚡",
    badge: "5-Stage Timeline",
    body: "Use the reaction card to start, pause, replay, or change playback speed. Read the balanced equation and observations alongside the apparatus. A simulation is a visual model, not proof of a real-world yield.",
    bodyHi: "रिएक्शन कार्ड से शुरू करें, रोकें, दोबारा चलाएँ या गति बदलें। उपकरण के साथ संतुलित समीकरण और अवलोकन पढ़ें। यह दृश्य मॉडल है, वास्तविक प्रयोग की उपज का प्रमाण नहीं।",
    timelineStages: [
      "1. Preparation",
      "2. Initial Observation",
      "3. Reaction Event",
      "4. Final Observation",
      "5. Scientific Explanation",
    ],
  },
  {
    id: "posters_periodic",
    category: "LAB FEATURES",
    categoryHi: "लैब सुविधाएँ",
    title: "Interactive Posters & 118-Element Periodic Table",
    titleHi: "इंटरैक्टिव चार्ट और 118-तत्व आवर्त सारणी",
    icon: "📊",
    badge: "Study Walls",
    body: "Tap/click a wall poster or the periodic table to open its study panel. The Doubt Corner opens the bundled NCERT reaction guide. Use the top Reaction Setups catalogue to browse all reactions available in this build.",
    bodyHi: "दीवार के poster या periodic table पर टैप करें। Doubt Corner में उपलब्ध NCERT reaction guide खुलती है। ऊपर Reaction Setups catalogue से इस build की सभी reactions देखें।",
  },
  {
    id: "companion_query",
    category: "AI & DOUBT CORNER",
    categoryHi: "AI और संशय निवारण",
    title: "AI Voice Companion & Query Corner",
    titleHi: "AI वॉयस सहायक और प्रश्न कोना",
    icon: "🤖",
    badge: "Voice & NCERT Doubts",
    body: "The lab companion gives in-app hints and narration; it is not a connected generative AI service. Open the Doubt Corner for bundled NCERT explanations. Use the quiz room for practice and Chapter notes for revision.",
    bodyHi: "लैब साथी ऐप के अंदर संकेत और narration देता है; यह जुड़ी हुई generative AI सेवा नहीं है। Doubt Corner में उपलब्ध NCERT समझाएँ देखें, अभ्यास के लिए quiz room और दोहराने के लिए Chapter notes खोलें।",
  },
  {
    id: "quiz_room",
    category: "ASSESSMENT",
    categoryHi: "मूल्यांकन",
    title: "Quiz Classroom & Instant Scoring",
    titleHi: "क्विज़ कक्षा और तत्काल परिणाम",
    icon: "📝",
    badge: "East Wing",
    body: "Pass through the East door into the Quiz Classroom. Walk up to any student chair and press 'E' (or tap the Hand button) to sit down and begin a 10-question class test.",
    bodyHi: "पूर्वी दरवाज़े से क्विज़ कक्षा में जाएँ। किसी भी कुर्सी के पास जाकर 'E' या हाथ का बटन दबाएँ और 10 प्रश्नों की बहुविकल्पीय परीक्षा दें।",
  },
  {
    id: "showcase_graphics",
    category: "SHOWCASE & GRAPHICS",
    categoryHi: "शोकेस और ग्राफ़िक्स",
    title: "Reaction Setups Showcase & High Graphics",
    titleHi: "अभिक्रिया शोकेस और उच्च ग्राफ़िक्स सेटिंग",
    icon: "🏆",
    badge: "Classes 9–12 Setups",
    body: "Use Reaction Setups to browse the available simulations. Open the periodic table or an interactive wall poster by tapping it. Graphics Quality can be raised in Settings, but High may reduce smoothness on some phones.",
    bodyHi: "उपलब्ध सिमुलेशन देखने के लिए Reaction Setups खोलें। आवर्त सारणी या interactive poster पर टैप करें। Settings में graphics बढ़ा सकते हैं, लेकिन कुछ फोन पर High से गति कम हो सकती है।",
  },
];

export default function LabGuide({
  language = "en",
  onClose,
  onPickStarterPair,
  onTeleportToBench,
  availableReactionKeys = null,
}) {
  const [step, setStep] = useState(0);
  const hindi = language === "hi";
  const item = TUTORIAL_STEPS[step];
  const availablePairs = item.quickPairs?.filter((pair) => !availableReactionKeys
    || availableReactionKeys.includes([...pair.ids].sort().join("|")));

  const handleQuickPairClick = (pair) => {
    if (onPickStarterPair) {
      onPickStarterPair(pair.ids);
    }
  };

  const handleNext = () => {
    if (step < TUTORIAL_STEPS.length - 1) {
      setStep((curr) => curr + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setStep((curr) => Math.max(0, curr - 1));
  };

  return (
    <div className="lab-guide-backdrop" role="presentation">
      <section
        className="lab-guide-card tutorial-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lab-guide-title"
      >
        {/* Top Header */}
        <div className="tutorial-header">
          <div className="tutorial-header-info">
            <span className="tutorial-badge">{item.badge}</span>
            <span className="tutorial-step-tag">
              {hindi ? item.categoryHi : item.category} · {step + 1}/{TUTORIAL_STEPS.length}
            </span>
          </div>
          <button
            type="button"
            className="lab-guide-skip"
            onClick={onClose}
            aria-label="Skip Tutorial"
          >
            {hindi ? "छोड़ें ✕" : "Skip Tour ✕"}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="lab-guide-progress" aria-label={`Step ${step + 1} of ${TUTORIAL_STEPS.length}`}>
          {TUTORIAL_STEPS.map((_, index) => (
            <span
              key={index}
              className={`tutorial-progress-dot ${index === step ? "is-current" : index < step ? "is-completed" : ""}`}
              onClick={() => setStep(index)}
              title={`Step ${index + 1}`}
            />
          ))}
        </div>

        {/* Content Body */}
        <div className="tutorial-body-wrapper">
          <div className="tutorial-icon-heading">
            <span className="tutorial-large-icon">{item.icon}</span>
            <h2 id="lab-guide-title" className="tutorial-title">
              {hindi ? item.titleHi : item.title}
            </h2>
          </div>

          <p className="tutorial-text">
            {hindi ? item.bodyHi : item.body}
          </p>

          {/* Highlights */}
          {item.highlights && (
            <div className="tutorial-highlights-row">
              {item.highlights.map((h, i) => (
                <div key={i} className="tutorial-highlight-chip">
                  <span>{h.icon}</span>
                  <strong>{hindi ? h.labelHi : h.label}</strong>
                </div>
              ))}
            </div>
          )}

          {/* Quick Starter Chemical Pairs */}
          {availablePairs?.length > 0 && (
            <div className="tutorial-quick-pairs">
              <span className="quick-pair-label">
                {hindi ? "💡 क्लिक करके रसायन सीधे अपनी इन्वेंट्री में जोड़ें:" : "💡 Click to load starter chemicals directly:"}
              </span>
              <div className="quick-pair-grid">
                {availablePairs.map((pair, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="tutorial-quick-pair-btn"
                    onClick={() => handleQuickPairClick(pair)}
                  >
                    <span className="pair-class-badge">{pair.classLevel}</span>
                    <span className="pair-name">{hindi ? pair.nameHi : pair.name}</span>
                    <span className="pair-add-icon">+ Add</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tip / Bench Walk Action */}
          {item.id === "bench" && (
            <div className="tutorial-bench-action-box">
              <p className="tutorial-bench-tip">
                {hindi ? item.tipHi : item.tip}
              </p>
              {onTeleportToBench && (
                <button
                  type="button"
                  className="tutorial-teleport-btn"
                  onClick={() => {
                    onTeleportToBench();
                    handleNext();
                  }}
                >
                  📍 {hindi ? "मुझे सीधे रिएक्शन बेंच पर ले चलें" : "Take Me to Reaction Bench"}
                </button>
              )}
            </div>
          )}

          {/* Timeline Visual Preview */}
          {item.timelineStages && (
            <div className="tutorial-timeline-preview">
              {item.timelineStages.map((stage, idx) => (
                <div key={idx} className="tutorial-stage-pill">
                  {stage}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Navigation Controls */}
        <div className="lab-guide-actions tutorial-actions">
          <button
            type="button"
            className="lab-guide-back"
            onClick={handlePrev}
            disabled={step === 0}
          >
            ← {hindi ? "पीछे" : "Back"}
          </button>

          <div className="tutorial-step-indicators">
            <span>{step + 1} / {TUTORIAL_STEPS.length}</span>
          </div>

          <button
            type="button"
            className="lab-guide-next tutorial-primary-next"
            onClick={handleNext}
          >
            {step === TUTORIAL_STEPS.length - 1
              ? (hindi ? "प्रयोगशाला शुरू करें 🚀" : "Start Experimenting 🚀")
              : (hindi ? "आगे बढ़ें →" : "Next Step →")}
          </button>
        </div>
      </section>
    </div>
  );
}
