import React from 'react'
import { Pause, Play, Plus } from 'lucide-react'
import { formatPlaylistTrackLabel, formatTime } from '../../../utils/youtubeUtils'

export default function MusicPlaylistSection({
  duration,
  isPlaying,
  musicPlayer,
  playlistId,
  upcomingTracks,
  videoId,
  onTogglePlayback,
}) {
  const renderTrack = (track, index) => {
    const isEnrichedTrack = typeof track?.title === 'string' && typeof track?.position === 'number'
    const fallbackLabel = formatPlaylistTrackLabel(track, index)
    const key = isEnrichedTrack ? `${track.videoId}-${track.position}` : fallbackLabel.key
    const title = isEnrichedTrack ? track.title : fallbackLabel.title
    const subtitle = isEnrichedTrack
      ? (track.channelTitle || `Video ${track.videoId?.slice(0, 8) || 'sem-id'}...`)
      : fallbackLabel.subtitle

    return (
      <div key={key} className="music-panel-track music-panel-track-placeholder">
        <div className="music-panel-track-art">
          {isEnrichedTrack && track.thumbnail ? (
            <img className="music-panel-track-thumb" src={track.thumbnail} alt={title} />
          ) : (
            <Plus size={16} strokeWidth={2.2} />
          )}
        </div>
        <div className="music-panel-track-copy">
          <span className="music-panel-track-title">{title}</span>
          <span className="music-panel-track-subtitle">{subtitle}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="music-panel-section">
      <span className="music-panel-section-label">Playlist</span>
      <div className="music-panel-playlist">
        <button className={`music-panel-track ${videoId ? 'is-active' : ''}`} type="button" onClick={onTogglePlayback}>
          <div className="music-panel-track-art">
            {isPlaying ? <Pause size={16} strokeWidth={2.4} /> : <Play size={16} strokeWidth={2.4} fill="currentColor" />}
          </div>
          <div className="music-panel-track-copy">
            <span className="music-panel-track-title">{musicPlayer.title || 'Faixa atual'}</span>
            <span className="music-panel-track-subtitle">
              {musicPlayer.subtitle || (playlistId ? 'Playlist do YouTube ativa' : 'Aguardando link do YouTube')}
            </span>
          </div>
          <span className="music-panel-track-meta">{duration ? formatTime(duration) : '--:--'}</span>
        </button>

        {upcomingTracks.length > 0 ? upcomingTracks.map(renderTrack) : (
          <div className="music-panel-track music-panel-track-placeholder">
            <div className="music-panel-track-art">
              <Plus size={16} strokeWidth={2.2} />
            </div>
            <div className="music-panel-track-copy">
              <span className="music-panel-track-title">{playlistId ? 'Nenhuma proxima faixa encontrada' : 'Adicione outra musica'}</span>
              <span className="music-panel-track-subtitle">
                {playlistId ? 'O player ainda nao informou mais itens da playlist' : 'Cole um novo link acima para trocar a faixa'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
