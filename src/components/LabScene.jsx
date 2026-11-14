import { memo, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import Player from "./Player";
import Cabinet from "./Cabinet";
import CeilingLight from "./CeilingLight";
import Door from "./Door";
import LabBench from "./LabBench";
import Skeleton from "./Skeleton";
import Stool from "./Stool";
import LabFixtures, { PeriodicTableChart } from "./LabFixtures";
import InteractionSurface from "./InteractionSurface";
import ExperimentRenderer from "./simulation/ExperimentRenderer";
import { QUIZ_SEATS } from "../data/quizRoomLayout";
import { NCERT_REACTIONS } from "../data/ncertChemicals";
import { translate } from "../i18n";
import { LAB_STATIONS } from "../data/labStations";


const COLORS = {
  Acids: "#ef4444",
  Bases: "#8b5cf6",
  Salts: "#f59e0b",
  Elements: "#10b981",
  Indicators: "#ec4899",
  Organics: "#22c55e",
  Gases: "#06b6d4",
  Oxides: "#f97316",
  Default: "#10b981",
};
const reactionChemicalIds = (reaction) => [...(reaction.reactants ?? []), ...(reaction.products ?? [])]
  .map((item) => (typeof item === "string" ? item : item?.chemicalId)?.toLowerCase()).filter(Boolean);
function QuizClassroom({ language, onTheorySelect }) {
  const openTheory = (title, subtitle, accent, lines) => () => onTheorySelect?.({ title, subtitle, accent, lines });
  return <>
    <group position={[34.72, 3.32, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow><boxGeometry args={[5.3, 3.55, 0.14]} /><meshStandardMaterial color="#795334" roughness={0.5} /></mesh>
      <mesh position={[0, 0, 0.085]}><boxGeometry args={[5.06, 3.31, 0.035]} /><meshBasicMaterial color="#f5eadb" /></mesh>
      <mesh position={[0, 1.60, 0.11]}><boxGeometry args={[5.06, 0.12, 0.035]} /><meshBasicMaterial color="#b6322a" /></mesh>
      <Text position={[-2.32, 1.12, 0.12]} fontSize={0.32} color="#b6322a" anchorX="left">{translate(language, "CHEMISTRY QUIZ")}</Text>
      <Text position={[-2.32, 0.62, 0.12]} fontSize={0.15} color="#53443c" anchorX="left">{translate(language, "10 RANDOM QUESTIONS · INSTANT FEEDBACK")}</Text>
      <mesh position={[0, 0.32, 0.11]}><boxGeometry args={[4.4, 0.018, 0.025]} /><meshBasicMaterial color="#9a704b" /></mesh>
      <Text position={[-2.32, -0.05, 0.12]} fontSize={0.21} color="#b6322a" anchorX="left">{translate(language, "TAKE A SEAT TO BEGIN")}</Text>
      <Text position={[-2.32, -0.48, 0.12]} fontSize={0.12} color="#181310" anchorX="left" maxWidth={4.7}>{translate(language, "Choose a class · answer · see your score out of 10")}</Text>
    </group>
    <QuizRoomPoster language={language} position={[24, 4.2, -8.04]} title="LAB SAFETY" subtitle="Work carefully · Protect yourself" accent="#f59e0b" lines={[
      "Wear goggles and follow teacher instructions",
      "Never taste or directly smell a chemical",
      "Add acid to water slowly and carefully",
      "Report spills and broken glass immediately",
    ]} onOpen={openTheory("LAB SAFETY", "Work carefully · Protect yourself", "#f59e0b", ["Wear goggles and follow teacher instructions", "Never taste or directly smell a chemical", "Add acid to water slowly and carefully", "Report spills and broken glass immediately"])} />
    <QuizRoomPoster language={language} position={[31.15, 4.2, -8.04]} title="EMERGENCY STEPS" subtitle="Stay calm · Tell your teacher" accent="#ef4444" lines={[
      "Alert the teacher about every accident",
      "Rinse chemical splashes with plenty of water",
      "Know the exit and fire extinguisher locations",
      "Keep walkways clear; never run in the lab",
    ]} onOpen={openTheory("EMERGENCY STEPS", "Stay calm · Tell your teacher", "#ef4444", ["Alert the teacher about every accident", "Rinse chemical splashes with plenty of water", "Know the exit and fire extinguisher locations", "Keep walkways clear; never run in the lab"])} />
    <QuizRoomPoster language={language} position={[24, 4.2, 8.04]} rotation={[0, Math.PI, 0]} title="CHEMISTRY QUICK GUIDE" subtitle="Observe · Record · Explain" accent="#10b981" lines={[
      "Balance atoms on both sides of an equation",
      "Look for gas, colour change or a precipitate",
      "Use correct symbols and state labels",
      "Link observations to the products formed",
    ]} onOpen={openTheory("CHEMISTRY QUICK GUIDE", "Observe · Record · Explain", "#10b981", ["Balance atoms on both sides of an equation", "Look for gas, colour change or a precipitate", "Use correct symbols and state labels", "Link observations to the products formed"])} />
    <QuizRoomPoster language={language} position={[34.84, 4.2, 5.4]} rotation={[0, -Math.PI / 2, 0]} title="VIRTUAL CHEMISTRY LAB" subtitle="Explore · experiment · learn" accent="#b6322a" lines={[
      "Choose a chapter and try a reaction",
      "Collect labelled samples from the shelves",
      "Record observations and explain the evidence",
      "Use the quiz room to check your learning",
    ]} onOpen={openTheory("VIRTUAL CHEMISTRY LAB", "Explore · experiment · learn", "#b6322a", ["Choose a chapter and try a reaction", "Collect labelled samples from the shelves", "Record observations and explain the evidence", "Use the quiz room to check your learning"])} />
    {QUIZ_SEATS.map((seat, index) => <group key={`quiz-seat-${index}`} position={[seat.x, 0, seat.z]}>
      <mesh castShadow position={[0, 0.5, 0]}><boxGeometry args={[0.82, 0.13, 0.82]} /><meshStandardMaterial color="#9a704b" roughness={0.52} /></mesh>
      <mesh castShadow position={[-0.35, 0.94, 0]}><boxGeometry args={[0.13, 0.82, 0.82]} /><meshStandardMaterial color="#795334" roughness={0.52} /></mesh>
      {[-0.3, 0.3].flatMap((x) => [-0.3, 0.3].map((z) => <mesh key={`${x}-${z}`} castShadow position={[x, 0.25, z]}>
        <boxGeometry args={[0.09, 0.5, 0.09]} /><meshStandardMaterial color="#111c15" metalness={0.45} roughness={0.4} />
      </mesh>))}
    </group>)}
  </>;
}

function QuizRoomPoster({ language, position, rotation = [0, 0, 0], title, subtitle, accent, lines, onOpen }) {
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0, -0.08]} castShadow>
      <boxGeometry args={[5.3, 3.55, 0.14]} /><meshStandardMaterial color="#795334" roughness={0.72} />
    </mesh>
    <mesh position={[0, 0, -0.005]}><boxGeometry args={[5.06, 3.31, 0.025]} /><meshBasicMaterial color="#f5eadb" /></mesh>
    <mesh position={[0, 1.63, 0.012]}>
      <boxGeometry args={[5.06, 0.12, 0.035]} /><meshStandardMaterial color="#b6322a" />
    </mesh>
    <Text position={[-2.38, 1.22, 0.025]} anchorX="left" fontSize={0.25} color="#b6322a">{translate(language, title)}</Text>
    <Text position={[-2.38, 0.91, 0.025]} anchorX="left" fontSize={0.13} color="#181310">{translate(language, subtitle)}</Text>
    {lines.map((line, index) => <group key={line} position={[-2.32, 0.45 - index * 0.43, 0.03]}>
      <mesh position={[0, 0.015, 0]}><circleGeometry args={[0.055, 12]} /><meshBasicMaterial color="#b6322a" /></mesh>
      <Text position={[0.16, 0.015, 0]} anchorX="left" fontSize={0.135} color="#181310" maxWidth={4.55}>{translate(language, line)}</Text>
    </group>)}
    <InteractionSurface width={5.3} height={3.55} position={[0, 0, 0.055]} payload={{ type: "poster", label: title, title, subtitle, accent, lines }}
      onClick={(event) => { event.stopPropagation(); onOpen?.(); }} />
  </group>;
}

function DoorLeaf({ leafRef, rotation = [0, 0, 0] }) {
  return <group ref={leafRef} rotation={rotation}>
    <mesh castShadow position={[0, 1.41, 1.01]}><boxGeometry args={[0.13, 2.82, 2.04]} /><meshStandardMaterial color="#805332" roughness={0.55} /></mesh>
    {[-1, 1].map((face) => <mesh key={`inset-${face}`} position={[face * 0.078, 1.41, 1.01]}>
      <boxGeometry args={[0.025, 2.56, 1.76]} /><meshStandardMaterial color="#966b47" roughness={0.62} />
    </mesh>)}
    {[-1, 1].map((face) => <mesh key={`handle-${face}`} position={[face * 0.115, 1.41, 1.82]}>
      <sphereGeometry args={[0.07, 14, 12]} /><meshStandardMaterial color="#bd873e" metalness={0.62} roughness={0.25} />
    </mesh>)}
  </group>;
}

function QuizRoomDoor({ language, open = false }) {
  const leaves = useRef([]);
  useFrame((_, delta) => {
    const targets = open ? [1.55, Math.PI - 1.55] : [0, Math.PI];
    leaves.current.forEach((leaf, index) => {
      if (!leaf) return;
      const diff = Math.atan2(Math.sin(targets[index] - leaf.rotation.y), Math.cos(targets[index] - leaf.rotation.y));
      leaf.rotation.y += diff * Math.min(1, delta * 5);
    });
  });
  return <group>
    <InteractionSurface width={4.1} height={2.75} position={[19.55, 1.48, 0]} rotation={[0, -Math.PI / 2, 0]}
      payload={{ type: "gate", id: "quiz", label: "Quiz room gate", open }} />
    <mesh castShadow position={[19.88, 1.5, -2.12]}><boxGeometry args={[0.3, 3, 0.24]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh castShadow position={[19.88, 1.5, 2.12]}><boxGeometry args={[0.3, 3, 0.24]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh castShadow position={[19.88, 2.95, 0]}><boxGeometry args={[0.3, 0.18, 4.48]} /><meshStandardMaterial color="#795334" /></mesh>
    <group position={[19.78, 0, -2.02]}><DoorLeaf leafRef={(node) => { leaves.current[0] = node; }} /></group>
    <group position={[19.78, 0, 2.02]}><DoorLeaf leafRef={(node) => { leaves.current[1] = node; }} rotation={[0, Math.PI, 0]} /></group>
    <group position={[19.66, 3.72, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow position={[0, 0, -0.07]}><boxGeometry args={[2.8, 0.92, 0.14]} /><meshStandardMaterial color="#795334" /></mesh>
      <mesh position={[0, 0, 0.01]}><boxGeometry args={[2.62, 0.74, 0.025]} /><meshBasicMaterial color="#f5eadb" /></mesh>
      <mesh position={[0, 0.32, 0.03]}><boxGeometry args={[2.62, 0.07, 0.02]} /><meshBasicMaterial color="#b6322a" /></mesh>
      <Text position={[0, 0.07, 0.04]} fontSize={0.2} color="#181310" anchorX="center">{translate(language, "CHEMISTRY QUIZ")}</Text>
      <Text position={[0, -0.18, 0.04]} fontSize={0.11} color="#b6322a" anchorX="center">{translate(language, "CLASSES 9–12 · NCERT")}</Text>
      <Text position={[0, -0.31, 0.04]} fontSize={0.085} color="#53443c" anchorX="center">{translate(language, "E · OPEN / CLOSE")}</Text>
    </group>
  </group>;
}

function ChemicalRoomDoor({ language, open = false }) {
  const leaves = useRef([]);
  useFrame((_, delta) => {
    const targets = open ? [-1.55, Math.PI + 1.55] : [0, Math.PI];
    leaves.current.forEach((leaf, index) => {
      if (!leaf) return;
      const diff = Math.atan2(Math.sin(targets[index] - leaf.rotation.y), Math.cos(targets[index] - leaf.rotation.y));
      leaf.rotation.y += diff * Math.min(1, delta * 5);
    });
  });
  return <group>
    <InteractionSurface width={4.1} height={2.75} position={[-19.55, 1.48, 0]} rotation={[0, Math.PI / 2, 0]}
      payload={{ type: "gate", id: "chemical", label: "Chemical room gate", open }} />
    <mesh castShadow position={[-19.88, 1.5, -2.12]}><boxGeometry args={[0.3, 3, 0.24]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh castShadow position={[-19.88, 1.5, 2.12]}><boxGeometry args={[0.3, 3, 0.24]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh castShadow position={[-19.88, 2.95, 0]}><boxGeometry args={[0.3, 0.18, 4.48]} /><meshStandardMaterial color="#795334" /></mesh>
    <group position={[-19.78, 0, -2.02]}><DoorLeaf leafRef={(node) => { leaves.current[0] = node; }} /></group>
    <group position={[-19.78, 0, 2.02]}><DoorLeaf leafRef={(node) => { leaves.current[1] = node; }} rotation={[0, Math.PI, 0]} /></group>
    <group position={[-19.65, 3.72, 0]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow position={[0, 0, -0.07]}><boxGeometry args={[2.8, 0.92, 0.14]} /><meshStandardMaterial color="#795334" /></mesh>
      <mesh position={[0, 0, 0.01]}><boxGeometry args={[2.62, 0.74, 0.025]} /><meshBasicMaterial color="#f5eadb" /></mesh>
      <mesh position={[0, 0.32, 0.03]}><boxGeometry args={[2.62, 0.07, 0.02]} /><meshBasicMaterial color="#b6322a" /></mesh>
      <Text position={[0, 0.07, 0.04]} fontSize={0.19} color="#181310" anchorX="center">{translate(language, "CHEMICAL ROOM")}</Text>
      <Text position={[0, -0.18, 0.04]} fontSize={0.1} color="#b6322a" anchorX="center">{translate(language, "E · OPEN / CLOSE")}</Text>
    </group>
    <group position={[-20.05, 3.72, 0]} rotation={[0, -Math.PI / 2, 0]}>
      <mesh castShadow position={[0, 0, -0.07]}><boxGeometry args={[2.8, 0.92, 0.14]} /><meshStandardMaterial color="#795334" /></mesh>
      <mesh position={[0, 0, 0.01]}><boxGeometry args={[2.62, 0.74, 0.025]} /><meshBasicMaterial color="#f5eadb" /></mesh>
      <mesh position={[0, 0.32, 0.03]}><boxGeometry args={[2.62, 0.07, 0.02]} /><meshBasicMaterial color="#b6322a" /></mesh>
      <Text position={[0, 0.07, 0.04]} fontSize={0.19} color="#181310" anchorX="center">{translate(language, "MAIN LABORATORY")}</Text>
      <Text position={[0, -0.18, 0.04]} fontSize={0.1} color="#b6322a" anchorX="center">{translate(language, "CENTRAL REACTION BENCH →")}</Text>
    </group>
  </group>;
}

function ChemicalRoomInterior({ language }) {
  return <>
    {/* Central Reagent Preparation & Dispensing Bench */}
    <group position={[-30.05, 0, 0]}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[3.2, 0.9, 1.8]} />
        <meshStandardMaterial color="#0d1712" roughness={0.55} />
      </mesh>
      {/* Cabinet doors and a quiet accent line finish the reagent island. */}
      {[-0.95, 0, 0.95].map((x) => <group key={`prep-cabinet-${x}`} position={[x, 0.44, 0.92]}>
        <mesh><boxGeometry args={[0.82, 0.61, 0.04]} /><meshStandardMaterial color="#795334" roughness={0.52} /></mesh>
        <mesh position={[0.26, 0, 0.027]}><boxGeometry args={[0.045, 0.13, 0.025]} /><meshStandardMaterial color="#10b981" metalness={0.56} roughness={0.3} /></mesh>
      </group>)}
      <mesh position={[0, 0.12, 0.94]}><boxGeometry args={[3.02, 0.08, 0.035]} /><meshStandardMaterial color="#10b981" roughness={0.42} /></mesh>
      <mesh position={[0, 0.93, 0]}>
        <boxGeometry args={[3.4, 0.06, 2.0]} />
        <meshStandardMaterial color="#bd9468" roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Precision scale */}
      <mesh position={[-0.8, 1.0, 0]}>
        <boxGeometry args={[0.5, 0.08, 0.5]} />
        <meshStandardMaterial color="#795334" roughness={0.3} />
      </mesh>
      <mesh position={[-0.8, 1.08, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
        <meshStandardMaterial color="#10b981" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Reagent squeeze bottles */}
      <mesh position={[0.25, 0.98, 0.4]}>
        <boxGeometry args={[1.5, 0.035, 0.55]} />
        <meshStandardMaterial color="#795334" roughness={0.65} />
      </mesh>
      {[-0.2, 0.1, 0.4, 0.7].map((x, i) => (
        <mesh key={x} position={[x, 1.15, 0.4]} castShadow>
          <cylinderGeometry args={[0.07, 0.08, 0.32, 10]} />
          <meshStandardMaterial color={["#10b981", "#ef4444", "#a855f7", "#00ff88"][i]} transparent opacity={0.65} />
        </mesh>
      ))}
      <Text position={[0, 1.02, 0.95]} rotation={[0, 0, 0]} fontSize={0.14} color="#181310" anchorX="center">
        {translate(language, "DISPENSING & PREPARATION BENCH")}
      </Text>
      <Text position={[0, 0.78, 0.95]} rotation={[0, 0, 0]} fontSize={0.11} color="#b6322a" anchorX="center">
        E · OPEN CHEMICAL SEARCH
      </Text>
    </group>
  </>;
}
function MainLabBackWall({ onElementSelect, language }) {
  return <group position={[0, 0, -14.82]}>
    <PeriodicTableChart language={language} onElementSelect={onElementSelect} />
  </group>;
}

function RoomShell() {
  return <>
    {/* Main Lab Floor */}
    <mesh receiveShadow position={[0, -0.05, 0]}>
      <boxGeometry args={[40, 0.1, 30]} />
      <meshStandardMaterial color="#dfd8ce" roughness={0.84} />
    </mesh>
    {Array.from({ length: 28 }, (_, index) => <mesh key={`floor-x-${index}`} position={[-20 + index * 1.5, 0.01, 0]}>
      <boxGeometry args={[0.018, 0.01, 30]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}
    {Array.from({ length: 21 }, (_, index) => <mesh key={`floor-z-${index}`} position={[0, 0.012, -15 + index * 1.5]}>
      <boxGeometry args={[40, 0.01, 0.018]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}

    {/* Quiz Room Floor */}
    <mesh receiveShadow position={[27.55, -0.05, 0]}><boxGeometry args={[15.1, 0.1, 16.4]} /><meshStandardMaterial color="#dfd8ce" roughness={0.82} /></mesh>
    {Array.from({ length: 10 }, (_, index) => <mesh key={`quiz-floor-x-${index}`} position={[20.8 + index * 1.5, 0.012, 0]}>
      <boxGeometry args={[0.018, 0.01, 16.4]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}
    {Array.from({ length: 11 }, (_, index) => <mesh key={`quiz-floor-z-${index}`} position={[27.55, 0.014, -7.5 + index * 1.5]}>
      <boxGeometry args={[15.1, 0.01, 0.018]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}

    {/* Enlarged Chemical Store Room Floor (West Wing) */}
    <mesh receiveShadow position={[-30.05, -0.05, 0]}><boxGeometry args={[20.1, 0.1, 16.4]} /><meshStandardMaterial color="#dfd8ce" roughness={0.78} /></mesh>
    {Array.from({ length: 14 }, (_, index) => <mesh key={`chem-floor-x-${index}`} position={[-20.5 - index * 1.5, 0.012, 0]}>
      <boxGeometry args={[0.018, 0.01, 16.4]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}
    {Array.from({ length: 11 }, (_, index) => <mesh key={`chem-floor-z-${index}`} position={[-30.05, 0.014, -7.5 + index * 1.5]}>
      <boxGeometry args={[20.1, 0.01, 0.018]} /><meshStandardMaterial color="#bdb3a5" />
    </mesh>)}

    {/* West Wall of Main Lab (with 4.24m doorway to Chemical Store Room) */}
    <mesh position={[-19.9, 3.5, -8.55]}><boxGeometry args={[0.2, 7, 12.9]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[-19.9, 3.5, 8.55]}><boxGeometry args={[0.2, 7, 12.9]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[-19.9, 5, 0]}><boxGeometry args={[0.2, 4, 4.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>

    {/* Chemical Store Room Outer Walls */}
    <mesh position={[-30.05, 3.5, -8.2]}><boxGeometry args={[20.1, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.92} /></mesh>
    <mesh position={[-30.05, 3.5, 8.2]}><boxGeometry args={[20.1, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.92} /></mesh>
    <mesh position={[-40.1, 3.5, 0]}><boxGeometry args={[0.2, 7, 16.4]} /><meshStandardMaterial color="#e7c5ad" roughness={0.92} /></mesh>
    {/* Matching lower wall trim makes the enlarged chemical room feel finished. */}
    <mesh position={[-30.05, 0.18, -8.055]}><boxGeometry args={[19.9, 0.12, 0.08]} /><meshStandardMaterial color="#946c4b" roughness={0.66} /></mesh>
    <mesh position={[-30.05, 0.18, 8.055]}><boxGeometry args={[19.9, 0.12, 0.08]} /><meshStandardMaterial color="#946c4b" roughness={0.66} /></mesh>
    <mesh position={[-39.955, 0.18, 0]}><boxGeometry args={[0.08, 0.28, 16.15]} /><meshStandardMaterial color="#946c4b" roughness={0.66} /></mesh>

    {/* East Wall of Main Lab (with doorway to Quiz Room) */}
    <mesh position={[19.9, 3.5, -8.55]}><boxGeometry args={[0.2, 7, 12.9]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[19.9, 3.5, 8.55]}><boxGeometry args={[0.2, 7, 12.9]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[19.9, 5, 0]}><boxGeometry args={[0.2, 4, 4.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>

    {/* Quiz Room Outer Walls */}
    <mesh position={[27.55, 3.5, -8.2]}><boxGeometry args={[15.1, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[27.55, 3.5, 8.2]}><boxGeometry args={[15.1, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[35.1, 3.5, 0]}><boxGeometry args={[0.2, 7, 16.4]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>

    {/* Main Lab South and North Walls */}
    <mesh position={[-13, 3.5, 14.9]}><boxGeometry args={[14, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[13, 3.5, 14.9]}><boxGeometry args={[14, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[-4.625, 3.5, 14.9]}><boxGeometry args={[2.75, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[4.625, 3.5, 14.9]}><boxGeometry args={[2.75, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[0, 6.825, 14.9]}><boxGeometry args={[6.5, 0.35, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>
    <mesh position={[0, 3.5, -14.9]}><boxGeometry args={[40, 7, 0.2]} /><meshStandardMaterial color="#e7c5ad" roughness={0.94} /></mesh>

    {/* Skirting boards */}
    <mesh position={[-19.76, 0.2, -8.55]}><boxGeometry args={[0.08, 0.32, 12.9]} /><meshStandardMaterial color="#946c4b" /></mesh>
    <mesh position={[-19.76, 0.2, 8.55]}><boxGeometry args={[0.08, 0.32, 12.9]} /><meshStandardMaterial color="#946c4b" /></mesh>
    <mesh position={[19.76, 0.2, -8.55]}><boxGeometry args={[0.08, 0.32, 12.9]} /><meshStandardMaterial color="#946c4b" /></mesh>
    <mesh position={[19.76, 0.2, 8.55]}><boxGeometry args={[0.08, 0.32, 12.9]} /><meshStandardMaterial color="#946c4b" /></mesh>
    {/* Continuous warm wood skirting along both front-wall sections. */}
    <mesh position={[-13, 0.18, 14.76]}><boxGeometry args={[14, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[13, 0.18, 14.76]}><boxGeometry args={[14, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[-4.625, 0.18, 14.76]}><boxGeometry args={[2.75, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[4.625, 0.18, 14.76]}><boxGeometry args={[2.75, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[0, 0.045, 14.76]}><boxGeometry args={[6.3, 0.09, 0.28]} /><meshStandardMaterial color="#795334" /></mesh>

    {/* Continue the brown skirting around the wall-floor edges in every room. */}
    <mesh position={[0, 0.18, -14.76]}><boxGeometry args={[40, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[27.55, 0.18, -8.06]}><boxGeometry args={[15.1, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[27.55, 0.18, 8.06]}><boxGeometry args={[15.1, 0.24, 0.08]} /><meshStandardMaterial color="#795334" /></mesh>
    <mesh position={[35.0, 0.18, 0]}><boxGeometry args={[0.08, 0.24, 16.15]} /><meshStandardMaterial color="#795334" /></mesh>
    {/* The shared doorway walls get matching trim on the room-facing side too. */}
    {[-1, 1].map((side) => <group key={`room-partition-trim-${side}`}>
      <mesh position={[-20.04, 0.18, side * 8.55]}><boxGeometry args={[0.08, 0.24, 12.9]} /><meshStandardMaterial color="#795334" /></mesh>
      <mesh position={[20.04, 0.18, side * 8.55]}><boxGeometry args={[0.08, 0.24, 12.9]} /><meshStandardMaterial color="#795334" /></mesh>
    </group>)}

    {/* Ceilings */}
    <mesh position={[0, 6.9, 0]}><boxGeometry args={[40, 0.14, 30]} /><meshStandardMaterial color="#ffffff" roughness={0.96} /></mesh>
    <mesh position={[27.55, 6.9, 0]}><boxGeometry args={[15.1, 0.14, 16.4]} /><meshStandardMaterial color="#ffffff" roughness={0.96} /></mesh>
    <mesh position={[-30.05, 6.9, 0]}><boxGeometry args={[20.1, 0.14, 16.4]} /><meshStandardMaterial color="#ffffff" roughness={0.96} /></mesh>
  </>;
}

const CHEMICALS_PER_RACK = 24;

const SHELF_SLOTS = [
  // Put the most useful class racks beside the entrance, then continue along
  // both side walls and the parallel center rows with clear walking aisles.
  ...Array.from({ length: 9 }, (_, index) => {
    const x = -21.5 - index * 2.125;
    return [
      { pos: [x, 0, -7.38], rot: [0, Math.PI, 0] },
      { pos: [x, 0, 7.38], rot: [0, 0, 0] },
    ];
  }).flat(),

  // Two parallel, double-sided storage runs add capacity without stacking
  // large cabinets over one another or blocking the chemical-room doorway.
  ...Array.from({ length: 8 }, (_, index) => {
    const x = -22.5 - index * (15 / 7);
    return [
      { pos: [x, 0, -3.15], rot: [0, Math.PI, 0] },
      { pos: [x, 0, 3.15], rot: [0, 0, 0] },
    ];
  }).flat(),

  ...Array.from({ length: 7 }, (_, index) => ({
    pos: [-39.2, 0, -6 + index * 2],
    rot: [0, -Math.PI / 2, 0],
  })),
];

const CLASS_9_FRONT_SHELF = [
  "sodium_bicarbonate", "acetic_acid", "sodium_acetate", "carbon_dioxide", "water",
  "sodium_sulfate", "barium_chloride", "barium_sulfate", "sodium_chloride",
  "zinc", "hydrochloric_acid", "zinc_chloride", "hydrogen", "calcium_carbonate",
  "calcium_chloride", "ethanol", "carbon", "oxygen", "magnesium", "magnesium_oxide",
  "nitrogen", "magnesium_nitride", "lithium", "lithium_nitride", "sodium", "sulfur",
  "aluminium", "aluminium_oxide", "chlorine",
];

function LabScene({
    language = "en",
    chemicals = {},
    allChemicals = {},
    onSelectChemical,
    activeId,
    compatibleIds,
    onNearTable,
    onNearQuizSeat,
    onSitQuizSeat,
    onInteractQuiz,
    onInteractChemicalDoor,
    onInteractQuizDoor,
    onInteractionPrompt,
    onInteractPoster,
    onOpenChemicalSearch,
    onLeaveChemicalBench,
    chemicalDoorOpen = false,
    quizDoorOpen = false,
    mouseSensitivity = 1,
    mobileMoveRef,
    onElementSelect,
    onTheorySelect,
    standRequest = 0,
    quizSeated = false,
    reactionResult,
    simulationState = null,
    controlsEnabled = true,
    selectedClass = null,
}) {
  const cabinetGroups = useMemo(() => {
    const selectedClassNumber = Number(selectedClass);
    const examTrack = ["jee", "neet"].includes(selectedClass) ? selectedClass : null;
    const allClasses = selectedClass === "all";
    const selectedClassChemicals = new Set(NCERT_REACTIONS
      .filter((reaction) => examTrack
        ? (!reaction.entranceOnly || (reaction.tracks ?? []).includes(examTrack))
        : !reaction.entranceOnly && (allClasses || (reaction.classes ?? []).some((level) => Number(level) <= selectedClassNumber)))
      .flatMap(reactionChemicalIds));
    if (!examTrack && (allClasses || selectedClassNumber >= 9)) CLASS_9_FRONT_SHELF.forEach((id) => selectedClassChemicals.add(id));
    const class9Priority = new Map(CLASS_9_FRONT_SHELF.map((id, index) => [id, index]));
    const chemicalsByCategory = Object.values(chemicals).reduce((acc, chemical) => {
      const category = chemical.category || "Miscellaneous";
      if (!acc[category]) acc[category] = [];
      acc[category].push(chemical);
      return acc;
    }, {});
    // Put this student's class reagents in the first racks and at eye level;
    // keep the complete Class 9–12 collection available behind them.
    const racks = Object.entries(chemicalsByCategory).flatMap(([category, list]) => {
      const sorted = [...list].sort((a, b) => Number(selectedClassChemicals.has(b.id)) - Number(selectedClassChemicals.has(a.id))
        || (selectedClassNumber === 9 ? (class9Priority.get(a.id) ?? Infinity) - (class9Priority.get(b.id) ?? Infinity) : 0)
        || a.name.localeCompare(b.name));
      const rackCount = Math.ceil(sorted.length / CHEMICALS_PER_RACK);
      return Array.from({ length: rackCount }, (_, rackIndex) => ({
        category,
        title: rackCount > 1 ? `${category} ${rackIndex + 1}` : category,
        chemicals: sorted.slice(rackIndex * CHEMICALS_PER_RACK, (rackIndex + 1) * CHEMICALS_PER_RACK),
        classChemicalCount: sorted.slice(rackIndex * CHEMICALS_PER_RACK, (rackIndex + 1) * CHEMICALS_PER_RACK)
          .filter((chemical) => selectedClassChemicals.has(chemical.id)).length,
      }));
    });
    return racks.sort((a, b) => b.classChemicalCount - a.classChemicalCount || a.category.localeCompare(b.category));
  }, [chemicals, selectedClass]);

  const cabinetPositions = useMemo(() => cabinetGroups.map((_, index) => {
    // Never wrap the rack list back to the first slot: that stacked extra
    // Class 11–12 cabinets over existing ones and made bottles unclickable.
    return SHELF_SLOTS[index] ?? null;
  }), [cabinetGroups]);

  const obstacles = useMemo(() => [
    ...LAB_STATIONS.map((station) => ({ x: station.x, z: station.z, halfX: 7.15, halfZ: 1.65 })),

    // Keep the main lab's complete front and rear wall planes solid. In
    // particular, the rear wall had no collider and the old player Z limit
    // extended far beyond the building, allowing the camera into the void.
    { x: -13, z: 14.9, halfX: 7.1, halfZ: 0.24 },
    { x: 13, z: 14.9, halfX: 7.1, halfZ: 0.24 },
    { x: -4.625, z: 14.9, halfX: 1.5, halfZ: 0.24 },
    { x: 4.625, z: 14.9, halfX: 1.5, halfZ: 0.24 },
    { x: 0, z: 14.9, halfX: 3.25, halfZ: 0.24 },
    { x: 0, z: -14.9, halfX: 20.1, halfZ: 0.24 },

    // East wall (Quiz Room doorway at Z=0)
    { x: 19.9, z: -8.55, halfX: 0.22, halfZ: 6.45 },
    { x: 19.9, z: 8.55, halfX: 0.22, halfZ: 6.45 },
    ...(!quizDoorOpen ? [{ x: 19.9, z: 0, halfX: 0.22, halfZ: 1.8 }] : []),
    { x: 27.55, z: -8.2, halfX: 7.55, halfZ: 0.22 },
    { x: 27.55, z: 8.2, halfX: 7.55, halfZ: 0.22 },
    { x: 35.1, z: 0, halfX: 0.2, halfZ: 8.2 },

    // West wall (Chemical Store Room doorway at Z=0)
    { x: -19.9, z: -8.55, halfX: 0.22, halfZ: 6.45 },
    { x: -19.9, z: 8.55, halfX: 0.22, halfZ: 6.45 },
    ...(!chemicalDoorOpen ? [{ x: -19.9, z: 0, halfX: 0.22, halfZ: 1.8 }] : []),
    { x: -30.05, z: -8.2, halfX: 10.05, halfZ: 0.22 },
    { x: -30.05, z: 8.2, halfX: 10.05, halfZ: 0.22 },
    { x: -40.1, z: 0, halfX: 0.2, halfZ: 8.2 },
    // Chemical room central dispensing island
    { x: -30.05, z: 0, halfX: 1.7, halfZ: 1.0 },

    // Main lab fixtures
    { x: -3, z: 3, halfX: 0.36, halfZ: 0.36 },
    { x: 3, z: 3, halfX: 0.36, halfZ: 0.36 },
    { x: 0, z: -4, halfX: 0.72, halfZ: 0.52 },

    // Shelves in chemical room
    ...cabinetPositions.filter(Boolean).map((slot) => {
      const isHorizontal = Math.abs(slot.rot[1]) < 0.1 || Math.abs(Math.abs(slot.rot[1]) - Math.PI) < 0.1;
      return {
        x: slot.pos[0],
        z: slot.pos[2],
        halfX: isHorizontal ? 1.04 : 0.42,
        halfZ: isHorizontal ? 0.42 : 1.04,
      };
    }),
  ], [cabinetPositions, chemicalDoorOpen, quizDoorOpen]);

  return <>
    <ambientLight intensity={1.0} /><hemisphereLight args={["#f5fbff", "#a4bbc4", 0.85]} /><directionalLight position={[-6, 12, 5]} color="#f5fbff" intensity={1.2} />
    <RoomShell />
    {[-12, 0, 12].flatMap((x) => [-7, 0, 7].map((z) => [x, z]))
      .filter(([x, z]) => x !== 0 || z !== 0).map(([x, z]) => (
      <CeilingLight key={`main-light-${x}-${z}`} position={[x, 6.76, z]} />
    ))}
    <CeilingLight position={[0, 6.76, 0]} scale={1.15} />
    <CeilingLight position={[27.5,6.76,0]} />
    {/* Chemical Storage Room Ceiling Lights */}
    {[[-24, 6.76, -3.8], [-24, 6.76, 3.8], [-30, 6.76, -3.8], [-30, 6.76, 3.8], [-36, 6.76, -3.8], [-36, 6.76, 3.8]].map(([x, y, z]) => (
      <CeilingLight key={`chem-light-${x}-${y}-${z}`} position={[x, y, z]} />
    ))}
    <CeilingLight position={[-30.05, 6.76, 0]} scale={1.15} />
    <QuizRoomDoor language={language} open={quizDoorOpen} /><QuizClassroom language={language} onTheorySelect={onTheorySelect} />
    <ChemicalRoomDoor language={language} open={chemicalDoorOpen} /><ChemicalRoomInterior language={language} />
    <MainLabBackWall language={language} onElementSelect={onElementSelect} />
    {cabinetGroups.map((cabinet, index) => (
      cabinetPositions[index] && <Cabinet
        key={cabinet.title}
        language={language}
        title={cabinet.title}
        position={cabinetPositions[index].pos}
        rotation={cabinetPositions[index].rot}
        color={COLORS[cabinet.category] || COLORS.Default}
        chemicals={cabinet.chemicals}
        onSelect={onSelectChemical}
        activeId={activeId}
        compatibleIds={compatibleIds}
      />
    ))}
    <LabBench position={[0,0,0]} stationType="universal" />
    {reactionResult && (
      <ExperimentRenderer
        key={reactionResult.runId}
        language={language}
        reaction={reactionResult}
        position={reactionResult.stationPosition ?? [0, 0]}
        allChemicals={allChemicals || chemicals}
        reactionProgress={simulationState?.reactionProgress ?? 0}
      />
    )}
    <Stool position={[-3,0,3]} /><Stool position={[3,0,3]} /><Skeleton position={[0,0,-4]} rotation={[0,0.78,0]} />
    <LabFixtures language={language} onTheorySelect={onTheorySelect} /><Door language={language} /><Player enabled={controlsEnabled} onNearTable={onNearTable} onNearQuizSeat={onNearQuizSeat} onSitQuizSeat={onSitQuizSeat} onInteractQuiz={onInteractQuiz} onInteractChemicalDoor={onInteractChemicalDoor} onInteractQuizDoor={onInteractQuizDoor} onOpenChemicalSearch={onOpenChemicalSearch} onLeaveChemicalBench={onLeaveChemicalBench} onInteractionPrompt={onInteractionPrompt} onInteractPoster={onInteractPoster} chemicalDoorOpen={chemicalDoorOpen} quizDoorOpen={quizDoorOpen} mouseSensitivity={mouseSensitivity} mobileMoveRef={mobileMoveRef} standRequest={standRequest} seatedInQuizRoom={quizSeated} obstacles={obstacles} reactionRunId={reactionResult?.runId ?? null} reactionStationPosition={reactionResult?.stationPosition ?? null} />
  </>;
}

export default memo(LabScene);




