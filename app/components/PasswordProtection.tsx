'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

interface PasswordProtectionProps {
  children: React.ReactNode
}

export default function PasswordProtection({ children }: PasswordProtectionProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Check if already authenticated on component mount
  useEffect(() => {
    // For stricter security, we'll only use session cookies (no localStorage)
    // that expire when the browser is closed
    const cookieAuth = Cookies.get('resources_authenticated') === 'true'
    setAuthenticated(cookieAuth)
    setLoading(false)
  }, [])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate password against server-side API that checks environment variable
      const response = await fetch('/api/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })
      
      const data = await response.json()
      
      if (data.valid) {
        // Store authentication state in a session cookie (expires when browser closes)
        Cookies.set('resources_authenticated', 'true', { 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
          // No expires parameter = session cookie
        })
        
        setAuthenticated(true)
        setError(null)
      } else {
        setError('Incorrect password. Please try again.')
      }
    } catch (err) {
      console.error('Error validating password:', err)
      setError('An error occurred while validating the password. Please try again.')
    }
  }
  
  const handleLogout = () => {
    // Clear authentication cookie
    Cookies.remove('resources_authenticated', { path: '/' })
    setAuthenticated(false)
    router.push('/')
  }
  
  if (loading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    )
  }
  
  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-xl bg-white p-8 shadow-md dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Protected Area</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Please enter the password to view resources
          </p>
        </div>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
            <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border border-gray-300 bg-white p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Enter password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-700 dark:hover:bg-blue-800 dark:focus:ring-blue-800"
          >
            Access Resources
          </button>
        </form>
      </div>
    )
  }
  
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          Logout
        </button>
      </div>
      {children}
    </div>
  )
} 