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
  
  const selectedSpell = useGameStore(s => s.selectedSpell)
  const setSelectedSpell = useGameStore(s => s.setSelectedSpell)

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
    if (gameState !== 'playing' || !currentChar) return
    const onKeyDown = (e) => {
      if (e.key === 'q' || e.key === 'Q') rotateCharacter(-1)
      if (e.key === 'e' || e.key === 'E') rotateCharacter(1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [gameState, rotateCharacter, currentChar])

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
    setSelectedSpell(null)
  }

  const handleAttack = () => {
    if (currentChar.hasActed) return
    if (actionMode === 'attack') {
      setActionMode(null)
      setHighlightedCells([])
      return
    }
    const allRange = getAllCellsInRange(
      currentChar.gridX, currentChar.gridZ,
      currentChar.range, characters, currentChar.team
    )
    setActionMode('attack')
    setHighlightedCells(allRange)
    setSelectedSpell(null)
  }

  const handleSpellClick = (spell) => {
    if (currentChar.hasActed) return
    if (actionMode === 'spell' && selectedSpell?.index === spell.index) {
      setActionMode(null)
      setSelectedSpell(null)
      setHighlightedCells([])
      return
    }

    let cells = []
    if (spell.rangeCells === 0) {
      cells = [{ x: currentChar.gridX, z: currentChar.gridZ, charId: currentChar.id, isRange: true }]
    } else {
      cells = getAllCellsInRange(
        currentChar.gridX, currentChar.gridZ,
        spell.rangeCells, characters, currentChar.team
      )
    }

    setActionMode('spell')
    setSelectedSpell(spell)
    setHighlightedCells(cells)
  }

  return (
    <>
      {/* Floating Spells Bar */}
      {currentChar.spells && currentChar.spells.length > 0 && !currentChar.hasActed && (
        <div className="spell-bar" style={{
          position: 'absolute',
          bottom: 96,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 6,
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-active)',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(124, 58, 237, 0.2)',
          padding: '6px 12px',
          borderRadius: 12,
          zIndex: 30,
          animation: 'slideUp 0.2s ease'
        }}>
          <div style={{
            fontSize: 10,
            textTransform: 'uppercase',
            color: 'var(--accent-purple)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            marginRight: 6,
            borderRight: '1px solid var(--border-subtle)',
            paddingRight: 10
          }}>
            🔮 Magias
          </div>
          {currentChar.spells.map((spell, i) => (
            <button
              key={i}
              className={`action-btn ${actionMode === 'spell' && selectedSpell?.index === spell.index ? 'active' : ''}`}
              onClick={() => handleSpellClick(spell)}
              style={{
                flexDirection: 'row',
                padding: '6px 12px',
                minWidth: 'auto',
                gap: 6,
                borderRadius: 8,
                fontSize: 12
              }}
              title={spell.desc}
            >
              <span>🪄</span>
              <span>{spell.name}</span>
            </button>
          ))}
        </div>
      )}

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
    </>
  )
}
