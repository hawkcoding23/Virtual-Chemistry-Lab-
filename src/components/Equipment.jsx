const steel = "#9eb4ba";

export function TestTubeRack({ position = [0, 0, 0] }) {
  const colors = ["#fbbf24", "#60a5fa", "#f472b6", "#34d399"];
  return <group position={position}>
    <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[1.9, 0.14, 0.68]} /><meshStandardMaterial color="#88542f" roughness={0.68} /></mesh>
    {[-0.6, -0.2, 0.2, 0.6].map((x, i) => <group key={x}>
      {/* Straight, matching glass tubes sit directly on the rack base. */}
      <mesh castShadow position={[x, 0.39, 0]}>
        <cylinderGeometry args={[0.075, 0.075, 0.62, 10]} />
        <meshStandardMaterial color="#eef7f7" transparent opacity={0.34} depthWrite={false} roughness={0.18} />
      </mesh>
      <mesh position={[x, 0.215, 0]}>
        <cylinderGeometry args={[0.067, 0.067, 0.27, 10]} />
        <meshStandardMaterial color={colors[i]} transparent opacity={0.76} roughness={0.28} />
      </mesh>
    </group>)}
  </group>;
}

export function LabGlass({ position = [0, 0, 0] }) {
  return <group position={position}>
    {/* Beaker with a reinforced lip and simple volume marks. */}
    <mesh position={[-0.42, 0.3, 0]}><cylinderGeometry args={[0.28, 0.34, 0.6, 18]} /><meshStandardMaterial color="#93c5fd" transparent opacity={0.43} depthWrite={false} roughness={0.18} /></mesh>
    <mesh position={[-0.42, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.28, 0.018, 6, 20]} /><meshStandardMaterial color="#e0edf1" metalness={0.16} roughness={0.2} /></mesh>
    {[0.34, 0.44, 0.54].map((y) => <mesh key={`mark-${y}`} position={[-0.23, y, -0.05]}><boxGeometry args={[0.09, 0.012, 0.012]} /><meshBasicMaterial color="#f4fbff" /></mesh>)}
    {/* Erlenmeyer flask. */}
    <mesh position={[0.38, 0.32, 0]}><cylinderGeometry args={[0.3, 0.11, 0.66, 16]} /><meshStandardMaterial color="#fda4af" transparent opacity={0.5} depthWrite={false} roughness={0.18} /></mesh>
    <mesh position={[0.38, 0.8, 0]}><cylinderGeometry args={[0.075, 0.075, 0.38, 12]} /><meshStandardMaterial color="#dbeafe" transparent opacity={0.62} depthWrite={false} roughness={0.18} /></mesh>
    <mesh position={[0.38, 0.995, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.08, 0.014, 6, 16]} /><meshStandardMaterial color="#edf7fa" roughness={0.2} /></mesh>
    <mesh position={[0.38, 0.21, 0]}><cylinderGeometry args={[0.2, 0.2, 0.012, 16]} /><meshStandardMaterial color="#e98b9b" transparent opacity={0.6} /></mesh>
  </group>;
}

export function Microscope({ position = [0, 0, 0] }) {
  return <group position={position}>
    <mesh castShadow position={[0, 0.08, 0]}><boxGeometry args={[1.25, 0.16, 0.8]} /><meshStandardMaterial color="#1e293b" roughness={0.38} /></mesh>
    <mesh position={[0, 0.18, 0]}><boxGeometry args={[0.82, 0.035, 0.53]} /><meshStandardMaterial color={steel} metalness={0.52} roughness={0.3} /></mesh>
    <mesh position={[0.05, 0.62, 0]} rotation={[0, 0, -0.35]}><cylinderGeometry args={[0.13, 0.18, 1.05, 14]} /><meshStandardMaterial color="#647b8b" metalness={0.5} roughness={0.3} /></mesh>
    <mesh position={[-0.14, 1.1, 0]} rotation={[0, 0, -0.35]}><cylinderGeometry args={[0.14, 0.11, 0.42, 14]} /><meshStandardMaterial color="#111827" roughness={0.27} /></mesh>
    <mesh position={[-0.27, 0.37, 0.26]}><boxGeometry args={[0.42, 0.055, 0.24]} /><meshStandardMaterial color="#344e5a" metalness={0.44} roughness={0.34} /></mesh>
    <mesh position={[-0.25, 0.4, 0.28]}><boxGeometry args={[0.25, 0.018, 0.13]} /><meshStandardMaterial color="#b9e4e8" transparent opacity={0.68} roughness={0.2} /></mesh>
    {[-0.25, 0.18].map((x) => <mesh key={`objective-${x}`} position={[x, 0.32, 0.12]} rotation={[0, 0, x < 0 ? 0.1 : -0.15]}>
      <cylinderGeometry args={[0.035, 0.05, 0.2, 10]} /><meshStandardMaterial color="#9eb4ba" metalness={0.55} roughness={0.3} />
    </mesh>)}
    <mesh position={[0.44, 0.56, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.18, 16]} /><meshStandardMaterial color="#425868" metalness={0.3} roughness={0.4} /></mesh>
    <mesh position={[-0.02, 0.19, 0.01]}><cylinderGeometry args={[0.12, 0.14, 0.06, 12]} /><meshStandardMaterial color="#44b8b0" emissive="#2a877f" emissiveIntensity={0.16} /></mesh>
  </group>;
}
