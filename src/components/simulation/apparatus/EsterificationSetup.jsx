import { memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import BunsenBurner from "./BunsenBurner";
import FlameEffect from "../effects/FlameEffect";
import GlassBeaker from "./GlassBeaker";

function EsterificationSetup({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  language = "en",
}) {
  const dripRef = useRef();

  // Droplet animation dripping from condenser nozzle into receiver beaker
  useFrame((state) => {
    if (!dripRef.current || reactionProgress < 0.25) return;
    const t = state.clock.getElapsedTime() * 3.5;
    const phase = t % 1;
    dripRef.current.position.y = THREE.MathUtils.lerp(0.55, 0.22, phase);
    dripRef.current.visible = reactionProgress > 0.28 && phase < 0.95;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Heating Source: Bunsen Burner underneath flask */}
      <BunsenBurner
        position={[-0.65, 0, 0]}
        scale={0.78}
        active={reactionProgress > 0.1}
        flameType="roaring"
      />

      {/* Wire Gauze & Tripod ring */}
      <group position={[-0.65, 0.48, 0]}>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.02, 24]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.4} roughness={0.7} />
        </mesh>
      </group>

      {/* 2. Round-Bottom Flask (Distillation flask with reacting acid + alcohol + H2SO4) */}
      <group position={[-0.65, 0.72, 0]}>
        {/* Spherical bottom */}
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.26, 28, 24]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.06}
            transmission={0.85}
            thickness={0.08}
            depthWrite={false}
          />
        </mesh>
        {/* Boiling liquid volume */}
        <mesh position={[0, -0.06, 0]}>
          <sphereGeometry args={[0.24, 24, 20]} />
          <meshPhysicalMaterial
            color="#bae6fd"
            transparent
            opacity={0.65}
            roughness={0.15}
          />
        </mesh>
        {/* Flask neck */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.25, 24]} />
          <meshPhysicalMaterial
            color="#e0f2fe"
            transparent
            opacity={0.35}
            roughness={0.06}
            transmission={0.85}
            depthWrite={false}
          />
        </mesh>
        {/* Rubber stopper with thermometer */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.062, 0.055, 0.08, 20]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Thermometer passing through stopper */}
        <mesh position={[0, 0.38, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.48, 12]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.2} metalness={0.8} />
        </mesh>
      </group>

      {/* 3. Angled Liebig Condenser Tube */}
      {/* Angle ~ -26 degrees sloping from flask side-arm towards receiver beaker */}
      <group position={[-0.12, 0.88, 0]} rotation={[0, 0, -0.42]}>
        {/* Inner glass vapor tube */}
        <mesh>
          <cylinderGeometry args={[0.035, 0.035, 1.25, 20]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.3}
            roughness={0.05}
            transmission={0.9}
            depthWrite={false}
          />
        </mesh>
        {/* Outer water cooling jacket */}
        <mesh>
          <cylinderGeometry args={[0.09, 0.09, 0.95, 24]} />
          <meshPhysicalMaterial
            color="#7dd3fc"
            transparent
            opacity={0.28}
            roughness={0.04}
            transmission={0.85}
            depthWrite={false}
          />
        </mesh>
        {/* Water inlet nozzle */}
        <mesh position={[0.095, -0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.08, 12]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        {/* Water outlet nozzle */}
        <mesh position={[0.095, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.08, 12]} />
          <meshStandardMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
        {/* Retort clamp supporting condenser */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.25} />
        </mesh>
      </group>

      {/* 4. Receiver Beaker collecting sweet ester */}
      <GlassBeaker position={[0.65, 0, 0]} scale={0.85} />

      {/* Collected Ester in receiver beaker */}
      {reactionProgress > 0.25 && (
        <mesh position={[0.65, 0.12, 0]}>
          <cylinderGeometry
            args={[
              0.22,
              0.21,
              Math.max(0.02, THREE.MathUtils.lerp(0.02, 0.22, (reactionProgress - 0.25) / 0.75)),
              28,
            ]}
          />
          <meshPhysicalMaterial
            color="#fef08a"
            transparent
            opacity={0.7}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Condensed Ester Droplet falling */}
      <mesh ref={dripRef} position={[0.48, 0.35, 0]} visible={false}>
        <sphereGeometry args={[0.018, 12, 10]} />
        <meshStandardMaterial color="#fef08a" transparent opacity={0.85} />
      </mesh>

      {/* Labels */}
      <Text position={[-0.65, 1.45, 0]} fontSize={0.08} color="#93c5fd" anchorX="center">
        {"CH₃COOH + C₂H₅OH"}
      </Text>
      <Text position={[0.65, 0.65, 0]} fontSize={0.08} color="#fde047" anchorX="center">
        {language === "hi" ? "एस्टर (फलों जैसी सुगंध)" : "Ethyl Ethanoate (Ester)"}
      </Text>
    </group>
  );
}

export default memo(EsterificationSetup);
