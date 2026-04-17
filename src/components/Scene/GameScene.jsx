import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Board from '../Game/Board'
import Character from '../Game/Character'
import ScenarioObject from '../Game/ScenarioObject'
import Lighting from './Lighting'
import CameraController from './CameraController'
import useGameStore from '../../store/gameStore'

export default function GameScene() {
  const characters = useGameStore(s => s.characters)
  const scenarios = useGameStore(s => s.scenarios)

  return (
    <Canvas
      camera={{
        position: [20, 25, 20],
        fov: 50,
        near: 0.1,
        far: 200,
      }}
      shadows
      gl={{
        antialias: true,
        toneMapping: 3, // ACESFilmicToneMapping
        toneMappingExposure: 1.2,
      }}
      style={{ background: '#0a0a0f' }}
    >
      <Suspense fallback={null}>
        <CameraController />
        <Lighting />

        {/* Fog for atmosphere */}
        <fog attach="fog" args={['#0a0a1a', 30, 70]} />

        {/* Board */}
        <Board />

        {/* Characters */}
        {characters.map(char => (
          <Character key={char.id} character={char} />
        ))}

        {/* Scenario objects */}
        {scenarios.map(scn => (
          <ScenarioObject key={scn.id} scenario={scn} />
        ))}
      </Suspense>
    </Canvas>
  )
}
