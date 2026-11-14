import { Canvas } from "@react-three/fiber";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import LabScene from "./components/LabScene";
import Inventory from "./ui/Inventory";
import MobileLabControls from "./ui/MobileLabControls";
import LabGuide from "./ui/LabGuide";
import LabCompanion from "./ui/LabCompanion";
import ReactionTable from "./ui/ReactionTable";
import WelcomeScreen from "./ui/WelcomeScreen";
import { loadChemicals, NCERT_REACTIONS } from "./data/ncertChemicals";
import { calculateOutcome } from "./data/simulation";
import { getChemicalColor, getReactionColor } from "./data/chemicalVisuals";
import soundManager from "./utils/soundManager";
import { animateCharacter } from "./utils/characterActions";
import { saveResultCard, shareResultCard } from "./utils/resultCard";
import { saveProfile } from "./data/profileStore";
import { saveUserProfile, signOutUser } from "./data/firebaseClient";
import { localizeScienceHindi, useLanguage } from "./i18n";
import ExperimentOverlay from "./components/simulation/ExperimentOverlay";
import { useReactionSimulation } from "./components/simulation/useReactionSimulation";
import { getReactionStation } from "./components/simulation/simulationEngine";
import { stationPosition } from "./data/labStations";
import "./App.css";

const StudyRoomPanel = lazy(() => import("./ui/StudyRoomPanel"));
const QuizPanel = lazy(() => import("./ui/QuizPanel"));

const MASS_OPTIONS = [5, 10, 20];
const idsOf = (items = []) => items.map((item) => typeof item === "string" ? item : item?.chemicalId ?? item?.id ?? "")
  .filter(Boolean).map((id) => String(id).toLowerCase());
const readableReactionType = (reaction, t = (value) => value) => {
  const value = reaction?.reactionType ?? reaction?.type ?? reaction?.reaction_type;
  const types = (Array.isArray(value) ? value : [value]).filter(Boolean);
  return types.length ? types.map((type) => t(String(type).replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()))).join(" · ") : t("Chemical reaction");
};
const isExamProfile = (profile) => ["jee", "neet"].includes(profile?.studyTrack);
const isAllClassesProfile = (profile) => profile?.studyTrack === "all";
const hasBroadClassAccess = (profile) => isExamProfile(profile) || isAllClassesProfile(profile);
const reactionsForProfile = (profile) => {
  if (!profile) return NCERT_REACTIONS;
  const selectedTrack = profile.studyTrack ?? "ncert";
  if (selectedTrack === "all") return NCERT_REACTIONS.filter((reaction) => !reaction.entranceOnly);
  if (selectedTrack === "jee" || selectedTrack === "neet") {
    return NCERT_REACTIONS.filter((reaction) => !reaction.entranceOnly || (reaction.tracks ?? []).includes(selectedTrack));
  }
  const classLevel = Number(profile.classLevel);
  return NCERT_REACTIONS.filter((reaction) => !reaction.entranceOnly
    && (reaction.classes ?? []).some((level) => Number(level) <= classLevel));
};
const studyTrackLabel = (track) => ({ jee: "JEE preparation", neet: "NEET preparation" }[track] ?? "NCERT");
const profileChoiceLabel = (profile, t) => isAllClassesProfile(profile) ? `${profile.name} · ${t("All classes")}` : isExamProfile(profile) ? `${profile.name} · ${t(studyTrackLabel(profile.studyTrack))}` : `${profile.name} · ${t(`Class ${profile.classLevel}`)}`;
const reactionProcess = (reaction, language = "en") => {
  if (language === "hi") {
    if (reaction?.id === "sodium_water") return "Sodium पानी से तेज़ और ऊष्माक्षेपी अभिक्रिया करके sodium hydroxide और hydrogen gas बनाता है। निकली ऊष्मा कुछ परिस्थितियों में hydrogen या sodium को जला सकती है; आग या विस्फोट संभव है, लेकिन निश्चित नहीं। यह सिमुलेशन गैस और ऊष्मा दिखाता है, अनुमानित blast नहीं।";
    if (String(reaction?.id || "").toLowerCase().includes("magnesium") || /2?\s*mg\s*\+\s*o[₂2]?\s*→\s*2?\s*mgo/i.test(reaction?.equation || "")) return "मैग्नीशियम की पट्टी को ऑक्सीजन में गर्म किया जाता है। यह तेज़ सफ़ेद प्रकाश के साथ जलती है और सफ़ेद मैग्नीशियम ऑक्साइड पाउडर बनाती है।";
    if (["haber_process", "so2_contact_process"].includes(reaction?.id)) return "यह गैसों की उत्क्रमणीय अभिक्रिया है। अग्र और पश्च अभिक्रिया साथ चलती हैं; उत्प्रेरक दोनों दिशाओं की दर बढ़ाता है और परिस्थितियाँ साम्य मिश्रण को प्रभावित करती हैं।";
    const typesHi = (Array.isArray(reaction?.reactionType) ? reaction.reactionType : [reaction?.reactionType ?? reaction?.type])
      .filter(Boolean).map((type) => String(type).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_"));
    if (typesHi.some((type) => type.includes("neutral"))) return "जलीय विलयन में अम्ल से आया H⁺ और क्षार से आया OH⁻ मिलकर पानी बनाते हैं; बचे हुए आयन लवण बनाते हैं।";
    if (typesHi.some((type) => type.includes("thermal_decomposition")) || reaction?.conditions?.heatRequired && typesHi.some((type) => type.includes("decomposition"))) return "गर्मी एक यौगिक को सरल उत्पादों में तोड़ने के लिए आवश्यक ऊर्जा देती है।";
    if (typesHi.some((type) => type.includes("electrolytic_decomposition"))) return "विद्युत धारा यौगिक को सरल पदार्थों में विघटित करती है।";
    if (typesHi.some((type) => type.includes("decomposition"))) return "एक यौगिक टूटकर दो या अधिक सरल उत्पाद बनाता है।";
    if (typesHi.some((type) => type.includes("double_displacement") || type.includes("precipitation"))) return reaction?.observations?.precipitate ? "विलयन में आयन अपने साथी बदलते हैं और अघुलनशील ठोस अवक्षेप के रूप में अलग हो जाता है।" : "आयन अपने साथी बदलकर संतुलित समीकरण में दिखाए उत्पाद बनाते हैं।";
    if (typesHi.some((type) => type.includes("displacement"))) return "अधिक क्रियाशील तत्व किसी यौगिक में कम क्रियाशील तत्व को हटाता है।";
    if (typesHi.some((type) => type.includes("esterification"))) return "Carboxylic acid और alcohol से ester तथा पानी बनता है; अम्ल उत्प्रेरक उत्क्रमणीय अभिक्रिया में सहायता करता है।";
    if (typesHi.some((type) => type.includes("decarboxylation"))) return "गर्म करने पर carboxylate से carbon dioxide निकलती है; soda lime से समीकरण में दिखा alkane बन सकता है।";
    if (typesHi.some((type) => type.includes("hydrogenation"))) return "Hydrogen, carbon–carbon double bond पर जुड़कर alkene को alkane में बदलता है।";
    if (typesHi.some((type) => type.includes("hydration"))) return "पानी carbon–carbon double bond पर जुड़कर दिखाया गया alcohol बनाता है।";
    if (typesHi.some((type) => type.includes("hydrolysis"))) return "पानी शुरुआती यौगिक का बंध तोड़कर समीकरण में दिखाए उत्पाद बनाता है।";
    if (typesHi.some((type) => type.includes("substitution"))) return "एक परमाणु या समूह की जगह दूसरा आता है और शेष परमाणु दिखाए गए उत्पाद बनाते हैं।";
    if (typesHi.some((type) => type.includes("redox") || type.includes("oxidation"))) return "Electron का स्थानांतरण होता है: oxidation और reduction साथ-साथ होते हैं।";
    if (typesHi.some((type) => type.includes("combustion"))) return "ईंधन oxygen से प्रतिक्रिया करके ऊर्जा छोड़ता है; उत्पाद ईंधन और परिस्थिति पर निर्भर करते हैं।";
    if (typesHi.some((type) => type.includes("combination") || type.includes("synthesis"))) return "दो या अधिक अभिकारक मिलकर संतुलित समीकरण में दिखाया उत्पाद बनाते हैं।";
    return "अभिकारक पुनर्व्यवस्थित होकर संतुलित समीकरण में दिखाए उत्पाद बनाते हैं।";
  }
  if (reaction?.id === "sodium_water") return "Sodium reacts vigorously and exothermically with water, forming sodium hydroxide and hydrogen gas. The released heat may ignite hydrogen or sodium; a fire or explosion is possible in some conditions, but it is not a guaranteed result. This simulation illustrates gas release and heating, not a predictable blast.";
  if (String(reaction?.id || "").toLowerCase().includes("magnesium") || /2?\s*mg\s*\+\s*o[₂2]?\s*→\s*2?\s*mgo/i.test(reaction?.equation || "")) return "A magnesium ribbon is heated in oxygen. It burns with a brilliant white light and forms white magnesium oxide powder.";
  if (["haber_process", "so2_contact_process"].includes(reaction?.id)) return "This is a reversible gas-phase reaction. Forward and reverse reactions occur together; the catalyst speeds both directions, while operating conditions influence the equilibrium mixture.";
  const types = (Array.isArray(reaction?.reactionType) ? reaction.reactionType : [reaction?.reactionType ?? reaction?.type])
    .filter(Boolean).map((type) => String(type).toLowerCase().replaceAll("-", "_").replaceAll(" ", "_"));
  if (types.some((type) => type.includes("neutral"))) return "In aqueous solution, H⁺ from the acid combines with OH⁻ from the base to form water; the remaining ions form a salt.";
  if (types.some((type) => type.includes("thermal_decomposition")) || reaction?.conditions?.heatRequired && types.some((type) => type.includes("decomposition"))) return "Heat supplies the energy needed for one compound to break into simpler products.";
  if (types.some((type) => type.includes("electrolytic_decomposition"))) return "Electric current drives the compound to split into simpler substances.";
  if (types.some((type) => type.includes("decomposition"))) return "One compound breaks down into two or more simpler products.";
  if (types.some((type) => type.includes("double_displacement") || type.includes("precipitation"))) return reaction?.observations?.precipitate
    ? "The ions exchange partners in solution; an insoluble solid separates as a precipitate."
    : "The ions exchange partners to form the products shown in the balanced equation.";
  if (types.some((type) => type.includes("displacement"))) return "A more reactive element replaces a less reactive element in a compound.";
  if (types.some((type) => type.includes("esterification"))) return "A carboxylic acid and an alcohol form an ester and water; the acid catalyst helps the reversible reaction.";
  if (types.some((type) => type.includes("decarboxylation"))) return "The carboxylate loses carbon dioxide on heating; soda lime can produce the alkane shown.";
  if (types.some((type) => type.includes("cannizzaro"))) return "Two aldehyde molecules react together: one is oxidised to a carboxylate and the other is reduced to an alcohol.";
  if (types.some((type) => type.includes("hydrogenation"))) return "Hydrogen adds across the carbon–carbon double bond, converting the alkene to an alkane.";
  if (types.some((type) => type.includes("hydration"))) return "Water adds across the carbon–carbon double bond to form the alcohol shown.";
  if (types.some((type) => type.includes("hydrolysis"))) return "Water breaks a bond in the starting compound, forming the products shown.";
  if (types.some((type) => type.includes("electrophilic_substitution"))) return "An electrophile replaces a hydrogen on the aromatic ring; the catalyst helps the substitution.";
  if (types.some((type) => type.includes("substitution"))) return "One atom or group is replaced by another, while the remaining atoms form the products shown.";
  if (types.some((type) => type.includes("redox") || type.includes("oxidation"))) return "Electrons are transferred: oxidation and reduction take place together.";
  if (types.some((type) => type.includes("combustion"))) return "A fuel reacts with oxygen and releases energy; the products depend on the fuel and conditions.";
  if (types.some((type) => type.includes("combination") || type.includes("synthesis"))) return "Two or more reactants combine to form the product shown in the balanced equation.";
  return "The reactants rearrange into the products shown in the balanced equation.";
};

function DoubtCornerDialog({ language, onClose, allChemicals = {} }) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const reactions = useMemo(() => NCERT_REACTIONS
    .filter((reaction) => !reaction.entranceOnly && (reaction.classes ?? [reaction.source?.class]).some((level) => [9, 10, 11, 12].includes(Number(level))))
    .sort((a, b) => (a.chapter || "").localeCompare(b.chapter || "") || (a.equation || "").localeCompare(b.equation || "")), []);
  const visibleReactions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return reactions;
    return reactions.filter((reaction) => [reaction.chapter, reaction.equation, reaction.id,
      ...(reaction.classes ?? []), ...(Array.isArray(reaction.reactionType) ? reaction.reactionType : [reaction.reactionType ?? reaction.type]),
      ...(reaction.reactants ?? []).map((item) => typeof item === "string" ? item : item.chemicalId),
      ...(reaction.products ?? []).map((item) => typeof item === "string" ? item : item.chemicalId)]
      .some((value) => String(value ?? "").toLowerCase().includes(query)));
  }, [reactions, search]);
  const selected = visibleReactions.find((reaction) => reaction.id === selectedId) || visibleReactions[0];
  const classes = (selected?.classes ?? [selected?.source?.class]).filter(Boolean).map(Number).filter((level) => level >= 9 && level <= 12);
  const observation = selected?.observations || {};
  const types = Array.isArray(selected?.reactionType) ? selected.reactionType : [selected?.reactionType ?? selected?.type].filter(Boolean);
  const formatChemical = (item) => {
    const id = typeof item === "string" ? item : item.chemicalId;
    const chemical = allChemicals[String(id).toLowerCase()];
    const name = chemical?.name || String(id).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    return chemical?.formula ? `${name} (${chemical.formula})` : name;
  };
  const reactantNames = (selected?.reactants ?? []).map(formatChemical);
  const productNames = (selected?.products ?? []).map(formatChemical);

  return <div className="chemistry-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="chemistry-detail-card doubt-corner-dialog" role="dialog" aria-modal="true" aria-labelledby="doubt-corner-title">
      <button type="button" className="welcome-info-close" aria-label="Close Doubt Corner" onClick={onClose}>×</button>
      <span className="welcome-info-eyebrow">{language === "hi" ? "कक्षा 9–12 · रसायन सहायता" : "CLASSES 9–12 · CHEMISTRY HELP"}</span>
      <h2 id="doubt-corner-title">{language === "hi" ? "डाउट कॉर्नर" : "Doubt Corner"}</h2>
      <p>{language === "hi" ? "किसी अभिक्रिया को खोजें और उसका समीकरण, प्रकार तथा सरल व्याख्या देखें।" : "Find a reaction to see its equation, reaction type and a plain-language explanation."}</p>
      <label className="doubt-search-label">{language === "hi" ? "नाम, अध्याय, समीकरण या प्रकार खोजें" : "Search name, chapter, equation or reaction type"}
        <input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. magnesium, displacement, Class 10" />
      </label>
      <div className="doubt-corner-content">
        <nav className="doubt-reaction-list" aria-label="Class 9–12 reactions">
          <strong>{visibleReactions.length} {language === "hi" ? "अभिक्रियाएँ" : "reactions"}</strong>
          {visibleReactions.map((reaction) => <button type="button" key={reaction.id} className={selected?.id === reaction.id ? "selected" : ""} onClick={() => setSelectedId(reaction.id)}>
            <span>{reaction.chapter || (language === "hi" ? "रसायन अभिक्रिया" : "Chemistry reaction")}</span>
            <b>{reaction.equation}</b>
            <small>{(reaction.classes ?? [reaction.source?.class]).filter(Boolean).join(" · ")}</small>
          </button>)}
          {!visibleReactions.length && <small>{language === "hi" ? "कोई मेल खाती अभिक्रिया नहीं मिली।" : "No matching reactions found."}</small>}
        </nav>
        {selected && <article className="doubt-reaction-detail">
          <small>{classes.length ? `${language === "hi" ? "कक्षा" : "Class"} ${classes.join(", ")}` : language === "hi" ? "कक्षा 9–12" : "Classes 9–12"}</small>
          <h3>{selected.chapter || (language === "hi" ? "रासायनिक अभिक्रिया" : "Chemical reaction")}</h3>
          <code>{selected.equation}</code>
          {types.length > 0 && <p><b>{language === "hi" ? "अभिक्रिया का प्रकार" : "Reaction type"}:</b> {types.join(" · ")}</p>}
          <p>{language === "hi" ? localizeScienceHindi(selected.explanation || reactionProcess(selected, "en")) : selected.explanation || reactionProcess(selected, "en")}</p>
          <p><b>{language === "hi" ? "अभिकारक" : "Reactants"}:</b> {reactantNames.join(" + ")}</p>
          <p><b>{language === "hi" ? "उत्पाद" : "Products"}:</b> {productNames.join(" + ")}</p>
          {(observation.gas || observation.precipitate || observation.colorChange || observation.temperatureChange || observation.lightProduced) && <p><b>{language === "hi" ? "क्या देखें" : "What to notice"}:</b> {[observation.gas && `${language === "hi" ? "गैस" : "Gas"}: ${observation.gas}`, observation.precipitate && `${language === "hi" ? "अवक्षेप" : "Precipitate"}: ${observation.precipitate}`, observation.colorChange, observation.temperatureChange && `${language === "hi" ? "तापमान" : "Temperature"}: ${observation.temperatureChange}`, observation.lightProduced && (language === "hi" ? "प्रकाश निकलता है" : "Light is produced")].filter(Boolean).join(" · ")}</p>}
          {selected.conditions?.heatRequired && <p className="doubt-condition">{language === "hi" ? "सुरक्षा: नियंत्रित ऊष्मा आवश्यक है।" : "Safety: controlled heating is required."}</p>}
          {selected.hazardWarning && <p className="doubt-condition">{language === "hi" ? localizeScienceHindi(selected.hazardWarning) : selected.hazardWarning}</p>}
        </article>}
      </div>
      <button type="button" className="profile-submit" onClick={onClose}>{language === "hi" ? "बंद करें" : "Close"}</button>
    </section>
  </div>;
}

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [inventory, setInventory] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [allChemicals, setAllChemicals] = useState({});
  const [shelfChemicals, setShelfChemicals] = useState({});
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");
  const [uiHidden, setUiHidden] = useState(false);
  const [mass, setMass] = useState(5);
  const [activeStation, setActiveStation] = useState(null);
  const [tableHint, setTableHint] = useState("");
  const [interactionPrompt, setInteractionPrompt] = useState(null);
  const [nearQuizSeat, setNearQuizSeat] = useState(false);
  const [quizSeated, setQuizSeated] = useState(false);
  const [standRequest, setStandRequest] = useState(0);
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizClassLevel, setQuizClassLevel] = useState(9);
  const [benchSelection, setBenchSelection] = useState([]);
  const [reactionResult, setReactionResult] = useState(null);
  const [resultExportMessage, setResultExportMessage] = useState("");
  const [enteredLab, setEnteredLab] = useState(false);
  const [entrySequence, setEntrySequence] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [rendererReady, setRendererReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [companionEnabled, setCompanionEnabled] = useState(() => {
    try { return window.localStorage.getItem("chemistry-world-companion") !== "false"; } catch { return true; }
  });
  const [chemicalDoorOpen, setChemicalDoorOpen] = useState(false);
  const [quizDoorOpen, setQuizDoorOpen] = useState(false);
  const [mouseSensitivity, setMouseSensitivity] = useState(1);
  const mobileMoveRef = useRef({ x: 0, y: 0 });
  const [walkingSoundEnabled, setWalkingSoundEnabled] = useState(true);
  const [reactionSoundEnabled, setReactionSoundEnabled] = useState(true);
  const [narrationEnabled, setNarrationEnabled] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileDashboardOpen, setProfileDashboardOpen] = useState(false);
  const [studyRoomOpen, setStudyRoomOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedTheory, setSelectedTheory] = useState(null);
  const nearTable = activeStation !== null;
  const reactionRun = useRef(0);
  const entryTimer = useRef(null);

  useEffect(() => {
    if (!enteredLab || !sceneReady) return;
    try {
      if (window.localStorage.getItem("chemistry-world-controls-guide-seen") !== "true") setGuideOpen(true);
    } catch { setGuideOpen(true); }
  }, [enteredLab, sceneReady]);

  const closeGuide = useCallback(() => {
    setGuideOpen(false);
    try { window.localStorage.setItem("chemistry-world-controls-guide-seen", "true"); } catch { /* Keep the guide usable when storage is blocked. */ }
  }, []);

  useEffect(() => () => window.clearTimeout(entryTimer.current), []);

  useEffect(() => {
    try { window.localStorage.setItem("chemistry-world-companion", String(companionEnabled)); } catch { /* Storage can be unavailable in private contexts. */ }
  }, [companionEnabled]);

  // Signed-in profiles keep their current lab setup alongside the reaction
  // and quiz notebook, so collecting samples survives a browser restart.
  useEffect(() => {
    if (!profile?.profileKey) return;
    saveProfile({
      ...profile,
      inventory,
      benchSelection: benchSelection.filter((id) => inventory.some((item) => item.id === id)),
      activeChemicalId: inventory.some((item) => item.id === activeId) ? activeId : null,
      sampleMass: mass,
    });
    if (profile.uid) {
      const cloudProfile = {
        ...profile,
        inventory,
        benchSelection: benchSelection.filter((id) => inventory.some((item) => item.id === id)),
        activeChemicalId: inventory.some((item) => item.id === activeId) ? activeId : null,
        sampleMass: mass,
      };
      const saveTimer = window.setTimeout(() => {
        saveUserProfile(profile.uid, cloudProfile).catch((error) => console.error("Could not sync your chemistry notebook:", error));
      }, 700);
      return () => window.clearTimeout(saveTimer);
    }
  }, [profile, inventory, benchSelection, activeId, mass]);

  useEffect(() => {
    Promise.all([loadChemicals({ includeAll: true }), loadChemicals()]).then(([library, reagents]) => {
      setAllChemicals(library);
      setShelfChemicals(reagents);
    }).catch((error) => {
      console.error("Could not load the chemical library:", error);
      setAllChemicals({});
      setShelfChemicals({});
    }).finally(() => setCatalogReady(true));
  }, []);

  // A profile represents one student's class, so keep their shelves, search,
  // and reaction catalogue scoped to that syllabus. Guest mode without a
  // profile can still explore the complete library.
  const classReactions = useMemo(() => {
    return reactionsForProfile(profile);
  }, [profile?.classLevel, profile?.studyTrack]);
  const classChemicalIds = useMemo(() => new Set(classReactions.flatMap((reaction) => [
    ...idsOf(reaction.reactants), ...idsOf(reaction.products),
  ])), [classReactions]);
  const classAllChemicals = useMemo(() => {
    if (!profile) return allChemicals;
    return Object.fromEntries(Object.entries(allChemicals).filter(([id]) => classChemicalIds.has(id)));
  }, [allChemicals, classChemicalIds, profile?.classLevel, profile?.studyTrack]);
  const classShelfChemicals = useMemo(() => {
    if (!profile) return shelfChemicals;
    return Object.fromEntries(Object.entries(shelfChemicals).filter(([id]) => classChemicalIds.has(id)));
  }, [shelfChemicals, classChemicalIds, profile?.classLevel, profile?.studyTrack]);
  const stationReactions = useMemo(() => classReactions.filter((reaction) => {
    return activeStation === "main";
  }), [classReactions, activeStation]);

  useEffect(() => {
    if (!catalogReady || !rendererReady) return undefined;
    const readyFrame = requestAnimationFrame(() => setSceneReady(true));
    return () => cancelAnimationFrame(readyFrame);
  }, [catalogReady, rendererReady]);

  useEffect(() => {
    if (sceneReady) document.querySelector("canvas")?.focus({ preventScroll: true });
  }, [sceneReady]);

  useEffect(() => {
    const openChemicalSearch = (event) => {
      const target = event.target;
      const isTyping = target instanceof HTMLElement && (
        target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
      );
      if (event.repeat || isTyping || !enteredLab) return;
      if (event.code === "KeyU") {
        setQuickSearchOpen(false);
        setUiHidden((hidden) => !hidden);
        return;
      }
      if (event.code === "KeyL") {
        setSettingsOpen((open) => !open);
        return;
      }
      return;
    };
    window.addEventListener("keydown", openChemicalSearch);
    return () => window.removeEventListener("keydown", openChemicalSearch);
  }, [enteredLab, reactionResult, quizOpen, quizSeated, uiHidden]);

  const addChemical = useCallback((chemical, interaction = {}) => {
    soundManager.playPickupSound();
    animateCharacter("pickup", { position: interaction.position ?? null });
    const sample = { ...chemical, mass };
    setInventory((current) => [...current.filter((item) => item.id !== sample.id), sample]);
    setActiveId(chemical.id);
  }, [mass]);

  const quickMatches = useMemo(() => {
    const query = quickSearch.trim().toLowerCase();
    if (!query) return [];
    return Object.values(classAllChemicals)
      .filter((chemical) => `${chemical.name} ${chemical.formula} ${chemical.category}`.toLowerCase().includes(query))
      .sort((a, b) => {
        const aStarts = `${a.name} ${a.formula}`.toLowerCase().startsWith(query);
        const bStarts = `${b.name} ${b.formula}`.toLowerCase().startsWith(query);
        return Number(bStarts) - Number(aStarts) || a.name.localeCompare(b.name);
      }).slice(0, 8);
  }, [classAllChemicals, quickSearch]);

  const collectQuickResult = (chemical) => {
    addChemical(chemical);
    setQuickSearch("");
    setQuickSearchOpen(false);
    requestAnimationFrame(() => document.querySelector("canvas")?.focus({ preventScroll: true }));
  };

  const removeChemical = (id) => {
 
    soundManager.playBottleRemoveSound();
    animateCharacter("discard");
    setInventory((current) => current.filter((item) => item.id !== id));
    setBenchSelection((current) => current.filter((selectedId) => selectedId !== id));
    if (activeId === id) setActiveId(null);
  };

  const toggleBenchChemical = (id) => setBenchSelection((current) => {
    if (current.includes(id)) return current.filter((selectedId) => selectedId !== id);
    return current.length < 4 ? [...current, id] : current;
  });

  const loadRecipe = (ids) => {
    const resolved = ids.filter((id) => inventory.some((item) => item.id === id) || classAllChemicals[id]);
    const additions = resolved.filter((id) => !inventory.some((item) => item.id === id))
      .map((id) => ({ ...classAllChemicals[id], mass }));
    if (additions.length) setInventory((current) => [...current, ...additions]);
    setBenchSelection(resolved.slice(0, 4));
    setReactionResult(null);
  };

  const mixAtTable = () => {
    const selected = benchSelection.map((id) => inventory.find((item) => item.id === id)).filter(Boolean);
    const selectedIds = selected.map((item) => item.id).sort();
    const reaction = stationReactions.find((candidate) =>
      idsOf(candidate.reactants).sort().join("|") === selectedIds.join("|"));
    const runId = ++reactionRun.current;
    if (!reaction) {
      const knownReaction = classReactions.find((candidate) => idsOf(candidate.reactants).sort().join("|") === selectedIds.join("|"));
      const guidance = knownReaction
        ? "This reaction is supported at the central bench. Check that the sample set matches the reaction card."
        : "These samples do not form a supported reaction in this lab.";
      setTableHint(guidance);
      soundManager.playIncorrectSound();
      if (narrationEnabled && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const announcement = new SpeechSynthesisUtterance(guidance);
        announcement.lang = language === "hi" ? "hi-IN" : "en-IN";
        announcement.rate = 0.92;
        window.speechSynthesis.speak(announcement);
      }
      window.setTimeout(() => setTableHint(""), 4800);
      return;
    }
    let outcome = null;
    try {
      outcome = calculateOutcome(reaction, selected, allChemicals);
    } catch (error) {
      console.error("Reaction mass calculation failed:", error);
    }
    const reactionPosition = stationPosition(getReactionStation(reaction));
    setReactionResult({ ...reaction, runId, samples: selected, outcome, stationPosition: reactionPosition });
    animateCharacter("pour");
    if (profile) {
      const updated = { ...profile, reactionHistory: [{ id: reaction.id, title: reaction.chapter ?? reaction.name ?? "Chemical reaction", equation: reaction.equation, samples: selected.map(({ name, formula }) => ({ name, formula })), at: new Date().toISOString() }, ...(profile.reactionHistory ?? [])].slice(0, 100) };
      setProfile(updated);
      saveProfile(updated);
    }
  };

  const simulation = useReactionSimulation(reactionResult, allChemicals);
  const openChemicalSearch = useCallback(() => {
    setQuickSearchOpen(true);
    requestAnimationFrame(() => document.getElementById("quick-chemical-input")?.focus({ preventScroll: true }));
  }, []);
  const closeChemicalSearch = useCallback(() => setQuickSearchOpen(false), []);

  const products = useMemo(() => (reactionResult?.products ?? []).map((item) => {
    const id = (typeof item === "string" ? item : item.chemicalId)?.toLowerCase();
    const calculated = reactionResult?.outcome?.products.find((product) => product.id === id);
    return { ...(allChemicals[id] ?? { id, name: id?.replaceAll("_", " "), formula: "" }),
      grams: calculated?.grams ?? null };
  }), [reactionResult, allChemicals]);
  const gasProducts = products.filter((product) => allChemicals[product.id]?.state === "gas");
  const observedLiquid = reactionResult?.samples?.find((item) => item.state === "liquid") ?? reactionResult?.samples?.[0];
  const observedStartColor = observedLiquid?.color ?? getChemicalColor(observedLiquid);
  const observedResultColor = reactionResult?.gameEffect?.finalColor ?? getReactionColor(reactionResult);
  const observedPrecipitate = reactionResult?.observations?.precipitate;
  const precipitateId = (typeof observedPrecipitate === "string" ? observedPrecipitate : null)
    || ((observedPrecipitate || reactionResult?.gameEffect?.precipitate)
      ? products.find((product) => allChemicals[product.id]?.state === "solid")?.id
      : null);
  const precipitateProduct = products.find((product) => product.id === precipitateId);

  const clearLab = () => {
    setInventory([]);
    setBenchSelection([]);
    setActiveId(null);
    setReactionResult(null);
  };
  const closeReactionResult = () => {
    setReactionResult(null);
    setResultExportMessage("");
  };

  const exportReactionResult = async (mode) => {
    if (!reactionResult) return;
    const result = {
      kind: "reaction",
      username: profile?.name ?? "Guest explorer",
      classLevel: reactionResult.classes?.join(" / ") ?? profile?.classLevel ?? "9–12",
      title: reactionResult.noReaction ? "No supported reaction" : reactionResult.chapter ?? "Chemical reaction",
      subtitle: reactionResult.equation ?? "This combination has no matching reaction in the catalogue.",
      details: [
        reactionResult.samples?.length ? `Samples: ${reactionResult.samples.map(({ name, formula, mass }) => `${name} (${formula}) · ${mass} g`).join(" + ")}` : "",
        reactionResult.noReaction ? "No curriculum reaction was matched." : `Reaction type: ${readableReactionType(reactionResult)}`,
        !reactionResult.noReaction && products.length ? `Products: ${products.map((product) => `${product.name} (${product.formula})`).join(", ")}` : "",
        reactionResult.observations?.temperatureChange ? `Temperature: ${reactionResult.observations.temperatureChange}` : "",
        reactionResult.observations?.gas ? `Gas: ${reactionResult.observations.gas}` : "",
        reactionResult.hazardWarning ?? "",
      ].filter(Boolean),
    };
    try {
      const outcome = mode === "share" ? await shareResultCard(result) : await saveResultCard(result);
      setResultExportMessage(outcome === "shared" ? "Result shared." : "Result image saved. You can share the PNG with friends.");
    } catch (error) {
      if (error?.name === "AbortError") return;
      setResultExportMessage("Could not create the result image in this browser.");
    }
  };

  const prepareCanvas = useCallback(() => {
    // Mark the renderer ready after its first paint so controls aren't left
    // disabled if a later scene asset takes time to load.
    requestAnimationFrame(() => setRendererReady(true));
  }, []);
  const openQuiz = useCallback(() => {
    if (quizSeated) setQuizOpen(true);
  }, [quizSeated]);
  const beginLabEntry = useCallback((profileToEnter = null) => {
    setProfile(profileToEnter);
    setQuizClassLevel(profileToEnter?.classLevel ?? (isExamProfile(profileToEnter) ? 11 : 9));
    const classChemicalIds = profileToEnter
      ? new Set(reactionsForProfile(profileToEnter)
        .flatMap((reaction) => [...idsOf(reaction.reactants), ...idsOf(reaction.products)]))
      : null;
    const savedInventory = (Array.isArray(profileToEnter?.inventory) ? profileToEnter.inventory : [])
      .filter((chemical) => !classChemicalIds || classChemicalIds.has(String(chemical.id).toLowerCase()));
    const restoredMass = MASS_OPTIONS.includes(Number(profileToEnter?.sampleMass)) ? Number(profileToEnter.sampleMass) : 5;
    setInventory(savedInventory);
    setBenchSelection(Array.isArray(profileToEnter?.benchSelection)
      ? profileToEnter.benchSelection.filter((id) => savedInventory.some((item) => item.id === id)).slice(0, 4)
      : []);
    setActiveId(savedInventory.some((item) => item.id === profileToEnter?.activeChemicalId)
      ? profileToEnter.activeChemicalId : null);
    setMass(restoredMass);
    soundManager.unlockAudio();
    soundManager.playWelcomeSound();
    setEntrySequence(true);
    window.clearTimeout(entryTimer.current);
    entryTimer.current = window.setTimeout(() => {
      setEntrySequence(false);
      setEnteredLab(true);
    }, 3600);
  }, []);
  const closeQuiz = useCallback(() => setQuizOpen(false), []);
  const requestStandUp = useCallback(() => setStandRequest((current) => current + 1), []);
  const recordQuizRound = useCallback(({ classLevel, score, total }) => {
    setQuizClassLevel(classLevel);
    setQuizSeated(false);
    setStandRequest((current) => current + 1);
    if (profile) {
      const updated = { ...profile, quizHistory: [{ classLevel, score, total, at: new Date().toISOString() }, ...(profile.quizHistory ?? [])].slice(0, 100) };
      setProfile(updated);
      saveProfile(updated);
    }
  }, [profile]);
  const compatibleIds = useMemo(() => {
    if (!activeId) return [];
    return [...new Set(classReactions.filter((reaction) => idsOf(reaction.reactants).includes(activeId))
      .flatMap((reaction) => idsOf(reaction.reactants).filter((id) => id !== activeId)))];
  }, [activeId, profile?.classLevel, classReactions]);

  if (!enteredLab) return <WelcomeScreen onEnter={beginLabEntry} entrySequence={entrySequence} />;

  return <>
    <Canvas tabIndex={0} dpr={[0.8, 1]} gl={{ antialias: false, powerPreference: "high-performance", alpha: false }}
      fallback={<div className="lab-render-fallback" role="alert">{t("This browser could not start the 3D lab. Try reloading the page or enabling WebGL.")}</div>}
      camera={{ position: [0, 1.7, 7], fov: 70 }} onCreated={prepareCanvas}>
      <LabScene language={language} chemicals={classShelfChemicals} allChemicals={allChemicals} onSelectChemical={addChemical} activeId={activeId}
        compatibleIds={compatibleIds} onNearTable={setActiveStation} reactionResult={reactionResult} simulationState={simulation}
        onNearQuizSeat={setNearQuizSeat} onSitQuizSeat={setQuizSeated} onInteractQuiz={openQuiz}
        onInteractChemicalDoor={() => setChemicalDoorOpen((open) => !open)} chemicalDoorOpen={chemicalDoorOpen}
        onInteractQuizDoor={() => setQuizDoorOpen((open) => !open)} quizDoorOpen={quizDoorOpen}
        mouseSensitivity={mouseSensitivity} onOpenChemicalSearch={openChemicalSearch} onLeaveChemicalBench={closeChemicalSearch}
        mobileMoveRef={mobileMoveRef}
        onElementSelect={setSelectedElement} onTheorySelect={setSelectedTheory} onInteractionPrompt={setInteractionPrompt} onInteractPoster={(target) => target?.type === "doubt-corner" ? setSelectedTheory({ type: "doubt-corner" }) : setSelectedTheory(target)}
        standRequest={standRequest} quizSeated={quizSeated}
        controlsEnabled={sceneReady && !reactionResult && !quizOpen}
        selectedClass={profile ? (isExamProfile(profile) ? profile.studyTrack : isAllClassesProfile(profile) ? "all" : profile.classLevel) : null} />
    </Canvas>
    <MobileLabControls moveRef={mobileMoveRef} />
    {guideOpen && sceneReady && <LabGuide language={language} onClose={closeGuide} />}
    {!uiHidden && companionEnabled && <LabCompanion language={language} />}
    {!sceneReady && <div className="lab-loading" role="status">{t("Preparing the virtual lab…")}</div>}
    <div className="lab-utility-controls">
      {!uiHidden && !reactionResult && !quizOpen && !quizSeated && <div className="quick-chemical-search">
        {quickSearchOpen && <section className="quick-search-panel" aria-label={t("Find a chemical")}>
          <label htmlFor="quick-chemical-input">{t("Search name, formula, or group")}</label>
          <input id="quick-chemical-input" type="search" autoFocus value={quickSearch}
            onChange={(event) => setQuickSearch(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && quickMatches[0]) collectQuickResult(quickMatches[0]); }}
            placeholder={language === "hi" ? "जैसे copper sulfate या CuSO₄" : "e.g. copper sulfate or CuSO₄"} />
          <div className="quick-search-results" aria-live="polite">
            {!quickSearch.trim() && <p>{t("Type to search the Class 9–12 chemical library.")}</p>}
            {quickSearch.trim() && quickMatches.map((chemical) => <button key={chemical.id} type="button"
              onClick={() => collectQuickResult(chemical)}>
              <i style={{ backgroundColor: chemical.color }} /><span>{chemical.name}<small>{chemical.formula} · {t(chemical.category)}</small></span><b>{t("Add")}</b>
            </button>)}
            {quickSearch.trim() && quickMatches.length === 0 && <p>{t("No matching chemicals found.")}</p>}
          </div>
        </section>}
      </div>}
      {!uiHidden && !reactionResult && !quizOpen && !quizSeated && <button className="study-room-shortcut" type="button" onClick={() => setStudyRoomOpen(true)}>{language === "hi" ? "अध्याय नोट्स" : "Chapter notes"}</button>}
      <button className="ui-visibility-toggle settings-toggle" type="button" aria-expanded={settingsOpen}
        aria-label={t("Settings")} title={`${t("Settings")} (L)`} onClick={() => setSettingsOpen((open) => !open)}>
        <span aria-hidden="true">⚙</span>
      </button>
    </div>
    {settingsOpen && <div className="lab-settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
      <section className="lab-settings-panel" role="dialog" aria-modal="true" aria-labelledby="lab-settings-title">
        <button type="button" className="welcome-info-close" aria-label={t("Close settings")} onClick={() => setSettingsOpen(false)}>×</button>
        <span className="welcome-info-eyebrow">{t("LAB CONTROLS")}</span><h2 id="lab-settings-title">{t("Settings")}</h2>
        <label className="lab-setting-row"><span><b>{t("Show lab interface")}</b><small>{t("U toggles the interface")}</small></span><input type="checkbox" checked={!uiHidden} onChange={(event) => { setUiHidden(!event.target.checked); if (!event.target.checked) setQuickSearchOpen(false); }} /></label>
        <label className="lab-setting-row"><span><b>{t("Robot lab companion")}</b><small>{t("Show tips while exploring")}</small></span><input type="checkbox" checked={companionEnabled} onChange={(event) => setCompanionEnabled(event.target.checked)} /></label>
        <label className="lab-setting-range"><span><b>{t("Mouse sensitivity")}</b><output>{mouseSensitivity.toFixed(1)}×</output></span><input type="range" min="0.3" max="2" step="0.1" value={mouseSensitivity} onChange={(event) => setMouseSensitivity(Number(event.target.value))} /></label>
        <div className="lab-movement-setting">
          <span><b>{t("Movement keys")}</b><small>{t("Move around the lab")}</small></span>
          <div className="movement-key-options"><span className="active">W A S D</span></div>
        </div>
        <label className="lab-setting-row"><span><b>{t("Walking and sprint sounds")}</b><small>{t("Footsteps while moving")}</small></span><input type="checkbox" checked={walkingSoundEnabled} onChange={(event) => { const enabled = event.target.checked; setWalkingSoundEnabled(enabled); soundManager.walkingEnabled = enabled; if (!enabled) soundManager.stopMovementSound(); }} /></label>
        <label className="lab-setting-row"><span><b>{t("Reaction sounds")}</b><small>{t("Sound effects during reactions")}</small></span><input type="checkbox" checked={reactionSoundEnabled} onChange={(event) => { const enabled = event.target.checked; setReactionSoundEnabled(enabled); soundManager.reactionEnabled = enabled; if (!enabled) soundManager.stopReactionSound(); }} /></label>
        <label className="lab-setting-row"><span><b>{t("Reaction narration")}</b><small>{t("Speak what is happening during the reaction")}</small></span><input type="checkbox" checked={narrationEnabled} onChange={(event) => setNarrationEnabled(event.target.checked)} /></label>
        <div className="settings-control-guide">
          <h3>{t("Movement & controls")}</h3>
          <p><kbd>W A S D</kbd> <span>{t("Move around the lab")}</span></p>
          <p><kbd>Right-click</kbd> <span>{t("Toggle mouse look")}</span></p>
          <p><kbd>C</kbd> <span>{t("Release mouse cursor")}</span></p>
          <p><kbd>Shift</kbd> <span>{t("Sprint")}</span> <kbd>Space</kbd> <span>{t("Jump")}</span></p>
          <p><kbd>E / Left-click</kbd> <span>{t("Open/close doors, read charts, sit at a quiz desk, or search at the dispensing bench")}</span></p>
          <p><kbd>F</kbd> <span>{t("Stand up from the quiz seat")}</span></p>
          <p><kbd>R</kbd> <span>{t("Re-center view")}</span> <kbd>U</kbd> <span>{t("Toggle the interface")}</span> <kbd>L</kbd> <span>{t("Open settings")}</span></p>
        </div>
        <button type="button" className="lab-guide-reopen" onClick={() => { setSettingsOpen(false); setGuideOpen(true); }}>{t("Show the first-time controls guide")}</button>
        <p className="lab-settings-shortcut">{t("Shortcut")}: <kbd>L</kbd> {t("opens settings")}</p>
      </section>
    </div>}
    {profileDashboardOpen && <div className="profile-dashboard-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setProfileDashboardOpen(false);
    }}>
      <section className="profile-dashboard" role="dialog" aria-modal="true" aria-labelledby="profile-dashboard-title">
        <button type="button" className="welcome-info-close" aria-label={t("Close profile")} onClick={() => setProfileDashboardOpen(false)}>×</button>
        <span className="welcome-info-eyebrow">{t("MY CHEMISTRY NOTEBOOK")}</span>
        <h2 id="profile-dashboard-title">{profile?.name ?? t("Guest explorer")}</h2>
        <p className="profile-dashboard-meta">{profile ? (isAllClassesProfile(profile) ? `${t("All classes")} · ${t("Classes 9–12")}` : isExamProfile(profile) ? `${t(studyTrackLabel(profile.studyTrack))} · ${t("Classes 9–12")}` : `${t(`Class ${profile.classLevel}`)} · NCERT`) : `${t("Guest profile")} · ${t("Classes 9–12")}`}</p>
        <div className="profile-stat-grid">
          <article><b>{profile?.reactionHistory?.length ?? 0}</b><span>{t("Reaction attempts")}</span></article>
          <article><b>{profile?.quizHistory?.length ?? 0}</b><span>{t("Quiz rounds")}</span></article>
          <article><b>{profile?.quizHistory?.length ? `${Math.round(profile.quizHistory.reduce((sum, round) => sum + round.score, 0) / profile.quizHistory.reduce((sum, round) => sum + round.total, 0) * 100)}%` : "—"}</b><span>{t("Quiz accuracy")}</span></article>
        </div>
        <div className="profile-history-columns">
          <section><h3>{t("Recent reactions")}</h3>
            {profile?.reactionHistory?.length ? profile.reactionHistory.slice(0, 8).map((entry, index) => <article key={`${entry.at}-${index}`}>
              <b>{t(entry.title)}</b><span>{entry.equation}</span><small>{new Date(entry.at).toLocaleDateString(language === "hi" ? "hi-IN" : undefined)}</small>
            </article>) : <p>{t("No reactions recorded yet. Mix chemicals at the reaction bench to start your notebook.")}</p>}
          </section>
          <section><h3>{t("Quiz scores")}</h3>
            {profile?.quizHistory?.length ? profile.quizHistory.slice(0, 8).map((entry, index) => <article key={`${entry.at}-${index}`}>
              <b>{t(`Class ${entry.classLevel}`)} · {entry.score}/{entry.total}</b><span>{new Date(entry.at).toLocaleDateString(language === "hi" ? "hi-IN" : undefined)}</span>
            </article>) : <p>{t("Your completed quiz rounds and scores will show here.")}</p>}
          </section>
        </div>
        <p className="profile-storage-note">{profile?.uid ? `${t("Signed in with Google")}: ${profile.email} · ${t("Notebook syncs across devices")}` : t("Saved locally in this browser. Reuse the same name, class, and study track to restore progress.")}</p>
        <button className="profile-signout" type="button" onClick={async () => {
          if (profile?.uid) await signOutUser();
          setProfileDashboardOpen(false);
          setProfile(null);
          setEnteredLab(false);
          setInventory([]);
          setBenchSelection([]);
          setReactionResult(null);
        }}>{profile ? t("Sign out") : t("Return to welcome screen")}</button>
      </section>
    </div>}
    {!uiHidden && !reactionResult && !quizOpen && !quizSeated && <>
      <header className="lab-brand">
        <strong>{t("VIRTUAL CHEMISTRY LAB")}</strong>
      <span>{profile ? (isAllClassesProfile(profile) ? `${t("All classes")} · ${t("Classes 9–12")}` : isExamProfile(profile) ? `${profile.studyTrack.toUpperCase()} · ${t("CLASSES 9–12")}` : `${t(`CLASS ${profile.classLevel}`)} · ${t("NCERT SIMULATIONS")}`) : t("CLASSES 9–12 · NCERT SIMULATIONS")}</span>
        <button className="profile-lab-button" type="button" onClick={() => setProfileDashboardOpen(true)}>
          <i className="profile-mini-avatar" />
          {profile ? profileChoiceLabel(profile, t) : t("Guest profile")}
        </button>
        <button className="lab-language-toggle" type="button" onClick={() => setLanguage((current) => current === "en" ? "hi" : "en")} aria-label={t("Change language")}>
          {language === "hi" ? "English" : "हिंदी"}
        </button>
      </header>
      <div className="crosshair">+</div>
      {tableHint && <div className="table-guidance-toast" role="status">⚗ {tableHint}</div>}
      {!uiHidden && !reactionResult && interactionPrompt && <div className="lab-interaction-prompt" role="status"><kbd>E</kbd><span>{t(interactionPrompt.prompt)}</span></div>}
      <Inventory chemicals={inventory} activeId={activeId} onSelect={setActiveId}
        onRemove={removeChemical} onClear={clearLab} tableOpen={nearTable} />
    </>}
    {!uiHidden && nearTable && !reactionResult && !quizOpen && !quizSeated && <ReactionTable chemicals={inventory} allChemicals={classAllChemicals} selected={benchSelection}
      onCollectChemical={addChemical} onToggle={toggleBenchChemical} onMix={mixAtTable} onLoadRecipe={loadRecipe}
      sampleMass={mass} onSampleMassChange={(amount) => { setMass(amount); setInventory((current) => current.map((item) => ({ ...item, mass: amount }))); }}
      reactions={stationReactions} lockedClassLevel={hasBroadClassAccess(profile) ? null : (profile?.classLevel ?? null)} studyTrack={profile?.studyTrack ?? "ncert"} />}
    {studyRoomOpen && <Suspense fallback={<div className="study-notes-loading" role="status">{t("Loading chapter notes…")}</div>}>
      <StudyRoomPanel initialClassLevel={isExamProfile(profile) ? 11 : (profile?.classLevel ?? 9)} track={profile?.studyTrack ?? "ncert"} onClose={() => setStudyRoomOpen(false)} />
    </Suspense>}
    {selectedElement && <div className="chemistry-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedElement(null); }}>
      <section className="chemistry-detail-card" role="dialog" aria-modal="true" aria-labelledby="element-detail-title">
        <button type="button" className="welcome-info-close" aria-label={t("Close element details")} onClick={() => setSelectedElement(null)}>×</button>
        <span className="welcome-info-eyebrow">{t("PERIODIC TABLE · ELEMENT DETAILS")}</span><h2 id="element-detail-title">{selectedElement.name} <small>{selectedElement.symbol}</small></h2>
        <div className="element-detail-grid"><span>{t("Atomic number")}<b>{selectedElement.number}</b></span><span>{t("Standard atomic mass")}<b>{selectedElement.mass} u</b></span><span>{t("Group")}<b>{selectedElement.groupLabel}</b></span><span>{t("Period")}<b>{selectedElement.period}</b></span><span>{t("Block")}<b>{selectedElement.block}-block</b></span><span>{t("Family")}<b>{selectedElement.family}</b></span></div>
        <p className="profile-storage-note">{language === "hi"
          ? `${t(selectedElement.family)} परिवार का यह तत्व ${selectedElement.block}-ब्लॉक और आवर्त ${selectedElement.period} में है। मानक परमाणु द्रव्यमान प्राकृतिक समस्थानिकों के औसत पर आधारित है; वर्ग कोष्ठक में द्रव्यमान संख्या वाले तत्वों के लिए मानक परमाणु भार परिभाषित नहीं है।`
          : selectedElement.note}</p><button type="button" className="profile-submit" onClick={() => setSelectedElement(null)}>{t("Close")}</button>
      </section>
    </div>}
    {selectedTheory?.type === "doubt-corner" && <DoubtCornerDialog language={language} allChemicals={allChemicals} onClose={() => setSelectedTheory(null)} />}
    {selectedTheory && selectedTheory.type !== "doubt-corner" && <div className="chemistry-detail-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTheory(null); }}>
      <section className="chemistry-detail-card theory-detail-card" role="dialog" aria-modal="true" aria-labelledby="theory-detail-title" style={{ "--detail-accent": selectedTheory.accent }}>
        <button type="button" className="welcome-info-close" aria-label={t("Close chart details")} onClick={() => setSelectedTheory(null)}>×</button>
        <span className="welcome-info-eyebrow">{t("INTERACTIVE THEORY CHART")}</span><h2 id="theory-detail-title">{t(selectedTheory.title)}</h2><p>{t(selectedTheory.subtitle)}</p>
        <ul>{selectedTheory.lines.map((line) => <li key={line}>{t(line)}</li>)}</ul><button type="button" className="profile-submit" onClick={() => setSelectedTheory(null)}>{t("Got it")}</button>
      </section>
    </div>}
    {!uiHidden && nearQuizSeat && !quizSeated && !quizOpen && !reactionResult && <div className="quiz-station-prompt">
      <span>{t("QUIZ CLASSROOM")}</span><p>{t("Take a seat to begin the quiz.")}</p>
      <div className="quiz-key-hint"><kbd>E</kbd> {t("Sit at this chair")}</div>
    </div>}
    {!uiHidden && quizSeated && !quizOpen && !reactionResult && <div className="quiz-station-prompt">
      <span>{t("YOU’RE SEATED")}</span><p>{t("Ready to test your chemistry?")}</p>
      {profile && !hasBroadClassAccess(profile) ? <div className="seated-quiz-class profile-class-lock">{t("Your profile · Class ")}{profile.classLevel}</div>
        : <label className="seated-quiz-class">{t("Choose a class")}
          <select value={quizClassLevel} onChange={(event) => setQuizClassLevel(Number(event.target.value))}>
            {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)}</option>)}
          </select>
        </label>}
      <div className="quiz-room-actions"><button onClick={openQuiz}>{t("Start quiz")} <b>→</b></button>
        <button className="quiz-room-stand" onClick={requestStandUp}>{t("Stand up")}</button></div>
      <small>{t("Press E to start · F to stand up")}</small>
    </div>}
    {!uiHidden && quizOpen && <Suspense fallback={<div className="study-notes-loading" role="status">{t("Loading quiz…")}</div>}>
      <QuizPanel onClose={closeQuiz} initialClassLevel={profile?.classLevel ?? quizClassLevel}
        lockedClassLevel={hasBroadClassAccess(profile) ? null : profile?.classLevel} username={profile?.name ?? "Guest explorer"} onRoundComplete={recordQuizRound} />
    </Suspense>}
    {!uiHidden && reactionResult && simulation.config && (
      <ExperimentOverlay
        language={language}
        reaction={reactionResult}
        config={simulation.config}
        reactionProgress={simulation.reactionProgress}
        isComplete={simulation.reactionProgress >= 1}
        explanationText={reactionProcess(reactionResult, language)}
        narrationEnabled={narrationEnabled}
        isPlaying={simulation.isPlaying}
        playbackSpeed={simulation.playbackSpeed}
        explanationOpen={simulation.explanationOpen}
        onToggleExplanation={simulation.toggleExplanation}
        onTogglePlay={simulation.togglePlay}
        onReset={simulation.reset}
        onToggleSpeed={simulation.toggleSpeed}
        onClose={closeReactionResult}
        onExport={exportReactionResult}
        exportStatus={resultExportMessage}
      />
    )}
  </>;
}
