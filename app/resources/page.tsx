'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusIcon, FolderIcon, DocumentTextIcon, VideoCameraIcon, LinkIcon, TagIcon } from '@heroicons/react/24/outline'
import ResourceCard from '@/app/components/ResourceCard'
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
  createdAt?: string
  videoMetadata?: {
    id: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
  }
  urlMetadata?: {
    type: string
    title?: string
    description?: string
    thumbnail?: string
    author?: string
    publishedAt?: string
  }
}

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  
  // For limited view
  const [showAll, setShowAll] = useState(false)
  const INITIAL_RESOURCE_COUNT = 6
  
  // Get all unique categories and tags from resources
  const categories = Array.from(new Set(resources.map(r => r.category))).filter(Boolean).sort()
  const allTags = resources.flatMap(r => r.tags).filter(Boolean)
  const tags = Array.from(new Set(allTags)).sort()
  
  // Get visible resources
  const visibleResources = showAll ? resources : resources.slice(0, INITIAL_RESOURCE_COUNT)
  
  // Load resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // First, check environment variables
        console.log('Checking environment variables...')
        try {
          const envCheckResponse = await fetch('/api/env-check')
          const envData = await envCheckResponse.json()
          console.log('Environment check:', envData)
          
          // If MongoDB URI doesn't exist in production, show a helpful error
          if (!envData.mongodb_uri_exists && envData.node_env === 'production') {
            throw new Error('MongoDB URI is not set in Vercel environment variables')
          }
        } catch (envError) {
          console.error('Environment check error:', envError)
        }
        
        // Build query parameters
        const params = new URLSearchParams()
        if (selectedCategory) params.append('category', selectedCategory)
        if (selectedType) params.append('type', selectedType)
        if (selectedTag) params.append('tag', selectedTag)
        if (searchTerm) params.append('search', searchTerm)
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const url = `/api/resources${queryString}`
        
        console.log('Fetching resources:', { 
          url, 
          params: {
            category: selectedCategory,
            type: selectedType,
            tag: selectedTag,
            search: searchTerm
          },
          timestamp: new Date().toISOString() 
        })
        
        // Try fetching debug info first if there's a problem
        let shouldTryDebug = false
        
        // Use fetch with explicit options
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            'Pragma': 'no-cache'
          },
          cache: 'no-store',
          next: { revalidate: 0 }
        })
        
        if (!response.ok) {
          shouldTryDebug = true
          const errorText = await response.text().catch(() => 'Unknown error')
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorText
          })
          
          // If no resources found, try to create a demo resource
          if (!selectedCategory && !selectedType && !selectedTag && !searchTerm) {
            console.log('Trying to create a demo resource...')
            try {
              const demoResponse = await fetch('/api/create-demo-resource')
              const demoData = await demoResponse.json()
              console.log('Demo resource creation result:', demoData)
              
              if (demoData.success) {
                // Retry fetching resources after creating demo resource
                console.log('Retrying resource fetch after demo creation...')
                const retryResponse = await fetch('/api/resources', {
                  cache: 'no-store',
                  headers: { 'Cache-Control': 'no-cache, no-store' }
                })
                
                if (retryResponse.ok) {
                  const retryData = await retryResponse.json()
                  console.log(`Loaded ${retryData.length} resources after demo creation`)
                  setResources(retryData)
                  return // Exit function if successful
                }
              }
            } catch (demoError) {
              console.error('Error creating demo resource:', demoError)
            }
          }
          
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
        
        // Parse JSON response
        let data
        try {
          data = await response.json()
          console.log(`Loaded ${data.length} resources`, { 
            timestamp: new Date().toISOString(),
            sampleId: data.length > 0 ? data[0]._id : 'none' 
          })
          setResources(data)
        } catch (jsonError) {
          shouldTryDebug = true
          console.error('Error parsing JSON response:', jsonError)
          throw new Error('Failed to parse API response')
        }
        
        // If no resources found and no filters applied, try to create a demo resource
        if (data.length === 0 && !selectedCategory && !selectedType && !selectedTag && !searchTerm) {
          console.log('No resources found, trying to create a demo resource...')
          try {
            const demoResponse = await fetch('/api/create-demo-resource')
            const demoData = await demoResponse.json()
            console.log('Demo resource creation result:', demoData)
            
            if (demoData.success) {
              // Retry fetching resources after creating demo resource
              console.log('Retrying resource fetch after demo creation...')
              const retryResponse = await fetch('/api/resources', {
                cache: 'no-store',
                headers: { 'Cache-Control': 'no-cache, no-store' }
              })
              
              if (retryResponse.ok) {
                const retryData = await retryResponse.json()
                console.log(`Loaded ${retryData.length} resources after demo creation`)
                setResources(retryData)
              }
            }
          } catch (demoError) {
            console.error('Error creating demo resource:', demoError)
          }
        }
        
        // If anything went wrong, fetch debug info
        if (shouldTryDebug) {
          try {
            console.log('Fetching debug info due to error')
            await fetch('/api/debug-resources')
              .then(res => res.json())
              .then(debug => console.log('Debug info:', debug))
              .catch(err => console.error('Failed to fetch debug info:', err))
          } catch (debugError) {
            console.error('Error fetching debug info:', debugError)
          }
        }
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError(`Failed to load resources. Please check the console for details or try again later.`)
        
        // Try to get additional debug information
        try {
          console.log('Fetching debug info due to catch block')
          await fetch('/api/debug-resources')
            .then(res => res.json())
            .then(debug => console.log('Debug info:', debug))
            .catch(err => console.error('Failed to fetch debug info:', err))
        } catch (debugError) {
          console.error('Error fetching debug info:', debugError)
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [searchTerm, selectedCategory, selectedType, selectedTag])
  
  // Handle resource deletion
  const handleDeleteResource = async (resourceId: string) => {
    try {
      const response = await fetch(`/api/resources?id=${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        // Remove the deleted resource from the state
        setResources(prevResources => 
          prevResources.filter(resource => resource._id !== resourceId)
        )
      } else {
        console.error('Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
    }
  }
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    setSelectedType('')
    setSelectedTag('')
  }
  
  return (
    <PasswordProtection>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header with Add Button */}
        <div className="mb-8 flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">Resources</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-300">
              Manage your learning materials and resources
            </p>
          </div>
          <Link
            href="/resources/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
          >
            <PlusIcon className="mr-2 h-5 w-5" />
            Add Resource
          </Link>
        </div>
        
        {/* Filters */}
        <div className="mb-6 space-y-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:space-y-0 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search resources..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Category
              </label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                id="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="note">Notes</option>
                <option value="link">Links</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
              </select>
            </div>
            
            {/* Tag Filter */}
            <div>
              <label htmlFor="tag" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tag
              </label>
              <select
                id="tag"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Tags</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleResetFilters}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {/* Error State */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
            {error}
          </div>
        )}
        
        {/* Loading State */}
        {loading ? (
          <div className="my-12 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          </div>
        ) : resources.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-12 text-center dark:bg-gray-800">
            <div className="mx-auto mb-4 h-16 w-16 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No resources found</h3>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              {searchTerm || selectedCategory || selectedType || selectedTag
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by creating your first resource'}
            </p>
            <Link
              href="/resources/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
            >
              <PlusIcon className="mr-2 -ml-1 inline h-5 w-5" />
              Add New Resource
            </Link>
          </div>
        ) : (
          <>
            {/* Resources Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleResources.map((resource) => (
                <ResourceCard 
                  key={resource._id} 
                  resource={resource} 
                  onDelete={() => handleDeleteResource(resource._id)} 
                />
              ))}
            </div>
            
            {/* View More Button - Only show if there are more than the initial count */}
            {!showAll && resources.length > INITIAL_RESOURCE_COUNT && (
              <div className="mt-8 flex justify-center">
                <Link 
                  href="/resources/all"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
                >
                  View All Resources
                  <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </PasswordProtection>
  )
} 