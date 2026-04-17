import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import useGameStore from '../../store/gameStore'
import { GRID_SIZE, gridToWorld } from '../../utils/gridUtils'

function GridCell({ x, z, isHighlighted, isOccupied, isBlocked, isSelected, isPlacementMode, highlightColor, onClick }) {
  const ref = useRef()
  const pos = useMemo(() => gridToWorld(x, z), [x, z])

  const color = useMemo(() => {
    if (isPlacementMode && !isOccupied && !isBlocked) return '#7c3aed'
    if (isSelected) return '#7c3aed'
    if (isHighlighted) return highlightColor || '#22c55e'
    if (isBlocked) return '#1e1e2e'
    if (isOccupied) return '#2a2a4a'
    // Checkerboard pattern
    return (x + z) % 2 === 0 ? '#1a1a2e' : '#16162a'
  }, [isHighlighted, isOccupied, isBlocked, isSelected, isPlacementMode, highlightColor, x, z])

  const opacity = useMemo(() => {
    if (isPlacementMode && !isOccupied && !isBlocked) return 0.5
    if (isHighlighted) return 0.6
    if (isSelected) return 0.7
    return 0.4
  }, [isHighlighted, isSelected, isPlacementMode, isOccupied, isBlocked])

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
        const clickable = isHighlighted || (isPlacementMode && !isOccupied && !isBlocked)
        document.body.style.cursor = clickable ? 'pointer' : 'default'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        if (ref.current) {
          ref.current.material.opacity = opacity
        }
        document.body.style.cursor = 'default'
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
  const highlightedCells = useGameStore(s => s.highlightedCells)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const actionMode = useGameStore(s => s.actionMode)
  const blockedCells = useGameStore(s => s.blockedCells)
  const moveCharacter = useGameStore(s => s.moveCharacter)
  const attackCharacter = useGameStore(s => s.attackCharacter)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)
  const gameState = useGameStore(s => s.gameState)
  const placementMode = useGameStore(s => s.placementMode)
  const placementId = useGameStore(s => s.placementId)
  const placeObject = useGameStore(s => s.placeObject)

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
        set.add(`${c.gridX},${c.gridZ}`)
      }
    })
    return set
  }, [characters])

  const selectedChar = characters.find(c => c.id === selectedCharacterId)

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

    // === GAME MODE: handle move/attack ===
    if (gameState !== 'playing') return

    const currentChar = getCurrentTurnCharacter()
    if (!currentChar) return

    const highlighted = highlightSet.get(key)

    if (actionMode === 'move' && highlighted && !highlighted.charId) {
      moveCharacter(currentChar.id, x, z)
    } else if (actionMode === 'attack' && highlighted && highlighted.charId) {
      attackCharacter(currentChar.id, highlighted.charId)
    }
  }

  const cells = useMemo(() => {
    const result = []
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let z = 0; z < GRID_SIZE; z++) {
        const key = `${x},${z}`
        const isHighlighted = highlightSet.has(key)
        const highlightData = highlightSet.get(key)
        const isOccupied = occupiedSet.has(key)
        const isBlocked = blockedCells.has(key)
        const isSelected = selectedChar && selectedChar.gridX === x && selectedChar.gridZ === z

        let highlightColor = '#22c55e'
        if (highlightData?.charId) {
          highlightColor = '#ef4444' // Attack target
        }

        result.push(
          <GridCell
            key={key}
            x={x}
            z={z}
            isHighlighted={isHighlighted}
            isOccupied={isOccupied}
            isBlocked={isBlocked}
            isSelected={isSelected}
            isPlacementMode={isPlacementMode}
            highlightColor={highlightColor}
            onClick={handleCellClick}
          />
        )
      }
    }
    return result
  }, [highlightSet, occupiedSet, blockedCells, selectedChar, gameState, actionMode, isPlacementMode])

  const borderSize = GRID_SIZE

  return (
    <group>
      {/* Base plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[borderSize + 0.5, borderSize + 0.5]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>

      {/* Grid cells */}
      {cells}

      {/* Grid lines (subtle) */}
      <gridHelper
        args={[GRID_SIZE, GRID_SIZE, '#2a2a3e', '#1e1e30']}
        position={[0, 0.02, 0]}
      />
    </group>
  )
}
