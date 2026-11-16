import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlassBeaker from "./GlassBeaker";
import FlameEffect from "../effects/FlameEffect";
import GasEvolutionEffect from "../effects/GasEvolutionEffect";
import ThermalGlowEffect from "../effects/ThermalGlowEffect";

function SodiumWaterTweezers({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  actionProgress = 0,
}) {
  const sodiumRef = useRef();
  const flameRef = useRef();

  // Reaction states:
  // 0.0 - 0.25: Tweezers holding sodium cube and lowering toward beaker
  // 0.25 - 0.95: Sodium dropped into water, skims surface violently, generates H2 gas and yellow flame
  // 0.95 - 1.0: Sodium fully consumed, leaves clear NaOH solution
  const sodiumDropped = reactionProgress > 0.22;
  const sodiumConsumed = reactionProgress > 0.96;
  const reactionActive = sodiumDropped && !sodiumConsumed;

  // Tweezers animation: lowering and releasing
  const tweezersT = THREE.MathUtils.clamp(reactionProgress / 0.22, 0, 1);
  const tweezersY = THREE.MathUtils.lerp(1.35, 0.72, tweezersT);
  const tweezersX = THREE.MathUtils.lerp(0.55, 0, tweezersT);
  const tweezersOpen = reactionProgress > 0.18 ? 0.045 : 0.015;

  // Sodium surface motion
  useFrame((state) => {
    if (!sodiumDropped || sodiumConsumed || !sodiumRef.current) return;
    const t = state.clock.getElapsedTime() * 4.5;
    // Rapid darting motion across water surface in beaker (radius ~0.26)
    const r = 0.14 + Math.sin(t * 1.7) * 0.08;
    const x = Math.cos(t) * r;
    const z = Math.sin(t * 1.3) * r;
    sodiumRef.current.position.x = x;
    sodiumRef.current.position.z = z;
    sodiumRef.current.position.y = 0.58 + Math.sin(t * 8) * 0.015;

    // Cube shrinks as it reacts
    const remainingScale = Math.max(0.01, 1 - (reactionProgress - 0.22) / 0.74);
    sodiumRef.current.scale.setScalar(remainingScale);

    if (flameRef.current) {
      flameRef.current.position.x = x;
      flameRef.current.position.z = z;
      flameRef.current.position.y = 0.62;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Main Beaker with Water */}
      <GlassBeaker position={[0, 0, 0]} scale={1.3} />

      {/* Water volume in beaker */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.38, 0.36, 0.56, 32]} />
        <meshPhysicalMaterial
          color="#d7f3f9"
          transparent
          opacity={0.52}
          roughness={0.05}
          transmission={0.85}
          thickness={0.12}
          depthWrite={false}
        />
      </mesh>
      {/* Water surface meniscus */}
      <mesh position={[0, 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.375, 32]} />
        <meshStandardMaterial
          color="#c8eef7"
          transparent
          opacity={0.65}
          roughness={0.1}
          metalness={0.1}
        />
      </mesh>

      {/* 2. Metal Tweezers / Tongs */}
      <group position={[tweezersX, tweezersY, 0]} visible={reactionProgress < 0.38}>
        {/* Left tweezer arm */}
        <mesh position={[-tweezersOpen, 0.35, 0]} rotation={[0, 0, -0.06]}>
          <boxGeometry args={[0.022, 0.72, 0.035]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Right tweezer arm */}
        <mesh position={[tweezersOpen, 0.35, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.022, 0.72, 0.035]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
        </mesh>
        {/* Top hinge */}
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.04, 16]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* 3. Sodium Metal Cube */}
      {!sodiumConsumed && (
        <mesh
          ref={sodiumRef}
          position={
            sodiumDropped
              ? [0, 0.58, 0]
              : [tweezersX, tweezersY, 0]
          }
          castShadow
        >
          <boxGeometry args={[0.09, 0.08, 0.09]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.85}
            roughness={0.28}
          />
        </mesh>
      )}

      {/* 4. Hydrogen gas bubbles & rapid effervescence */}
      {reactionActive && (
        <GasEvolutionEffect
          position={[0, 0.42, 0]}
          color="#f0fdf4"
          active={true}
          density="rapid"
          plumeHeight={1.4}
        />
      )}

      {/* 5. Surface flame and hot glowing point */}
      {reactionActive && (
        <group ref={flameRef} position={[0, 0.62, 0]}>
          <FlameEffect type="combustion" scale={0.75} />
          <pointLight
            color="#f59e0b"
            intensity={1.8}
            distance={2.2}
            decay={2}
          />
        </group>
      )}

      {/* Thermal radiant glow on table */}
      <ThermalGlowEffect
        position={[0, 0, 0]}
        intensity={reactionActive ? 0.75 : 0}
        color="#f59e0b"
      />
    </group>
  );
}

export default memo(SodiumWaterTweezers);
