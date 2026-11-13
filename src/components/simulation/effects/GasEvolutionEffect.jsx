import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function GasEvolutionEffect({
  position = [0, 0, 0],
  scale = 1,
  color = "#d8ebf2", // e.g. pale blue/white for H2/CO2, greenish for Cl2, brown for NO2
  active = true,
  density = "moderate", // "rapid" | "moderate"
  withVapourPlume = true,
  plumeHeight = 1.4,
}) {
  const bubblesRef = useRef([]);
  const plumeRef = useRef([]);

  const isRapid = density === "rapid";
  const bubbleCount = isRapid ? 32 : 18;
  const plumeCount = 10;

  const bubbleData = useMemo(() => {
    return Array.from({ length: bubbleCount }, (_, i) => ({
      x: (Math.random() - 0.5) * 0.42,
      z: (Math.random() - 0.5) * 0.42,
      speed: (isRapid ? 1.6 : 1.0) + Math.random() * 0.8,
      size: 0.016 + Math.random() * 0.024,
      offset: (i / bubbleCount) * 1.5,
    }));
  }, [bubbleCount, isRapid]);

  const plumeData = useMemo(() => {
    return Array.from({ length: plumeCount }, (_, i) => ({
      speed: 0.8 + Math.random() * 0.5,
      offset: (i / plumeCount) * 2.0,
      radius: 0.05 + Math.random() * 0.12,
    }));
  }, [plumeCount]);

  useFrame((state) => {
    if (!active) return;
    const t = state.clock.getElapsedTime();

    // Effervescence bubbles rising inside liquid
    bubblesRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const data = bubbleData[i];
      const cycle = ((t * data.speed + data.offset) % 1.2) / 1.2;

      mesh.position.y = 0.1 + cycle * 0.65;
      mesh.position.x = data.x + Math.sin(t * 6 + i) * 0.02;
      mesh.position.z = data.z + Math.cos(t * 6 + i) * 0.02;
      mesh.scale.setScalar(data.size * (0.8 + cycle * 0.6));
    });

    // Vapor / fume plume rising above liquid
    if (withVapourPlume) {
      plumeRef.current.forEach((mesh, i) => {
        if (!mesh) return;
        const data = plumeData[i];
        const cycle = ((t * data.speed + data.offset) % 2.2) / 2.2;

        mesh.position.y = 0.8 + cycle * plumeHeight;
        mesh.position.x = Math.sin(t * 2.5 + i * 1.5) * data.radius * (1 + cycle * 2);
        mesh.position.z = Math.cos(t * 2.5 + i * 1.5) * data.radius * (1 + cycle * 2);
        mesh.scale.setScalar(0.08 + cycle * 0.28);
        mesh.material.opacity = (1 - cycle) * 0.35;
      });
    }
  });

  if (!active) return null;

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Internal effervescence bubbles */}
      {bubbleData.map((_, i) => (
        <mesh key={`bub-${i}`} ref={(el) => (bubblesRef.current[i] = el)}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.85}
            roughness={0.1}
            metalness={0.05}
          />
        </mesh>
      ))}

      {/* 2. Rising vapor / fume plume escaping mouth */}
      {withVapourPlume &&
        plumeData.map((_, i) => (
          <mesh key={`plume-${i}`} ref={(el) => (plumeRef.current[i] = el)}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.2}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
        ))}
    </group>
  );
}

export default memo(GasEvolutionEffect);
