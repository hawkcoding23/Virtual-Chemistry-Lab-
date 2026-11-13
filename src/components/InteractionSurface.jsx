import { useEffect, useRef } from "react";
import * as THREE from "three";
import { registerLabInteractionTarget } from "../utils/labInteractionTargets";

export default function InteractionSurface({ width, height, position = [0, 0, 0], rotation = [0, 0, 0], payload, onClick }) {
  const surface = useRef(null);
  useEffect(() => registerLabInteractionTarget(surface.current, payload), [payload]);

  return <mesh ref={surface} position={position} rotation={rotation} onClick={onClick}>
    <planeGeometry args={[width, height]} />
    <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
  </mesh>;
}
