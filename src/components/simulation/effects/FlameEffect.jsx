import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function FlameEffect({ position = [0, 0, 0], scale = 1, type = "roaring" }) {
  const outerFlame = useRef();
  const innerCone = useRef();
  const flameLight = useRef();
  const particles = useRef([]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const flicker = Math.sin(t * 24) * 0.08 + Math.cos(t * 37) * 0.04;
    const sway = Math.sin(t * 14) * 0.03;

    if (outerFlame.current) {
      outerFlame.current.scale.y = scale * (1 + flicker);
      outerFlame.current.scale.x = scale * (1 - flicker * 0.5);
      outerFlame.current.scale.z = scale * (1 - flicker * 0.5);
      outerFlame.current.rotation.z = sway;
    }

    if (innerCone.current) {
      innerCone.current.scale.y = scale * 0.55 * (1 + flicker * 0.6);
      innerCone.current.scale.x = scale * 0.65;
      innerCone.current.scale.z = scale * 0.65;
    }

    if (flameLight.current) {
      if (type === "magnesium") {
        flameLight.current.intensity = 5.0 + Math.sin(t * 30) * 1.5;
      } else {
        flameLight.current.intensity = 2.4 + flicker * 1.2;
      }
    }
  });

  const isBlue = type === "roaring";
  const isMagnesium = type === "magnesium";

  const outerColor = isMagnesium ? "#ffffff" : isBlue ? "#3b9bd8" : "#ff7b2b";
  const innerColor = isMagnesium ? "#fffded" : isBlue ? "#7be9ff" : "#ffdf6b";
  const lightColor = isMagnesium ? "#ffffff" : isBlue ? "#5ec7ff" : "#ff9640";

  return (
    <group position={position}>
      {/* Outer flame tear-drop shape */}
      <mesh ref={outerFlame} position={[0, 0.28 * scale, 0]}>
        <coneGeometry args={[0.13 * scale, 0.6 * scale, 16]} />
        <meshBasicMaterial
          color={outerColor}
          transparent
          opacity={isMagnesium ? 0.95 : 0.78}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner hotter cone */}
      <mesh ref={innerCone} position={[0, 0.16 * scale, 0]}>
        <coneGeometry args={[0.08 * scale, 0.36 * scale, 14]} />
        <meshBasicMaterial
          color={innerColor}
          transparent
          opacity={0.92}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Radiant flame light */}
      <pointLight
        ref={flameLight}
        position={[0, 0.3 * scale, 0]}
        color={lightColor}
        intensity={2.4}
        distance={4.5}
        decay={2}
      />
    </group>
  );
}

export default memo(FlameEffect);
