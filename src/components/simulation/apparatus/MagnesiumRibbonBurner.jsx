import { memo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import BunsenBurner from "./BunsenBurner";

function MagnesiumRibbonBurner({ actionProgress = 0, reactionProgress = 0, active = false }) {
  const flameOuter = useRef();
  const flameMid = useRef();
  const flameCore = useRef();
  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const flicker = 1 + Math.sin(time * 21) * 0.09 + Math.sin(time * 37) * 0.045;
    if (flameOuter.current) flameOuter.current.scale.set(1, flicker, 1);
    if (flameMid.current) flameMid.current.scale.set(0.78, 0.9 + Math.sin(time * 25) * 0.1, 0.78);
    if (flameCore.current) flameCore.current.scale.set(1, 0.92 + Math.sin(time * 29) * 0.08, 1);
  });
  const approach = THREE.MathUtils.smoothstep(reactionProgress, 0.12, 0.43);
  const burn = THREE.MathUtils.smoothstep(reactionProgress, 0.4, 0.56);
  const ashProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.57, 0.9);
  const ribbonX = THREE.MathUtils.lerp(-0.88, 0.015, approach);
  const ribbonY = THREE.MathUtils.lerp(0.62, 0.91, approach);
  const ribbonOpacity = 1 - THREE.MathUtils.smoothstep(reactionProgress, 0.42, 0.62);
  const flash = reactionProgress > 0.43 && reactionProgress < 0.62;
  const ignition = THREE.MathUtils.smoothstep(reactionProgress, 0.44, 0.52);
  const ribbonColor = new THREE.Color("#c8d3d8").lerp(new THREE.Color("#f7f2dc"), burn);
  const powder = Array.from({ length: 18 }, (_, index) => {
    const angle = index * 2.399;
    const radius = 0.025 + (index % 5) * 0.018;
    const fall = THREE.MathUtils.clamp(ashProgress * 1.35 - (index % 6) * 0.055, 0, 1);
    return { x: 0.44 + Math.cos(angle) * radius, z: 0.2 + Math.sin(angle) * radius,
      y: THREE.MathUtils.lerp(0.45 + (index % 4) * 0.055, 0.055 + (index % 4) * 0.003, fall),
      scale: 0.025 + (index % 3) * 0.012, opacity: ashProgress > 0.98 ? 1 : fall };
  });

  return <group>
    <mesh castShadow receiveShadow position={[0, 0.025, 0]}>
      <boxGeometry args={[1.42, 0.07, 1.02]} /><meshStandardMaterial color="#cfd3ce" roughness={0.74} />
    </mesh>
    <mesh position={[0, 0.067, 0]}>
      <boxGeometry args={[1.32, 0.018, 0.92]} /><meshStandardMaterial color="#f0eee5" roughness={0.88} />
    </mesh>
    <BunsenBurner position={[0, 0.04, 0]} scale={0.82} active={active && reactionProgress < 0.56} flameType={active ? "safety" : "off"} />

    {/* A real lab grip makes it clear the magnesium strip is held over the flame. */}
    <group position={[THREE.MathUtils.lerp(-1.65, -0.75, approach), THREE.MathUtils.lerp(0.68, 0.91, approach), 0.2]} rotation={[0, 0, THREE.MathUtils.lerp(0.25, 0.35, approach)]}>
      <mesh castShadow position={[0.36, 0.035, 0]}>
        <boxGeometry args={[0.82, 0.026, 0.035]} /><meshStandardMaterial color="#858f95" metalness={0.82} roughness={0.26} />
      </mesh>
      <mesh castShadow position={[0.36, -0.035, 0]}>
        <boxGeometry args={[0.82, 0.026, 0.035]} /><meshStandardMaterial color="#aab3b7" metalness={0.82} roughness={0.26} />
      </mesh>
      <mesh position={[0.04, 0, 0]}>
        <sphereGeometry args={[0.055, 12, 10]} /><meshStandardMaterial color="#58646b" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
    <group position={[ribbonX, ribbonY, 0.12]} rotation={[0, 0, THREE.MathUtils.lerp(-0.38, 0.1, approach)]} scale={0.34 + approach * 0.66} visible={ribbonOpacity > 0.02}>
      <mesh castShadow rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.075, 0.82, 0.028]} /><meshStandardMaterial color={ribbonColor} metalness={0.88 - burn * 0.62} roughness={0.24 + burn * 0.62} emissive={flash ? "#fff3bd" : "#000000"} emissiveIntensity={flash ? 2.2 : 0} />
      </mesh>
      <mesh position={[0, 0.4, 0]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.075, 0.12, 0.03]} /><meshStandardMaterial color={ribbonColor} metalness={0.82} roughness={0.32} emissive={flash ? "#fff4cd" : "#000000"} emissiveIntensity={flash ? 2.4 : 0} />
      </mesh>
    </group>
    {reactionProgress > 0.2 && reactionProgress < 0.72 && <group position={[0.015, 0.77, 0.12]}>
      <mesh ref={flameOuter} position={[0, 0.22, 0]}>
        <coneGeometry args={[0.21, 0.56, 18, 3]} /><meshBasicMaterial color="#ff721e" transparent opacity={0.86} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={flameMid} position={[0, 0.24, 0.012]}>
        <coneGeometry args={[0.15, 0.43, 18, 3]} /><meshBasicMaterial color={new THREE.Color("#ffd34d").lerp(new THREE.Color("#fffdf2"), ignition)} transparent opacity={0.94} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={flameCore} position={[0, 0.19, 0.006]}>
        <coneGeometry args={[0.105, 0.36, 14, 1]} /><meshBasicMaterial color={new THREE.Color("#ffad24").lerp(new THREE.Color("#ffffff"), ignition)} transparent opacity={0.96} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 0.23, 0.05]} color="#fff1bd" intensity={flash ? 3.2 : 1.6} distance={2.3} decay={2} />
    </group>}
    {flash && <pointLight position={[0, 0.95, 0.16]} color="#fff7dc" intensity={2.2} distance={2.1} decay={2} />}
    <group position={[0.44, 0.08, 0.24]}>
      <mesh castShadow receiveShadow position={[0, 0.015, 0]}>
        <cylinderGeometry args={[0.16, 0.15, 0.035, 32]} /><meshStandardMaterial color="#e8e4d8" roughness={0.84} />
      </mesh>
      <mesh position={[0, 0.043, 0]}>
        <cylinderGeometry args={[0.135, 0.135, 0.018, 32]} /><meshStandardMaterial color="#f4f1e8" roughness={0.9} />
      </mesh>
      {powder.map((grain, index) => <mesh key={index} position={[grain.x - 0.44, grain.y - 0.08, grain.z - 0.24]} scale={[1.4, 0.75, 1]}>
        <icosahedronGeometry args={[grain.scale, 1]} /><meshStandardMaterial color="#fffdf5" roughness={1} transparent opacity={Math.max(0.03, grain.opacity)} />
      </mesh>)}
    </group>
  </group>;
}

export default memo(MagnesiumRibbonBurner);
