import { Html, Line, Text } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getChemicalColor, getReactionColor } from "../data/chemicalVisuals";
import soundManager from "../utils/soundManager";
import { translate } from "../i18n";

const ANIMATION_LENGTH = 4.8;
const sampleColor = (chemical) => chemical?.color || getChemicalColor(chemical);
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const FLASK_PROFILE = [
  new THREE.Vector2(0.35, 0.04), new THREE.Vector2(0.38, 0.1),
  new THREE.Vector2(0.72, 0.73), new THREE.Vector2(0.7, 0.79),
  new THREE.Vector2(0.18, 0.79), new THREE.Vector2(0.17, 0.85),
  new THREE.Vector2(0.17, 1.16), new THREE.Vector2(0.2, 1.18),
];
const VIAL_PROFILE = [
  new THREE.Vector2(0.17, 0.03), new THREE.Vector2(0.23, 0.07),
  new THREE.Vector2(0.24, 0.64), new THREE.Vector2(0.2, 0.73),
  new THREE.Vector2(0.11, 0.81), new THREE.Vector2(0.11, 1.1),
  new THREE.Vector2(0.14, 1.12),
];
const VIAL_LIQUID_PROFILE = [
  new THREE.Vector2(0, 0.06), new THREE.Vector2(0.2, 0.06),
  new THREE.Vector2(0.21, 0.38), new THREE.Vector2(0, 0.38),
];
const LIQUID_PROFILE = [
  new THREE.Vector2(0, 0.08), new THREE.Vector2(0.35, 0.08),
  new THREE.Vector2(0.56, 0.47), new THREE.Vector2(0.56, 0.51),
  new THREE.Vector2(0, 0.51),
];

function colorFromObservation(reaction, fallback) {
  if (reaction?.gameEffect?.depositColor) return reaction.gameEffect.depositColor;
  const note = String(reaction?.observations?.precipitate ?? "").toLowerCase();
  if (note.includes("yellow")) return "#e2c534";
  if (note.includes("green")) return "#4b9c69";
  if (note.includes("blue")) return "#328fc6";
  if (note.includes("brown")) return "#8b3f27";
  if (note.includes("black")) return "#292c31";
  if (note.includes("white") || note.includes("milky")) return "#e4e3dc";

  const precipitateId = note.replaceAll(" ", "_");
  const product = reaction?.outcome?.products?.find((item) => item.id === precipitateId)
    ?? reaction?.outcome?.products?.find((item) => item.chemical?.state === "solid");
  return product?.chemical ? sampleColor(product.chemical) : fallback;
}

function gasColor(reaction) {
  const gases = reaction?.outcome?.products?.filter((item) => item.chemical?.state === "gas") ?? [];
  const gas = gases[0]?.chemical;
  if (gas?.id === "nitrogen_dioxide") return "#a8673e";
  if (gas?.id === "chlorine") return "#b8c45b";
  if (gas?.id === "bromine") return "#a75234";
  return gas ? "#d8e6e8" : "#d6e0e3";
}

function ReactionCallout({ language, position, point, accent, title, value, detail }) {
  return <>
    <Line points={[position, point]} color={accent} lineWidth={2} transparent opacity={0.9} depthTest={false} depthWrite={false} />
    <mesh position={point}>
      <sphereGeometry args={[0.055, 12, 10]} /><meshBasicMaterial color={accent} toneMapped={false} />
    </mesh>
    <Html position={position} center zIndexRange={[11, 8]} style={{ pointerEvents: "none" }}>
      <div className="reaction-world-callout" style={{ "--callout-accent": accent }}>
        <span>{translate(language, title)}</span><strong>{value}</strong>{detail && <small>{translate(language, detail)}</small>}
      </div>
    </Html>
  </>;
}

export default function ReactionShowcase({ language = "en", reaction, onComplete }) {
  const elapsed = useRef(0);
  const completed = useRef(false);
  const containers = useRef([]);
  const droplets = useRef([]);
  const streams = useRef([]);
  const reagentLiquids = useRef([]);
  const bubbles = useRef([]);
  const vapours = useRef([]);
  const solids = useRef([]);
  const sparks = useRef([]);
  const flask = useRef();
  const liquid = useRef();
  const liquidSurface = useRef();
  const swirl = useRef();
  const surfaceGeometry = useMemo(() => new THREE.CircleGeometry(0.52, 48), []);
  const flash = useRef();
  const burstRing = useRef();
  const heatGlow = useRef();
  const heatLight = useRef();
  const sourceSamples = reaction?.samples ?? [];
  // A one-reactant reaction starts in its reaction flask. Separate vials are
  // reserved for two or more inputs, so one reagent is never duplicated.
  const reagentVials = sourceSamples.length > 1 ? sourceSamples : [];
  const inputColors = useMemo(() => (reaction?.samples ?? []).slice(0, 4).map(sampleColor), [reaction]);
  const sourceXPositions = useMemo(() => {
    const layouts = {
      2: [-1.12, 1.12],
      3: [-2.0, 0, 2.0],
      4: [-2.2, -0.75, 0.75, 2.2],
    };
    return layouts[Math.min(sourceSamples.length, 4)] ?? [];
  }, [sourceSamples.length]);
  const solutionSample = useMemo(() => (reaction?.samples ?? []).find((sample) => sample.state === "liquid") ?? (reaction?.samples ?? [])[0], [reaction]);
  const startingColor = useMemo(() => {
    return new THREE.Color(sampleColor(solutionSample) ?? inputColors[0] ?? "#dce9e8");
  }, [solutionSample, inputColors]);
  const resultHex = useMemo(() => reaction?.gameEffect?.finalColor || getReactionColor(reaction), [reaction]);
  const resultColor = useMemo(() => new THREE.Color(resultHex), [resultHex]);
  const precipitateColor = useMemo(() => colorFromObservation(reaction, resultHex), [reaction, resultHex]);
  const gas = Boolean(!reaction?.noReaction && (reaction?.observations?.gas
    || reaction?.gameEffect?.bubbles
    || reaction?.outcome?.products?.some((item) => item.chemical?.state === "gas")));
  const rapidGasRelease = Boolean(reaction?.gameEffect?.rapidGasRelease);
  const hasPrecipitate = Boolean(!reaction?.noReaction && (reaction?.observations?.precipitate || reaction?.gameEffect?.precipitate || reaction?.gameEffect?.deposit));
  const gasHex = useMemo(() => gasColor(reaction), [reaction]);
  const releasesHeat = Boolean(reaction?.observations?.lightProduced || reaction?.observations?.temperatureChange === "increase"
    || reaction?.gameEffect?.heat || reaction?.id?.includes("thermite"));
  const heatingRequired = Boolean(reaction?.conditions?.heatRequired);
  const producesLight = Boolean(reaction?.observations?.lightProduced || reaction?.id?.includes("thermite"));
  const products = reaction?.outcome?.products ?? [];
  const productSummary = products.map((item) => item.chemical?.formula ?? item.id).filter(Boolean).join(" + ") || "No product recorded";
  const gasProduct = products.find((item) => item.chemical?.state === "gas");
  const gasSummary = language === "hi"
    ? (gasProduct?.chemical?.name ?? (gas ? "गैस निकलती है" : "कोई गैस नहीं बनी"))
    : reaction?.observations?.gas || gasProduct?.chemical?.name || "No gas recorded";
  const precipitateProduct = products.find((item) => item.id === reaction?.observations?.precipitate)
    ?? products.find((item) => item.chemical?.state === "solid");
  const solidSummary = reaction?.observations?.precipitate
    ? (precipitateProduct?.chemical?.name ?? String(reaction.observations.precipitate).replaceAll("_", " "))
    : reaction?.gameEffect?.deposit ? (language === "hi" ? "धातु का निक्षेप बनता है" : "Metal deposit forms") : (language === "hi" ? "कोई अवक्षेप नहीं बना" : "No precipitate recorded");
  const energySummary = releasesHeat ? (language === "hi" ? "ऊष्मा निकलती है" : "Heat released")
    : heatingRequired ? (language === "hi" ? "गर्म करना आवश्यक" : "Heating required") : (language === "hi" ? "ताप में बदलाव दर्ज नहीं" : "No heat change recorded");

  const pourSoundTriggered = useRef(false);
  const reactionSoundTriggered = useRef(false);

  useEffect(() => () => surfaceGeometry.dispose(), [surfaceGeometry]);

  useEffect(() => {
    elapsed.current = 0;
    completed.current = false;
    pourSoundTriggered.current = false;
    reactionSoundTriggered.current = false;
    return () => {
      soundManager.stopPourSound();
      soundManager.stopReactionSound();
    };
  }, [reaction]);

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 0.05);
    const time = elapsed.current;
    if (sourceSamples.length > 1 && !pourSoundTriggered.current && time >= 0.2) {
      pourSoundTriggered.current = true;
      soundManager.playPourSound(1.35);
    }

    if (!reactionSoundTriggered.current && time >= 1.05 && !reaction?.noReaction) {
      reactionSoundTriggered.current = true;
      soundManager.playReactionSound({
        gas,
        heat: releasesHeat,
        light: producesLight,
        precipitate: hasPrecipitate,
        duration: 2.8,
      });
    }

    containers.current.forEach((container, index) => {
      if (!container) return;
      const pour = THREE.MathUtils.smoothstep(time, 0.08, 0.72);
      const returnPour = THREE.MathUtils.smoothstep(time, 0.95, 1.3);
      const tilt = Math.sin(pour * Math.PI / 2) * (1 - returnPour);
      const bottleX = sourceXPositions[index] ?? (index ? 1.12 : -1.12);
      const side = bottleX < 0 ? -1 : 1;
      container.rotation.z = side * tilt * 0.86;
      container.position.x = bottleX + side * tilt * 0.12;
      container.position.y = 2.15 + Math.sin(time * 3.2 + index * 1.7) * 0.035;

      const sourceLiquid = reagentLiquids.current[index];
      if (sourceLiquid) {
        const drained = THREE.MathUtils.smoothstep(time, 0.18, 1.35);
        sourceLiquid.scale.y = 1 - drained * 0.62;
      }

      const stream = streams.current[index];
      if (stream) {
        const flow = THREE.MathUtils.smoothstep(time, 0.32, 0.56) * (1 - THREE.MathUtils.smoothstep(time, 1.12, 1.48));
        stream.visible = flow > 0.015;
        const start = new THREE.Vector3(bottleX - side * Math.sin(tilt) * 0.76, 2.15 + Math.cos(tilt) * 1.08, sourceSamples.length > 2 ? 0.92 : 0.12);
        const end = new THREE.Vector3(side * 0.1, 2.08, 0.08);
        const direction = end.clone().sub(start);
        stream.position.copy(start).add(end).multiplyScalar(0.5);
        stream.quaternion.setFromUnitVectors(WORLD_UP, direction.clone().normalize());
        stream.scale.set(1, direction.length(), 1);
        if (stream.children[0]?.material) stream.children[0].material.opacity = flow * 0.86;
      }
    });

    droplets.current.forEach((drop, index) => {
      if (!drop) return;
      const local = time - 0.28 - index * 0.055;
      const progress = THREE.MathUtils.clamp(local / 1.12, 0, 1);
      drop.visible = sourceSamples.length > 1 && progress > 0 && progress < 1;
      const side = index % 2 ? 1 : -1;
      drop.position.set(side * (0.84 - progress * 0.72), 2.98 - progress * 0.9 + Math.sin(progress * Math.PI) * 0.06, 0.09);
      drop.scale.set(0.075, 0.12 + Math.sin(progress * Math.PI) * 0.035, 0.075);
    });

    bubbles.current.forEach((bubble, index) => {
      if (!bubble) return;
      const phase = ((Math.max(0, time - 1.15) * (rapidGasRelease ? 1.75 + index * 0.025 : 0.65 + index * 0.015)) + index / Math.max(bubbles.current.length, 1)) % 1;
      bubble.visible = gas && time > 1.15 && time < 4.1;
      bubble.position.set(Math.sin(index * 2.4 + time * (rapidGasRelease ? 2.1 : 1)) * (rapidGasRelease ? 0.24 : 0.17), 0.2 + phase * (rapidGasRelease ? 0.86 : 0.76), 0.08);
      bubble.scale.setScalar((rapidGasRelease ? 0.052 : 0.045) + phase * 0.04);
    });

    vapours.current.forEach((puff, index) => {
      if (!puff) return;
      const phase = ((Math.max(0, time - 1.35) * (rapidGasRelease ? 1.6 : 1) + index * 0.27) % 2.55) / 2.55;
      puff.visible = gas && time > 1.35;
      puff.position.set(Math.sin(index * 2.1 + time * 0.8) * (0.14 + phase * 0.3), 0.92 + phase * 1.65, 0.02);
      puff.scale.set(0.12 + phase * 0.26, 0.16 + phase * 0.36, 0.12 + phase * 0.26);
      puff.material.opacity = (1 - phase) * 0.34;
    });

    solids.current.forEach((solid, index) => {
      if (!solid) return;
      const settle = THREE.MathUtils.clamp((time - 1.7 - index * 0.035) / 0.76, 0, 1);
      solid.visible = hasPrecipitate && time > 1.7;
      const angle = index * 2.399;
      const orbit = (1 - settle) * 0.22;
      solid.position.set(Math.cos(angle + time * 1.7) * orbit, 0.68 - settle * 0.57, Math.sin(angle + time * 1.7) * orbit * 0.7 + 0.08);
      solid.scale.setScalar((0.045 + (index % 4) * 0.012) * settle);
    });

    sparks.current.forEach((spark, index) => {
      if (!spark) return;
      const local = time - 1.38 - index * 0.025;
      const progress = THREE.MathUtils.clamp(local / 0.78, 0, 1);
      spark.visible = producesLight && progress > 0 && progress < 1;
      const angle = (index / Math.max(sparks.current.length, 1)) * Math.PI * 2;
      const distance = 0.18 + progress * (0.48 + (index % 3) * 0.1);
      spark.position.set(Math.cos(angle) * distance, 0.62 + Math.sin(angle) * distance, 0.12);
      spark.scale.setScalar((1 - progress) * (0.12 + (index % 2) * 0.06));
    });

    const mix = reaction?.noReaction ? 0 : THREE.MathUtils.smoothstep(time, 0.86, 2.25);
    const fill = reaction?.noReaction ? 0 : THREE.MathUtils.smoothstep(time, 0.2, 1.65);
    if (liquid.current) {
      liquid.current.material.color.copy(startingColor).lerp(resultColor, mix);
      liquid.current.scale.y = Math.max(fill, 0.001);
    }
    if (liquidSurface.current) {
      liquidSurface.current.material.color.copy(startingColor).lerp(resultColor, mix);
      liquidSurface.current.visible = fill > 0.08;
      liquidSurface.current.position.y = 0.08 + fill * 0.43;
      liquidSurface.current.scale.setScalar(0.62 + fill * 0.38);
      const positions = liquidSurface.current.geometry.attributes.position;
      for (let index = 0; index < positions.count; index += 1) {
        const x = positions.getX(index);
        const z = positions.getY(index);
        const radius = Math.min(1, Math.hypot(x, z) / 0.52);
        const angle = Math.atan2(z, x);
        const agitation = time < 2.6 ? 1 : 0.45;
        const wave = (Math.sin(angle * 3 + time * 4.5) * 0.018 + Math.cos(angle * 5 - time * 3.2) * 0.009) * (1 - radius * radius) * agitation;
        positions.setZ(index, wave);
      }
      positions.needsUpdate = true;
      liquidSurface.current.geometry.computeVertexNormals();
    }
    if (swirl.current) {
      swirl.current.rotation.y += delta * (gas ? 1.4 : 0.65);
      swirl.current.visible = sourceSamples.length > 1 && fill > 0.24 && time < 2.9;
    }
    if (flask.current) {
      const pulse = releasesHeat ? Math.sin(Math.max(0, time - 1.3) * (rapidGasRelease ? 14 : 10)) * Math.exp(-Math.max(0, time - 1.3) * (rapidGasRelease ? 1.65 : 2.1)) : 0;
      flask.current.position.y = (heatingRequired ? 1.245 : 1.145) + pulse * 0.045;
      flask.current.rotation.z = pulse * 0.03 + Math.sin(time * 3.4) * 0.008;
    }
    if (flash.current) {
      const strength = producesLight ? Math.max(0, 1 - Math.abs(time - 1.45) / 0.3) : 0;
      flash.current.material.opacity = strength * 0.68;
      flash.current.scale.setScalar(0.3 + (1 - strength) * 1.3);
    }
    if (burstRing.current) {
      const progress = THREE.MathUtils.clamp((time - 1.36) / 0.72, 0, 1);
      burstRing.current.visible = producesLight && progress < 1;
      burstRing.current.scale.setScalar(0.3 + progress * 2.6);
      burstRing.current.material.opacity = (1 - progress) * 0.85;
    }
    const heatFade = 1 - THREE.MathUtils.smoothstep(time, 3.2, 4.35);
    const heatPulse = releasesHeat ? THREE.MathUtils.smoothstep(time, 0.8, 1.45) * heatFade * (0.68 + Math.sin(time * 12) * 0.2) : 0;
    if (heatGlow.current) {
      heatGlow.current.visible = heatPulse > 0.03;
      heatGlow.current.material.opacity = heatPulse * 0.58;
      heatGlow.current.scale.setScalar(0.7 + heatPulse * 0.35);
    }
    if (heatLight.current) heatLight.current.intensity = heatPulse * (producesLight ? 5 : 2.2);
    if (time >= ANIMATION_LENGTH && !completed.current) {
      completed.current = true;
      onComplete?.(reaction?.runId);
    }
  });

  return <group>
    {reagentVials.slice(0, 4).map((sample, index) => <group key={"pour-stream-" + index} ref={(node) => { streams.current[index] = node; }} visible={false}>
      <mesh><cylinderGeometry args={[0.028, 0.055, 1, 12]} /><meshStandardMaterial color={inputColors[index]} transparent opacity={0} roughness={0.22} depthWrite={false} /></mesh>
    </group>)}

    {reagentVials.slice(0, 4).map((sample, index) => <group key={sample.id + "-" + index} ref={(node) => { containers.current[index] = node; }} position={[sourceXPositions[index] ?? (index ? 1.12 : -1.12), 2.15, sourceSamples.length > 2 ? 0.92 : 0.12]} scale={sourceSamples.length > 2 ? 0.84 : 1}>
      <mesh castShadow><latheGeometry args={[VIAL_PROFILE, 32]} /><meshPhysicalMaterial color="#effbfc" transparent opacity={0.27} roughness={0.1} transmission={0.42} side={THREE.DoubleSide} /></mesh>
      <mesh ref={(node) => { reagentLiquids.current[index] = node; }} position={[0, 0, 0.008]}><latheGeometry args={[VIAL_LIQUID_PROFILE, 28]} /><meshPhysicalMaterial color={inputColors[index]} transparent opacity={0.9} roughness={0.17} transmission={0.08} side={THREE.DoubleSide} /></mesh>
      <mesh position={[0, 1.115, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.125, 0.018, 8, 28]} /><meshStandardMaterial color="#d8e6e8" metalness={0.18} roughness={0.2} /></mesh>
      <mesh position={[0, 1.2, 0]}><cylinderGeometry args={[0.09, 0.1, 0.13, 12]} /><meshStandardMaterial color="#d9c79d" roughness={0.62} /></mesh>
      <mesh position={[0, 0.49, 0.225]}><boxGeometry args={[0.37, 0.22, 0.018]} /><meshStandardMaterial color="#fbfcf8" roughness={0.7} /></mesh>
      <Text position={[0, 0.49, 0.239]} fontSize={0.09} color="#263b47" anchorX="center" maxWidth={0.34}>{sample.formula || sample.name}</Text>
    </group>)}

    {Array.from({ length: 10 }, (_, index) => <mesh key={`drop-${index}`} ref={(node) => { droplets.current[index] = node; }} visible={false}>
      <sphereGeometry args={[1, 14, 12]} /><meshStandardMaterial color={inputColors[index % Math.max(inputColors.length, 1)] ?? "#d6e7e8"} roughness={0.2} metalness={0.04} />
    </mesh>)}

    {heatingRequired && <group>
      <mesh castShadow receiveShadow position={[0, 1.27, 0]}><boxGeometry args={[1.22, 0.1, 1.02]} /><meshStandardMaterial color="#344b53" metalness={0.42} roughness={0.34} /></mesh>
      <mesh position={[0, 1.325, 0]}><boxGeometry args={[1.06, 0.018, 0.86]} /><meshStandardMaterial color="#2a3437" metalness={0.62} roughness={0.26} /></mesh>
      <mesh position={[0, 1.337, 0]} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[0.31, 0.025, 8, 36]} /><meshBasicMaterial color="#f17b38" toneMapped={false} /></mesh>
      <mesh position={[0.47, 1.27, 0.516]}><cylinderGeometry args={[0.06, 0.06, 0.035, 16]} /><meshStandardMaterial color="#b7c8c6" metalness={0.58} roughness={0.28} /></mesh>
      <Text position={[-0.14, 1.27, 0.518]} fontSize={0.07} color="#e6f0ed" anchorX="center">{translate(language, "HOT PLATE")}</Text>
    </group>}
    <group ref={flask} position={[0, heatingRequired ? 1.245 : 1.145, 0]} scale={[1.25, 1.25, 1.25]}>
      <mesh position={[0, 0.02, 0]}><latheGeometry args={[FLASK_PROFILE, 32]} /><meshPhysicalMaterial color="#e9f6f7" transparent opacity={0.32} roughness={0.1} transmission={0.22} side={THREE.DoubleSide} /></mesh>
      <mesh ref={liquid} position={[0, 0, 0]} scale={[1, 0.001, 1]}><latheGeometry args={[LIQUID_PROFILE, 30]} /><meshStandardMaterial color={startingColor} roughness={0.16} metalness={0.02} side={THREE.DoubleSide} /></mesh>
      <mesh ref={liquidSurface} geometry={surfaceGeometry} visible={false} position={[0, 0.08, 0.025]} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={startingColor} roughness={0.14} metalness={0.02} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={swirl} visible={false} position={[0, 0.41, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.012, 8, 48]} /><meshBasicMaterial color="#f1ffff" transparent opacity={0.28} depthWrite={false} />
      </mesh>
      <mesh ref={heatGlow} position={[0, 0.16, 0.02]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
        <torusGeometry args={[0.48, 0.065, 10, 48]} /><meshBasicMaterial color="#ff7d35" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight ref={heatLight} position={[0, 0.42, 0.32]} color={producesLight ? "#ffb347" : "#ff7045"} intensity={0} distance={3.2} decay={2} />
      <mesh position={[0, 1.2, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.19, 0.018, 8, 28]} /><meshStandardMaterial color="#e2f1f3" transparent opacity={0.76} /></mesh>
      {Array.from({ length: rapidGasRelease ? 26 : 14 }, (_, index) => <mesh key={`bubble-${index}`} ref={(node) => { bubbles.current[index] = node; }} visible={false}>
        <sphereGeometry args={[1, 12, 10]} /><meshStandardMaterial color={gasHex} transparent opacity={0.75} />
      </mesh>)}
      {Array.from({ length: 9 }, (_, index) => <mesh key={`vapour-${index}`} ref={(node) => { vapours.current[index] = node; }} visible={false}>
        <sphereGeometry args={[1, 16, 12]} /><meshStandardMaterial color={gasHex} transparent opacity={0.3} depthWrite={false} />
      </mesh>)}
      {Array.from({ length: 26 }, (_, index) => <mesh key={`solid-${index}`} ref={(node) => { solids.current[index] = node; }} visible={false}>
        <icosahedronGeometry args={[1, 0]} /><meshStandardMaterial color={precipitateColor} roughness={0.9} />
      </mesh>)}
      {Array.from({ length: 14 }, (_, index) => <mesh key={`spark-${index}`} ref={(node) => { sparks.current[index] = node; }} visible={false}>
        <octahedronGeometry args={[1, 0]} /><meshBasicMaterial color={index % 3 === 0 ? "#fff2a6" : "#ff8a35"} toneMapped={false} />
      </mesh>)}
      <mesh ref={flash} position={[0, 0.74, 0.04]}>
        <sphereGeometry args={[0.6, 18, 14]} /><meshBasicMaterial color="#ffb347" transparent opacity={0} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={burstRing} position={[0, 0.86, 0.05]} visible={false}>
        <torusGeometry args={[0.38, 0.025, 8, 28]} /><meshBasicMaterial color="#ffc05a" transparent opacity={0.8} depthWrite={false} toneMapped={false} />
      </mesh>
      <Text position={[0, 0.14, 0.39]} fontSize={0.085} color="#30424d" anchorX="center">{reaction?.noReaction ? translate(language, "NO REACTION") : sourceSamples.length === 1 ? `${translate(language, "START:")} ${sourceSamples[0]?.formula || sourceSamples[0]?.name}` : translate(language, "PRODUCT MIXTURE")}</Text>
    </group>
    <Text position={[0, 3.63, 0]} fontSize={0.17} color="#1b2932" anchorX="center">{translate(language, heatingRequired ? "HEATING · WATCH THE CHANGE" : sourceSamples.length === 1 ? "REACTION · WATCH THE CHANGE" : "MIXING · WATCH THE CHANGE")}</Text>
    <ReactionCallout language={language} position={[-3.35, 3.12, 0.2]} point={[-0.58, 2.32, 0.12]} accent="#3bbda5" title="PRODUCTS FORMED" value={productSummary} detail="Balanced reaction result" />
    <ReactionCallout language={language} position={[-3.35, 2.02, 0.2]} point={[-0.34, 2.72, 0.12]} accent={gas ? gasHex : "#75a8bc"} title="GAS RELEASED" value={gasSummary} detail={gas ? "Bubbles and vapour visible" : "No gas formed"} />
    <ReactionCallout language={language} position={[-3.35, 0.92, 0.2]} point={[-0.35, 1.62, 0.12]} accent={releasesHeat ? "#ff9a42" : precipitateColor} title="SOLID / ENERGY" value={solidSummary} detail={energySummary} />
  </group>;
}
