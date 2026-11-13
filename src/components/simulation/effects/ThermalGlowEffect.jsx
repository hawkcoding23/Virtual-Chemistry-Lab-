import { memo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ThermalGlowEffect({
  position = [0, 0, 0],
  scale = 1,
  intensity = 1, // 0 to 1
  color = "#ff7a29",
}) {
  const glowRef = useRef();
  const lightRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = Math.sin(t * 8) * 0.12;

    if (glowRef.current) {
      glowRef.current.material.opacity = (0.45 + pulse) * intensity;
      glowRef.current.scale.setScalar((1 + pulse * 0.5) * scale);
    }
    if (lightRef.current) {
      lightRef.current.intensity = (2.2 + pulse * 1.5) * intensity;
    }
  });

  if (intensity <= 0.01) return null;

  return (
    <group position={position}>
      {/* Glowing ring/disc around vessel base */}
      <mesh ref={glowRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.08, 0.45, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Point light casting warm glow onto glassware and bench */}
      <pointLight
        ref={lightRef}
        position={[0, 0.2, 0]}
        color={color}
        intensity={2.2 * intensity}
        distance={3.2}
        decay={2}
      />
    </group>
  );
}

export default memo(ThermalGlowEffect);
