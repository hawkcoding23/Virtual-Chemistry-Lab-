const targets = new Map();
let nextTargetId = 1;

export function registerLabInteractionTarget(object, payload) {
  if (!object) return () => {};
  const targetId = nextTargetId++;
  targets.set(targetId, { object, payload });
  return () => targets.delete(targetId);
}

export function getLabInteractionTargets() {
  return [...targets.values()].filter(({ object }) => object.parent && object.visible);
}
