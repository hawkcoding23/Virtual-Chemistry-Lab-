import { memo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { getChemicalColor } from "../../../data/chemicalVisuals";

const BOTTLE_PROFILE = [
  new THREE.Vector2(0.16, 0.02),
  new THREE.Vector2(0.2, 0.06),
  new THREE.Vector2(0.2, 0.58),
  new THREE.Vector2(0.16, 0.68),
  new THREE.Vector2(0.09, 0.74),
  new THREE.Vector2(0.09, 0.94),
  new THREE.Vector2(0.12, 0.96),
];

function ReagentContainer({
  position = [0, 0, 0],
  scale = 1,
  chemical = null,
  tilt = 0,
}) {
  const color = chemical?.color || getChemicalColor(chemical);
  const formula = chemical?.formula || chemical?.name || "Reagent";

  return (
    <group position={position} rotation={[0, 0, tilt]} scale={[scale, scale, scale]}>
      {/* Glass Bottle Body */}
      <mesh castShadow receiveShadow>
        <latheGeometry args={[BOTTLE_PROFILE, 24]} />
        <meshPhysicalMaterial
          color="#eef8fa"
          transparent
          opacity={0.34}
          roughness={0.08}
          transmission={0.65}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Internal chemical substance */}
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.44, 20]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.88}
          roughness={0.2}
        />
      </mesh>

      {/* Stopper cap */}
      <mesh position={[0, 1.02, 0]}>
        <cylinderGeometry args={[0.075, 0.085, 0.12, 14]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* White Label */}
      <mesh position={[0, 0.38, 0.182]}>
        <boxGeometry args={[0.26, 0.18, 0.01]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>
      <Text
        position={[0, 0.38, 0.19]}
        fontSize={0.06}
        color="#0f172a"
        anchorX="center"
        maxWidth={0.24}
      >
        {formula}
      </Text>
    </group>
  );
}

export default memo(ReagentContainer);
