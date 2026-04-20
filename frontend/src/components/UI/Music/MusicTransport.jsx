import React from 'react'
import {
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { formatTime } from '../../../utils/youtubeUtils'

export function MusicTransport({
  currentTime,
  duration,
  isMuted,
  isPlaying,
  playerReady,
  playlistId,
  repeatTrack,
  volume,
  onMute,
  onNextTrack,
  onPreviousTrack,
  onSeek,
  onSetRepeatTrack,
  onTogglePlayback,
  onVolume,
}) {
  return (
    <>
      <div className="music-panel-controls">
        <button
          className={`music-control-secondary ${repeatTrack ? 'active' : ''}`}
          type="button"
          onClick={() => onSetRepeatTrack(prev => !prev)}
          title="Repetir faixa"
        >
          <Repeat2 size={16} strokeWidth={2.1} />
        </button>
        <button
          className="music-control-secondary"
          type="button"
          onClick={onPreviousTrack}
          title="Musica anterior"
          disabled={!playlistId || !playerReady}
        >
          <SkipBack size={16} strokeWidth={2.1} />
        </button>
        <button
          className="music-control music-control-primary"
          onClick={onTogglePlayback}
          title={isPlaying ? 'Pausar' : 'Tocar'}
          type="button"
          disabled={!playerReady}
        >
          <span className="music-control-primary-inner">
            {isPlaying ? <Pause size={14} strokeWidth={2.8} /> : <Play size={14} strokeWidth={2.8} fill="currentColor" />}
          </span>
        </button>
        <button
          className="music-control-secondary"
          type="button"
          onClick={onNextTrack}
          title="Proxima musica"
          disabled={!playlistId || !playerReady}
        >
          <SkipForward size={16} strokeWidth={2.1} />
        </button>
        <button
          className="music-volume-button"
          onClick={onMute}
          title="Ativar ou desativar som"
          type="button"
        >
          {isMuted || volume === 0 ? <VolumeX size={14} strokeWidth={2.2} /> : <Volume2 size={14} strokeWidth={2.2} />}
        </button>
      </div>

      <div className="music-panel-progress">
        <span>{formatTime(currentTime)}</span>
        <input
          className="music-panel-range music-panel-progress-range"
          type="range"
          min="0"
          max={Math.max(duration, 0)}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={onSeek}
          disabled={!playerReady}
          style={{
            '--range-progress': `${duration > 0 ? (Math.min(currentTime, duration) / duration) * 100 : 0}%`,
          }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="music-panel-volume">
        <button
          className="music-volume-button"
          onClick={onMute}
          title="Ativar ou desativar som"
          type="button"
        >
          {isMuted || volume === 0 ? <VolumeX size={14} strokeWidth={2.2} /> : <Volume2 size={14} strokeWidth={2.2} />}
        </button>
        <input
          className="music-panel-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={onVolume}
          style={{
            '--range-progress': `${volume}%`,
          }}
        />
        <span>{volume}%</span>
      </div>
    </>
  )
}

export function MiniMusicTransport({
  currentTime,
  duration,
  isMuted,
  isPlaying,
  playerReady,
  playlistId,
  volume,
  onMute,
  onNextTrack,
  onPreviousTrack,
  onSeek,
  onTogglePlayback,
  onVolume,
}) {
  return (
    <>
      <div className="music-panel-mini-controls">
        <button
          className="music-control-secondary"
          type="button"
          onClick={onPreviousTrack}
          title="Musica anterior"
          disabled={!playlistId || !playerReady}
        >
          <SkipBack size={16} strokeWidth={2.1} />
        </button>
        <button
          className="music-control music-control-primary music-control-primary--mini"
          onClick={onTogglePlayback}
          title={isPlaying ? 'Pausar' : 'Tocar'}
          type="button"
          disabled={!playerReady}
        >
          <span className="music-control-primary-inner">
            {isPlaying ? <Pause size={14} strokeWidth={2.8} /> : <Play size={14} strokeWidth={2.8} fill="currentColor" />}
          </span>
        </button>
        <button
          className="music-control-secondary"
          type="button"
          onClick={onNextTrack}
          title="Proxima musica"
          disabled={!playlistId || !playerReady}
        >
          <SkipForward size={16} strokeWidth={2.1} />
        </button>
      </div>

      <div className="music-panel-mini-progress">
        <span>{formatTime(currentTime)}</span>
        <input
          className="music-panel-range music-panel-progress-range"
          type="range"
          min="0"
          max={Math.max(duration, 0)}
          step="0.1"
          value={Math.min(currentTime, duration || 0)}
          onChange={onSeek}
          disabled={!playerReady}
          style={{
            '--range-progress': `${duration > 0 ? (Math.min(currentTime, duration) / duration) * 100 : 0}%`,
          }}
        />
        <span>{formatTime(duration)}</span>
      </div>

      <div className="music-panel-volume">
        <button
          className="music-volume-button"
          onClick={onMute}
          title="Ativar ou desativar som"
          type="button"
        >
          {isMuted || volume === 0 ? <VolumeX size={14} strokeWidth={2.2} /> : <Volume2 size={14} strokeWidth={2.2} />}
        </button>
        <input
          className="music-panel-range"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={onVolume}
          style={{
            '--range-progress': `${volume}%`,
          }}
        />
        <span>{volume}%</span>
      </div>
    </>
  )
}
