import React, { useRef, useState } from 'react'
import { Box, IconButton, Slider } from '@mui/material'
import { CircularProgress, Typography } from '@mui/material'
import AudioPlyr from 'philliplm-react-modern-audio-player'
import LinearProgress from '@mui/material/LinearProgress'

import {
  PlayArrow,
  Pause,
  VolumeUp,
  Fullscreen,
  PictureInPicture
} from '@mui/icons-material'
import { styled } from '@mui/system'
import { removeAudio } from '../../state/features/globalSlice'
import { useDispatch } from 'react-redux'

const VideoContainer = styled(Box)`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  margin: 20px 0px;
`

const VideoElement = styled('video')`
  width: 100%;
  height: auto;
  background: rgb(33, 33, 33);
`

const ControlsContainer = styled(Box)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.6);
`

interface VideoPlayerProps {
  src?: string
  poster?: string
  name?: string
  identifier?: string
  service?: string
  autoplay?: boolean
  title?: string
  description?: string
  playlist?: IPlaylist[]
  currAudio: number | null
}

export interface IPlaylist {
  name: string
  identifier: string
  service: string
  title: string
  description: string
}

export const AudioPlayer: React.FC<VideoPlayerProps> = ({
  playlist,
  currAudio
}) => {
  const [playlistFormatted, setPlaylistFormatted] = useState<any>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dispatch = useDispatch()
  const getSrc = React.useCallback(
    async (name: string, identifier: string, service: string) => {
      if (!name || !identifier || !service) return
      try {
        let videoData = await qortalRequest({
          action: 'FETCH_QDN_RESOURCE',
          name: name,
          service: service,
          identifier: identifier,
          encoding: 'base64'
        })
        const src = 'data:audio/mp3;base64,' + videoData
        return src
      } catch (error) {
        return ''
      }
    },
    []
  )

  const fetchPlaylistData = React.useCallback(async () => {
    console.log({ playlist })
    setIsLoading(true)
    const playlistAudio = await Promise.all(
      playlist?.map(async (audio: IPlaylist, index) => {
        const src = await getSrc(audio.name, audio.identifier, audio.service)
        return {
          name: audio.title,
          src: src,
          id: index + 1,

          description: audio?.description || ''
        }
      }) ?? []
    )
    setPlaylistFormatted(playlistAudio.filter((pa) => !!pa.src))
    setIsLoading(false)
  }, [playlist])

  React.useEffect(() => {
    fetchPlaylistData()
  }, [fetchPlaylistData])

  console.log({ playlistFormatted, playlist })

  if (isLoading)
    return (
      <Box
        sx={{
          isolation: 'isolate',
          width: '100%',
          position: 'fixed',
          colorScheme: 'light',
          bottom: '0px',
          padding: '10px',
          height: '50px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}
      >
        <Typography
          sx={{
            fontSize: '10px'
          }}
        >
          Loading playlist...
        </Typography>
        <LinearProgress
          sx={{
            width: '100%'
          }}
        />
      </Box>
    )
  if (playlistFormatted.length === 0) return null
  return (
    <VideoContainer>
      <AudioPlyr
        currentIndex={currAudio}
        playList={playlistFormatted}
        activeUI={{
          all: true
        }}
        placement={{
          player: 'bottom',

          playList: 'top',
          volumeSlider: 'right'
        }}
        closeCallback={() => {
          dispatch(removeAudio({}))
        }}
        // rootContainerProps={{
        //   colorScheme: theme,
        //   width
        // }}
      />
    </VideoContainer>
  )
}
