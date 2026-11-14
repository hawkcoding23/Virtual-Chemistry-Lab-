import { useRef, useState } from "react";

export default function MobileLabControls({ moveRef }) {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const pointerId = useRef(null);
  const touchId = useRef(null);
  const updateStick = (clientX, clientY, element) => {
    const rect = element.getBoundingClientRect();
    const radius = rect.width * 0.36;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const length = Math.max(1, Math.hypot(dx, dy));
    const x = Math.max(-1, Math.min(1, dx / Math.max(radius, length)));
    const y = Math.max(-1, Math.min(1, -dy / Math.max(radius, length)));
    moveRef.current = { x, y };
    setStick({ x: x * 28, y: -y * 28 });
  };
  const releaseStick = (event) => {
    if (pointerId.current !== event.pointerId) return;
    pointerId.current = null;
    moveRef.current = { x: 0, y: 0 };
    setStick({ x: 0, y: 0 });
  };
  const onTouchStart = (event) => {
    if (pointerId.current !== null || !event.changedTouches.length) return;
    event.preventDefault();
    const touch = event.changedTouches[0];
    touchId.current = touch.identifier;
    updateStick(touch.clientX, touch.clientY, event.currentTarget);
  };
  const onTouchMove = (event) => {
    if (touchId.current === null) return;
    const touch = Array.from(event.touches).find((item) => item.identifier === touchId.current);
    if (!touch) return;
    event.preventDefault();
    updateStick(touch.clientX, touch.clientY, event.currentTarget);
  };
  const onTouchEnd = (event) => {
    if (touchId.current === null || !Array.from(event.changedTouches).some((item) => item.identifier === touchId.current)) return;
    touchId.current = null;
    moveRef.current = { x: 0, y: 0 };
    setStick({ x: 0, y: 0 });
  };

  return <>
    <div className="mobile-rotate-prompt" role="status"><span>↻</span><strong>Rotate your phone</strong><small>Turn to landscape to enter the chemistry lab.</small></div>
    <div className="mobile-lab-controls" aria-label="Touch controls">
      <div className="mobile-joystick" aria-label="Move joystick"
        onPointerDown={(event) => {
          event.preventDefault();
          pointerId.current = event.pointerId;
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Touch fallback below still handles the drag. */ }
          updateStick(event.clientX, event.clientY, event.currentTarget);
        }}
        onPointerMove={(event) => { if (pointerId.current === event.pointerId) updateStick(event.clientX, event.clientY, event.currentTarget); }}
        onPointerUp={releaseStick} onPointerCancel={releaseStick} onLostPointerCapture={releaseStick}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
        <i style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
      </div>
      <div className="mobile-action-buttons">
        <button type="button" aria-label="Interact" title="Interact" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-hand-interact"))}>✋</button>
        <button type="button" aria-label="Jump" title="Jump" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-jump"))}>↑</button>
      </div>
    </div>
  </>;
}
