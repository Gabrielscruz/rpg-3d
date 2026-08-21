import React, { useEffect, useRef } from 'react'
import useGameStore from '../../store/gameStore'

export default function ContextMenu() {
  const contextMenu = useGameStore(s => s.contextMenu)
  const setContextMenu = useGameStore(s => s.setContextMenu)
  const duplicateObject = useGameStore(s => s.duplicateObject)
  const removeCharacter = useGameStore(s => s.removeCharacter)
  const removeScenario = useGameStore(s => s.removeScenario)
  const openEditModal = useGameStore(s => s.openEditModal)
  const gameState = useGameStore(s => s.gameState)

  const menuRef = useRef(null)

  // Close context menu when clicking outside or resizing window
  useEffect(() => {
    if (!contextMenu) return

    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setContextMenu(null)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', () => setContextMenu(null))

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', () => setContextMenu(null))
    }
  }, [contextMenu, setContextMenu])

  if (!contextMenu) return null

  const handleEdit = () => {
    openEditModal(contextMenu.targetType, contextMenu.targetId)
    setContextMenu(null)
  }

  const handleDuplicate = () => {
    duplicateObject(contextMenu.targetType, contextMenu.targetId)
    setContextMenu(null)
  }

  const handleDelete = () => {
    if (contextMenu.targetType === 'character') {
      removeCharacter(contextMenu.targetId)
    } else {
      removeScenario(contextMenu.targetId)
    }
    setContextMenu(null)
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: contextMenu.y,
        left: contextMenu.x,
        zIndex: 9999,
        background: 'rgba(20, 16, 30, 0.9)',
        border: '1.5px solid var(--accent-gold)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.75), inset 0 0 10px rgba(251, 191, 36, 0.15)',
        borderRadius: '8px',
        padding: '6px 0',
        minWidth: '150px',
        backdropFilter: 'blur(10px)',
        transform: 'translate(4px, 4px)',
        pointerEvents: 'auto',
      }}
    >
      {gameState === 'setup' && (
        <>
          <button
            onClick={handleEdit}
            style={{
              width: '100%',
              padding: '10px 16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '13px',
              fontFamily: 'var(--font-main)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)'
              e.currentTarget.style.color = 'var(--accent-gold)'
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = 'none'
              e.currentTarget.style.color = 'var(--text-primary)'
            }}
          >
            <span>✏️</span> Editar
          </button>
          
          <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />
        </>
      )}

      <button
        onClick={handleDuplicate}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontFamily: 'var(--font-main)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(251, 191, 36, 0.15)'
          e.currentTarget.style.color = 'var(--accent-gold)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.color = 'var(--text-primary)'
        }}
      >
        <span>📋</span> Duplicar
      </button>

      <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.08)', margin: '4px 0' }} />

      <button
        onClick={handleDelete}
        style={{
          width: '100%',
          padding: '10px 16px',
          background: 'none',
          border: 'none',
          color: '#fca5a5',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontFamily: 'var(--font-main)',
          transition: 'all 0.2s',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
          e.currentTarget.style.color = '#ef4444'
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'none'
          e.currentTarget.style.color = '#fca5a5'
        }}
      >
        <span>🗑️</span> Excluir
      </button>
    </div>
  )
}
