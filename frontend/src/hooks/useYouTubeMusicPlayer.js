import { useEffect, useRef, useState } from 'react'
import useGameStore from '../store/gameStore'
import {
  buildPlaylistPreview,
  extractYoutubeSource,
  loadYoutubeIframeApi,
  syncVideoMetadata,
} from '../utils/youtubeUtils'

export default function useYouTubeMusicPlayer() {
  const showMusicPanel = useGameStore(s => s.showMusicPanel)
  const musicPlayer = useGameStore(s => s.musicPlayer)
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
  const [statusText, setStatusText] = useState('')
  const [playerError, setPlayerError] = useState('')
  const [apiReady, setApiReady] = useState(false)
  const [repeatTrack, setRepeatTrack] = useState(false)
  const [upcomingTracks, setUpcomingTracks] = useState([])
  const [playlistItems, setPlaylistItems] = useState([])
  const [currentVideoId, setCurrentVideoId] = useState('')

  const { videoId, playlistId } = extractYoutubeSource(musicPlayer.youtubeVideoId)
  const hasSource = Boolean(videoId || playlistId)
  const shouldKeepPlayerMounted = showMusicPanel || hasSource
  const shouldShowMiniPlayer = !showMusicPanel && hasSource
  const hasResolvedPlaylist = Boolean(playlistId) && playlistItems.length > 0

  useEffect(() => {
    setInputValue(musicPlayer.youtubeVideoId)
  }, [musicPlayer.youtubeVideoId])

  useEffect(() => {
    if (!playlistId) {
      setPlaylistItems([])
      return undefined
    }

    const controller = new AbortController()

    async function loadPlaylistItems() {
      try {
        const response = await fetch(`/api/youtube/playlists/${playlistId}/items`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(errorText || 'Falha ao buscar playlist no backend.')
        }

        const data = await response.json()
        setPlaylistItems(Array.isArray(data.items) ? data.items : [])
      } catch (error) {
        if (error.name === 'AbortError') return
        setPlaylistItems([])
        setPlayerError('')
        setStatusText('Nao foi possivel carregar os dados completos da playlist. Exibindo apenas a faixa atual.')
      }
    }

    loadPlaylistItems()

    return () => controller.abort()
  }, [playlistId])

  useEffect(() => {
    if (!shouldKeepPlayerMounted) return undefined

    let cancelled = false

    loadYoutubeIframeApi()
      .then(() => {
        if (cancelled) return
        setApiReady(true)
        setPlayerError('')
      })
      .catch((error) => {
        if (cancelled) return
        setApiReady(false)
        setPlayerError(`${error.message}. Verifique bloqueadores, firewall ou conexao com youtube.com.`)
      })

    return () => {
      cancelled = true
    }
  }, [shouldKeepPlayerMounted, videoId, playlistId])

  useEffect(() => {
    if (!shouldKeepPlayerMounted || !apiReady || (!videoId && !playlistId) || !playerContainerRef.current) return undefined

    let cancelled = false

    if (!playerRef.current) {
      const playerConfig = {
        width: '100%',
        height: '100%',
        playerVars: {
          autoplay: 0,
          controls: 1,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
          origin: window.location.origin,
          listType: playlistId ? 'playlist' : undefined,
          list: playlistId || undefined,
        },
        events: {
          onReady: (event) => {
            if (cancelled) return

            event.target.setVolume(volume)
            syncVideoMetadata(event.target, setMusicPlayerConfig)
            setPlayerReady(true)
            setIsMuted(event.target.isMuted())
            setDuration(event.target.getDuration() || 0)
            setPlayerError('')
            setCurrentVideoId(event.target.getVideoData?.()?.video_id || videoId || '')
            setUpcomingTracks(buildPlaylistPreview(event.target, event.target.getVideoData?.()?.video_id || videoId))
            setStatusText(playlistId ? 'Playlist carregada no player.' : 'Video carregado no player.')
          },
          onStateChange: (event) => {
            const YTState = window.YT?.PlayerState
            const currentVideoData = event.target.getVideoData?.()
            const currentVideoId = currentVideoData?.video_id || ''

            setCurrentVideoId(currentVideoId)
            syncVideoMetadata(event.target, setMusicPlayerConfig)
            setDuration(event.target.getDuration() || 0)
            setUpcomingTracks(buildPlaylistPreview(event.target, currentVideoId))

            if (event.data === YTState?.PLAYING) {
              setIsPlaying(true)
              setStatusText(playlistId ? 'Reproduzindo playlist do YouTube.' : 'Reproduzindo video do YouTube.')
            } else if (event.data === YTState?.PAUSED) {
              setIsPlaying(false)
              setStatusText('Reproducao pausada.')
            } else if (event.data === YTState?.BUFFERING) {
              setStatusText('Carregando stream do YouTube...')
            } else if (event.data === YTState?.ENDED) {
              setIsPlaying(false)
              if (repeatTrack) {
                if (playlistId) {
                  const playlist = event.target.getPlaylist?.() || []
                  const playlistIndex = event.target.getPlaylistIndex?.() || 0
                  const nextIndex = playlistIndex >= playlist.length - 1 ? 0 : playlistIndex + 1
                  event.target.playVideoAt(nextIndex)
                } else {
                  event.target.seekTo(0, true)
                  event.target.playVideo()
                }
              }
            } else if (event.data === YTState?.CUED) {
              setIsPlaying(false)
              setStatusText(playlistId ? 'Playlist pronta para tocar.' : 'Video pronto para tocar.')
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
            setIsPlaying(false)
          },
        },
      }

      if (!playlistId && videoId) {
        playerConfig.videoId = videoId
      }

      playerRef.current = new window.YT.Player(playerContainerRef.current, playerConfig)
    }

    return () => {
      cancelled = true
    }
  }, [shouldKeepPlayerMounted, apiReady, videoId, playlistId, volume, repeatTrack, setMusicPlayerConfig])

  useEffect(() => {
    if (!playerReady || !playerRef.current || (!videoId && !playlistId)) return undefined

    const player = playerRef.current
    const currentData = player.getVideoData?.()
    const currentVideoId = currentData?.video_id || ''
    const currentPlaylist = player.getPlaylist?.() || []

    if (playlistId) {
      if (currentPlaylist.length === 0 || !currentPlaylist.includes(videoId)) {
        player.cuePlaylist({
          listType: 'playlist',
          list: playlistId,
          index: 0,
        })
      }

      setCurrentTime(0)
      setDuration(0)
      setPlayerError('')
      setUpcomingTracks(buildPlaylistPreview(player, currentVideoId))
      setStatusText('Playlist carregada. Use play para iniciar.')
      setMusicPlayerConfig({
        title: '',
        subtitle: '',
      })
    } else if (currentVideoId !== videoId) {
      player.cueVideoById(videoId)
      setCurrentTime(0)
      setDuration(0)
      setPlayerError('')
      setUpcomingTracks([])
      setStatusText('Video carregado. Use play para iniciar.')
      setMusicPlayerConfig({
        title: '',
        subtitle: '',
      })
    }

    return undefined
  }, [playerReady, videoId, playlistId, setMusicPlayerConfig])

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

      const syncedVideoId = player.getVideoData?.()?.video_id || ''

      setCurrentTime(player.getCurrentTime?.() || 0)
      setDuration(player.getDuration?.() || 0)
      setIsMuted(player.isMuted?.() || false)
      setCurrentVideoId(syncedVideoId)
      setUpcomingTracks(buildPlaylistPreview(player, syncedVideoId))
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

  const handleLoadVideo = () => {
    const source = extractYoutubeSource(inputValue)

    if (!source.videoId && !source.playlistId) {
      setPlayerError('Link invalido. Cole uma URL de video ou playlist do YouTube, ou um ID de video com 11 caracteres.')
      setStatusText('Nao foi possivel interpretar o link informado.')
      return
    }

    setPlayerError('')
    setUpcomingTracks([])
    setStatusText(source.playlistId ? 'Solicitando carregamento da playlist...' : 'Solicitando carregamento do video...')
    setMusicPlayerConfig({
      youtubeVideoId: inputValue.trim(),
      title: '',
      subtitle: '',
    })
  }

  const handleTogglePlayback = () => {
    const player = playerRef.current
    if (!player || !playerReady || !hasSource) return

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

  const handlePreviousTrack = () => {
    const player = playerRef.current
    if (!player || !playerReady || !playlistId) return

    player.previousVideo()
    setStatusText('Voltando para a musica anterior...')
  }

  const handleNextTrack = () => {
    const player = playerRef.current
    if (!player || !playerReady || !playlistId) return

    player.nextVideo()
    setStatusText('Avancando para a proxima musica...')
  }

  const currentPlaylistIndex = playlistItems.findIndex(item => item.videoId === currentVideoId)
  const enrichedUpcomingTracks = hasResolvedPlaylist && currentPlaylistIndex >= 0
    ? playlistItems.slice(currentPlaylistIndex + 1, currentPlaylistIndex + 6)
    : []

  return {
    closeMusicPanel,
    currentTime,
    duration,
    hasSource,
    inputValue,
    isMuted,
    isPlaying,
    playerContainerRef,
    playerError,
    playerReady,
    playlistId: hasResolvedPlaylist ? playlistId : '',
    repeatTrack,
    setInputValue,
    setRepeatTrack,
    shouldShowMiniPlayer,
    showMusicPanel,
    statusText,
    upcomingTracks: hasResolvedPlaylist ? enrichedUpcomingTracks : [],
    videoId,
    volume,
    musicPlayer,
    handleLoadVideo,
    handleMute,
    handleNextTrack,
    handlePreviousTrack,
    handleSeek,
    handleTogglePlayback,
    handleVolume,
  }
}
