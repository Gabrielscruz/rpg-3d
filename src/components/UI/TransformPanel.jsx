import React from 'react'
import useGameStore from '../../store/gameStore'

export default function TransformPanel() {
  const gameState = useGameStore(s => s.gameState)
  const characters = useGameStore(s => s.characters)
  const scenarios = useGameStore(s => s.scenarios)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const selectedScenarioId = useGameStore(s => s.selectedScenarioId)
  const updateCharacter = useGameStore(s => s.updateCharacter)
  const updateScenario = useGameStore(s => s.updateScenario)

  // Only allow editing during setup phase
  if (gameState !== 'setup') return null

  let activeObject = null
  let updateFn = null

  if (selectedCharacterId) {
    activeObject = characters.find(c => c.id === selectedCharacterId)
    updateFn = updateCharacter
  } else if (selectedScenarioId) {
    activeObject = scenarios.find(s => s.id === selectedScenarioId)
    updateFn = updateScenario
  }

  // If nothing is selected or it's not placed yet on grid
  if (!activeObject || activeObject.gridX < 0) return null

  const handleScaleChange = (axis, value) => {
    const newScale = [...(activeObject.scale || [1, 1, 1])]
    newScale[axis] = parseFloat(value) || 0.1
    updateFn(activeObject.id, { scale: newScale })
  }

  const handleRotationChange = (value) => {
    updateFn(activeObject.id, { rotationY: parseFloat(value) || 0 })
  }

  return (
    <div className="transform-panel" style={{
      position: 'absolute', right: 340, top: 20, 
      background: 'rgba(15, 15, 26, 0.95)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(124, 58, 237, 0.4)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      borderRadius: 12, padding: 16, width: 280, color: 'white',
      zIndex: 100, pointerEvents: 'auto'
    }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: 13, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: 1 }}>
        🛠️ Editar: {activeObject.name}
      </h3>

      <div className="form-group" style={{ marginBottom: 16 }}>
        <label className="form-label" style={{ fontSize: 11, marginBottom: 8, color: 'var(--accent-gold)' }}>Rotação (Y) - Graus</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
           <input 
             type="range" min="-180" max="180" step="15"
             value={activeObject.rotationY || 0}
             onChange={(e) => handleRotationChange(e.target.value)}
             style={{ flex: 1, accentColor: 'var(--accent-gold)' }}
           />
           <span style={{ fontSize: 12, width: 40, textAlign: 'right', fontFamily: 'monospace' }}>
             {activeObject.rotationY || 0}°
           </span>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label" style={{ fontSize: 11, marginBottom: 8, color: 'var(--accent-gold)' }}>Escala (X, Y, Z)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textAlign: 'center' }}>Largura</div>
            <input 
              className="form-input" type="number" step="0.1" min="0.1" max="50"
              style={{ padding: '6px', fontSize: 12, textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}
              value={activeObject.scale?.[0] ?? 1}
              onChange={(e) => handleScaleChange(0, e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textAlign: 'center' }}>Altura</div>
            <input 
              className="form-input" type="number" step="0.1" min="0.1" max="50"
              style={{ padding: '6px', fontSize: 12, textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}
              value={activeObject.scale?.[1] ?? 1}
              onChange={(e) => handleScaleChange(1, e.target.value)}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, textAlign: 'center' }}>Prof.</div>
            <input 
              className="form-input" type="number" step="0.1" min="0.1" max="50"
              style={{ padding: '6px', fontSize: 12, textAlign: 'center', background: 'rgba(0,0,0,0.3)' }}
              value={activeObject.scale?.[2] ?? 1}
              onChange={(e) => handleScaleChange(2, e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, fontSize: 11, textAlign: 'center', color: 'var(--text-secondary)' }}>
        📍 Posição: ({activeObject.gridX}, {activeObject.gridZ})
      </div>
    </div>
  )
}
