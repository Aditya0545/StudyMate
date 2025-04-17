'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import YoutubePreview from './YoutubePreview'
import { extractVideoId } from '@/app/lib/youtube'
import { PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { marked } from 'marked'

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
  lockerId?: string
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

interface ResourceCardProps {
  resource: Resource
  isAdmin: boolean
  onDelete: (id: string) => void
  className?: string
}

export default function ResourceCard({ resource, isAdmin, onDelete, className = '' }: ResourceCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
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
    <div className={`group relative overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-lg dark:bg-gray-800 ${className}`}>
      <div className="p-6">
        <div 
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/90 to-white/40 dark:from-gray-800/90 dark:to-gray-900/40 p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-rotate-1 cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
          
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Content container */}
          <div className="relative z-10">
            {/* Header section */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {/* Type icon with enhanced styling */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100/80 to-blue-50/50 dark:from-blue-900/30 dark:to-blue-800/20 p-2 shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  {getTypeIcon()}
                </div>
                
                {/* Type and category labels */}
                <div className="flex items-center flex-wrap gap-2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100/80 via-blue-50/50 to-blue-100/80 dark:from-blue-900/30 dark:via-blue-800/20 dark:to-blue-900/30 px-3 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-300 shadow-sm transition-all duration-300 hover:shadow-md">
                    {getResourceTypeLabel()}
                  </span>
                  {resource.categories && resource.categories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {resource.categories.map(category => (
                        <span
                          key={category}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100/80 via-purple-50/50 to-purple-100/80 dark:from-purple-900/30 dark:via-purple-800/20 dark:to-purple-900/30 text-purple-800 dark:text-purple-300"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin actions */}
              {isAdmin && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen(!dropdownOpen);
                    }}
                    className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100/50 dark:text-gray-400 dark:hover:bg-gray-700/50 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {dropdownOpen && (
                    <div 
                      className="absolute right-0 mt-1 w-36 rounded-xl bg-white py-2 shadow-lg ring-1 ring-black/5 dark:bg-gray-800 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link 
                        href={resource.lockerId 
                          ? `/private-resources/${resource.lockerId}/edit/${resource._id}`
                          : `/resources/${resource._id}/edit`
                        }
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700/50"
                      >
                        <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Edit
                      </Link>
                      <button
                        onClick={() => {
                          setShowConfirmDelete(true)
                          setDropdownOpen(false)
                        }}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        <svg className="mr-3 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Title and description */}
            <div className="mt-4 space-y-2">
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white transition-colors duration-300">
                {resource.title}
              </h3>
              {resource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                  {resource.description}
                </p>
              )}
            </div>

            {/* Resource preview indicator */}
            {(resource.type === 'video' || resource.type === 'link') && resource.url && (
              <div className="mt-4 flex items-center text-sm">
                {resource.type === 'video' ? (
                  <div className="flex items-center text-blue-600 dark:text-blue-400 transition-all duration-300 hover:text-blue-700 dark:hover:text-blue-300">
                    <div className="relative mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute -inset-1 animate-ping rounded-full bg-blue-400/20 duration-1000"></div>
                    </div>
                    <span className="font-medium">Click to watch video</span>
                  </div>
                ) : (
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="mr-2 h-4 w-4 transform transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="font-medium">{getUrlDisplayText()}</span>
                  </a>
                )}
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100/90 via-gray-50/80 to-gray-100/90 dark:from-gray-700/90 dark:via-gray-800/80 dark:to-gray-700/90 px-3 py-1 text-xs font-medium text-gray-800 dark:text-gray-200 shadow-sm transition-all duration-200 hover:scale-105 hover:shadow-md"
                  >
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 transition-opacity duration-200 hover:opacity-75">
                    +{resource.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal with markdown content */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div 
            ref={modalRef}
            className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="mb-6 space-y-6">
              {/* Title and Type */}
              <div className="flex items-center space-x-3">
                <span className="flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  {getTypeIcon()}
                  <span className="ml-1.5">{getResourceTypeLabel()}</span>
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {resource.title}
              </h2>

              {/* Description */}
              {resource.description && (
                <p className="text-gray-600 dark:text-gray-300">
                  {resource.description}
                </p>
              )}

              {/* Video Content */}
              {resource.type === 'video' && resource.url && (
                <div className="mt-4 overflow-hidden rounded-xl shadow-lg">
                  <YoutubePreview url={resource.url} />
                  {/* Video Metadata */}
                  {(resource.urlMetadata || resource.videoMetadata) && (
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl text-sm text-gray-500 dark:text-gray-400">
                      {resource.urlMetadata?.author && (
                        <p className="flex items-center">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Channel: {resource.urlMetadata.author}
                        </p>
                      )}
                      {resource.videoMetadata?.channelTitle && !resource.urlMetadata?.author && (
                        <p className="flex items-center">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Channel: {resource.videoMetadata.channelTitle}
                        </p>
                      )}
                      {(resource.urlMetadata?.publishedAt || resource.videoMetadata?.publishedAt) && (
                        <p className="flex items-center mt-1">
                          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Published: {formatDate(resource.urlMetadata?.publishedAt || resource.videoMetadata?.publishedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Link Content */}
              {resource.type === 'link' && resource.url && (
                <div className="mt-4">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span className="font-medium">{getUrlDisplayText()}</span>
                  </a>
                </div>
              )}

              {/* Note Content */}
              {resource.type === 'note' && resource.content && (
                <div className="mt-4 rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-3 last:[&_p]:mb-0 prose-a:text-blue-600 prose-a:underline hover:prose-a:text-blue-800 dark:prose-a:text-blue-400 hover:dark:prose-a:text-blue-300 prose-ul:my-2 prose-li:my-0 prose-ol:my-2"
                    dangerouslySetInnerHTML={{ 
                      __html: resource.content
                    }}
                  />
                </div>
              )}

              {/* Command Content */}
              {resource.type === 'command' && resource.content && (
                <div className="mt-4">
                  <div className="rounded-xl bg-gray-900 text-white overflow-hidden shadow-lg">
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-800">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <span className="text-xs text-gray-400">Terminal</span>
                    </div>
                    <div className="p-4 font-mono">
                      {resource.content.split('\n').map((line, index) => (
                        line.trim() && (
                          <div key={index} className="group relative mb-2 flex items-start">
                            <span className="mr-2 select-none font-mono text-green-500">$</span>
                            <pre className="flex-1 overflow-x-auto whitespace-pre text-gray-300">{line}</pre>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(line.trim());
                              }}
                              className="absolute right-2 hidden rounded bg-gray-700 p-1.5 text-gray-300 opacity-0 transition-all duration-200 hover:bg-gray-600 group-hover:block group-hover:opacity-100"
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
                </div>
              )}

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${getTagColor(tag)}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Date Added */}
              {resource.createdAt && (
                <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Added: {formatDate(resource.createdAt)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white/95 dark:bg-gray-800/95 p-6 shadow-2xl ring-1 ring-black/5">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirm Delete
              </h3>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this resource? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="rounded-lg bg-gray-100 dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 