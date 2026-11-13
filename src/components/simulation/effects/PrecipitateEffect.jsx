import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function PrecipitateEffect({
  position = [0, 0, 0],
  scale = 1,
  color = "#e2c534", // e.g. Yellow for PbI2, White for BaSO4, Blue for Cu(OH)2
  progress = 0, // 0 to 1
  settles = true,
  particleCount = 42,
}) {
  const particlesRef = useRef([]);
  const cloudRef = useRef();

  // Generate deterministic random positions inside beaker volume
  const particleInitialData = useMemo(() => {
    return Array.from({ length: particleCount }, (_, i) => {
      const radius = 0.05 + Math.sqrt(Math.random()) * 0.32;
      const angle = Math.random() * Math.PI * 2;
      return {
        x: Math.cos(angle) * radius,
        startY: 0.15 + Math.random() * 0.45,
        targetY: 0.08 + Math.random() * 0.06, // Bottom settled position
        z: Math.sin(angle) * radius,
        size: 0.018 + Math.random() * 0.022,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      };
    });
  }, [particleCount]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Turbid colloidal cloud expands and becomes opaque
    if (cloudRef.current) {
      cloudRef.current.scale.setScalar(THREE.MathUtils.lerp(0.1, 1.0, progress));
      cloudRef.current.material.opacity = Math.min(0.85, progress * 1.1);
    }

    // Individual solid crystallite particles
    particlesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const data = particleInitialData[i];
      if (progress < 0.1) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;

      // Particle aggregation & settling
      const settleProgress = settles
        ? THREE.MathUtils.clamp((progress - 0.25) / 0.75, 0, 1)
        : 0;

      const currentY = THREE.MathUtils.lerp(data.startY, data.targetY, settleProgress);
      const swirl = (1 - settleProgress) * 0.04 * Math.sin(t * 3 + data.phase);

      mesh.position.set(data.x + swirl, currentY, data.z + swirl);
      mesh.scale.setScalar(data.size * Math.min(1, progress * 1.5));
    });
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Initial Turbidity Cloud (Microscopic colloidal suspension) */}
      <mesh ref={cloudRef} position={[0, 0.32, 0]} scale={0.1}>
        <cylinderGeometry args={[0.38, 0.38, 0.48, 20]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0}
          roughness={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Precipitate Particles Aggregation & Sedimentation */}
      {particleInitialData.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (particlesRef.current[i] = el)}
          visible={false}
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={color}
            roughness={0.85}
            metalness={0.1}
          />
        </mesh>
      ))}

      {/* 3. Settled precipitate cake on the bottom */}
      {settles && progress > 0.4 && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry
            args={[
              0.4,
              0.4,
              Math.max(0.005, (progress - 0.4) * 0.06),
              24,
            ]}
          />
          <meshStandardMaterial
            color={color}
            roughness={0.9}
            transparent
            opacity={Math.min(0.95, (progress - 0.4) * 1.6)}
          />
        </mesh>
      )}
    </group>
  );
}

export default memo(PrecipitateEffect);
