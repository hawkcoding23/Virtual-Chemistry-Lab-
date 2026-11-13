import { memo } from "react";
import * as THREE from "three";

function CrucibleSetup({
  position = [0, 0, 0],
  scale = 1,
  fuelColor = "#c3ccd2", // e.g. silvery magnesium ribbon or dark carbon
  burntProgress = 0, // 0 to 1
}) {
  const ashColor = new THREE.Color(fuelColor).lerp(new THREE.Color("#f4f4f2"), burntProgress);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Heat-resistant ceramic safety tile base */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.9, 0.04, 0.9]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* 2. White Porcelain Crucible */}
      <group position={[0, 0.04, 0]}>
        {/* Crucible body */}
        <mesh castShadow receiveShadow position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.26, 0.16, 0.28, 24]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.4} metalness={0.05} />
        </mesh>
        {/* Crucible rim */}
        <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.26, 0.015, 8, 24]} />
          <meshStandardMaterial color="#f1f5f9" roughness={0.35} />
        </mesh>

        {/* Reactant inside crucible (e.g. Coiled Magnesium Ribbon or solid fuel) */}
        <group position={[0, 0.14, 0]}>
          <mesh rotation={[Math.PI / 4, 0, 0]}>
            <torusGeometry args={[0.1, 0.022, 8, 20]} />
            <meshStandardMaterial
              color={ashColor}
              metalness={1 - burntProgress * 0.9}
              roughness={0.25 + burntProgress * 0.65}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 4, Math.PI / 3, 0]}>
            <torusGeometry args={[0.07, 0.02, 8, 16]} />
            <meshStandardMaterial
              color={ashColor}
              metalness={1 - burntProgress * 0.9}
              roughness={0.25 + burntProgress * 0.65}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default memo(CrucibleSetup);
