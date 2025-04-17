'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import YoutubePreview from './YoutubePreview'
import { getVideoMetadata } from '@/app/lib/youtube'
import { CATEGORIES, CategoryType, TAG_COLORS } from '@/constants'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'command'

interface ResourceFormProps {
  initialData?: {
    _id?: string
    title: string
    description: string
    type: ResourceType
    url?: string
    content?: string
    tags: string[]
    categories: string[]
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
  lockerId?: string
}

interface ResourceFormData {
  _id?: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  content?: string;
  tags: string[];
  categories: string[];
  videoMetadata?: {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  };
  urlMetadata?: {
    title: string;
    description: string;
    image: string;
    url: string;
  };
}

export default function ResourceForm({
  initialData,
  isEditing = false,
  lockerId,
}: {
  initialData?: ResourceFormData;
  isEditing?: boolean;
  lockerId?: string;
}) {
  const router = useRouter()
  const [formData, setFormData] = useState<ResourceFormData>(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    type: initialData?.type || 'note',
    url: initialData?.url || '',
    content: initialData?.content || '',
    tags: initialData?.tags || [],
    categories: initialData?.categories || [],
    videoMetadata: initialData?.videoMetadata,
    urlMetadata: initialData?.urlMetadata,
    _id: initialData?._id
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isLoadingVideoData, setIsLoadingVideoData] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(initialData?.url || '')
  const [showVideoPreview, setShowVideoPreview] = useState(!!initialData?.url && initialData?.type === 'video')
  const [error, setError] = useState<string | null>(null)
  
  // Get all unique categories from resources
  const [allCategories, setAllCategories] = useState<string[]>([])

  // Fetch all categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/resources/categories');
        if (response.ok) {
          const data = await response.json();
          setAllCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // If changing type, reset type-specific fields
    if (name === 'type' && value !== formData.type) {
      const resetData = {
        ...formData,
        [name]: value as ResourceType,
        url: '',
        content: '',
        videoMetadata: undefined
      }
      
      // Reset video preview when changing away from video type
      if (value !== 'video') {
        setShowVideoPreview(false)
        setVideoPreviewUrl('')
      }
      
      setFormData(resetData)
    } else if (name === 'content' && formData.type === 'note') {
      // For notes, detect and format URLs in content
      const formattedContent = formatUrlsInContent(value)
      setFormData({
        ...formData,
        [name]: formattedContent
      })
    } else {
      const newFormData = {
        ...formData,
        [name]: value
      }
      
      // Handle URL changes for YouTube videos
      if (name === 'url' && formData.type === 'video') {
        setVideoPreviewUrl(value)
        setShowVideoPreview(!!value)
        
        // Only fetch new metadata if URL has changed from initial
        if (value !== initialData?.url) {
          handleFetchVideoMetadata(value)
        }
      }
      
      setFormData(newFormData)
    }
  }
  
  // Function to fetch YouTube video metadata
  const handleFetchVideoMetadata = async (url: string) => {
    if (!url || formData.type !== 'video') return
    
    setIsLoadingVideoData(true)
    setError(null)
    
    try {
      const videoData = await getVideoMetadata(url)
      
      if (videoData) {
        // Auto-fill title and description if they're empty
        const shouldUpdateTitle = !formData.title || (initialData && formData.title === initialData.title)
        const shouldUpdateDescription = !formData.description || (initialData && formData.description === initialData.description)
        
        setFormData(prev => ({
          ...prev,
          ...(shouldUpdateTitle ? { title: videoData.title } : {}),
          ...(shouldUpdateDescription ? { description: videoData.description } : {}),
          videoMetadata: videoData
        }))
      } else {
        setError('Could not fetch video metadata. Please check the URL and try again.')
      }
    } catch (error) {
      console.error('Error fetching video metadata:', error)
      setError('Failed to fetch video details. Please try again.')
    } finally {
      setIsLoadingVideoData(false)
    }
  }

  // Function to detect and format URLs in content
  const formatUrlsInContent = (content: string): string => {
    // First, preserve any existing markdown links
    const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
    let formattedContent = content.replace(markdownLinkRegex, (match) => match)

    // Handle bit.ly and other URLs
    const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+)/gi
    formattedContent = formattedContent.replace(urlRegex, (url) => {
      try {
        // Clean up the URL
        const cleanUrl = url.trim()
        let fullUrl = cleanUrl
        
        // Add protocol to bit.ly links if missing
        if (cleanUrl.startsWith('bit.ly/')) {
          fullUrl = `https://${cleanUrl}`
        }
        
        // Create display text
        const displayText = cleanUrl
          .replace(/^https?:\/\//, '') // Remove protocol
          .replace(/\/$/, '')          // Remove trailing slash

        // Format as markdown link
        return `[${displayText}](${fullUrl})`
      } catch {
        // If URL parsing fails, still make it clickable
        return `[${url}](${url})`
      }
    })

    return formattedContent
  }

  // Function to validate URLs
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  // Handle pasting URLs
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (formData.type !== 'note') return
    
    const pastedText = e.clipboardData.getData('text')
    const urlRegex = /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+)/gi
    
    if (urlRegex.test(pastedText)) {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      const formattedText = formatUrlsInContent(pastedText)
      
      const currentContent = formData.content || ''
      const newContent = 
        currentContent.substring(0, start) +
        formattedText +
        currentContent.substring(end)
      
      setFormData({
        ...formData,
        content: newContent
      })
    }
  }

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (formData.type === 'note') {
      const formattedContent = formatUrlsInContent(value)
      setFormData({
        ...formData,
        content: formattedContent
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
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
    
    if (formData.type === 'link' || formData.type === 'video') {
      if (!formData.url) {
        newErrors.url = 'URL is required'
      } else if (!isValidUrl(formData.url)) {
        newErrors.url = 'Please enter a valid URL'
      }
    }
    
    if (formData.type === 'note' || formData.type === 'command') {
      if (!formData.content) {
        newErrors.content = 'Content is required'
      }
    }
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setErrors(errors)
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const endpoint = lockerId 
        ? `/api/private-resources${isEditing && initialData?._id ? `?id=${initialData._id}&lockerId=${lockerId}` : `?lockerId=${lockerId}`}`
        : `/api/resources${isEditing && initialData?._id ? `?id=${initialData._id}` : ''}`
      
      const password = lockerId 
        ? localStorage.getItem(`locker-${lockerId}`)
        : localStorage.getItem('admin-password')
      
      if (!password) {
        if (lockerId) {
          router.push('/private-resources')
        } else {
          router.push('/login')
        }
        return
      }

      const response = await fetch(endpoint, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(lockerId 
            ? { 'X-Locker-Password': password }
            : { 'X-Admin-Password': password }
          )
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 401) {
          // Clear the password if unauthorized
          if (lockerId) {
            localStorage.removeItem(`locker-${lockerId}`)
            router.push('/private-resources')
          } else {
            localStorage.removeItem('admin-password')
            router.push('/login')
          }
          return
        }
        throw new Error(data.error || 'Failed to save resource')
      }

      // Redirect after successful submission
      if (lockerId) {
        router.push(`/private-resources/${lockerId}`)
      } else {
        router.push('/resources')
      }
      router.refresh()
    } catch (error) {
      console.error('Error submitting form:', error)
      setError(error instanceof Error ? error.message : 'Failed to save resource')
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
          <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
            Category <span className="text-red-500">*</span>
          </label>
          
          {/* Predefined Categories */}
          <div className="mb-3 flex flex-wrap gap-2">
            {(Object.keys(CATEGORIES) as CategoryType[]).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    categories: prev.categories.includes(category) 
                      ? prev.categories.filter(c => c !== category)
                      : [...prev.categories, category]
                  }));
                }}
                className={`
                  relative overflow-hidden rounded-full px-4 py-2 text-sm font-medium transition-all duration-300
                  ${formData.categories.includes(category)
                    ? `${CATEGORIES[category]} shadow-md transform scale-105`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
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
              <div className="space-y-2">
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleContentChange}
                  onPaste={handlePaste}
                  rows={10}
                  className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 font-mono"
                  placeholder="Write your notes here (all links will be clickable)"
                />
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700/50">
                  <h4 className="mb-2 text-sm font-medium text-gray-900 dark:text-gray-200">Tips:</h4>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <li>All links will be automatically made clickable</li>
                    <li>Links will be underlined and easy to identify</li>
                    <li>Works with both regular URLs and short links (bit.ly)</li>
                    <li>Just paste or type your links normally</li>
                  </ul>
                </div>
              </div>
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