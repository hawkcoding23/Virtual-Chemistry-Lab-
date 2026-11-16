import { memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlassBeaker from "./GlassBeaker";
import GasEvolutionEffect from "../effects/GasEvolutionEffect";

function RedoxDecolourisation({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  language = "en",
}) {
  const dropRef = useRef();

  // Color lerping: starts at rich royal purple #7e22ce, transitions to light rose pink #f472b6, then to water clear #f0fdf4
  const solutionColor = useMemo(() => {
    if (reactionProgress < 0.45) {
      return new THREE.Color("#6b21a8").lerp(
        new THREE.Color("#c084fc"),
        reactionProgress / 0.45
      );
    }
    if (reactionProgress < 0.8) {
      return new THREE.Color("#c084fc").lerp(
        new THREE.Color("#fbcfe8"),
        (reactionProgress - 0.45) / 0.35
      );
    }
    return new THREE.Color("#fbcfe8").lerp(
      new THREE.Color("#e0f2fe"),
      (reactionProgress - 0.8) / 0.2
    );
  }, [reactionProgress]);

  const opacity = THREE.MathUtils.lerp(0.88, 0.42, reactionProgress);

  useFrame((state) => {
    if (!dropRef.current) return;
    const t = state.clock.getElapsedTime() * 3.2;
    const phase = t % 1;
    dropRef.current.position.y = THREE.MathUtils.lerp(1.1, 0.52, phase);
    dropRef.current.visible = reactionProgress < 0.9 && phase < 0.95;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Reaction Beaker */}
      <GlassBeaker position={[0, 0, 0]} scale={1.3} />

      {/* Reacting Liquid (Purple KMnO4 decolourising) */}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.38, 0.36, 0.58, 32]} />
        <meshPhysicalMaterial
          color={solutionColor}
          transparent
          opacity={opacity}
          roughness={0.08}
          transmission={0.7}
          thickness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Dropper adding H2O2 / Oxalic Acid */}
      <group position={[0.24, 1.18, 0]} rotation={[0, 0, -0.2]}>
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.045, 0.052, 0.14, 20]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.28, 20]} />
          <meshPhysicalMaterial color="#f0f9ff" transparent opacity={0.45} transmission={0.85} depthWrite={false} />
        </mesh>
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.028, 0.012, 0.16, 16]} />
          <meshPhysicalMaterial color="#f0f9ff" transparent opacity={0.45} transmission={0.85} depthWrite={false} />
        </mesh>
      </group>

      {/* Falling reducing agent drop */}
      <mesh ref={dropRef} position={[0.16, 0.9, 0]} visible={false}>
        <sphereGeometry args={[0.02, 12, 10]} />
        <meshStandardMaterial color="#bae6fd" transparent opacity={0.75} />
      </mesh>

      {/* Fine CO2 / O2 gas evolution bubbles */}
      {reactionProgress > 0.15 && (
        <GasEvolutionEffect
          position={[0, 0.38, 0]}
          color="#f8fafc"
          active={reactionProgress < 0.95}
          density="moderate"
          plumeHeight={1.1}
        />
      )}

      {/* Labels */}
      <Text position={[0, 1.48, 0]} fontSize={0.085} color="#c084fc" anchorX="center">
        {language === "hi"
          ? "KMnO₄ (बैंगनी) → Mn²⁺ (रंगहीन रेडॉक्स)"
          : "KMnO₄ (Purple) → Mn²⁺ (Colourless Redox)"}
      </Text>
    </group>
  );
}

export default memo(RedoxDecolourisation);
