import { memo } from "react";
import FlameEffect from "../effects/FlameEffect";

function BunsenBurner({
  position = [0, 0, 0],
  scale = 1,
  active = true,
  flameType = "roaring", // "roaring" | "safety" | "off"
}) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Heavy cast iron base */}
      <mesh castShadow receiveShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.08, 24]} />
        <meshStandardMaterial color="#222b30" metalness={0.7} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.085, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 0.03, 24]} />
        <meshStandardMaterial color="#2d373c" metalness={0.65} roughness={0.35} />
      </mesh>

      {/* Side gas nozzle */}
      <mesh position={[0.22, 0.09, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.035, 0.035, 0.18, 12]} />
        <meshStandardMaterial color="#a88d55" metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Rubber gas hose curving away */}
      <mesh position={[0.42, 0.07, 0]} rotation={[0, 0, 0.2]}>
        <cylinderGeometry args={[0.028, 0.028, 0.3, 10]} />
        <meshStandardMaterial color="#bf533b" roughness={0.6} />
      </mesh>

      {/* Rotating air control collar */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.078, 0.078, 0.07, 16]} />
        <meshStandardMaterial color="#b39352" metalness={0.8} roughness={0.25} />
      </mesh>
      {/* Air hole */}
      <mesh position={[0.075, 0.16, 0]}>
        <boxGeometry args={[0.015, 0.035, 0.03]} />
        <meshBasicMaterial color="#11181c" />
      </mesh>

      {/* Main brass / steel chimney barrel */}
      <mesh castShadow position={[0, 0.44, 0]}>
        <cylinderGeometry args={[0.065, 0.065, 0.5, 18]} />
        <meshStandardMaterial color="#9ea6ad" metalness={0.72} roughness={0.28} />
      </mesh>

      {/* Burner top opening ring */}
      <mesh position={[0, 0.69, 0]}>
        <cylinderGeometry args={[0.072, 0.065, 0.02, 18]} />
        <meshStandardMaterial color="#7f888f" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Flame */}
      {active && flameType !== "off" && (
        <FlameEffect position={[0, 0.7, 0]} type={flameType} scale={0.9} />
      )}
    </group>
  );
}

export default memo(BunsenBurner);
