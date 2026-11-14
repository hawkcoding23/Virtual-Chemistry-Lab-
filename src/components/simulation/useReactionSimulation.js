import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildExperimentConfig } from "./simulationEngine";

const REACTION_DURATION_SECONDS = 17;

export function useReactionSimulation(reaction, allChemicals) {
  const [reactionProgress, setReactionProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [explanationOpen, setExplanationOpen] = useState(false);

  const config = useMemo(() => reaction ? buildExperimentConfig(reaction, allChemicals) : null,
    [reaction, allChemicals]);
  const frameRef = useRef(null);
  const lastFrameRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = 0;
    lastFrameRef.current = null;
    setReactionProgress(0);
    setIsPlaying(true);
    setExplanationOpen(false);
  }, [reaction?.runId]);

  useEffect(() => {
    if (!reaction || !config || !isPlaying) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastFrameRef.current = null;
      return undefined;
    }

    const tick = (now) => {
      if (lastFrameRef.current === null) lastFrameRef.current = now;
      const elapsed = Math.min(0.08, (now - lastFrameRef.current) / 1000);
      lastFrameRef.current = now;
      progressRef.current = Math.min(1, progressRef.current + elapsed * playbackSpeed / REACTION_DURATION_SECONDS);
      setReactionProgress(progressRef.current);

      if (progressRef.current >= 1) {
        setIsPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [reaction, config, isPlaying, playbackSpeed]);

  const togglePlay = useCallback(() => {
    if (progressRef.current >= 1) {
      progressRef.current = 0;
      setReactionProgress(0);
    }
    lastFrameRef.current = null;
    setIsPlaying((playing) => !playing);
  }, []);

  const reset = useCallback(() => {
    progressRef.current = 0;
    lastFrameRef.current = null;
    setReactionProgress(0);
    setIsPlaying(true);
  }, []);

  const toggleSpeed = useCallback(() => {
    setPlaybackSpeed((speed) => speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1);
  }, []);

  const toggleExplanation = useCallback(() => setExplanationOpen((open) => !open), []);

  return { config, reactionProgress, isPlaying, playbackSpeed, explanationOpen, togglePlay, reset, toggleSpeed, toggleExplanation };
}
