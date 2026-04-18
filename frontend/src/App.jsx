import React from 'react'
import GameScene from './components/Scene/GameScene'
import HUD from './components/UI/HUD'
import Sidebar from './components/UI/Sidebar'
import ActionBar from './components/UI/ActionBar'
import CharacterPanel from './components/UI/CharacterPanel'
import CombatLog from './components/UI/CombatLog'
import ImportModal from './components/UI/ImportModal'
import GameOver from './components/UI/GameOver'

export default function App() {
  return (
    <div className="app-container">
      <div className="game-area">
        {/* 3D Canvas */}
        <div className="canvas-wrapper">
          <GameScene />

          {/* UI Overlays */}
          <HUD />
          <CharacterPanel />
          <ActionBar />
          <CombatLog />
        </div>

        {/* Sidebar */}
        <Sidebar />
      </div>

      {/* Modals */}
      <ImportModal />
      <GameOver />
    </div>
  )
}
