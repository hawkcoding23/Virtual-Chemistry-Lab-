import { useRef, useState } from "react";

export default function MobileLabControls({ moveRef }) {
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const pointerId = useRef(null);
  const updateStick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = rect.width * 0.36;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
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

  return <>
    <div className="mobile-rotate-prompt" role="status"><span>↻</span><strong>Rotate your phone</strong><small>Turn to landscape to enter the chemistry lab.</small></div>
    <div className="mobile-lab-controls" aria-label="Touch controls">
      <div className="mobile-joystick" aria-label="Move joystick"
        onPointerDown={(event) => { pointerId.current = event.pointerId; event.currentTarget.setPointerCapture(event.pointerId); updateStick(event); }}
        onPointerMove={(event) => { if (pointerId.current === event.pointerId) updateStick(event); }}
        onPointerUp={releaseStick} onPointerCancel={releaseStick}>
        <i style={{ transform: `translate(${stick.x}px, ${stick.y}px)` }} />
      </div>
      <div className="mobile-action-buttons">
        <button type="button" aria-label="Interact" title="Interact" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-hand-interact"))}>✋</button>
        <button type="button" aria-label="Jump" title="Jump" onPointerDown={(event) => event.stopPropagation()} onClick={() => window.dispatchEvent(new Event("chemistry-lab-jump"))}>↑</button>
      </div>
    </div>
  </>;
}
