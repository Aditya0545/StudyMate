'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import YoutubePreview from './YoutubePreview'
import { extractVideoId } from '@/app/lib/youtube'
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

// List of tag colors for variety
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

type ResourceType = 'note' | 'link' | 'video' | 'document' | 'command'

interface UrlMetadata {
  type: string;  // 'youtube', 'gdocs', 'gsheets', 'gslides', 'gdrive', 'other'
  title?: string;
  description?: string;
  thumbnail?: string;
  author?: string;
  publishedAt?: string;
}

interface ResourceCardProps {
  resource: {
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
    urlMetadata?: UrlMetadata
  }
  isAdmin: boolean
  onDelete?: (id: string) => void
}

export default function ResourceCard({ resource, isAdmin, onDelete }: ResourceCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get resource type label
  const getResourceTypeLabel = () => {
    switch (resource.type) {
      case 'note':
        return 'Note'
      case 'link':
        return 'Link'
      case 'video':
        return 'Video'
      case 'document':
        return 'Document'
      case 'command':
        return 'Command'
      default:
        return 'Unknown'
    }
  }

  // Get tag color
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    ]
    
    // Use a hash function to consistently assign colors to tags
    const hash = tag.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    return colors[Math.abs(hash) % colors.length]
  }

  // Get type icon
  const getTypeIcon = () => {
    switch (resource.type) {
      case 'note':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        )
      case 'link':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )
      case 'video':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'document':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'command':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        )
      default:
        return null
    }
  }

  // Function to handle delete confirmation
  const handleDeleteConfirm = () => {
    if (onDelete) {
      onDelete(resource._id)
    }
    setShowConfirmDelete(false)
  }

  // Function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown date'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get URL display text based on type
  const getUrlDisplayText = () => {
    if (!resource.url) return '';
    
    // Use urlMetadata if available
    if (resource.urlMetadata?.title) {
      return resource.urlMetadata.title;
    }
    
    // Fallback to videoMetadata for backward compatibility
    if (resource.type === 'video' && resource.videoMetadata?.title) {
      return resource.videoMetadata.title;
    }
    
    // Check for Google services
    if (resource.url.includes('docs.google.com')) {
      return 'Google Docs';
    } else if (resource.url.includes('sheets.google.com')) {
      return 'Google Sheets';
    } else if (resource.url.includes('slides.google.com')) {
      return 'Google Slides';
    } else if (resource.url.includes('drive.google.com')) {
      return 'Google Drive';
    }
    
    // For other URLs, truncate if too long
    return resource.url.length > 40 ? `${resource.url.substring(0, 40)}...` : resource.url;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800 dark:shadow-gray-900/30">
        {/* Card Header */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            {/* Resource Type Badge */}
            <div className="flex items-center space-x-2">
              <span className="flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {getTypeIcon()}
                <span className="ml-1.5">{getResourceTypeLabel()}</span>
              </span>
              <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {resource.category}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-1">
              <button
                onClick={() => setShowModal(true)}
                className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                aria-label="View Details"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              
              {/* Admin Controls */}
              {isAdmin && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="rounded p-1 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700"
                    aria-label="Options"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 z-10 mt-1 w-40 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-700">
                      <Link 
                        href={`/resources/${resource._id}/edit`}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => setShowConfirmDelete(true)}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Card Preview Content */}
        <div className="px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{resource.title}</h3>
          
          {/* Description (always truncated in card) */}
          {resource.description && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {resource.description}
            </p>
          )}

          {/* Tags Preview (limited to 3) */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTagColor(tag)}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{resource.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Full Content Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div 
            ref={modalRef}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {/* Modal Content */}
            <div className="mb-6 space-y-4">
              {/* Title and Type */}
              <div className="flex items-center space-x-3">
                <span className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {getTypeIcon()}
                  <span className="ml-1.5">{getResourceTypeLabel()}</span>
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  {resource.category}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{resource.title}</h2>

              {/* Full Description */}
              {resource.description && (
                <p className="text-gray-600 dark:text-gray-300">{resource.description}</p>
              )}

              {/* Content Based on Type */}
              {resource.type === 'video' && resource.url && (
                <div className="mt-4">
                  <YoutubePreview url={resource.url} className="w-full rounded-lg" />
                  {/* Video Metadata */}
                  {(resource.urlMetadata || resource.videoMetadata) && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {resource.urlMetadata?.author && (
                        <p>Channel: {resource.urlMetadata.author}</p>
                      )}
                      {resource.videoMetadata?.channelTitle && !resource.urlMetadata?.author && (
                        <p>Channel: {resource.videoMetadata.channelTitle}</p>
                      )}
                      {resource.urlMetadata?.publishedAt && (
                        <p>Published: {formatDate(resource.urlMetadata.publishedAt)}</p>
                      )}
                      {resource.videoMetadata?.publishedAt && !resource.urlMetadata?.publishedAt && (
                        <p>Published: {formatDate(resource.videoMetadata.publishedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Link Content */}
              {(resource.type === 'link' || resource.type === 'document') && resource.url && (
                <div className="mt-4">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
                  >
                    {getUrlDisplayText()}
                    <svg
                      className="ml-1 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"></path>
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"></path>
                    </svg>
                  </a>
                </div>
              )}

              {/* Note Content */}
              {resource.type === 'note' && resource.content && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {resource.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-3 last:mb-0">
                        {paragraph}
                      </p>
                    ) : <br key={index} />
                  ))}
                </div>
              )}

              {/* Command Content */}
              {resource.type === 'command' && resource.content && (
                <div className="mt-4">
                  <div className="rounded-lg bg-gray-900 text-white">
                    <div className="p-4">
                      {resource.content.split('\n').map((line, index) => (
                        line.trim() && (
                          <div key={index} className="group relative mb-2 flex items-start">
                            <span className="mr-2 select-none font-mono text-green-500">$</span>
                            <pre className="flex-1 overflow-x-auto whitespace-pre font-mono text-gray-300">{line}</pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(line.trim());
                              }}
                              className="absolute right-2 hidden rounded bg-gray-700 p-1 text-gray-300 opacity-0 transition-opacity hover:bg-gray-600 group-hover:block group-hover:opacity-100"
                              title="Copy command"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                  {/* Command Tips */}
                  <div className="mt-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/30">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Tip: Hover over a command to reveal the copy button. Click the copy button to copy the command to your clipboard.
                    </p>
                  </div>
                </div>
              )}

              {/* All Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTagColor(tag)}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Date Added */}
              {resource.createdAt && (
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Added: {formatDate(resource.createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 