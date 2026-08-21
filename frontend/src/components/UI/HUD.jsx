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
  const placementMode = useGameStore(s => s.placementMode)
  const cancelPlacement = useGameStore(s => s.cancelPlacement)

  const hasEnoughPlayers = characters.length >= 2
  const hasTeamA = characters.some(c => c.team === 'A')
  const hasTeamB = characters.some(c => c.team === 'B')
  const canStart = hasEnoughPlayers && hasTeamA && hasTeamB

  return (
    <div className="hud-top">
      {placementMode && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(20, 16, 35, 0.85)',
          border: '1.5px solid var(--accent-purple)',
          borderRadius: '10px',
          padding: '10px 24px',
          color: 'var(--text-primary)',
          zIndex: 1000,
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          backdropFilter: 'blur(8px)',
          fontFamily: 'var(--font-title)',
          fontSize: '13px',
          pointerEvents: 'auto',
          animation: 'pulseGlow 2s infinite alternate',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 16 }}>📍</span> <strong>Modo Posicionar</strong>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ color: 'var(--text-secondary)' }}>
            Mova o mouse para posicionar o item
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            Girar: <kbd style={{
              background: 'rgba(124, 58, 237, 0.3)',
              border: '1px solid rgba(124, 58, 237, 0.6)',
              padding: '2px 6px',
              borderRadius: 4,
              fontFamily: 'monospace',
              fontSize: 11,
              color: 'var(--accent-gold)'
            }}>R</kbd>
          </span>
          <span style={{ opacity: 0.3 }}>|</span>
          <button 
            onClick={cancelPlacement} 
            style={{ 
              background: 'rgba(239, 68, 68, 0.2)', 
              border: '1px solid rgba(239, 68, 68, 0.4)', 
              color: '#fca5a5', 
              padding: '5px 12px', 
              borderRadius: '6px', 
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-main)'
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.4)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
            }}
          >
            Cancelar (Esc)
          </button>
        </div>
      )}

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
