import { memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import LabThermometer from "./LabThermometer";
import ThermalGlowEffect from "../effects/ThermalGlowEffect";

function ExothermicBalloonBottle({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  language = "en",
}) {
  const balloonRef = useRef();

  // Balloon inflation: smoothly expands from radius 0.05 (deflated) to 0.32 (plump inflated)
  const balloonInflation = THREE.MathUtils.smoothstep(reactionProgress, 0.15, 0.85);
  const balloonScaleX = THREE.MathUtils.lerp(0.35, 1.45, balloonInflation);
  const balloonScaleY = THREE.MathUtils.lerp(0.45, 1.85, balloonInflation);
  const balloonScaleZ = THREE.MathUtils.lerp(0.35, 1.45, balloonInflation);
  const balloonYOffset = THREE.MathUtils.lerp(0.88, 1.15, balloonInflation);

  // Temperature rise: 25°C up to 68°C
  const currentTemp = 25 + reactionProgress * 43;

  useFrame((state) => {
    if (!balloonRef.current) return;
    const t = state.clock.getElapsedTime();
    // Subtle breathing/pulsing of inflated balloon
    if (balloonInflation > 0.4) {
      const pulse = 1 + Math.sin(t * 3.5) * 0.025 * balloonInflation;
      balloonRef.current.scale.set(
        balloonScaleX * pulse,
        balloonScaleY * pulse,
        balloonScaleZ * pulse
      );
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Chemical Glass Bottle Body */}
      {/* Lower cylindrical body */}
      <mesh castShadow receiveShadow position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.65, 32]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.38}
          roughness={0.08}
          transmission={0.8}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* Bottle shoulder curve */}
      <mesh position={[0, 0.74, 0]}>
        <cylinderGeometry args={[0.11, 0.26, 0.18, 32]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.38}
          roughness={0.08}
          transmission={0.8}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* Bottle neck */}
      <mesh position={[0, 0.87, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.14, 28]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.38}
          roughness={0.08}
          transmission={0.8}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* Neck rim / lip */}
      <mesh position={[0, 0.94, 0]}>
        <torusGeometry args={[0.095, 0.018, 12, 28]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.2} roughness={0.3} />
      </mesh>

      {/* 2. Liquid in Bottle (Reacting solution) */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.25, 0.27, 0.45, 32]} />
        <meshPhysicalMaterial
          color={reactionProgress > 0.3 ? "#bbf7d0" : "#e0f2fe"}
          transparent
          opacity={0.65}
          roughness={0.15}
        />
      </mesh>

      {/* 3. Rubber Balloon on Mouth */}
      {/* Balloon neck sleeve wrapping around bottle mouth */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.098, 0.102, 0.1, 24]} />
        <meshStandardMaterial
          color="#ef4444"
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Inflating Balloon Bulb */}
      <group position={[0, balloonYOffset, 0]}>
        <mesh
          ref={balloonRef}
          scale={[balloonScaleX, balloonScaleY, balloonScaleZ]}
          castShadow
        >
          <sphereGeometry args={[0.18, 28, 24]} />
          <meshStandardMaterial
            color="#ef4444"
            roughness={0.32}
            metalness={0.15}
            transparent
            opacity={0.92}
          />
        </mesh>
        {/* Rubber sheen highlight */}
        <pointLight
          position={[0, 0.2, 0.2]}
          color="#fca5a5"
          intensity={balloonInflation * 0.4}
          distance={0.8}
        />
      </group>

      {/* 4. Laboratory Thermometer beside bottle */}
      <LabThermometer
        position={[0.55, 0, 0]}
        scale={0.95}
        temperature={currentTemp}
      />

      {/* Reaction label */}
      <Text position={[0, 1.65, 0]} fontSize={0.1} color="#6ee7b7" anchorX="center">
        {language === "hi" ? "ऊष्माक्षेपी अभिक्रिया (गर्म गैस से गुब्बारा फूला)" : "Exothermic Heat → Thermal Expansion"}
      </Text>

      {/* Thermal radiant glow */}
      <ThermalGlowEffect
        position={[0, 0, 0]}
        intensity={reactionProgress > 0.2 ? reactionProgress * 0.8 : 0}
        color="#f97316"
      />
    </group>
  );
}

export default memo(ExothermicBalloonBottle);
