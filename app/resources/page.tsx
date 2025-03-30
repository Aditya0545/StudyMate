'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ResourceCard from '@/app/components/ResourceCard'

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
  
  // Get all unique categories and tags from resources
  const categories = [...new Set(resources.map(r => r.category))].filter(Boolean).sort()
  const allTags = resources.flatMap(r => r.tags).filter(Boolean)
  const tags = [...new Set(allTags)].sort()
  
  // Load resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true)
        
        const params = new URLSearchParams()
        if (selectedCategory) params.append('category', selectedCategory)
        if (selectedType) params.append('type', selectedType)
        if (selectedTag) params.append('tag', selectedTag)
        if (searchTerm) params.append('search', searchTerm)
        
        const queryString = params.toString() ? `?${params.toString()}` : ''
        const response = await fetch(`/api/resources${queryString}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch resources')
        }
        
        const data = await response.json()
        setResources(data)
      } catch (err) {
        console.error('Error fetching resources:', err)
        setError('Failed to load resources. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchResources()
  }, [searchTerm, selectedCategory, selectedType, selectedTag])
  
  // Handle resource deletion
  const handleDeleteResource = async (id: string) => {
    try {
      const response = await fetch(`/api/resources?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete resource')
      }
      
      // Remove resource from state
      setResources(prevResources => prevResources.filter(r => r._id !== id))
    } catch (err) {
      console.error('Error deleting resource:', err)
      setError('Failed to delete resource. Please try again.')
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Resources</h1>
        <Link
          href="/resources/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Add New Resource
        </Link>
      </div>
      
      {/* Filters */}
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or description"
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          
          <div>
            <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Type
            </label>
            <select
              id="type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
              <option value="">All Types</option>
              <option value="note">Notes</option>
              <option value="link">Links</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="tag" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tag
            </label>
            <select
              id="tag"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
              <option value="">All Tags</option>
              {tags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={handleResetFilters}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Reset Filters
          </button>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}
      
      {/* Resources Grid */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {resources.map((resource) => (
            <ResourceCard 
              key={resource._id} 
              resource={resource} 
              onDelete={handleDeleteResource}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl bg-white p-8 text-center shadow-md dark:bg-gray-800">
          <p className="text-xl text-gray-600 dark:text-gray-300">No resources found.</p>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {searchTerm || selectedCategory || selectedType || selectedTag 
              ? 'Try adjusting your filters or search term.'
              : 'Get started by adding your first resource.'}
          </p>
          {!searchTerm && !selectedCategory && !selectedType && !selectedTag && (
            <Link
              href="/resources/new"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Add New Resource
            </Link>
          )}
        </div>
      )}
    </div>
  )
} 