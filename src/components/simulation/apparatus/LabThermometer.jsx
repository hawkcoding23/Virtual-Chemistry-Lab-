import { memo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";

function LabThermometer({
  position = [0, 0, 0],
  scale = 1,
  temperature = 25, // degrees Celsius
  label = null,
}) {
  // Map temperature (20C to 100C) to column height (0.1 to 0.7)
  const norm = THREE.MathUtils.clamp((temperature - 20) / 80, 0, 1);
  const columnHeight = 0.08 + norm * 0.62;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Outer transparent glass stem */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 1.05, 12]} />
        <meshPhysicalMaterial
          color="#f0f9fa"
          transparent
          opacity={0.35}
          transmission={0.7}
          roughness={0.06}
          depthWrite={false}
        />
      </mesh>

      {/* Red spirit bulb at bottom */}
      <mesh position={[0, 0.03, 0]}>
        <sphereGeometry args={[0.045, 14, 12]} />
        <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Red liquid column rising in capillary */}
      <mesh position={[0, 0.03 + columnHeight / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, Math.max(0.01, columnHeight), 8]} />
        <meshStandardMaterial color="#ef4444" roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Glass loop top cap */}
      <mesh position={[0, 1.06, 0]}>
        <torusGeometry args={[0.025, 0.008, 6, 16]} />
        <meshStandardMaterial color="#d8edf2" roughness={0.2} />
      </mesh>

      {/* Graduation ticks */}
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((y) => (
        <mesh key={y} position={[0.022, y, 0]}>
          <boxGeometry args={[0.01, 0.003, 0.003]} />
          <meshBasicMaterial color="#334155" />
        </mesh>
      ))}

      {/* Digital readout badge floating above */}
      <group position={[0.22, 1.15, 0]}>
        <mesh>
          <boxGeometry args={[0.38, 0.16, 0.03]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.016]}>
          <boxGeometry args={[0.36, 0.14, 0.005]} />
          <meshBasicMaterial color="#1e293b" />
        </mesh>
        <Text position={[0, 0, 0.025]} fontSize={0.075} color="#38bdf8" anchorX="center">
          {`${Math.round(temperature)} °C`}
        </Text>
      </group>
    </group>
  );
}

export default memo(LabThermometer);
