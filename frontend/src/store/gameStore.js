import { create } from 'zustand'

const useGameStore = create((set, get) => ({
  // === Characters ===
  characters: [],
  selectedCharacterId: null,

  // === Turn System ===
  turnOrder: [],
  currentTurnIndex: 0,
  round: 1,
  phase: 'setup', // 'setup' | 'move' | 'action' | 'end'
  gameState: 'setup', // 'menuInformation' | 'setup' | 'playing' | 'gameover'
  winner: null,

  // === Scenarios ===
  scenarios: [],
  blockedCells: new Set(),

  // === UI State ===
  highlightedCells: [],
  actionMode: null, // null | 'move' | 'attack'
  showImportModal: false,
  importType: 'character', // 'character' | 'scenario'
  combatLog: [],
  placementMode: null, // null | 'character' | 'scenario'
  placementId: null, // ID of the character or scenario being placed
  showMusicPanel: false,
  isMusicPanelMinimized: false,
  musicPlayer: {
    title: '',
    subtitle: '',
    youtubeVideoId: '',
  },

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
        newBlocked.add(`${gridX},${gridZ}`)
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

  removeCharacter: (id) => set((state) => ({
    characters: state.characters.filter(c => c.id !== id),
    selectedCharacterId: state.selectedCharacterId === id ? null : state.selectedCharacterId,
    placementId: state.placementId === id ? null : state.placementId,
  })),

  updateCharacter: (id, updates) => set((state) => ({
    characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c),
  })),

  selectCharacter: (id) => set({ selectedCharacterId: id, highlightedCells: [], actionMode: null }),

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
    if (scn) newBlocked.delete(`${scn.gridX},${scn.gridZ}`)
    return {
      scenarios: state.scenarios.filter(s => s.id !== id),
      blockedCells: newBlocked,
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

  // === Actions: Combat ===
  attackCharacter: (attackerId, targetId) => {
    const state = get()
    const attacker = state.characters.find(c => c.id === attackerId)
    const target = state.characters.find(c => c.id === targetId)
    if (!attacker || !target) return

    const baseDamage = Math.max(1, attacker.attack - target.defense)
    const variance = Math.floor(Math.random() * 5) - 2
    const damage = Math.max(1, baseDamage + variance)
    const isCritical = Math.random() < 0.15
    const finalDamage = isCritical ? damage * 2 : damage

    const newHp = Math.max(0, target.hp - finalDamage)
    const alive = newHp > 0

    get().updateCharacter(targetId, { hp: newHp, alive })
    get().updateCharacter(attackerId, { hasActed: true })

    const logEntries = [...state.combatLog]
    if (isCritical) {
      logEntries.push({ text: `💥 CRÍTICO! ${attacker.name} causa ${finalDamage} de dano em ${target.name}!`, type: 'critical' })
    } else {
      logEntries.push({ text: `⚔️ ${attacker.name} causa ${finalDamage} de dano em ${target.name}`, type: 'attack' })
    }
    if (!alive) {
      logEntries.push({ text: `💀 ${target.name} foi derrotado!`, type: 'death' })
    }

    set({
      combatLog: logEntries,
      actionMode: null,
      highlightedCells: [],
    })

    setTimeout(() => get().checkVictory(), 100)
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
  })),

  addCombatLog: (text, type = 'info') => set((state) => ({
    combatLog: [...state.combatLog, { text, type }],
  })),

  setGameState: (gameState) => set({ gameState }),

  toggleMusicPanel: () => set((state) => {
    if (!state.showMusicPanel) {
      return {
        showMusicPanel: true,
        isMusicPanelMinimized: false,
      }
    }

    if (state.isMusicPanelMinimized) {
      return {
        showMusicPanel: true,
        isMusicPanelMinimized: false,
      }
    }

    return {
      showMusicPanel: true,
      isMusicPanelMinimized: true,
    }
  }),

  minimizeMusicPanel: () => set((state) => ({
    showMusicPanel: state.showMusicPanel,
    isMusicPanelMinimized: true,
  })),

  expandMusicPanel: () => set((state) => ({
    showMusicPanel: true,
    isMusicPanelMinimized: false,
  })),

  closeMusicPanel: () => set({
    showMusicPanel: false,
    isMusicPanelMinimized: false,
  }),

  setMusicPlayerConfig: (updates) => set((state) => ({
    musicPlayer: {
      ...state.musicPlayer,
      ...updates,
    },
  })),

  // === Actions: Reset ===
  resetGame: () => set({
    characters: [],
    selectedCharacterId: null,
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
    showMusicPanel: false,
    isMusicPanelMinimized: false,
    musicPlayer: {
      title: '',
      subtitle: '',
      youtubeVideoId: '',
    },
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
      showMusicPanel: false,
      isMusicPanelMinimized: false,
      musicPlayer: {
        title: '',
        subtitle: '',
        youtubeVideoId: '',
      },
    })
  },

  // === Actions: Buttons From Menu ===


}))

export default useGameStore
