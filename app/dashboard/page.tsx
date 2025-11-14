'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [meetingCode, setMeetingCode] = useState('')
  const [customCode, setCustomCode] = useState('')
  const [meetingTitle, setMeetingTitle] = useState('')
  const [error, setError] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
      } else {
        setUser(user)
      }
    } catch (error) {
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const generateMeetingCode = () => {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    setCustomCode(code)
  }

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) return

    try {
      const code = customCode || Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { data, error } = await supabase
        .from('meetings')
        .insert({
          meeting_code: code,
          title: meetingTitle || 'Quick Meeting',
          host_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/meeting/${code}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create meeting')
    }
  }

  const handleJoinMeeting = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!meetingCode) {
      setError('Please enter a meeting code')
      return
    }

    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('meeting_code', meetingCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error) throw error

      if (data) {
        router.push(`/meeting/${meetingCode.toUpperCase()}`)
      }
    } catch (error: any) {
      setError('Meeting not found or is no longer active')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Google Beet</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Premium video meetings. Now free for everyone.
          </h2>
          <p className="text-lg text-gray-600">
            Connect, collaborate and celebrate from anywhere with Google Beet
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Meeting Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create a meeting</h3>
              <p className="text-gray-600">Start a new meeting with a custom code</p>
            </div>

            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                New Meeting
              </button>
            ) : (
              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label htmlFor="meetingTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Title (Optional)
                  </label>
                  <input
                    id="meetingTitle"
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Quick Meeting"
                  />
                </div>
                <div>
                  <label htmlFor="customCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Meeting Code (Optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="customCode"
                      type="text"
                      value={customCode}
                      onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter custom code"
                      maxLength={10}
                    />
                    <button
                      type="button"
                      onClick={generateMeetingCode}
                      className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
                    >
                      Generate
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Join Meeting Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join a meeting</h3>
              <p className="text-gray-600">Enter the meeting code to join</p>
            </div>

            <form onSubmit={handleJoinMeeting} className="space-y-4">
              <div>
                <label htmlFor="meetingCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Meeting Code
                </label>
                <input
                  id="meetingCode"
                  type="text"
                  value={meetingCode}
                  onChange={(e) => setMeetingCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter meeting code"
                  maxLength={10}
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
