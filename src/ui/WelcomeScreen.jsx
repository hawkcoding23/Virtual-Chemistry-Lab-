import { useEffect, useMemo, useRef, useState } from "react";
import { creatorProfile } from "../data/creatorProfile";
import { NCERT_REACTIONS } from "../data/ncertChemicals";
import ProfileAccess from "./ProfileAccess";
import { useLanguage } from "../i18n";
import "../App.css";

const EMAIL = "hawkcoding23@gmail.com";
const SOCIAL_LINKS = [
  ["Instagram", "hawkcoding", "https://www.instagram.com/hawkcoding/"],
  ["Facebook", "hawkcoding", "https://www.facebook.com/hawkcoding"],
  ["X", "Hawk_Coding", "https://x.com/Hawk_Coding"],
  ["Threads", "hawkcoding", "https://www.threads.net/@hawkcoding"],
  ["YouTube", "hawkcoding", "https://www.youtube.com/@hawkcoding"],
];
const FAQS_HI = [
  ["वर्चुअल लैब में क्या कर सकते हैं?", "कमरों में घूमें, लेबल वाले रसायन चुनें, पाठ्यक्रम की अभिक्रियाएँ चलाएँ और कक्षा-वार क्विज़ दें।"],
  ["कौन-कौन सी कक्षाएँ शामिल हैं?", "इस प्रोजेक्ट में कक्षा 9, 10, 11 और 12 शामिल हैं। अपनी कक्षा के अनुसार लैब और क्विज़ देखने के लिए प्रोफ़ाइल बनाएँ।"],
  ["क्या यह फ़ोन पर चलेगा?", "होम पेज और कंट्रोल छोटी स्क्रीन पर ढलते हैं। 3D लैब WebGL का उपयोग करती है और नए फ़ोन या हार्डवेयर एक्सेलेरेशन वाले कंप्यूटर पर बेहतर चलती है।"],
  ["मेरी प्रोफ़ाइल की प्रगति कहाँ सेव होती है?", "प्रगति इसी डिवाइस के ब्राउज़र में सेव होती है। यह सर्वर पर अपलोड नहीं होती, इसलिए दूसरे डिवाइस पर अपने आप सिंक नहीं होगी।"],
];
const FAQS = [
  {
    question: "What can I do in the virtual lab?",
    answer: "Explore the rooms, collect labelled chemicals, choose samples, run supported curriculum reactions, and take class-wise chemistry quizzes.",
  },
  {
    question: "Which classes are included?",
    answer: "The project includes Classes 9, 10, 11, and 12. Create a profile to focus the lab and quiz on your class.",
  },
  {
    question: "Will it work on my phone?",
    answer: "The welcome page and controls adapt to small screens. The walk-through lab uses WebGL and works best on a recent phone or computer with hardware acceleration enabled.",
  },
  {
    question: "Where is my profile progress saved?",
    answer: "Profile progress is saved in this browser on this device. It is not uploaded to an account server, so it will not automatically sync between devices.",
  },
];

export default function WelcomeScreen({ onEnter, entrySequence = false }) {
  const [openPanel, setOpenPanel] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const [navScrolled, setNavScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const pageRef = useRef(null);
  const cursorRef = useRef(null);
  const navScrolledRef = useRef(false);

  const classCounts = useMemo(() => [9, 10, 11, 12].map((classLevel) => ({
    classLevel,
    count: NCERT_REACTIONS.filter((reaction) => !reaction.entranceOnly
      && (reaction.classes ?? []).some((level) => Number(level) <= classLevel)).length,
  })), []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    let cursorFrame = 0;
    let pointerX = -100;
    let pointerY = -100;
    const updateScroll = () => {
      const maxScroll = page.scrollHeight - page.clientHeight;
      const progress = maxScroll > 0 ? page.scrollTop / maxScroll : 0;
      page.style.setProperty("--scroll-progress", `${progress * 100}%`);
      page.querySelector(".welcome-scroll-progress")?.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
      page.style.setProperty("--art-parallax", `${Math.min(page.scrollTop * 0.12, 72)}px`);
      const nextScrolled = page.scrollTop > 18;
      if (navScrolledRef.current !== nextScrolled) {
        navScrolledRef.current = nextScrolled;
        setNavScrolled(nextScrolled);
      }
    };
    page.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches && window.innerWidth > 760;
    let revealObserver;
    if (!reduceMotion && "IntersectionObserver" in window) {
      revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      }), { root: page, threshold: 0.12 });
      page.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
    } else {
      page.querySelectorAll("[data-reveal]").forEach((element) => element.classList.add("is-visible"));
    }

    const updateCursor = (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (cursorFrame) return;
      cursorFrame = window.requestAnimationFrame(() => {
        cursorFrame = 0;
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
          cursorRef.current.style.opacity = "1";
        }
      });
    };

    const magneticListeners = [];
    if (finePointer && !reduceMotion) {
      page.classList.add("custom-cursor-ready");
      page.addEventListener("pointermove", updateCursor, { passive: true });
      page.querySelectorAll(".magnetic-button").forEach((button) => {
        const move = (event) => {
          const rect = button.getBoundingClientRect();
          const x = (event.clientX - rect.left - rect.width / 2) * 0.08;
          const y = (event.clientY - rect.top - rect.height / 2) * 0.08;
          button.style.setProperty("--magnetic-x", `${Math.max(-5, Math.min(5, x))}px`);
          button.style.setProperty("--magnetic-y", `${Math.max(-5, Math.min(5, y))}px`);
        };
        const reset = () => {
          button.style.setProperty("--magnetic-x", "0px");
          button.style.setProperty("--magnetic-y", "0px");
        };
        button.addEventListener("pointermove", move);
        button.addEventListener("pointerleave", reset);
        magneticListeners.push([button, move, reset]);
      });
    }

    const loaderTimer = window.setTimeout(() => setLoading(false), 620);
    return () => {
      page.removeEventListener("scroll", updateScroll);
      page.removeEventListener("pointermove", updateCursor);
      revealObserver?.disconnect();
      magneticListeners.forEach(([button, move, reset]) => {
        button.removeEventListener("pointermove", move);
        button.removeEventListener("pointerleave", reset);
      });
      window.clearTimeout(loaderTimer);
      if (cursorFrame) window.cancelAnimationFrame(cursorFrame);
    };
  }, []);

  useEffect(() => {
    if (!openPanel && !mobileMenuOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpenPanel(null);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openPanel, mobileMenuOpen]);

  const closeMenu = () => setMobileMenuOpen(false);
  const t = (english, hindi) => language === "hi" ? hindi : english;
  const openProfile = () => {
    closeMenu();
    setProfileOpen(true);
  };

  return <main className="welcome-screen" id="welcome-page" ref={pageRef}>
    <div className="welcome-scroll-progress" role="progressbar" aria-label={t("Page scroll progress", "पृष्ठ पर आगे बढ़ने की स्थिति")} aria-valuemin="0" aria-valuemax="100" />
    <div className="welcome-orbit welcome-orbit-one" aria-hidden="true" />
    <div className="welcome-orbit welcome-orbit-two" aria-hidden="true" />
    <div className="welcome-ambient welcome-ambient-one" aria-hidden="true" />
    <div className="welcome-ambient welcome-ambient-two" aria-hidden="true" />

    <div className="welcome-page-width">
      <header className={`welcome-topbar ${navScrolled ? "is-scrolled" : ""}`}>
        <a className="welcome-brand" href="#top" aria-label={t("Chemistry World home", "Chemistry World का मुख्य पृष्ठ")} onClick={closeMenu}>
          <span className="welcome-mark" aria-hidden="true">CW</span>
          <span className="welcome-brand-name">Chemistry World<small>{t("NCERT virtual lab", "NCERT की वर्चुअल लैब")}</small></span>
        </a>
        <button className="welcome-menu-toggle" type="button" aria-expanded={mobileMenuOpen}
          aria-controls="welcome-navigation" aria-label={mobileMenuOpen ? t("Close menu", "मेन्यू बंद करें") : t("Open menu", "मेन्यू खोलें")}
          onClick={() => setMobileMenuOpen((open) => !open)}>
          <span /><span /><span />
        </button>
        <nav className={`welcome-nav ${mobileMenuOpen ? "is-open" : ""}`} id="welcome-navigation" aria-label={t("Main navigation", "मुख्य नेविगेशन")}>
          <a href="#explore" onClick={closeMenu}>{t("Explore", "जानें")}</a>
          <a href="#classes" onClick={closeMenu}>{t("Classes", "कक्षाएँ")}</a>
          <a href="#faq" onClick={closeMenu}>{t("FAQ", "सवाल-जवाब")}</a>
          <a href="#contact" onClick={closeMenu}>{t("Contact", "संपर्क")}</a>
          <button className="welcome-language-toggle" type="button" onClick={() => setLanguage((current) => current === "en" ? "hi" : "en")}>{t("हिंदी", "English")}</button>
          <button className="welcome-nav-cta magnetic-button" type="button" onClick={openProfile}>{t("Enter the lab", "लैब में जाएँ")} <span aria-hidden="true">↗</span></button>
        </nav>
      </header>

      <section className="welcome-shell" id="top" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="welcome-eyebrow"><i /> {t("NCERT CHEMISTRY · MADE INTERACTIVE", "NCERT रसायन विज्ञान · अब इंटरैक्टिव")}</span>
          <h1 id="welcome-title">{language === "hi" ? <>रसायन समझें।<br /><em>अभिक्रिया होते देखें।</em></> : <>Explore chemistry.<br /><em>Watch it react.</em></>}</h1>
          <p className="welcome-description">{t("Step inside a virtual lab for Classes 9–12. Collect chemicals, explore reactions, and see classroom chemistry come to life.", "कक्षा 9–12 की वर्चुअल लैब में आएँ। रसायन चुनें, अभिक्रियाएँ देखें और कक्षा में पढ़ी रसायन विज्ञान को अनुभव करें।")}</p>
          <blockquote><span>{t("I don’t want to be average.", "“मैं औसत बनकर नहीं रहना चाहता।”")}</span><cite>— Ansh Dhiman</cite></blockquote>
          <div className="welcome-actions">
            <div className="welcome-button-group">
              <button className="welcome-enter magnetic-button" type="button" onClick={openProfile}>{t("Create profile", "प्रोफ़ाइल बनाएँ")} <span aria-hidden="true">→</span></button>
              <a className="welcome-secondary welcome-anchor-button" href="#explore">{t("Explore the lab", "लैब देखें")} <span aria-hidden="true">↓</span></a>
              <button className="welcome-secondary" type="button" onClick={() => { closeMenu(); setOpenPanel("who-made"); }}>{t("Who made?", "इसे किसने बनाया?")}</button>
            </div>
            <span className="welcome-controls">{t("WASD move", "WASD से चलें")} <b>·</b> {t("Mouse look", "माउस से देखें")} <b>·</b> {t("Shift sprint", "Shift से तेज़ चलें")}</span>
          </div>
          <div className="welcome-facts" aria-label={t("Project highlights", "प्रोजेक्ट की खास बातें")}>
            <span><b>{NCERT_REACTIONS.length}</b> {t("reaction models", "अभिक्रिया मॉडल")}</span>
            <span><b>4</b> {t("class levels", "कक्षा स्तर")}</span>
            <span><b>3D</b> {t("walk-through lab", "वर्चुअल लैब")}</span>
          </div>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="welcome-glow" />
          <div className="molecule molecule-a"><i /><i /><i /><b /><b /></div>
          <div className="molecule molecule-b"><i /><i /><b /><b /></div>
          <div className="welcome-flask"><div className="flask-neck" /><div className="flask-glass"><span /></div></div>
          <span className="art-label label-reaction">{t("REACTION / 01", "अभिक्रिया / 01")}</span>
          <span className="art-label label-observation">{t("OBSERVE THE CHANGE", "बदलाव को देखें")}</span>
          <span className="art-chip art-chip-top"><i /> {t("LIVE LAB · 3D", "लाइव लैब · 3D")}</span>
          <span className="art-chip art-chip-bottom">H₂ + O₂ <b>→</b> H₂O</span>
        </div>
        <a className="welcome-hero-scroll" href="#explore"><span /> {t("Scroll to explore", "आगे देखने के लिए स्क्रॉल करें")}</a>
      </section>

      <section className="welcome-section welcome-intro scroll-reveal" id="explore" data-reveal aria-labelledby="explore-title">
        <div className="welcome-section-heading">
          <span className="welcome-section-kicker">{t("A LAB YOU CAN WALK THROUGH", "एक ऐसी लैब जहाँ आप चल सकते हैं")}</span>
          <h2 id="explore-title">{language === "hi" ? <>रसायन विज्ञान तब बेहतर लगता है जब आप इसे <em>होते देख सकें।</em></> : <>Chemistry is better when you can <em>see it happen.</em></>}</h2>
          <p>{t("Explore a 3D classroom built around your school chemistry: from labelled shelves to a reaction bench and a separate quiz room.", "स्कूल के रसायन विज्ञान पर बनी 3D कक्षा देखें: लेबल वाली शेल्फ़, अभिक्रिया टेबल और अलग क्विज़ रूम।")}</p>
        </div>
        <div className="welcome-steps">
          <article className="welcome-step-card"><span className="step-number">01</span><div className="step-visual step-shelves" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><h3>{t("Find a sample", "रसायन चुनें")}</h3><p>{t("Browse labelled chemical bottles or search the class library.", "लेबल लगी बोतलें देखें या कक्षा की सूची में खोजें।")}</p></article>
          <article className="welcome-step-card"><span className="step-number">02</span><div className="step-visual step-mix" aria-hidden="true"><i /><b>+</b><i /><b>→</b><i /></div><h3>{t("Watch reactions", "अभिक्रिया देखें")}</h3><p>{t("Bring samples to the bench and view a balanced curriculum model.", "रसायन टेबल पर लाएँ और संतुलित पाठ्यक्रम मॉडल देखें।")}</p></article>
          <article className="welcome-step-card"><span className="step-number">03</span><div className="step-visual step-quiz" aria-hidden="true"><i>1</i><i>2</i><i>3</i><i>4</i></div><h3>{t("Test your learning", "सीखकर देखें")}</h3><p>{t("Take a class-wise quiz with feedback and a shareable result.", "प्रतिक्रिया और साझा करने योग्य परिणाम वाला कक्षा-वार क्विज़ दें।")}</p></article>
        </div>
      </section>

      <section className="welcome-section welcome-class-section scroll-reveal" id="classes" data-reveal aria-labelledby="class-title">
        <div className="welcome-section-heading welcome-section-heading-row">
          <div><span className="welcome-section-kicker">{t("FOUR CLASS LEVELS", "चार कक्षा स्तर")}</span><h2 id="class-title">{language === "hi" ? <>अपने <em>पाठ्यक्रम</em> से शुरू करें।</> : <>Start with your <em>syllabus.</em></>}</h2></div>
          <p>{t("Each class includes reactions from earlier classes in the in-app NCERT catalogue.", "हर कक्षा में ऐप की NCERT सूची से पिछली कक्षाओं की अभिक्रियाएँ भी शामिल हैं।")}</p>
        </div>
        <div className="welcome-class-grid">
          {classCounts.map(({ classLevel, count }) => <article className="welcome-class-card" key={classLevel}>
            <span>{t("CLASS", "कक्षा")}</span><strong>{classLevel}</strong><p>{count} {t("reaction models", "अभिक्रिया मॉडल")}</p><i aria-hidden="true">↗</i>
          </article>)}
        </div>
      </section>

      <section className="welcome-cta-band scroll-reveal" data-reveal>
        <div><span className="welcome-section-kicker">{t("YOUR BENCH IS READY", "आपकी लैब तैयार है")}</span><h2>{language === "hi" ? <>अगली अभिक्रिया <em>आपकी है।</em></> : <>Make the next reaction <em>yours.</em></>}</h2><p>{t("Create a profile with your class to open the lab.", "कक्षा चुनकर प्रोफ़ाइल बनाएँ और लैब खोलें।")}</p></div>
        <button className="welcome-enter magnetic-button" type="button" onClick={openProfile}>{t("Create profile", "प्रोफ़ाइल बनाएँ")} <span aria-hidden="true">→</span></button>
        <div className="cta-orbit" aria-hidden="true"><i /><i /><i /></div>
      </section>

      <section className="welcome-section welcome-faq scroll-reveal" id="faq" data-reveal aria-labelledby="faq-title">
        <div className="welcome-section-heading"><span className="welcome-section-kicker">{t("GOOD TO KNOW", "जानने योग्य बातें")}</span><h2 id="faq-title">{language === "hi" ? <>अंदर आने से पहले <em>कुछ सवाल?</em></> : <>Questions before <em>you enter?</em></>}</h2></div>
        <div className="welcome-faq-list">
          {FAQS.map(({ question, answer }, index) => <details key={question}>
            <summary>{language === "hi" ? FAQS_HI[index][0] : question}<span aria-hidden="true">+</span></summary><p>{language === "hi" ? FAQS_HI[index][1] : answer}</p>
          </details>)}
        </div>
      </section>

      <footer className="welcome-footer" id="contact">
        <a className="welcome-footer-brand" href="#top" aria-label={t("Chemistry World home", "Chemistry World का मुख्य पृष्ठ")}><span className="welcome-mark" aria-hidden="true">CW</span><span>Chemistry World<small>{t("Made for curious minds.", "जिज्ञासु मन के लिए बनाया।")}</small></span></a>
        <div className="welcome-footer-links" aria-label={t("Footer navigation", "पृष्ठ के नीचे के लिंक")}>
          <a href="#explore">{t("Explore", "जानें")}</a><a href="#classes">{t("Classes", "कक्षाएँ")}</a><a href="#faq">{t("FAQ", "सवाल-जवाब")}</a>
          <button type="button" onClick={() => setOpenPanel("who-made")}>{t("About the creator", "निर्माता के बारे में")}</button>
        </div>
        <div className="welcome-footer-contact" aria-label={t("Social media and contact", "सोशल मीडिया और संपर्क")}>
          <strong className="welcome-social-heading">{t("Social media", "सोशल मीडिया")}</strong>
          {SOCIAL_LINKS.map(([platform, handle, href]) => <a key={platform} href={href} target="_blank" rel="noreferrer">{platform} · {handle} <span aria-hidden="true">↗</span></a>)}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          <span className="welcome-phone">{t("Phone", "फ़ोन")} · 870806****</span>
        </div>
        <div className="welcome-footer-bottom"><span>© {new Date().getFullYear()} Chemistry World · Ansh Dhiman</span><span>{t("Curriculum models for learning", "सीखने के लिए पाठ्यक्रम मॉडल")}</span></div>
      </footer>
    </div>

    <div className="welcome-floating-tools">
      <a className="welcome-contact-float magnetic-button" href="#contact" aria-label={t("Open social and contact links", "सोशल और संपर्क लिंक खोलें")}><span aria-hidden="true">✉</span><small>{t("Contact", "संपर्क")}</small></a>
      <button className="welcome-top-float" type="button" onClick={() => pageRef.current?.scrollBy({ top: -pageRef.current.clientHeight * 0.82, behavior: "smooth" })} aria-label={t("Scroll up", "ऊपर जाएँ")}>↑</button>
      <button className="welcome-top-float welcome-bottom-float" type="button" onClick={() => pageRef.current?.scrollBy({ top: pageRef.current.clientHeight * 0.82, behavior: "smooth" })} aria-label={t("Scroll down", "नीचे जाएँ")}>↓</button>
    </div>
    <div className="welcome-custom-cursor" ref={cursorRef} aria-hidden="true"><svg viewBox="0 0 32 40"><path d="M12 3h8v8l5 6v17a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V17l5-6z" fill="#fff7e9" stroke="#754a2c" strokeWidth="2"/><path d="M9 24h14v10H9z" fill="#63cbb3"/><path d="M12 3h8v5h-8z" fill="#b6322a"/><circle cx="13" cy="27" r="1.3" fill="#fff"/><circle cx="18" cy="30" r="1" fill="#fff"/></svg></div>
    <div className={`welcome-loader ${loading ? "is-visible" : ""}`} aria-hidden="true"><span className="welcome-loader-mark">CW</span><i /><small>{t("PREPARING THE LAB", "लैब तैयार हो रही है")}</small></div>

    {openPanel && <div className="welcome-info-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) setOpenPanel(null);
    }}>
      <section className="welcome-info-panel" role="dialog" aria-modal="true" aria-labelledby="welcome-info-title">
        <button className="welcome-info-close" type="button" aria-label={t("Close", "बंद करें")} onClick={() => setOpenPanel(null)}>×</button>
        <span className="welcome-info-eyebrow">{t("THE CREATOR", "निर्माता")}</span>
        <h2 id="welcome-info-title">{t("Who made this?", "इसे किसने बनाया?")}</h2>
        <div className="creator-profile-mark" aria-hidden="true">AD</div>
        <h3 className="creator-profile-name">{creatorProfile.name}</h3>
        <p className="creator-profile-role">{t(creatorProfile.role, "Chemistry World के निर्माता")}</p>
        <p className="creator-profile-bio">{t(creatorProfile.bio, "यह एक इंटरैक्टिव सीखने का प्रोजेक्ट है, जहाँ चलने-फिरने वाली वर्चुअल लैब, अभिक्रिया मॉडल और कक्षा-वार क्विज़ के ज़रिए NCERT रसायन विज्ञान को समझाया गया है।")}</p>
        <a className="creator-email-link" href={`mailto:${EMAIL}`}>{EMAIL}</a>
      </section>
    </div>}
    {profileOpen && <ProfileAccess onClose={() => setProfileOpen(false)} onContinue={(profile) => {
      setProfileOpen(false);
      onEnter(profile);
    }} />}
    {entrySequence && <div className="lab-entry-sequence" role="status" aria-live="polite">
      <div className="entry-doorway" aria-hidden="true">
        <div className="entry-door-panel entry-door-left"><span>{t("CHEMISTRY", "रसायन विज्ञान")}</span></div>
        <div className="entry-door-panel entry-door-right"><span>{t("LAB", "लैब")}</span></div>
        <div className="entry-door-light" />
      </div>
      <div className="entry-welcome-card">
        <span className="entry-welcome-kicker">{t("THE DOORS ARE OPEN", "दरवाज़े खुल गए हैं")}</span>
        <strong>{t("Welcome to Chemistry Lab", "रसायन विज्ञान लैब में आपका स्वागत है")}</strong>
        <span>{t("Made by Ansh Dhiman", "निर्माता: Ansh Dhiman")}</span>
      </div>
    </div>}
  </main>;
}
