import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // === Characters ===
  characters: [],
  selectedCharacterId: null,
  selectedScenarioId: null,

  // === Turn System ===
  turnOrder: [],
  currentTurnIndex: 0,
  round: 1,
  phase: 'setup', // 'setup' | 'move' | 'action' | 'end'
  gameState: 'setup', // 'setup' | 'playing' | 'gameover'
  winner: null,

  // === Scenarios ===
  scenarios: [],
  blockedCells: new Set(),

  // === UI State ===
  highlightedCells: [],
  actionMode: null, // null | 'move' | 'attack'
  showImportModal: false,
  importType: 'character', // 'character' | 'scenario'
  editingCharacterId: null, // ID of the character being edited (if any)
  combatLog: [],
  placementMode: null, // null | 'character' | 'scenario'
  placementId: null, // ID of the character or scenario being placed
  boardTheme: 'dungeon', // 'dungeon' | 'grass' | 'stone' | 'sand' | 'ice' | 'lava'
  setBoardTheme: (theme) => set({ boardTheme: theme }),
  contextMenu: null, // { x, y, targetType, targetId } | null
  setContextMenu: (menu) => set({ contextMenu: menu }),
  selectedSpell: null, // null | spell object
  setSelectedSpell: (spell) => set({ selectedSpell: spell }),

  // === Actions: Characters ===
  addCharacter: (character) => {
    const id = `char_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const newChar = {
      id,
      name: character.name || 'Guerreiro',
      modelUrl: character.modelUrl,
      modelFileName: character.modelFileName || '',
      team: character.team || 'A',
      gridX: -1, // pending placement
      gridZ: -1, // pending placement
      hp: character.hp ?? 100,
      maxHp: character.maxHp ?? 100,
      attack: character.attack ?? 15,
      defense: character.defense ?? 8,
      speed: character.speed ?? 5,
      range: character.range ?? 1,
      moveRange: character.moveRange ?? 4,
      alive: true,
      hasMoved: false,
      hasActed: false,
      hasActed: false,
      animationName: 'idle',
      scale: character.scale ?? [1, 1, 1],
      rotationY: character.rotationY ?? 0,
      spells: character.spells || [],
    }
    set((state) => ({
      characters: [...state.characters, newChar],
      placementMode: 'character',
      placementId: id,
    }))
  },

  placeObject: (gridX, gridZ) => set((state) => {
    if (state.placementMode === 'character') {
      return {
        characters: state.characters.map(c =>
          c.id === state.placementId ? { ...c, gridX, gridZ } : c
        ),
        placementMode: null,
        placementId: null,
      }
    } else if (state.placementMode === 'scenario') {
      const targetScn = state.scenarios.find(s => s.id === state.placementId)
      const newBlocked = new Set(state.blockedCells)
      if (targetScn?.blocksMovement) {
        const sizeX = Math.max(1, Math.round(targetScn.scale?.[0] || 1))
        const sizeZ = Math.max(1, Math.round(targetScn.scale?.[2] || 1))
        for (let dx = 0; dx < sizeX; dx++) {
          for (let dz = 0; dz < sizeZ; dz++) {
            newBlocked.add(`${gridX + dx},${gridZ + dz}`)
          }
        }
      }
      return {
        scenarios: state.scenarios.map(s =>
          s.id === state.placementId ? { ...s, gridX, gridZ } : s
        ),
        blockedCells: newBlocked,
        placementMode: null,
        placementId: null,
      }
    }
    return state
  }),

  cancelPlacement: () => set((state) => {
    if (state.placementMode === 'character') {
      return {
        characters: state.characters.filter(c => c.id !== state.placementId),
        placementMode: null,
        placementId: null,
      }
    } else if (state.placementMode === 'scenario') {
      return {
        scenarios: state.scenarios.filter(s => s.id !== state.placementId),
        placementMode: null,
        placementId: null,
      }
    }
    return state
  }),

  hoverPlacement: (gridX, gridZ) => set((state) => {
    if (!state.placementId || !state.placementMode) return {}
    if (state.placementMode === 'character') {
      return {
        characters: state.characters.map(c =>
          c.id === state.placementId ? { ...c, gridX, gridZ } : c
        )
      }
    } else if (state.placementMode === 'scenario') {
      return {
        scenarios: state.scenarios.map(s =>
          s.id === state.placementId ? { ...s, gridX, gridZ } : s
        )
      }
    }
    return {}
  }),

  duplicateObject: (type, id) => set((state) => {
    const newId = `${type === 'character' ? 'char' : 'scn'}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    
    if (type === 'character') {
      const original = state.characters.find(c => c.id === id)
      if (!original) return {}
      const clone = {
        ...original,
        id: newId,
        name: `${original.name} (Cópia)`,
        gridX: -1,
        gridZ: -1,
        alive: true,
        hasMoved: false,
        hasActed: false,
        isAttacking: false,
      }
      return {
        characters: [...state.characters, clone],
        placementMode: 'character',
        placementId: newId,
        selectedCharacterId: null,
        selectedScenarioId: null,
      }
    } else if (type === 'scenario') {
      const original = state.scenarios.find(s => s.id === id)
      if (!original) return {}
      const clone = {
        ...original,
        id: newId,
        name: `${original.name} (Cópia)`,
        gridX: -1,
        gridZ: -1,
      }
      return {
        scenarios: [...state.scenarios, clone],
        placementMode: 'scenario',
        placementId: newId,
        selectedCharacterId: null,
        selectedScenarioId: null,
      }
    }
    return {}
  }),

  removeCharacter: (id) => set((state) => ({
    characters: state.characters.filter(c => c.id !== id),
    selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
    placementId: state.placementId === id ? null : state.placementId,
  })),

  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c),
  })),

  selectCharacter: (id) => set({ selectedCharacterId: id, selectedScenarioId: null, highlightedCells: [], actionMode: null, selectedSpell: null }),

  getSelectedCharacter: () => {
    const state = get()
    return state.characters.find(c => c.id === state.selectedCharacterId) || null
  },

  getCurrentTurnCharacter: () => {
    const state = get()
    if (state.turnOrder.length === 0) return null
    return state.characters.find(c => c.id === state.turnOrder[state.currentTurnIndex]) || null
  },

  // === Actions: Scenarios ===
  addScenario: (scenario) => set((state) => {
    const id = `scn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const newScenario = {
      id,
      name: scenario.name || 'Obstáculo',
      modelUrl: scenario.modelUrl,
      gridX: -1, // pending placement
      gridZ: -1, // pending placement
      scale: scenario.scale ?? [1, 1, 1],
      rotationY: scenario.rotationY ?? 0,
      blocksMovement: scenario.blocksMovement ?? true,
    }
    return { 
      scenarios: [...state.scenarios, newScenario],
      placementMode: 'scenario',
      placementId: id,
    }
  }),

  removeScenario: (id) => set((state) => {
    const scn = state.scenarios.find(s => s.id === id)
    const newBlocked = new Set(state.blockedCells)
    if (scn) {
      const sizeX = Math.max(1, Math.round(scn.scale?.[0] || 1))
      const sizeZ = Math.max(1, Math.round(scn.scale?.[2] || 1))
      for (let dx = 0; dx < sizeX; dx++) {
        for (let dz = 0; dz < sizeZ; dz++) {
          newBlocked.delete(`${scn.gridX + dx},${scn.gridZ + dz}`)
        }
      }
    }
    return {
      scenarios: state.scenarios.filter(s => s.id !== id),
      blockedCells: newBlocked,
      selectedScenarioId: state.selectedScenarioId === id ? null : state.selectedScenarioId,
    }
  }),

  selectScenario: (id) => set({ selectedScenarioId: id, selectedCharacterId: null, highlightedCells: [], actionMode: null }),

  updateScenario: (id, updates) => set((state) => {
    const original = state.scenarios.find(s => s.id === id)
    if (!original) return {}

    const newBlocked = new Set(state.blockedCells)
    
    // If blocksMovement status, position, or scale changes, recalculate blocked cells
    if (updates.gridX !== undefined || updates.gridZ !== undefined || updates.blocksMovement !== undefined || updates.scale !== undefined) {
      if (original.blocksMovement) {
        const sizeX = Math.max(1, Math.round(original.scale?.[0] || 1))
        const sizeZ = Math.max(1, Math.round(original.scale?.[2] || 1))
        for (let dx = 0; dx < sizeX; dx++) {
          for (let dz = 0; dz < sizeZ; dz++) {
            newBlocked.delete(`${original.gridX + dx},${original.gridZ + dz}`)
          }
        }
      }
      
      const nextX = updates.gridX !== undefined ? updates.gridX : original.gridX
      const nextZ = updates.gridZ !== undefined ? updates.gridZ : original.gridZ
      const nextBlocks = updates.blocksMovement !== undefined ? updates.blocksMovement : original.blocksMovement
      const nextScale = updates.scale !== undefined ? updates.scale : original.scale
      
      if (nextBlocks && nextX >= 0 && nextZ >= 0) {
        const sizeX = Math.max(1, Math.round(nextScale?.[0] || 1))
        const sizeZ = Math.max(1, Math.round(nextScale?.[2] || 1))
        for (let dx = 0; dx < sizeX; dx++) {
          for (let dz = 0; dz < sizeZ; dz++) {
            newBlocked.add(`${nextX + dx},${nextZ + dz}`)
          }
        }
      }
    }

    return {
      scenarios: state.scenarios.map(s => s.id === id ? { ...s, ...updates } : s),
      blockedCells: newBlocked
    }
  }),

  // === Actions: Turn System ===
  startGame: () => {
    const state = get()
    // Only count placed characters (gridX >= 0)
    const placedChars = state.characters.filter(c => c.gridX >= 0 && c.gridZ >= 0)
    if (placedChars.length < 2) return
    if (state.placementCharId) return // Can't start while placing

    const sorted = [...placedChars]
      .filter(c => c.alive)
      .sort((a, b) => b.speed - a.speed)
    const order = sorted.map(c => c.id)

    // Reset all placed characters
    const resetChars = state.characters.map(c => ({
      ...c, hasMoved: false, hasActed: false
    }))

    set({
      turnOrder: order,
      currentTurnIndex: 0,
      round: 1,
      phase: 'move',
      gameState: 'playing',
      characters: resetChars,
      selectedCharacterId: order[0],
      combatLog: [{ text: '⚔️ Batalha iniciada!', type: 'system' }],
      actionMode: null,
      highlightedCells: [],
    })
  },

  nextTurn: () => {
    const state = get()
    let nextIndex = state.currentTurnIndex + 1
    let nextRound = state.round

    // Skip dead characters
    while (nextIndex < state.turnOrder.length) {
      const char = state.characters.find(c => c.id === state.turnOrder[nextIndex])
      if (char && char.alive) break
      nextIndex++
    }

    if (nextIndex >= state.turnOrder.length) {
      // New round
      nextRound++
      const aliveOrder = state.turnOrder.filter(id => {
        const c = state.characters.find(ch => ch.id === id)
        return c && c.alive
      })
      if (aliveOrder.length === 0) return
      nextIndex = 0

      // Reset movement/action flags
      const resetChars = state.characters.map(c => ({
        ...c, hasMoved: false, hasActed: false
      }))

      set({
        characters: resetChars,
        currentTurnIndex: 0,
        round: nextRound,
        phase: 'move',
        turnOrder: aliveOrder,
        selectedCharacterId: aliveOrder[0],
        actionMode: null,
        highlightedCells: [],
        combatLog: [...state.combatLog, { text: `📜 Rodada ${nextRound}`, type: 'system' }],
      })
    } else {
      const nextCharId = state.turnOrder[nextIndex]
      set({
        currentTurnIndex: nextIndex,
        phase: 'move',
        selectedCharacterId: nextCharId,
        actionMode: null,
        highlightedCells: [],
      })
    }

    // Check victory
    setTimeout(() => get().checkVictory(), 50)
  },

  endTurn: () => {
    const state = get()
    const current = state.getCurrentTurnCharacter()
    if (current) {
      get().updateCharacter(current.id, { hasMoved: true, hasActed: true })
    }
    get().nextTurn()
  },

  // === Actions: Movement ===
  setActionMode: (mode) => set((state) => {
    if (mode === state.actionMode) {
      return { actionMode: null, highlightedCells: [] }
    }
    return { actionMode: mode }
  }),

  setHighlightedCells: (cells) => set({ highlightedCells: cells }),

  moveCharacter: (charId, newX, newZ) => {
    const state = get()
    const char = state.characters.find(c => c.id === charId)
    if (!char) return

    get().updateCharacter(charId, {
      gridX: newX,
      gridZ: newZ,
      hasMoved: true,
    })
    set({
      actionMode: null,
      highlightedCells: [],
      phase: 'action',
      combatLog: [...get().combatLog, {
        text: `🏃 ${char.name} moveu para (${newX}, ${newZ})`,
        type: 'move'
      }],
    })
  },

  rollStatTest: (charId, statName, statVal) => {
    const char = get().characters.find(c => c.id === charId)
    if (!char) return

    const d20 = Math.floor(Math.random() * 20) + 1
    const total = d20 + statVal
    
    // Custom emojis for stats
    const emojis = {
      'Ataque': '⚔️',
      'Defesa': '🛡️',
      'Velocidade': '💨',
      'Alcance': '🎯'
    }
    const emoji = emojis[statName] || '🎲'

    const rollText = `${emoji} ${char.name} rola teste de ${statName}: Rolou ${d20} + ${statVal} = ${total}!`
    
    set({
      combatLog: [...get().combatLog, { text: rollText, type: 'action' }]
    })
  },

  // === Actions: Combat ===
  attackCharacter: (attackerId, targetId) => {
    const state = get()
    const attacker = state.characters.find(c => c.id === attackerId)
    const target = state.characters.find(c => c.id === targetId)
    if (!attacker || !target) return

    // 1. Virar atacante na direção do alvo
    const dx = target.gridX - attacker.gridX
    const dz = target.gridZ - attacker.gridZ
    const angleToTarget = Math.atan2(dx, dz) * (180 / Math.PI)
    get().updateCharacter(attackerId, { rotationY: ((angleToTarget % 360) + 360) % 360, isAttacking: true })

    // 2. Limpar highlights imediatamente
    set({ actionMode: null, highlightedCells: [] })

    // 3. Atraso para animação de ataque, depois aplica dano
    setTimeout(() => {
      const baseDamage = Math.max(1, attacker.attack - target.defense)
      const variance = Math.floor(Math.random() * 5) - 2
      const damage = Math.max(1, baseDamage + variance)
      const isCritical = Math.random() < 0.15
      const finalDamage = isCritical ? damage * 2 : damage

      const newHp = Math.max(0, target.hp - finalDamage)
      const alive = newHp > 0

      get().updateCharacter(targetId, { hp: newHp, alive })
      get().updateCharacter(attackerId, { hasActed: true, isAttacking: false })

      const logEntries = [...get().combatLog]
      if (isCritical) {
        logEntries.push({ text: `💥 CRÍTICO! ${attacker.name} causa ${finalDamage} de dano em ${target.name}!`, type: 'critical' })
      } else {
        logEntries.push({ text: `⚔️ ${attacker.name} causa ${finalDamage} de dano em ${target.name}`, type: 'attack' })
      }
      if (!alive) {
        logEntries.push({ text: `💀 ${target.name} foi derrotado!`, type: 'death' })
      }

      set({ combatLog: logEntries })
      setTimeout(() => get().checkVictory(), 100)
    }, 800) // 800ms para animação de ataque
  },

  castSpell: (casterId, targetX, targetZ, spell) => {
    const state = get()
    const caster = state.characters.find(c => c.id === casterId)
    if (!caster || !spell) return

    // 1. Virar atacante na direção do alvo
    const dx = targetX - caster.gridX
    const dz = targetZ - caster.gridZ
    const angleToTarget = Math.atan2(dx, dz) * (180 / Math.PI)
    get().updateCharacter(casterId, { rotationY: ((angleToTarget % 360) + 360) % 360, isAttacking: true })

    // 2. Limpar highlights imediatamente
    set({ actionMode: null, selectedSpell: null, highlightedCells: [] })

    // 3. Atraso para animação de conjuração, depois aplica dano/cura
    setTimeout(() => {
      const isHeal = spell.damageType?.toLowerCase() === 'healing' || 
                    spell.name?.toLowerCase().includes('heal') || 
                    spell.name?.toLowerCase().includes('cure')
      const targetRadius = spell.aoeRadius || 0

      // Helper para rolar dados (Ex: "8d6" -> rola 8 dados de 6 lados)
      const rollDice = (formula) => {
        if (!formula) return 0
        const match = formula.toLowerCase().trim().match(/^(\d+)d(\d+)$/)
        if (!match) return parseInt(formula) || 0
        const count = parseInt(match[1])
        const sides = parseInt(match[2])
        let total = 0
        for (let i = 0; i < count; i++) {
          total += Math.floor(Math.random() * sides) + 1
        }
        return total
      }

      const rollVal = rollDice(spell.damageFormula || spell.damage) || Math.floor(Math.random() * 15) + 5
      const isCritical = Math.random() < 0.15 && !isHeal
      const finalVal = isCritical ? rollVal * 2 : rollVal

      // Encontra personagens afetados na área
      const affected = state.characters.filter(c => {
        if (!c.alive) return false
        // Distância de Manhattan até o centro do alvo
        const dist = Math.abs(c.gridX - targetX) + Math.abs(c.gridZ - targetZ)
        return dist <= targetRadius
      })

      const logEntries = [...get().combatLog]
      const spellEmoji = isHeal ? '✨' : '🔮'
      
      logEntries.push({ 
        text: `${spellEmoji} ${caster.name} conjura ${spell.name} em (${targetX}, ${targetZ})!`, 
        type: 'spell' 
      })

      affected.forEach(target => {
        if (isHeal) {
          const newHp = Math.min(target.maxHp, target.hp + finalVal)
          get().updateCharacter(target.id, { hp: newHp })
          logEntries.push({ text: `💚 ${target.name} recupera ${finalVal} PV!`, type: 'heal' })
        } else {
          // Dano de magia reduzido por metade da defesa para simular save/resistência
          const reducedDamage = Math.max(1, finalVal - Math.floor(target.defense / 2))
          const newHp = Math.max(0, target.hp - reducedDamage)
          const alive = newHp > 0
          get().updateCharacter(target.id, { hp: newHp, alive })

          if (isCritical) {
            logEntries.push({ text: `💥 CRÍTICO! ${target.name} sofre ${reducedDamage} de dano!`, type: 'critical' })
          } else {
            logEntries.push({ text: `💥 ${target.name} sofre ${reducedDamage} de dano!`, type: 'damage' })
          }

          if (!alive) {
            logEntries.push({ text: `💀 ${target.name} foi derrotado!`, type: 'death' })
          }
        }
      })

      get().updateCharacter(casterId, { hasActed: true, isAttacking: false })
      set({ combatLog: logEntries })
      setTimeout(() => get().checkVictory(), 100)
    }, 800)
  },

  // === Actions: Victory Check ===
  checkVictory: () => {
    const state = get()
    const aliveTeams = new Set(
      state.characters.filter(c => c.alive).map(c => c.team)
    )
    if (aliveTeams.size <= 1 && state.gameState === 'playing') {
      const winner = aliveTeams.size === 1 ? [...aliveTeams][0] : null
      set({
        gameState: 'gameover',
        winner,
        combatLog: [...state.combatLog, {
          text: winner ? `🏆 Time ${winner} venceu!` : '🏳️ Empate!',
          type: 'system'
        }],
      })
    }
  },

  // === Actions: UI ===
  toggleImportModal: (type) => set((state) => ({
    showImportModal: !state.showImportModal,
    importType: type || state.importType,
    editingCharacterId: null, // clear on toggle
  })),

  openEditModal: (type, id) => set({
    showImportModal: true,
    importType: type,
    editingCharacterId: id,
  }),

  addCombatLog: (text, type = 'info') => set((state) => ({
    combatLog: [...state.combatLog, { text, type }],
  })),

  // === Actions: Reset ===
  resetGame: () => set({
    characters: [],
    selectedCharacterId: null,
    selectedScenarioId: null,
    turnOrder: [],
    currentTurnIndex: 0,
    round: 1,
    phase: 'setup',
    gameState: 'setup',
    winner: null,
    scenarios: [],
    blockedCells: new Set(),
    highlightedCells: [],
    actionMode: null,
    showImportModal: false,
    combatLog: [],
    placementMode: null,
    placementId: null,
    contextMenu: null,
    selectedSpell: null,
  }),

  restartBattle: () => {
    const state = get()
    const resetChars = state.characters.map(c => ({
      ...c,
      hp: c.maxHp,
      alive: true,
      hasMoved: false,
      hasActed: false,
    }))
    set({
      characters: resetChars,
      selectedCharacterId: null,
      selectedScenarioId: null,
      turnOrder: [],
      currentTurnIndex: 0,
      round: 1,
      phase: 'setup',
      gameState: 'setup',
      winner: null,
      highlightedCells: [],
      actionMode: null,
      combatLog: [],
      placementMode: null,
      placementId: null,
      contextMenu: null,
      selectedSpell: null,
    })
  },
}))

export default useGameStore
