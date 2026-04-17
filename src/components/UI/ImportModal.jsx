import React, { useState, useRef } from 'react'
import useGameStore from '../../store/gameStore'
import { useModelLoader } from '../../hooks/useModelLoader'

export default function ImportModal() {
  const showImportModal = useGameStore(s => s.showImportModal)
  const importType = useGameStore(s => s.importType)
  const toggleImportModal = useGameStore(s => s.toggleImportModal)
  const addCharacter = useGameStore(s => s.addCharacter)
  const addScenario = useGameStore(s => s.addScenario)
  const { loadModelFromFile } = useModelLoader()

  const fileInputRef = useRef(null)
  const [modelData, setModelData] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    team: 'A',
    hp: 100,
    attack: 15,
    defense: 8,
    speed: 5,
    range: 1,
    moveRange: 4,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1,
    rotationY: 0,
    blocksMovement: true,
  })
  const [error, setError] = useState('')

  if (!showImportModal) return null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      const data = await loadModelFromFile(file)
      setModelData(data)
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace(/\.(glb|gltf)$/i, '') }))
      }
    } catch (err) {
      setError(err.message)
      setModelData(null)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const scale = [
      parseFloat(formData.scaleX) || 1,
      parseFloat(formData.scaleY) || 1,
      parseFloat(formData.scaleZ) || 1
    ]

    if (importType === 'character') {
      addCharacter({
        name: formData.name || 'Guerreiro',
        modelUrl: modelData?.url || null,
        modelFileName: modelData?.fileName || '',
        team: formData.team,
        hp: parseInt(formData.hp) || 100,
        maxHp: parseInt(formData.hp) || 100,
        attack: parseInt(formData.attack) || 15,
        defense: parseInt(formData.defense) || 8,
        speed: parseInt(formData.speed) || 5,
        range: parseInt(formData.range) || 1,
        moveRange: parseInt(formData.moveRange) || 4,
        scale,
        rotationY: parseInt(formData.rotationY) || 0,
      })
    } else {
      addScenario({
        name: formData.name || 'Obstáculo',
        modelUrl: modelData?.url || null,
        scale,
        rotationY: parseInt(formData.rotationY) || 0,
        blocksMovement: formData.blocksMovement,
      })
    }

    // Reset and close
    setModelData(null)
    setFormData({
      name: '', team: 'A', hp: 100, attack: 15, defense: 8,
      speed: 5, range: 1, moveRange: 4, scaleX: 1, scaleY: 1, scaleZ: 1, rotationY: 0, blocksMovement: true,
    })
    setError('')
    toggleImportModal()
  }

  const handleClose = () => {
    setModelData(null)
    setError('')
    toggleImportModal()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {importType === 'character' ? '⚔️ Importar Personagem' : '🏰 Importar Cenário'}
          </h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Upload Zone */}
          <div className={`upload-zone ${modelData ? 'has-file' : ''}`} onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
            />
            <div className="upload-icon">
              {modelData ? '✅' : '📦'}
            </div>
            <div className="upload-text">
              {modelData ? modelData.fileName : 'Clique para selecionar arquivo GLB'}
            </div>
            <div className="upload-hint">
              {modelData
                ? `${(modelData.size / 1024 / 1024).toFixed(2)} MB`
                : 'Formatos aceitos: .glb, .gltf (do Meshy ou outro)'
              }
            </div>
          </div>

          {error && (
            <div style={{ color: 'var(--accent-red)', fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Placement hint (For both characters and scenarios) */}
          <div style={{
            padding: '10px 14px',
            background: 'rgba(124, 58, 237, 0.1)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            borderRadius: 8,
            fontSize: 12,
            color: 'var(--accent-purple)',
            marginBottom: 16,
            textAlign: 'center',
          }}>
            📍 Após criar, clique no tabuleiro para posicionar o objeto
          </div>

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              className="form-input"
              type="text"
              placeholder={importType === 'character' ? 'Nome do personagem' : 'Nome do objeto'}
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
            />
          </div>

          {/* Scale and Rotation */}
          <div className="form-group">
            <label className="form-label">Escala (L, A, P) e Rotação</label>
            <div className="form-row">
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                placeholder="X"
                value={formData.scaleX}
                onChange={e => handleInputChange('scaleX', e.target.value)}
                title="Largura (X)"
              />
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                placeholder="Y"
                value={formData.scaleY}
                onChange={e => handleInputChange('scaleY', e.target.value)}
                title="Altura (Y)"
              />
              <input
                className="form-input"
                type="number"
                step="0.1"
                min="0.1"
                max="20"
                placeholder="Z"
                value={formData.scaleZ}
                onChange={e => handleInputChange('scaleZ', e.target.value)}
                title="Profundidade (Z)"
              />
              <input
                className="form-input"
                type="number"
                step="15"
                min="-360"
                max="360"
                placeholder="Rot"
                value={formData.rotationY}
                onChange={e => handleInputChange('rotationY', e.target.value)}
                title="Rotação (Graus)"
                style={{ borderLeft: '2px solid rgba(124, 58, 237, 0.5)' }} // Visual separator
              />
            </div>
          </div>

          {/* Character-specific fields */}
          {importType === 'character' && (
            <>
              <div className="form-group">
                <label className="form-label">Time</label>
                <select
                  className="form-select"
                  value={formData.team}
                  onChange={e => handleInputChange('team', e.target.value)}
                >
                  <option value="A">🔵 Time A (Azul)</option>
                  <option value="B">🔴 Time B (Vermelho)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">❤️ HP</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.hp}
                    onChange={e => handleInputChange('hp', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">⚔️ Ataque</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={formData.attack}
                    onChange={e => handleInputChange('attack', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🛡️ Defesa</label>
                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    value={formData.defense}
                    onChange={e => handleInputChange('defense', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">💨 Velocidade</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.speed}
                    onChange={e => handleInputChange('speed', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🎯 Alcance Ataque</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.range}
                    onChange={e => handleInputChange('range', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">🏃 Alcance Movimento</label>
                  <input
                    className="form-input"
                    type="number"
                    min="1"
                    value={formData.moveRange}
                    onChange={e => handleInputChange('moveRange', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Scenario-specific fields */}
          {importType === 'scenario' && (
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={formData.blocksMovement}
                  onChange={e => handleInputChange('blocksMovement', e.target.checked)}
                  style={{ accentColor: 'var(--accent-purple)' }}
                />
                Bloqueia movimento (obstáculo)
              </label>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn btn-gold" onClick={handleSubmit}>
            {importType === 'character' ? '⚔️ Criar e Posicionar' : '🏰 Add. e Posicionar'}
          </button>
        </div>
      </div>
    </div>
  )
}
