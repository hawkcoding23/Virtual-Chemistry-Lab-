import { memo } from "react";
import { translate } from "../../i18n";

function ReactionNarration({ explanation, currentAction, isPlaying, playbackSpeed, language = "en", narrationEnabled, onTogglePlay, onReset, onToggleSpeed }) {
  return <section className="reaction-live-card" aria-label={translate(language, "What is happening in the reaction")}>
    <div className="reaction-live-explanation">
      <span className="reaction-live-label">{language === "hi" ? "अभी क्या हो रहा है" : "WHAT’S HAPPENING"}</span>
      <p aria-live="polite">{currentAction || explanation}</p>
      {narrationEnabled && <small>{language === "hi" ? "🔊 अभिक्रिया का वर्णन सुनें" : "🔊 Reaction narration enabled"}</small>}
    </div>
    <div className="reaction-simple-controls">
      <button type="button" className="timeline-ctrl-btn play-pause-btn" onClick={onTogglePlay} title={isPlaying ? translate(language, "Pause") : translate(language, "Resume")} aria-label={isPlaying ? translate(language, "Pause") : translate(language, "Resume")}>{isPlaying ? "⏸" : "▶"}</button>
      <button type="button" className="timeline-ctrl-btn reset-btn" onClick={onReset} title={translate(language, "Reset experiment")} aria-label={translate(language, "Reset experiment")}>↺</button>
      <button type="button" className="timeline-ctrl-btn speed-btn" onClick={onToggleSpeed} title={translate(language, "Playback speed")} aria-label={`${translate(language, "Playback speed")}: ${playbackSpeed}x`}>{playbackSpeed}×</button>
    </div>
  </section>;
}

export default memo(ReactionNarration);
