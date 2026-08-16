/**
 * Shared registry of character group refs, keyed by character ID.
 * Used to read the current 3D world position/facing of each character from outside their component.
 */
const characterPositions = new Map() // id -> THREE.Vector3 (live reference)
const characterFacings   = new Map() // id -> { x, z } normalized direction

export function registerCharacterPosition(id, vec3) {
  characterPositions.set(id, vec3)
}

export function unregisterCharacterPosition(id) {
  characterPositions.delete(id)
  characterFacings.delete(id)
}

export function getCharacterPosition(id) {
  return characterPositions.get(id) || null
}

export function updateCharacterFacing(id, dx, dz) {
  characterFacings.set(id, { x: dx, z: dz })
}

export function getCharacterFacing(id) {
  return characterFacings.get(id) || { x: 0, z: 1 }
}
