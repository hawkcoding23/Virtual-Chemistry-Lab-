import { useEffect, useRef, useState } from "react";
import { createProfile } from "../data/profileStore";
import { firebaseConfigured, loadUserProfile, signInWithGoogle, watchAuth, saveUserProfile } from "../data/firebaseClient";
import { useLanguage } from "../i18n";

export default function ProfileAccess({ onContinue, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", curriculum: "9" });
  const [user, setUser] = useState(null);
  const [savedProfile, setSavedProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const continueTimer = useRef(null);

  useEffect(() => {
    let active = true;
    const unsubscribe = watchAuth(async (currentUser) => {
      if (!active) return;
      setUser(currentUser);
      setAuthReady(true);
      setError("");
      setProfileReady(!currentUser);
      if (!currentUser) {
        setSavedProfile(null);
        return;
      }
      setBusy(true);
      try {
        const remote = await loadUserProfile(currentUser.uid);
        if (!active) return;
        setSavedProfile(remote);
        const classLevel = remote?.classLevel;
        setForm({
          name: remote?.name || currentUser.displayName || "",
          curriculum: remote?.studyTrack === "all" ? "all" : [9, 10, 11, 12].includes(Number(classLevel)) ? String(classLevel) : "9",
        });
        setProfileReady(true);
      } catch (loadError) {
        if (active) setError(`Could not load your cloud notebook: ${loadError.message}`);
      } finally {
        if (active) setBusy(false);
      }
    });
    return () => { active = false; unsubscribe(); window.clearTimeout(continueTimer.current); };
  }, []);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const googleSignIn = async () => {
    setBusy(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(signInError.code === "auth/popup-closed-by-user" ? "Google sign-in was closed. Try again when ready." : signInError.message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!user || !profileReady) return;
    const name = form.name.trim();
    if (!name || name.length > 40) {
      setError("Enter a name between 1 and 40 characters.");
      return;
    }
    const isAllClasses = form.curriculum === "all";
    const details = {
      uid: user.uid,
      email: user.email ?? "",
      name,
      classLevel: isAllClasses ? null : Number(form.curriculum),
      studyTrack: isAllClasses ? "all" : "ncert",
      existingProgress: savedProfile,
    };
    const profile = createProfile(details);
    setBusy(true);
    setError("");
    try {
      await saveUserProfile(user.uid, profile);
      setSuccess(savedProfile ? "Welcome back. Your cloud notebook is ready…" : "Account ready. Your notebook will sync across devices…");
      continueTimer.current = window.setTimeout(() => onContinue(profile), 450);
    } catch (saveError) {
      setError(`Could not save your cloud notebook: ${saveError.message}`);
    } finally {
      setBusy(false);
    }
  };

  const closeForm = () => {
    window.clearTimeout(continueTimer.current);
    onClose();
  };

  return <div className="profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
    <form className="profile-card" onSubmit={submit} aria-labelledby="profile-title">
      <button className="welcome-info-close" type="button" aria-label="Close profile form" onClick={closeForm}>×</button>
      <span className="welcome-info-eyebrow">{t("YOUR CHEMISTRY NOTEBOOK")}</span>
      <h2 id="profile-title">{t("Enter the lab")}</h2>
      <p className="profile-subtitle">{t("Sign in with Google once. Your name, class, and lab notebook will be saved to your account.")}</p>
      {!firebaseConfigured && <p className="profile-error" role="alert">Google sign-in needs the Firebase web configuration before it can be used.</p>}
      {!user ? <button className="profile-submit google-signin-button" type="button" onClick={googleSignIn} disabled={!firebaseConfigured || busy || !authReady}>
        <span aria-hidden="true">G</span> {busy ? t("Connecting…") : t("Continue with Google")}
      </button> : <>
        <p className="google-account-badge">✓ {user.email} · {t("Google verified")}</p>
        <div className="profile-fields">
          <label>{t("Your name")}<input value={form.name} onChange={update("name")} autoComplete="name" maxLength={40} required /></label>
          <label>{t("Class range")}<select value={form.curriculum} onChange={update("curriculum")}>
            {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)} · {t("Ncert")}</option>)}
            <option value="all">{t("All classes")} · {t("Classes 9–12")}</option>
          </select></label>
        </div>
        <small className="profile-storage-note">{t("Your class and learning progress sync privately to this Google account. The welcome screen will still appear whenever you open the site.")}</small>
      </>}
      {busy && user && !profileReady && <p className="profile-storage-note" role="status">{t("Loading your saved notebook…")}</p>}
      {error && <p className="profile-error" role="alert">{error}</p>}
      {success && <p className="profile-success" role="status">{t(success)}</p>}
      {user && <button className="profile-submit" type="submit" disabled={Boolean(success) || busy || !profileReady}>{t(savedProfile ? "Save and enter the lab" : "Save profile and enter the lab")}<span>→</span></button>}
      <small className="profile-storage-note">{t("You will stay signed in on this browser until you sign out.")}</small>
    </form>
  </div>;
}
