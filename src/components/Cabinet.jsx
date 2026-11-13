import { Text } from "@react-three/drei";
import Bottle from "./Bottle";
import { translate } from "../i18n";

// Keep racks compact and bottles centered in four columns so labels stay clear
// and the top row remains reachable from a normal standing view.
export default function Cabinet({ language = "en", title, position, rotation = [0, Math.PI, 0], color, chemicals = [], onSelect, activeId, compatibleIds = [] }) {
  const columns = 4;
  const spacingX = 0.43;
  const spacingY = 0.72;
  const totalShelves = Math.max(3, Math.ceil(chemicals.length / columns));
  const top = totalShelves * spacingY + 0.44;

  return <group position={position} rotation={rotation}>
    <mesh position={[0, top / 2, 0]}>
      <boxGeometry args={[2, top, 0.78]} />
      <meshStandardMaterial color="#795334" roughness={0.62} />
    </mesh>
    <mesh position={[0, top + 0.28, -0.42]}>
      <boxGeometry args={[2.08, 0.48, 0.1]} />
      <meshStandardMaterial color="#ead8c1" />
    </mesh>
    <Text position={[0, top + 0.28, -0.475]} scale={[-1, 1, 1]} fontSize={0.17} color="#11100f" anchorX="center" anchorY="middle" maxWidth={1.98}>
      {translate(language, title.replace(/ (\d+)$/, ""))}{title.match(/ (\d+)$/)?.[1] ? ` ${title.match(/ (\d+)$/)[1]}` : ""}
    </Text>
    {Array.from({ length: totalShelves }, (_, shelf) => <mesh key={`shelf-${shelf}`} position={[0, 0.48 + shelf * spacingY, -0.45]}>
      <boxGeometry args={[1.82, 0.075, 0.11]} />
      <meshStandardMaterial color="#9a704b" roughness={0.66} />
    </mesh>)}
    {chemicals.map((chemical, index) => {
      const shelf = Math.floor(index / columns); 
      const column = index % columns;
      return <Bottle
        key={chemical.id}
        position={[(column - (columns - 1) / 2) * spacingX, 0.52 + shelf * spacingY, -0.47]}
        chemical={chemical}
        scale={[1, 0.82, 1]}
        color={color}
        onSelect={onSelect}
        selected={activeId === chemical.id}
        compatible={compatibleIds.includes(chemical.id)}
      />;
    })}
  </group>;
}
