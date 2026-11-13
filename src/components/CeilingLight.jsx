export default function CeilingLight({ position = [0, 6.75, 0], scale = 1 }) {
  return <group position={[position[0], position[1] + 0.09, position[2]]} scale={scale}>
    {/* A single flush diffuser keeps the ceiling clean and avoids extra draw calls. */}
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[4.55, 0.05, 1.75]} />
      <meshBasicMaterial color="#ffffff" toneMapped={false} />
    </mesh>
  </group>;
}
