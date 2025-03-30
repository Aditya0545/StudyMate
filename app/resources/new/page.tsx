import ResourceForm from '@/app/components/ResourceForm'
import Link from 'next/link'

export default function NewResourcePage() {
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