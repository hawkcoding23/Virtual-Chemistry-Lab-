import { memo } from "react";
import * as THREE from "three";

function GasDeliverySystem({
  position = [0, 0, 0],
  scale = 1,
  receiverType = "limewater", // "limewater" | "gas_jar" | "test_tube"
  receiverMilkyProgress = 0, // 0 to 1 for limewater turning milky white
}) {
  const limewaterColor = new THREE.Color("#e6f3f5").lerp(
    new THREE.Color("#f1f5f5"),
    receiverMilkyProgress
  );

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Rubber Stopper for primary flask */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.15, 0.14, 18]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* 2. Thistle Funnel Tube going down into flask */}
      <group position={[-0.06, 1.25, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.72, 10]} />
          <meshPhysicalMaterial
            color="#e2f2f7"
            transparent
            opacity={0.4}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
        {/* Thistle funnel cup top */}
        <mesh position={[0, 0.8, 0]}>
          <cylinderGeometry args={[0.075, 0.015, 0.12, 16]} />
          <meshPhysicalMaterial
            color="#e2f2f7"
            transparent
            opacity={0.4}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 3. Bent Glass Delivery Tube (curves from flask mouth over to receiver) */}
      <group position={[0.06, 1.32, 0]}>
        {/* Vertical rise */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.32, 10]} />
          <meshPhysicalMaterial
            color="#e2f2f7"
            transparent
            opacity={0.4}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
        {/* Horizontal span */}
        <mesh position={[0.55, 0.38, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 1.1, 10]} />
          <meshPhysicalMaterial
            color="#e2f2f7"
            transparent
            opacity={0.4}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
        {/* Downward drop into receiver test tube */}
        <mesh position={[1.1, -0.05, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.78, 10]} />
          <meshPhysicalMaterial
            color="#e2f2f7"
            transparent
            opacity={0.4}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* 4. Gas Receiver Test Tube on Stand */}
      <group position={[1.16, 0.35, 0]}>
        {/* Wooden / Acrylic rack block */}
        <mesh position={[0, -0.22, 0]}>
          <boxGeometry args={[0.34, 0.12, 0.34]} />
          <meshStandardMaterial color="#88542f" roughness={0.7} />
        </mesh>
        {/* Glass Test Tube */}
        <mesh position={[0, 0.24, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.75, 18]} />
          <meshPhysicalMaterial
            color="#eef8fa"
            transparent
            opacity={0.36}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
        {/* Hemispherical bottom */}
        <mesh position={[0, -0.135, 0]}>
          <sphereGeometry args={[0.075, 14, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#eef8fa"
            transparent
            opacity={0.36}
            transmission={0.7}
            depthWrite={false}
          />
        </mesh>
        {/* Receiver Liquid (e.g. Lime water Ca(OH)2 turning milky white) */}
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.38, 16]} />
          <meshStandardMaterial
            color={limewaterColor}
            transparent
            opacity={0.45 + receiverMilkyProgress * 0.45}
            roughness={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

export default memo(GasDeliverySystem);
