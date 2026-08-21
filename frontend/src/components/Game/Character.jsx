import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import useGameStore from '../../store/gameStore'
import { gridToWorld } from '../../utils/gridUtils'
import { registerCharacterPosition, unregisterCharacterPosition, updateCharacterFacing } from '../../utils/characterRegistry'

function CharacterModel({ url, scale = [1, 1, 1], animationName = 'idle', isMoving, isAttacking, isSelected, team }) {
  const wrapperRef  = useRef()
  const animGroupRef = useRef()
  const { scene, animations } = useGLTF(url)

  // Clone scene ONCE — SkeletonUtils.clone handles SkinnedMesh/Skeleton correctly
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)

    // KayKit models have ALL alternate equipment meshes visible simultaneously.
    // We hide the extras, keeping only the default loadout for each character.
    const filename = url.split('/').pop()?.toLowerCase() ?? ''
    const HIDDEN_NODES = {
      'knight.glb':    ['1H_Sword_Offhand','Badge_Shield','Rectangle_Shield','Round_Shield','Spike_Shield','2H_Sword'],
      'barbarian.glb': ['1H_Axe_Offhand','Barbarian_Round_Shield','2H_Axe','Mug'],
      'mage.glb':      ['Spellbook','Spellbook_open','1H_Wand'],
      'rogue.glb':     ['Knife_Offhand','1H_Crossbow','2H_Crossbow','Throwable'],
    }
    const toHide = new Set(HIDDEN_NODES[filename] ?? [])
    if (toHide.size > 0) {
      clone.traverse((obj) => {
        if (toHide.has(obj.name)) {
          obj.visible = false
        }
      })
    }

    // Compute bounding box ON THE SAME CLONE (avoids creating a second clone)
    const box = new THREE.Box3().setFromObject(clone)
    clone.userData._offsetY = -box.min.y
    clone.userData._offsetX = -box.getCenter(new THREE.Vector3()).x
    clone.userData._offsetZ = -box.getCenter(new THREE.Vector3()).z
    return clone
  }, [scene, url])

  // Cleanup: dispose geometries and materials when component unmounts
  useEffect(() => {
    return () => {
      clonedScene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose())
          else obj.material.dispose()
        }
      })
    }
  }, [clonedScene])

  const offsetX = clonedScene.userData._offsetX ?? 0
  const offsetY = clonedScene.userData._offsetY ?? 0
  const offsetZ = clonedScene.userData._offsetZ ?? 0

  // Strip root-level position animation tracks (prevent snap-to-origin bug)
  const cleanedAnimations = useMemo(() => {
    return animations.map(clip => {
      const newTracks = clip.tracks.filter(track => {
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
  }, [animations, clonedScene.name])

  // Bind animations to the inner group (isolated from the centering wrapper)
  const { actions, names } = useAnimations(cleanedAnimations, animGroupRef)

  useEffect(() => {
    if (names.length === 0) return
    let targetName = animationName

    if (isAttacking) {
      // Procura animação de ataque: attack, slash, swing, chop, cast, shoot
      const atkAnim = names.find(n => {
        const low = n.toLowerCase()
        return low.includes('attack') || low.includes('slash') || low.includes('swing')
          || low.includes('chop') || low.includes('cast') || low.includes('shoot')
          || low.includes('melee') || low.includes('1h_') || low.includes('2h_')
      })
      if (atkAnim) targetName = atkAnim
    } else if (isMoving) {
      const walkAnim = names.find(n => n.toLowerCase().includes('walk') || n.toLowerCase().includes('run'))
      if (walkAnim) targetName = walkAnim
    }

    const finalName = names.find(n =>
      n.toLowerCase().includes(targetName.toLowerCase())
    ) || names[0]

    Object.values(actions).forEach(a => a?.fadeOut(0.3))
    const action = actions[finalName]
    if (action) {
      if (isAttacking) {
        // Ataque: toca uma vez, não repete em loop
        action.reset().setLoop(THREE.LoopOnce, 1).clampWhenFinished = true
        action.fadeIn(0.15).play()
      } else {
        action.reset().setLoop(THREE.LoopRepeat).fadeIn(0.3).play()
      }
    }
  }, [animationName, isMoving, isAttacking, actions, names])

  // Bobbing effect when selected — applied to wrapper Y only
  useFrame((state) => {
    if (!wrapperRef.current) return
    const bob = isSelected ? Math.sin(state.clock.elapsedTime * 2) * 0.05 + 0.05 : 0
    wrapperRef.current.position.y = offsetY + bob
  })

  return (
    // Wrapper: centers model and keeps it grounded
    <group ref={wrapperRef} position={[offsetX, offsetY, offsetZ]}>
      {/* Animation target group — R3F's useAnimations binds here */}
      <group ref={animGroupRef}>
        <primitive object={clonedScene} scale={scale} />
      </group>
    </group>
  )
}

function FallbackCharacter({ team, isSelected, scale = [1, 1, 1] }) {
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
    <group ref={ref} position={[0, 0.4, 0]} scale={scale}>
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
  const groupRef = useRef()
  const [isMoving, setIsMoving] = useState(false)
  const selectCharacter = useGameStore(s => s.selectCharacter)
  const selectedCharacterId = useGameStore(s => s.selectedCharacterId)
  const setContextMenu = useGameStore(s => s.setContextMenu)
  const placementId = useGameStore(s => s.placementId)
  const gameState = useGameStore(s => s.gameState)
  const actionMode = useGameStore(s => s.actionMode)
  const highlightedCells = useGameStore(s => s.highlightedCells)
  const isSelected = selectedCharacterId === character.id
  const isBeingPlaced = placementId === character.id

  const sizeX = Math.max(1, Math.round(character.scale?.[0] || 1))
  const sizeZ = Math.max(1, Math.round(character.scale?.[2] || 1))

  const worldPos = useMemo(() => {
    const gridXCenter = Math.max(0, character.gridX) + (sizeX - 1) / 2
    const gridZCenter = Math.max(0, character.gridZ) + (sizeZ - 1) / 2
    return gridToWorld(gridXCenter, gridZCenter)
  }, [character.gridX, character.gridZ, sizeX, sizeZ])

  const targetPos = useMemo(() => new THREE.Vector3(worldPos.x, isBeingPlaced ? 0.5 : 0, worldPos.z), [worldPos, isBeingPlaced])

  const registered = useRef(false)
  // Rotation target: store rotationY (degrees) when idle, movement angle when walking
  const targetRotY  = useRef((character.rotationY || 0) * (Math.PI / 180))

  // Sync targetRotY when store rotationY changes (manual rotation buttons)
  useEffect(() => {
    targetRotY.current = (character.rotationY || 0) * (Math.PI / 180)
  }, [character.rotationY])

  useEffect(() => {
    return () => unregisterCharacterPosition(character.id)
  }, [character.id])

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Registra a posição viva na primeira vez que o ref fica disponível
    if (!registered.current) {
      groupRef.current.position.set(worldPos.x, 0, worldPos.z)
      registerCharacterPosition(character.id, groupRef.current.position)
      registered.current = true
    }

    const currentPos = groupRef.current.position
    const distance = currentPos.distanceTo(targetPos)

    if (distance > 0.05) {
      if (!isMoving) setIsMoving(true)

      const moveSpeed = 4 * delta
      const t = Math.min(moveSpeed / distance, 1)
      currentPos.lerp(targetPos, t)

      const dx = targetPos.x - currentPos.x
      const dz = targetPos.z - currentPos.z
      const len = Math.sqrt(dx * dx + dz * dz)
      if (len > 0.001) {
        updateCharacterFacing(character.id, dx / len, dz / len)
        // While moving: target rotation = direction of movement
        const movingAngle = Math.atan2(dx, dz)
        targetRotY.current = movingAngle
      }
    } else {
      if (isMoving) setIsMoving(false)
      currentPos.copy(targetPos)
      // When stopped: facing is based on store rotationY
      const storeAngle = (character.rotationY || 0) * (Math.PI / 180)
      const fx = Math.sin(storeAngle)
      const fz = Math.cos(storeAngle)
      updateCharacterFacing(character.id, fx, fz)
    }

    // Smooth rotation toward target (whether moving or idle)
    let currentAngle = groupRef.current.rotation.y
    let diff = targetRotY.current - currentAngle
    while (diff < -Math.PI) diff += Math.PI * 2
    while (diff > Math.PI) diff -= Math.PI * 2
    groupRef.current.rotation.y += diff * Math.min(8 * delta, 1)
  })

  if (!character.alive) return null

  // Don't render characters that are pending placement
  if (character.gridX < 0 || character.gridZ < 0) return null

  const ringRadius = Math.max(sizeX, sizeZ) * 0.5 * 1.1

  return (
    <group
      ref={groupRef}
      // Initial position will be 0,0,0, but useFrame will lerp it.
      // If we want it to spawn instantly at the right place, we'd need to set it on mount.
      // We can initialize position directly in JSX:
      position={[worldPos.x, 0, worldPos.z]}
      onClick={(e) => {
        // If the game is playing and an action is active, and this character is on a highlighted cell that matches the action target, let the click pass to the GridCell below
        const isTargetable = gameState === 'playing' && (actionMode === 'attack' || actionMode === 'spell') && 
          highlightedCells.some(c => {
            return c.charId === character.id &&
              c.x >= character.gridX && c.x < character.gridX + sizeX &&
              c.z >= character.gridZ && c.z < character.gridZ + sizeZ;
          });
        
        if (isTargetable) {
          // Do not stop propagation, so the GridCell underneath handles the attack
          return
        }
        
        e.stopPropagation()
        selectCharacter(character.id)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
      onContextMenu={(e) => {
        e.stopPropagation()
        e.nativeEvent.preventDefault()
        setContextMenu({
          x: e.nativeEvent.clientX,
          y: e.nativeEvent.clientY,
          targetType: 'character',
          targetId: character.id
        })
      }}
    >
      <Suspense fallback={<FallbackCharacter team={character.team} isSelected={isSelected} scale={character.scale} />}>
        {character.modelUrl ? (
          <CharacterModel
            key={character.modelUrl}
            url={character.modelUrl}
            scale={character.scale}
            animationName={character.animationName}
            isMoving={isMoving}
            isAttacking={!!character.isAttacking}
            isSelected={isSelected}
            team={character.team}
          />
        ) : (
          <FallbackCharacter team={character.team} isSelected={isSelected} scale={character.scale} />
        )}
      </Suspense>

      {/* Selection ring */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ringRadius - 0.08, ringRadius, 32]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  )
}
