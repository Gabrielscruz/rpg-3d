import React, { useState } from 'react'
import useGameStore from '../../store/gameStore'
import { getAllCellsInRange } from '../../utils/gridUtils'

export default function CharacterPanel() {
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const characters = useGameStore(s => s.characters)
  
  const rollStatTest = useGameStore(s => s.rollStatTest)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)
  
  const actionMode = useGameStore(s => s.actionMode)
  const setActionMode = useGameStore(s => s.setActionMode)
  const setHighlightedCells = useGameStore(s => s.setHighlightedCells)
  const selectedSpell = useGameStore(s => s.selectedSpell)
  const setSelectedSpell = useGameStore(s => s.setSelectedSpell)

  const [activeTab, setActiveTab] = useState('general') // 'general' | 'actions' | 'details'

  const char = characters.find(c => c.id === selectedCharacterId)
  if (!char) return null

  const currentChar = getCurrentTurnCharacter()
  const isCurrentTurn = currentChar?.id === char.id && char.alive

  const hpPercent = Math.round((char.hp / char.maxHp) * 100)
  const hpClass = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low'

  const handleStatRoll = (statName, statVal) => {
    rollStatTest(char.id, statName, statVal)
  }

  const handleAttackClick = () => {
    if (char.hasActed || !isCurrentTurn) return
    if (actionMode === 'attack') {
      setActionMode(null)
      setHighlightedCells([])
      return
    }
    const allRange = getAllCellsInRange(
      char.gridX, char.gridZ,
      char.range, characters, char.team
    )
    setActionMode('attack')
    setHighlightedCells(allRange)
    setSelectedSpell(null)
  }

  const handleSpellClick = (spell) => {
    if (char.hasActed || !isCurrentTurn) return
    if (actionMode === 'spell' && selectedSpell?.index === spell.index) {
      setActionMode(null)
      setSelectedSpell(null)
      setHighlightedCells([])
      return
    }
    let cells = []
    if (spell.rangeCells === 0) {
      cells = [{ x: char.gridX, z: char.gridZ, charId: char.id, isRange: true }]
    } else {
      cells = getAllCellsInRange(
        char.gridX, char.gridZ,
        spell.rangeCells, characters, char.team
      )
    }
    setActionMode('spell')
    setSelectedSpell(spell)
    setHighlightedCells(cells)
  }

  return (
    <div className="char-panel lr-sheet">
      {/* Top Banner / Avatar */}
      <div className="lr-sheet-header">
        <div className={`lr-avatar-container team-${char.team.toLowerCase()}`}>
          <div className="lr-avatar">
            {char.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div className="lr-header-info">
          <div className="lr-char-name">{char.name}</div>
          <div className="lr-team-badge">
            <span className={`badge team-${char.team.toLowerCase()}`}>
              {char.team === 'A' ? '🛡️ Aliança A' : '🔥 Horda B'}
            </span>
          </div>
        </div>
      </div>

      {/* HP Section */}
      <div className="lr-hp-section">
        <div className="lr-hp-meta">
          <span>HP</span>
          <strong>{char.hp} / {char.maxHp}</strong>
        </div>
        <div className="hp-bar-container" style={{ height: 10 }}>
          <div
            className={`hp-bar ${hpClass}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="lr-sheet-tabs">
        <button 
          className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          Geral
        </button>
        <button 
          className={`tab-btn ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Ações
        </button>
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Detalhes
        </button>
      </div>

      {/* Tab Contents */}
      <div className="lr-tab-content">
        {activeTab === 'general' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' }}>
              🎲 Clique no atributo para rolar teste
            </div>
            <div className="lr-stats-grid">
              <div className="lr-stat-card" onClick={() => handleStatRoll('Ataque', char.attack)}>
                <span className="stat-icon">⚔️</span>
                <span className="stat-label">ATK</span>
                <strong className="stat-value">{char.attack}</strong>
                <span className="roll-indicator">🎲 Rolar</span>
              </div>
              <div className="lr-stat-card" onClick={() => handleStatRoll('Defesa', char.defense)}>
                <span className="stat-icon">🛡️</span>
                <span className="stat-label">DEF</span>
                <strong className="stat-value">{char.defense}</strong>
                <span className="roll-indicator">🎲 Rolar</span>
              </div>
              <div className="lr-stat-card" onClick={() => handleStatRoll('Velocidade', char.speed)}>
                <span className="stat-icon">💨</span>
                <span className="stat-label">SPD</span>
                <strong className="stat-value">{char.speed}</strong>
                <span className="roll-indicator">🎲 Rolar</span>
              </div>
              <div className="lr-stat-card" onClick={() => handleStatRoll('Alcance', char.range)}>
                <span className="stat-icon">🎯</span>
                <span className="stat-label">RNG</span>
                <strong className="stat-value">{char.range}</strong>
                <span className="roll-indicator">🎲 Rolar</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'actions' && (
          <div style={{ animation: 'fadeIn 0.2s ease' }} className="lr-actions-tab">
            {!isCurrentTurn && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 8, fontStyle: 'italic' }}>
                Ações desabilitadas (não é seu turno)
              </div>
            )}
            
            {/* Standard attack shortcut */}
            <div className="lr-action-item">
              <div className="info">
                <strong>⚔️ Ataque Básico</strong>
                <span>Alcance: {char.range} cél. | Dano vs DEF</span>
              </div>
              <button 
                className={`btn-action-roll ${actionMode === 'attack' ? 'active' : ''}`}
                disabled={char.hasActed || !isCurrentTurn}
                onClick={handleAttackClick}
              >
                {actionMode === 'attack' ? 'Mirando...' : 'Atacar'}
              </button>
            </div>

            {/* Spell shortcuts */}
            {char.spells && char.spells.length > 0 ? (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--text-gold)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  🔮 Grimório de Magias
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {char.spells.map((spell, i) => (
                    <div key={i} className="lr-action-item spell">
                      <div className="info" title={spell.desc}>
                        <strong>🪄 {spell.name}</strong>
                        <span>🎯 {spell.rangeCells}c {spell.aoeRadius > 0 ? `| 💥 R${spell.aoeRadius}` : ''} | {spell.damageFormula || 'Suporte'}</span>
                      </div>
                      <button 
                        className={`btn-action-roll spell-cast ${actionMode === 'spell' && selectedSpell?.index === spell.index ? 'active' : ''}`}
                        disabled={char.hasActed || !isCurrentTurn}
                        onClick={() => handleSpellClick(spell)}
                      >
                        {actionMode === 'spell' && selectedSpell?.index === spell.index ? 'Mirando...' : 'Conjurar'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 10, textAlign: 'center' }}>
                Nenhuma magia disponível.
              </div>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div style={{ animation: 'fadeIn 0.2s ease', fontSize: 12, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>📍 <strong>Posição no Tabuleiro:</strong> ({char.gridX}, {char.gridZ})</div>
            {char.modelFileName && (
              <div>📦 <strong>Miniatura 3D:</strong> {char.modelFileName}</div>
            )}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 6, marginTop: 4 }}>
              <strong>Status Atual:</strong>
            </div>
            {/* Status indicators */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {char.hasMoved && (
                <span className="badge badge-status move">MOVEU</span>
              )}
              {char.hasActed && (
                <span className="badge badge-status act">AGIU</span>
              )}
              {!char.alive ? (
                <span className="badge badge-status dead">💀 DERROTADO</span>
              ) : (
                <span className="badge badge-status alive">PRONTO</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
