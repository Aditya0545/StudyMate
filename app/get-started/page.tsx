'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function GetStartedPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/resources')
  }, [router])
  
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Redirecting you to resources...</h2>
      </div>
    </div>
  )
} 