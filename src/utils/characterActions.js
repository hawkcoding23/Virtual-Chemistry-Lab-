export function animateCharacter(action, detail = {}) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chemistry-character-action", { detail: { action, ...detail } }));
  }
}
