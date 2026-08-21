/**
 * Grid utility functions for the RPG board
 */

const GRID_SIZE = 40

/**
 * Check if a cell is within grid bounds
 */
export function isValidCell(x, z) {
  return x >= 0 && x < GRID_SIZE && z >= 0 && z < GRID_SIZE
}

/**
 * Get Manhattan distance between two cells
 */
export function getDistance(x1, z1, x2, z2) {
  return Math.abs(x1 - x2) + Math.abs(z1 - z2)
}

export function isCellOccupied(x, z, characters, excludeId) {
  return characters.some(c => {
    if (!c.alive || c.id === excludeId || c.gridX < 0 || c.gridZ < 0) return false
    const sizeX = Math.max(1, Math.round(c.scaleX || c.scale?.[0] || 1))
    const sizeZ = Math.max(1, Math.round(c.scaleZ || c.scale?.[2] || 1))
    return x >= c.gridX && x < c.gridX + sizeX && z >= c.gridZ && z < c.gridZ + sizeZ
  })
}

/**
 * Check if a cell is blocked (by scenario objects)
 */
export function isCellBlocked(x, z, blockedCells) {
  return blockedCells.has(`${x},${z}`)
}

/**
 * BFS pathfinding to get reachable cells within a move range
 */
export function getReachableCells(startX, startZ, moveRange, characters, blockedCells, excludeId) {
  const reachable = []
  const visited = new Set()
  const queue = [{ x: startX, z: startZ, dist: 0 }]
  visited.add(`${startX},${startZ}`)

  const dirs = [
    { dx: 1, dz: 0 },
    { dx: -1, dz: 0 },
    { dx: 0, dz: 1 },
    { dx: 0, dz: -1 },
  ]

  while (queue.length > 0) {
    const { x, z, dist } = queue.shift()

    if (dist > 0) {
      const occupied = isCellOccupied(x, z, characters, excludeId)
      if (!occupied) {
        reachable.push({ x, z, dist })
      }
    }

    if (dist < moveRange) {
      for (const { dx, dz } of dirs) {
        const nx = x + dx
        const nz = z + dz
        const key = `${nx},${nz}`

        if (!isValidCell(nx, nz)) continue
        if (visited.has(key)) continue
        if (isCellBlocked(nx, nz, blockedCells)) continue

        visited.add(key)
        queue.push({ x: nx, z: nz, dist: dist + 1 })
      }
    }
  }

  return reachable
}

/**
 * Get cells within attack range
 */
export function getAttackableCells(startX, startZ, range, characters, team) {
  const targets = []
  for (const char of characters) {
    if (!char.alive) continue
    if (char.team === team) continue

    const sizeX = Math.max(1, Math.round(char.scaleX || char.scale?.[0] || 1))
    const sizeZ = Math.max(1, Math.round(char.scaleZ || char.scale?.[2] || 1))
    let minDist = Infinity

    for (let dx = 0; dx < sizeX; dx++) {
      for (let dz = 0; dz < sizeZ; dz++) {
        const d = getDistance(startX, startZ, char.gridX + dx, char.gridZ + dz)
        if (d < minDist) minDist = d
      }
    }

    if (minDist <= range) {
      // Map all cells they cover as targets
      for (let dx = 0; dx < sizeX; dx++) {
        for (let dz = 0; dz < sizeZ; dz++) {
          targets.push({ x: char.gridX + dx, z: char.gridZ + dz, charId: char.id })
        }
      }
    }
  }
  return targets
}

/**
 * Get ALL cells within attack range (empty + enemy cells),
 * used to display the red area-of-effect overlay.
 */
export function getAllCellsInRange(startX, startZ, range, characters, team) {
  const enemySet = new Map()
  for (const char of characters) {
    if (!char.alive) continue
    if (char.team === team) continue

    const sizeX = Math.max(1, Math.round(char.scaleX || char.scale?.[0] || 1))
    const sizeZ = Math.max(1, Math.round(char.scaleZ || char.scale?.[2] || 1))
    let minDist = Infinity

    for (let dx = 0; dx < sizeX; dx++) {
      for (let dz = 0; dz < sizeZ; dz++) {
        const d = getDistance(startX, startZ, char.gridX + dx, char.gridZ + dz)
        if (d < minDist) minDist = d
      }
    }

    if (minDist <= range) {
      for (let dx = 0; dx < sizeX; dx++) {
        for (let dz = 0; dz < sizeZ; dz++) {
          enemySet.set(`${char.gridX + dx},${char.gridZ + dz}`, char.id)
        }
      }
    }
  }

  const result = []
  for (let x = Math.max(0, startX - range); x <= Math.min(GRID_SIZE - 1, startX + range); x++) {
    for (let z = Math.max(0, startZ - range); z <= Math.min(GRID_SIZE - 1, startZ + range); z++) {
      if (x === startX && z === startZ) continue // skip self
      const dist = getDistance(startX, startZ, x, z)
      if (dist > range) continue
      const key = `${x},${z}`
      const charId = enemySet.get(key)
      result.push({ x, z, charId: charId || null, isRange: true })
    }
  }
  return result
}

/**
 * Convert grid coordinates to world position
 */
export function gridToWorld(gridX, gridZ) {
  const offset = GRID_SIZE / 2
  return {
    x: (gridX - offset) * 1 + 0.5,
    z: (gridZ - offset) * 1 + 0.5,
  }
}

/**
 * Convert world position to grid coordinates
 */
export function worldToGrid(worldX, worldZ) {
  const offset = GRID_SIZE / 2
  return {
    x: Math.floor(worldX + offset),
    z: Math.floor(worldZ + offset),
  }
}

export { GRID_SIZE }
