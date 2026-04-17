import React from 'react'
import useGameStore from '../../store/gameStore'

export default function TurnIndicator() {
  const gameState = useGameStore(s => s.gameState)
  const round = useGameStore(s => s.round)
  const phase = useGameStore(s => s.phase)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)

  const currentChar = getCurrentTurnCharacter()

  if (gameState !== 'playing') return null

  return (
    <div className="turn-indicator">
      <div>
        <div className="turn-label">Turno de</div>
        <div className="turn-name">{currentChar?.name || '...'}</div>
      </div>
      <div className="turn-round">Rodada {round}</div>
      <div className="phase-indicator">
        <div className={`phase-dot ${phase === 'move' ? 'active' : phase === 'action' || phase === 'end' ? 'completed' : ''}`}
          title="Mover" />
        <div className={`phase-dot ${phase === 'action' ? 'active' : phase === 'end' ? 'completed' : ''}`}
          title="Agir" />
        <div className={`phase-dot ${phase === 'end' ? 'active' : ''}`}
          title="Fim" />
      </div>
    </div>
  )
}
