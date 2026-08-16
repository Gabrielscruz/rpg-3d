import React from 'react'
import useGameStore from '../../store/gameStore'
import { BOARD_THEMES } from '../Game/Board'

export default function Sidebar() {
  const characters = useGameStore(s => s.characters)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const selectCharacter = useGameStore(s => s.selectCharacter)
  const removeCharacter = useGameStore(s => s.removeCharacter)
  const toggleImportModal = useGameStore(s => s.toggleImportModal)
  const gameState = useGameStore(s => s.gameState)
  const turnOrder = useGameStore(s => s.turnOrder)
  const currentTurnIndex = useGameStore(s => s.currentTurnIndex)
  const boardTheme = useGameStore(s => s.boardTheme)
  const setBoardTheme = useGameStore(s => s.setBoardTheme)

  const currentTurnId = turnOrder[currentTurnIndex]

  const getHpPercent = (char) => Math.round((char.hp / char.maxHp) * 100)
  const getHpClass = (char) => {
    const pct = char.hp / char.maxHp
    if (pct > 0.5) return 'high'
    if (pct > 0.25) return 'medium'
    return 'low'
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>⚔️ Personagens</h2>
        {gameState === 'setup' && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn-icon"
              title="Adicionar Personagem"
              onClick={() => toggleImportModal('character')}
            >
              👤
            </button>
            <button
              className="btn-icon"
              title="Adicionar Cenário"
              onClick={() => toggleImportModal('scenario')}
            >
              🏰
            </button>
          </div>
        )}
      </div>

      {/* Theme selector during setup */}
      {gameState === 'setup' && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase',
            letterSpacing: 1.5, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-title)',
          }}>
            🎨 Tema do Chão
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
            {Object.entries(BOARD_THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setBoardTheme(key)}
                style={{
                  padding: '6px 4px',
                  fontSize: 11,
                  border: boardTheme === key ? '2px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  background: boardTheme === key
                    ? `linear-gradient(135deg, ${theme.cellEven}, ${theme.cellOdd})`
                    : 'var(--surface-secondary)',
                  color: boardTheme === key ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: boardTheme === key ? 700 : 400,
                  transition: 'all 0.15s ease',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sidebar-content">
        {characters.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🎭</div>
            <p>Nenhum personagem ainda.<br />Importe seus modelos GLB do Meshy!</p>
          </div>
        ) : (
          <>
            {/* Team A */}
            {characters.filter(c => c.team === 'A').length > 0 && (
              <>
                <div style={{
                  fontSize: 10, color: 'var(--accent-blue)', textTransform: 'uppercase',
                  letterSpacing: 1.5, fontWeight: 700, padding: '8px 4px 4px', fontFamily: 'var(--font-title)'
                }}>
                  Time A
                </div>
                {characters.filter(c => c.team === 'A').map(char => (
                  <div
                    key={char.id}
                    className={`char-card ${selectedCharacterId === char.id ? 'active' : ''} ${!char.alive ? 'dead' : ''} ${currentTurnId === char.id ? 'current-turn' : ''}`}
                    onClick={() => selectCharacter(char.id)}
                  >
                    <div className="char-card-header">
                      <div className={`char-avatar team-a`}>
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="char-card-name">{char.name}</span>
                      {currentTurnId === char.id && gameState === 'playing' && (
                        <span style={{
                          fontSize: 10, color: 'var(--accent-gold)', fontWeight: 700,
                          animation: 'pulseGlow 1s infinite alternate'
                        }}>⚡ TURNO</span>
                      )}
                      {gameState === 'setup' && (
                        <button
                          className="btn-icon"
                          style={{ width: 24, height: 24, fontSize: 12 }}
                          onClick={(e) => { e.stopPropagation(); removeCharacter(char.id) }}
                          title="Remover"
                        >✕</button>
                      )}
                    </div>
                    <div className="hp-bar-container">
                      <div
                        className={`hp-bar ${getHpClass(char)}`}
                        style={{ width: `${getHpPercent(char)}%` }}
                      />
                    </div>
                    <div className="hp-text">{char.hp} / {char.maxHp} HP</div>
                    <div className="char-stats-mini">
                      <div className="stat-mini">⚔ <span>{char.attack}</span></div>
                      <div className="stat-mini">🛡 <span>{char.defense}</span></div>
                      <div className="stat-mini">💨 <span>{char.speed}</span></div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Team B */}
            {characters.filter(c => c.team === 'B').length > 0 && (
              <>
                <div style={{
                  fontSize: 10, color: 'var(--accent-red)', textTransform: 'uppercase',
                  letterSpacing: 1.5, fontWeight: 700, padding: '12px 4px 4px', fontFamily: 'var(--font-title)'
                }}>
                  Time B
                </div>
                {characters.filter(c => c.team === 'B').map(char => (
                  <div
                    key={char.id}
                    className={`char-card ${selectedCharacterId === char.id ? 'active' : ''} ${!char.alive ? 'dead' : ''} ${currentTurnId === char.id ? 'current-turn' : ''}`}
                    onClick={() => selectCharacter(char.id)}
                  >
                    <div className="char-card-header">
                      <div className={`char-avatar team-b`}>
                        {char.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="char-card-name">{char.name}</span>
                      {currentTurnId === char.id && gameState === 'playing' && (
                        <span style={{
                          fontSize: 10, color: 'var(--accent-gold)', fontWeight: 700,
                        }}>⚡ TURNO</span>
                      )}
                      {gameState === 'setup' && (
                        <button
                          className="btn-icon"
                          style={{ width: 24, height: 24, fontSize: 12 }}
                          onClick={(e) => { e.stopPropagation(); removeCharacter(char.id) }}
                          title="Remover"
                        >✕</button>
                      )}
                    </div>
                    <div className="hp-bar-container">
                      <div
                        className={`hp-bar ${getHpClass(char)}`}
                        style={{ width: `${getHpPercent(char)}%` }}
                      />
                    </div>
                    <div className="hp-text">{char.hp} / {char.maxHp} HP</div>
                    <div className="char-stats-mini">
                      <div className="stat-mini">⚔ <span>{char.attack}</span></div>
                      <div className="stat-mini">🛡 <span>{char.defense}</span></div>
                      <div className="stat-mini">💨 <span>{char.speed}</span></div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
