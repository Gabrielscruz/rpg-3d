import React, { useRef, useEffect } from 'react'
import useGameStore from '../../store/gameStore'

export default function CombatLog() {
  const combatLog = useGameStore(s => s.combatLog)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [combatLog])

  if (combatLog.length === 0) return null

  return (
    <div className="combat-log" ref={scrollRef}>
      <div className="combat-log-title">📜 Log de Combate</div>
      {combatLog.slice(-15).map((entry, i) => (
        <div key={i} className={`log-entry ${entry.type}`}>
          {entry.text}
        </div>
      ))}
    </div>
  )
}
