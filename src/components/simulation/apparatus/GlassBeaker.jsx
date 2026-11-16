import { memo, useMemo } from "react";
import * as THREE from "three";

const BEAKER_PROFILE = [
  new THREE.Vector2(0.42, 0.02),
  new THREE.Vector2(0.45, 0.05),
  new THREE.Vector2(0.45, 0.82),
  new THREE.Vector2(0.48, 0.85),
  new THREE.Vector2(0.47, 0.87),
  new THREE.Vector2(0.43, 0.85),
  new THREE.Vector2(0.43, 0.06),
  new THREE.Vector2(0.0, 0.06),
];

function GlassBeaker({ position = [0, 0, 0], scale = 1, volumeMarks = true }) {
  const geometry = useMemo(() => new THREE.LatheGeometry(BEAKER_PROFILE, 36), []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Outer transparent glass body */}
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#e8f6f8"
          transparent
          opacity={0.35}
          roughness={0.08}
          transmission={0.65}
          thickness={0.06}
          ior={1.5}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Rim highlight */}
      <mesh position={[0, 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.015, 8, 36]} />
        <meshStandardMaterial color="#e8fbff" emissive="#4dbac9" emissiveIntensity={0.22} metalness={0.12} roughness={0.12} transparent opacity={0.88} />
      </mesh>

      {/* Strong edge highlights make the clear vessel readable against the lab. */}
      <mesh position={[0, 0.065, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.425, 0.012, 8, 36]} />
        <meshBasicMaterial color="#d9f8ff" transparent opacity={0.82} depthWrite={false} />
      </mesh>
      {[-1, 1].flatMap((side) => [
        <mesh key={`beaker-edge-x-${side}`} position={[side * 0.443, 0.45, 0]}>
          <boxGeometry args={[0.012, 0.76, 0.012]} />
          <meshBasicMaterial color="#d9f8ff" transparent opacity={0.72} depthWrite={false} />
        </mesh>,
        <mesh key={`beaker-edge-z-${side}`} position={[0, 0.45, side * 0.443]}>
          <boxGeometry args={[0.012, 0.76, 0.012]} />
          <meshBasicMaterial color="#d9f8ff" transparent opacity={0.72} depthWrite={false} />
        </mesh>,
      ])}

      {/* Graduation volume tick marks */}
      {volumeMarks &&
        [0.25, 0.4, 0.55, 0.7].map((y) => (
          <group key={y} position={[-0.43, y, 0]} rotation={[0, 0, 0]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.04, 0.008, 0.005]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
            </mesh>
          </group>
        ))}
    </group>
  );
}

export default memo(GlassBeaker);
