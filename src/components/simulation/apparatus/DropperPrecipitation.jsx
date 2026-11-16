import { memo, useMemo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import GlassBeaker from "./GlassBeaker";
import PrecipitateEffect from "../effects/PrecipitateEffect";

function DropperPrecipitation({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  actionProgress = 0,
  precipitateColor = "#facc15", // Default canary yellow (PbI2) or white (AgCl)
  precipitateName = "PbI₂ (Canary Yellow ppt)",
  reagentName = "Potassium Iodide (KI)",
  solutionName = "Lead Nitrate Pb(NO₃)₂",
  reagentColor = "#9bd6e3",
  language = "en",
}) {
  const dropRef = useRef();

  // Dropper animation: squeezing and dropping discrete droplets
  useFrame((state) => {
    if (!dropRef.current) return;
    const t = state.clock.getElapsedTime() * 3.0;
    const phase = t % 1;
    dropRef.current.position.y = THREE.MathUtils.lerp(1.05, 0.48, phase);
    dropRef.current.visible = reactionProgress > 0.08 && reactionProgress < 0.88 && phase < 0.95;
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Transparent Reaction Beaker */}
      <GlassBeaker position={[0, 0, 0]} scale={1.3} />

      {/* Clear starting liquid volume */}
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.38, 0.36, 0.54, 32]} />
        <meshPhysicalMaterial
          color="#c8e5ec"
          transparent
          opacity={0.72}
          roughness={0.2}
          transmission={0.28}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Precision Glass Dropper / Pipette suspended above beaker */}
      <group position={[0.22, 1.15, 0]} rotation={[0, 0, -0.22]}>
        {/* Rubber Bulb at top */}
        <mesh position={[0, 0.32, 0]}>
          <cylinderGeometry args={[0.045, 0.052, 0.14, 20]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <sphereGeometry args={[0.048, 20, 16]} />
          <meshStandardMaterial color="#dc2626" roughness={0.5} />
        </mesh>

        {/* Glass Pipette Stem */}
        <mesh position={[0, 0.12, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.28, 20]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.45}
            roughness={0.06}
            transmission={0.85}
            depthWrite={false}
          />
        </mesh>
        {/* Liquid reagent inside pipette */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.024, 0.024, 0.22, 16]} />
          <meshStandardMaterial
            color={reagentColor}
            transparent
            opacity={0.82}
          />
        </mesh>

        {/* Tapered glass nozzle tip */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.028, 0.012, 0.16, 16]} />
          <meshPhysicalMaterial
            color="#f0f9ff"
            transparent
            opacity={0.45}
            roughness={0.06}
            transmission={0.85}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Falling Reagent Droplet */}
      <mesh ref={dropRef} position={[0.15, 0.9, 0]} visible={false}>
        <sphereGeometry args={[0.022, 12, 10]} />
        <meshStandardMaterial color={reagentColor} />
      </mesh>

      {/* 3. Blooming Precipitate Effect inside beaker */}
      <PrecipitateEffect
        position={[0, 0, 0]}
        color={precipitateColor}
        progress={reactionProgress}
        settles={true}
      />

      {/* Labels */}
      <Text position={[0, 1.45, 0]} fontSize={0.075} color="#fef08a" anchorX="center" maxWidth={1.8}>
        {precipitateName}
      </Text>
      <Text position={[-0.38, 0.98, 0.25]} fontSize={0.055} color="#10232b" anchorX="center" anchorY="middle" maxWidth={0.9}>
        {solutionName}
      </Text>
      <Text position={[0.64, 1.53, 0.05]} fontSize={0.055} color="#e7f8fb" anchorX="center" maxWidth={1.15}>
        {reagentName}
      </Text>
    </group>
  );
}

export default memo(DropperPrecipitation);
