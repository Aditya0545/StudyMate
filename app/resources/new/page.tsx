'use client'

import { useState, useEffect } from 'react'
import ResourceForm from '@/app/components/ResourceForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewResourcePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get admin password from localStorage
        const adminPassword = localStorage.getItem('admin-password')
        if (!adminPassword) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/auth/check-admin', {
          headers: {
            'X-Admin-Password': adminPassword
          }
        })
        const data = await response.json()
        
        if (!data.isAdmin) {
          // Clear invalid password and redirect to login
          localStorage.removeItem('admin-password')
          router.push('/login')
          return
        }

        setLoading(false)
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('admin-password')
        router.push('/login')
      }
    }
    
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[300px] items-center justify-center px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link 
          href="/resources" 
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Resources
        </Link>
      </div>
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">Add New Resource</h1>
      <ResourceForm />
    </div>
  )
} 