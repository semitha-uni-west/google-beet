'use client'

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  const checkUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      router.push('/dashboard')
    }
  }, [router])

  useEffect(() => {
    checkUser()
  }, [checkUser])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-indigo-600 mb-4">Google Beet</h1>
          <p className="text-2xl text-gray-700 mb-2">Premium video meetings. Now free for everyone.</p>
          <p className="text-lg text-gray-600">
            Connect, collaborate and celebrate from anywhere
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/auth/login"
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 font-medium text-lg transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🎥</div>
            <h3 className="text-xl font-semibold mb-2">Video Chat</h3>
            <p className="text-gray-600">High-quality video calls with multiple participants</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🎙️</div>
            <h3 className="text-xl font-semibold mb-2">Voice Chat</h3>
            <p className="text-gray-600">Crystal clear audio communication</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-3">🖥️</div>
            <h3 className="text-xl font-semibold mb-2">Screen Sharing</h3>
            <p className="text-gray-600">Share your screen with others instantly</p>
          </div>
        </div>
      </div>
    </div>
  )
}
