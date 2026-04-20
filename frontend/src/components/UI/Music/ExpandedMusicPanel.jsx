import React from 'react'
import { Play, X } from 'lucide-react'
import MusicPlaylistSection from './MusicPlaylistSection'
import { MusicTransport } from './MusicTransport'

export default function ExpandedMusicPanel({
  closeMusicPanel,
  currentTime,
  duration,
  inputValue,
  isMuted,
  isPlaying,
  musicPlayer,
  playerContainerRef,
  playerError,
  playerReady,
  playlistId,
  repeatTrack,
  showMusicPanel,
  statusText,
  upcomingTracks,
  videoId,
  volume,
  onInputChange,
  onLoadVideo,
  onMute,
  onNextTrack,
  onPreviousTrack,
  onSeek,
  onSetRepeatTrack,
  onTogglePlayback,
  onVolume,
}) {
  return (
    <div className={`music-panel ${!showMusicPanel && videoId ? 'music-panel--closed' : ''}`}>
      <div className="music-panel-header">
        <div>
          <div className="music-panel-badge">Music Archive</div>
          <h2 className="music-panel-heading">Chronicles Player</h2>
        </div>
        <div className="music-panel-actions">
          <button
            className="music-panel-action"
            type="button"
            onClick={closeMusicPanel}
            title="Fechar painel"
          >
            <X size={15} strokeWidth={2.1} />
          </button>
        </div>
      </div>

      <div className="music-panel-body" aria-hidden={!showMusicPanel}>
        <div className="music-panel-top">
          <div className="music-panel-section">
            <span className="music-panel-section-label">Source Stream URL</span>
            <div className="music-panel-input-row">
              <input
                className="music-panel-input"
                type="text"
                value={inputValue}
                onChange={onInputChange}
                placeholder="Cole a URL do video ou playlist do YouTube"
              />
              <button className="btn btn-gold music-panel-load" onClick={onLoadVideo} type="button">
                Carregar
              </button>
            </div>
          </div>

          <div className={`music-panel-visual ${!videoId ? 'music-panel-visual--fallback' : ''}`}>
            <div ref={playerContainerRef} className="music-panel-player-frame" />
            {!videoId && (
              <div className="music-panel-placeholder">
                <div className="music-panel-play">
                  <Play size={24} strokeWidth={2.2} fill="currentColor" />
                </div>
                <p className="music-panel-placeholder-text">
                  Abra um link do YouTube para usar esta aba lateral como seu player de ambientacao.
                </p>
              </div>
            )}
            <div className="music-panel-visual-tag">RPG Acao</div>
          </div>
        </div>

        <div className="music-panel-content">
          <div className="music-panel-now-playing">
            <span className="music-panel-section-label">Now Playing</span>
            <h3 className="music-panel-title">{musicPlayer.title}</h3>
            <p className="music-panel-subtitle">{musicPlayer.subtitle}</p>
          </div>

          <MusicPlaylistSection
            duration={duration}
            isPlaying={isPlaying}
            musicPlayer={musicPlayer}
            playlistId={playlistId}
            upcomingTracks={upcomingTracks}
            videoId={videoId}
            onTogglePlayback={onTogglePlayback}
          />

          <div className="music-panel-status">
            <span>{statusText}</span>
            {playerError && <span className="music-panel-error">{playerError}</span>}
          </div>
        </div>

        <div className="music-panel-footer">
          <MusicTransport
            currentTime={currentTime}
            duration={duration}
            isMuted={isMuted}
            isPlaying={isPlaying}
            playerReady={playerReady}
            playlistId={playlistId}
            repeatTrack={repeatTrack}
            volume={volume}
            onMute={onMute}
            onNextTrack={onNextTrack}
            onPreviousTrack={onPreviousTrack}
            onSeek={onSeek}
            onSetRepeatTrack={onSetRepeatTrack}
            onTogglePlayback={onTogglePlayback}
            onVolume={onVolume}
          />
        </div>
      </div>
    </div>
  )
}
