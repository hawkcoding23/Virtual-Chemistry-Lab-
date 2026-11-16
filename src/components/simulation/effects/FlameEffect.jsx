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

  const outerColor = isMagnesium ? "#fff7d8" : isBlue ? "#1689ff" : "#ff7b2b";
  const innerColor = isMagnesium ? "#ffffff" : isBlue ? "#b9f6ff" : "#ffdf6b";
  const lightColor = isMagnesium ? "#ffffff" : isBlue ? "#5ec7ff" : "#ff9640";

  return (
    <group position={position}>
      {/* Layered, soft flame lobes read as a flame instead of a hard cone. */}
      <mesh ref={outerFlame} position={[0, 0.29 * scale, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.19, 20, 16]} />
        <meshBasicMaterial
          color={outerColor}
          transparent
          opacity={isMagnesium ? 0.82 : 0.7}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <mesh position={[-0.045 * scale, 0.2 * scale, 0]} scale={[0.68 * scale, 0.32 * scale, 0.68 * scale]}>
        <sphereGeometry args={[0.17, 18, 14]} />
        <meshBasicMaterial color={outerColor} transparent opacity={0.76} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh position={[0.045 * scale, 0.24 * scale, 0]} scale={[0.62 * scale, 0.38 * scale, 0.62 * scale]}>
        <sphereGeometry args={[0.16, 18, 14]} />
        <meshBasicMaterial color={outerColor} transparent opacity={0.78} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Narrow, bright inner flame core */}
      <mesh ref={innerCone} position={[0, 0.15 * scale, 0]} scale={[1, 1, 1]}>
        <sphereGeometry args={[0.115, 18, 14]} />
        <meshBasicMaterial
          color={innerColor}
          transparent
          opacity={isMagnesium ? 0.98 : 0.94}
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
