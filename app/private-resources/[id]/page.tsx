'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import ResourceCard from '@/app/components/ResourceCard'

interface Resource {
  _id: string
  title: string
  description: string
  type: 'note' | 'link' | 'video' | 'document' | 'command'
  url?: string
  content?: string
  tags: string[]
  categories: string[]
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

interface Locker {
  _id: string
  name: string
}

export default function PrivateLockerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [locker, setLocker] = useState<Locker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedTag, setSelectedTag] = useState<string>('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)

  // Get all unique tags from resources
  const tags = Array.from(new Set(resources.flatMap(r => r.tags).filter(Boolean))).sort()

  // Get all unique categories from resources
  const categories = Array.from(new Set(resources.flatMap(r => r.categories))).sort()

  // Fetch locker and resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get locker password from localStorage
        const password = localStorage.getItem(`locker-${params.id}`)
        if (!password) {
          router.push('/private-resources')
          return
        }

        // Fetch locker details
        const lockerResponse = await fetch(`/api/lockers?id=${params.id}&password=${password}`)
        if (!lockerResponse.ok) {
          throw new Error('Failed to fetch locker')
        }
        const lockerData = await lockerResponse.json()
        setLocker(lockerData)

        // Fetch resources
        const resourcesResponse = await fetch(`/api/private-resources?lockerId=${params.id}`, {
          headers: {
            'X-Locker-Password': password,
          },
        })
        
        if (!resourcesResponse.ok) {
          if (resourcesResponse.status === 401) {
            localStorage.removeItem(`locker-${params.id}`)
            router.push('/private-resources')
            return
          }
          throw new Error('Failed to fetch resources')
        }
        
        const resourcesData = await resourcesResponse.json()
        setResources(resourcesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.id, router])

  // Handle resource deletion
  const handleDeleteResource = async (resourceId: string) => {
    try {
      const password = localStorage.getItem(`locker-${params.id}`)
      if (!password) {
        router.push('/private-resources')
        return
      }

      const response = await fetch(`/api/private-resources?id=${resourceId}&lockerId=${params.id}`, {
        method: 'DELETE',
        headers: {
          'X-Locker-Password': password,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          localStorage.removeItem(`locker-${params.id}`)
          router.push('/private-resources')
          return
        }
        throw new Error(errorData.error || 'Failed to delete resource')
      }

      // Only update UI if deletion was successful
      setResources(prevResources => 
        prevResources.filter(resource => resource._id !== resourceId)
      )
      setShowDeleteConfirm(false)
      setResourceToDelete(null)
      setError(null) // Clear any existing error messages
    } catch (error) {
      console.error('Error deleting resource:', error)
      setError(error instanceof Error ? error.message : 'Failed to delete resource. Please try again.')
      // Keep the modal open when there's an error
      setShowDeleteConfirm(false)
    }
  }

  // Handle edit navigation
  const handleEditResource = (resourceId: string) => {
    router.push(`/private-resources/${params.id}/edit/${resourceId}`)
  }

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchTerm === '' || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === '' || resource.categories.includes(selectedCategory)
    const matchesType = selectedType === '' || resource.type === selectedType
    const matchesTag = selectedTag === '' || resource.tags.includes(selectedTag)
    
    return matchesSearch && matchesCategory && matchesType && matchesTag
  })

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading resources...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/private-resources"
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeftIcon className="mr-2 h-5 w-5" />
            Back to Lockers
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {locker?.name || 'Private Resources'}
          </h1>
        </div>
        <Link
          href={`/private-resources/${params.id}/new`}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
      </div>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <div className="mt-8 rounded-lg border-2 border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-medium text-gray-900 dark:text-white">No resources found</h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory || selectedType || selectedTag
              ? "No resources match your current filters. Try changing or clearing your filters."
              : "Get started by creating your first resource."}
          </p>
          <div className="mt-6">
            <Link
              href={`/private-resources/${params.id}/new`}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PlusIcon className="mr-2 h-5 w-5" />
              Add Resource
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={{
                ...resource,
                lockerId: params.id
              }}
              isAdmin={true}
              onDelete={(id) => {
                setResourceToDelete(id)
                setShowDeleteConfirm(true)
              }}
              className="h-full"
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Delete Resource
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setResourceToDelete(null)
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => resourceToDelete && handleDeleteResource(resourceToDelete)}
                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 