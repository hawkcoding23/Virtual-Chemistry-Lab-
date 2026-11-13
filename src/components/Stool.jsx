const steel = "#91aab2";

export default function Stool({ position = [0, 0, 0] }) {
  return <group position={position}>
    <mesh castShadow position={[0, 0.72, 0]}><cylinderGeometry args={[0.38, 0.38, 0.12, 28]} /><meshStandardMaterial color="#795334" roughness={0.55} /></mesh>
    <mesh position={[0, 0.785, 0]}><cylinderGeometry args={[0.31, 0.31, 0.012, 28]} /><meshStandardMaterial color="#bd9468" roughness={0.6} /></mesh>
    {[[ -0.22, 0.34, -0.22], [0.22, 0.34, -0.22], [-0.22, 0.34, 0.22], [0.22, 0.34, 0.22]].map((p, i) => <group key={i} position={p}>
      <mesh castShadow><boxGeometry args={[0.055, 0.68, 0.055]} /><meshStandardMaterial color={steel} metalness={0.3} roughness={0.36} /></mesh>
      <mesh position={[0, -0.32, 0]}><boxGeometry args={[0.085, 0.035, 0.085]} /><meshStandardMaterial color="#374c54" roughness={0.6} /></mesh>
    </group>)}
    <mesh position={[0, 0.34, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.31, 0.025, 8, 28]} /><meshStandardMaterial color="#718d96" metalness={0.45} roughness={0.34} />
    </mesh>
  </group>;
}
