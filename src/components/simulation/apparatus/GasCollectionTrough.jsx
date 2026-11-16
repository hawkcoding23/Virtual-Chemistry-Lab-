import { memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlassFlask from "./GlassFlask";

function GasCollectionTrough({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  gasType = "O₂",
  flaskReactants = "Zn + H₂SO₄",
  language = "en",
}) {
  const bubblesRef = useRef([]);

  // Downward displacement of water inside inverted jar:
  // Water level inside jar drops from height 0.65 to 0.15
  const waterLevelInJar = THREE.MathUtils.lerp(0.65, 0.15, reactionProgress);
  const gasVolumeInJar = 0.65 - waterLevelInJar;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    bubblesRef.current.forEach((b, i) => {
      if (!b) return;
      const phase = (t * 2.2 + i * 0.15) % 1;
      b.position.y = 0.18 + phase * Math.max(0.05, waterLevelInJar - 0.05);
      b.position.x = 0.58 + Math.sin(t * 6 + i) * 0.025;
      b.visible = reactionProgress > 0.05 && phase < 0.95;
    });
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Generation Conical Flask on left */}
      <GlassFlask position={[-0.55, 0, 0]} scale={1.2} />

      {/* Reacting liquid in flask */}
      <mesh position={[-0.55, 0.28, 0]}>
        <cylinderGeometry args={[0.22, 0.35, 0.38, 28]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          transparent
          opacity={0.65}
          roughness={0.12}
        />
      </mesh>

      {/* Rubber Stopper in flask neck */}
      <mesh position={[-0.55, 0.78, 0]}>
        <cylinderGeometry args={[0.075, 0.065, 0.09, 20]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* 2. Double-bent Glass Delivery Tube */}
      {/* Vertical riser from stopper */}
      <mesh position={[-0.55, 0.95, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.28, 12]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      {/* Horizontal bridge crossing to water trough */}
      <mesh position={[0.02, 1.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 1.15, 12]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.05} />
      </mesh>
      {/* Vertical tube dipping into water trough */}
      <mesh position={[0.58, 0.62, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.92, 12]} />
        <meshPhysicalMaterial color="#e0f2fe" transparent opacity={0.5} roughness={0.05} />
      </mesh>

      {/* 3. Pneumatic Water Trough on right */}
      {/* Transparent acrylic / glass trough */}
      <mesh castShadow receiveShadow position={[0.58, 0.22, 0]}>
        <boxGeometry args={[0.82, 0.42, 0.65]} />
        <meshPhysicalMaterial
          color="#bae6fd"
          transparent
          opacity={0.35}
          roughness={0.08}
          transmission={0.8}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>
      {/* Water volume filling trough */}
      <mesh position={[0.58, 0.19, 0]}>
        <boxGeometry args={[0.78, 0.36, 0.6]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.45}
          roughness={0.12}
        />
      </mesh>
      {/* Beehive shelf stand inside trough */}
      <mesh position={[0.58, 0.08, 0]}>
        <cylinderGeometry args={[0.18, 0.2, 0.14, 20]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.7} />
      </mesh>

      {/* 4. Inverted Gas Jar / Test Tube resting over delivery nozzle */}
      <group position={[0.58, 0.22, 0]}>
        {/* Inverted glass jar wall */}
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.72, 24]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.38}
            roughness={0.05}
            transmission={0.88}
            depthWrite={false}
          />
        </mesh>
        {/* Inverted jar top dome */}
        <mesh position={[0, 0.72, 0]}>
          <sphereGeometry args={[0.11, 24, 16]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.38}
            roughness={0.05}
            transmission={0.88}
            depthWrite={false}
          />
        </mesh>

        {/* Water remaining inside inverted jar (pushed down by gas) */}
        {waterLevelInJar > 0.08 && (
          <mesh position={[0, waterLevelInJar / 2, 0]}>
            <cylinderGeometry args={[0.105, 0.105, waterLevelInJar, 20]} />
            <meshStandardMaterial
              color="#38bdf8"
              transparent
              opacity={0.55}
              roughness={0.1}
            />
          </mesh>
        )}

        {/* Trapped Gas collecting at top of inverted jar */}
        {gasVolumeInJar > 0.05 && (
          <mesh position={[0, 0.72 - gasVolumeInJar / 2, 0]}>
            <cylinderGeometry args={[0.105, 0.105, gasVolumeInJar, 20]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.82}
            />
          </mesh>
        )}
      </group>

      {/* Rising Bubbles inside jar */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh
          key={`jar-bubble-${i}`}
          ref={(el) => (bubblesRef.current[i] = el)}
          position={[0.58, 0.2, 0]}
          visible={false}
        >
          <sphereGeometry args={[0.016, 10, 8]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.88} />
        </mesh>
      ))}

      {/* Scientific text labels */}
      <Text position={[-0.55, 1.25, 0]} fontSize={0.085} color="#93c5fd" anchorX="center">
        {flaskReactants}
      </Text>
      <Text position={[0.58, 1.15, 0]} fontSize={0.09} color="#38bdf8" anchorX="center">
        {language === "hi" ? `${gasType} गैस (अधोमुखी जल विस्थापन)` : `${gasType} Gas (Over Water)`}
      </Text>
    </group>
  );
}

export default memo(GasCollectionTrough);
