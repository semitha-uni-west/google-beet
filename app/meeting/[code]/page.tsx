'use client'

import { useState, useEffect, useRef, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import SimplePeer from 'simple-peer'

interface Participant {
  id: string
  email: string
  stream?: MediaStream
  peer?: SimplePeer.Instance
}

export default function MeetingRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const resolvedParams = use(params)
  const [user, setUser] = useState<any>(null)
  const [meeting, setMeeting] = useState<any>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)
  const peersRef = useRef<{ [key: string]: SimplePeer.Instance }>({})
  const router = useRouter()

  useEffect(() => {
    initializeMeeting()
    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
    }
    Object.values(peersRef.current).forEach(peer => peer.destroy())
  }

  const initializeMeeting = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      const { data: meetingData, error: meetingError } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', resolvedParams.code)
        .eq('is_active', true)
        .single()

      if (meetingError) throw meetingError
      setMeeting(meetingData)

      const { error: participantError } = await supabase
        .from('meeting_participants')
        .insert({
          meeting_id: meetingData.id,
          user_id: user.id,
        })

      if (participantError && participantError.code !== '23505') {
        throw participantError
      }

      await getUserMedia()
      setLoading(false)
    } catch (error: any) {
      setError(error.message || 'Failed to join meeting')
      setLoading(false)
    }
  }

  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      setLocalStream(stream)
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream
      }
    } catch (error) {
      console.error('Error accessing media devices:', error)
      setError('Failed to access camera/microphone')
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioOn(audioTrack.enabled)
      }
    }
  }

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        })
        
        screenStreamRef.current = screenStream
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream
        }

        screenStream.getVideoTracks()[0].onended = () => {
          stopScreenShare()
        }

        setIsScreenSharing(true)
      } catch (error) {
        console.error('Error sharing screen:', error)
        setError('Failed to share screen')
      }
    } else {
      stopScreenShare()
    }
  }

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop())
      screenStreamRef.current = null
    }
    
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream
    }
    
    setIsScreenSharing(false)
  }

  const leaveMeeting = async () => {
    try {
      if (user && meeting) {
        await supabase
          .from('meeting_participants')
          .update({ left_at: new Date().toISOString() })
          .eq('meeting_id', meeting.id)
          .eq('user_id', user.id)
      }
      cleanup()
      router.push('/dashboard')
    } catch (error) {
      console.error('Error leaving meeting:', error)
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-xl text-white">Loading meeting...</div>
      </div>
    )
  }

  if (error && !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="text-xl text-red-500 mb-4">{error}</div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="text-white">
          <h1 className="text-xl font-bold">{meeting?.title || 'Meeting'}</h1>
          <p className="text-sm text-gray-400">Code: {resolvedParams.code}</p>
        </div>
        <button
          onClick={leaveMeeting}
          className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
        >
          Leave Meeting
        </button>
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
          {/* Local Video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
              You {isScreenSharing && '(Sharing Screen)'}
            </div>
            {!isVideoOn && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Remote Participants */}
          {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {participant.email?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                {participant.email}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            title={isAudioOn ? 'Mute' : 'Unmute'}
          >
            {isAudioOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
            } text-white transition-colors`}
            title={isVideoOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoOn ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A2 2 0 0018 13V7a1 1 0 00-1.447-.894l-2 1A1 1 0 0014 8v.586l-2-2V6a2 2 0 00-2-2H8.586L3.707 2.293zM12 12.586L8.586 9.172A2 2 0 006 10v4a2 2 0 002 2h4a2 2 0 001.414-.586z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full ${
              isScreenSharing ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-700 hover:bg-gray-600'
            } text-white transition-colors`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v6h10V5H5z" clipRule="evenodd" />
              <path d="M10 15a1 1 0 011-1h5a1 1 0 110 2h-5a1 1 0 01-1-1z" />
            </svg>
          </button>
        </div>
      </div>

      {error && meeting && (
        <div className="bg-yellow-900 px-6 py-3 text-yellow-200 text-center">
          {error}
        </div>
      )}
    </div>
  )
}
