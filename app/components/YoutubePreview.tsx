'use client'

import { useState, useEffect } from 'react'
import { extractVideoId, createEmbedUrl } from '@/app/lib/youtube'

interface YoutubePreviewProps {
  url: string
  className?: string
}

export default function YoutubePreview({ url, className = '' }: YoutubePreviewProps) {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const id = extractVideoId(url)
      setVideoId(id)
      if (!id) {
        setError('Invalid YouTube URL')
      }
    } catch (err) {
      setError('Error parsing YouTube URL')
    } finally {
      setLoading(false)
    }
  }, [url])

  if (loading) {
    return (
      <div className={`flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !videoId) {
    return (
      <div className={`flex h-64 items-center justify-center bg-gray-100 dark:bg-gray-800 ${className}`}>
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>{error || 'Invalid YouTube URL'}</p>
          <p className="mt-2 text-sm">{url}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden pt-[56.25%] ${className}`}>
      <iframe
        className="absolute top-0 left-0 h-full w-full border-0"
        src={createEmbedUrl(videoId)}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  )
} 