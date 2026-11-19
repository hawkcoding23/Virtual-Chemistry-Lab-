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
import MetalDisplacementSetup from "./apparatus/MetalDisplacementSetup";
import LabThermometer from "./apparatus/LabThermometer";
import CrucibleSetup from "./apparatus/CrucibleSetup";
import MagnesiumRibbonBurner from "./apparatus/MagnesiumRibbonBurner";
import ReagentContainer from "./apparatus/ReagentContainer";
import SodiumWaterTweezers from "./apparatus/SodiumWaterTweezers";
import ExothermicBalloonBottle from "./apparatus/ExothermicBalloonBottle";
import ChromatographySetup from "./apparatus/ChromatographySetup";
import EsterificationSetup from "./apparatus/EsterificationSetup";
import GasCollectionTrough from "./apparatus/GasCollectionTrough";
import DropperPrecipitation from "./apparatus/DropperPrecipitation";
import RedoxDecolourisation from "./apparatus/RedoxDecolourisation";
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
  graphicsQuality = "medium",
}) {
  const config = useMemo(
    () => buildExperimentConfig(reaction, allChemicals),
    [reaction, allChemicals]
  );

  const setupProgress = THREE.MathUtils.smoothstep(reactionProgress, 0, 0.12);
  const actionProgress = THREE.MathUtils.smoothstep(reactionProgress, 0.12, 0.58);
  const actionStarted = reactionProgress > 0.12;
  const magnesiumRibbonReaction = reaction?.id === "magnesium_oxygen"
    || /2?\s*mg\s*\+\s*o[₂2]\s*→\s*2?\s*mgo/i.test(reaction?.equation || "");
  const copperCarbonateDecomposition = reaction?.id === "copper_carbonate_thermal_decomposition";
  const magnesiumAcidReaction = /magnesium.*(hydrochloric|hcl)|(hydrochloric|hcl).*magnesium/i.test(`${reaction?.id || ""} ${reaction?.equation || ""} ${JSON.stringify(reaction?.reactants || reaction?.samples || [])}`)
    || /mg\s*\+\s*2?\s*hcl/i.test(String(reaction?.equation || "").replace(/[₀-₉]/g, (digit) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(digit))));

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
      // The universal bench top is at y=1.22. Keep apparatus bases above it;
      // the previous y=.91 origin buried the first stage inside the worktop.
      position={[position[0], 1.24 + setupProgress * 0.025, position[1]]}
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
          Apparatus: Beakers with clear solutions, dropper, sudden turbidity, settling
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.PRECIPITATION && (
        <DropperPrecipitation
          position={[0, 0, 0]}
          scale={1.25}
          reactionProgress={reactionProgress}
          actionProgress={actionProgress}
          precipitateColor={config.precipitate.color || "#f8fafc"}
          reagentColor={reaction?.samples?.[1]?.color || "#9bd6e3"}
        />
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
            solidColor={
              reaction?.id === "copper_carbonate_thermal_decomposition"
                ? "#2dd4bf"
                : config.startColor
            }
            solidTransformedColor={
              reaction?.id === "copper_carbonate_thermal_decomposition"
                ? "#0f172a"
                : config.finalColor
            }
            heatProgress={reactionProgress}
            withDeliveryTube={true}
            withLimewaterReceiver={copperCarbonateDecomposition}
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
          {!copperCarbonateDecomposition && reactionProgress > 0.25 && (
            <GasEvolutionEffect
              position={[0.55, 1.15, 0]}
              color={config.gas.color}
              active={true}
              density={config.gas.density}
              plumeHeight={1.4}
            />
          )}

          {/* Thermometer showing high temperature */}
          {!copperCarbonateDecomposition && <LabThermometer
            position={[0.85, 0, 0]}
            scale={0.9}
            temperature={currentTemperature}
          />}
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
          SPECIAL APPARATUS OVERRIDES (Image Showcase Experiments)
         ========================================================================= */}
      {/* 1. Photosynthesis Paper Chromatography Setup */}
      {(reaction?.id === "photosynthesis_chromatography" ||
        reaction?.id?.includes("chromatography")) && (
        <ChromatographySetup
          position={[0, 0, 0]}
          scale={1.25}
          reactionProgress={reactionProgress}
          language={language}
        />
      )}

      {/* 2. Bottle Mixing with Inflating Balloon (Exothermic Reaction) */}
      {(reaction?.id === "bottle_mixing_exothermic" ||
        reaction?.setup === "balloon") && (
        <ExothermicBalloonBottle
          position={[0, 0, 0]}
          scale={1.2}
          reactionProgress={reactionProgress}
          language={language}
        />
      )}

      {/* 3. Esterification with Angled Liebig Condenser */}
      {(reaction?.id === "ethanol_ethanoic_acid_esterification" ||
        reaction?.id?.includes("esterification")) && (
        <EsterificationSetup
          position={[0, 0, 0]}
          scale={1.2}
          reactionProgress={reactionProgress}
          language={language}
        />
      )}

      {/* 4. Redox Decolourisation of KMnO4 (Purple -> Colorless) */}
      {(reaction?.id === "redox_kmno4_oxalic_acid" ||
        (reaction?.id?.includes("kmno4") && !reaction?.id?.includes("electrolysis"))) && (
        <RedoxDecolourisation
          position={[0, 0, 0]}
          scale={1.25}
          reactionProgress={reactionProgress}
          language={language}
        />
      )}

      {/* =========================================================================
          CATEGORY F: GAS EVOLUTION (Acid + Carbonate or Metal)
          Apparatus: Conical flask, delivery tube, receiver test tube with lime water
         ========================================================================= */}
      {config.category === EXPERIMENT_CATEGORIES.GAS_EVOLUTION &&
        reaction?.id !== "photosynthesis_chromatography" &&
        reaction?.id !== "bottle_mixing_exothermic" &&
        reaction?.id !== "ethanol_ethanoic_acid_esterification" &&
        !reaction?.id?.includes("kmno4") && (
        reaction?.id === "sodium_water" ? (
          <SodiumWaterTweezers
            position={[0, 0, 0]}
            scale={1.25}
            reactionProgress={reactionProgress}
            actionProgress={actionProgress}
          />
        ) : (reaction?.id === "oxygen_preparation" ||
             reaction?.id === "hydrogen_preparation" ||
             reaction?.setup === "water_trough") ? (
          <GasCollectionTrough
            position={[0, 0, 0]}
            scale={1.15}
            reactionProgress={reactionProgress}
            gasType={reaction?.id === "oxygen_preparation" ? "O₂" : "H₂"}
            flaskReactants={reaction?.equation?.split("→")[0]?.trim() || "Zn + H₂SO₄"}
            language={language}
          />
        ) : magnesiumAcidReaction ? <group>
          {/* Magnesium + dilute hydrochloric acid: flask and metal strip, no flame. */}
          <GlassFlask position={[0, 0, 0]} scale={1.35} />
          <LiquidVolume position={[0, 0, 0]} shape="conical" fill={0.4} color="#b7e7f1" swirl={reactionProgress > 0.35} />
          <GasEvolutionEffect position={[0, 0, 0]} color="#e5fbff" active={actionStarted} density="rapid" withVapourPlume={false} />
          <mesh castShadow position={[THREE.MathUtils.lerp(-0.82, 0.02, actionProgress), THREE.MathUtils.lerp(0.82, 0.72, actionProgress), 0.15]} rotation={[0, 0, -0.18]} visible={reactionProgress < 0.96}>
            <boxGeometry args={[0.055, 0.72, 0.025]} />
            <meshStandardMaterial color="#c6d2d7" metalness={0.88} roughness={0.22} />
          </mesh>
          <mesh position={[0, 0.66, 0]}>
            <torusGeometry args={[0.205, 0.018, 8, 24]} />
            <meshStandardMaterial color="#b7dce5" metalness={0.3} roughness={0.18} transparent opacity={0.7} />
          </mesh>
          {reactionProgress > 0.72 && <ReagentContainer position={[0.92, 0, 0.28]} scale={0.76} chemical={{ name: "Hydrogen", formula: "H₂", color: "#d7f4fa" }} />}
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
        <MetalDisplacementSetup
          reactionProgress={reactionProgress}
          solutionColor={currentColor}
          specimenType={config.displacement.specimen}
          depositColor={config.displacement.depositColor}
        />
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

    </group>
  );
}

export default memo(ExperimentRenderer);
