let youtubeIframeApiPromise = null

export function loadYoutubeIframeApi() {
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

export function extractYoutubeVideoId(value) {
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

export function extractYoutubePlaylistId(value) {
  if (!value) return ''

  try {
    const url = new URL(value.trim())

    if (url.hostname.includes('youtube.com')) {
      return url.searchParams.get('list') || ''
    }
  } catch {
    return ''
  }

  return ''
}

export function extractYoutubeSource(value) {
  return {
    playlistId: extractYoutubePlaylistId(value),
    videoId: extractYoutubeVideoId(value),
  }
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const totalSeconds = Math.floor(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function syncVideoMetadata(player, setMusicPlayerConfig) {
  const videoData = player?.getVideoData?.()
  const title = videoData?.title || ''
  const subtitle = videoData?.author || ''

  setMusicPlayerConfig({
    title,
    subtitle,
  })
}

export function buildPlaylistPreview(player, currentVideoId) {
  const playlist = player?.getPlaylist?.()
  const playlistIndex = player?.getPlaylistIndex?.()

  if (!Array.isArray(playlist) || playlist.length === 0) {
    return []
  }

  const safeIndex = Number.isInteger(playlistIndex) && playlistIndex >= 0
    ? playlistIndex
    : playlist.findIndex(item => item === currentVideoId)

  return playlist
    .map((item, index) => ({
      id: item,
      index,
    }))
    .filter(item => item.index > safeIndex)
    .slice(0, 5)
}

export function formatPlaylistTrackLabel(track, fallbackIndex = 0) {
  const order = String(track.index + 1).padStart(2, '0')
  const shortId = track.id ? `${track.id.slice(0, 8)}...` : 'sem-id'

  return {
    key: `${track.id || 'track'}-${track.index}-${fallbackIndex}`,
    title: `Faixa ${order}`,
    subtitle: `Video ${shortId}`,
  }
}
