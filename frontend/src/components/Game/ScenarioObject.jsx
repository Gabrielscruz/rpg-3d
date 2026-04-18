import React, { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import { gridToWorld } from '../../utils/gridUtils'

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
  // Don't render scenarios that are pending placement
  if (scenario.gridX < 0 || scenario.gridZ < 0) return null

  const worldPos = useMemo(
    () => gridToWorld(scenario.gridX, scenario.gridZ),
    [scenario.gridX, scenario.gridZ]
  )

  return (
    <group 
      position={[worldPos.x, 0, worldPos.z]}
      rotation={[0, (scenario.rotationY || 0) * (Math.PI / 180), 0]}
    >
      <Suspense fallback={<FallbackScenario />}>
        {scenario.modelUrl ? (
          <ScenarioModel url={scenario.modelUrl} scale={scenario.scale} />
        ) : (
          <FallbackScenario />
        )}
      </Suspense>
    </group>
  )
}
