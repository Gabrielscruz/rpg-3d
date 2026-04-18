import React, { useMemo } from 'react'
import useGameStore from '../../store/gameStore'
import { getReachableCells, getAttackableCells } from '../../utils/gridUtils'

export default function ActionBar() {
  const gameState = useGameStore(s => s.gameState)
  const phase = useGameStore(s => s.phase)
  const actionMode = useGameStore(s => s.actionMode)
  const setActionMode = useGameStore(s => s.setActionMode)
  const setHighlightedCells = useGameStore(s => s.setHighlightedCells)
  const endTurn = useGameStore(s => s.endTurn)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)
  const characters = useGameStore(s => s.characters)
  const blockedCells = useGameStore(s => s.blockedCells)

  const currentChar = getCurrentTurnCharacter()

  if (gameState !== 'playing' || !currentChar) return null

  const handleMove = () => {
    if (currentChar.hasMoved) return
    if (actionMode === 'move') {
      setActionMode(null)
      setHighlightedCells([])
      return
    }

    const reachable = getReachableCells(
      currentChar.gridX, currentChar.gridZ,
      currentChar.moveRange, characters, blockedCells, currentChar.id
    )
    setActionMode('move')
    setHighlightedCells(reachable)
  }

  const handleAttack = () => {
    if (currentChar.hasActed) return
    if (actionMode === 'attack') {
      setActionMode(null)
      setHighlightedCells([])
      return
    }

    const targets = getAttackableCells(
      currentChar.gridX, currentChar.gridZ,
      currentChar.range, characters, currentChar.team
    )
    setActionMode('attack')
    setHighlightedCells(targets)
  }

  const handleEndTurn = () => {
    endTurn()
  }

  return (
    <div className="action-bar">
      <button
        className={`action-btn ${actionMode === 'move' ? 'active' : ''}`}
        onClick={handleMove}
        disabled={currentChar.hasMoved}
      >
        <span className="icon">🏃</span>
        Mover
      </button>

      <button
        className={`action-btn ${actionMode === 'attack' ? 'active' : ''}`}
        onClick={handleAttack}
        disabled={currentChar.hasActed}
      >
        <span className="icon">⚔️</span>
        Atacar
      </button>

      <button
        className="action-btn"
        disabled={true}
        title="Em breve"
      >
        <span className="icon">🛡️</span>
        Defender
      </button>

      <div style={{
        width: 1, height: 40,
        background: 'var(--border-subtle)',
        margin: '0 4px'
      }} />

      <button
        className="action-btn end-turn"
        onClick={handleEndTurn}
      >
        <span className="icon">⏭️</span>
        Passar
      </button>
    </div>
  )
}
