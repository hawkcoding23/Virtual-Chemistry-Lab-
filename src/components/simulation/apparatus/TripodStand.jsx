import { memo } from "react";

function TripodStand({ position = [0, 0, 0], scale = 1 }) {
  const legAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Top circular / triangular iron ring */}
      <mesh position={[0, 0.95, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.42, 0.035, 10, 28]} />
        <meshStandardMaterial color="#222a2e" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Wire gauze on top */}
      <mesh position={[0, 0.98, 0]}>
        <boxGeometry args={[0.74, 0.012, 0.74]} />
        <meshStandardMaterial color="#8e9ba3" metalness={0.6} roughness={0.35} wireframe={false} />
      </mesh>
      {/* Ceramic center heat-diffuser patch */}
      <mesh position={[0, 0.99, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.015, 20]} />
        <meshStandardMaterial color="#eceee9" roughness={0.9} />
      </mesh>

      {/* 3 Splayed iron legs */}
      {legAngles.map((angle, i) => {
        const x = Math.cos(angle) * 0.42;
        const z = Math.sin(angle) * 0.42;
        const bottomX = Math.cos(angle) * 0.62;
        const bottomZ = Math.sin(angle) * 0.62;

        return (
          <group key={i} position={[(x + bottomX) / 2, 0.47, (z + bottomZ) / 2]}>
            <mesh rotation={[Math.sin(angle) * 0.22, 0, -Math.cos(angle) * 0.22]}>
              <cylinderGeometry args={[0.022, 0.028, 0.96, 10]} />
              <meshStandardMaterial color="#242c30" metalness={0.75} roughness={0.35} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default memo(TripodStand);
