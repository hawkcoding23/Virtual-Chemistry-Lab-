import { memo, useMemo } from "react";
import * as THREE from "three";

const FLASK_PROFILE = [
  new THREE.Vector2(0.48, 0.03),
  new THREE.Vector2(0.55, 0.08),
  new THREE.Vector2(0.56, 0.22),
  new THREE.Vector2(0.22, 0.82),
  new THREE.Vector2(0.2, 0.86),
  new THREE.Vector2(0.2, 1.22),
  new THREE.Vector2(0.24, 1.25),
  new THREE.Vector2(0.22, 1.27),
  new THREE.Vector2(0.18, 1.24),
  new THREE.Vector2(0.18, 0.86),
  new THREE.Vector2(0.52, 0.22),
  new THREE.Vector2(0.51, 0.08),
  new THREE.Vector2(0.0, 0.06),
];

function GlassFlask({ position = [0, 0, 0], scale = 1, volumeMarks = true }) {
  const geometry = useMemo(() => new THREE.LatheGeometry(FLASK_PROFILE, 36), []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Outer transparent Erlenmeyer glass body */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#ebf7f9"
          transparent
          opacity={0.34}
          roughness={0.07}
          transmission={0.68}
          thickness={0.06}
          ior={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Flared neck rim */}
      <mesh position={[0, 1.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.015, 8, 32]} />
        <meshStandardMaterial color="#def4f7" metalness={0.15} roughness={0.15} transparent opacity={0.65} />
      </mesh>

      {/* Graduation lines */}
      {volumeMarks &&
        [0.32, 0.45, 0.58].map((y, idx) => (
          <mesh key={y} position={[-0.34 + idx * 0.06, y, 0]}>
            <boxGeometry args={[0.04, 0.008, 0.005]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
          </mesh>
        ))}
    </group>
  );
}

export default memo(GlassFlask);
