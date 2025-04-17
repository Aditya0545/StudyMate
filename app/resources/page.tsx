'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { PlusIcon, FolderIcon, DocumentTextIcon, VideoCameraIcon, LinkIcon, TagIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'
import ResourceCard from '@/app/components/ResourceCard'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'command'

// Remove or comment out the predefined CATEGORIES
// const CATEGORIES = [ ... ] as const;

interface Resource {
  _id: string
  title: string
  description: string
  type: ResourceType
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

export default function ResourcesPage() {
  const router = useRouter()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
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
  
  // Get all unique categories from resources and sort them
  const categories = useMemo(() => {
    const allCategories = resources.flatMap(r => r.categories || []).filter(Boolean)
    return Array.from(new Set(allCategories)).sort((a, b) => a.localeCompare(b))
  }, [resources])

  // Reset selected category if it no longer exists in the resources
  useEffect(() => {
    if (selectedCategories.length > 0 && !categories.includes(selectedCategories[0])) {
      setSelectedCategories([])
    }
  }, [categories, selectedCategories])
  
  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache, no-store' }
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        setResources(data)
      } catch (error) {
        console.error('Error fetching resources:', error)
        setError('Failed to load resources. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [])
  
  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get admin password from localStorage
        const adminPassword = localStorage.getItem('admin-password');
        if (!adminPassword) {
          setIsAdmin(false);
          return;
        }

        const response = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'X-Admin-Password': adminPassword
          }
        });
        
        const data = await response.json();
        setIsAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          localStorage.removeItem('admin-password');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        localStorage.removeItem('admin-password');
      }
    };
    
    checkAdminStatus();
  }, []);

  // Handle resource deletion
  const handleDeleteResource = async (resourceId: string) => {
    try {
      const adminPassword = localStorage.getItem('admin-password');
      if (!adminPassword) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/resources?id=${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': adminPassword
        }
      });
      
      if (response.ok) {
        setResources(prevResources => 
          prevResources.filter(resource => resource._id !== resourceId)
        );
      } else if (response.status === 401) {
        localStorage.removeItem('admin-password');
        router.push('/login');
      } else {
        console.error('Failed to delete resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategories([])
    setSelectedType('')
    setSelectedTag('')
  }

  const handleLogout = () => {
    localStorage.removeItem('admin-password');
    setIsAdmin(false);
    router.refresh();
  };

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategories = selectedCategories.length === 0 || 
        selectedCategories.some(cat => resource.categories?.includes(cat))
      
      const matchesType = !selectedType || resource.type === selectedType
      
      const matchesTag = !selectedTag || resource.tags.includes(selectedTag)
      
      return matchesSearch && matchesCategories && matchesType && matchesTag
    })
  }, [resources, searchTerm, selectedCategories, selectedType, selectedTag])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl sm:text-4xl font-bold animated-heading-main">Resources</h1>
        <div className="flex items-center space-x-4">
          {!isAdmin ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              Admin Login
            </Link>
          ) : (
            <>
              <Link
                href="/resources/new"
                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Add New
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                Logout
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Filters Section */}
      <div className="mb-4 space-y-3 rounded-lg bg-white p-3 shadow dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="w-full">
            <label htmlFor="search" className="mb-1 block text-sm font-medium animated-heading-accent">
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
          <div className="w-full">
            <label htmlFor="category" className="mb-1 block text-sm font-medium animated-heading-accent">
              Category
            </label>
            <select
              id="category"
              value={selectedCategories.length ? selectedCategories[0] : ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedCategories(value ? [value] : []);
              }}
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
          <div className="w-full">
            <label htmlFor="type" className="mb-1 block text-sm font-medium animated-heading-accent">
              Type
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="">All Types</option>
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="command">Command</option>
            </select>
          </div>

          {/* Tag Filter */}
          <div className="w-full">
            <label htmlFor="tag" className="mb-1 block text-sm font-medium animated-heading-accent">
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
        <div className="flex justify-end pt-2">
          <button
            onClick={handleResetFilters}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-6">
            <div className="animate-pulse flex space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-400"></div>
              <div className="space-y-3">
                <div className="h-3 w-20 rounded bg-blue-400"></div>
                <div className="h-3 w-32 rounded bg-blue-400"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="col-span-full flex items-center justify-center py-6 text-red-500">
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </span>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-6 px-4">
            <div className="text-center mb-4">
              {searchTerm || selectedCategories.length > 0 || selectedType || selectedTag ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No resources found for your filters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {searchTerm && `No matches for "${searchTerm}"`}
                    {selectedCategories.length > 0 && ` in category "${selectedCategories[0]}"`}
                    {selectedType && ` of type "${selectedType}"`}
                    {selectedTag && ` with tag "${selectedTag}"`}
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    Clear all filters
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    No resources added yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Get started by adding your first resource
                  </p>
                </>
              )}
            </div>
            {isAdmin && (
              <Link
                href="/resources/new"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add New Resource
              </Link>
            )}
          </div>
        ) : (
          <div className="col-span-full">
            {/* All Cards in one grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {filteredResources.map((resource) => (
                <ResourceCard
                  key={resource._id}
                  resource={resource}
                  isAdmin={isAdmin}
                  onDelete={() => handleDeleteResource(resource._id)}
                  className="h-full"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 