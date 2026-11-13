// Web Audio API Synthesizer for Virtual Chemistry Lab
// Uses the supplied audio clips for movement and quiz feedback, with Web Audio
// synthesis retained for pickup, liquid pouring, and chemical reactions:
// 1. Looping walking / sprinting recordings
// 2. Chemical bottle pickup
// 3. Quiz correct answer victory chime
// 4. Liquid pouring / stream
// 5. Chemical reaction (effervescence fizz, exothermic whoosh/flare, crystallization)

class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.walkingEnabled = true;
    this.reactionEnabled = true;
    this.movementAudio = null;
    this.movementKind = null;
    this.activeAudio = new Set();
    this.quizFeedbackAudio = new Set();
    this.quizFeedbackVersion = 0;
    this.isPouring = false;
    this.pourSource = null;
    this.pourGain = null;
    this.pourNodes = [];
    this.reactionActive = false;
    this.reactionNodes = [];

    // Auto-unlock Web Audio on first user interaction
    if (typeof window !== "undefined") {
      const unlock = () => {
        this.getAudioContext();
        window.removeEventListener("pointerdown", unlock);
        window.removeEventListener("keydown", unlock);
        window.removeEventListener("click", unlock);
      };
      window.addEventListener("pointerdown", unlock, { passive: true });
      window.addEventListener("keydown", unlock, { passive: true });
      window.addEventListener("click", unlock, { passive: true });
    }
  }

  getAudioContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  unlockAudio() {
    return this.getAudioContext();
  }

  playWelcomeSound() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const start = ctx.currentTime;
    // A soft, rising three-note chime gives the arrival moment a warm cue.
    [523.25, 659.25, 783.99].forEach((frequency, index) => {
      const at = start + index * 0.16;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.linearRampToValueAtTime(index === 2 ? 0.095 : 0.07, at + 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.85);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.9);
    });
  }

  playGateSound(opening = true) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;
    const start = ctx.currentTime;
    const creak = ctx.createOscillator();
    const creakGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    creak.type = "sawtooth";
    creak.frequency.setValueAtTime(opening ? 210 : 155, start);
    creak.frequency.exponentialRampToValueAtTime(opening ? 128 : 205, start + 0.52);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(520, start);
    filter.frequency.exponentialRampToValueAtTime(260, start + 0.56);
    creakGain.gain.setValueAtTime(0.0001, start);
    creakGain.gain.linearRampToValueAtTime(0.035, start + 0.08);
    creakGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.62);
    creak.connect(filter);
    filter.connect(creakGain);
    creakGain.connect(ctx.destination);
    creak.start(start);
    creak.stop(start + 0.64);

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = "sine";
    thud.frequency.setValueAtTime(opening ? 86 : 102, start + 0.57);
    thud.frequency.exponentialRampToValueAtTime(42, start + 0.82);
    thudGain.gain.setValueAtTime(0.0001, start + 0.57);
    thudGain.gain.linearRampToValueAtTime(0.12, start + 0.59);
    thudGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(start + 0.57);
    thud.stop(start + 0.87);
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMovementSound();
      this.stopQuizFeedback();
      this.activeAudio.forEach((audio) => { audio.pause(); audio.currentTime = 0; });
      this.activeAudio.clear();
      this.stopPourSound();
      this.stopReactionSound();
    }
    return this.muted;
  }

  isMuted() {
    return this.muted;
  }

  // 1. LOOPED WALKING / SPRINTING AUDIO
  updateMovementSound(isMoving, isSprinting = false) {
    if (this.muted || !this.walkingEnabled || !isMoving) {
      this.stopMovementSound();
      return;
    }
    const kind = isSprinting ? "running" : "walking";
    if (this.movementKind === kind && this.movementAudio) return;
    this.stopMovementSound();
    this.movementKind = kind;
    this.movementAudio = new Audio(`/audio/${kind}.mp3`);
    this.movementAudio.loop = true;
    this.movementAudio.preload = "auto";
    this.movementAudio.volume = kind === "running" ? 0.88 : 1;
    this.movementAudio.play().catch(() => {});
  }

  stopMovementSound() {
    if (this.movementAudio) {
      this.movementAudio.pause();
      this.movementAudio.currentTime = 0;
    }
    this.movementAudio = null;
    this.movementKind = null;
  }

  playAudioFile(path, volume = 0.8, onEnded, collection = null) {
    if (this.muted || typeof Audio === "undefined") return null;
    const audio = new Audio(path);
    audio.volume = volume;
    this.activeAudio.add(audio);
    collection?.add(audio);
    const cleanup = () => {
      this.activeAudio.delete(audio);
      collection?.delete(audio);
    };
    audio.addEventListener("ended", () => {
      cleanup();
      onEnded?.();
    }, { once: true });
    audio.addEventListener("error", cleanup, { once: true });
    audio.play().catch(cleanup);
    return audio;
  }

  stopQuizFeedback() {
    // Invalidate delayed follow-up clips (for example the wrong-answer sting)
    // before stopping every currently playing quiz clip.
    this.quizFeedbackVersion += 1;
    this.quizFeedbackAudio.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      this.activeAudio.delete(audio);
    });
    this.quizFeedbackAudio.clear();
  }

  // 2. PICKING UP CHEMICAL BOTTLE SOUND
  playPickupSound() {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24, t);
    masterGain.connect(ctx.destination);

    // Resonant glass clink frequencies (bell-like high resonance)
    const freqs = [1850, 2420, 3350];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * (0.98 + Math.random() * 0.04), t);

      const decay = 0.09 + idx * 0.04;
      gain.gain.setValueAtTime(idx === 0 ? 0.45 : 0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + decay);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(t);
      osc.stop(t + decay);
    });

    // Glass contact click transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = "triangle";
    clickOsc.frequency.setValueAtTime(650, t);
    clickOsc.frequency.exponentialRampToValueAtTime(120, t + 0.02);
    clickGain.gain.setValueAtTime(0.3, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);

    clickOsc.connect(clickGain);
    clickGain.connect(masterGain);
    clickOsc.start(t);
    clickOsc.stop(t + 0.025);
  }

  // 3. CORRECT ANSWER SOUND IN QUIZ
  playCorrectSound() {
    if (this.muted) return;
    this.stopQuizFeedback();
    this.playAudioFile("/audio/applause.wav", 0.82, null, this.quizFeedbackAudio);
  }

  playIncorrectSound() {
    if (this.muted) return;
    this.stopQuizFeedback();
    const version = this.quizFeedbackVersion;
    this.playAudioFile("/audio/wrong-answer.mp3", 0.86, () => {
      if (!this.muted && version === this.quizFeedbackVersion) {
        this.playAudioFile("/audio/faahhhhh.mp3", 0.78, null, this.quizFeedbackAudio);
      }
    }, this.quizFeedbackAudio);
  }

  playBottleRemoveSound() {
    this.playAudioFile("/audio/glass-smash.mp3", 0.72);
  }

  // 4. CHEMICAL POURING SOUND
  playPourSound(duration = 1.3) {
    if (this.muted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.stopPourSound();
    const t = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * Math.max(duration, 0.5));
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    // Brown/pink modulated noise for liquid turbulence
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.03 * white) / 1.03;
      data[i] = lastOut * 3.5;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(580, t);
    filter.frequency.linearRampToValueAtTime(920, t + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(740, t + duration);
    filter.Q.setValueAtTime(3.2, t);

    // Modulated liquid bubbles
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(14, t);
    lfoGain.gain.setValueAtTime(180, t);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(t);
    lfo.stop(t + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.26, t + 0.15);
    gain.gain.setValueAtTime(0.26, t + duration - 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + duration);
    this.pourNodes = [noise, lfo];

    this.pourSource = noise;
    this.pourGain = gain;
  }

  stopPourSound() {
    this.pourNodes.forEach((node) => {
      try { node.stop(); } catch {}
      try { node.disconnect(); } catch {}
    });
    this.pourNodes = [];
    this.pourSource = null;
    this.pourGain = null;
  }

  // 5. CHEMICAL REACTION SOUND
  // Adapts dynamically: bubbling fizz for gas, sizzling whoosh/crackle for heat/light, shimmer for precipitates
  playReactionSound({ gas = false, heat = false, light = false, precipitate = false, duration = 2.4 } = {}) {
    if (this.muted || !this.reactionEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.stopReactionSound();
    const t = ctx.currentTime;
    const nodes = [];

    // A. Gas effervescence / bubbling sizzle
    if (gas || (!heat && !light)) {
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const fizzBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = fizzBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        // High frequency fizzy bursts
        data[i] = (Math.random() * 2 - 1) * (0.6 + 0.4 * Math.sin(i / 180));
      }
      const fizzSource = ctx.createBufferSource();
      fizzBuffer.loop = false;
      fizzSource.buffer = fizzBuffer;

      const hipass = ctx.createBiquadFilter();
      hipass.type = "highpass";
      hipass.frequency.setValueAtTime(2400, t);

      const fizzGain = ctx.createGain();
      fizzGain.gain.setValueAtTime(0.0001, t);
      fizzGain.gain.linearRampToValueAtTime(gas ? 0.32 : 0.18, t + 0.25);
      fizzGain.gain.setValueAtTime(gas ? 0.3 : 0.16, t + duration * 0.6);
      fizzGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      fizzSource.connect(hipass);
      hipass.connect(fizzGain);
      fizzGain.connect(ctx.destination);
      fizzSource.start(t);
      fizzSource.stop(t + duration);
      nodes.push(fizzSource);
    }

    // B. Exothermic heat flare / energetic whoosh
    if (heat || light) {
      const whooshBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
      const data = whooshBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const whooshSource = ctx.createBufferSource();
      whooshSource.buffer = whooshBuffer;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.setValueAtTime(220, t);
      lowpass.frequency.exponentialRampToValueAtTime(1400, t + 0.6);
      lowpass.frequency.exponentialRampToValueAtTime(260, t + duration);

      const whooshGain = ctx.createGain();
      whooshGain.gain.setValueAtTime(0.0001, t);
      whooshGain.gain.linearRampToValueAtTime(light ? 0.38 : 0.26, t + 0.35);
      whooshGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

      whooshSource.connect(lowpass);
      lowpass.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshSource.start(t);
      whooshSource.stop(t + duration);
      nodes.push(whooshSource);
    }

    // C. Precipitation / crystallization chime shimmer
    if (precipitate) {
      [880, 1174, 1480, 1760].forEach((freq, idx) => {
        const noteTime = t + 0.4 + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.12, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(noteTime);
        osc.stop(noteTime + 0.65);
        nodes.push(osc);
      });
    }

    this.reactionNodes = nodes;
  }

  stopReactionSound() {
    this.reactionNodes.forEach((node) => {
      try {
        node.stop();
        node.disconnect();
      } catch {}
    });
    this.reactionNodes = [];
  }
}

export const soundManager = new SoundManager();
export default soundManager;
