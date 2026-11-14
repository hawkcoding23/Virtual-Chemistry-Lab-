import { memo } from "react";
import * as THREE from "three";
import BunsenBurner from "./BunsenBurner";
import FlameEffect from "../effects/FlameEffect";

function MagnesiumRibbonBurner({ actionProgress = 0, reactionProgress = 0, active = false }) {
  const approach = THREE.MathUtils.smoothstep(reactionProgress, 0.12, 0.43);
  const burn = THREE.MathUtils.smoothstep(reactionProgress, 0.4, 0.56);
  const ashProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.57, 0.9);
  const ribbonX = THREE.MathUtils.lerp(-0.48, 0.015, approach);
  const ribbonY = THREE.MathUtils.lerp(0.68, 0.95, approach);
  const ribbonOpacity = 1 - THREE.MathUtils.smoothstep(reactionProgress, 0.42, 0.62);
  const flash = reactionProgress > 0.43 && reactionProgress < 0.62;
  const ribbonColor = new THREE.Color("#c8d3d8").lerp(new THREE.Color("#f7f2dc"), burn);
  const powder = Array.from({ length: 18 }, (_, index) => {
    const angle = index * 2.399;
    const radius = 0.025 + (index % 5) * 0.018;
    const fall = THREE.MathUtils.clamp(ashProgress * 1.35 - (index % 6) * 0.055, 0, 1);
    return { x: 0.44 + Math.cos(angle) * radius, z: 0.2 + Math.sin(angle) * radius,
      y: THREE.MathUtils.lerp(0.45 + (index % 4) * 0.055, 0.135 + (index % 4) * 0.004, fall),
      scale: 0.018 + (index % 3) * 0.008, opacity: ashProgress > 0.98 ? 1 : fall };
  });

  return <group>
    <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
      <boxGeometry args={[1.26, 0.05, 0.9]} /><meshStandardMaterial color="#dce0dc" roughness={0.74} />
    </mesh>
    <BunsenBurner position={[0, 0.04, 0]} scale={0.82} active={active && reactionProgress < 0.56} flameType={active ? "roaring" : "off"} />
    <group position={[ribbonX, ribbonY, 0.12]} rotation={[0, 0, THREE.MathUtils.lerp(-0.38, 0.1, approach)]} scale={0.34 + approach * 0.66} visible={ribbonOpacity > 0.02}>
      <mesh castShadow rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.045, 0.72, 0.025]} /><meshStandardMaterial color={ribbonColor} metalness={0.88 - burn * 0.62} roughness={0.24 + burn * 0.62} emissive={flash ? "#fff3bd" : "#000000"} emissiveIntensity={flash ? 2.5 : 0} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.045, 0.16, 0.025]} /><meshStandardMaterial color={ribbonColor} metalness={0.82} roughness={0.32} emissive={flash ? "#fff4cd" : "#000000"} emissiveIntensity={flash ? 3 : 0} />
      </mesh>
    </group>
    {reactionProgress > 0.27 && reactionProgress < 0.67 && <FlameEffect position={[0.01, 0.77, 0.12]} type="magnesium" scale={reactionProgress < 0.58 ? 1.12 : 0.72} />}
    {flash && <pointLight position={[0, 0.92, 0.12]} color="#fff8df" intensity={5 * (1 - Math.abs(reactionProgress - 0.52) * 5)} distance={3} />}
    <group position={[0.44, 0.08, 0.24]}>
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.16, 0.15, 0.035, 32]} /><meshStandardMaterial color="#e8e4d8" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.043, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.018, 32]} /><meshStandardMaterial color="#f4f1e8" roughness={0.9} />
      </mesh>
      {powder.map((grain, index) => <mesh key={index} position={[grain.x - 0.44, grain.y - 0.08, grain.z - 0.24]} scale={[1.4, 0.75, 1]}>
        <icosahedronGeometry args={[grain.scale, 1]} /><meshStandardMaterial color="#fffdf5" roughness={1} transparent opacity={Math.max(0.03, grain.opacity)} />
      </mesh>)}
    </group>
  </group>;
}

export default memo(MagnesiumRibbonBurner);
