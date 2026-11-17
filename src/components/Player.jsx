import { PointerLockControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { QUIZ_SEATS } from "../data/quizRoomLayout";
import { LAB_STATIONS } from "../data/labStations";
import soundManager from "../utils/soundManager";
import { getLabInteractionTargets } from "../utils/labInteractionTargets";

const PLAYER_RADIUS = 0.36;
const MOVEMENT_KEYS = new Set(["KeyW", "KeyA", "KeyS", "KeyD"]);
// Encompasses Main Lab, Chemical Storage (West), and Quiz Classroom (East)
// The walkable footprint reaches the rear main-lab wall at z=-14.9. The old
// -30.8 limit let the player walk through that wall into the unbuilt exterior.
const ROOM_LIMITS = { minX: -39.4, maxX: 34.6, minZ: -14.3, maxZ: 14.3 };
const WORLD_UP = new THREE.Vector3(0, 1, 0);

function hitsObstacle(x, z, obstacles) {
  return obstacles.some(({ x: centerX, z: centerZ, halfX, halfZ }) => {
    const closestX = THREE.MathUtils.clamp(x, centerX - halfX, centerX + halfX);
    const closestZ = THREE.MathUtils.clamp(z, centerZ - halfZ, centerZ + halfZ);
    return (x - closestX) ** 2 + (z - closestZ) ** 2 < PLAYER_RADIUS ** 2;
  });
}

export default function Player({
  onNearTable,
  onNearQuizSeat,
  onSitQuizSeat,
  onInteractQuiz,
  onInteractChemicalDoor,
  onInteractQuizDoor,
  onInteractPoster,
  onInteractionPrompt,
  chemicalDoorOpen = false,
  quizDoorOpen = false,
  onOpenChemicalSearch,
  onOpenReactionTable,
  movementLocked = false,
  onLeaveChemicalBench,
  mouseSensitivity = 1,
  standRequest = 0,
  seatedInQuizRoom = false,
  obstacles = [],
  enabled = true,
  reactionRunId = null,
  reactionStationPosition = null,
  reactionFocus = false,
  mobileMoveRef,
}) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  const jumpRequested = useRef(false);
  const jumpHeight = useRef(0);
  const verticalVelocity = useRef(0);
  const controls = useRef();
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const movement = useRef(new THREE.Vector3());
  const movementState = useRef({ walking: false, sprinting: false });
  const tableState = useRef(null);
  const quizSeatState = useRef(false);
  const quizSeatNear = useRef(false);
  const chemicalDoorNear = useRef(false);
  const quizDoorNear = useRef(false);
  const nearChemicalBench = useRef(false);
  const seated = useRef(false);
  const currentSeat = useRef(null);
  const framedReaction = useRef(null);
  const previousReactionCamera = useRef(null);
  const interactionTarget = useRef(null);
  const interactionSignature = useRef("");
  const interactionRaycaster = useRef(new THREE.Raycaster());
  const interactionScreenCenter = useRef(new THREE.Vector2(0, 0));
  const lastInteractionCheck = useRef(0);
  const movementEnabled = useRef(enabled);
  const controlsSuspended = useRef(seatedInQuizRoom);
  const lastValidPosition = useRef(new THREE.Vector3(0, 1.7, 7));
  const touchLook = useRef(null);
  const lastTouchAt = useRef(0);
  const mobileDirection = useRef({ x: 0, y: 0, sprinting: false });

  movementEnabled.current = enabled;
  controlsSuspended.current = seatedInQuizRoom;

  const standFromQuizSeat = useCallback(() => {
    if (!seated.current) return;
    const seat = currentSeat.current;
    seated.current = false;
    currentSeat.current = null;
    jumpRequested.current = false;
    jumpHeight.current = 0;
    verticalVelocity.current = 0;
    keys.current = {};
    camera.position.set(24.1, 1.7, seat?.z ?? 0);
    camera.rotation.set(0, Math.PI / 2, 0, "YXZ");
    camera.updateMatrixWorld();
    onSitQuizSeat?.(false);
  }, [camera, onSitQuizSeat]);

  const interact = useCallback((clickedTarget = null) => {
    const target = clickedTarget ?? interactionTarget.current;
    if (!seated.current && target?.type === "gate") {
      if (target.id === "chemical") {
        onInteractChemicalDoor?.();
        soundManager.playGateSound(!chemicalDoorOpen);
      } else {
        onInteractQuizDoor?.();
        soundManager.playGateSound(!quizDoorOpen);
      }
    } else if (!seated.current && (target?.type === "poster" || target?.type === "doubt-corner")) {
      onInteractPoster?.(target);
      controls.current?.unlock?.();
    } else if (!seated.current && target?.type === "reaction-table") {
      onOpenReactionTable?.();
    } else if (seated.current) {
      onInteractQuiz?.();
    } else if (Math.hypot(camera.position.x + 30.05, camera.position.z) < 3.4) {
      onOpenChemicalSearch?.();
    } else if (chemicalDoorNear.current) {
      onInteractChemicalDoor?.();
      soundManager.playGateSound(!chemicalDoorOpen);
    } else if (quizDoorNear.current) {
      onInteractQuizDoor?.();
      soundManager.playGateSound(!quizDoorOpen);
    } else if (quizSeatNear.current) {
      const seat = QUIZ_SEATS.reduce((closest, candidate) => {
        if (!closest) return candidate;
        return Math.hypot(camera.position.x - candidate.x, camera.position.z - candidate.z) <
          Math.hypot(camera.position.x - closest.x, camera.position.z - closest.z)
          ? candidate
          : closest;
      }, null);

      if (seat) {
        currentSeat.current = seat;
        seated.current = true;
        jumpRequested.current = false;
        jumpHeight.current = 0;
        verticalVelocity.current = 0;
        camera.position.set(seat.x, 1.18, seat.z);
        camera.rotation.set(0, -Math.PI / 2, 0, "YXZ");
        camera.updateMatrixWorld();
        controls.current?.unlock?.();
        onSitQuizSeat?.(true);
      }
    }
  }, [camera, onInteractChemicalDoor, onInteractQuizDoor, onInteractPoster, onInteractQuiz,
    onOpenChemicalSearch, onOpenReactionTable, onSitQuizSeat, chemicalDoorOpen, quizDoorOpen]);

  useEffect(() => {
    if (standRequest > 0) standFromQuizSeat();
  }, [standRequest, standFromQuizSeat]);

  useEffect(() => {
    const canvas = gl.domElement;
    const targetAtPointer = (event) => {
      const bounds = canvas.getBoundingClientRect();
      interactionScreenCenter.current.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
      );
      interactionRaycaster.current.setFromCamera(interactionScreenCenter.current, camera);
      const targets = getLabInteractionTargets();
      const hit = targets.length
        ? interactionRaycaster.current.intersectObjects(targets.map(({ object }) => object), false)
          .find((candidate) => candidate.distance <= 5.2)
        : null;
      interactionScreenCenter.current.set(0, 0);
      return hit ? targets.find(({ object }) => object === hit.object)?.payload ?? null : null;
    };
    const toggleMouseLook = (event) => {
      if (event.pointerType === "touch") return;
      if (event.button !== 2) return;
      event.preventDefault();
      if (!movementEnabled.current || controlsSuspended.current || seated.current) return;
      const clickedTarget = targetAtPointer(event);
      if (clickedTarget?.type === "reaction-table") {
        interact(clickedTarget);
        return;
      }
      if (document.pointerLockElement === canvas) controls.current?.unlock?.();
      else controls.current?.lock?.();
    };
    const interactOnLeftClick = (event) => {
      if (event.pointerType === "touch" || performance.now() - lastTouchAt.current < 650) return;
      if (event.button !== 0 || !movementEnabled.current || controlsSuspended.current || seated.current) {
        if (event.button === 0 && seated.current) interact();
        return;
      }
      interact(targetAtPointer(event));
    };
    const suppressContextMenu = (event) => event.preventDefault();
    canvas.addEventListener("pointerdown", toggleMouseLook);
    canvas.addEventListener("click", interactOnLeftClick);
    canvas.addEventListener("contextmenu", suppressContextMenu);
    const touchStart = (event) => {
      if (event.pointerType !== "touch" || !movementEnabled.current || controlsSuspended.current) return;
      lastTouchAt.current = performance.now();
      touchLook.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    };
    const touchMove = (event) => {
      if (!touchLook.current || touchLook.current.id !== event.pointerId) return;
      const dx = event.clientX - touchLook.current.x;
      const dy = event.clientY - touchLook.current.y;
      touchLook.current.x = event.clientX;
      touchLook.current.y = event.clientY;
      camera.rotation.y -= dx * 0.004 * mouseSensitivity;
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - dy * 0.004 * mouseSensitivity, -1.35, 1.35);
      camera.updateMatrixWorld();
      event.preventDefault();
    };
    const touchEnd = (event) => { if (touchLook.current?.id === event.pointerId) touchLook.current = null; };
    const mobileAction = (event) => {
      if (event.type === "chemistry-lab-hand-interact") interact();
      else if (!seated.current) jumpRequested.current = true;
    };
    const onMobileMove = (event) => {
      if (event.detail) {
        mobileDirection.current.x = Number(event.detail.x) || 0;
        mobileDirection.current.y = Number(event.detail.y) || 0;
        if (typeof event.detail.sprinting === "boolean") {
          mobileDirection.current.sprinting = event.detail.sprinting;
        }
      }
    };
    canvas.addEventListener("pointerdown", touchStart);
    canvas.addEventListener("pointermove", touchMove);
    canvas.addEventListener("pointerup", touchEnd);
    canvas.addEventListener("pointercancel", touchEnd);
    window.addEventListener("chemistry-lab-hand-interact", mobileAction);
    window.addEventListener("chemistry-lab-jump", mobileAction);
    window.addEventListener("chemistry-lab-move", onMobileMove);
    return () => {
      canvas.removeEventListener("pointerdown", toggleMouseLook);
      canvas.removeEventListener("click", interactOnLeftClick);
      canvas.removeEventListener("contextmenu", suppressContextMenu);
      canvas.removeEventListener("pointerdown", touchStart);
      canvas.removeEventListener("pointermove", touchMove);
      canvas.removeEventListener("pointerup", touchEnd);
      canvas.removeEventListener("pointercancel", touchEnd);
      window.removeEventListener("chemistry-lab-hand-interact", mobileAction);
      window.removeEventListener("chemistry-lab-jump", mobileAction);
      window.removeEventListener("chemistry-lab-move", onMobileMove);
    };
  }, [camera, gl, interact, mouseSensitivity]);

  useEffect(() => {
    if (enabled && !seatedInQuizRoom) return;
    keys.current = {};
    jumpRequested.current = false;
  }, [enabled, seatedInQuizRoom]);

  useEffect(() => {
    camera.rotation.order = "YXZ";

    if (!enabled) {
      movementState.current.walking = false;
      soundManager.updateMovementSound(false);
      keys.current = {};
      quizSeatNear.current = false;
      return undefined;
    }

    const down = (event) => {
      const target = event.target;
      const isTyping =
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (isTyping) return;

      const movementCode = MOVEMENT_KEYS.has(event.code) ? event.code : null;
      if (movementLocked && (movementCode || event.code === "Space" || event.code === "ShiftLeft" || event.code === "ShiftRight")) {
        event.preventDefault();
        return;
      }
      if (movementCode || ["KeyR", "KeyE", "KeyC", "KeyF", "Space", "ShiftLeft", "ShiftRight"].includes(event.code)) {
        event.preventDefault();
      }
      if (event.repeat) return;

      if (event.code === "Space" && !seated.current) jumpRequested.current = true;

      if (event.code === "KeyC") {
        controls.current?.unlock?.();
        return;
      }
      if (event.code === "KeyE") interact();

      if (event.code === "KeyF" && seated.current) {
        standFromQuizSeat();
      }

      keys.current[movementCode ?? event.code] = true;
    };

    const up = (event) => {
      if (MOVEMENT_KEYS.has(event.code)) keys.current[event.code] = false;
    };

    const clear = () => {
      keys.current = {};
    };

    window.addEventListener("keydown", down, true);
    window.addEventListener("keyup", up, true);
    window.addEventListener("blur", clear);
    document.addEventListener("pointerlockchange", clear);
    document.addEventListener("visibilitychange", clear);

    return () => {
      window.removeEventListener("keydown", down, true);
      window.removeEventListener("keyup", up, true);
      window.removeEventListener("blur", clear);
      document.removeEventListener("pointerlockchange", clear);
      document.removeEventListener("visibilitychange", clear);
    };
  }, [enabled, interact, movementLocked, standFromQuizSeat]);

  useEffect(() => {
    if (movementLocked) {
      keys.current = {};
      movementState.current.walking = false;
      movementState.current.sprinting = false;
      soundManager.updateMovementSound(false);
    }
  }, [movementLocked]);

  // Move in close for the magnesium burn so the strip, flame, and powder tray
  // are readable. Restore the player's exact camera view when the result closes.
  useEffect(() => {
    if (reactionRunId == null) {
      if (framedReaction.current !== null && previousReactionCamera.current) {
        camera.position.copy(previousReactionCamera.current.position);
        camera.quaternion.copy(previousReactionCamera.current.quaternion);
        camera.fov = previousReactionCamera.current.fov;
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        previousReactionCamera.current = null;
        framedReaction.current = null;
      }
      return;
    }
    if (framedReaction.current === reactionRunId) return;
    const [stationX, stationZ] = reactionStationPosition ?? [0, 0];
    previousReactionCamera.current = {
      position: camera.position.clone(),
      quaternion: camera.quaternion.clone(),
      fov: camera.fov,
    };
    if (reactionFocus) {
      camera.position.set(stationX + 0.18, 2.18, stationZ + 1.95);
      camera.lookAt(stationX + 0.08, 1.42, stationZ);
      camera.fov = 40;
      camera.updateProjectionMatrix();
    } else {
      camera.position.set(stationX, 2.05, stationZ + 4.8);
      camera.lookAt(stationX, 2.0, stationZ);
    }
    camera.updateMatrixWorld();
    framedReaction.current = reactionRunId;
  }, [camera, reactionRunId, reactionStationPosition, reactionFocus]);

  useFrame((_, delta) => {
    if (!enabled) {
      keys.current = {};
      if (tableState.current !== null) {
        tableState.current = null;
        onNearTable?.(null);
      }
      if (quizSeatState.current) {
        quizSeatState.current = false;
        onNearQuizSeat?.(false);
      }
      quizSeatNear.current = false;
      interactionTarget.current = null;
      interactionSignature.current = "";
      onInteractionPrompt?.(null);
      return;
    }

    // KeyR: Re-center view pitch to horizontal level (look straight ahead), NEVER teleport across the room!
    if (keys.current.KeyR) {
      camera.rotation.x = 0;
      camera.rotation.z = 0;
      keys.current.KeyR = false;
    }

    // Safety fallback: if numbers are corrupted (NaN), gently restore to last valid position
    const cameraIsInvalid = ![
      camera.position.x,
      camera.position.y,
      camera.position.z,
      camera.rotation.x,
      camera.rotation.y,
      camera.rotation.z,
    ].every(Number.isFinite);

    if (cameraIsInvalid) {
      camera.position.copy(lastValidPosition.current);
      camera.rotation.set(0, 0, 0, "YXZ");
      jumpRequested.current = false;
      jumpHeight.current = 0;
      verticalVelocity.current = 0;
    } else {
      lastValidPosition.current.copy(camera.position);
    }

    // Never teleport player back to spawn on boundaries — simply clamp to room boundaries!
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, ROOM_LIMITS.minX, ROOM_LIMITS.maxX);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, ROOM_LIMITS.minZ, ROOM_LIMITS.maxZ);

    // Ensure movement values are always strict, finite numbers (never NaN)
    const keyW = Boolean(keys.current.KeyW);
    const keyS = Boolean(keys.current.KeyS);
    const keyA = Boolean(keys.current.KeyA);
    const keyD = Boolean(keys.current.KeyD);
    const keyboardForward = (keyW ? 1 : 0) - (keyS ? 1 : 0);
    const keyboardSide = (keyD ? 1 : 0) - (keyA ? 1 : 0);
    // The shared ref is read directly each frame; the event listener remains a
    // fallback for older control overlays and carries no timing dependency.
    const rawMobX = Number(mobileMoveRef?.current?.x ?? mobileDirection.current.x ?? 0);
    const rawMobY = Number(mobileMoveRef?.current?.y ?? mobileDirection.current.y ?? 0);
    const mobX = Number.isFinite(rawMobX) ? rawMobX : 0;
    const mobY = Number.isFinite(rawMobY) ? rawMobY : 0;
    const rawForward = keyboardForward + mobY;
    const rawSide = keyboardSide + mobX;
    const forwardAmount = Number.isFinite(rawForward) ? THREE.MathUtils.clamp(rawForward, -1, 1) : 0;
    const sideAmount = Number.isFinite(rawSide) ? THREE.MathUtils.clamp(rawSide, -1, 1) : 0;
    let isWalking = false;
    const isSprinting = Boolean(
      keys.current.ShiftLeft ||
      keys.current.ShiftRight ||
      mobileMoveRef?.current?.sprinting || mobileDirection.current.sprinting
    );
    movement.current.set(0, 0, 0);

    // Capped frame delta prevents huge jumps when returning from background/tab
    const frameDelta = Math.min(delta, 0.033);

    if (!movementLocked && !seated.current && !cameraIsInvalid && (forwardAmount || sideAmount)) {
      camera.getWorldDirection(forward.current);
      forward.current.y = 0;
      if (forward.current.lengthSq() < 1e-6) forward.current.set(0, 0, -1);
      forward.current.normalize();
      right.current.crossVectors(forward.current, WORLD_UP).normalize();

      movement.current
        .addScaledVector(forward.current, forwardAmount)
        .addScaledVector(right.current, sideAmount);

      if (movement.current.lengthSq() > 0) {
        const speed = isSprinting ? 7.5 : 4.2;
        movement.current.normalize().multiplyScalar(speed * frameDelta);
      }

      // 2 substeps collision check to prevent tunneling through thin walls when moving fast
      const substeps = 2;
      const stepX = movement.current.x / substeps;
      const stepZ = movement.current.z / substeps;
      const startX = camera.position.x;
      const startZ = camera.position.z;

      for (let s = 0; s < substeps; s++) {
        const nextX = THREE.MathUtils.clamp(
          camera.position.x + stepX,
          ROOM_LIMITS.minX,
          ROOM_LIMITS.maxX
        );
        if (!hitsObstacle(nextX, camera.position.z, obstacles)) {
          camera.position.x = nextX;
        }
        const nextZ = THREE.MathUtils.clamp(
          camera.position.z + stepZ,
          ROOM_LIMITS.minZ,
          ROOM_LIMITS.maxZ
        );
        if (!hitsObstacle(camera.position.x, nextZ, obstacles)) {
          camera.position.z = nextZ;
        }
      }

      if (jumpHeight.current === 0 && (camera.position.x !== startX || camera.position.z !== startZ)) {
        isWalking = true;
      }
    }

    movementState.current.walking = isWalking && !seated.current && jumpHeight.current === 0;
    movementState.current.sprinting = isSprinting;
    soundManager.updateMovementSound(movementState.current.walking, isSprinting);

    // Vertical jump handling
    if (!seated.current && !movementLocked) {
      if (jumpRequested.current && jumpHeight.current === 0) verticalVelocity.current = 5.8;
      jumpRequested.current = false;
      if (jumpHeight.current > 0 || verticalVelocity.current > 0) {
        verticalVelocity.current -= 18 * frameDelta;
        jumpHeight.current += verticalVelocity.current * frameDelta;
        if (jumpHeight.current <= 0) {
          jumpHeight.current = 0;
          verticalVelocity.current = 0;
        }
      }
    } else {
      jumpRequested.current = false;
      jumpHeight.current = 0;
      verticalVelocity.current = 0;
    }

    camera.position.y = seated.current ? 1.18 : 1.7 + jumpHeight.current;

    // A short center-screen ray gives the crosshair real hover targets without
    // attaching expensive pointer handlers to every 3D object in the room.
    const now = performance.now();
    if (now - lastInteractionCheck.current > 90) {
      lastInteractionCheck.current = now;
      interactionRaycaster.current.setFromCamera(interactionScreenCenter.current, camera);
      const targets = getLabInteractionTargets();
      const hit = targets.length
        ? interactionRaycaster.current.intersectObjects(targets.map(({ object }) => object), false)
          .find((candidate) => candidate.distance <= 5.2)
        : null;
      const targetData = hit ? targets.find(({ object }) => object === hit.object)?.payload ?? null : null;
      interactionTarget.current = targetData;
      const isOpen = targetData?.type === "gate" && (targetData.id === "chemical" ? chemicalDoorOpen : quizDoorOpen);
      const prompt = targetData?.type === "gate"
        ? `E · ${isOpen ? "Close" : "Open"} ${targetData.label}`
        : targetData?.type === "poster" ? `E · Read ${targetData.title}`
          : targetData?.type === "doubt-corner" ? "E · Open Doubt Corner"
            : targetData?.type === "reaction-table" ? "E · Open reaction bench" : "";
      const signature = targetData ? `${targetData.type}:${targetData.id ?? targetData.title}:${isOpen}` : "";
      if (signature !== interactionSignature.current) {
        interactionSignature.current = signature;
        onInteractionPrompt?.(targetData ? { ...targetData, prompt } : null);
      }
    }

    // Each experiment bench has its own focused reaction catalogue.
    const stationDistances = LAB_STATIONS.map((station) => ({
      id: station.id,
      distance: Math.hypot(
        Math.max(Math.abs(camera.position.x - station.x) - 7.4, 0),
        Math.max(Math.abs(camera.position.z - station.z) - 1.8, 0),
      ),
    })).sort((a, b) => a.distance - b.distance);
    const currentDistance = stationDistances.find((station) => station.id === tableState.current)?.distance ?? Infinity;
    const nearestStation = stationDistances[0]?.distance < 3.2 ? stationDistances[0] : null;
    const activeStation = tableState.current && currentDistance < 3.8
      && (!nearestStation || currentDistance <= nearestStation.distance + 0.45)
      ? tableState.current
      : nearestStation?.id ?? null;
    if (activeStation !== tableState.current) {
      tableState.current = activeStation;
      onNearTable?.(activeStation);
    }

    const nearQuizSeat = QUIZ_SEATS.some(
      (seat) => Math.hypot(camera.position.x - seat.x, camera.position.z - seat.z) < 1.65
    );
    quizSeatNear.current = nearQuizSeat;
    if (nearQuizSeat !== quizSeatState.current) {
      quizSeatState.current = nearQuizSeat;
      onNearQuizSeat?.(nearQuizSeat);
    }
    chemicalDoorNear.current = Math.hypot(camera.position.x + 19.9, camera.position.z) < 3.15;
    quizDoorNear.current = Math.hypot(camera.position.x - 19.9, camera.position.z) < 3.15;
    const isNearChemicalBench = Math.hypot(camera.position.x + 30.05, camera.position.z) < 3.4;
    if (nearChemicalBench.current && !isNearChemicalBench) onLeaveChemicalBench?.();
    nearChemicalBench.current = isNearChemicalBench;

  });

  return (
    <>
      <PointerLockControls
        ref={controls}
        // drei defaults to locking on any document click; opt out so only the
        // right-click handler above can toggle mouse capture.
        selector="#disable-default-pointer-lock-click"
        enabled={enabled && !seatedInQuizRoom}
        minPolarAngle={0.35}
        maxPolarAngle={2.75}
        pointerSpeed={mouseSensitivity}
      />
    </>
  );
}
