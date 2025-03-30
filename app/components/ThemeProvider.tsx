'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with empty values
  const [theme, setTheme] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Apply theme changes
  const applyTheme = (newTheme: Theme) => {
    let darkModeActive = false
    
    if (newTheme === 'dark') {
      darkModeActive = true
    } else if (newTheme === 'light') {
      darkModeActive = false
    } else {
      // System theme - check media query
      darkModeActive = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    
    // Update DOM and state
    if (darkModeActive) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    setIsDark(darkModeActive)
    
    // Save preference
    localStorage.setItem('theme', newTheme)
  }

  // Initialize on component mount
  useEffect(() => {
    // Get saved theme or default to system
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(savedTheme)
    
    // Apply the theme
    applyTheme(savedTheme)
    
    // Handle system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
      }
    }
    
    mediaQuery.addEventListener('change', handleChange)
    setMounted(true)
    
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  // Theme change handler
  const changeTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
} 