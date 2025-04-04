'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, FolderIcon, DocumentTextIcon, VideoCameraIcon, LinkIcon, TagIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import ResourceCard from '@/app/components/ResourceCard'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'command'

// Predefined categories
const CATEGORIES = [
  'Machine Learning',
  'Web Development',
  'Java',
  'Software Engineering',
  'GDG',
  'Computer Networks',
  'Compiler Design',
  'Other'
] as const;

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
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  
  // Get all unique tags from resources and sort them
  const tags = useMemo(() => {
    const allTags = resources.flatMap(r => r.tags).filter(Boolean)
    return Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b))
  }, [resources])

  // Reset selected tag if it no longer exists in the resources
  useEffect(() => {
    if (selectedTag && !tags.includes(selectedTag)) {
      setSelectedTag('')
    }
  }, [tags, selectedTag])
  
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Check admin and auth status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('Checking admin status...');
        const response = await fetch('/api/auth/check-admin');
        const data = await response.json();
        console.log('Admin check response:', data);
        setIsAdmin(data.isAdmin);
        setIsAuthenticated(data.isAuthenticated);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsAuthenticated(false);
      }
    };
    
    checkStatus();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <div className="flex gap-4">
          {!isAuthenticated ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Admin Access
            </Link>
          ) : (
            <>
              {isAdmin && (
                <Link
                  href="/resources/new"
                  className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <PlusIcon className="mr-2 h-5 w-5" />
                  Add New
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </>
          )}
        </div>
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
              {CATEGORIES.map((category) => (
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
              <option value="command">Commands</option>
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
      
      {/* Resources Display */}
      {loading ? (
        <div className="mt-8 flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Loading resources...</span>
        </div>
      ) : error ? (
        <div className="mt-8 rounded-lg bg-red-100 p-4 dark:bg-red-900/30">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p>{error}</p>
                <p className="mt-2">
                  Please verify your database connection in the{" "}
                  <Link href="/db-test" className="font-medium underline">
                    database test page
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : resources.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <FolderIcon className="h-16 w-16 text-gray-400" />
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No resources found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory || selectedType || selectedTag
              ? "No resources match your current filters. Try changing or clearing your filters."
              : isAdmin ? "Get started by creating your first resource." : "No resources available yet."}
          </p>
          {!isAuthenticated ? (
            <div className="mt-6">
              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Admin Access
              </Link>
            </div>
          ) : isAdmin && (
            <div className="mt-6">
              <Link 
                href="/resources/new" 
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Add Resource
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard 
              key={resource._id} 
              resource={resource}
              isAdmin={isAdmin}
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      )}
    </div>
  )
} 