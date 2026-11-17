import { LabGlass, TestTubeRack } from "./Equipment";
import InteractionSurface from "./InteractionSurface";
import { Text } from "@react-three/drei";

const steel = "#9eb4ba";

function CabinetFront({ x }) {
  return <group position={[x, 0.52, 1.345]}>
    <mesh castShadow><boxGeometry args={[1.28, 0.72, 0.045]} /><meshStandardMaterial color="#6c472c" roughness={0.48} /></mesh>
    <mesh position={[0, 0.19, 0.028]}><boxGeometry args={[1.13, 0.018, 0.012]} /><meshStandardMaterial color="#b6322a" metalness={0.06} roughness={0.38} /></mesh>
    <mesh position={[0.42, 0.02, 0.04]}><boxGeometry args={[0.16, 0.035, 0.035]} /><meshStandardMaterial color={steel} metalness={0.68} roughness={0.28} /></mesh>
  </group>;
}

export default function LabBench({ position = [0, 0, 0], sink = false, stationType = "mixing" }) {
  const universal = stationType === "universal";
  const benchWidth = universal ? 14.6 : 6.4;
  const stationLabel = universal ? "CENTRAL REACTION BENCH · ALL EXPERIMENTS" : stationType === "ignition" ? "IGNITION · COMBUSTION"
    : stationType === "electrolysis" ? "ELECTROLYSIS · WATER CELL" : "MIXING · GENERAL REACTIONS";
  return <group position={position}>
    {universal && <InteractionSurface width={13.8} height={2.8} position={[0, 1.235, 0]} rotation={[-Math.PI / 2, 0, 0]} payload={{ type: "reaction-table", label: "Central reaction bench" }} />}
    {/* One continuous, oversized worktop carries every experiment setup. */}
    <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
      <boxGeometry args={[benchWidth, 1.04, universal ? 3.25 : 2.65]} />
      <meshStandardMaterial color="#795334" roughness={0.62} />
    </mesh>
    <mesh castShadow receiveShadow position={[0, 1.12, 0]}>
      <boxGeometry args={[benchWidth + 0.3, 0.2, universal ? 3.55 : 2.95]} />
      <meshStandardMaterial color="#bd9468" roughness={0.42} metalness={0.02} />
    </mesh>


    {/* A fine teal lip and a row of cabinet fronts make the bench read as furniture. */}
    <mesh position={[0, 1.205, universal ? 1.72 : 1.43]}><boxGeometry args={[benchWidth + 0.02, 0.035, 0.055]} /><meshStandardMaterial color="#b6322a" metalness={0.05} roughness={0.4} /></mesh>
    {(universal ? [-6.3, -4.5, -2.7, -0.9, 0.9, 2.7, 4.5, 6.3] : [-2.4, -0.8, 0.8, 2.4]).map((x) => <CabinetFront key={`front-${x}`} x={x} />)}
    <mesh position={[0, 0.105, universal ? 1.64 : 1.35]}><boxGeometry args={[benchWidth - 0.22, 0.16, 0.05]} /><meshStandardMaterial color="#6c472c" roughness={0.52} /></mesh>
    {[-(benchWidth / 2 - 0.24), benchWidth / 2 - 0.24].map((x) => <mesh key={`corner-${x}`} position={[x, 0.56, 0]}>
      <boxGeometry args={[0.08, 1.04, universal ? 3.28 : 2.68]} /><meshStandardMaterial color="#795334" roughness={0.48} />
    </mesh>)}

    {/* Stainless kick plates and discreet bench feet. */}
    {(universal ? [-6.1, -3.7, 0, 3.7, 6.1] : [-2.6, -0.9, 0.9, 2.6]).map((x) => <mesh key={`foot-${x}`} position={[x, 0.035, 1.12]}>
      <boxGeometry args={[0.16, 0.07, 0.16]} /><meshStandardMaterial color="#526a72" metalness={0.45} roughness={0.35} />
    </mesh>)}

    {(stationType === "mixing" || universal) && <group position={[universal ? -4.7 : 0, 0, 0]}>
      <mesh position={[-2.1, 1.225, 0.45]}><boxGeometry args={[2.08, 0.025, 0.88]} /><meshStandardMaterial color="#536d75" roughness={0.72} /></mesh>
      <mesh position={[2.1, 1.225, 0.45]}><boxGeometry args={[1.45, 0.025, 0.88]} /><meshStandardMaterial color="#536d75" roughness={0.72} /></mesh>
      <TestTubeRack position={[-2.1, 1.27, 0.45]} />
      <LabGlass position={[2.1, 1.23, 0.45]} />
    </group>}

    {/* Keep the shared worktop clear. Reaction-specific apparatus is rendered by
        ExperimentRenderer; a permanent burner here used to obscure every setup. */}
    {stationType === "ignition" && <group position={[0, 1.23, 0.15]}>
      <mesh castShadow position={[0, 0.04, 0]}><boxGeometry args={[1.9, 0.08, 1.35]} /><meshStandardMaterial color="#c5b39e" roughness={0.72} /></mesh>
      <mesh castShadow position={[0, 0.24, 0]}><cylinderGeometry args={[0.32, 0.38, 0.32, 20]} /><meshStandardMaterial color="#53616a" metalness={0.72} roughness={0.3} /></mesh>
      <mesh castShadow position={[0, 0.78, 0]}><cylinderGeometry args={[0.12, 0.16, 0.82, 16]} /><meshStandardMaterial color="#77848a" metalness={0.72} roughness={0.28} /></mesh>
      <mesh position={[0, 1.2, 0]}><torusGeometry args={[0.14, 0.035, 8, 18]} /><meshStandardMaterial color="#b87333" metalness={0.7} roughness={0.3} /></mesh>
      <mesh castShadow position={[0.36, 0.28, 0.22]}><cylinderGeometry args={[0.09, 0.09, 0.2, 12]} /><meshStandardMaterial color="#b6322a" roughness={0.42} /></mesh>
      <mesh position={[0, 0.42, 0.38]}><boxGeometry args={[1.2, 0.04, 0.32]} /><meshStandardMaterial color="#795334" /></mesh>
    </group>}

    {(stationType === "electrolysis" || universal) && <group position={[universal ? 4.7 : 0, 1.23, 0.08]}>
      {/* Clear electrolysis tank with water and copper electrodes. */}
      <mesh position={[0, 0.72, 0]}><boxGeometry args={[2.35, 1.34, 1.12]} /><meshStandardMaterial color="#dce8e8" transparent opacity={0.18} depthWrite={false} roughness={0.12} metalness={0.08} /></mesh>
      <mesh position={[0, 0.47, 0]}><boxGeometry args={[2.16, 0.66, 0.94]} /><meshStandardMaterial color="#75b8cb" transparent opacity={0.48} depthWrite={false} roughness={0.15} /></mesh>
      {[-0.53, 0.53].map((x) => <group key={`electrode-${x}`} position={[x, 0.68, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.055, 0.055, 0.94, 12]} /><meshStandardMaterial color="#b87333" metalness={0.68} roughness={0.26} /></mesh>
        <mesh position={[0, 0.5, 0]}><torusGeometry args={[0.085, 0.02, 6, 12]} /><meshStandardMaterial color="#795334" metalness={0.6} roughness={0.28} /></mesh>
      </group>)}
      <mesh castShadow position={[0, 1.55, -0.62]}><boxGeometry args={[0.92, 0.36, 0.5]} /><meshStandardMaterial color="#795334" roughness={0.54} /></mesh>
      <mesh position={[-0.2, 1.56, -0.36]}><cylinderGeometry args={[0.035, 0.035, 0.13, 10]} /><meshStandardMaterial color="#b6322a" metalness={0.4} /></mesh>
      <mesh position={[0.2, 1.56, -0.36]}><cylinderGeometry args={[0.035, 0.035, 0.13, 10]} /><meshStandardMaterial color="#53616a" metalness={0.6} /></mesh>
    </group>}

    <Text position={[0, 0.59, universal ? 1.78 : 1.39]} fontSize={universal ? 0.16 : 0.115} color="#b6322a" anchorX="center">{stationLabel}</Text>

    {sink && <group position={[0, 1.25, -0.42]}>
      <mesh castShadow><boxGeometry args={[1.75, 0.1, 1.28]} /><meshStandardMaterial color="#c5d4d8" roughness={0.32} metalness={0.3} /></mesh>
      <mesh position={[0, 0.06, 0]}><boxGeometry args={[1.25, 0.12, 0.82]} /><meshStandardMaterial color="#49666f" roughness={0.38} metalness={0.2} /></mesh>
      <mesh position={[0, 0.125, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[0.11, 18]} /><meshStandardMaterial color="#1c3943" metalness={0.42} roughness={0.3} /></mesh>
      {/* Compact swan-neck tap, set behind the basin so it does not cover the sink. */}
      <mesh position={[0, 0.28, -0.43]}><cylinderGeometry args={[0.045, 0.055, 0.36, 12]} /><meshStandardMaterial color={steel} metalness={0.7} roughness={0.24} /></mesh>
      <mesh position={[0, 0.47, -0.28]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.16, 0.035, 8, 18, Math.PI]} /><meshStandardMaterial color={steel} metalness={0.7} roughness={0.24} /></mesh>
      <mesh position={[0, 0.38, -0.13]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.035, 0.035, 0.16, 10]} /><meshStandardMaterial color={steel} metalness={0.7} roughness={0.24} /></mesh>
      {[-0.32, 0.32].map((x) => <group key={`tap-${x}`} position={[x, 0.23, -0.42]}>
        <mesh><cylinderGeometry args={[0.035, 0.04, 0.2, 10]} /><meshStandardMaterial color={steel} metalness={0.7} roughness={0.24} /></mesh>
        <mesh position={[0, 0.12, 0]}><boxGeometry args={[0.18, 0.035, 0.05]} /><meshStandardMaterial color="#2c7884" metalness={0.3} roughness={0.32} /></mesh>
      </group>)}
      <mesh position={[0, 0.52, 0.34]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.3, 0.045, 8, 14, Math.PI]} /><meshStandardMaterial color={steel} metalness={0.58} roughness={0.23} /></mesh>
      <mesh position={[0, 0.27, 0.34]}><cylinderGeometry args={[0.055, 0.055, 0.5, 10]} /><meshStandardMaterial color={steel} metalness={0.58} roughness={0.23} /></mesh>
    </group>}
  </group>;
}
