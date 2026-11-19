import { memo } from "react";
import * as THREE from "three";

function MetalDisplacementSetup({
  reactionProgress = 0,
  solutionColor = "#318dd0",
  depositColor = "#b66c43",
  specimenType = "iron_nail",
}) {
  const dip = THREE.MathUtils.smoothstep(reactionProgress, 0.08, 0.32);
  const deposit = THREE.MathUtils.smoothstep(reactionProgress, 0.3, 0.88);
  const nailY = THREE.MathUtils.lerp(1.32, 0.78, dip);
  const nailLength = 0.78;
  const nailTop = nailY + nailLength / 2;
  const hangerLength = Math.max(0.06, 1.78 - nailTop);
  const isNail = specimenType === "iron_nail";
  const baseColor = isNail ? "#727d83" : specimenType === "zinc_strip" ? "#9aa5ad" : "#b66c43";

  return (
    <group>
      {/* Heavy base and retort stand */}
      <mesh position={[-0.66, 0.045, 0]} castShadow>
        <boxGeometry args={[0.92, 0.09, 0.48]} />
        <meshStandardMaterial color="#333b40" metalness={0.7} roughness={0.34} />
      </mesh>
      <mesh position={[-0.66, 0.12, 0]}>
        <cylinderGeometry args={[0.055, 0.055, 1.75, 20]} />
        <meshStandardMaterial color="#a73531" metalness={0.52} roughness={0.35} />
      </mesh>
      <mesh position={[-0.66, 1.0, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.08, 20]} />
        <meshStandardMaterial color="#333b40" metalness={0.72} roughness={0.3} />
      </mesh>

      {/* Clamp arm, extending over the reaction tube */}
      <mesh position={[-0.05, 1.78, 0]}>
        <boxGeometry args={[1.22, 0.055, 0.055]} />
        <meshStandardMaterial color="#a73531" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0.49, 1.78, 0]}>
        <torusGeometry args={[0.205, 0.025, 10, 32]} />
        <meshStandardMaterial color="#414b50" metalness={0.78} roughness={0.26} />
      </mesh>

      {/* Narrow test tube containing copper sulphate solution */}
      <group position={[0.49, 0, 0]}>
        <mesh position={[0, 0.73, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 1.05, 32, 1, true]} />
          <meshPhysicalMaterial color="#dff8ff" transparent opacity={0.22} roughness={0.08} transmission={0.82} thickness={0.035} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 1.255, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.17, 0.012, 8, 32]} />
          <meshBasicMaterial color="#e8fbff" transparent opacity={0.9} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.205, 0]}>
          <sphereGeometry args={[0.17, 24, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial color="#dff8ff" transparent opacity={0.25} roughness={0.1} transmission={0.72} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.137, 0.14, 0.58, 28]} />
          <meshStandardMaterial color={solutionColor} transparent opacity={0.84} roughness={0.19} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.815, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.137, 28]} />
          <meshStandardMaterial color={solutionColor} transparent opacity={0.94} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Bright side reflections help the thin test tube read clearly */}
        {[-1, 1].map((side) => <mesh key={side} position={[side * 0.151, 0.73, 0]}>
          <boxGeometry args={[0.009, 0.98, 0.012]} />
          <meshBasicMaterial color="#e7fbff" transparent opacity={0.7} depthWrite={false} />
        </mesh>)}
      </group>

      {/* Thread and iron nail: lower into the blue solution, then show copper plating */}
      <mesh position={[0.49, (1.78 + nailTop) / 2, 0]}>
        <cylinderGeometry args={[0.006, 0.006, hangerLength, 8]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.35} roughness={0.5} />
      </mesh>
      <group position={[0.49, nailY, 0]}>
        {isNail ? <>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, nailLength, 14]} />
            <meshStandardMaterial color={baseColor} metalness={0.75} roughness={0.28} />
          </mesh>
          <mesh position={[0, nailLength / 2 - 0.018, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.035, 16]} />
            <meshStandardMaterial color={baseColor} metalness={0.72} roughness={0.3} />
          </mesh>
          {deposit > 0.06 && <mesh position={[0, -0.13, 0]} scale={[1, Math.max(0.08, deposit), 1]}>
            <cylinderGeometry args={[0.043, 0.043, 0.46, 14]} />
            <meshStandardMaterial color={depositColor} metalness={0.28} roughness={0.64} />
          </mesh>}
          {deposit > 0.2 && Array.from({ length: 12 }, (_, index) => {
            const angle = index * 2.399;
            const y = -0.34 + (index % 6) * 0.085;
            return <mesh key={index} position={[Math.cos(angle) * 0.045, y, Math.sin(angle) * 0.045]} scale={Math.min(1, (deposit - 0.16) * 2.5)}>
              <icosahedronGeometry args={[0.028, 0]} />
              <meshStandardMaterial color={depositColor} metalness={0.25} roughness={0.62} />
            </mesh>;
          })}
        </> : <mesh>
          <boxGeometry args={[0.13, nailLength, 0.025]} />
          <meshStandardMaterial color={baseColor} metalness={0.68} roughness={0.32} />
        </mesh>}
      </group>
    </group>
  );
}

export default memo(MetalDisplacementSetup);
