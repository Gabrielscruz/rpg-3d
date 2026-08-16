import React, { useMemo, useEffect, useCallback } from 'react'
import useGameStore from '../../store/gameStore'
import { getReachableCells, getAllCellsInRange } from '../../utils/gridUtils'

export default function ActionBar() {
  const gameState    = useGameStore(s => s.gameState)
  const phase        = useGameStore(s => s.phase)
  const actionMode   = useGameStore(s => s.actionMode)
  const setActionMode = useGameStore(s => s.setActionMode)
  const setHighlightedCells = useGameStore(s => s.setHighlightedCells)
  const endTurn      = useGameStore(s => s.endTurn)
  const updateCharacter = useGameStore(s => s.updateCharacter)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)
  const characters   = useGameStore(s => s.characters)
  const blockedCells = useGameStore(s => s.blockedCells)

  const currentChar = getCurrentTurnCharacter()

  // Rotaciona personagem 45° para esquerda ou direita
  const rotateCharacter = useCallback((direction) => {
    if (!currentChar) return
    const step = 45
    const newRotation = ((currentChar.rotationY || 0) + direction * step + 360) % 360
    updateCharacter(currentChar.id, { rotationY: newRotation })
  }, [currentChar, updateCharacter])

  // Atalhos de teclado Q (esquerda) e E (direita)
  useEffect(() => {
    if (gameState !== 'playing') return
    const onKeyDown = (e) => {
      if (e.key === 'q' || e.key === 'Q') rotateCharacter(-1)
      if (e.key === 'e' || e.key === 'E') rotateCharacter(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, rotateCharacter])

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
    // Inclui toda a área de alcance (vermelhos fracos + inimigos vermelhos fortes)
    const allRange = getAllCellsInRange(
      currentChar.gridX, currentChar.gridZ,
      currentChar.range, characters, currentChar.team
    )
    setActionMode('attack')
    setHighlightedCells(allRange)
  }

  return (
    <div className="action-bar">
      {/* Rotação do personagem */}
      <button
        className="action-btn"
        onClick={() => rotateCharacter(-1)}
        title="Girar esquerda (Q)"
        style={{ minWidth: 48 }}
      >
        <span className="icon">↺</span>
        <span style={{ fontSize: 10, display: 'block', lineHeight: 1 }}>Q</span>
      </button>

      <button
        className="action-btn"
        onClick={() => rotateCharacter(1)}
        title="Girar direita (E)"
        style={{ minWidth: 48 }}
      >
        <span className="icon">↻</span>
        <span style={{ fontSize: 10, display: 'block', lineHeight: 1 }}>E</span>
      </button>

      <div style={{ width: 1, height: 40, background: 'var(--border-subtle)', margin: '0 4px' }} />

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

      <div style={{ width: 1, height: 40, background: 'var(--border-subtle)', margin: '0 4px' }} />

      {/* Dica de câmera */}
      <div style={{
        fontSize: 10,
        color: 'var(--text-secondary)',
        textAlign: 'center',
        lineHeight: 1.4,
        padding: '0 8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 2,
      }}>
        <span>🖱️ Btn. dir.</span>
        <span>= girar visão</span>
      </div>

      <div style={{ width: 1, height: 40, background: 'var(--border-subtle)', margin: '0 4px' }} />

      <button
        className="action-btn end-turn"
        onClick={endTurn}
      >
        <span className="icon">⏭️</span>
        Passar
      </button>
    </div>
  )
}
