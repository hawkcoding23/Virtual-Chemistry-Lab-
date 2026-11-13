import { memo, useMemo } from "react";
import * as THREE from "three";
import {
  EXPERIMENT_CATEGORIES,
  buildExperimentConfig,
} from "./simulationEngine";
import GlassBeaker from "./apparatus/GlassBeaker";
import GlassFlask from "./apparatus/GlassFlask";
import BunsenBurner from "./apparatus/BunsenBurner";
import ElectrolysisApparatus from "./apparatus/ElectrolysisApparatus";
import BuretteSetup from "./apparatus/BuretteSetup";
import BoilingTubeSetup from "./apparatus/BoilingTubeSetup";
import GasDeliverySystem from "./apparatus/GasDeliverySystem";
import MetalSpecimen from "./apparatus/MetalSpecimen";
import LabThermometer from "./apparatus/LabThermometer";
import CrucibleSetup from "./apparatus/CrucibleSetup";
import MagnesiumRibbonBurner from "./apparatus/MagnesiumRibbonBurner";
import ReagentContainer from "./apparatus/ReagentContainer";
import LiquidVolume from "./effects/LiquidVolume";
import PrecipitateEffect from "./effects/PrecipitateEffect";
import GasEvolutionEffect from "./effects/GasEvolutionEffect";
import ThermalGlowEffect from "./effects/ThermalGlowEffect";
import FlameEffect from "./effects/FlameEffect";

function ExperimentRenderer({
  language = "en",
  reaction,
  allChemicals = {},
  reactionProgress = 0,
  position = [0, 0],
}) {
  const config = useMemo(
    () => buildExperimentConfig(reaction, allChemicals),
    [reaction, allChemicals]
  );

  const setupProgress = THREE.MathUtils.smoothstep(reactionProgress, 0, 0.12);
  const sampleInspectionProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.015, 0.22);
  const productShowcaseProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.78, 0.98);
  const actionProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.12, 0.58);
  const actionStarted = reactionProgress > 0.12;
  const magnesiumRibbonReaction = reaction?.id === "magnesium_oxygen"
    || /2?\s*mg\s*\+\s*o[₂2]\s*→\s*2?\s*mgo/i.test(reaction?.equation || "");

  // Solution colour lerping
  const currentColor = useMemo(() => {
    if (config.category === EXPERIMENT_CATEGORIES.NEUTRALISATION) {
      // Phenolphthalein: pink in base, transitions sharply to colourless
      return new THREE.Color(config.indicator.startColor).lerp(
        new THREE.Color(config.indicator.endColor),
        reactionProgress
      );
    }
    return new THREE.Color(config.startColor).lerp(
      new THREE.Color(config.finalColor),
      reactionProgress
    );
  }, [config, reactionProgress]);

  // Thermometer temperature calculation
  const currentTemperature = useMemo(() => {
    if (config.category === EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION) {
      return 25 + reactionProgress * 420; // 25C to 445C
    }
    if (config.isExothermic) {
      return 25 + reactionProgress * 28; // 25C to 53C
    }
    if (config.isEndothermic) {
      return 25 - reactionProgress * 7; // 25C to 18C
    }
    return 25;
  }, [config, reactionProgress]);

  return (
    <group
      position={[position[0], 0.91 + setupProgress * 0.24, position[1]]}
      scale={0.9 + setupProgress * 0.1}
    >
      {/* =========================================================================
          CATEGORY A: ACID-BASE NEUTRALISATION
          Apparatus: Conical flask on bench, burette setup on stand, indicator, thermometer
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.NEUTRALISATION && (
        <group>
          {/* Primary Conical Flask */}
          <GlassBeaker position={[0, 0, 0]} scale={1.15} />

          {/* Liquid in flask (Titration solution changing pink -> colourless) */}
          <LiquidVolume
            position={[0, 0, 0]}
            shape="cylinder"
            fill={0.38 + reactionProgress * 0.15}
            color={currentColor}
            swirl={reactionProgress > 0.4}
          />

          {/* Burette with clamp stand on right */}
          <BuretteSetup
            position={[-0.42, 0, 0]}
            scale={1.05}
            titrationProgress={reactionProgress}
            liquidColor="#e2f2f7"
          />

          {/* Laboratory Thermometer in flask */}
          <LabThermometer
            position={[0.26, 0.12, 0.08]}
            scale={0.9}
            temperature={currentTemperature}
          />

          {/* Indicator dropper bottle on the left */}
          <ReagentContainer
            position={[-1.15, 0, 0.35]}
            scale={0.85}
            chemical={{
              name: config.indicator.name,
              formula: "Indicator",
              color: config.indicator.startColor,
            }}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY B: COMBUSTION
          Apparatus: Porcelain crucible on safety mat, ignition mechanism, controlled flame
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.COMBUSTION && magnesiumRibbonReaction && (
        <MagnesiumRibbonBurner actionProgress={actionProgress} reactionProgress={reactionProgress} active={actionStarted} />
      )}

      {config.category === EXPERIMENT_CATEGORIES.COMBUSTION && !magnesiumRibbonReaction && (
        <group>
          <CrucibleSetup
            position={[0, 0, 0]}
            scale={1.3}
            fuelColor={config.startColor}
            burntProgress={reactionProgress}
          />

          {/* Controlled Combustion Flame during Action and Reaction Stages */}
          {reactionProgress > 0.12 && reactionProgress < 0.95 && (
            <FlameEffect
              position={[0, 0.38, 0]}
              type={reaction?.id === "magnesium_oxygen" ? "magnesium" : "combustion"}
              scale={1.25}
            />
          )}

          {/* Rising oxidation gas / smoke plume */}
          {reactionProgress > 0.15 && (
            <GasEvolutionEffect
              position={[0, 0.45, 0]}
              color={config.gas.color}
              active={reactionProgress < 0.98}
              density="rapid"
              plumeHeight={1.8}
            />
          )}

          {/* Thermal radiant glow on table */}
          <ThermalGlowEffect
            position={[0, 0, 0]}
            intensity={reactionProgress > 0.12 ? (reactionProgress < 0.9 ? 1.0 : 0.3) : 0}
            color="#ff9238"
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY C: PRECIPITATION (Double Displacement)
          Apparatus: Beakers with clear solutions, sudden turbidity, crystal aggregation, settling
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.PRECIPITATION && (
        <group>
          {/* Reaction Beaker */}
          <GlassBeaker position={[0, 0, 0]} scale={1.25} />

          {/* Liquid solution */}
          <LiquidVolume
            position={[0, 0, 0]}
            shape="cylinder"
            fill={0.35 + actionProgress * 0.25}
            color={currentColor}
            swirl={reactionProgress > 0.4}
          />

          {/* Precipitate turbidity, crystals, and sedimentation */}
          <PrecipitateEffect
            position={[0, 0, 0]}
            color={config.precipitate.color}
            progress={reactionProgress}
            settles={config.precipitate.settles}
          />

          {/* Reagent Vial pouring during experimental action */}
          <ReagentContainer
            position={[
              THREE.MathUtils.lerp(1.2, 0.45, actionProgress),
              THREE.MathUtils.lerp(0, 0.85, actionProgress),
              0.1,
            ]}
            tilt={-0.85 * actionProgress}
            scale={0.9}
            chemical={reaction?.samples?.[1] || reaction?.samples?.[0]}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY D: THERMAL DECOMPOSITION
          Apparatus: Retort stand, clamped boiling tube at 45°, Bunsen burner underneath
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.THERMAL_DECOMPOSITION && (
        <group>
          {/* Clamped Boiling Tube on Retort Stand */}
          <BoilingTubeSetup
            position={[0, 0, 0]}
            scale={1.15}
            solidColor={config.startColor}
            solidTransformedColor={config.finalColor}
            heatProgress={reactionProgress}
            withDeliveryTube={true}
          />

          {/* Bunsen Burner heating tube base */}
          <BunsenBurner
            position={[-0.24, 0, 0]}
            scale={0.88}
            active={actionStarted}
            flameType={actionStarted ? "roaring" : "safety"}
          />

          {/* Tube bottom thermal glow */}
          <ThermalGlowEffect
            position={[-0.24, 0.72, 0]}
            intensity={actionStarted ? reactionProgress : 0}
            color="#ff7a29"
          />

          {/* Evolved Decomposition Gas escaping delivery tube mouth */}
          {reactionProgress > 0.25 && (
            <GasEvolutionEffect
              position={[0.55, 1.15, 0]}
              color={config.gas.color}
              active={true}
              density={config.gas.density}
              plumeHeight={1.4}
            />
          )}

          {/* Thermometer showing high temperature */}
          <LabThermometer
            position={[0.85, 0, 0]}
            scale={0.9}
            temperature={currentTemperature}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY E: ELECTROLYSIS
          Apparatus: Voltameter cell, DC power supply, cathode (-), anode (+), collection tubes
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.ELECTROLYSIS && (
        <group>
          <ElectrolysisApparatus
            position={[0, 0, 0]}
            scale={1.2}
            powerOn={actionStarted}
            gasProgress={reactionProgress}
            reactionId={reaction?.id}
            language={language}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY F: GAS EVOLUTION (Acid + Carbonate or Metal)
          Apparatus: Conical flask, delivery tube, receiver test tube with lime water
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.GAS_EVOLUTION && (
        reaction?.id === "sodium_water" ? <group>
          {/* Sodium–water demonstration: a shallow trough, moving sodium piece,
              hydrogen bubbles, and a small surface flame as heat is released. */}
          <mesh castShadow receiveShadow position={[0, 0.08, 0]}>
            <boxGeometry args={[2.05, 0.16, 1.28]} />
            <meshStandardMaterial color="#526a72" roughness={0.42} metalness={0.28} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <boxGeometry args={[1.82, 0.42, 1.08]} />
            <meshStandardMaterial color="#87cde0" transparent opacity={0.38} roughness={0.16} depthWrite={false} />
          </mesh>
          {[-0.54, 0.54].flatMap((x) => [-0.43, 0.43].map((z) => <mesh key={`trough-rim-${x}-${z}`} position={[x, 0.34, z]}>
            <boxGeometry args={[0.08, 0.48, 0.08]} />
            <meshStandardMaterial color="#c5d4d8" transparent opacity={0.48} roughness={0.18} depthWrite={false} />
          </mesh>))}
          <mesh position={[THREE.MathUtils.lerp(-0.55, 0.35, reactionProgress), 0.57, 0]} rotation={[0, 0, reactionProgress * 0.4]}>
            <dodecahedronGeometry args={[0.13, 0]} />
            <meshStandardMaterial color="#c5c9c6" metalness={0.78} roughness={0.22} />
          </mesh>
          <GasEvolutionEffect position={[0.28, 0.5, 0]} color={config.gas.color} active={actionStarted} density="rapid" plumeHeight={1.35} />
          {actionStarted && <FlameEffect position={[0.25, 0.48, 0]} type="combustion" scale={0.72} />}
          <ThermalGlowEffect position={[0, 0, 0]} intensity={actionStarted ? reactionProgress : 0} color="#ff9238" />
          <pointLight position={[0.25, 0.85, 0]} color="#ff9a45" intensity={actionStarted ? reactionProgress * 1.8 : 0} distance={2.4} />
        </group> : <group>
          {/* Reaction Flask */}
          <GlassFlask position={[0, 0, 0]} scale={1.15} />

          {/* Liquid & vigorous effervescence bubbles */}
          <LiquidVolume
            position={[0, 0, 0]}
            shape="conical"
            fill={0.42}
            color={currentColor}
            swirl={reactionProgress > 0.35}
          />

          <GasEvolutionEffect
            position={[0, 0, 0]}
            color={config.gas.color}
            active={actionStarted}
            density={config.gas.density}
            withVapourPlume={false}
          />

          {/* Delivery tube leading to receiver test tube */}
          <GasDeliverySystem
            position={[0, 0, 0]}
            scale={1.15}
            receiverMilkyProgress={reactionProgress}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY G: DISPLACEMENT
          Apparatus: Beaker with solution, immersed metal strip/nail, reddish copper deposit
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.DISPLACEMENT && (
        <group>
          <GlassBeaker position={[0, 0, 0]} scale={1.25} />

          {/* Liquid solution changing color (e.g. blue CuSO4 -> light green FeSO4) */}
          <LiquidVolume
            position={[0, 0, 0]}
            shape="cylinder"
            fill={0.52}
            color={currentColor}
          />

          {/* Immersed Metal Strip (Iron nail or Zinc strip) with deposition crust */}
          <MetalSpecimen
            position={[0, actionProgress * -0.45, 0]}
            scale={1.1}
            specimenType={config.displacement.specimen}
            depositionProgress={reactionProgress}
            depositColor={config.displacement.depositColor}
          />

          {/* Fresh unreacted metal sample on the bench for comparison */}
          <MetalSpecimen
            position={[-0.85, 0, 0.4]}
            scale={0.8}
            specimenType={config.displacement.specimen}
            depositionProgress={0}
          />
        </group>
      )}

      {/* =========================================================================
          CATEGORY H & GENERAL: COMBINATION, REVERSIBLE, OR GENERAL
          Apparatus: General glassware with heating option, liquid volume, gas/precipitate effects
         ========================================================================= */}
      {(config.category === EXPERIMENT_CATEGORIES.COMBINATION_SYNTHESIS ||
        config.category === EXPERIMENT_CATEGORIES.REVERSIBLE_EQUILIBRIUM ||
        config.category === EXPERIMENT_CATEGORIES.GENERAL_REACTION) && (
        <group>
          <GlassFlask position={[0, 0, 0]} scale={1.2} />

          <LiquidVolume
            position={[0, 0, 0]}
            shape="conical"
            fill={0.45}
            color={currentColor}
            swirl={reactionProgress > 0.35}
          />

          {config.gas.hasGas && (
            <GasEvolutionEffect
              position={[0, 0, 0]}
              color={config.gas.color}
              active={actionStarted}
              density={config.gas.density}
            />
          )}

          {config.precipitate.hasPrecipitate && (
            <PrecipitateEffect
              position={[0, 0, 0]}
              color={config.precipitate.color}
              progress={reactionProgress}
              settles={config.precipitate.settles}
            />
          )}

          {config.requiresHeating && (
            <BunsenBurner
              position={[0.95, 0, 0]}
              scale={0.85}
              active={actionStarted}
              flameType={actionStarted ? "roaring" : "safety"}
            />
          )}
        </group>
      )}

      {/* Starting Reagent Samples displayed neatly on the left side of the workstation */}
      {(reaction?.samples || []).slice(0, 3).map((sample, idx) => (
        <ReagentContainer
          key={sample.id || idx}
          position={[
            THREE.MathUtils.lerp(-2.2 - idx * 0.42, -1.25 - idx * 0.42, sampleInspectionProgress),
            THREE.MathUtils.lerp(0.28, 0, sampleInspectionProgress),
            0.25,
          ]}
          scale={0.78}
          chemical={sample}
        />
      ))}

      {/* Final interpretation: the product bottles rise into a clear side-by-side display. */}
      {(config.products || []).slice(0, 3).map((product, idx) => (
        <ReagentContainer
          key={`product-${product.id || idx}`}
          position={[
            THREE.MathUtils.lerp(2.45 + idx * 0.42, 1.15 + idx * 0.48, productShowcaseProgress),
            THREE.MathUtils.lerp(0.32, 0, productShowcaseProgress),
            0.3,
          ]}
          scale={0.78}
          chemical={product}
        />
      ))}
    </group>
  );
}

export default memo(ExperimentRenderer);
