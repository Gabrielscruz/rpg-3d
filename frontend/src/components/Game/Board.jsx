import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import useGameStore from '../../store/gameStore'
import { GRID_SIZE, gridToWorld } from '../../utils/gridUtils'

export const BOARD_THEMES = {
  dungeon: {
    name: '🏚️ Calabouço',
    base: '#161626', cellEven: '#22223b', cellOdd: '#1a1a2e',
    blocked: '#2a2a3e', occupied: '#3a3a5a',
    gridLineAlpha: '#3a3a50', gridLineBeta: '#2a2a40',
  },
  grass: {
    name: '🌿 Planície',
    base: '#1a2e1a', cellEven: '#2d4a2d', cellOdd: '#234023',
    blocked: '#3b3b2a', occupied: '#3a5a3a',
    gridLineAlpha: '#4a6a40', gridLineBeta: '#365030',
  },
  stone: {
    name: '🪨 Pedra',
    base: '#2a2a2a', cellEven: '#3d3d3d', cellOdd: '#333333',
    blocked: '#4a4040', occupied: '#505050',
    gridLineAlpha: '#555555', gridLineBeta: '#444444',
  },
  sand: {
    name: '🏜️ Deserto',
    base: '#3a2e1a', cellEven: '#5a4a30', cellOdd: '#4d3f28',
    blocked: '#4a3a20', occupied: '#6a5a3a',
    gridLineAlpha: '#6a5a40', gridLineBeta: '#554830',
  },
  ice: {
    name: '❄️ Gelo',
    base: '#1a2a3a', cellEven: '#2a4a6a', cellOdd: '#234060',
    blocked: '#3a4a5a', occupied: '#4a6a8a',
    gridLineAlpha: '#5a7a9a', gridLineBeta: '#4a6a80',
  },
  lava: {
    name: '🌋 Vulcão',
    base: '#2a1010', cellEven: '#3a1818', cellOdd: '#301515',
    blocked: '#4a2020', occupied: '#5a2a2a',
    gridLineAlpha: '#6a3030', gridLineBeta: '#502020',
  },
}

// Compatibilidade: exporta o tema padrão como BOARD_COLORS
export const BOARD_COLORS = BOARD_THEMES.dungeon

function GridCell({ x, z, isHighlighted, isRangeOnly, isOccupied, isBlocked, isSelected, isPlacementMode, isSpellMode, highlightColor, themeColors, onClick, onHover }) {
  const ref = useRef()
  const pos = useMemo(() => gridToWorld(x, z), [x, z])

  const color = useMemo(() => {
    if (isPlacementMode && !isOccupied && !isBlocked) return '#7c3aed'
    if (isSelected) return '#7c3aed'
    if (isHighlighted && !isRangeOnly) return highlightColor || '#22c55e'   // target / move
    if (isSpellMode && isHighlighted) return highlightColor || '#a855f7'     // target de magia
    if (isRangeOnly) return '#ef4444'                                        // area vazia
    if (isBlocked) return themeColors.blocked
    if (isOccupied) return themeColors.occupied
    return (x + z) % 2 === 0 ? themeColors.cellEven : themeColors.cellOdd
  }, [isHighlighted, isRangeOnly, isOccupied, isBlocked, isSelected, isPlacementMode, isSpellMode, highlightColor, x, z, themeColors])

  const opacity = useMemo(() => {
    if (isPlacementMode && !isOccupied && !isBlocked) return 0.5
    if (isHighlighted && !isRangeOnly) return 0.7
    if (isSpellMode && isHighlighted) return 0.7
    if (isRangeOnly) return 0.18
    if (isSelected) return 0.7
    return 0.4
  }, [isHighlighted, isRangeOnly, isSelected, isPlacementMode, isSpellMode, isOccupied, isBlocked])

  const isClickable = (isHighlighted && (!isRangeOnly || isSpellMode)) || (isPlacementMode && !isOccupied && !isBlocked)

  return (
    <mesh
      ref={ref}
      position={[pos.x, 0.01, pos.z]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(x, z)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        if (ref.current) {
          ref.current.material.opacity = Math.min(opacity + 0.2, 0.9)
        }
        document.body.style.cursor = isClickable ? 'pointer' : 'default'
        onHover?.(x, z)
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (ref.current) {
          ref.current.material.opacity = opacity
        }
        document.body.style.cursor = 'default'
        if (isSpellMode) {
          onHover?.(-1, -1) // Limpa hover
        }
      }}
    >
      <planeGeometry args={[0.95, 0.95]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export default function Board() {
  const characters = useGameStore(s => s.characters)
  const scenarios = useGameStore(s => s.scenarios)
  const highlightedCells = useGameStore(s => s.highlightedCells)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const actionMode = useGameStore(s => s.actionMode)
  const blockedCells = useGameStore(s => s.blockedCells)
  const moveCharacter = useGameStore(s => s.moveCharacter)
  const attackCharacter = useGameStore(s => s.attackCharacter)
  const castSpell = useGameStore(s => s.castSpell)
  const selectedSpell = useGameStore(s => s.selectedSpell)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)
  const gameState = useGameStore(s => s.gameState)
  const placementMode = useGameStore(s => s.placementMode)
  const placementId = useGameStore(s => s.placementId)
  const placeObject = useGameStore(s => s.placeObject)
  const hoverPlacement = useGameStore(s => s.hoverPlacement)
  const cancelPlacement = useGameStore(s => s.cancelPlacement)
  const updateCharacter = useGameStore(s => s.updateCharacter)
  const updateScenario = useGameStore(s => s.updateScenario)
  const boardTheme = useGameStore(s => s.boardTheme)

  const [hoveredCell, setHoveredCell] = React.useState(null)

  const themeColors = BOARD_THEMES[boardTheme] || BOARD_THEMES.dungeon
  const isPlacementMode = !!placementMode

  const highlightSet = useMemo(() => {
    const set = new Map()
    highlightedCells.forEach(c => {
      set.set(`${c.x},${c.z}`, c)
    })
    return set
  }, [highlightedCells])

  // Only count placed characters for "occupied" checks
  const occupiedSet = useMemo(() => {
    const set = new Set()
    characters.forEach(c => {
      if (c.alive && c.gridX >= 0 && c.gridZ >= 0) {
        const sizeX = Math.max(1, Math.round(c.scale?.[0] || 1))
        const sizeZ = Math.max(1, Math.round(c.scale?.[2] || 1))
        for (let dx = 0; dx < sizeX; dx++) {
          for (let dz = 0; dz < sizeZ; dz++) {
            set.add(`${c.gridX + dx},${c.gridZ + dz}`)
          }
        }
      }
    })
    return set
  }, [characters])

  const selectedChar = characters.find(c => c.id === selectedCharacterId)

  // Listen for keyboard controls ('R' to rotate, 'Esc' to cancel)
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      let newRotation = null;
      const key = e.key.toLowerCase();
      
      if (key === 'w') newRotation = 180;
      else if (key === 's') newRotation = 0;
      else if (key === 'a') newRotation = 270;
      else if (key === 'd') newRotation = 90;

      if (isPlacementMode) {
        if (key === 'r' || newRotation !== null) {
          if (placementMode === 'character') {
            const char = characters.find(c => c.id === placementId)
            if (char) {
              const currentRot = char.rotationY || 0;
              const finalRot = newRotation !== null ? newRotation : (currentRot + 45) % 360;
              updateCharacter(placementId, { rotationY: finalRot })
            }
          } else if (placementMode === 'scenario') {
            const scn = scenarios.find(s => s.id === placementId)
            if (scn) {
              const currentRot = scn.rotationY || 0;
              const finalRot = newRotation !== null ? newRotation : (currentRot + 45) % 360;
              updateScenario(placementId, { rotationY: finalRot })
            }
          }
        } else if (e.key === 'Escape') {
          cancelPlacement()
        }
      } else {
        // Play mode keyboard shortcuts
        const currentChar = getCurrentTurnCharacter()
        if (currentChar && gameState === 'playing') {
          if (newRotation !== null) {
            updateCharacter(currentChar.id, { rotationY: newRotation })
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlacementMode, placementMode, placementId, characters, scenarios, updateCharacter, updateScenario, cancelPlacement, gameState, getCurrentTurnCharacter])

  const handleCellClick = (x, z) => {
    const key = `${x},${z}`

    // === PLACEMENT MODE: place object on clicked cell ===
    if (isPlacementMode) {
      const isOccupied = occupiedSet.has(key)
      const isBlocked = blockedCells.has(key)
      if (!isOccupied && !isBlocked) {
        placeObject(x, z)
      }
      return
    }

    // === GAME MODE: handle move/attack/spell ===
    if (gameState !== 'playing') return

    const currentChar = getCurrentTurnCharacter()
    if (!currentChar) return

    const highlighted = highlightSet.get(key)

    if (actionMode === 'move' && highlighted && !highlighted.charId && !highlighted.isRange) {
      moveCharacter(currentChar.id, x, z)
    } else if (actionMode === 'attack' && highlighted && highlighted.charId) {
      attackCharacter(currentChar.id, highlighted.charId)
    } else if (actionMode === 'spell' && highlighted) {
      castSpell(currentChar.id, x, z, selectedSpell)
    }
  }

  const handleCellHover = (x, z) => {
    if (x === -1 && z === -1) {
      setHoveredCell(null)
      return
    }

    if (isPlacementMode) {
      const key = `${x},${z}`
      const isOccupied = occupiedSet.has(key)
      const isBlocked = blockedCells.has(key)
      if (!isOccupied && !isBlocked) {
        hoverPlacement(x, z)
      }
    } else if (actionMode === 'spell') {
      setHoveredCell({ x, z })
    } else {
      if (hoveredCell) setHoveredCell(null)
    }
  }

  const cells = useMemo(() => {
    const result = []
    const isSpellMode = actionMode === 'spell'

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const key = `${x},${z}`
        const highlightData  = highlightSet.get(key)
        const isHighlighted  = !!highlightData
        const isOccupied     = occupiedSet.has(key)
        const isBlocked      = blockedCells.has(key)
        const isSelected     = selectedChar && selectedChar.gridX === x && selectedChar.gridZ === z

        const isRangeOnly    = isHighlighted && !!highlightData?.isRange && !highlightData?.charId
        const isEnemy        = isHighlighted && !!highlightData?.charId

        // Cálculo de Área de Efeito (AoE)
        let isInsideAoE = false
        if (isSpellMode && selectedSpell && selectedSpell.aoeRadius > 0 && hoveredCell) {
          // Checa se a célula central hovered está dentro do alcance da magia
          const isCenterInRange = highlightSet.has(`${hoveredCell.x},${hoveredCell.z}`)
          if (isCenterInRange) {
            // Distância de Manhattan até o centro
            const dist = Math.abs(x - hoveredCell.x) + Math.abs(z - hoveredCell.z)
            if (dist <= selectedSpell.aoeRadius) {
              isInsideAoE = true
            }
          }
        }

        let highlightColor = '#22c55e'
        if (isEnemy) highlightColor = '#ef4444'
        if (isInsideAoE) {
          highlightColor = '#a855f7' // Roxo mágico para AoE
        }

        result.push(
          <GridCell
            key={key}
            x={x}
            z={z}
            isHighlighted={isHighlighted || isInsideAoE}
            isRangeOnly={isRangeOnly && !isInsideAoE}
            isOccupied={isOccupied}
            isBlocked={isBlocked}
            isSelected={isSelected}
            isPlacementMode={isPlacementMode}
            isSpellMode={isSpellMode}
            highlightColor={highlightColor}
            themeColors={themeColors}
            onClick={handleCellClick}
            onHover={handleCellHover}
          />
        )
      }
    }
    return result
  }, [highlightSet, occupiedSet, blockedCells, selectedChar, gameState, actionMode, isPlacementMode, themeColors, hoveredCell, selectedSpell])

  const borderSize = GRID_SIZE

  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[borderSize + 0.5, borderSize + 0.5]} />
        <meshStandardMaterial color={themeColors.base} />
      </mesh>

      {/* Grid cells */}
      {cells}

      {/* Grid lines (subtle) */}
      <gridHelper
        args={[GRID_SIZE, GRID_SIZE, themeColors.gridLineAlpha, themeColors.gridLineBeta]}
        position={[0, 0.02, 0]}
      />
    </group>
  )
}
