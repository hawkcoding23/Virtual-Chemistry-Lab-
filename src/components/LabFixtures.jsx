import { Text } from "@react-three/drei";
import InteractionSurface from "./InteractionSurface";
import { translate } from "../i18n";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { CanvasTexture, Raycaster, SRGBColorSpace, Vector2 } from "three";

const PERIODIC_ELEMENTS = `H|Hydrogen;He|Helium;Li|Lithium;Be|Beryllium;B|Boron;C|Carbon;N|Nitrogen;O|Oxygen;F|Fluorine;Ne|Neon;Na|Sodium;Mg|Magnesium;Al|Aluminium;Si|Silicon;P|Phosphorus;S|Sulfur;Cl|Chlorine;Ar|Argon;K|Potassium;Ca|Calcium;Sc|Scandium;Ti|Titanium;V|Vanadium;Cr|Chromium;Mn|Manganese;Fe|Iron;Co|Cobalt;Ni|Nickel;Cu|Copper;Zn|Zinc;Ga|Gallium;Ge|Germanium;As|Arsenic;Se|Selenium;Br|Bromine;Kr|Krypton;Rb|Rubidium;Sr|Strontium;Y|Yttrium;Zr|Zirconium;Nb|Niobium;Mo|Molybdenum;Tc|Technetium;Ru|Ruthenium;Rh|Rhodium;Pd|Palladium;Ag|Silver;Cd|Cadmium;In|Indium;Sn|Tin;Sb|Antimony;Te|Tellurium;I|Iodine;Xe|Xenon;Cs|Caesium;Ba|Barium;La|Lanthanum;Ce|Cerium;Pr|Praseodymium;Nd|Neodymium;Pm|Promethium;Sm|Samarium;Eu|Europium;Gd|Gadolinium;Tb|Terbium;Dy|Dysprosium;Ho|Holmium;Er|Erbium;Tm|Thulium;Yb|Ytterbium;Lu|Lutetium;Hf|Hafnium;Ta|Tantalum;W|Tungsten;Re|Rhenium;Os|Osmium;Ir|Iridium;Pt|Platinum;Au|Gold;Hg|Mercury;Tl|Thallium;Pb|Lead;Bi|Bismuth;Po|Polonium;At|Astatine;Rn|Radon;Fr|Francium;Ra|Radium;Ac|Actinium;Th|Thorium;Pa|Protactinium;U|Uranium;Np|Neptunium;Pu|Plutonium;Am|Americium;Cm|Curium;Bk|Berkelium;Cf|Californium;Es|Einsteinium;Fm|Fermium;Md|Mendelevium;No|Nobelium;Lr|Lawrencium;Rf|Rutherfordium;Db|Dubnium;Sg|Seaborgium;Bh|Bohrium;Hs|Hassium;Mt|Meitnerium;Ds|Darmstadtium;Rg|Roentgenium;Cn|Copernicium;Nh|Nihonium;Fl|Flerovium;Mc|Moscovium;Lv|Livermorium;Ts|Tennessine;Og|Oganesson`
  .split(";").map((entry, index) => {
    const [symbol, name] = entry.split("|");
    return { number: index + 1, symbol, name };
  });

const TABLE_FAMILIES = {
  alkali: { label: "Alkali metals", color: "#d89b82" },
  alkaline: { label: "Alkaline earth metals", color: "#e4c078" },
  transition: { label: "Transition metals", color: "#a8bdc9" },
  postTransition: { label: "Post-transition metals", color: "#9fc2ad" },
  metalloid: { label: "Metalloids", color: "#c2acd0" },
  nonmetal: { label: "Other non-metals", color: "#aacb9c" },
  halogen: { label: "Halogens", color: "#d79baa" },
  noble: { label: "Noble gases", color: "#b4b8d4" },
  lanthanoid: { label: "Lanthanoids", color: "#87beb7" },
  actinoid: { label: "Actinoids", color: "#c69a71" },
};

const ATOMIC_MASSES = `1.008 4.0026 6.94 9.0122 10.81 12.011 14.007 15.999 18.998 20.180 22.990 24.305 26.982 28.085 30.974 32.06 35.45 39.948 39.098 40.078 44.956 47.867 50.942 51.996 54.938 55.845 58.933 58.693 63.546 65.38 69.723 72.630 74.922 78.971 79.904 83.798 85.468 87.62 88.906 91.224 92.906 95.95 98 101.07 102.906 106.42 107.868 112.414 114.818 118.710 121.760 127.60 126.904 131.293 132.905 137.327 138.905 140.116 140.908 144.242 145 150.36 151.964 157.25 158.925 162.500 164.930 167.259 168.934 173.045 174.967 178.49 180.948 183.84 186.207 190.23 192.217 195.084 196.967 200.592 204.38 207.2 208.980 209 210 222 223 226 227 232.038 231.036 238.029 237 244 243 247 247 251 252 257 258 259 266 267 268 269 270 269 278 281 282 285 286 289 290 293 294 294`.split(" ");

const PERIOD_LAYOUT = [
  [[1, 1], [2, 18]],
  [[3, 1], [4, 2], [5, 13], [6, 14], [7, 15], [8, 16], [9, 17], [10, 18]],
  [[11, 1], [12, 2], [13, 13], [14, 14], [15, 15], [16, 16], [17, 17], [18, 18]],
  Array.from({ length: 18 }, (_, index) => [19 + index, index + 1]),
  Array.from({ length: 18 }, (_, index) => [37 + index, index + 1]),
  [[55, 1], [56, 2], [57, 3], ...Array.from({ length: 15 }, (_, index) => [72 + index, index + 4])],
  [[87, 1], [88, 2], [89, 3], ...Array.from({ length: 15 }, (_, index) => [104 + index, index + 4])],
  Array.from({ length: 14 }, (_, index) => [58 + index, 4 + index]),
  Array.from({ length: 14 }, (_, index) => [90 + index, 4 + index]),
];

const PERIODIC_CELL_INFO = new Map(PERIOD_LAYOUT.flatMap((row, rowIndex) => row.map(([number, group]) => [number, {
  group,
  period: rowIndex >= 7 ? rowIndex - 1 : rowIndex + 1,
}])));

function elementFamily(number, group) {
  if (number >= 58 && number <= 71) return "lanthanoid";
  if (number >= 90 && number <= 103) return "actinoid";
  if (group === 18) return "noble";
  if (group === 17) return "halogen";
  if (group === 1 && number !== 1) return "alkali";
  if (group === 2) return "alkaline";
  if (group >= 3 && group <= 12) return "transition";
  if ([5, 14, 32, 33, 51, 52].includes(number)) return "metalloid";
  if ([1, 6, 7, 8, 15, 16, 34].includes(number)) return "nonmetal";
  return "postTransition";
}

function drawPeriodicTableTexture(language) {
  const canvas = document.createElement("canvas");
  canvas.width = 1880;
  canvas.height = 950;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#fbf4e9");
  gradient.addColorStop(1, "#ead9c5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#795334";
  ctx.lineWidth = 5;
  ctx.strokeRect(12, 12, canvas.width - 24, canvas.height - 24);
  ctx.fillStyle = "#b6322a";
  ctx.fillRect(18, 18, canvas.width - 36, 12);

  ctx.textAlign = "center";
  ctx.fillStyle = "#a52e27"; 
  ctx.font = "700 44px Arial, sans-serif";
  ctx.fillText(translate(language, "PERIODIC TABLE OF THE ELEMENTS"), canvas.width / 2, 83);
  ctx.fillStyle = "#53443c";
  ctx.font = "20px Arial, sans-serif";
  ctx.fillText(translate(language, "118 ELEMENTS  ·  ATOMIC NUMBER  ·  ELEMENT FAMILIES"), canvas.width / 2, 119);

  const periods = PERIOD_LAYOUT;
  const elementsByNumber = new Map(PERIODIC_ELEMENTS.map((element) => [element.number, element]));
  const cellWidth = 90;
  const cellHeight = 57;
  const gap = 8;
  const startX = 60;
  const startY = 155;
  const rowPitch = cellHeight + gap;

  const drawCell = (number, group, row, column = group - 1) => { 
    const element = elementsByNumber.get(number);
    if (!element) return;
    const family = elementFamily(number, group);
    const { color } = TABLE_FAMILIES[family];
    const x = startX + column * (cellWidth + gap);
    const y = startY + row * rowPitch;
    ctx.fillStyle = "#fffaf2";
    ctx.beginPath();
    ctx.roundRect(x, y, cellWidth, cellHeight, 8);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4, 7);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#53443c";
    ctx.font = "12px Arial, sans-serif";
    ctx.fillText(String(number), x + 7, y + 15);
    ctx.textAlign = "center";
    ctx.fillStyle = "#181310";
    ctx.font = "700 25px Arial, sans-serif";
    ctx.fillText(element.symbol, x + cellWidth / 2, y + 38);
    ctx.fillStyle = "#33291f";
    ctx.font = "10px Arial, sans-serif";
    ctx.fillText(element.name, x + cellWidth / 2, y + 52, cellWidth - 7);
  };

  periods.forEach((period, row) => period.forEach(([number, group]) => drawCell(number, group, row)));
  ctx.textAlign = "left";
  ctx.fillStyle = "#53443c";
  ctx.font = "700 12px Arial, sans-serif";
  ctx.fillText(translate(language, "LANTHANOIDS"), 18, startY + 7 * rowPitch + 34);
  ctx.fillText(translate(language, "ACTINOIDS"), 18, startY + 8 * rowPitch + 34);
  Array.from({ length: 14 }, (_, index) => drawCell(58 + index, 4 + index, 7, 3 + index));
  Array.from({ length: 14 }, (_, index) => drawCell(90 + index, 4 + index, 8, 3 + index));

  const familyEntries = Object.entries(TABLE_FAMILIES);
  familyEntries.forEach(([key, family], index) => {
    const row = index < 5 ? 0 : 1;
    const column = index % 5;
    const x = 74 + column * 362;
    const y = 824 + row * 52;
    ctx.fillStyle = family.color;
    ctx.beginPath();
    ctx.arc(x, y - 5, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = "#53443c";
    ctx.font = "15px Arial, sans-serif";
    ctx.fillText(translate(language, family.label), x + 18, y);
  });

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function elementDetails(number) {
  const element = PERIODIC_ELEMENTS[number - 1];
  const location = PERIODIC_CELL_INFO.get(number);
  if (!element || !location) return null;
  const familyKey = elementFamily(number, location.group);
  const block = number >= 58 && number <= 71 || number >= 90 && number <= 103
    ? "f"
    : location.group <= 2 ? "s" : location.group >= 13 ? "p" : "d";
  const groupLabel = block === "f" ? "f-block series" : `Group ${location.group}`;
  return {
    ...element,
    mass: ATOMIC_MASSES[number - 1] ?? "—",
    groupLabel,
    period: location.period,
    block,
    family: TABLE_FAMILIES[familyKey]?.label ?? "Element",
    note: `${TABLE_FAMILIES[familyKey]?.label ?? "Element"} · ${block}-block element in period ${location.period}. Atomic mass is the standard value for naturally occurring isotopes where defined; bracketed mass numbers are used for elements without a standard atomic weight.`,
  };
}

export function PeriodicTableChart({ onElementSelect, language }) {
  const texture = useMemo(() => drawPeriodicTableTexture(language), [language]);
  useEffect(() => () => texture.dispose(), [texture]);
  const hitboxes = useRef([]);
  const aimedElement = useRef(null);
  const raycaster = useRef(new Raycaster());
  const center = useMemo(() => new Vector2(0, 0), []);
  const cells = useMemo(() => PERIOD_LAYOUT.flatMap((row, rowIndex) => row.map(([number, group], column) => {
    const element = elementDetails(number);
    if (!element) return null;
    const gridColumn = rowIndex >= 7 ? column + 3 : group - 1;
    const gridRow = rowIndex >= 7 ? rowIndex : rowIndex;
    const xPx = 60 + gridColumn * (90 + 8);
    const yPx = 155 + gridRow * (57 + 8);
    return {
      element,
      x: (xPx + 45) / 1880 * 12.22 - 12.22 / 2,
      y: 6.02 / 2 - ((yPx + 28.5) / 950 * 6.02),
    };
  })).filter(Boolean), []);

  useFrame(({ camera }) => {
    raycaster.current.setFromCamera(center, camera);
    const hits = raycaster.current.intersectObjects(hitboxes.current.filter(Boolean), false);
    aimedElement.current = hits[0]?.object.userData.element ?? null;
  });
  useEffect(() => {
    const selectAimed = (event) => {
      if (event.code !== "KeyE" || event.repeat || !aimedElement.current) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onElementSelect?.(aimedElement.current);
    };
    window.addEventListener("keydown", selectAimed, true);
    return () => window.removeEventListener("keydown", selectAimed, true);
  }, [onElementSelect]);

  return <group position={[0, 3.55, 0.04]}>
    <mesh castShadow>
      <boxGeometry args={[12.38, 6.1, 0.14]} />
      <meshStandardMaterial color="#795334" roughness={0.55} />
    </mesh>
    <mesh position={[0, 3.01, 0.079]}><boxGeometry args={[12.22, 0.1, 0.025]} /><meshBasicMaterial color="#b6322a" /></mesh>
    <mesh position={[0, 0, 0.078]}>
      <planeGeometry args={[12.22, 6.02]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
    {cells.map(({ element, x, y }) => <mesh key={`element-hit-${element.number}`} ref={(node) => {
      if (node) {
        node.userData.element = element;
        hitboxes.current[element.number - 1] = node;
      } else hitboxes.current[element.number - 1] = null;
    }} position={[x, y, 0.09]} onClick={(event) => {
      event.stopPropagation();
      onElementSelect?.(element);
    }}>
      <planeGeometry args={[0.59, 0.37]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>)}
  </group>;
}

function AirConditioner({ position, rotation = [0, 0, 0], language }) {
  return <group position={position} rotation={rotation}>
    <mesh castShadow><boxGeometry args={[3.15, 0.68, 0.62]} /><meshStandardMaterial color="#e7edf0" roughness={0.48} /></mesh>
    <mesh position={[0, -0.22, 0.322]}><boxGeometry args={[2.72, 0.12, 0.035]} /><meshStandardMaterial color="#aebcc4" /></mesh>
    <mesh position={[0, -0.24, 0.344]}><boxGeometry args={[2.24, 0.035, 0.018]} /><meshStandardMaterial color="#536675" /></mesh>
    <mesh position={[1.31, 0.05, 0.325]}><circleGeometry args={[0.06, 16]} /><meshBasicMaterial color="#52c6ae" /></mesh>
    <Text position={[0, 0.06, 0.33]} fontSize={0.13} color="#536675" anchorX="center">{translate(language, "COOL · CLEAN AIR")}</Text>
  </group>;
}

function FireExtinguisher({ position, rotation = [0, 0, 0], language }) {
  return <group position={position} rotation={rotation}>
    <mesh position={[0, 0.82, -0.15]}><boxGeometry args={[0.58, 1.72, 0.16]} /><meshStandardMaterial color="#f5f6f4" /></mesh>
    <Text position={[0, 1.39, -0.055]} fontSize={0.15} color="#c5222b" anchorX="center">{translate(language, "FIRE")}</Text>
    <Text position={[0, 1.18, -0.055]} fontSize={0.105} color="#c5222b" anchorX="center">{translate(language, "EXTINGUISHER")}</Text>
    <mesh castShadow position={[0, 0.72, 0.12]}><cylinderGeometry args={[0.22, 0.24, 0.92, 18]} /><meshStandardMaterial color="#c9272c" metalness={0.1} roughness={0.45} /></mesh>
    <mesh position={[0, 1.2, 0.12]}><cylinderGeometry args={[0.08, 0.09, 0.13, 12]} /><meshStandardMaterial color="#263545" /></mesh>
    <mesh position={[0.04, 1.34, 0.1]} rotation={[0, 0, -0.24]}><torusGeometry args={[0.12, 0.025, 8, 12, Math.PI]} /><meshStandardMaterial color="#263545" /></mesh>
    <mesh position={[0.19, 0.91, 0.12]} rotation={[0, 0, -0.48]}><cylinderGeometry args={[0.018, 0.018, 0.61, 7]} /><meshStandardMaterial color="#1f2937" /></mesh>
  </group>;
}

function Frame({ width, height, children, accent = "#46c6b4", onOpen, interactionData }) {
  return <group>
    <mesh position={[0, 0, -0.08]} castShadow>
      <boxGeometry args={[width, height, 0.14]} /><meshStandardMaterial color="#795334" />
    </mesh>
    <mesh position={[0, 0, 0.002]}><boxGeometry args={[width - 0.24, height - 0.24, 0.025]} /><meshBasicMaterial color="#f5eadb" /></mesh>
    <mesh position={[0, height / 2 - 0.12, 0.012]}><boxGeometry args={[width, 0.12, 0.035]} /><meshStandardMaterial color="#b6322a" /></mesh>
    {onOpen && <InteractionSurface width={width} height={height} position={[0, 0, 0.055]} payload={interactionData}
      onClick={(event) => { event.stopPropagation(); onOpen(); }} />}
    {children}
  </group>;
}

function LearningPoster({ language, position, rotation = [0, -Math.PI / 2, 0], title, subtitle, accent, lines, width = 5.3, height = 3.55, onOpen }) {
  const compact = width < 3;
  const left = -width / 2 + 0.3;
  const titleY = height / 2 - 0.44;
  const subtitleY = titleY - 0.3;
  const firstLineY = subtitleY - 0.48;
  const lastLineY = -height / 2 + 0.35;
  const lineStep = lines.length > 1 ? Math.min(0.55, (firstLineY - lastLineY) / (lines.length - 1)) : 0.55;
  return <group position={position} rotation={rotation}>
    <Frame width={width} height={height} accent={accent} onOpen={onOpen} interactionData={{ type: "poster", label: title, title, subtitle, accent, lines }}>
      <Text position={[left, titleY, 0.02]} anchorX="left" fontSize={compact ? 0.17 : 0.27} color="#982d24" maxWidth={width - 0.6}>{translate(language, title)}</Text>
      <Text position={[left, subtitleY, 0.02]} anchorX="left" fontSize={compact ? 0.11 : 0.15} color="#433328" maxWidth={width - 0.6}>{translate(language, subtitle)}</Text>
      {lines.map((line, index) => <group key={line} position={[left + 0.07, firstLineY - index * lineStep, 0.03]}>
        <mesh position={[0, 0.02, 0]}><circleGeometry args={[0.075, 12]} /><meshBasicMaterial color="#b6322a" /></mesh>
        <Text position={[0.17, 0.02, 0]} anchorX="left" fontSize={compact ? 0.105 : line.length > 30 ? 0.15 : 0.17} color="#17120e" maxWidth={width - 0.65}>{translate(language, line)}</Text>
      </group>)}
    </Frame>
  </group>;
}

function AtomicTheoryPoster({ language, position, variant, rotation = [0, Math.PI, 0], onOpen }) {
  const early = variant === "early";
  const accent = early ? "#e5a640" : "#54b9a9";
  const models = early
    ? [
      { name: "DALTON", note: "Solid, indivisible sphere", type: "dalton" },
      { name: "THOMSON", note: "Electrons in positive matter", type: "thomson" },
    ]
    : [
      { name: "RUTHERFORD", note: "Tiny, dense nucleus", type: "rutherford" },
      { name: "BOHR", note: "Electrons in energy shells", type: "bohr" },
    ];
  return <group position={position} rotation={rotation}>
    <Frame width={5.3} height={3.55} accent={accent} onOpen={onOpen} interactionData={{ type: "poster", label: early ? "EARLY ATOMIC MODELS" : "THE NUCLEAR ATOM", title: early ? "EARLY ATOMIC MODELS" : "THE NUCLEAR ATOM", subtitle: early ? "Dalton → Thomson" : "Rutherford → Bohr", accent, lines: early ? ["Dalton described matter with indivisible atoms.", "Thomson’s experiments revealed electrons inside atoms.", "Scientific models change as new evidence appears."] : ["Rutherford’s scattering experiment indicated a small, dense nucleus.", "Bohr described electrons in quantised energy shells.", "Modern atomic theory refines these models with quantum orbitals."] }}>
      <Text position={[-2.38, 1.27, 0.02]} anchorX="left" fontSize={0.2} color="#b6322a">{translate(language, early ? "EARLY ATOMIC MODELS" : "THE NUCLEAR ATOM")}</Text>
      <Text position={[-1.8, 0.98, 0.02]} anchorX="left" fontSize={0.13} color="#53443c">{early ? "Dalton → Thomson" : "Rutherford → Bohr"}</Text>
      <mesh position={[0, -0.25, 0.018]}><boxGeometry args={[0.015, 1.35, 0.025]} /><meshBasicMaterial color="#3c5664" /></mesh>
      {models.map((model, index) => {
        const x = index === 0 ? -1.02 : 1.02;
        return <group key={model.type}>
          <group position={[x, 0.12, 0.04]}>
            {model.type === "dalton" && <mesh><sphereGeometry args={[0.33, 24, 20]} /><meshStandardMaterial color="#79a9d4" roughness={0.3} metalness={0.08} /></mesh>}
            {model.type === "thomson" && <>
              <mesh><sphereGeometry args={[0.36, 24, 20]} /><meshStandardMaterial color="#e2b06a" roughness={0.45} /></mesh>
              {[[-0.17, 0.12], [0.18, 0.1], [0, -0.18]].map(([electronX, electronY], electronIndex) => <mesh key={electronIndex} position={[electronX, electronY, 0.29]}>
                <sphereGeometry args={[0.065, 14, 12]} /><meshStandardMaterial color="#294d79" metalness={0.18} roughness={0.3} />
              </mesh>)}
            </>}
            {model.type === "rutherford" && <>
              <mesh><torusGeometry args={[0.36, 0.018, 8, 48]} /><meshBasicMaterial color="#aabdc7" /></mesh>
              <mesh><sphereGeometry args={[0.105, 18, 16]} /><meshStandardMaterial color="#e78270" roughness={0.3} /></mesh>
              {[[-0.36, 0], [0.36, 0], [0, 0.36], [0, -0.36]].map(([electronX, electronY], electronIndex) => <mesh key={electronIndex} position={[electronX, electronY, 0.015]}>
                <sphereGeometry args={[0.052, 12, 10]} /><meshStandardMaterial color="#55d2c1" roughness={0.28} />
              </mesh>)}
            </>}
            {model.type === "bohr" && <>
              <mesh><torusGeometry args={[0.23, 0.014, 8, 40]} /><meshBasicMaterial color="#aabdc7" /></mesh>
              <mesh><torusGeometry args={[0.43, 0.014, 8, 48]} /><meshBasicMaterial color="#aabdc7" /></mesh>
              <mesh><sphereGeometry args={[0.105, 18, 16]} /><meshStandardMaterial color="#e78270" roughness={0.3} /></mesh>
              {[[0.23, 0], [-0.43, 0], [0, 0.43]].map(([electronX, electronY], electronIndex) => <mesh key={electronIndex} position={[electronX, electronY, 0.02]}>
                <sphereGeometry args={[0.052, 12, 10]} /><meshStandardMaterial color="#55d2c1" roughness={0.28} />
              </mesh>)}
            </>}
          </group>
          <Text position={[x, -0.48, 0.05]} anchorX="center" fontSize={0.14} color={accent}>{model.name}</Text>
          <Text position={[x, -0.75, 0.05]} anchorX="center" fontSize={0.11} color="#211911" maxWidth={1.8}>{translate(language, model.note)}</Text>
        </group>;
      })}
      <Text position={[0, -1.3, 0.03]} anchorX="center" fontSize={0.09} color="#53443c">{translate(language, early ? "Models changed as new evidence was found" : "Each model refined our picture of the atom")}</Text>
    </Frame>
  </group>;
}

export default function LabFixtures({ language = "en", onTheorySelect }) {
  const openTheory = (title, subtitle, accent, lines) => () => onTheorySelect?.({ title, subtitle, accent, lines });
  return <>
    <AirConditioner language={language} position={[-19.26, 6.43, 0]} rotation={[0, Math.PI / 2, 0]} />
    <AirConditioner language={language} position={[19.26, 6.43, 0]} rotation={[0, -Math.PI / 2, 0]} />
    <FireExtinguisher language={language} position={[-19.55, 0.34, -8.5]} rotation={[0, Math.PI / 2, 0]} />
    <FireExtinguisher language={language} position={[19.55, 0.34, 6.7]} rotation={[0, -Math.PI / 2, 0]} />
    <LearningPoster language={language} position={[-19.68, 4.2, -12.35]} rotation={[0, Math.PI / 2, 0]} title="ATOMIC STRUCTURE" subtitle="Inside the atom" accent="#43b8b2" lines={[
      "Protons and neutrons build the nucleus",
      "Electrons occupy shells around the nucleus",
      "Atomic number equals the proton count",
      "Isotopes have different neutron counts",
    ]} onOpen={openTheory("ATOMIC STRUCTURE", "Inside the atom", "#43b8b2", [
      "Protons and neutrons build the nucleus",
      "Electrons occupy shells around the nucleus",
      "Atomic number equals the proton count",
      "Isotopes have different neutron counts",
    ])} />
    <LearningPoster language={language} position={[-19.68, 4.2, 11.85]} rotation={[0, Math.PI / 2, 0]} title="CHEMICAL BONDING" subtitle="How atoms join" accent="#ad89dc" lines={[
      "Ionic bonds form by electron transfer",
      "Covalent bonds share electron pairs",
      "Molecular shape affects its properties",
      "Polarity depends on bonds and shape",
    ]} onOpen={openTheory("CHEMICAL BONDING", "How atoms join", "#ad89dc", [
      "Ionic bonds form by electron transfer",
      "Covalent bonds share electron pairs",
      "Molecular shape affects its properties",
      "Polarity depends on bonds and shape",
    ])} />
    <group position={[-19.66, 3.1, 5.7]} rotation={[0, Math.PI / 2, 0]}>
      <Frame width={4.55} height={2.8} accent="#4aa88d" interactionData={{ type: "doubt-corner", label: "Doubt Corner" }}
        onOpen={() => onTheorySelect?.({ type: "doubt-corner" })}>
        <Text position={[-2.05, 0.73, 0.02]} anchorX="left" fontSize={0.3} color="#28765f">{translate(language, "DOUBT CORNER")}</Text>
        <Text position={[-2.05, 0.36, 0.02]} anchorX="left" fontSize={0.14} color="#433328">{translate(language, "Questions from Classes 9–12")}</Text>
        <Text position={[-2.05, -0.08, 0.02]} anchorX="left" fontSize={0.14} color="#17120e">{translate(language, "Browse reactions, equations and explanations")}</Text>
        <Text position={[-2.05, -0.62, 0.02]} anchorX="left" fontSize={0.16} color="#28765f">{translate(language, "E · OPEN REACTION GUIDE")}</Text>
      </Frame>
      <mesh castShadow receiveShadow position={[0.9, -1.68, 0.42]}>
        <boxGeometry args={[1.65, 0.12, 0.78]} /><meshStandardMaterial color="#9b744f" roughness={0.62} />
      </mesh>
      {[0.28, 1.52].map((x) => [-0.03, 0.83].map((z) => <mesh key={`${x}-${z}`} castShadow position={[x, -1.94, z]}>
        <boxGeometry args={[0.08, 0.52, 0.08]} /><meshStandardMaterial color="#795334" roughness={0.62} />
      </mesh>))}
      <mesh castShadow position={[0.76, -1.53, 0.1]} rotation={[0, 0, -0.05]}>
        <boxGeometry args={[0.36, 0.34, 0.08]} /><meshStandardMaterial color="#527c69" roughness={0.75} />
      </mesh>
    </group>
    <LearningPoster language={language} position={[19.68, 4.2, -10.5]} title="LAB SAFETY" subtitle="Think first · Work carefully" accent="#ec9c42" lines={["Wear eye protection", "Label every sample", "Keep benches clear", "Know the safety equipment"]} onOpen={openTheory("LAB SAFETY", "Think first · Work carefully", "#ec9c42", ["Wear eye protection", "Label every sample", "Keep benches clear", "Know the safety equipment"])} />
    <LearningPoster language={language} position={[19.68, 4.2, 10.5]} title="REACTION CLUES" subtitle="What can you observe?" accent="#47c6b4" lines={["Gas bubbles", "Colour change", "A new solid forms", "Temperature may change"]} onOpen={openTheory("REACTION CLUES", "What can you observe?", "#47c6b4", ["Gas bubbles", "Colour change", "A new solid forms", "Temperature may change"])} />
    <LearningPoster language={language} position={[19.68, 4.2, -4.85]} title="SAFE STORAGE" subtitle="Keep substances organised" accent="#d5c75f" lines={["Keep acids and bases labelled", "Store chemicals by hazard", "Close every bottle after use", "Never return unused samples"]} onOpen={openTheory("SAFE STORAGE", "Keep substances organised", "#d5c75f", ["Keep acids and bases labelled", "Store chemicals by hazard", "Close every bottle after use", "Never return unused samples"])} />
    {/* Keep this chart beyond the inward-swinging quiz door leaf and clear of the doorway. */}
    <LearningPoster language={language} position={[19.68, 4.2, 5.3]} title="REACTION TYPES" subtitle="Recognise the pattern" accent="#67acd3" lines={["Combination · substances join", "Decomposition · one breaks apart", "Displacement · one replaces another", "Double displacement · ions exchange"]} onOpen={openTheory("REACTION TYPES", "Recognise the pattern", "#67acd3", ["Combination · substances join", "Decomposition · one breaks apart", "Displacement · one replaces another", "Double displacement · ions exchange"])} />
    {[
      { x: -15.5, title: "PERIODIC TRENDS", subtitle: "Patterns help predict properties", accent: "#8b79d6", lines: ["Elements in a group share properties", "Atomic number increases across a period"] },
      { x: 15.5, title: "ACIDS, BASES & SALTS", subtitle: "Everyday chemistry · Class 10", accent: "#e4775d", lines: ["Acids turn blue litmus red", "Neutralisation forms salt and water"] },
    ].map(({ x, ...poster }) => <LearningPoster key={poster.title} language={language} position={[x, 4.2, 14.74]} rotation={[0, Math.PI, 0]} {...poster} onOpen={openTheory(poster.title, poster.subtitle, poster.accent, poster.lines)} />)}
    <AtomicTheoryPoster language={language} position={[-9.8, 4.2, 14.74]} variant="early" onOpen={openTheory("EARLY ATOMIC MODELS", "Dalton → Thomson", "#e5a640", ["Dalton described matter with indivisible atoms.", "Thomson’s experiments revealed electrons inside atoms.", "Scientific models change as new evidence appears."])} />
    <AtomicTheoryPoster language={language} position={[9.8, 4.2, 14.74]} variant="modern" onOpen={openTheory("THE NUCLEAR ATOM", "Rutherford → Bohr", "#54b9a9", ["Rutherford’s scattering experiment indicated a small, dense nucleus.", "Bohr described electrons in quantised energy shells.", "Modern atomic theory refines these models with quantum orbitals."])} />
    {[
      { x: -15.5, title: "MATTER & PARTICLES", subtitle: "Tiny particles make up everything", accent: "#49b8ad", lines: ["Particles move and attract one another", "Heating makes particles move faster"] },
      { x: -9.2, title: "ATOMS & ELEMENTS", subtitle: "The building blocks of matter", accent: "#e5a640", lines: ["Protons · neutrons · electrons", "Atomic number counts the protons"] },
      { x: 9.2, title: "FORMULAE & BONDS", subtitle: "Read how atoms join", accent: "#8b79d6", lines: ["Subscripts show atom counts", "Ionic bonds transfer; covalent bonds share electrons"] },
      { x: 15.5, title: "EQUATION CHECK", subtitle: "Matter is conserved in reactions", accent: "#e4775d", lines: ["Count atoms on both sides", "Balance with coefficients"] },
    ].map(({ x, ...poster }) => <LearningPoster key={poster.title} language={language} position={[x, 4.2, -14.74]} rotation={[0, 0, 0]} {...poster} onOpen={openTheory(poster.title, poster.subtitle, poster.accent, poster.lines)} />)}
  </>;
}
