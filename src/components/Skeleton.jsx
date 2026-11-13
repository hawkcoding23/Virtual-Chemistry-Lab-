import { CatmullRomCurve3, Quaternion, Vector3 } from "three";
import { useMemo } from "react";

const BONE = "#e9e1cb";
const SHADE = "#b9ad92";

function Bone({ from, to, radius = 0.075, color = BONE }) {
  const segment = useMemo(() => {
    const a = new Vector3(...from);
    const b = new Vector3(...to);
    const direction = new Vector3().subVectors(b, a);
    return {
      position: a.add(b).multiplyScalar(0.5),
      quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), direction.clone().normalize()),
      length: direction.length(),
    };
  }, [from, to]);
  return <mesh position={segment.position} quaternion={segment.quaternion} castShadow>
    <cylinderGeometry args={[radius * 0.78, radius, segment.length, 10]} />
    <meshStandardMaterial color={color} roughness={0.86} />
  </mesh>;
}

function Joint({ position, radius = 0.09, color = BONE }) {
  return <mesh position={position} castShadow><sphereGeometry args={[radius, 14, 12]} /><meshStandardMaterial color={color} roughness={0.9} /></mesh>;
}

function Rib({ side, y }) {
  const curve = useMemo(() => new CatmullRomCurve3([
    new Vector3(0, y, -0.16),
    new Vector3(side * 0.25, y + 0.04, -0.03),
    new Vector3(side * 0.47, y + 0.01, 0.1),
    new Vector3(side * 0.53, y - 0.09, 0.03),
    new Vector3(side * 0.4, y - 0.15, 0.2),
    new Vector3(side * 0.12, y - 0.13, 0.29),
    new Vector3(0, y - 0.12, 0.29),
  ], false, "centripetal") , [side, y]);
  return <mesh castShadow><tubeGeometry args={[curve, 24, 0.04, 7, false]} /><meshStandardMaterial color={BONE} roughness={0.9} /></mesh>;
}

export default function Skeleton({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 0.46 }) {
  const ribLevels = [2.53, 2.37, 2.2, 2.03, 1.86, 1.7];
  return <group position={position} rotation={rotation} scale={scale}>
    {/* A simple steel floor stand keeps the articulated model upright. */}
    <mesh position={[0, 0.08, -0.34]} castShadow><boxGeometry args={[1.2, 0.12, 0.9]} /><meshStandardMaterial color="#3b4b59" metalness={0.55} roughness={0.45} /></mesh>
    <mesh position={[0, 1.9, -0.52]} castShadow><cylinderGeometry args={[0.045, 0.06, 3.65, 10]} /><meshStandardMaterial color="#647887" metalness={0.65} roughness={0.38} /></mesh>
    {[1.45, 2.48].map((y) => <mesh key={y} position={[0, y, -0.34]} castShadow><boxGeometry args={[0.62, 0.08, 0.12]} /><meshStandardMaterial color="#647887" metalness={0.58} roughness={0.42} /></mesh>)}
    {/* Skull */}
    <mesh position={[0, 3.55, 0]} scale={[0.83, 1, 0.77]} castShadow><sphereGeometry args={[0.38, 24, 20]} /><meshStandardMaterial color={BONE} roughness={0.9} /></mesh>
    <mesh position={[0, 3.3, 0.08]} scale={[0.62, 0.4, 0.7]} castShadow><sphereGeometry args={[0.28, 20, 16]} /><meshStandardMaterial color={SHADE} roughness={0.9} /></mesh>
    <mesh position={[0, 3.4, 0.14]}><coneGeometry args={[0.08, 0.18, 5]} /><meshStandardMaterial color={BONE} /></mesh>
    {[-1, 1].map((side) => <group key={side}>
      <mesh position={[side * 0.135, 3.57, 0.28]} rotation={[0, 0, side * -0.14]}><torusGeometry args={[0.105, 0.035, 8, 16]} /><meshStandardMaterial color={SHADE} /></mesh>
      <mesh position={[side * 0.135, 3.57, 0.3]}><sphereGeometry args={[0.073, 14, 12]} /><meshStandardMaterial color="#302f2c" /></mesh>
      {Array.from({ length: 5 }, (_, i) => <mesh key={i} position={[side * (0.17 - i * 0.085), 3.35, 0.255]}><boxGeometry args={[0.045, 0.075, 0.045]} /><meshStandardMaterial color="#faf7e9" /></mesh>)}
    </group>)}
    {/* Neck, vertebral column and sternum */}
    <Bone from={[0, 2.72, 0]} to={[0, 3.29, 0]} radius={0.09} />
    {Array.from({ length: 12 }, (_, i) => <Joint key={`vertebra-${i}`} position={[0, 2.73 - i * 0.125, -0.13]} radius={0.075} color={i % 2 ? BONE : SHADE} />)}
    <Bone from={[0, 2.63, 0.16]} to={[0, 1.67, 0.22]} radius={0.055} />
    {ribLevels.map((y) => [-1, 1].map((side) => <Rib key={`${side}-${y}`} side={side} y={y} />))}
    {[-1, 1].map((side) => <group key={`shoulder-${side}`}>
      <Bone from={[0, 2.69, 0.08]} to={[side * 0.57, 2.66, 0.08]} radius={0.055} color={SHADE} />
      {/* scapulae */}
      <mesh position={[side * 0.47, 2.45, -0.14]} rotation={[0, 0, side * 0.25]}><sphereGeometry args={[0.27, 16, 12]} /><meshStandardMaterial color={SHADE} roughness={0.9} /></mesh>
      {/* arm bones */}
      <Bone from={[side * 0.58, 2.63, 0.02]} to={[side * 0.76, 2.13, 0.13]} radius={0.075} />
      <Joint position={[side * 0.76, 2.13, 0.13]} radius={0.095} />
      <Bone from={[side * 0.76, 2.13, 0.13]} to={[side * 0.83, 1.64, 0.19]} radius={0.055} />
      <Bone from={[side * 0.86, 2.11, 0.09]} to={[side * 0.94, 1.65, 0.13]} radius={0.05} color={SHADE} />
      <Joint position={[side * 0.85, 1.61, 0.17]} radius={0.08} />
      {/* palm and fingers */}
      <mesh position={[side * 0.86, 1.48, 0.18]} rotation={[0, 0, side * -0.12]}><boxGeometry args={[0.17, 0.24, 0.08]} /><meshStandardMaterial color={BONE} /></mesh>
      {[-2, -1, 0, 1, 2].map((finger) => <Bone key={finger} from={[side * (0.86 + finger * 0.025), 1.39, 0.18]} to={[side * (0.86 + finger * 0.035), 1.23 + Math.abs(finger) * 0.025, 0.18]} radius={0.018} />)}
      <Bone from={[side * 0.79, 1.49, 0.21]} to={[side * 0.73, 1.38, 0.24]} radius={0.02} />
      {/* pelvis, hip and leg bones */}
      <Bone from={[0, 1.5, -0.02]} to={[side * 0.38, 1.36, 0.03]} radius={0.11} color={SHADE} />
      <Bone from={[side * 0.38, 1.36, 0.03]} to={[side * 0.29, 0.72, 0.08]} radius={0.1} />
      <Joint position={[side * 0.29, 0.72, 0.08]} radius={0.105} color={SHADE} />
      <Bone from={[side * 0.29, 0.72, 0.08]} to={[side * 0.31, 0.17, 0.1]} radius={0.065} />
      <Bone from={[side * 0.39, 0.68, -0.01]} to={[side * 0.4, 0.17, 0.01]} radius={0.043} color={SHADE} />
      <Joint position={[side * 0.31, 0.14, 0.1]} radius={0.075} />
      <Bone from={[side * 0.31, 0.14, 0.1]} to={[side * 0.31, 0.08, 0.47]} radius={0.07} />
      {[-1, 0, 1].map((toe) => <Bone key={toe} from={[side * 0.31, 0.08, 0.39]} to={[side * (0.31 + toe * 0.08), 0.065, 0.66 - Math.abs(toe) * 0.06]} radius={0.025} />)}
    </group>)}
    <mesh position={[0, 1.37, -0.02]} scale={[0.45, 0.27, 0.19]} castShadow><sphereGeometry args={[1, 20, 16]} /><meshStandardMaterial color={SHADE} roughness={0.95} /></mesh>
  </group>;
}
