import { memo } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

function BoilingTubeSetup({
  position = [0, 0, 0],
  scale = 1,
  solidColor = "#91ad7d", // e.g. green for ferrous sulfate, white for lead nitrate/calcium carbonate
  solidTransformedColor = "#8b3f27", // e.g. reddish brown Fe2O3
  heatProgress = 0, // 0 to 1
  withDeliveryTube = true,
  withLimewaterReceiver = false,
}) {
  const currentSolidColor = new THREE.Color(solidColor).lerp(
    new THREE.Color(solidTransformedColor),
    heatProgress
  );
  const currentLimewaterColor = new THREE.Color("#e6f3f2").lerp(new THREE.Color("#f2f2e8"), heatProgress);
  const limewaterOpacity = 0.38 + heatProgress * 0.5;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Retort Stand Base */}
      <mesh castShadow receiveShadow position={[-0.82, 0.03, 0]}>
        <boxGeometry args={[0.52, 0.06, 0.38]} />
        <meshStandardMaterial color="#212a30" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* 2. Vertical Retort Steel Rod */}
      <mesh castShadow position={[-0.92, 1.25, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 2.4, 12]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 3. Boss head & Clamp */}
      <group position={[-0.35, 1.35, 0]}>
        <mesh position={[-0.57, 0, 0]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.32, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.014, 0.014, 0.44, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Clamp jaws around tube */}
        <mesh position={[0, 0, 0]} rotation={[0, 0, 0.45]}>
          <torusGeometry args={[0.08, 0.018, 8, 16]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* 4. Boiling Tube (Hard Pyrex Glass, Tilted at ~35-45°) */}
      <group position={[0, 1.25, 0]} rotation={[0, 0, -0.65]}>
        {/* Main cylindrical glass body */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.082, 0.082, 0.88, 20]} />
          <meshPhysicalMaterial
            color="#e8f6f8"
            transparent
            opacity={0.35}
            roughness={0.07}
            transmission={0.68}
            depthWrite={false}
          />
        </mesh>
        {/* Hemispherical bottom */}
        <mesh position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.082, 18, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#e8f6f8"
            transparent
            opacity={0.35}
            roughness={0.07}
            transmission={0.68}
            depthWrite={false}
          />
        </mesh>
        {/* Flared mouth rim */}
        <mesh position={[0, 0.87, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.012, 6, 20]} />
          <meshStandardMaterial color="#d4edf2" metalness={0.2} roughness={0.2} />
        </mesh>

        {/* Solid Reactant Powder/Crystals inside bottom of tube */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.16, 16]} />
          <meshStandardMaterial color={currentSolidColor} roughness={0.85} />
        </mesh>

        {/* Rubber Stopper in mouth */}
        {withDeliveryTube && (
          <group position={[0, 0.88, 0]}>
            <mesh>
              <cylinderGeometry args={[0.078, 0.065, 0.12, 16]} />
              <meshStandardMaterial color="#334155" roughness={0.7} />
            </mesh>
            {/* Glass Delivery Tube leading out and down */}
            <mesh position={[0.08, 0.22, 0]} rotation={[0, 0, 0.7]}>
              <cylinderGeometry args={[0.015, 0.015, 0.38, 10]} />
              <meshPhysicalMaterial
                color="#e0f2fe"
                transparent
                opacity={0.45}
                transmission={0.7}
                depthWrite={false}
              />
            </mesh>
          </group>
        )}
      </group>

      {withLimewaterReceiver && (
        <group>
          {/* CO₂ from the heated tube is led into limewater; it turns cloudy. */}
          <mesh position={[0.92, 2.13, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.014, 0.014, 0.42, 10]} />
            <meshPhysicalMaterial color="#e3f4f6" transparent opacity={0.62} transmission={0.62} roughness={0.12} depthWrite={false} />
          </mesh>
          <mesh position={[1.12, 1.225, 0]}>
            <cylinderGeometry args={[0.014, 0.014, 1.79, 10]} />
            <meshPhysicalMaterial color="#e3f4f6" transparent opacity={0.62} transmission={0.62} roughness={0.12} depthWrite={false} />
          </mesh>
          <group position={[1.12, 0.25, 0]}>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.19, 0.15, 0.38, 24, 1, true]} />
              <meshPhysicalMaterial color="#dff2f4" transparent opacity={0.26} roughness={0.08} transmission={0.72} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.145, 0.135, 0.18, 24]} />
              <meshStandardMaterial color={currentLimewaterColor} transparent opacity={limewaterOpacity} roughness={0.2} />
            </mesh>
            {heatProgress > 0.24 && [0, 1, 2, 3].map((index) => (
              <mesh key={`co2-bubble-${index}`} position={[(index % 2 ? 0.045 : -0.045), 0.08 + ((heatProgress * 1.8 + index * 0.19) % 0.2), 0.045]}>
                <sphereGeometry args={[0.022, 10, 8]} />
                <meshBasicMaterial color="#f8ffff" transparent opacity={0.72} />
              </mesh>
            ))}
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.025, 24]} />
              <meshStandardMaterial color="#b9c7c7" roughness={0.7} />
            </mesh>
          </group>
          <Text position={[1.12, 0.7, 0.12]} fontSize={0.075} color="#e8f2f2" anchorX="center" anchorY="middle">LIMEWATER</Text>
        </group>
      )}
    </group>
  );
}

export default memo(BoilingTubeSetup);
