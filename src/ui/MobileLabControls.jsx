import { useEffect, useRef } from "react";

export default function MobileLabControls({ moveRef }) {
  const held = useRef(new Map());
  const syncMovement = () => {
    const active = new Set(held.current.values());
    moveRef.current = {
      x: Number(active.has("right")) - Number(active.has("left")),
      y: Number(active.has("up")) - Number(active.has("down")),
    };
  };
  useEffect(() => () => { moveRef.current = { x: 0, y: 0 }; }, [moveRef]);
  const directionButton = (direction, label, glyph) => <button
    key={direction}
    type="button"
    className={`mobile-direction mobile-direction-${direction}`}
    aria-label={label}
    onContextMenu={(event) => event.preventDefault()}
    onPointerDown={(event) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture?.(event.pointerId);
      held.current.set(event.pointerId, direction);
      syncMovement();
    }}
    onPointerUp={(event) => {
      event.preventDefault();
      held.current.delete(event.pointerId);
      syncMovement();
    }}
    onPointerCancel={(event) => {
      held.current.delete(event.pointerId);
      syncMovement();
    }}
    onLostPointerCapture={(event) => {
      if (held.current.has(event.pointerId)) {
        held.current.delete(event.pointerId);
        syncMovement();
      }
    }}
  >{glyph}</button>;

  return <>
    <div className="mobile-rotate-prompt" role="status"><span>↻</span><strong>Rotate your phone</strong><small>Turn to landscape to enter the chemistry lab.</small></div>
    <div className="mobile-lab-controls" aria-label="Touch controls">
      <div className="mobile-direction-pad" aria-label="Movement controls">
        {directionButton("up", "Move forward", "↑")}
        {directionButton("left", "Move left", "←")}
        {directionButton("down", "Move backward", "↓")}
        {directionButton("right", "Move right", "→")}
      </div>
      <div className="mobile-action-buttons">
        <button type="button" aria-label="Interact" title="Interact" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-hand-interact"))}>✋</button>
        <button type="button" aria-label="Jump" title="Jump" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-jump"))}>↑</button>
      </div>
    </div>
  </>;
}
