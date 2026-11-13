import { Text } from "@react-three/drei";
import { translate } from "../i18n";

export default function Door({ language }) {
  return <group position={[0, 0, 14.83]}>
    <mesh position={[-3.15, 3.5, 0]}><boxGeometry args={[0.2, 7, 0.2]} /><meshStandardMaterial color="#795334" /></mesh><mesh position={[3.15, 3.5, 0]}><boxGeometry args={[0.2, 7, 0.2]} /><meshStandardMaterial color="#795334" /></mesh><mesh position={[0, 6.55, 0]}><boxGeometry args={[6.5, 0.2, 0.2]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[0, 6.43, 0.015]}><boxGeometry args={[6.28, 0.045, 0.03]} /><meshStandardMaterial color="#b6322a" /></mesh>
    {[-1.52, 1.52].map((x) => <group key={x} position={[x, 3.1, -0.08]}><mesh><boxGeometry args={[2.88, 6.05, 0.05]} /><meshStandardMaterial color="#eee3d4" roughness={0.27} metalness={0.06} /></mesh><mesh position={[0, 0, -0.06]}><boxGeometry args={[0.08, 6.1, 0.08]} /><meshStandardMaterial color="#795334" /></mesh><mesh position={[x < 0 ? 0.85 : -0.85, 3, -0.12]}><boxGeometry args={[0.07, 0.68, 0.08]} /><meshStandardMaterial color="#b87333" metalness={0.65} roughness={0.28} /></mesh></group>)}
    <Text position={[0, 6.05, -0.16]} scale={[-1, 1, 1]} fontSize={0.28} color="#181310" anchorX="center" maxWidth={3}>{translate(language, "CHEMISTRY LAB")}</Text>
  </group>;
}
