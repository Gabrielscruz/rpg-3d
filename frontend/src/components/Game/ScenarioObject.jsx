import React, { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { gridToWorld } from '../../utils/gridUtils'
import useGameStore from '../../store/gameStore'

function ScenarioModel({ url, scale = [1, 1, 1] }) {
  const { scene } = useGLTF(url)

  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene])

  // Compute centering offset from bounding box
  const offset = useMemo(() => {
    const tempClone = SkeletonUtils.clone(scene)
    const box = new THREE.Box3().setFromObject(tempClone)
    const center = box.getCenter(new THREE.Vector3())
    return {
      x: -center.x,
      y: -box.min.y,
      z: -center.z,
    }
  }, [scene])

  return (
    // Offset wrapper ensures model is centered on the grid cell
    <group position={[offset.x, offset.y, offset.z]}>
      <primitive object={clonedScene} scale={scale} />
    </group>
  )
}

function FallbackScenario() {
  return (
    <mesh position={[0, 0.3, 0]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#4a4a6a" roughness={0.8} />
    </mesh>
  )
}

export default function ScenarioObject({ scenario }) {
  const selectScenario = useGameStore(s => s.selectScenario)
  const selectedScenarioId = useGameStore(s => s.selectedScenarioId)
  const setContextMenu = useGameStore(s => s.setContextMenu)
  const placementId = useGameStore(s => s.placementId)
  
  const isSelected = selectedScenarioId === scenario.id
  const isBeingPlaced = placementId === scenario.id
  const yOffset = isBeingPlaced ? 0.5 : 0

  const sizeX = Math.max(1, Math.round(scenario.scale?.[0] || 1))
  const sizeZ = Math.max(1, Math.round(scenario.scale?.[2] || 1))

  // useMemo MUST be called before any conditional return (Rules of Hooks)
  const worldPos = useMemo(
    () => {
      const gridXCenter = Math.max(0, scenario.gridX) + (sizeX - 1) / 2
      const gridZCenter = Math.max(0, scenario.gridZ) + (sizeZ - 1) / 2
      return gridToWorld(gridXCenter, gridZCenter)
    },
    [scenario.gridX, scenario.gridZ, sizeX, sizeZ]
  )

  // Don't render scenarios that are pending placement
  if (scenario.gridX < 0 || scenario.gridZ < 0) return null

  const ringRadius = Math.max(sizeX, sizeZ) * 0.5 * 1.1

  return (
    <group 
      position={[worldPos.x, yOffset, worldPos.z]}
      rotation={[0, (scenario.rotationY || 0) * (Math.PI / 180), 0]}
      onClick={(e) => {
        e.stopPropagation()
        selectScenario(scenario.id)
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'default' }}
      onContextMenu={(e) => {
        e.stopPropagation()
        e.nativeEvent.preventDefault()
        setContextMenu({
          x: e.nativeEvent.clientX,
          y: e.nativeEvent.clientY,
          targetType: 'scenario',
          targetId: scenario.id
        })
      }}
    >
      <Suspense fallback={<FallbackScenario />}>
        {scenario.modelUrl ? (
          <ScenarioModel url={scenario.modelUrl} scale={scenario.scale} />
        ) : (
          <FallbackScenario />
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
