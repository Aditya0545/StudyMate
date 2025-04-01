import '../styles/globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from './components/ThemeProvider'
import Header from './components/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Study Friend - Smart Study Organizer',
  description: 'Organize your study materials efficiently with Study Friend',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

// This script runs before React hydration to prevent flashing
function setInitialTheme() {
  return {
    __html: `
      (function() {
        try {
          const theme = localStorage.getItem('theme');
          
          // Default to light theme if not set
          if (!theme) {
            localStorage.setItem('theme', 'light');
          }
          
          // Apply selected theme
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
          } else if (theme === 'system') {
            // Use system preference
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            isDarkMode 
              ? document.documentElement.classList.add('dark')
              : document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          console.error('Error setting initial theme', e);
        }
      })();
    `,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={setInitialTheme()} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-gray-900">
            <Header />
            <main className="mx-auto max-w-7xl">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}