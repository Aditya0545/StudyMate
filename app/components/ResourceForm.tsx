'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import YoutubePreview from './YoutubePreview'
import { getVideoMetadata } from '@/app/lib/youtube'
import { createDriveResourceLink } from '@/app/lib/drive'

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'driveLink'

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
    driveMetadata?: {
      name: string
      fileType: string
      thumbnailLink: string
    }
  }
  isEditing?: boolean
  onGoogleDriveSelect?: () => Promise<any>
}

// Define the ResourceFormData interface to match the form data structure
interface ResourceFormData {
  id?: string
  title: string
  description: string
  type: ResourceType
  url?: string
  content?: string
  tags: string[]
  category: string
  urlMetadata?: any
  videoMetadata?: {
    id: string
    title: string
    description: string
    thumbnail: string
    channelTitle: string
    publishedAt: string
  }
  driveMetadata?: {
    name: string
    fileType: string
    thumbnailLink: string
  }
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
    type: 'driveLink' as ResourceType,
    url: '', 
    content: '',
    tags: [],
    category: ''
  }, 
  isEditing = false,
  onGoogleDriveSelect
}: ResourceFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<ResourceFormData>({
    ...initialData,
    type: initialData?.type || 'note',
  })
  const [errors, setErrors] = useState<Record<string, string | null>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [isLoadingVideoData, setIsLoadingVideoData] = useState(false)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState('')
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  
  // Resource categories based on PRD
  const categories = [
    'AI',
    'Programming',
    'Cybersecurity',
    'Math',
    'Science',
    'Language',
    'History',
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
      
      if (value !== 'note') {
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
    
    if (formData.type === 'note' && !formData.content?.trim()) {
      newErrors.content = 'Content is required for notes'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Make API call to our backend
      const response = await fetch('/api/resources', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save resource');
      }
      
      // Redirect to resources page after submit
      router.push('/resources')
      
    } catch (error) {
      console.error('Error submitting resource:', error)
      setErrors({ form: 'Failed to save resource. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Drive file selection when the user selects a file
  const handleDriveFileSelect = async () => {
    if (!onGoogleDriveSelect) {
      console.error('Google Drive selection function not provided');
      return;
    }
    
    try {
      // Show loading state
      setIsSubmitting(true);
      
      // Call the provided callback to handle selecting a Drive file
      const driveMetadata = await onGoogleDriveSelect();
      
      // Reset loading state
      setIsSubmitting(false);
      
      if (!driveMetadata) {
        console.log('User cancelled selection or selection failed');
        setErrors({
          ...errors,
          form: 'Google Drive file selection was cancelled or failed. Please try again or select a different resource type.'
        });
        return;
      }
      
      console.log('Drive file selected:', driveMetadata);
      
      // Update form data with the Drive file information
      setFormData({
        ...formData,
        title: driveMetadata.name || formData.title,
        description: driveMetadata.description || formData.description,
        url: `drive:${driveMetadata.fileId}`, // Store as a drive: URL scheme
        urlMetadata: {
          ...driveMetadata,
          // Ensure these critical properties are present
          fileId: driveMetadata.fileId,
          name: driveMetadata.name || formData.title,
          mimeType: driveMetadata.mimeType || 'application/vnd.google-apps.document',
          embedLink: driveMetadata.embedLink || `https://docs.google.com/document/d/${driveMetadata.fileId}/preview`,
          webViewLink: driveMetadata.webViewLink || `https://docs.google.com/document/d/${driveMetadata.fileId}/edit`
        }
      });
      
      // Clear validation errors
      setErrors({
        ...errors,
        url: null,
        form: null
      });
      
    } catch (error) {
      console.error('Error selecting Drive file:', error);
      setIsSubmitting(false);
      
      // Show error message
      setErrors({
        ...errors,
        form: 'Failed to select Google Drive file. Please check your Google Drive permissions and try again.'
      });
    }
  };

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
        <div className="mb-4">
          <label htmlFor="type" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
            Type
          </label>
          <div className="flex flex-col space-y-2">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            >
              <option value="note">Note</option>
              <option value="link">Link</option>
              <option value="video">Video</option>
              <option value="document">Document</option>
              <option value="driveLink">Google Drive File</option>
            </select>
            
            {/* Google Drive button - only show when type is driveLink */}
            {formData.type === 'driveLink' && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={handleDriveFileSelect}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center rounded-lg bg-blue-50 px-4 py-3 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  {isSubmitting ? (
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></span>
                  ) : (
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                    </svg>
                  )}
                  Select Google Drive File
                </button>
              </div>
            )}
          </div>
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
        
        {/* Content for notes */}
        {formData.type === 'note' && (
          <div>
            <label htmlFor="content" className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-200">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows={10}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Write your notes here (Markdown supported)"
            />
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
        
        {/* Preview for Google Drive files */}
        {formData.type === 'driveLink' && formData.urlMetadata && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Selected Google Drive File</h3>
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 dark:border-gray-700">
                {formData.urlMetadata.thumbnailLink ? (
                  <img 
                    src={formData.urlMetadata.thumbnailLink} 
                    alt={formData.urlMetadata.name || 'File thumbnail'} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // If thumbnail fails to load, show an icon based on the file type
                      const target = e.target as HTMLImageElement;
                      if (formData.urlMetadata?.mimeType) {
                        if (formData.urlMetadata.mimeType.includes('document')) {
                          target.src = 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.document';
                        } else if (formData.urlMetadata.mimeType.includes('spreadsheet')) {
                          target.src = 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.spreadsheet';
                        } else if (formData.urlMetadata.mimeType.includes('presentation')) {
                          target.src = 'https://drive-thirdparty.googleusercontent.com/16/type/application/vnd.google-apps.presentation';
                        } else {
                          target.src = 'https://drive-thirdparty.googleusercontent.com/16/type/application/octet-stream';
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 dark:text-white">{formData.urlMetadata.name || 'Unknown file'}</h4>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {formData.urlMetadata.mimeType ? (
                    formData.urlMetadata.mimeType.includes('google-apps.document') ? 'Google Doc' :
                    formData.urlMetadata.mimeType.includes('google-apps.spreadsheet') ? 'Google Sheet' :
                    formData.urlMetadata.mimeType.includes('google-apps.presentation') ? 'Google Slides' :
                    formData.urlMetadata.mimeType.includes('pdf') ? 'PDF' :
                    'File'
                  ) : 'File'}
                </p>
                <div className="mt-2">
                  <a 
                    href={formData.urlMetadata.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View in Google Drive
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
        
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