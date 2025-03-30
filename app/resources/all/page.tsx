'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import ResourceCard from '@/app/components/ResourceCard'
import PasswordProtection from '@/app/components/PasswordProtection'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'driveLink'

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

export default function AllResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const RESOURCES_PER_PAGE = 12
  
  // Filter
  const [searchTerm, setSearchTerm] = useState('')
  
  // Load resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Build query parameters
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const url = `/api/resources${queryString}`
        
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
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
        
        // Parse JSON response
        const data = await response.json()
        setResources(data)
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError(`Failed to load resources. Please check the console for details or try again later.`)
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [searchTerm])
  
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
  
  // Calculate current page resources
  const indexOfLastResource = currentPage * RESOURCES_PER_PAGE
  const indexOfFirstResource = indexOfLastResource - RESOURCES_PER_PAGE
  const currentResources = resources.slice(indexOfFirstResource, indexOfLastResource)
  const totalPages = Math.ceil(resources.length / RESOURCES_PER_PAGE)
  
  // Handle page change
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  return (
    <PasswordProtection>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4">
            <Link 
              href="/resources" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Back to Resources
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">All Resources</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            Browse all your learning materials and resources
          </p>
        </div>
        
        {/* Search Filter */}
        <div className="mb-8">
          <div className="flex rounded-md shadow-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resources..."
              className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500"
            />
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
              {searchTerm ? 'Try adjusting your search criteria' : 'Get started by creating your first resource'}
            </p>
            <Link
              href="/resources/new"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
            >
              Add New Resource
            </Link>
          </div>
        ) : (
          <>
            {/* Resource Count */}
            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Showing {indexOfFirstResource + 1}-{Math.min(indexOfLastResource, resources.length)} of {resources.length} resources
            </div>
            
            {/* Resources Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentResources.map((resource) => (
                <ResourceCard 
                  key={resource._id} 
                  resource={resource} 
                  onDelete={() => handleDeleteResource(resource._id)} 
                />
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`inline-flex items-center rounded-l-md px-2 py-2 ${
                      currentPage === 1
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => paginate(index + 1)}
                      className={`inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === index + 1
                          ? 'z-10 bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`inline-flex items-center rounded-r-md px-2 py-2 ${
                      currentPage === totalPages
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </PasswordProtection>
  )
} 