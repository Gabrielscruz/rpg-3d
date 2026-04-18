import React, { useEffect, useRef, useState } from 'react'
import {
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import useGameStore from '../../store/gameStore'

let youtubeIframeApiPromise = null

function loadYoutubeIframeApi() {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }

  if (youtubeIframeApiPromise) {
    return youtubeIframeApiPromise
  }

  youtubeIframeApiPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('youtube-iframe-api')
    const previousReady = window.onYouTubeIframeAPIReady
    let settled = false
    let timeoutId = null
    let pollId = null

    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId)
      if (pollId) window.clearInterval(pollId)
    }

    const finishResolve = () => {
      if (settled || !window.YT?.Player) return
      settled = true
      cleanup()
      resolve(window.YT)
    }

    const finishReject = (message) => {
      if (settled) return
      settled = true
      cleanup()
      youtubeIframeApiPromise = null
      reject(new Error(message))
    }

    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      finishResolve()
    }

    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'youtube-iframe-api'
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      script.onerror = () => finishReject('Falha ao carregar a API do YouTube')
      const firstScriptTag = document.getElementsByTagName('script')[0]
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
      } else {
        document.head.appendChild(script)
      }
    }

    pollId = window.setInterval(() => {
      if (window.YT?.Player) {
        finishResolve()
      }
    }, 250)

    timeoutId = window.setTimeout(() => {
      finishReject('Tempo esgotado ao inicializar a API do YouTube')
    }, 12000)

    if (window.YT?.Player) {
      finishResolve()
    }
  })

  return youtubeIframeApiPromise
}

function extractYoutubeVideoId(value) {
  if (!value) return ''

  const trimmed = value.trim()
  const directMatch = trimmed.match(/^[a-zA-Z0-9_-]{11}$/)
  if (directMatch) return trimmed

  try {
    const url = new URL(trimmed)

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '').slice(0, 11)
    }

    if (url.hostname.includes('youtube.com')) {
      const queryId = url.searchParams.get('v')
      if (queryId) return queryId.slice(0, 11)

      const pathParts = url.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex(part => part === 'embed' || part === 'shorts')
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return pathParts[embedIndex + 1].slice(0, 11)
      }
    }
  } catch {
    return ''
  }

  return ''
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

function syncVideoMetadata(player, setMusicPlayerConfig) {
  const videoData = player?.getVideoData?.()
  const title = videoData?.title || ''
  const subtitle = videoData?.author || ''

  setMusicPlayerConfig({
    title,
    subtitle,
  })
}

export default function MusicPanel() {
  const showMusicPanel = useGameStore(s => s.showMusicPanel)
  const isMusicPanelMinimized = useGameStore(s => s.isMusicPanelMinimized)
  const musicPlayer = useGameStore(s => s.musicPlayer)
  const expandMusicPanel = useGameStore(s => s.expandMusicPanel)
  const minimizeMusicPanel = useGameStore(s => s.minimizeMusicPanel)
  const closeMusicPanel = useGameStore(s => s.closeMusicPanel)
  const setMusicPlayerConfig = useGameStore(s => s.setMusicPlayerConfig)

  const playerContainerRef = useRef(null)
  const playerRef = useRef(null)
  const syncIntervalRef = useRef(null)

  const [inputValue, setInputValue] = useState(musicPlayer.youtubeVideoId)
  const [playerReady, setPlayerReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(70)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [statusText, setStatusText] = useState('Cole um link ou ID do YouTube para carregar.')
  const [playerError, setPlayerError] = useState('')
  const [apiReady, setApiReady] = useState(false)
  const [repeatTrack, setRepeatTrack] = useState(false)

  const videoId = extractYoutubeVideoId(musicPlayer.youtubeVideoId)

  useEffect(() => {
    setInputValue(musicPlayer.youtubeVideoId)
  }, [musicPlayer.youtubeVideoId])

  useEffect(() => {
    if (!showMusicPanel) return undefined

    let cancelled = false

    loadYoutubeIframeApi()
      .then(() => {
        if (cancelled) return
        setApiReady(true)
        setPlayerError('')
        setStatusText(videoId ? 'API do YouTube pronta. Carregando video...' : 'API do YouTube pronta. Cole um link ou ID valido.')
      })
      .catch((error) => {
        if (cancelled) return
        setApiReady(false)
        setPlayerError(`${error.message}. Verifique bloqueadores, firewall ou conexao com youtube.com.`)
        setStatusText('Erro ao inicializar a integracao com o YouTube.')
      })

    return () => {
      cancelled = true
    }
  }, [showMusicPanel, videoId])

  useEffect(() => {
    if (!showMusicPanel || !apiReady || !videoId || !playerContainerRef.current) return undefined

    let cancelled = false

    if (!playerRef.current) {
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        width: '100%',
        height: '100%',
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            event.target.setVolume(volume)
            syncVideoMetadata(event.target, setMusicPlayerConfig)
            setPlayerReady(true)
            setIsMuted(event.target.isMuted())
            setDuration(event.target.getDuration() || 0)
            setStatusText('Player pronto para reproduzir.')
            setPlayerError('')
          },
          onStateChange: (event) => {
            const YTState = window.YT?.PlayerState
            syncVideoMetadata(event.target, setMusicPlayerConfig)
            setDuration(event.target.getDuration() || 0)

            if (event.data === YTState?.PLAYING) {
              setIsPlaying(true)
              setStatusText('Reproduzindo audio e video do YouTube.')
            } else if (event.data === YTState?.PAUSED) {
              setIsPlaying(false)
              setStatusText('Video pausado.')
            } else if (event.data === YTState?.BUFFERING) {
              setStatusText('Carregando stream do YouTube...')
            } else if (event.data === YTState?.ENDED) {
              setIsPlaying(false)
              if (repeatTrack) {
                event.target.seekTo(0, true)
                event.target.playVideo()
              } else {
                setStatusText('Video finalizado.')
              }
            } else if (event.data === YTState?.CUED) {
              setIsPlaying(false)
              setStatusText('Video carregado e pronto para tocar.')
            }
          },
          onError: (event) => {
            const errorMessages = {
              2: 'ID de video invalido.',
              5: 'O navegador nao conseguiu reproduzir este video.',
              100: 'O video nao foi encontrado.',
              101: 'O proprietario nao permite reproducao incorporada.',
              150: 'O proprietario nao permite reproducao incorporada.',
            }

            setPlayerError(errorMessages[event.data] || 'Nao foi possivel carregar esse video do YouTube.')
            setStatusText('Falha ao carregar o video.')
            setIsPlaying(false)
          },
        },
      })
    }

    return () => {
      cancelled = true
    }
  }, [showMusicPanel, apiReady, videoId, volume, repeatTrack, setMusicPlayerConfig])

  useEffect(() => {
    if (!playerReady || !playerRef.current || !videoId) return undefined

    const player = playerRef.current
    const currentData = player.getVideoData?.()
    const currentVideoId = currentData?.video_id || ''

    if (currentVideoId !== videoId) {
      player.cueVideoById(videoId)
      setCurrentTime(0)
      setDuration(0)
      setPlayerError('')
      setStatusText('Video carregado. Use play para iniciar.')
      setMusicPlayerConfig({
        title: '',
        subtitle: '',
      })
    }

    return undefined
  }, [playerReady, videoId, setMusicPlayerConfig])

  useEffect(() => {
    if (!playerReady || !playerRef.current) return undefined

    const player = playerRef.current
    player.setVolume(volume)
    if (volume === 0) {
      player.mute()
      setIsMuted(true)
    } else {
      player.unMute()
      setIsMuted(false)
    }

    return undefined
  }, [playerReady, volume])

  useEffect(() => {
    if (!playerReady || !playerRef.current) return undefined

    syncIntervalRef.current = window.setInterval(() => {
      const player = playerRef.current
      if (!player) return

      setCurrentTime(player.getCurrentTime?.() || 0)
      setDuration(player.getDuration?.() || 0)
      setIsMuted(player.isMuted?.() || false)
    }, 500)

    return () => {
      if (syncIntervalRef.current) {
        window.clearInterval(syncIntervalRef.current)
        syncIntervalRef.current = null
      }
    }
  }, [playerReady])

  useEffect(() => () => {
    if (syncIntervalRef.current) {
      window.clearInterval(syncIntervalRef.current)
    }
    playerRef.current?.destroy?.()
    playerRef.current = null
  }, [])

  if (!showMusicPanel) return null

  const handleLoadVideo = () => {
    const normalizedVideoId = extractYoutubeVideoId(inputValue)

    if (!normalizedVideoId) {
      setPlayerError('ID de video invalido. Cole uma URL valida do YouTube ou um ID com 11 caracteres.')
      setStatusText('Nao foi possivel interpretar o link informado.')
      return
    }

    setPlayerError('')
    setStatusText('Solicitando carregamento do video...')
    setMusicPlayerConfig({
      youtubeVideoId: normalizedVideoId,
      title: '',
      subtitle: '',
    })
  }

  const handleTogglePlayback = () => {
    const player = playerRef.current
    if (!player || !playerReady || !videoId) return

    if (isPlaying) {
      player.pauseVideo()
    } else {
      player.playVideo()
    }
  }

  const handleSeek = (event) => {
    const player = playerRef.current
    if (!player || !playerReady) return

    const nextTime = Number(event.target.value)
    setCurrentTime(nextTime)
    player.seekTo(nextTime, true)
  }

  const handleVolume = (event) => {
    setVolume(Number(event.target.value))
  }

  const handleMute = () => {
    const player = playerRef.current
    if (!player || !playerReady) return

    if (player.isMuted()) {
      player.unMute()
      player.setVolume(volume || 70)
      setIsMuted(false)
      return
    }

    player.mute()
    setIsMuted(true)
  }

  const handleSeekStep = (delta) => {
    const player = playerRef.current
    if (!player || !playerReady) return

    const nextTime = Math.max(0, (player.getCurrentTime?.() || 0) + delta)
    player.seekTo(nextTime, true)
    setCurrentTime(nextTime)
  }

  return (
    <div className={`music-panel ${isMusicPanelMinimized ? 'minimized' : ''}`}>
      <div className="music-panel-header">
        <div className="music-panel-badge">RPG Açao</div>
      </div>

      <div className="music-panel-body" aria-hidden={isMusicPanelMinimized}>
        <div className={`music-panel-visual ${!videoId ? 'music-panel-visual--fallback' : ''}`}>
          <div ref={playerContainerRef} className="music-panel-player-frame" />
          {!videoId && (
            <div className="music-panel-placeholder">
              <div className="music-panel-play">▶</div>
            </div>
          )}
        </div>

        <div className="music-panel-content">
          <h3 className="music-panel-title">{musicPlayer.title || 'Nenhum video carregado'}</h3>
          <p className="music-panel-subtitle">{musicPlayer.subtitle || 'Cole um link do YouTube para iniciar'}</p>

          <div className="music-panel-progress">
            <span>{formatTime(currentTime)}</span>
            <input
              className="music-panel-range music-panel-progress-range"
              type="range"
              min="0"
              max={Math.max(duration, 0)}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              onChange={handleSeek}
              disabled={!videoId || !playerReady}
              style={{
                '--range-progress': `${duration > 0 ? (Math.min(currentTime, duration) / duration) * 100 : 0}%`,
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="music-panel-controls">
            <button
              className="music-control-secondary"
              type="button"
              onClick={() => handleSeekStep(-10)}
              title="Voltar 10 segundos"
            >
              <SkipBack size={16} strokeWidth={2.1} />
            </button>
            <button
              className="music-control music-control-primary"
              onClick={handleTogglePlayback}
              title={isPlaying ? 'Pausar' : 'Tocar'}
              type="button"
              disabled={!videoId || !playerReady}
            >
              <span className="music-control-primary-inner">
                {isPlaying ? <Pause size={14} strokeWidth={2.8} /> : <Play size={14} strokeWidth={2.8} fill="currentColor" />}
              </span>
            </button>
            <button
              className="music-control-secondary"
              type="button"
              onClick={() => handleSeekStep(10)}
              title="Avancar 10 segundos"
            >
              <SkipForward size={16} strokeWidth={2.1} />
            </button>
          </div>

          <div className="music-panel-volume">
            <button
              className="music-volume-button"
              onClick={handleMute}
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
              onChange={handleVolume}
              style={{
                '--range-progress': `${volume}%`,
              }}
            />
            <span>{volume}%</span>
          </div>

          <div className="music-panel-input-row">
            <input
              className="music-panel-input"
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Cole a URL ou o ID do YouTube"
            />
            <button className="btn btn-gold music-panel-load" onClick={handleLoadVideo} type="button">
              Carregar
            </button>
          </div>

          <div className="music-panel-status">
            <span>{statusText}</span>
            {playerError && <span className="music-panel-error">{playerError}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
