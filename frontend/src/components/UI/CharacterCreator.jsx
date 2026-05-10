import React, { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import useGameStore from '../../store/gameStore'
import ProceduralCharacter from '../Game/ProceduralCharacter'
import {
  ARCHETYPE_OPTIONS,
  BODY_BUILD_OPTIONS,
  DEFAULT_CHARACTER_FORM,
  FACE_SHAPE_OPTIONS,
  HAIR_STYLE_OPTIONS,
  extractAppearance,
} from '../../data/characterCreator'

const CREATOR_SECTIONS = [
  { id: 'identity', label: 'Identidade' },
  { id: 'face', label: 'Rosto' },
  { id: 'hair', label: 'Cabelo' },
  { id: 'body', label: 'Corpo' },
  { id: 'combat', label: 'Atributos' },
]

function CreatorPreview({ appearance, team }) {
  return (
    <div className="creator-preview-stage">
      <Canvas camera={{ position: [0, 1.7, 4.6], fov: 34 }} shadows dpr={[1, 1.5]}>
        <color attach="background" args={['#0d0d16']} />
        <fog attach="fog" args={['#0d0d16', 5, 12]} />
        <ambientLight intensity={0.9} color="#e4dbff" />
        <directionalLight position={[3.5, 5.6, 4]} intensity={1.8} color="#ffe2ba" castShadow />
        <directionalLight position={[-3.5, 2.2, -3]} intensity={0.45} color="#6b7dff" />
        <pointLight position={[0, 2.4, 1.8]} intensity={0.35} color={appearance.accentColor} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.45, 0]} receiveShadow>
          <circleGeometry args={[2.8, 48]} />
          <meshStandardMaterial color="#171729" roughness={0.96} metalness={0.08} />
        </mesh>
        <ProceduralCharacter team={team} appearance={appearance} preview />
      </Canvas>
    </div>
  )
}

function RangeField({ label, value, min, max, step, onChange }) {
  return (
    <label className="creator-range">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
      />
      <strong>{Number(value).toFixed(2)}</strong>
    </label>
  )
}

export default function CharacterCreator() {
  const showCharacterCreator = useGameStore(s => s.showCharacterCreator)
  const closeCharacterCreator = useGameStore(s => s.closeCharacterCreator)
  const addCharacter = useGameStore(s => s.addCharacter)

  const [activeSection, setActiveSection] = useState('identity')
  const [formData, setFormData] = useState(DEFAULT_CHARACTER_FORM)

  const appearance = useMemo(() => extractAppearance(formData), [formData])

  if (!showCharacterCreator) return null

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClose = () => {
    setFormData(DEFAULT_CHARACTER_FORM)
    setActiveSection('identity')
    closeCharacterCreator()
  }

  const handleCreate = () => {
    addCharacter({
      name: formData.name || 'Aventureiro',
      characterSource: 'builder',
      appearance,
      team: formData.team,
      hp: parseInt(formData.hp, 10) || 100,
      maxHp: parseInt(formData.hp, 10) || 100,
      attack: parseInt(formData.attack, 10) || 15,
      defense: parseInt(formData.defense, 10) || 8,
      speed: parseInt(formData.speed, 10) || 5,
      range: parseInt(formData.range, 10) || 1,
      moveRange: parseInt(formData.moveRange, 10) || 4,
      scale: [
        parseFloat(formData.scaleX) || 1,
        parseFloat(formData.scaleY) || 1,
        parseFloat(formData.scaleZ) || 1,
      ],
      rotationY: parseInt(formData.rotationY, 10) || 0,
    })
    handleClose()
  }

  return (
    <div className="creator-shell">
      <div className="creator-layout">
        <aside className="creator-sidebar">
          <div className="creator-sidebar-top">
            <div className="creator-badge">Character Forge</div>
            <h2 className="creator-title">Criador de Personagem</h2>
            <p className="creator-subtitle">
              Monte um heroi direto na web e depois posicione no tabuleiro.
            </p>
          </div>

          <div className="creator-nav">
            {CREATOR_SECTIONS.map(section => (
              <button
                key={section.id}
                type="button"
                className={`creator-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                {section.label}
              </button>
            ))}
          </div>

          <div className="creator-actions">
            <button className="btn btn-secondary" onClick={handleClose}>
              Fechar
            </button>
            <button className="btn btn-gold" onClick={handleCreate}>
              Criar e Posicionar
            </button>
          </div>
        </aside>

        <section className="creator-stage">
          <CreatorPreview appearance={appearance} team={formData.team} />

          <div className="creator-stage-summary">
            <div>
              <span className="creator-summary-label">Personagem</span>
              <strong>{formData.name || 'Sem nome'}</strong>
            </div>
            <div>
              <span className="creator-summary-label">Base</span>
              <strong>{ARCHETYPE_OPTIONS.find(item => item.value === formData.archetype)?.label}</strong>
            </div>
            <div>
              <span className="creator-summary-label">Time</span>
              <strong>Time {formData.team}</strong>
            </div>
          </div>
        </section>

        <section className="creator-panel">
          {activeSection === 'identity' && (
            <div className="creator-section">
              <h3>Identidade e Classe</h3>
              <div className="form-group">
                <label className="form-label">Nome</label>
                <input
                  className="form-input"
                  value={formData.name}
                  onChange={e => updateField('name', e.target.value)}
                  placeholder="Nome do personagem"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Classe Base</label>
                <div className="archetype-grid">
                  {ARCHETYPE_OPTIONS.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      className={`archetype-card ${formData.archetype === option.value ? 'active' : ''}`}
                      onClick={() => updateField('archetype', option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Time</label>
                  <select className="form-select" value={formData.team} onChange={e => updateField('team', e.target.value)}>
                    <option value="A">Time A</option>
                    <option value="B">Time B</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rotacao</label>
                  <input
                    className="form-input"
                    type="number"
                    step="15"
                    value={formData.rotationY}
                    onChange={e => updateField('rotationY', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'face' && (
            <div className="creator-section">
              <h3>Rosto</h3>
              <div className="creator-chip-group">
                {FACE_SHAPE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`creator-chip ${formData.faceShape === option.value ? 'active' : ''}`}
                    onClick={() => updateField('faceShape', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <RangeField label="Tamanho dos olhos" value={formData.eyeSize} min={0.7} max={1.35} step={0.05} onChange={value => updateField('eyeSize', value)} />
              <RangeField label="Largura do maxilar" value={formData.jawWidth} min={0.8} max={1.35} step={0.05} onChange={value => updateField('jawWidth', value)} />
              <RangeField label="Comprimento do nariz" value={formData.noseLength} min={0.75} max={1.35} step={0.05} onChange={value => updateField('noseLength', value)} />

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Pele</label>
                  <input className="form-input form-color" type="color" value={formData.skinColor} onChange={e => updateField('skinColor', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Olhos</label>
                  <input className="form-input form-color" type="color" value={formData.eyeColor} onChange={e => updateField('eyeColor', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'hair' && (
            <div className="creator-section">
              <h3>Cabelo</h3>
              <div className="creator-chip-group">
                {HAIR_STYLE_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`creator-chip ${formData.hairStyle === option.value ? 'active' : ''}`}
                    onClick={() => updateField('hairStyle', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="form-row form-row-2">
                <div className="form-group">
                  <label className="form-label">Cor do cabelo</label>
                  <input className="form-input form-color" type="color" value={formData.hairColor} onChange={e => updateField('hairColor', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Cor de destaque</label>
                  <input className="form-input form-color" type="color" value={formData.accentColor} onChange={e => updateField('accentColor', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'body' && (
            <div className="creator-section">
              <h3>Corpo e Vestes</h3>

              <div className="creator-chip-group">
                {BODY_BUILD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    className={`creator-chip ${formData.bodyBuild === option.value ? 'active' : ''}`}
                    onClick={() => updateField('bodyBuild', option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Roupa base</label>
                  <input className="form-input form-color" type="color" value={formData.bodyColor} onChange={e => updateField('bodyColor', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Detalhes</label>
                  <input className="form-input form-color" type="color" value={formData.accentColor} onChange={e => updateField('accentColor', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Metal</label>
                  <input className="form-input form-color" type="color" value={formData.metalColor} onChange={e => updateField('metalColor', e.target.value)} />
                </div>
              </div>

              <div className="form-row form-row-3">
                <div className="form-group">
                  <label className="form-label">Escala X</label>
                  <input className="form-input" type="number" step="0.1" min="0.5" max="2" value={formData.scaleX} onChange={e => updateField('scaleX', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Escala Y</label>
                  <input className="form-input" type="number" step="0.1" min="0.5" max="2" value={formData.scaleY} onChange={e => updateField('scaleY', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Escala Z</label>
                  <input className="form-input" type="number" step="0.1" min="0.5" max="2" value={formData.scaleZ} onChange={e => updateField('scaleZ', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'combat' && (
            <div className="creator-section">
              <h3>Atributos</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">HP</label>
                  <input className="form-input" type="number" min="1" value={formData.hp} onChange={e => updateField('hp', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ataque</label>
                  <input className="form-input" type="number" min="0" value={formData.attack} onChange={e => updateField('attack', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Defesa</label>
                  <input className="form-input" type="number" min="0" value={formData.defense} onChange={e => updateField('defense', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Velocidade</label>
                  <input className="form-input" type="number" min="1" value={formData.speed} onChange={e => updateField('speed', e.target.value)} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Alcance</label>
                  <input className="form-input" type="number" min="1" value={formData.range} onChange={e => updateField('range', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Movimento</label>
                  <input className="form-input" type="number" min="1" value={formData.moveRange} onChange={e => updateField('moveRange', e.target.value)} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
