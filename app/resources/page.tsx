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
  }, [searchTerm, selectedCategory, selectedType, selectedTag])
  
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
    setSelectedCategory('')
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
    return resources.filter(resource => {
      const matchesSearch = searchTerm === '' || 
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === '' || resource.category === selectedCategory
      const matchesType = selectedType === '' || resource.type === selectedType
      const matchesTag = selectedTag === '' || resource.tags.includes(selectedTag)
      
      return matchesSearch && matchesCategory && matchesType && matchesTag
    })
  }, [resources, searchTerm, selectedCategory, selectedType, selectedTag])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Resources</h1>
        <div className="flex gap-4">
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
                className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Add New
              </Link>
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
              </div>
            </div>
          </div>
        </div>
      ) : filteredResources.length === 0 ? (
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
          {isAdmin && (
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
          {filteredResources.map((resource) => (
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