import React from 'react'
import useGameStore from '../../store/gameStore'

export default function GameOver() {
  const gameState = useGameStore(s => s.gameState)
  const winner = useGameStore(s => s.winner)
  const restartBattle = useGameStore(s => s.restartBattle)
  const resetGame = useGameStore(s => s.resetGame)

  if (gameState !== 'gameover') return null

  return (
    <div className="game-over-overlay">
      <div className="game-over-title">
        {winner ? 'Vitória!' : 'Empate!'}
      </div>
      <div className="game-over-subtitle">
        {winner
          ? `🏆 Time ${winner} venceu a batalha!`
          : 'A batalha terminou em empate.'
        }
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <button className="btn btn-gold" onClick={restartBattle} style={{ fontSize: 16, padding: '14px 28px' }}>
          🔄 Jogar Novamente
        </button>
        <button className="btn btn-secondary" onClick={resetGame} style={{ fontSize: 16, padding: '14px 28px' }}>
          🗑️ Novo Jogo
        </button>
      </div>
    </div>
  )
}
