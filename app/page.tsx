'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <main>
      <section className="hero-section relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-center dark:from-blue-900 dark:via-indigo-950 dark:to-purple-950 min-h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-12">
          <div className="hero-text mb-4">
            <div className="typing-text-container">
              <h1 className="typing-text text-4xl font-bold text-white sm:text-5xl md:text-6xl">
                Organize Your Study
              </h1>
            </div>
          </div>
          <div className="hero-text mb-6">
            <div className="writing-effect-container">
              <h2 className="writing-effect text-2xl font-bold text-sky-300 dark:text-sky-400 sm:text-3xl">
                Materials Smartly
              </h2>
            </div>
          </div>
          <p className="fade-in fade-in-delay-1 mx-auto mt-4 max-w-2xl text-base text-gray-100 dark:text-gray-300 sm:text-lg">
            Store, organize, and access your study materials in one place. From notes to
            videos, everything you need for effective learning.
          </p>
          <div className="fade-in fade-in-delay-2 mt-6 flex justify-center gap-4">
            <Link
              href="/get-started"
              className="transform rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-transparent dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-500"
            >
              Get Started
            </Link>
            <Link
              href="/learn-more"
              className="transform rounded-xl bg-white/10 px-6 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl font-bold animated-heading-main sm:text-3xl">
            Everything you need to study effectively
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="transform rounded-2xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-950/50">
              <div className="mb-6 inline-block rounded-xl bg-blue-100 p-3 dark:bg-blue-900/30">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Smart Organization</h3>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Categorize and tag your study materials for easy access and better organization
              </p>
            </div>

            <div className="transform rounded-2xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-950/50">
              <div className="mb-6 inline-block rounded-xl bg-purple-100 p-3 dark:bg-purple-900/30">
                <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Multi-format Support</h3>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Store notes, videos, links, and documents in one place with smart categorization
              </p>
            </div>

            <div className="transform rounded-2xl bg-white p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl dark:bg-gray-800 dark:shadow-gray-950/50">
              <div className="mb-6 inline-block rounded-xl bg-green-100 p-3 dark:bg-green-900/30">
                <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">Quick Search</h3>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Find what you need instantly with powerful search and filtering options
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
} 