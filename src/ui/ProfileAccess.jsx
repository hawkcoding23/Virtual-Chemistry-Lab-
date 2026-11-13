import { useEffect, useRef, useState } from "react";
import { createProfile } from "../data/profileStore";
import { useLanguage } from "../i18n";

export default function ProfileAccess({ onContinue, onClose }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", curriculum: "9" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const continueTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(continueTimer.current), []);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
    setSuccess("");
  };

  const submit = (event) => {
    event.preventDefault();
    const name = form.name.trim();
    if (!name || name.length > 40) {
      setError("Enter a name between 1 and 40 characters.");
      return;
    }
    const isAllClasses = form.curriculum === "all";
    const examTrack = ["jee", "neet"].includes(form.curriculum) ? form.curriculum : isAllClasses ? "all" : "ncert";
    const profile = createProfile({
      name,
      classLevel: examTrack === "ncert" ? Number(form.curriculum) : null,
      studyTrack: examTrack,
    });
    setError("");
    setSuccess(profile.hasPreviousProgress
      ? "Welcome back. Your saved notebook is ready…"
      : "Profile saved on this device. Opening the lab…");
    continueTimer.current = window.setTimeout(() => onContinue(profile), 450);
  };

  const continueAsGuest = () => {
    if (!["9", "10", "11", "12", "all"].includes(form.curriculum)) {
      setError("Choose a class or All classes to enter as a guest.");
      setSuccess("");
      return;
    }
    const guestProfile = form.curriculum === "all"
      ? { name: "Guest", classLevel: null, studyTrack: "all" }
      : { name: "Guest", classLevel: Number(form.curriculum), studyTrack: "ncert" };
    setError("");
    setSuccess(form.curriculum === "all" ? "Guest mode ready. All classes are available for this visit." : "Guest mode ready. Your class is set for this visit.");
    continueTimer.current = window.setTimeout(() => onContinue(guestProfile), 450);
  };

  const closeForm = () => {
    window.clearTimeout(continueTimer.current);
    onClose();
  };

  return <div className="profile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
    <form className="profile-card" onSubmit={submit} aria-labelledby="profile-title">
      <button className="welcome-info-close" type="button" aria-label={t("Close profile form")} onClick={closeForm}>×</button>
      <span className="welcome-info-eyebrow">{t("YOUR CHEMISTRY NOTEBOOK")}</span>
      <h2 id="profile-title">{t("Create profile")}</h2>
      <p className="profile-subtitle">{t("Choose your name and class range, or continue as a guest.")}</p>
      <div className="profile-fields">
        <label>{t("Your name")}<input value={form.name} onChange={update("name")} autoComplete="name" maxLength={40} required /></label>
        <label>{t("Class range")}<select value={form.curriculum} onChange={update("curriculum")}>
          {[9, 10, 11, 12].map((level) => <option key={level} value={level}>{t(`Class ${level}`)} · {t("Ncert")}</option>)}
          <option value="all">{t("All classes")} · {t("Classes 9–12")}</option>
        </select></label>
      </div>
      <small className="profile-storage-note">{t("Choose a class to include that class and earlier classes, or choose All classes to browse Classes 9–12.")}</small>
      {error && <p className="profile-error" role="alert">{t(error)}</p>}
      {success && <p className="profile-success" role="status">{t(success)}</p>}
      <button className="profile-submit" type="submit" disabled={Boolean(success)}>{t("Create profile")}<span>→</span></button>
      <button className="profile-mode-switch" type="button" disabled={Boolean(success)} onClick={continueAsGuest}>{form.curriculum === "all" ? `${t("Continue as guest")} · ${t("All classes")}` : `${t("Continue as guest · Class ")}${form.curriculum}`}</button>
      <small className="profile-storage-note">{t("Profiles save progress in this browser on this device. Guest mode is for this visit only.")}</small>
    </form>
  </div>;
}
