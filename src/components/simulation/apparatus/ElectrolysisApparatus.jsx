import { memo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { translate } from "../../../i18n";

function ElectrolysisApparatus({
  position = [0, 0, 0],
  scale = 1,
  powerOn = true,
  gasProgress = 0, // 0 to 1
  reactionId = "water_electrolysis",
  language = "en",
}) {
  const bubbleCathodeRef = useRef([]);
  const bubbleAnodeRef = useRef([]);

  const isChlorAlkali = reactionId?.includes("chlor_alkali") || reactionId?.includes("nacl");
  const cathodeGas = "H₂ (g)";
  const anodeGas = isChlorAlkali ? "Cl₂ (g)" : "O₂ (g)";
  const anodeGasColor = isChlorAlkali ? "#c4d668" : "#d8ebf2";

  // Gas volumes: H2 : O2 is 2:1
  const cathodeGasVolume = gasProgress * 0.42;
  const anodeGasVolume = isChlorAlkali ? gasProgress * 0.42 : gasProgress * 0.21;

  useFrame((state) => {
    if (!powerOn) return;
    const t = state.clock.getElapsedTime();

    // Cathode bubbles (H2 - rapid generation)
    bubbleCathodeRef.current.forEach((b, i) => {
      if (!b) return;
      const phase = (t * 2.2 + i * 0.12) % 1;
      b.position.y = 0.15 + phase * 0.72;
      b.position.x = -0.32 + Math.sin(t * 8 + i) * 0.02;
      b.scale.setScalar(0.015 + phase * 0.02);
      b.visible = gasProgress > 0.05 && b.position.y < (0.85 - cathodeGasVolume);
    });

    // Anode bubbles (O2 / Cl2 - half rate or moderate)
    bubbleAnodeRef.current.forEach((b, i) => {
      if (!b) return;
      const phase = (t * 1.5 + i * 0.18) % 1;
      b.position.y = 0.15 + phase * 0.72;
      b.position.x = 0.32 + Math.sin(t * 6 + i) * 0.02;
      b.scale.setScalar(0.014 + phase * 0.018);
      b.visible = gasProgress > 0.05 && b.position.y < (0.85 - anodeGasVolume);
    });
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Main Transparent Acrylic / Glass Tank */}
      <mesh castShadow receiveShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[1.35, 0.88, 0.72]} />
        <meshPhysicalMaterial
          color="#dbeef2"
          transparent
          opacity={0.32}
          roughness={0.06}
          transmission={0.7}
          thickness={0.08}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      {/* Tank bottom base */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[1.42, 0.06, 0.78]} />
        <meshStandardMaterial color="#21353e" roughness={0.5} />
      </mesh>

      {/* 2. Electrolyte Solution in Tank */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.28, 0.74, 0.65]} />
        <meshStandardMaterial
          color="#8ac7d4"
          transparent
          opacity={0.65}
          roughness={0.14}
          depthWrite={false}
        />
      </mesh>

      {/* 3. Left Electrode: CATHODE (-) */}
      <group position={[-0.32, 0, 0]}>
        {/* Graphite rod */}
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 16]} />
          <meshStandardMaterial color="#1f2326" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Inverted collection test tube */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.75, 18]} />
          <meshPhysicalMaterial
            color="#ecf8fa"
            transparent
            opacity={0.38}
            roughness={0.08}
            transmission={0.65}
            depthWrite={false}
          />
        </mesh>
        {/* Trapped Gas in Cathode Tube (displacing liquid downward) */}
        {gasProgress > 0.05 && (
          <mesh position={[0, 0.95 - cathodeGasVolume / 2, 0]}>
            <cylinderGeometry args={[0.07, 0.07, Math.max(0.01, cathodeGasVolume), 16]} />
            <meshStandardMaterial color="#eef8fc" transparent opacity={0.88} />
          </mesh>
        )}
        {/* Terminal clip (Black / Negative) */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#1a2024" roughness={0.4} />
        </mesh>
        <Text position={[0, 1.14, 0]} fontSize={0.09} color="#7dd3fc" anchorX="center">
          {`CATHODE (-)\n${cathodeGas}`}
        </Text>
      </group>

      {/* 4. Right Electrode: ANODE (+) */}
      <group position={[0.32, 0, 0]}>
        {/* Graphite rod */}
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.035, 0.035, 0.72, 16]} />
          <meshStandardMaterial color="#2a2e30" roughness={0.8} metalness={0.3} />
        </mesh>
        {/* Inverted collection test tube */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.75, 18]} />
          <meshPhysicalMaterial
            color="#ecf8fa"
            transparent
            opacity={0.38}
            roughness={0.08}
            transmission={0.65}
            depthWrite={false}
          />
        </mesh>
        {/* Trapped Gas in Anode Tube */}
        {gasProgress > 0.05 && (
          <mesh position={[0, 0.95 - anodeGasVolume / 2, 0]}>
            <cylinderGeometry args={[0.07, 0.07, Math.max(0.01, anodeGasVolume), 16]} />
            <meshStandardMaterial color={anodeGasColor} transparent opacity={0.88} />
          </mesh>
        )}
        {/* Terminal clip (Red / Positive) */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#dc2626" roughness={0.4} />
        </mesh>
        <Text position={[0, 1.14, 0]} fontSize={0.09} color="#f87171" anchorX="center">
          {`ANODE (+)\n${anodeGas}`}
        </Text>
      </group>

      {/* Dynamic bubbles for Cathode & Anode */}
      {Array.from({ length: 16 }, (_, i) => (
        <mesh key={`cath-bub-${i}`} ref={(el) => (bubbleCathodeRef.current[i] = el)} visible={false}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.85} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`anod-bub-${i}`} ref={(el) => (bubbleAnodeRef.current[i] = el)} visible={false}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={anodeGasColor} transparent opacity={0.85} />
        </mesh>
      ))}

      {/* 5. DC Power Supply Unit sitting alongside */}
      <group position={[1.45, 0.28, 0]}>
        {/* Power supply main chassis */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.78, 0.54, 0.58]} />
          <meshStandardMaterial color="#1a323d" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Front instrument panel */}
        <mesh position={[-0.395, 0, 0]}>
          <boxGeometry args={[0.01, 0.48, 0.52]} />
          <meshStandardMaterial color="#0f1d24" roughness={0.6} />
        </mesh>
        {/* Digital LED Display */}
        <mesh position={[-0.402, 0.12, 0]}>
          <boxGeometry args={[0.01, 0.14, 0.32]} />
          <meshBasicMaterial color="#051014" />
        </mesh>
        <Text
          position={[-0.41, 0.12, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.075}
          color={powerOn ? "#34d399" : "#475569"}
          anchorX="center"
        >
          {powerOn ? "12.0 V  2.5 A" : "0.0 V  OFF"}
        </Text>
        {/* Terminal binding posts: Black (-) and Red (+) */}
        <mesh position={[-0.405, -0.1, -0.12]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <mesh position={[-0.405, -0.1, 0.12]}>
          <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#dc2626" roughness={0.3} />
        </mesh>
        {/* Power On/Off rocker switch */}
        <mesh position={[-0.405, -0.1, 0]}>
          <boxGeometry args={[0.015, 0.06, 0.04]} />
          <meshStandardMaterial color={powerOn ? "#10b981" : "#64748b"} roughness={0.4} />
        </mesh>
        <Text position={[-0.41, -0.18, 0]} rotation={[0, -Math.PI / 2, 0]} fontSize={0.045} color="#94a3b8" anchorX="center">
          {translate(language, "DC POWER SUPPLY")}
        </Text>
      </group>

      {/* Connecting Wires (Black lead to cathode, Red lead to anode) */}
      {/* Black Wire */}
      <mesh position={[0.35, 0.62, -0.06]} rotation={[0, 0, 0.28]}>
        <cylinderGeometry args={[0.012, 0.012, 1.5, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>
      {/* Red Wire */}
      <mesh position={[0.72, 0.6, 0.08]} rotation={[0, 0, 0.42]}>
        <cylinderGeometry args={[0.012, 0.012, 1.25, 8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default memo(ElectrolysisApparatus);
