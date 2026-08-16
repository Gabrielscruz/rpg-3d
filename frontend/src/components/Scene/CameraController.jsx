import React, { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import useGameStore from '../../store/gameStore'
import { getCharacterPosition } from '../../utils/characterRegistry'

// Configurações da câmera de perseguição
const CAM_DIST   = 9     // distância horizontal do personagem
const CAM_HEIGHT = 7     // altura da câmera
const CAM_LERP   = 3.0   // suavidade de posição
const TARGET_LERP = 5.0  // suavidade do ponto de mira

const _camDesired = new THREE.Vector3()
const _lookAt     = new THREE.Vector3()

export default function CameraController() {
  const { camera, gl } = useThree()
  const gameState  = useGameStore(s => s.gameState)
  const getCurrentTurnCharacter = useGameStore(s => s.getCurrentTurnCharacter)

  // Ângulo de órbita horizontal da câmera (em radianos) — controlado pelo arrastar do mouse
  const orbitAngle   = useRef(Math.PI / 4) // 45° inicial (visão diagonal)
  const isDragging   = useRef(false)
  const lastMouseX   = useRef(0)
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  // Registra eventos de mouse no canvas para arrastar e orbitar
  useEffect(() => {
    const canvas = gl.domElement

    const onMouseDown = (e) => {
      if (gameState !== 'playing') return
      if (e.button === 2) { // botão direito
        isDragging.current = true
        lastMouseX.current = e.clientX
        e.preventDefault()
      }
    }

    const onMouseMove = (e) => {
      if (!isDragging.current) return
      const dx = e.clientX - lastMouseX.current
      orbitAngle.current -= dx * 0.005 // sensibilidade
      lastMouseX.current = e.clientX
    }

    const onMouseUp = () => { isDragging.current = false }
    const onContextMenu = (e) => { e.preventDefault() } // evita menu de contexto

    // Touch support (mobile)
    const onTouchStart = (e) => {
      if (gameState !== 'playing') return
      if (e.touches.length === 1) {
        isDragging.current = true
        lastMouseX.current = e.touches[0].clientX
      }
    }
    const onTouchMove = (e) => {
      if (!isDragging.current || e.touches.length !== 1) return
      const dx = e.touches[0].clientX - lastMouseX.current
      orbitAngle.current -= dx * 0.005
      lastMouseX.current = e.touches[0].clientX
    }
    const onTouchEnd = () => { isDragging.current = false }

    canvas.addEventListener('mousedown',   onMouseDown)
    canvas.addEventListener('mousemove',   onMouseMove)
    window.addEventListener('mouseup',     onMouseUp)
    canvas.addEventListener('contextmenu', onContextMenu)
    canvas.addEventListener('touchstart',  onTouchStart, { passive: true })
    canvas.addEventListener('touchmove',   onTouchMove,  { passive: true })
    canvas.addEventListener('touchend',    onTouchEnd)

    return () => {
      canvas.removeEventListener('mousedown',   onMouseDown)
      canvas.removeEventListener('mousemove',   onMouseMove)
      window.removeEventListener('mouseup',     onMouseUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
      canvas.removeEventListener('touchstart',  onTouchStart)
      canvas.removeEventListener('touchmove',   onTouchMove)
      canvas.removeEventListener('touchend',    onTouchEnd)
    }
  }, [gl, gameState])

  // Reset câmera ao entrar/sair do jogo
  useEffect(() => {
    if (gameState !== 'playing') {
      camera.position.set(20, 25, 20)
      camera.lookAt(0, 0, 0)
      currentLookAt.current.set(0, 0, 0)
    }
  }, [gameState, camera])

  useFrame((_, delta) => {
    if (gameState !== 'playing') return

    const current = getCurrentTurnCharacter()
    if (!current) return

    const pos = getCharacterPosition(current.id)
    if (!pos) return

    // Posição da câmera: orbita ao redor do personagem pelo ângulo atual
    const angle = orbitAngle.current
    _camDesired.set(
      pos.x + Math.sin(angle) * CAM_DIST,
      pos.y + CAM_HEIGHT,
      pos.z + Math.cos(angle) * CAM_DIST,
    )

    // Ponto de mira: tórax do personagem
    _lookAt.set(pos.x, pos.y + 1.4, pos.z)

    // Lerp suave da câmera
    camera.position.lerp(_camDesired, Math.min(CAM_LERP * delta, 1))
    currentLookAt.current.lerp(_lookAt, Math.min(TARGET_LERP * delta, 1))
    camera.lookAt(currentLookAt.current)
  })

  // OrbitControls livres apenas no modo Setup
  if (gameState !== 'playing') {
    return (
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={60}
        maxPolarAngle={Math.PI / 2.3}
        minPolarAngle={Math.PI / 8}
        panSpeed={1.5}
        zoomSpeed={1.2}
        target={[0, 0, 0]}
      />
    )
  }

  return null
}
