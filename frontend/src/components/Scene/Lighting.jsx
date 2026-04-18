import React from 'react'

export default function Lighting() {
  return (
    <>
      {/* Ambient light for base visibility */}
      <ambientLight intensity={0.4} color="#b4c6e7" />

      {/* Main directional light with shadows */}
      <directionalLight
        position={[15, 25, 15]}
        intensity={1.2}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Fill light */}
      <directionalLight
        position={[-10, 15, -10]}
        intensity={0.3}
        color="#7c8aff"
      />

      {/* Subtle point light for atmosphere */}
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#9370db" distance={50} />

      {/* Hemisphere light for natural sky/ground bounce */}
      <hemisphereLight args={['#1a1a40', '#0a0a15', 0.3]} />
    </>
  )
}
