import React, { useState, useRef, Suspense, useEffect } from 'react'
import useGameStore from '../../store/gameStore'
import { useModelLoader } from '../../hooks/useModelLoader'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stage, useGLTF } from '@react-three/drei'

function ModelPreview({ url, scale, rotationY = 0 }) {
  const { scene } = useGLTF(url)
  return <primitive object={scene.clone()} scale={scale} rotation={[0, rotationY * (Math.PI / 180), 0]} />
}

const CHARACTER_CATALOG = [
  {
    id: 'knight',
    name: 'Cavaleiro',
    emoji: '⚔️',
    modelUrl: '/models/Knight.glb',
    description: 'Guerreiro corpo-a-corpo resiliente',
    hp: 120, maxHp: 120, attack: 18, defense: 14, speed: 4, range: 1, moveRange: 3,
    scale: [1, 1, 1],
  },
  {
    id: 'barbarian',
    name: 'Bárbaro',
    emoji: '🪓',
    modelUrl: '/models/Barbarian.glb',
    description: 'Destruição pura com alto dano',
    hp: 100, maxHp: 100, attack: 24, defense: 6, speed: 5, range: 1, moveRange: 4,
    scale: [1, 1, 1],
  },
  {
    id: 'mage',
    name: 'Mago',
    emoji: '🧙',
    modelUrl: '/models/Mage.glb',
    description: 'Mago com alto alcance de ataque',
    hp: 70, maxHp: 70, attack: 22, defense: 4, speed: 6, range: 4, moveRange: 4,
    scale: [1, 1, 1],
  },
  {
    id: 'rogue',
    name: 'Ladino',
    emoji: '🗡️',
    modelUrl: '/models/Rogue.glb',
    description: 'Veloz e ágil, ideal para flanquear',
    hp: 80, maxHp: 80, attack: 20, defense: 8, speed: 8, range: 1, moveRange: 6,
    scale: [1, 1, 1],
  },
  {
    id: 'rogue_hooded',
    name: 'Ladino Encapuzado',
    emoji: '🥷',
    modelUrl: '/models/Rogue_Hooded.glb',
    description: 'Assassino das sombras, mestre em furtividade',
    hp: 75, maxHp: 75, attack: 22, defense: 6, speed: 9, range: 1, moveRange: 7,
    scale: [1, 1, 1],
  },
  {
    id: 'skeleton_warrior',
    name: 'Esqueleto Guerreiro',
    emoji: '💀',
    modelUrl: '/models/Skeleton_Warrior.glb',
    description: 'Morto-vivo com espada e escudo',
    hp: 60, maxHp: 60, attack: 14, defense: 10, speed: 4, range: 1, moveRange: 3,
    scale: [1, 1, 1],
  },
  {
    id: 'skeleton_mage',
    name: 'Esqueleto Mago',
    emoji: '☠️',
    modelUrl: '/models/Skeleton_Mage.glb',
    description: 'Necromante esquelético com magias sombrias',
    hp: 50, maxHp: 50, attack: 20, defense: 3, speed: 5, range: 4, moveRange: 3,
    scale: [1, 1, 1],
  },
  {
    id: 'skeleton_rogue',
    name: 'Esqueleto Ladino',
    emoji: '🦴',
    modelUrl: '/models/Skeleton_Rogue.glb',
    description: 'Morto-vivo ágil e sorrateiro',
    hp: 45, maxHp: 45, attack: 16, defense: 4, speed: 8, range: 1, moveRange: 6,
    scale: [1, 1, 1],
  },
  {
    id: 'skeleton_minion',
    name: 'Esqueleto Lacaio',
    emoji: '🪦',
    modelUrl: '/models/Skeleton_Minion.glb',
    description: 'Soldado morto-vivo fraco mas numeroso',
    hp: 30, maxHp: 30, attack: 10, defense: 2, speed: 3, range: 1, moveRange: 3,
    scale: [1, 1, 1],
  },
]

const SCENARIO_CATALOG = [
  {
    id: 'chest',
    name: 'Baú',
    emoji: '🗃️',
    modelUrl: '/models/Chest.glb',
    description: 'Baú de tesouro misterioso',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'chest_gold',
    name: 'Baú Dourado',
    emoji: '✨',
    modelUrl: '/models/Chest_Gold.glb',
    description: 'Baú repleto de ouro',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'torch',
    name: 'Tocha',
    emoji: '🔥',
    modelUrl: '/models/Torch.glb',
    description: 'Tocha acesa que ilumina a dungeon',
    scale: [1, 1, 1],
    blocksMovement: false,
  },
  {
    id: 'barrel',
    name: 'Barril',
    emoji: '🪣',
    modelUrl: '/models/Barrel.glb',
    description: 'Barril grande de madeira',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'pillar',
    name: 'Pilar',
    emoji: '🏛️',
    modelUrl: '/models/Pillar.glb',
    description: 'Pilar de pedra decorado',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'column',
    name: 'Coluna',
    emoji: '🪨',
    modelUrl: '/models/Column.glb',
    description: 'Coluna de pedra maciça',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'candle',
    name: 'Candelabro',
    emoji: '🕯️',
    modelUrl: '/models/Candle.glb',
    description: 'Três velas acesas',
    scale: [1, 1, 1],
    blocksMovement: false,
  },
  {
    id: 'sword_shield',
    name: 'Espada & Escudo',
    emoji: '🛡️',
    modelUrl: '/models/Sword_Shield.glb',
    description: 'Armas penduradas na parede',
    scale: [1, 1, 1],
    blocksMovement: false,
  },
  {
    id: 'banner',
    name: 'Estandarte',
    emoji: '🚩',
    modelUrl: '/models/Banner.glb',
    description: 'Estandarte vermelho medieval',
    scale: [1, 1, 1],
    blocksMovement: false,
  },
  {
    id: 'spikes',
    name: 'Armadilha de Espinhos',
    emoji: '⚠️',
    modelUrl: '/models/Spikes.glb',
    description: 'Piso com espinhos mortais',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
  {
    id: 'doorway',
    name: 'Portal de Pedra',
    emoji: '🚪',
    modelUrl: '/models/Doorway.glb',
    description: 'Porta de pedra da dungeon',
    scale: [1, 1, 1],
    blocksMovement: true,
  },
]

export default function ImportModal() {
  const showImportModal = useGameStore(s => s.showImportModal)
  const importType = useGameStore(s => s.importType)
  const toggleImportModal = useGameStore(s => s.toggleImportModal)
  const addCharacter = useGameStore(s => s.addCharacter)
  const addScenario = useGameStore(s => s.addScenario)
  const editingCharacterId = useGameStore(s => s.editingCharacterId)
  const characters = useGameStore(s => s.characters)
  const updateCharacter = useGameStore(s => s.updateCharacter)
  const scenarios = useGameStore(s => s.scenarios)
  const updateScenario = useGameStore(s => s.updateScenario)
  const { loadModelFromFile } = useModelLoader()

  const [dndSpellsList, setDndSpellsList] = useState([])
  const [isLoadingSpells, setIsLoadingSpells] = useState(false)
  const [selectedSpellIndex, setSelectedSpellIndex] = useState('')
  const [selectedSpellDetails, setSelectedSpellDetails] = useState(null)
  const [characterSpells, setCharacterSpells] = useState([])

  const FALLBACK_SPELLS = [
    { index: 'fireball', name: 'Fireball', range: '150 feet', rangeCells: 15, damageFormula: '8d6', aoeRadius: 4, desc: 'A bright streak flashes from your pointing finger...' },
    { index: 'magic-missile', name: 'Magic Missile', range: '120 feet', rangeCells: 12, damageFormula: '3d4', aoeRadius: 0, desc: 'You create three glowing darts of magical force...' },
    { index: 'cure-wounds', name: 'Cure Wounds', range: 'Touch', rangeCells: 1, damageFormula: '1d8', aoeRadius: 0, desc: 'A creature you touch regains a number of hit points...' },
  ]

  useEffect(() => {
    if (!showImportModal || importType !== 'character') return

    setIsLoadingSpells(true)
    fetch('https://www.dnd5eapi.co/api/spells')
      .then(res => res.json())
      .then(data => {
        if (data.results && Array.isArray(data.results)) {
          setDndSpellsList(data.results)
        } else {
          setDndSpellsList(FALLBACK_SPELLS)
        }
      })
      .catch(() => {
        setDndSpellsList(FALLBACK_SPELLS)
      })
      .finally(() => {
        setIsLoadingSpells(false)
      })
  }, [showImportModal, importType])

  useEffect(() => {
    if (editingCharacterId && importType === 'character') {
      const char = characters.find(c => c.id === editingCharacterId)
      if (char) {
        setCharacterSpells(char.spells || [])
      }
    } else {
      setCharacterSpells([])
    }
  }, [editingCharacterId, characters, showImportModal, importType])

  const handleSpellSelect = (index) => {
    setSelectedSpellIndex(index)
    if (!index) {
      setSelectedSpellDetails(null)
      return
    }

    const fallback = FALLBACK_SPELLS.find(s => s.index === index)
    if (fallback) {
      setSelectedSpellDetails(fallback)
      return
    }

    fetch(`https://www.dnd5eapi.co/api/spells/${index}`)
      .then(res => res.json())
      .then(spell => {
        let rangeCells = 1
        const rangeStr = spell.range || ''
        if (rangeStr.toLowerCase().includes('feet')) {
          const feet = parseInt(rangeStr) || 30
          rangeCells = Math.max(1, Math.floor(feet / 10))
        } else if (rangeStr.toLowerCase().includes('touch')) {
          rangeCells = 1
        } else if (rangeStr.toLowerCase().includes('self')) {
          rangeCells = 0
        } else if (rangeStr.toLowerCase().includes('sight') || rangeStr.toLowerCase().includes('unlimited')) {
          rangeCells = 12
        }

        let damageFormula = ''
        if (spell.damage?.damage_at_slot_level) {
          const keys = Object.keys(spell.damage.damage_at_slot_level)
          if (keys.length > 0) {
            damageFormula = spell.damage.damage_at_slot_level[keys[0]]
          }
        } else if (spell.heal_at_slot_level) {
          const keys = Object.keys(spell.heal_at_slot_level)
          if (keys.length > 0) {
            damageFormula = spell.heal_at_slot_level[keys[0]]
          }
        }

        if (!damageFormula) {
          const descStr = (spell.desc || []).join(' ')
          const match = descStr.match(/(\d+d\d+)/)
          if (match) {
            damageFormula = match[1]
          } else {
            const lvl = spell.level || 0
            if (lvl === 0) damageFormula = '1d8'
            else if (lvl === 1) damageFormula = '2d6'
            else if (lvl === 2) damageFormula = '3d8'
            else damageFormula = `${lvl + 2}d8`
          }
        }

        let aoeRadius = 0
        if (spell.area_of_effect) {
          const size = spell.area_of_effect.size || 0
          aoeRadius = Math.max(1, Math.floor(size / 10))
        }

        setSelectedSpellDetails({
          index,
          name: spell.name,
          level: spell.level,
          range: spell.range,
          rangeCells,
          damageFormula,
          aoeRadius,
          desc: (spell.desc || []).join(' ').substring(0, 300) + '...',
          damageType: spell.damage?.damage_type?.name || (spell.name.toLowerCase().includes('cure') ? 'healing' : 'magic')
        })
      })
      .catch(() => {
        setSelectedSpellDetails({
          index,
          name: index.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          level: 1,
          range: '60 feet',
          rangeCells: 6,
          damageFormula: '2d6',
          aoeRadius: 0,
          desc: 'Informações detalhadas indisponíveis (erro de conexão).',
          damageType: 'magic'
        })
      })
  }

  const handleAddSpell = () => {
    if (!selectedSpellDetails) return
    if (characterSpells.some(s => s.index === selectedSpellDetails.index)) return
    setCharacterSpells(prev => [...prev, selectedSpellDetails])
    setSelectedSpellIndex('')
    setSelectedSpellDetails(null)
  }

  const fileInputRef = useRef(null)
  const [modelData, setModelData] = useState(null)
  const [selectedCatalogChar, setSelectedCatalogChar] = useState(null)
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'upload'
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

  // Initialize form if editing an existing character
  useEffect(() => {
    if (editingCharacterId) {
      if (importType === 'character') {
        const char = characters.find(c => c.id === editingCharacterId)
        if (char) {
          setFormData({
            name: char.name || '',
            team: char.team || 'A',
            hp: char.maxHp || 100,
            attack: char.attack || 15,
            defense: char.defense || 8,
            speed: char.speed || 5,
            range: char.range || 1,
            moveRange: char.moveRange || 4,
            scaleX: char.scale?.[0] || 1,
            scaleY: char.scale?.[1] || 1,
            scaleZ: char.scale?.[2] || 1,
            rotationY: char.rotationY || 0,
            blocksMovement: true,
          })
          
          const catalogMatch = CHARACTER_CATALOG.find(c => c.modelUrl === char.modelUrl)
          if (catalogMatch) {
            setSelectedCatalogChar(catalogMatch)
            setActiveTab('catalog')
          } else {
            setModelData({ url: char.modelUrl, fileName: char.modelFileName })
            setActiveTab('upload')
          }
        }
      } else {
        const scn = scenarios.find(s => s.id === editingCharacterId)
        if (scn) {
          setFormData({
            name: scn.name || '',
            team: 'A',
            hp: 100, attack: 15, defense: 8, speed: 5, range: 1, moveRange: 4,
            scaleX: scn.scale?.[0] || 1,
            scaleY: scn.scale?.[1] || 1,
            scaleZ: scn.scale?.[2] || 1,
            rotationY: scn.rotationY || 0,
            blocksMovement: scn.blocksMovement ?? true,
          })
          
          const catalogMatch = SCENARIO_CATALOG.find(c => c.modelUrl === scn.modelUrl)
          if (catalogMatch) {
            setSelectedCatalogChar(catalogMatch)
            setActiveTab('catalog')
          } else {
            setModelData({ url: scn.modelUrl, fileName: scn.modelFileName })
            setActiveTab('upload')
          }
        }
      }
    } else {
      // Reset form on open new
      setFormData({
        name: '', team: 'A', hp: 100, attack: 15, defense: 8, speed: 5, range: 1, moveRange: 4, scaleX: 1, scaleY: 1, scaleZ: 1, rotationY: 0, blocksMovement: true
      })
      setSelectedCatalogChar(null)
      setModelData(null)
      setActiveTab('catalog')
    }
  }, [editingCharacterId, characters, scenarios, showImportModal, importType])

  if (!showImportModal) return null

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setError('')
      const data = await loadModelFromFile(file)
      setModelData(data)
      setSelectedCatalogChar(null)
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.replace(/\.(glb|gltf)$/i, '') }))
      }
    } catch (err) {
      setError(err.message)
      setModelData(null)
    }
  }

  const handleSelectCatalog = (char) => {
    setSelectedCatalogChar(char)
    setModelData(null)
    setFormData(prev => ({
      ...prev,
      name: char.name,
      hp: char.hp ?? prev.hp,
      attack: char.attack ?? prev.attack,
      defense: char.defense ?? prev.defense,
      speed: char.speed ?? prev.speed,
      range: char.range ?? prev.range,
      moveRange: char.moveRange ?? prev.moveRange,
      scaleX: char.scale[0],
      scaleY: char.scale[1],
      scaleZ: char.scale[2],
      blocksMovement: char.blocksMovement ?? prev.blocksMovement,
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    const scale = [
      parseFloat(formData.scaleX) || 1,
      parseFloat(formData.scaleY) || 1,
      parseFloat(formData.scaleZ) || 1,
    ]

    const modelUrl = selectedCatalogChar
      ? selectedCatalogChar.modelUrl
      : (modelData?.url || null)
    
    const modelFileName = modelData?.fileName || selectedCatalogChar?.id || ''

    if (editingCharacterId) {
      if (importType === 'character') {
        updateCharacter(editingCharacterId, {
          name: formData.name || 'Guerreiro',
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
          spells: characterSpells,
          ...(modelUrl ? { modelUrl, modelFileName } : {}) // Update model only if one was explicitly selected during edit
        })
      } else {
        updateScenario(editingCharacterId, {
          name: formData.name || 'Obstáculo',
          scale,
          rotationY: parseInt(formData.rotationY) || 0,
          blocksMovement: formData.blocksMovement,
          ...(modelUrl ? { modelUrl, modelFileName } : {})
        })
      }
    } else if (importType === 'character') {
      addCharacter({
        name: formData.name || 'Guerreiro',
        modelUrl,
        modelFileName,
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
        spells: characterSpells,
      })
    } else {
      addScenario({
        name: formData.name || 'Obstáculo',
        modelUrl,
        scale,
        rotationY: parseInt(formData.rotationY) || 0,
        blocksMovement: formData.blocksMovement,
      })
    }

    // Reset
    setModelData(null)
    setSelectedCatalogChar(null)
    setFormData({
      name: '', team: 'A', hp: 100, attack: 15, defense: 8,
      speed: 5, range: 1, moveRange: 4, scaleX: 1, scaleY: 1, scaleZ: 1, rotationY: 0, blocksMovement: true,
    })
    setError('')
    toggleImportModal()
  }

  const handleClose = () => {
    setModelData(null)
    setSelectedCatalogChar(null)
    setError('')
    toggleImportModal()
  }

  const hasModel = selectedCatalogChar || modelData

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: hasModel ? '80vw' : 500, width: hasModel ? '80vw' : '95vw', transition: 'all 0.3s' }}>
        <div className="modal-header">
          <h2>
            {editingCharacterId ? '✏️ Editar Personagem' : (importType === 'character' ? '⚔️ Importar Personagem' : '🏰 Importar Cenário')}
          </h2>
          <button className="modal-close" onClick={handleClose}>✕</button>
        </div>

        <div className="modal-body" style={{ display: 'flex', gap: 20, flexDirection: hasModel ? 'row' : 'column' }}>
          
          <div style={{ flex: 1 }}>

          {/* ===== TABS (Both Character and Scenario) ===== */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <button
              onClick={() => setActiveTab('catalog')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeTab === 'catalog' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'catalog' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              }}
            >
              📚 Catálogo
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activeTab === 'upload' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                color: activeTab === 'upload' ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
              }}
            >
              📂 Arquivo GLB
            </button>
          </div>

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {(importType === 'character' ? CHARACTER_CATALOG : SCENARIO_CATALOG).map(item => {
                const isSelected = selectedCatalogChar?.id === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalog(item)}
                    style={{
                      padding: '14px 12px',
                      borderRadius: 10,
                      border: isSelected ? '2px solid var(--accent-purple)' : '1px solid rgba(255,255,255,0.08)',
                      background: isSelected ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex', flexDirection: 'column', gap: 4,
                    }}
                  >
                    <div style={{ fontSize: 28, textAlign: 'center' }}>{item.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: isSelected ? 'var(--accent-purple)' : 'var(--text-primary)', textAlign: 'center' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 4 }}>
                      {item.description}
                    </div>
                    {importType === 'character' && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, fontSize: 11 }}>
                        <span style={{ color: '#f87171' }}>❤️ {item.hp}</span>
                        <span style={{ color: '#fb923c' }}>⚔️ {item.attack}</span>
                        <span style={{ color: '#60a5fa' }}>🛡️ {item.defense}</span>
                        <span style={{ color: '#4ade80' }}>💨 {item.speed}</span>
                        <span style={{ color: '#c084fc' }}>🎯 {item.range}</span>
                        <span style={{ color: '#facc15' }}>🏃 {item.moveRange}</span>
                      </div>
                    )}
                    {isSelected && (
                      <div style={{ fontSize: 11, color: 'var(--accent-purple)', textAlign: 'center', marginTop: 4, fontWeight: 600 }}>
                        ✓ Selecionado
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <>
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
                    : 'Formatos aceitos: .glb, .gltf'
                  }
                </div>
              </div>
              {error && (
                <div style={{ color: 'var(--accent-red)', fontSize: 13, marginBottom: 16 }}>
                  ⚠️ {error}
                </div>
              )}
            </>
          )}

          {/* Placement hint */}
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
            📍 Após criar, clique no tabuleiro para posicionar
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
              <input className="form-input" type="number" step="0.1" min="0.1" max="20"
                placeholder="X" value={formData.scaleX}
                onChange={e => handleInputChange('scaleX', e.target.value)} title="Largura (X)" />
              <input className="form-input" type="number" step="0.1" min="0.1" max="20"
                placeholder="Y" value={formData.scaleY}
                onChange={e => handleInputChange('scaleY', e.target.value)} title="Altura (Y)" />
              <input className="form-input" type="number" step="0.1" min="0.1" max="20"
                placeholder="Z" value={formData.scaleZ}
                onChange={e => handleInputChange('scaleZ', e.target.value)} title="Profundidade (Z)" />
              <input className="form-input" type="number" step="15" min="-360" max="360"
                placeholder="Rot" value={formData.rotationY}
                onChange={e => handleInputChange('rotationY', e.target.value)}
                title="Rotação (Graus)"
                style={{ borderLeft: '2px solid rgba(124, 58, 237, 0.5)' }} />
            </div>
          </div>

          {/* Character-specific fields */}
          {importType === 'character' && (
            <>
              <div className="form-group">
                <label className="form-label">Time</label>
                <select className="form-select" value={formData.team} onChange={e => handleInputChange('team', e.target.value)}>
                  <option value="A">🔵 Time A (Azul)</option>
                  <option value="B">🔴 Time B (Vermelho)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">❤️ HP</label>
                  <input className="form-input" type="number" min="1" value={formData.hp}
                    onChange={e => handleInputChange('hp', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">⚔️ Ataque</label>
                  <input className="form-input" type="number" min="0" value={formData.attack}
                    onChange={e => handleInputChange('attack', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🛡️ Defesa</label>
                  <input className="form-input" type="number" min="0" value={formData.defense}
                    onChange={e => handleInputChange('defense', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">💨 Velocidade</label>
                  <input className="form-input" type="number" min="1" value={formData.speed}
                    onChange={e => handleInputChange('speed', e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">🎯 Alcance Ataque</label>
                  <input className="form-input" type="number" min="1" value={formData.range}
                    onChange={e => handleInputChange('range', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">🏃 Alcance Movimento</label>
                  <input className="form-input" type="number" min="1" value={formData.moveRange}
                    onChange={e => handleInputChange('moveRange', e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* D&D 5e Spells Section */}
          {importType === 'character' && (
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
              <label className="form-label" style={{ color: 'var(--accent-purple)', fontSize: 12, marginBottom: 8, display: 'block' }}>
                🪄 Magias (D&D 5e)
              </label>
              
              {/* Active Spells list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                {characterSpells.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', padding: '4px 0' }}>
                    Nenhuma magia adicionada.
                  </div>
                ) : (
                  characterSpells.map((spell, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(124, 58, 237, 0.08)', border: '1px solid rgba(124, 58, 237, 0.2)',
                      padding: '6px 12px', borderRadius: 6, fontSize: 12
                    }}>
                      <div>
                        <strong>{spell.name}</strong> <span style={{ opacity: 0.7 }}>({spell.damageFormula || 'Suporte'} | 🎯 {spell.rangeCells}c {spell.aoeRadius > 0 ? `| 💥 R${spell.aoeRadius}` : ''})</span>
                      </div>
                      <button className="btn-icon" style={{ width: 20, height: 20, fontSize: 10, minWidth: 20 }}
                        onClick={(e) => { e.preventDefault(); setCharacterSpells(prev => prev.filter((_, idx) => idx !== i)) }}>
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* API spell picker */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <select
                  className="form-select"
                  style={{ flex: 1, fontSize: 13, height: 38 }}
                  value={selectedSpellIndex}
                  onChange={(e) => handleSpellSelect(e.target.value)}
                  disabled={isLoadingSpells}
                >
                  <option value="">{isLoadingSpells ? 'Carregando magias...' : '-- Escolha uma Magia --'}</option>
                  {dndSpellsList.map(spell => (
                    <option key={spell.index} value={spell.index}>{spell.name}</option>
                  ))}
                </select>
                
                <button
                  className="btn btn-secondary"
                  style={{ padding: '0 12px', fontSize: 12, height: 38 }}
                  onClick={(e) => { e.preventDefault(); handleAddSpell(); }}
                  disabled={!selectedSpellDetails}
                >
                  + Adicionar
                </button>
              </div>

              {selectedSpellDetails && (
                <div style={{
                  fontSize: 11, background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)',
                  padding: 10, borderRadius: 6, color: 'var(--text-secondary)', lineHeight: 1.4
                }}>
                  <div style={{ marginBottom: 4, color: 'var(--text-primary)' }}>
                    <strong>{selectedSpellDetails.name}</strong> (Nível {selectedSpellDetails.level})
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 6, color: 'var(--accent-gold)' }}>
                    <span>🎯 Alcance: {selectedSpellDetails.range} ({selectedSpellDetails.rangeCells} cél.)</span>
                    {selectedSpellDetails.damageFormula && <span>🎲 Rolo: {selectedSpellDetails.damageFormula}</span>}
                    {selectedSpellDetails.aoeRadius > 0 && <span>💥 AoE: {selectedSpellDetails.aoeRadius} cél.</span>}
                  </div>
                  <p style={{ margin: 0, opacity: 0.8, maxHeight: 80, overflowY: 'auto' }}>
                    {selectedSpellDetails.desc}
                  </p>
                </div>
              )}
            </div>
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
          
          {/* ===== 3D SHOWCASE VITRINE ===== */}
          {hasModel && (
            <div style={{
              flex: 1,
              minWidth: 350,
              background: 'radial-gradient(circle at center, rgba(124, 58, 237, 0.15) 0%, rgba(0,0,0,0.3) 100%)',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.05)',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{ position: 'absolute', top: 12, left: 16, zIndex: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                🔍 Vitrine de Inspeção
              </div>
              <Canvas camera={{ position: [2, 2, 2], fov: 45 }}>
                <ambientLight intensity={1.5} />
                <directionalLight position={[5, 10, 5]} intensity={2} />
                <pointLight position={[-5, 5, -5]} intensity={1} color="#7c3aed" />
                <Suspense fallback={null}>
                  <Stage environment="city" intensity={0.5} adjustCamera={false}>
                    <ModelPreview 
                      url={selectedCatalogChar ? selectedCatalogChar.modelUrl : modelData?.url} 
                      scale={[parseFloat(formData.scaleX) || 1, parseFloat(formData.scaleY) || 1, parseFloat(formData.scaleZ) || 1]} 
                      rotationY={parseFloat(formData.rotationY) || 0}
                    />
                  </Stage>
                </Suspense>
                <OrbitControls autoRotate autoRotateSpeed={2} enablePan={false} />
              </Canvas>

              {/* Controles de rotação na vitrine */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                right: 12,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(0, 0, 0, 0.75)',
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(5px)'
              }}>
                <button
                  type="button"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, rotationY: ((parseInt(prev.rotationY) || 0) - 45) }))}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  ↩ -45°
                </button>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="15"
                  value={formData.rotationY || 0}
                  onChange={e => handleInputChange('rotationY', e.target.value)}
                  style={{ flex: 1, accentColor: '#7c3aed', height: 4, cursor: 'pointer' }}
                />
                <button
                  type="button"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, rotationY: ((parseInt(prev.rotationY) || 0) + 45) }))}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                >
                  +45° ↪
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancelar
          </button>
          <button
            className="btn btn-gold"
            onClick={handleSubmit}
            disabled={!hasModel && !editingCharacterId}
            style={{ opacity: (!hasModel && !editingCharacterId) ? 0.5 : 1 }}
          >
            {editingCharacterId ? '💾 Salvar Alterações' : (importType === 'character' ? '⚔️ Criar e Posicionar' : '🏰 Add. e Posicionar')}
          </button>
        </div>
      </div>
    </div>
  )
}
