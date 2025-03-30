'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeProvider'
import { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted on client
  if (!mounted) {
    return (
      <button
        className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Loading theme toggle"
      >
        <MoonIcon className="h-6 w-6 text-gray-400" />
      </button>
    )
  }

  // Now we can safely use the theme context
  const { isDark, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <SunIcon className="h-6 w-6 text-yellow-500" />
      ) : (
        <MoonIcon className="h-6 w-6 text-gray-700" />
      )}
    </button>
  )
} 