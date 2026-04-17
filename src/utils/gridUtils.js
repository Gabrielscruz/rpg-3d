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

/**
 * Check if a cell is occupied by a character
 */
export function isCellOccupied(x, z, characters) {
  return characters.some(c => c.alive && c.gridX === x && c.gridZ === z)
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
      const occupied = characters.some(c => c.alive && c.id !== excludeId && c.gridX === x && c.gridZ === z)
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

        const occupiedByAlive = characters.some(c => c.alive && c.id !== excludeId && c.gridX === nx && c.gridZ === nz)
        visited.add(key)

        // Can pass through but not stop on occupied cells
        queue.push({ x: nx, z: nz, dist: dist + 1 })
        // Only exclude occupied cells from reachable, not from traversal
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
    const dist = getDistance(startX, startZ, char.gridX, char.gridZ)
    if (dist <= range) {
      targets.push({ x: char.gridX, z: char.gridZ, charId: char.id })
    }
  }
  return targets
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
