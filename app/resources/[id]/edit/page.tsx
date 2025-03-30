'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ResourceForm from '@/app/components/ResourceForm'
import Link from 'next/link'
import PasswordProtection from '@/app/components/PasswordProtection'

type ResourceType = 'note' | 'link' | 'video' | 'document'

interface Resource {
  _id: string
  title: string
  description: string
  type: ResourceType
  url?: string
  content?: string
  tags: string[]
  category: string
  urlMetadata?: {
    type: string
    title?: string
    description?: string
    thumbnail?: string
    author?: string
    publishedAt?: string
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
        
        const response = await fetch(`/api/resources?id=${params.id}`)
        
        if (!response.ok) {
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
  }, [params.id])

  return (
    <PasswordProtection>
      {loading ? (
        <div className="container mx-auto flex min-h-[300px] items-center justify-center px-4">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      ) : error || !resource ? (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link 
              href="/resources" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Resources
            </Link>
          </div>
          <div className="rounded-xl bg-red-50 p-6 dark:bg-red-900/30">
            <h1 className="mb-4 text-xl font-bold text-red-800 dark:text-red-200">
              {error || 'Resource not found'}
            </h1>
            <p className="text-red-700 dark:text-red-300">
              The resource you are looking for could not be loaded. Please try again or go back to the resources page.
            </p>
            <div className="mt-4">
              <Link
                href="/resources"
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Return to Resources
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link 
              href="/resources" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Resources
            </Link>
          </div>
          
          <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Edit Resource</h1>
          
          <ResourceForm
            initialData={{
              id: resource._id,
              title: resource.title,
              description: resource.description,
              type: resource.type,
              url: resource.url || '',
              content: resource.content || '',
              tags: resource.tags,
              category: resource.category
            }}
            isEditing={true}
          />
        </div>
      )}
    </PasswordProtection>
  )
} 