import { useCallback, useEffect, useRef, useState } from "react";

export default function MobileLabControls({ moveRef }) {
  const [activeDirections, setActiveDirections] = useState(new Set());
  const activeKeys = useRef(new Map()); // id -> direction
  const sprintActive = useRef(false);
  const [sprinting, setSprinting] = useState(false);

  // Keep a direct ref as the source of truth. Player reads it every frame,
  // so touch input does not depend on event timing across the canvas overlay.
  const updateMovement = useCallback(() => {
    const directions = new Set(activeKeys.current.values());
    setActiveDirections(directions);

    const x = (directions.has("right") ? 1 : 0) - (directions.has("left") ? 1 : 0);
    const y = (directions.has("up") ? 1 : 0) - (directions.has("down") ? 1 : 0);

    if (moveRef) {
      moveRef.current = { ...moveRef.current, x, y, sprinting: sprintActive.current };
    }

    window.dispatchEvent(
      new CustomEvent("chemistry-lab-move", {
        detail: { x, y, sprinting: sprintActive.current },
      })
    );
  }, [moveRef]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (moveRef) moveRef.current = { ...moveRef.current, x: 0, y: 0, sprinting: false };
      window.dispatchEvent(
        new CustomEvent("chemistry-lab-move", {
          detail: { x: 0, y: 0, sprinting: false },
        })
      );
    };
  }, [moveRef]);

  // Handle global window release to avoid stuck buttons
  useEffect(() => {
    const onGlobalRelease = (event) => {
      // Releasing jump/interact with the other thumb must not cancel walking.
      if (event.pointerId != null && activeKeys.current.delete(event.pointerId)) updateMovement();
    };
    const onBlur = () => {
      if (activeKeys.current.size) {
        activeKeys.current.clear();
        updateMovement();
      }
      sprintActive.current = false;
      setSprinting(false);
      updateMovement();
    };

    window.addEventListener("pointerup", onGlobalRelease);
    window.addEventListener("pointercancel", onGlobalRelease);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onBlur);

    return () => {
      window.removeEventListener("pointerup", onGlobalRelease);
      window.removeEventListener("pointercancel", onGlobalRelease);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onBlur);
    };
  }, [updateMovement]);

  // Press down handler (pointer, touch, or mouse)
  const handleDirectionPress = (direction) => (event) => {
    event.preventDefault();
    event.stopPropagation();
    const id = event.pointerId ?? (event.touches ? event.touches[0]?.identifier ?? "touch" : "mouse");
    // Avoid pointer capture: it can steal the other thumb's touch on phones.
    activeKeys.current.set(id, direction);
    updateMovement();
  };

  // Release handler
  const handleDirectionRelease = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const id = event.pointerId ?? (event.touches ? event.touches[0]?.identifier ?? "touch" : "mouse");
    activeKeys.current.delete(id);
    // Also remove mouse key if triggered
    activeKeys.current.delete("mouse");
    updateMovement();
  };

  const handlePointerMove = (event) => {
    if (activeKeys.current.size === 0) return;
    const clientX = event.clientX ?? (event.touches ? event.touches[0]?.clientX : null);
    const clientY = event.clientY ?? (event.touches ? event.touches[0]?.clientY : null);
    if (clientX == null || clientY == null) return;
    const element = document.elementFromPoint(clientX, clientY);
    const targetDir = element?.closest("[data-direction]")?.getAttribute("data-direction");
    const id = event.pointerId ?? "touch";
    if (targetDir && activeKeys.current.get(id) !== targetDir) {
      activeKeys.current.set(id, targetDir);
      updateMovement();
    }
  };

  const toggleSprint = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    sprintActive.current = !sprintActive.current;
    setSprinting(sprintActive.current);
    updateMovement();
  };

  const triggerJump = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    window.dispatchEvent(new Event("chemistry-lab-jump"));
  };

  const triggerInteract = (event) => {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    window.dispatchEvent(new Event("chemistry-lab-hand-interact"));
  };

  return (
    <>
      <div className="mobile-lab-controls" aria-label="Touch controls">
        {/* D-Pad Movement Controller */}
        <div className="mobile-direction-pad" aria-label="Movement controls">
          <button
            type="button"
            data-direction="up"
            className={`mobile-direction mobile-direction-up ${activeDirections.has("up") ? "is-active" : ""}`}
            aria-label="Move forward"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={handleDirectionPress("up")}
            onPointerUp={handleDirectionRelease}
            onPointerCancel={handleDirectionRelease}
            onPointerMove={handlePointerMove}
          >
            <span>▲</span>
          </button>

          <button
            type="button"
            data-direction="left"
            className={`mobile-direction mobile-direction-left ${activeDirections.has("left") ? "is-active" : ""}`}
            aria-label="Move left"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={handleDirectionPress("left")}
            onPointerUp={handleDirectionRelease}
            onPointerCancel={handleDirectionRelease}
            onPointerMove={handlePointerMove}
          >
            <span>◀</span>
          </button>

          <button
            type="button"
            data-direction="down"
            className={`mobile-direction mobile-direction-down ${activeDirections.has("down") ? "is-active" : ""}`}
            aria-label="Move backward"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={handleDirectionPress("down")}
            onPointerUp={handleDirectionRelease}
            onPointerCancel={handleDirectionRelease}
            onPointerMove={handlePointerMove}
          >
            <span>▼</span>
          </button>

          <button
            type="button"
            data-direction="right"
            className={`mobile-direction mobile-direction-right ${activeDirections.has("right") ? "is-active" : ""}`}
            aria-label="Move right"
            onContextMenu={(e) => e.preventDefault()}
            onPointerDown={handleDirectionPress("right")}
            onPointerUp={handleDirectionRelease}
            onPointerCancel={handleDirectionRelease}
            onPointerMove={handlePointerMove}
          >
            <span>▶</span>
          </button>

          {/* Center decorative hub */}
          <div className="mobile-dpad-center" aria-hidden="true">
            <span className="mobile-dpad-dot" />
          </div>
        </div>

        {/* Action Buttons: Sprint, Interact, Jump */}
        <div className="mobile-action-buttons">
          <button
            type="button"
            className={`mobile-action-btn mobile-sprint-btn ${sprinting ? "is-sprinting" : ""}`}
            aria-label="Toggle Sprint"
            title="Sprint"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={toggleSprint}
          >
            <span>⚡</span>
          </button>

          <button
            type="button"
            className="mobile-action-btn mobile-interact-btn"
            aria-label="Interact"
            title="Interact"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={triggerInteract}
          >
            <span>✋</span>
          </button>

          <button
            type="button"
            className="mobile-action-btn mobile-jump-btn"
            aria-label="Jump"
            title="Jump"
            onClick={triggerJump}
          >
            <span>▲</span>
          </button>
        </div>
      </div>
    </>
  );
}
