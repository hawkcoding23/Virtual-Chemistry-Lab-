import { Html, Text } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getChemicalColor } from "../data/chemicalVisuals";

const IGNORE_RAYCAST = () => null;

export default function Bottle({ position, scale = [1, 1, 1], chemical, color, onSelect, selected, compatible }) {
  const [hovered, setHovered] = useState(false);
  const hoveredRef = useRef(false);
  const root = useRef(null);
  const worldPosition = useRef(new THREE.Vector3());
  const { camera } = useThree();
  const glow = selected ? "#38bdf8" : compatible ? "#fde047" : "#000000";
  const bottleColor = chemical.color || getChemicalColor(chemical) || color;
  const fillHeight = chemical.state === "solid" ? 0.14 : chemical.state === "gas" ? 0.26 : 0.23;
  const canInteract = () => {
    if (!root.current) return false;
    root.current.getWorldPosition(worldPosition.current);
    const { x, z } = camera.position;
    const insideChemicalRoom = x > -39.85 && x < -20.18 && Math.abs(z) < 7.85;
    return insideChemicalRoom && camera.position.distanceToSquared(worldPosition.current) <= 6.5 ** 2;
  };
  const updateHover = () => {
    const canHover = canInteract();
    hoveredRef.current = canHover;
    setHovered(canHover);
    document.body.style.cursor = canHover ? "pointer" : "default";
  };
  // Only check distance while this bottle is actually hovered. The catalogue
  // has hundreds of bottles, so a per-frame callback for every bottle is costly.
  useEffect(() => {
    if (!hovered) return undefined;
    const interval = window.setInterval(() => {
      if (hoveredRef.current && !canInteract()) updateHover();
    }, 100);
    return () => window.clearInterval(interval);
  }, [hovered, camera]);

  return <group ref={root} position={position} scale={scale} onPointerDown={(event) => {
    if (event.button !== 0) return;
    event.stopPropagation();
    if (canInteract()) {
      root.current.getWorldPosition(worldPosition.current);
      onSelect(chemical, { position: worldPosition.current.clone() });
    }
  }} onPointerOver={updateHover} onPointerMove={() => { if (hovered) updateHover(); }}
    onPointerOut={() => { hoveredRef.current = false; setHovered(false); document.body.style.cursor = "default"; }}>
    <mesh position={[0,.4,-.29]}><cylinderGeometry args={[.235,.235,.9,12]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} /></mesh>
    <mesh raycast={IGNORE_RAYCAST} position={[0,.32,0]}><cylinderGeometry args={[.15,.17,.52,10]} /><meshStandardMaterial color="#e8f1f2" transparent opacity={0.28} depthWrite={false} roughness={0.18} /></mesh>
    <mesh raycast={IGNORE_RAYCAST} position={[0,.06 + fillHeight / 2,0]}><cylinderGeometry args={[.125,.135,fillHeight,12]} /><meshStandardMaterial color={bottleColor} emissive={glow} emissiveIntensity={selected ? 1.1 : compatible ? .65 : 0} roughness={0.38} /></mesh>
    <mesh raycast={IGNORE_RAYCAST} position={[0,.64,0]}><cylinderGeometry args={[.07,.07,.16,10]} /><meshStandardMaterial color="#e5e7eb" /></mesh><mesh raycast={IGNORE_RAYCAST} position={[0,.75,0]}><cylinderGeometry args={[.09,.09,.06,10]} /><meshStandardMaterial color="#1e293b" /></mesh>
    <mesh raycast={IGNORE_RAYCAST} position={[0,.32,-.171]}><boxGeometry args={[.24,.14,.012]} /><meshStandardMaterial color="#f5f7f6" /></mesh><Text raycast={IGNORE_RAYCAST} position={[0,.32,-.181]} rotation={[0,Math.PI,0]} fontSize={.067} color="#0f172a" anchorX="center" anchorY="middle" maxWidth={.23}>{chemical.formula}</Text>
    {hovered && <Html position={[0,1.08,0]} center distanceFactor={8} style={{ pointerEvents:"none" }}><div className="chemical-tooltip"><strong>{chemical.name}</strong><span>{chemical.formula}</span></div></Html>}{(selected || compatible) && <mesh raycast={IGNORE_RAYCAST} position={[0,.33,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.22,.025,8,16]} /><meshBasicMaterial color={glow} /></mesh>}
  </group>;
}
