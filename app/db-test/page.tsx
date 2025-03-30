'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface DbTestResult {
  status: string
  connected: boolean
  ping?: string
  database?: string
  collections?: string[]
  resourceCount?: number
  error?: string
  uri?: string
  note: string
}

export default function DbTestPage() {
  const [result, setResult] = useState<DbTestResult | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function testDbConnection() {
      try {
        setLoading(true)
        const response = await fetch('/api/db-test')
        const data = await response.json()
        setResult(data)
      } catch (error) {
        console.error('Error testing DB connection:', error)
        setResult({
          status: 'error',
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
          note: 'Failed to fetch database test results'
        })
      } finally {
        setLoading(false)
      }
    }
    
    testDbConnection()
  }, [])
  
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">
        Database Connection Test
      </h1>
      
      <div className="mb-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
            <span className="ml-3 text-lg">Testing connection...</span>
          </div>
        ) : result ? (
          <div>
            <div className={`mb-4 rounded-lg p-4 ${
              result.connected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            }`}>
              <h2 className="text-xl font-bold">
                Status: {result.status.toUpperCase()}
              </h2>
              <p className="mt-2">{result.note}</p>
            </div>
            
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {result.connected ? (
                <>
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Database</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{result.database}</p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Ping</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{result.ping}</p>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Collections</h3>
                    <ul className="mt-2 list-inside list-disc text-gray-600 dark:text-gray-300">
                      {result.collections && result.collections.length > 0 ? (
                        result.collections.map(col => <li key={col}>{col}</li>)
                      ) : (
                        <li>No collections found</li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Resources</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                      {result.resourceCount !== undefined
                        ? `${result.resourceCount} resources found`
                        : 'Count not available'}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Error</h3>
                    <p className="mt-2 text-red-600 dark:text-red-400">{result.error}</p>
                  </div>
                  
                  <div className="col-span-2 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">URI Status</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{result.uri}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <p>No results available</p>
        )}
      </div>
      
      {result && !result.connected && (
        <div className="rounded-xl bg-amber-50 p-6 dark:bg-amber-900/20">
          <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300">Troubleshooting Tips</h2>
          <ul className="mt-3 list-inside list-disc text-amber-800 dark:text-amber-300">
            <li>Check if your MongoDB connection string is correctly set in the Vercel environment variables</li>
            <li>Verify that your MongoDB Atlas database is running and accessible</li>
            <li>Make sure your IP allowlist in MongoDB Atlas includes Vercel's IP addresses (can use 0.0.0.0/0 for testing)</li>
            <li>Check if your MongoDB Atlas username and password in the connection string are correct</li>
          </ul>
        </div>
      )}
      
      <div className="mt-8 flex justify-between">
        <Link
          href="/"
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          Back to Home
        </Link>
        
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          Test Again
        </button>
      </div>
    </div>
  )
} 