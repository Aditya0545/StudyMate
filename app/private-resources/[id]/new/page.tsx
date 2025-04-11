'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import ResourceForm from '@/app/components/ResourceForm'

interface Locker {
  _id: string
  name: string
}

export default function NewPrivateResourcePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [locker, setLocker] = useState<Locker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Get locker password from localStorage
        const password = localStorage.getItem(`locker-${params.id}`)
        if (!password) {
          router.push('/private-resources')
          return
        }

        // Verify locker access
        const response = await fetch(`/api/lockers?id=${params.id}&password=${password}`)
        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem(`locker-${params.id}`)
            router.push('/private-resources')
            return
          }
          throw new Error('Failed to verify locker access')
        }

        const data = await response.json()
        setLocker(data)
      } catch (error) {
        console.error('Error checking auth:', error)
        setError('Failed to verify access. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
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
      <div className="mb-8 flex items-center space-x-4">
        <Link
          href={`/private-resources/${params.id}`}
          className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeftIcon className="mr-2 h-5 w-5" />
          Back to {locker?.name || 'Locker'}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Resource</h1>
      </div>

      <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
        <ResourceForm lockerId={params.id} />
      </div>
    </div>
  )
} 