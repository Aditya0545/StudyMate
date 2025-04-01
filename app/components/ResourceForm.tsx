'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import YoutubePreview from './YoutubePreview'
import { getVideoMetadata } from '@/app/lib/youtube'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'command'

interface ResourceFormProps {
  initialData?: {
    id?: string
    title: string
    description: string
    type: ResourceType
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
  isEditing?: boolean
}

// List of tag colors for variety (same as in ResourceCard)
const TAG_COLORS = [
  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
  'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
]

export default function ResourceForm({ 
  initialData = { 
    title: '', 
    description: '', 
    type: 'note' as ResourceType, 
    url: '', 
    content: '',
    tags: [],
    category: ''
  }, 
  isEditing = false 
}: ResourceFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isLoadingVideoData, setIsLoadingVideoData] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  
  // Updated categories
  const categories = [
    'Machine Learning',
    'Web Development',
    'Java',
    'Software Engineering',
    'GDG',
    'Computer Networks',
    'Compiler Design',
    'Other'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If changing type, reset type-specific fields
    if (name === 'type' && value !== formData.type) {
      const resetData = {
        ...formData,
        [name]: value as ResourceType
      }
      
      if (value !== 'link' && value !== 'video') {
        resetData.url = ''
      }
      
      if (value !== 'note' && value !== 'command') {
        resetData.content = ''
      }
      
      // Reset video preview when changing away from video type
      if (value !== 'video') {
        setShowVideoPreview(false)
        setVideoPreviewUrl('')
      }
      
      setFormData(resetData)
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
      
      // Handle URL changes for YouTube videos
      if (name === 'url' && formData.type === 'video') {
        // Debounce video preview if needed
        setVideoPreviewUrl(value)
        setShowVideoPreview(!!value)
        
        // Fetch video metadata when URL changes
        handleFetchVideoMetadata(value)
      }
    }
  }
  
  // Function to fetch YouTube video metadata
  const handleFetchVideoMetadata = async (url: string) => {
    if (!url || formData.type !== 'video') return
    
    setIsLoadingVideoData(true)
    try {
      const videoData = await getVideoMetadata(url)
      
      if (videoData) {
        // Auto-fill title and description if they're empty
        if (!formData.title || formData.title === initialData.title) {
          setFormData(prev => ({
            ...prev,
            title: videoData.title
          }))
        }
        
        if (!formData.description || formData.description === initialData.description) {
          setFormData(prev => ({
            ...prev,
            description: videoData.description
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching video metadata:', error)
      // Don't show an error message to the user - just continue without metadata
    } finally {
      setIsLoadingVideoData(false)
    }
  }

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  // Get tag color based on tag string (same as in ResourceCard)
  const getTagColor = (tag: string) => {
    // Use hash code of the tag string to consistently get the same color for the same tag
    const hashCode = tag.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // Use positive modulo to get an index in the TAG_COLORS array
    const index = Math.abs(hashCode % TAG_COLORS.length);
    return TAG_COLORS[index];
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required'
    }
    
    if (formData.type === 'link' || formData.type === 'video') {
      if (!formData.url) {
        newErrors.url = 'URL is required for links and videos'
      } else if (!isValidUrl(formData.url)) {
        newErrors.url = 'Please enter a valid URL'
      }
    }
    
    if ((formData.type === 'note' || formData.type === 'command') && !formData.content?.trim()) {
      newErrors.content = 'Content is required for notes and commands'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    setErrors({})
    
    try {
      const endpoint = isEditing 
        ? `/api/resources?id=${initialData.id}` 
        : '/api/resources'
      
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save resource')
      }
      
      // Redirect to resources page after successful submission
      router.push('/resources')
      router.refresh()
    } catch (error) {
      console.error('Error saving resource:', error)
      setErrors({
        form: error instanceof Error ? error.message : 'Failed to save resource. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        {isEditing ? 'Edit Resource' : 'Add New Resource'}
      </h2>
      
      {errors.form && (
        <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
          <p className="text-sm text-red-700 dark:text-red-200">{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Type */}
        <div>
          <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Resource Type <span className="text-red-500">*</span>
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          >
            <option value="note">Note</option>
            <option value="link">Link</option>
            <option value="video">YouTube Video</option>
            <option value="document">Document</option>
            <option value="command">Command</option>
          </select>
        </div>
        
        {/* URL for links and videos */}
        {(formData.type === 'link' || formData.type === 'video') && (
          <div>
            <label htmlFor="url" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder={formData.type === 'video' ? 'Enter YouTube URL' : 'Enter website URL'}
            />
            {errors.url && <p className="mt-1 text-sm text-red-500">{errors.url}</p>}
            
            {/* YouTube Video Preview */}
            {formData.type === 'video' && showVideoPreview && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Video Preview</p>
                {isLoadingVideoData ? (
                  <div className="flex h-40 items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                ) : (
                  <YoutubePreview url={videoPreviewUrl} className="rounded-lg shadow" />
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Title */}
        <div>
          <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Enter a title for your resource"
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            placeholder="Add a brief description"
          />
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-500">{errors.category}</p>}
        </div>
        
        {/* Content for notes and commands */}
        {(formData.type === 'note' || formData.type === 'command') && (
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              {formData.type === 'command' ? 'Command' : 'Content'} <span className="text-red-500">*</span>
            </label>
            {formData.type === 'command' ? (
              <div className="space-y-4">
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 font-mono text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                  placeholder="Enter your command(s) here. For multiple commands, put each on a new line."
                />
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Tips:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>Use one line per command</li>
                    <li>Include any necessary flags or arguments</li>
                    <li>Add comments using # to explain complex commands</li>
                  </ul>
                </div>
              </div>
            ) : (
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Write your notes here (Markdown supported)"
              />
            )}
            {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
          </div>
        )}
        
        {/* Tags */}
        <div>
          <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Tags
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="tagInput"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Add tags and press Enter"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span 
                  key={tag} 
                  className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTagColor(tag)}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleTagRemove(tag)}
                    className="ml-1.5 text-current hover:text-current/80"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-70 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Resource' : 'Save Resource'}
          </button>
        </div>
      </form>
    </div>
  )
} 