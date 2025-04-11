'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ResourceForm from '@/app/components/ResourceForm'

interface Resource {
  _id: string
  title: string
  description: string
  type: 'note' | 'link' | 'video' | 'document' | 'command'
  url?: string
  content?: string
  tags: string[]
  category: string
  videoMetadata?: {
    id: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
  }
}

export default function EditResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [resource, setResource] = useState<Resource | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true)
        
        // Get admin password from localStorage
        const adminPassword = localStorage.getItem('admin-password')
        if (!adminPassword) {
          router.push('/login')
          return
        }
        
        // First check auth status
        const authResponse = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'X-Admin-Password': adminPassword
          }
        })
        const authData = await authResponse.json()
        
        if (!authData.isAdmin) {
          localStorage.removeItem('admin-password')
          router.push('/login')
          return
        }
        
        // Fetch the resource
        const response = await fetch(`/api/resources?id=${params.id}`, {
          headers: {
            'X-Admin-Password': adminPassword
          }
        })
        
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('admin-password')
            router.push('/login')
            return
          }
          throw new Error(`Failed to fetch resource: ${response.status}`)
        }
        
        const data = await response.json()
        setResource(data)
      } catch (err) {
        console.error('Error fetching resource:', err)
        setError('Failed to load resource. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchResource()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[300px] items-center justify-center px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
        </div>
      </div>
    )
  }

  if (!resource) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/30">
          <p className="text-sm text-yellow-700 dark:text-yellow-200">Resource not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/resources" 
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Resources
        </Link>
      </div>
      <ResourceForm 
        initialData={{
          _id: resource._id,
          title: resource.title,
          description: resource.description,
          type: resource.type,
          url: resource.url,
          content: resource.content,
          tags: resource.tags,
          category: resource.category,
          videoMetadata: resource.videoMetadata
        }}
        isEditing={true}
      />
    </div>
  )
} 