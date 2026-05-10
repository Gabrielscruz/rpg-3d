import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DEFAULT_CHARACTER_APPEARANCE } from '../../data/characterCreator'

const ARCHETYPE_SCALE = {
  warrior: { bodyHeight: 1.04, shoulderWidth: 0.74, weaponScale: 1.08, capeScale: 0.2 },
  mage: { bodyHeight: 1.12, shoulderWidth: 0.6, weaponScale: 0.96, capeScale: 0.3 },
  rogue: { bodyHeight: 0.96, shoulderWidth: 0.62, weaponScale: 0.92, capeScale: 0.18 },
  archer: { bodyHeight: 1.0, shoulderWidth: 0.64, weaponScale: 1.0, capeScale: 0.16 },
}

const BODY_BUILD_SCALE = {
  slim: { torsoWidth: 0.9, limbWidth: 0.92, headScaleX: 0.96, torsoDepth: 0.94 },
  athletic: { torsoWidth: 1.0, limbWidth: 1.0, headScaleX: 1.0, torsoDepth: 1.0 },
  heavy: { torsoWidth: 1.14, limbWidth: 1.08, headScaleX: 1.05, torsoDepth: 1.12 },
}

const FACE_SHAPE_SCALE = {
  soft: { headWidth: 1.06, chinY: -0.08 },
  balanced: { headWidth: 1.0, chinY: -0.1 },
  angular: { headWidth: 0.96, chinY: -0.12 },
}

function HairMesh({ style, color }) {
  if (style === 'buzz') {
    return (
      <mesh castShadow position={[0, 1.51, 0]}>
        <sphereGeometry args={[0.185, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2.25]} />
        <meshStandardMaterial color={color} roughness={0.88} metalness={0.05} />
      </mesh>
    )
  }

  if (style === 'short') {
    return (
      <group position={[0, 1.5, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.21, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.95]} />
          <meshStandardMaterial color={color} roughness={0.82} metalness={0.06} />
        </mesh>
        <mesh castShadow position={[0, -0.05, -0.12]}>
          <boxGeometry args={[0.22, 0.08, 0.08]} />
          <meshStandardMaterial color={color} roughness={0.84} metalness={0.05} />
        </mesh>
      </group>
    )
  }

  if (style === 'long') {
    return (
      <group position={[0, 1.48, -0.02]}>
        <mesh castShadow>
          <sphereGeometry args={[0.21, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.95]} />
          <meshStandardMaterial color={color} roughness={0.8} metalness={0.06} />
        </mesh>
        <mesh castShadow position={[0, -0.26, -0.12]}>
          <boxGeometry args={[0.25, 0.42, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.84} metalness={0.05} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[0, 1.5, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.21, 20, 20, 0, Math.PI * 2, 0, Math.PI / 1.95]} />
        <meshStandardMaterial color={color} roughness={0.82} metalness={0.06} />
      </mesh>
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 0.22, 10]} />
        <meshStandardMaterial color={color} roughness={0.84} metalness={0.04} />
      </mesh>
      <mesh castShadow position={[0, 0.34, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.8} metalness={0.04} />
      </mesh>
    </group>
  )
}

function Weapon({ archetype, metalMaterialProps, accentMaterialProps, scaleFactor }) {
  if (archetype === 'mage') {
    return (
      <group position={[0.44, 0.96, 0]}>
        <mesh castShadow position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.82 * scaleFactor, 10]} />
          <meshStandardMaterial {...accentMaterialProps} />
        </mesh>
        <mesh castShadow position={[0, 0.28, 0]}>
          <octahedronGeometry args={[0.12, 0]} />
          <meshStandardMaterial {...metalMaterialProps} emissive={accentMaterialProps.color} emissiveIntensity={0.25} />
        </mesh>
      </group>
    )
  }

  if (archetype === 'archer') {
    return (
      <group position={[0.44, 0.88, -0.02]} rotation={[0, 0, -0.2]}>
        <mesh castShadow>
          <torusGeometry args={[0.24, 0.018, 8, 32, Math.PI]} />
          <meshStandardMaterial {...accentMaterialProps} />
        </mesh>
        <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.46, 8]} />
          <meshStandardMaterial {...metalMaterialProps} />
        </mesh>
      </group>
    )
  }

  if (archetype === 'rogue') {
    return (
      <group position={[0.38, 0.68, 0.12]} rotation={[0.12, 0, -0.72]}>
        <mesh castShadow>
          <boxGeometry args={[0.06, 0.46 * scaleFactor, 0.03]} />
          <meshStandardMaterial {...metalMaterialProps} />
        </mesh>
        <mesh castShadow position={[0, -0.19, 0]}>
          <boxGeometry args={[0.09, 0.09, 0.06]} />
          <meshStandardMaterial {...accentMaterialProps} />
        </mesh>
      </group>
    )
  }

  return (
    <group position={[0.42, 0.78, 0.12]} rotation={[0.24, 0, -0.52]}>
      <mesh castShadow position={[0, 0.18, 0]}>
        <boxGeometry args={[0.09, 0.54 * scaleFactor, 0.04]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
      <mesh castShadow position={[0, -0.12, 0]}>
        <boxGeometry args={[0.12, 0.18, 0.07]} />
        <meshStandardMaterial {...accentMaterialProps} />
      </mesh>
      <mesh castShadow position={[0, 0.48, 0]}>
        <boxGeometry args={[0.22, 0.08, 0.05]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
    </group>
  )
}

function Outfit({ archetype, bodyColor, accentColor, metalMaterialProps, capeScale, torsoWidth, torsoDepth }) {
  if (archetype === 'mage') {
    return (
      <group>
        <mesh castShadow position={[0, 0.77, 0]}>
          <cylinderGeometry args={[0.18 * torsoWidth, 0.31 * torsoWidth, 0.88, 14]} />
          <meshStandardMaterial color={bodyColor} roughness={0.76} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, 0.58, -0.16 - capeScale]}>
          <boxGeometry args={[0.46 * torsoWidth, 0.9, 0.05]} />
          <meshStandardMaterial color={accentColor} roughness={0.84} metalness={0.08} />
        </mesh>
      </group>
    )
  }

  if (archetype === 'rogue') {
    return (
      <group>
        <mesh castShadow position={[0, 0.94, 0.08]}>
          <boxGeometry args={[0.42 * torsoWidth, 0.26, 0.16 * torsoDepth]} />
          <meshStandardMaterial color={accentColor} roughness={0.78} metalness={0.08} />
        </mesh>
        <mesh castShadow position={[0, 0.72, -0.08]}>
          <boxGeometry args={[0.38 * torsoWidth, 0.44, 0.06]} />
          <meshStandardMaterial color={bodyColor} roughness={0.82} metalness={0.06} />
        </mesh>
      </group>
    )
  }

  if (archetype === 'archer') {
    return (
      <group>
        <mesh castShadow position={[0, 0.9, 0]}>
          <boxGeometry args={[0.46 * torsoWidth, 0.3, 0.18 * torsoDepth]} />
          <meshStandardMaterial color={bodyColor} roughness={0.72} metalness={0.16} />
        </mesh>
        <mesh castShadow position={[0.2, 0.9, -0.16]}>
          <boxGeometry args={[0.14, 0.34, 0.08]} />
          <meshStandardMaterial {...metalMaterialProps} />
        </mesh>
      </group>
    )
  }

  return (
    <group>
      <mesh castShadow position={[0, 0.92, 0]}>
        <boxGeometry args={[0.52 * torsoWidth, 0.32, 0.2 * torsoDepth]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} metalness={0.18} />
      </mesh>
      <mesh castShadow position={[0, 0.82, -0.18]}>
        <boxGeometry args={[0.46 * torsoWidth, 0.46, 0.05]} />
        <meshStandardMaterial color={accentColor} roughness={0.74} metalness={0.1} />
      </mesh>
      <mesh castShadow position={[0, 0.96, -0.2]}>
        <boxGeometry args={[0.36, 0.3, 0.05]} />
        <meshStandardMaterial {...metalMaterialProps} />
      </mesh>
    </group>
  )
}

export default function ProceduralCharacter({
  team = 'A',
  appearance,
  isSelected = false,
  enableFloat = true,
  preview = false,
}) {
  const rootRef = useRef()
  const mergedAppearance = { ...DEFAULT_CHARACTER_APPEARANCE, ...appearance }
  const {
    archetype,
    bodyBuild,
    skinColor,
    bodyColor,
    accentColor,
    metalColor,
    hairStyle,
    hairColor,
    faceShape,
    eyeColor,
    eyeSize,
    jawWidth,
    noseLength,
  } = mergedAppearance

  const archetypeScale = ARCHETYPE_SCALE[archetype] || ARCHETYPE_SCALE.warrior
  const buildScale = BODY_BUILD_SCALE[bodyBuild] || BODY_BUILD_SCALE.athletic
  const faceScale = FACE_SHAPE_SCALE[faceShape] || FACE_SHAPE_SCALE.balanced

  const bodyMaterial = useMemo(() => ({
    color: bodyColor,
    roughness: 0.45,
    metalness: 0.18,
  }), [bodyColor])

  const accentMaterial = useMemo(() => ({
    color: accentColor,
    roughness: 0.42,
    metalness: 0.34,
  }), [accentColor])

  const metalMaterial = useMemo(() => ({
    color: metalColor,
    roughness: 0.28,
    metalness: 0.82,
  }), [metalColor])

  useFrame((state) => {
    if (!rootRef.current) return

    if (preview) {
      rootRef.current.rotation.y = state.clock.elapsedTime * 0.55
    }

    if (enableFloat || isSelected) {
      const baseY = preview ? -0.18 : 0
      rootRef.current.position.y = baseY + Math.sin(state.clock.elapsedTime * 2) * 0.03 + (isSelected ? 0.05 : 0)
    } else {
      rootRef.current.position.y = preview ? -0.18 : 0
    }
  })

  const torsoWidth = archetypeScale.shoulderWidth * buildScale.torsoWidth
  const torsoDepth = buildScale.torsoDepth
  const limbWidth = buildScale.limbWidth
  const headWidth = faceScale.headWidth * buildScale.headScaleX
  const headHeight = 1.32 * archetypeScale.bodyHeight
  const eyeScale = 0.022 * eyeSize
  const jawScale = 0.11 * jawWidth
  const noseScale = 0.07 * noseLength
  const ringColor = isSelected ? '#fbbf24' : team === 'A' ? '#3b82f6' : '#ef4444'

  return (
    <group ref={rootRef} position={[0, preview ? -0.18 : 0, 0]}>
      <mesh castShadow position={[0, 0.62 * archetypeScale.bodyHeight, 0]} scale={[headWidth, 1, torsoDepth]}>
        <capsuleGeometry args={[0.18 * torsoWidth, 0.58 * archetypeScale.bodyHeight, 8, 16]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      <mesh castShadow position={[0, headHeight, 0]} scale={[headWidth, 1.02, 1]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color={skinColor} roughness={0.88} metalness={0.04} />
      </mesh>

      <mesh castShadow position={[0, headHeight + faceScale.chinY, 0.1]} scale={[jawScale, 0.06, 0.08]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.9} metalness={0.03} />
      </mesh>

      <mesh castShadow position={[0, headHeight - 0.02, 0.16]} scale={[0.04, 0.05, noseScale]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.88} metalness={0.04} />
      </mesh>

      <mesh castShadow position={[-0.06 * headWidth, headHeight + 0.02, 0.145]} scale={[eyeScale, eyeScale, 0.02]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.2} emissive={eyeColor} emissiveIntensity={0.12} />
      </mesh>
      <mesh castShadow position={[0.06 * headWidth, headHeight + 0.02, 0.145]} scale={[eyeScale, eyeScale, 0.02]}>
        <sphereGeometry args={[1, 12, 12]} />
        <meshStandardMaterial color={eyeColor} roughness={0.2} metalness={0.2} emissive={eyeColor} emissiveIntensity={0.12} />
      </mesh>

      <HairMesh style={hairStyle} color={hairColor} />

      <mesh castShadow position={[0, 0.98 * archetypeScale.bodyHeight, 0]}>
        <cylinderGeometry args={[0.24 * torsoWidth, 0.28 * torsoWidth, 0.28, 12]} />
        <meshStandardMaterial {...accentMaterial} />
      </mesh>

      <mesh castShadow position={[-0.18 * torsoWidth, 1.48 * archetypeScale.bodyHeight, -0.03]}>
        <boxGeometry args={[0.1, 0.16, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh castShadow position={[0.18 * torsoWidth, 1.48 * archetypeScale.bodyHeight, -0.03]}>
        <boxGeometry args={[0.1, 0.16, 0.12]} />
        <meshStandardMaterial color={accentColor} roughness={0.7} metalness={0.2} />
      </mesh>

      <mesh castShadow position={[-0.36 * torsoWidth, 0.9 * archetypeScale.bodyHeight, 0]} rotation={[0, 0, 0.22]}>
        <capsuleGeometry args={[0.06 * limbWidth, 0.42, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.86} metalness={0.05} />
      </mesh>

      <mesh castShadow position={[0.36 * torsoWidth, 0.9 * archetypeScale.bodyHeight, 0]} rotation={[0, 0, -0.22]}>
        <capsuleGeometry args={[0.06 * limbWidth, 0.42, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.86} metalness={0.05} />
      </mesh>

      <mesh castShadow position={[-0.12, 0.2, 0]} rotation={[0, 0, 0.05]}>
        <capsuleGeometry args={[0.075 * limbWidth, 0.62 * archetypeScale.bodyHeight, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.86} metalness={0.05} />
      </mesh>

      <mesh castShadow position={[0.12, 0.2, 0]} rotation={[0, 0, -0.05]}>
        <capsuleGeometry args={[0.075 * limbWidth, 0.62 * archetypeScale.bodyHeight, 6, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.86} metalness={0.05} />
      </mesh>

      <Outfit
        archetype={archetype}
        bodyColor={bodyColor}
        accentColor={accentColor}
        metalMaterialProps={metalMaterial}
        capeScale={archetypeScale.capeScale}
        torsoWidth={torsoWidth}
        torsoDepth={torsoDepth}
      />

      <Weapon
        archetype={archetype}
        scaleFactor={archetypeScale.weaponScale}
        metalMaterialProps={metalMaterial}
        accentMaterialProps={accentMaterial}
      />

      <mesh receiveShadow position={[0, -0.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color={ringColor} transparent opacity={preview ? 0.55 : 0.7} />
      </mesh>
    </group>
  )
}
