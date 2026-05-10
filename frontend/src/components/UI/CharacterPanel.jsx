import React from 'react'
import useGameStore from '../../store/gameStore'

const ARCHETYPE_LABELS = {
  warrior: 'Guerreiro',
  mage: 'Mago',
  rogue: 'Ladino',
  archer: 'Arqueiro',
}

export default function CharacterPanel() {
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const characters = useGameStore(s => s.characters)

  const char = characters.find(c => c.id === selectedCharacterId)
  if (!char) return null

  const hpPercent = Math.round((char.hp / char.maxHp) * 100)
  const hpClass = hpPercent > 50 ? 'high' : hpPercent > 25 ? 'medium' : 'low'
  const archetypeLabel = ARCHETYPE_LABELS[char.appearance?.archetype]

  return (
    <div className="char-panel">
      <div className="char-panel-name">{char.name}</div>

      <div className="hp-bar-container" style={{ height: 8, marginBottom: 8 }}>
        <div
          className={`hp-bar ${hpClass}`}
          style={{ width: `${hpPercent}%` }}
        />
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, textAlign: 'center' }}>
        HP {char.hp} / {char.maxHp}
      </div>

      <div className="char-panel-stats">
        <div className="panel-stat">
          <span className="stat-icon">ATK</span>
          <span className="stat-label">Ataque</span>
          <span className="stat-value">{char.attack}</span>
        </div>
        <div className="panel-stat">
          <span className="stat-icon">DEF</span>
          <span className="stat-label">Defesa</span>
          <span className="stat-value">{char.defense}</span>
        </div>
        <div className="panel-stat">
          <span className="stat-icon">SPD</span>
          <span className="stat-label">Vel.</span>
          <span className="stat-value">{char.speed}</span>
        </div>
        <div className="panel-stat">
          <span className="stat-icon">RNG</span>
          <span className="stat-label">Alcance</span>
          <span className="stat-value">{char.range}</span>
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        Posicao: ({char.gridX}, {char.gridZ})
        {char.modelFileName && (
          <div style={{ marginTop: 4 }}>Arquivo: {char.modelFileName}</div>
        )}
        {!char.modelFileName && archetypeLabel && (
          <div style={{ marginTop: 4 }}>Classe base: {archetypeLabel}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }}>
        {char.hasMoved && (
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)'
          }}>MOVEU</span>
        )}
        {char.hasActed && (
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-red)'
          }}>AGIU</span>
        )}
        {!char.alive && (
          <span style={{
            fontSize: 9, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(100, 100, 100, 0.15)', color: 'var(--text-muted)'
          }}>DERROTADO</span>
        )}
      </div>
    </div>
  )
}
