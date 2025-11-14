export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
}

export interface Meeting {
  id: string
  meeting_code: string
  title: string
  host_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  user_id: string
  joined_at: string
  left_at?: string
}

export interface Peer {
  peerId: string
  stream?: MediaStream
}
