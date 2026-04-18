import React from 'react'
import { OrbitControls } from '@react-three/drei'

export default function CameraController() {
  return (
    <OrbitControls
      makeDefault
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2.3}
      minPolarAngle={Math.PI / 8}
      panSpeed={1.5}
      zoomSpeed={1.2}
      target={[0, 0, 0]}
    />
  )
}
