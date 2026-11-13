import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function LiquidVolume({
  position = [0, 0, 0],
  scale = 1,
  shape = "cylinder", // "cylinder" | "conical"
  fill = 0.5, // 0 to 1
  color = "#38bdf8",
  swirl = false,
}) {
  const surfaceRef = useRef();
  const cylinderHeight = 0.72 * fill;

  useFrame((state) => {
    if (!surfaceRef.current) return;
    const t = state.clock.getElapsedTime();
    if (swirl) {
      surfaceRef.current.rotation.z += 0.04;
    }
  });

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {shape === "cylinder" ? (
        // Cylindrical liquid for beakers or test tubes
        <group position={[0, 0.06 + cylinderHeight / 2, 0]}>
          <mesh>
            <cylinderGeometry args={[0.41, 0.41, Math.max(0.01, cylinderHeight), 28]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.82}
              roughness={0.16}
              metalness={0.05}
            />
          </mesh>
          {/* Meniscus surface disc */}
          <mesh
            ref={surfaceRef}
            position={[0, cylinderHeight / 2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[0.41, 28]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.92}
              roughness={0.12}
              metalness={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ) : (
        // Conical liquid for Erlenmeyer flask
        <group position={[0, 0.08 + cylinderHeight / 2, 0]}>
          <mesh>
            <cylinderGeometry
              args={[
                THREE.MathUtils.lerp(0.48, 0.22, fill),
                0.48,
                Math.max(0.01, cylinderHeight),
                28,
              ]}
            />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.84}
              roughness={0.14}
              metalness={0.05}
            />
          </mesh>
          {/* Meniscus surface */}
          <mesh
            ref={surfaceRef}
            position={[0, cylinderHeight / 2, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <circleGeometry args={[THREE.MathUtils.lerp(0.48, 0.22, fill), 28]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.94}
              roughness={0.12}
              metalness={0.08}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

export default memo(LiquidVolume);
