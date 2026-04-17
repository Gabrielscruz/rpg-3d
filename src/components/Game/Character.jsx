import React, { useRef, useEffect, useMemo, Suspense } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import useGameStore from '../../store/gameStore'
import { gridToWorld } from '../../utils/gridUtils'

function CharacterModel({ url, scale = [1, 1, 1], animationName = 'idle', isSelected, team }) {
  const wrapperRef = useRef()
  const animGroupRef = useRef()
  const { scene, animations } = useGLTF(url)

  // Clone scene for this instance properly handling SkinnedMesh
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene])

  // Compute centering offset from bounding box (only once)
  const offset = useMemo(() => {
    const tempClone = SkeletonUtils.clone(scene)
    const box = new THREE.Box3().setFromObject(tempClone)
    const center = box.getCenter(new THREE.Vector3())
    return {
      x: -center.x,
      y: -box.min.y, // sit on ground
      z: -center.z,
    }
  }, [scene])

  // Strip root position/rotation tracks from animations to prevent them
  // from overriding the grid position (common issue with Meshy models)
  const cleanedAnimations = useMemo(() => {
    return animations.map(clip => {
      const newTracks = clip.tracks.filter(track => {
        // Remove position tracks on the root node (they cause the "snap to center" bug)
        const isRootPosition = (
          track.name.endsWith('.position') &&
          (track.name === '.position' ||
            track.name.split('.')[0] === clonedScene.name ||
            track.name.startsWith('Scene.') ||
            track.name.startsWith('Armature.position'))
        )
        return !isRootPosition
      })
      return new THREE.AnimationClip(clip.name, clip.duration, newTracks, clip.blendMode)
    })
  }, [animations, clonedScene])

  // Setup animations on the inner group (isolated from offset wrapper)
  const { actions, names } = useAnimations(cleanedAnimations, animGroupRef)

  useEffect(() => {
    if (names.length > 0) {
      const targetName = names.find(n =>
        n.toLowerCase().includes(animationName.toLowerCase())
      ) || names[0]

      Object.values(actions).forEach(a => a?.fadeOut(0.3))
      const action = actions[targetName]
      if (action) {
        action.reset().fadeIn(0.3).play()
      }
    }
  }, [animationName, actions, names])

  // Selection hover effect (only on the wrapper, not affected by animations)
  useFrame((state) => {
    if (wrapperRef.current) {
      if (isSelected) {
        const t = state.clock.elapsedTime
        wrapperRef.current.position.y = offset.y + Math.sin(t * 2) * 0.05 + 0.05
      } else {
        wrapperRef.current.position.y = offset.y
      }
    }
  })

  return (
    // Outer wrapper applies the centering offset — animations cannot touch this
    <group ref={wrapperRef} position={[offset.x, offset.y, offset.z]}>
      {/* Inner group is the animation target — animations only affect this subtree */}
      <group ref={animGroupRef}>
        <primitive object={clonedScene} scale={scale} />
      </group>
    </group>
  )
}

function FallbackCharacter({ team, isSelected }) {
  const ref = useRef()

  useFrame((state) => {
    if (ref.current) {
      if (isSelected) {
        ref.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.4
      } else {
        ref.current.position.y = 0.4
      }
    }
  })

  const color = team === 'A' ? '#3b82f6' : '#ef4444'

  return (
    <group ref={ref} position={[0, 0.4, 0]}>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.15, 0.35, 8, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.35, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Indicator ring */}
      <mesh position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.28, 32]} />
        <meshBasicMaterial color={isSelected ? '#fbbf24' : color} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

export default function Character({ character }) {
  const selectCharacter = useGameStore(s => s.selectCharacter)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const isSelected = selectedCharacterId === character.id

  const worldPos = useMemo(() => gridToWorld(character.gridX, character.gridZ), [character.gridX, character.gridZ])

  if (!character.alive) return null

  // Don't render characters that are pending placement
  if (character.gridX < 0 || character.gridZ < 0) return null

  return (
    <group
      position={[worldPos.x, 0, worldPos.z]}
      onClick={(e) => {
        e.stopPropagation()
        selectCharacter(character.id)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
    >
      <Suspense fallback={<FallbackCharacter team={character.team} isSelected={isSelected} />}>
        {character.modelUrl ? (
          <CharacterModel
            url={character.modelUrl}
            scale={character.scale}
            animationName={character.animationName}
            isSelected={isSelected}
            team={character.team}
          />
        ) : (
          <FallbackCharacter team={character.team} isSelected={isSelected} />
        )}
      </Suspense>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.42, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}

      {/* HP bar floating above character */}
      <sprite position={[0, 2.2, 0]} scale={[0.8, 0.08, 1]}>
        <spriteMaterial color="#333" transparent opacity={0.6} />
      </sprite>
      <sprite
        position={[(character.hp / character.maxHp - 1) * 0.4, 2.2, 0]}
        scale={[(character.hp / character.maxHp) * 0.78, 0.06, 1]}
      >
        <spriteMaterial
          color={character.hp > character.maxHp * 0.5 ? '#22c55e' : character.hp > character.maxHp * 0.25 ? '#f59e0b' : '#ef4444'}
        />
      </sprite>
    </group>
  )
}
