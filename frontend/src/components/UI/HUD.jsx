import React from 'react'
import useGameStore from '../../store/gameStore'
import TurnIndicator from './TurnIndicator'

export default function HUD() {
  const gameState = useGameStore(s => s.gameState)
  const characters = useGameStore(s => s.characters)
  const startGame = useGameStore(s => s.startGame)
  const toggleImportModal = useGameStore(s => s.toggleImportModal)
  const resetGame = useGameStore(s => s.resetGame)
  const restartBattle = useGameStore(s => s.restartBattle)

  const hasEnoughPlayers = characters.length >= 2
  const hasTeamA = characters.some(c => c.team === 'A')
  const hasTeamB = characters.some(c => c.team === 'B')
  const canStart = hasEnoughPlayers && hasTeamA && hasTeamB

  return (
    <div className="hud-top">
      <div className="game-title">⚔️ RPG Ação</div>

      {gameState === 'playing' && <TurnIndicator />}

      <div className="hud-buttons">
        {gameState === 'setup' && (
          <>
            <button
              className="btn btn-primary"
              onClick={() => toggleImportModal('character')}
            >
              👤 Personagem
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => toggleImportModal('scenario')}
            >
              🏰 Cenário
            </button>
            <button
              className="btn btn-gold"
              onClick={startGame}
              disabled={!canStart}
              title={!canStart ? 'Precisa de pelo menos 1 personagem em cada time' : 'Iniciar batalha!'}
            >
              ⚔️ Iniciar Batalha
            </button>
          </>
        )}

        {gameState === 'playing' && (
          <button className="btn btn-danger" onClick={restartBattle}>
            🔄 Reiniciar
          </button>
        )}

        {gameState === 'gameover' && (
          <>
            <button className="btn btn-gold" onClick={restartBattle}>
              🔄 Jogar Novamente
            </button>
            <button className="btn btn-danger" onClick={resetGame}>
              🗑️ Novo Jogo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
