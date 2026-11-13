import { memo } from "react";
import * as THREE from "three";
import BunsenBurner from "./BunsenBurner";
import FlameEffect from "../effects/FlameEffect";

function MagnesiumRibbonBurner({ actionProgress = 0, reactionProgress = 0, active = false }) {
  const approach = THREE.MathUtils.smoothstep(actionProgress, 0, 1);
  const ribbonX = THREE.MathUtils.lerp(-0.72, -0.015, approach);
  const ribbonY = THREE.MathUtils.lerp(1.08, 0.94, approach);
  const ribbonColor = new THREE.Color("#c8d3d8").lerp(new THREE.Color("#f7f2dc"), reactionProgress);

  return <group>
    <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
      <boxGeometry args={[1.26, 0.05, 0.9]} /><meshStandardMaterial color="#dce0dc" roughness={0.74} />
    </mesh>
    <BunsenBurner position={[0, 0.04, 0]} scale={0.82} active={active} flameType={active ? "roaring" : "off"} />
    <group position={[ribbonX, ribbonY, 0.12]} rotation={[0, 0, THREE.MathUtils.lerp(-0.3, 0.04, approach)]}>
      <mesh castShadow position={[0, 0.08, 0]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.035, 0.45, 0.018]} /><meshStandardMaterial color={ribbonColor} metalness={0.88 - reactionProgress * 0.62} roughness={0.24 + reactionProgress * 0.62} />
      </mesh>
      <mesh castShadow position={[0.035, -0.12, 0]} rotation={[0, 0, 0.38]}>
        <boxGeometry args={[0.035, 0.25, 0.018]} /><meshStandardMaterial color={ribbonColor} metalness={0.88 - reactionProgress * 0.62} roughness={0.24 + reactionProgress * 0.62} />
      </mesh>
      <mesh castShadow position={[-0.02, 0.29, 0]} rotation={[0, 0, 0.34]}>
        <boxGeometry args={[0.045, 0.17, 0.03]} /><meshStandardMaterial color="#818d91" metalness={0.82} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[-0.13, 0.69, 0]} rotation={[0, 0, -0.12]}>
        <boxGeometry args={[0.04, 0.66, 0.035]} /><meshStandardMaterial color="#68777d" metalness={0.78} roughness={0.3} />
      </mesh>
      <mesh castShadow position={[0.09, 0.69, 0]} rotation={[0, 0, 0.14]}>
        <boxGeometry args={[0.04, 0.66, 0.035]} /><meshStandardMaterial color="#879399" metalness={0.78} roughness={0.3} />
      </mesh>
    </group>
    {reactionProgress > 0.08 && <FlameEffect position={[0, 0.77, 0.12]} type="magnesium" scale={0.9} />}
    {reactionProgress > 0.62 && <mesh castShadow position={[0.42, 0.08, 0.24]} scale={[1, 0.34, 0.76]}>
      <sphereGeometry args={[0.19, 18, 12]} /><meshStandardMaterial color="#f3f1e8" roughness={0.9} />
    </mesh>}
  </group>;
}

export default memo(MagnesiumRibbonBurner);
