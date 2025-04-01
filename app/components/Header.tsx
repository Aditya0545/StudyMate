'use client'

import { useState } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import CreatorModal from './CreatorModal'
import ThemeSelect from './ThemeSelect'

export default function Header() {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">
              <Logo />
            </Link>
            <nav className="hidden space-x-6 md:flex">
              <Link href="/resources" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Resources
              </Link>
              <button
                onClick={() => setIsCreatorModalOpen(true)}
                className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Creator's Corner
              </button>
              <Link href="/resources/new" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                Add New
              </Link>
            </nav>
          </div>
          <ThemeSelect />
        </div>
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex justify-around border-t border-gray-200 py-2 dark:border-gray-800">
            <Link href="/" className="flex flex-1 items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="ml-1">Home</span>
            </Link>
            <Link href="/resources" className="flex flex-1 items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span className="ml-1">Resources</span>
            </Link>
            <button
              onClick={() => setIsCreatorModalOpen(true)}
              className="flex flex-1 items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="ml-1">Creator</span>
            </button>
            <Link href="/resources/new" className="flex flex-1 items-center justify-center p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="ml-1">Add</span>
            </Link>
          </div>
        </div>
      </header>
      <CreatorModal isOpen={isCreatorModalOpen} onClose={() => setIsCreatorModalOpen(false)} />
    </>
  );
} 