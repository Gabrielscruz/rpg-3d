import React from 'react'
import { MiniMusicTransport } from './MusicTransport'

export default function MiniMusicPlayer({
  currentTime,
  duration,
  isMuted,
  isPlaying,
  musicPlayer,
  playerReady,
  playlistId,
  shouldShowMiniPlayer,
  volume,
  onMute,
  onNextTrack,
  onPreviousTrack,
  onSeek,
  onTogglePlayback,
  onVolume,
}) {
  if (!shouldShowMiniPlayer) return null

  return (
    <div className="music-panel-mini-player">
      <div className="music-panel-mini-meta">
        <span className="music-panel-mini-title">{musicPlayer.title || 'Music Player'}</span>
        <span className="music-panel-mini-subtitle">{musicPlayer.subtitle || 'YouTube stream ativo'}</span>
      </div>

      <MiniMusicTransport
        currentTime={currentTime}
        duration={duration}
        isMuted={isMuted}
        isPlaying={isPlaying}
        playerReady={playerReady}
        playlistId={playlistId}
        volume={volume}
        onMute={onMute}
        onNextTrack={onNextTrack}
        onPreviousTrack={onPreviousTrack}
        onSeek={onSeek}
        onTogglePlayback={onTogglePlayback}
        onVolume={onVolume}
      />
    </div>
  )
}
