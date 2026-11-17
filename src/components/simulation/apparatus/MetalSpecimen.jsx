import { memo } from "react";
import * as THREE from "three";

function MetalSpecimen({
  position = [0, 0, 0],
  scale = 1,
  specimenType = "iron_nail", // "iron_nail" | "zinc_strip" | "copper_wire"
  depositionProgress = 0, // 0 to 1
  depositColor = "#b66c43", // Red-brown copper deposit
}) {
  const isNail = specimenType === "iron_nail";
  const baseColor = isNail ? "#6e777f" : specimenType === "zinc_strip" ? "#9aa5ad" : "#b66c43";

  // Deposit coating thickness and color
  const coatingColor = new THREE.Color(baseColor).lerp(
    new THREE.Color(depositColor),
    depositionProgress
  );

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {isNail ? (
        // Detailed Iron Nail with head, shank, and point
        <group position={[0, 0.42, 0]} rotation={[0, 0, 0.15]}>
          {/* Nail head */}
          <mesh position={[0, 0.38, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.02, 16]} />
            <meshStandardMaterial color={baseColor} metalness={0.7} roughness={0.35} />
          </mesh>
          {/* Main shank */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.65, 14]} />
            <meshStandardMaterial color={coatingColor} metalness={0.65} roughness={0.4} />
          </mesh>
          {/* Pointed tip */}
          <mesh position={[0, -0.32, 0]}>
            <coneGeometry args={[0.035, 0.1, 14]} rotation={[Math.PI, 0, 0]} />
            <meshStandardMaterial color={coatingColor} metalness={0.65} roughness={0.4} />
          </mesh>
          {/* Deposited copper rough crust visible at high progress */}
          {depositionProgress > 0.15 && (
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.052, 0.052, 0.48, 12]} />
              <meshStandardMaterial
                color={depositColor}
                roughness={0.88}
                metalness={0.22}
                transparent
                opacity={Math.min(1, depositionProgress * 1.45)}
              />
            </mesh>
          )}
          {depositionProgress > 0.25 && Array.from({ length: 9 }, (_, index) => {
            const angle = index * 2.399;
            const y = -0.25 + (index % 5) * 0.105;
            return (
              <mesh key={index} position={[Math.cos(angle) * 0.047, y, Math.sin(angle) * 0.047]} scale={Math.min(1, (depositionProgress - 0.18) * 2.4)}>
                <icosahedronGeometry args={[0.033, 0]} />
                <meshStandardMaterial color={depositColor} roughness={0.72} metalness={0.28} />
              </mesh>
            );
          })}
        </group>
      ) : (
        // Rectangular metal plate/strip (e.g. Zinc strip)
        <group position={[0, 0.42, 0]} rotation={[0, 0, 0.12]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.16, 0.75, 0.02]} />
            <meshStandardMaterial color={coatingColor} metalness={0.65} roughness={0.4} />
          </mesh>
          {depositionProgress > 0.15 && (
            <mesh position={[0, -0.1, 0]}>
              <boxGeometry args={[0.17, 0.48, 0.028]} />
              <meshStandardMaterial
                color={depositColor}
                roughness={0.85}
                metalness={0.4}
                transparent
                opacity={Math.min(1, depositionProgress * 1.2)}
              />
            </mesh>
          )}
        </group>
      )}

      {/* Thin thread / wire suspending the specimen into the beaker */}
      <mesh position={[-0.05, 0.95, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.6, 6]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
      </mesh>
    </group>
  );
}

export default memo(MetalSpecimen);
