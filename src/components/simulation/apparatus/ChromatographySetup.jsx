import { memo, useMemo } from "react";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import GlassBeaker from "./GlassBeaker";

function ChromatographySetup({
  position = [0, 0, 0],
  scale = 1,
  reactionProgress = 0,
  language = "en",
}) {
  // Capillary rise progress: 0 to 1
  const rise = THREE.MathUtils.smoothstep(reactionProgress, 0.08, 0.95);

  // Pigment band positions rising up the paper strip:
  // Paper extends from y = 0.12 to y = 0.95 (height ~ 0.83)
  // Baseline is at y = 0.22
  const solventFrontY = THREE.MathUtils.lerp(0.22, 0.88, rise);
  const caroteneY = THREE.MathUtils.lerp(0.22, 0.82, rise); // Rf ~ 0.90 (Orange/Yellow)
  const xanthophyllY = THREE.MathUtils.lerp(0.22, 0.68, rise); // Rf ~ 0.70 (Yellow)
  const chlorophyllAY = THREE.MathUtils.lerp(0.22, 0.54, rise); // Rf ~ 0.48 (Blue-Green)
  const chlorophyllBY = THREE.MathUtils.lerp(0.22, 0.40, rise); // Rf ~ 0.28 (Yellow-Green)

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* 1. Chromatography Beaker */}
      <GlassBeaker position={[0, 0, 0]} scale={1.35} />

      {/* Solvent liquid at base of beaker */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.39, 0.38, 0.18, 32]} />
        <meshPhysicalMaterial
          color="#d1fae5"
          transparent
          opacity={0.48}
          roughness={0.08}
          transmission={0.88}
          thickness={0.08}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Horizontal Support Rod resting across beaker rim */}
      <mesh position={[0, 1.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 1.15, 16]} />
        <meshStandardMaterial color="#b45309" roughness={0.65} metalness={0.1} />
      </mesh>

      {/* Clip attaching paper strip to support rod */}
      <mesh position={[0, 1.06, 0]}>
        <boxGeometry args={[0.06, 0.05, 0.03]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 3. Whatman Chromatography Paper Strip */}
      <group position={[0, 0.55, 0]}>
        {/* Main paper strip */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.26, 0.92]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.9}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Solvent wet tint climbing up paper */}
        {rise > 0.02 && (
          <mesh position={[0, (solventFrontY - 0.55) / 2 - 0.22, 0.001]}>
            <planeGeometry args={[0.258, solventFrontY - 0.12]} />
            <meshStandardMaterial
              color="#e0f2fe"
              transparent
              opacity={0.35}
              roughness={0.9}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Origin pencil line */}
        <mesh position={[0, -0.33, 0.002]}>
          <boxGeometry args={[0.24, 0.003, 0.002]} />
          <meshBasicMaterial color="#94a3b8" />
        </mesh>
        {/* Origin spot: dark green leaf extract */}
        <mesh position={[0, -0.33, 0.003]}>
          <circleGeometry args={[0.022, 16]} />
          <meshBasicMaterial color="#14532d" />
        </mesh>

        {/* 4. Developing Pigment Bands */}
        {rise > 0.12 && (
          <>
            {/* Band 1: Carotene (Orange-Yellow, leading band) */}
            <mesh position={[0, caroteneY - 0.55, 0.003]}>
              <planeGeometry args={[0.24, 0.035]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.88} />
            </mesh>

            {/* Band 2: Xanthophyll (Bright Yellow) */}
            <mesh position={[0, xanthophyllY - 0.55, 0.003]}>
              <planeGeometry args={[0.24, 0.04]} />
              <meshBasicMaterial color="#eab308" transparent opacity={0.88} />
            </mesh>

            {/* Band 3: Chlorophyll a (Blue-Green) */}
            <mesh position={[0, chlorophyllAY - 0.55, 0.003]}>
              <planeGeometry args={[0.24, 0.048]} />
              <meshBasicMaterial color="#059669" transparent opacity={0.92} />
            </mesh>

            {/* Band 4: Chlorophyll b (Yellow-Green / Olive) */}
            <mesh position={[0, chlorophyllBY - 0.55, 0.003]}>
              <planeGeometry args={[0.24, 0.048]} />
              <meshBasicMaterial color="#84cc16" transparent opacity={0.88} />
            </mesh>
          </>
        )}
      </group>

      {/* Floating annotations pointing to bands */}
      {rise > 0.4 && (
        <group position={[0.42, 0, 0]}>
          <Text position={[0, caroteneY, 0]} fontSize={0.055} color="#fb923c" anchorX="left">
            {"← Carotene (Orange)"}
          </Text>
          <Text position={[0, xanthophyllY, 0]} fontSize={0.055} color="#facc15" anchorX="left">
            {"← Xanthophyll (Yellow)"}
          </Text>
          <Text position={[0, chlorophyllAY, 0]} fontSize={0.055} color="#34d399" anchorX="left">
            {"← Chlorophyll a (Blue-Green)"}
          </Text>
          <Text position={[0, chlorophyllBY, 0]} fontSize={0.055} color="#a3e635" anchorX="left">
            {"← Chlorophyll b (Yellow-Green)"}
          </Text>
        </group>
      )}

      {/* Top Banner */}
      <Text position={[0, 1.35, 0]} fontSize={0.095} color="#6ee7b7" anchorX="center">
        {language === "hi" ? "प्रकाश संश्लेषण वर्णक (क्रोमैटोग्राफी)" : "Leaf Pigment Paper Chromatography"}
      </Text>
    </group>
  );
}

export default memo(ChromatographySetup);
