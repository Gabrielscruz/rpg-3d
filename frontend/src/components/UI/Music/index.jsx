
import React from 'react'
import ExpandedMusicPanel from './ExpandedMusicPanel'
import MiniMusicPlayer from './MiniMusicPlayer'
import useYouTubeMusicPlayer from '../../../hooks/useYouTubeMusicPlayer'

export default function MusicPanel() {
  const music = useYouTubeMusicPlayer()

  if (!music.showMusicPanel && !music.hasSource) return null

  return (
    <>
      <ExpandedMusicPanel
        closeMusicPanel={music.closeMusicPanel}
        currentTime={music.currentTime}
        duration={music.duration}
        inputValue={music.inputValue}
        isMuted={music.isMuted}
        isPlaying={music.isPlaying}
        musicPlayer={music.musicPlayer}
        playerContainerRef={music.playerContainerRef}
        playerError={music.playerError}
        playerReady={music.playerReady}
        playlistId={music.playlistId}
        repeatTrack={music.repeatTrack}
        showMusicPanel={music.showMusicPanel}
        statusText={music.statusText}
        upcomingTracks={music.upcomingTracks}
        videoId={music.videoId}
        volume={music.volume}
        onInputChange={(event) => music.setInputValue(event.target.value)}
        onLoadVideo={music.handleLoadVideo}
        onMute={music.handleMute}
        onNextTrack={music.handleNextTrack}
        onPreviousTrack={music.handlePreviousTrack}
        onSeek={music.handleSeek}
        onSetRepeatTrack={music.setRepeatTrack}
        onTogglePlayback={music.handleTogglePlayback}
        onVolume={music.handleVolume}
      />

      <MiniMusicPlayer
        currentTime={music.currentTime}
        duration={music.duration}
        isMuted={music.isMuted}
        isPlaying={music.isPlaying}
        musicPlayer={music.musicPlayer}
        playerReady={music.playerReady}
        playlistId={music.playlistId}
        shouldShowMiniPlayer={music.shouldShowMiniPlayer}
        volume={music.volume}
        onMute={music.handleMute}
        onNextTrack={music.handleNextTrack}
        onPreviousTrack={music.handlePreviousTrack}
        onSeek={music.handleSeek}
        onTogglePlayback={music.handleTogglePlayback}
        onVolume={music.handleVolume}
      />
    </>
  )
}
