// Shared input state — readable by PlayerController, HandTool, etc.
export const keys = {};
export let sprinting = false;

export function setSprinting(v) {
  sprinting = v;
}
