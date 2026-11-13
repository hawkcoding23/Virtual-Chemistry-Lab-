import { memo, useRef } from "react";
import { Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function BuretteSetup({
  position = [0, 0, 0],
  scale = 1,
  titrationProgress = 0, // 0 to 1
  liquidColor = "#e2f2f7",
}) {
  const liquidLevel = 1.6 - titrationProgress * 0.75;
  const drops = useRef([]);

  useFrame((state) => {
    drops.current.forEach((drop, index) => {
      if (!drop) return;
      const phase = (state.clock.elapsedTime * 1.35 + index * 0.34) % 1;
      drop.position.y = 0.51 - phase * 0.72;
      drop.visible = titrationProgress > 0.05 && titrationProgress < 0.98 && phase < 0.88;
      const scale = 0.72 + Math.sin(phase * Math.PI) * 0.28;
      drop.scale.setScalar(scale);
    });
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Retort Stand Base */}
      <mesh castShadow receiveShadow position={[0.72, 0.03, 0]}>
        <boxGeometry args={[0.55, 0.06, 0.38]} />
        <meshStandardMaterial color="#212a30" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 2. Vertical Retort Steel Rod */}
      <mesh castShadow position={[0.82, 1.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.8, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 3. Boss head & Retort Clamp */}
      <group position={[0.42, 1.65, 0]}>
        {/* Boss head on rod */}
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.09]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        {/* Clamp arm extending to burette */}
        <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.015, 0.015, 0.38, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Jaws holding burette */}
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.075, 0.015, 8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* 4. Graduated Glass Burette Tube */}
      <group position={[0.42, 0, 0]}>
        {/* Main outer glass tube */}
        <mesh position={[0, 1.7, 0]}>
          <cylinderGeometry args={[0.055, 0.055, 1.8, 20]} />
          <meshPhysicalMaterial
            color="#ebf7fa"
            transparent
            opacity={0.32}
            roughness={0.06}
            transmission={0.72}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>

        {/* Liquid inside burette */}
        <mesh position={[0, 0.8 + liquidLevel / 2, 0]}>
          <cylinderGeometry args={[0.048, 0.048, Math.max(0.01, liquidLevel), 16]} />
          <meshStandardMaterial
            color={liquidColor}
            transparent
            opacity={0.75}
            roughness={0.15}
            depthWrite={false}
          />
        </mesh>

        {/* Burette graduations */}
        {Array.from({ length: 9 }, (_, i) => 1.0 + i * 0.18).map((y) => (
          <mesh key={y} position={[-0.052, y, 0]}>
            <boxGeometry args={[0.02, 0.005, 0.005]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
          </mesh>
        ))}

        {/* Glass Stopcock valve */}
        <group position={[0, 0.72, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 12]} />
            <meshStandardMaterial color="#0284c7" roughness={0.2} />
          </mesh>
          {/* Rotating key handle */}
          <mesh position={[0, 0, 0.09]} rotation={[0, 0, titrationProgress * 0.6]}>
            <boxGeometry args={[0.03, 0.08, 0.03]} />
            <meshStandardMaterial color="#0369a1" roughness={0.3} />
          </mesh>
        </group>

        {/* Tapered dispensing nozzle tip */}
        <mesh position={[0, 0.58, 0]}>
          <cylinderGeometry args={[0.03, 0.01, 0.18, 12]} />
          <meshPhysicalMaterial
            color="#ecf8fa"
            transparent
            opacity={0.4}
            roughness={0.1}
            transmission={0.65}
            depthWrite={false}
          />
        </mesh>

        <Text position={[0, 2.68, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
          {"BURETTE (HCl)"}
        </Text>
      </group>
      {Array.from({ length: 3 }, (_, index) => <mesh key={`titration-drop-${index}`} ref={(node) => { drops.current[index] = node; }} position={[0.42, 0.4, 0]} visible={false}>
        <sphereGeometry args={[0.026, 10, 8]} />
        <meshStandardMaterial color={liquidColor} roughness={0.12} />
      </mesh>)}
    </group>
  );
}

export default memo(BuretteSetup);
