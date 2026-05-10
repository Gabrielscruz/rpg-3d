import React, { useRef, useState } from 'react'
import useGameStore from '../../store/gameStore'
import { useModelLoader } from '../../hooks/useModelLoader'

const DEFAULT_FORM = {
  name: '',
  scaleX: 1,
  scaleY: 1,
  scaleZ: 1,
  rotationY: 0,
  blocksMovement: true,
}

export default function ImportModal() {
  const showImportModal = useGameStore(s => s.showImportModal)
  const importType = useGameStore(s => s.importType)
  const toggleImportModal = useGameStore(s => s.toggleImportModal)
  const addScenario = useGameStore(s => s.addScenario)
  const { loadModelFromFile } = useModelLoader()

  const fileInputRef = useRef(null)
  const [modelData, setModelData] = useState(null)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [error, setError] = useState('')

  if (!showImportModal || importType !== 'scenario') return null

  const resetModalState = () => {
    setModelData(null)
    setFormData(DEFAULT_FORM)
    setError('')
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setError('')
      const data = await loadModelFromFile(file)
      setModelData(data)
      setFormData(prev => ({
        ...prev,
        name: prev.name || file.name.replace(/\.(glb|gltf)$/i, ''),
      }))
    } catch (err) {
      setError(err.message)
      setModelData(null)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    resetModalState()
    toggleImportModal()
  }

  const handleSubmit = () => {
    addScenario({
      name: formData.name || 'Obstaculo',
      modelUrl: modelData?.url || null,
      scale: [
        parseFloat(formData.scaleX) || 1,
        parseFloat(formData.scaleY) || 1,
        parseFloat(formData.scaleZ) || 1,
      ],
      rotationY: parseInt(formData.rotationY, 10) || 0,
      blocksMovement: formData.blocksMovement,
    })

    resetModalState()
    toggleImportModal()
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Importar Cenario</h2>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="placement-hint">
            Adicione o objeto e depois clique no tabuleiro para posicionar.
          </div>

          <div className={`upload-zone ${modelData ? 'has-file' : ''}`} onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".glb,.gltf"
              onChange={handleFileChange}
            />
            <div className="upload-icon">{modelData ? 'OK' : '3D'}</div>
            <div className="upload-text">
              {modelData ? modelData.fileName : 'Clique para selecionar arquivo GLB'}
            </div>
            <div className="upload-hint">
              {modelData
                ? `${(modelData.size / 1024 / 1024).toFixed(2)} MB`
                : 'Formatos aceitos: .glb e .gltf'}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Nome</label>
            <input
              className="form-input"
              type="text"
              placeholder="Nome do objeto"
              value={formData.name}
              onChange={e => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Escala (X, Y, Z) e Rotacao</label>
            <div className="form-row form-row-4">
              <input className="form-input" type="number" step="0.1" min="0.1" max="20" value={formData.scaleX} onChange={e => handleInputChange('scaleX', e.target.value)} />
              <input className="form-input" type="number" step="0.1" min="0.1" max="20" value={formData.scaleY} onChange={e => handleInputChange('scaleY', e.target.value)} />
              <input className="form-input" type="number" step="0.1" min="0.1" max="20" value={formData.scaleZ} onChange={e => handleInputChange('scaleZ', e.target.value)} />
              <input className="form-input" type="number" step="15" min="-360" max="360" value={formData.rotationY} onChange={e => handleInputChange('rotationY', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                checked={formData.blocksMovement}
                onChange={e => handleInputChange('blocksMovement', e.target.checked)}
              />
              Bloqueia movimento
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button className="btn btn-gold" onClick={handleSubmit}>
            Adicionar e Posicionar
          </button>
        </div>
      </div>
    </div>
  )
}
