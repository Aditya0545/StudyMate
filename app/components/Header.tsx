'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from './Logo'
import CreatorModal from './CreatorModal'
import ThemeSelect from './ThemeSelect'
import { Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get admin password from localStorage
        const adminPassword = localStorage.getItem('admin-password');
        if (!adminPassword) {
          setIsAdmin(false);
          return;
        }

        const response = await fetch('/api/auth/check-admin', {
          method: 'POST',
          headers: {
            'X-Admin-Password': adminPassword
          }
        });
        
        const data = await response.json();
        setIsAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          localStorage.removeItem('admin-password');
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        localStorage.removeItem('admin-password');
      }
    };
    
    checkAdminStatus();
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const mobileMenu = document.getElementById('mobile-menu');
      const hamburgerButton = document.getElementById('hamburger-button');
      
      if (mobileMenu && hamburgerButton && 
          !mobileMenu.contains(event.target as Node) && 
          !hamburgerButton.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="relative">
        {/* Header Content */}
        <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">
                <Logo />
              </Link>
              <nav className="hidden space-x-6 md:flex">
                <Link href="/resources" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Resources
                </Link>
                <Link href="/private-resources" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  MY Assets
                </Link>
                <button
                  onClick={() => setIsCreatorModalOpen(true)}
                  className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                >
                  Creator's Corner
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeSelect />
              {/* Hamburger Menu Button */}
              <button
                id="hamburger-button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Container */}
        <div className={`fixed inset-0 z-40 md:hidden ${isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
          {/* Mobile Menu Overlay */}
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Mobile Navigation Menu */}
          <div
            id="mobile-menu"
            className={`absolute right-0 top-0 h-full w-64 transform overflow-y-auto bg-white p-6 shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <nav className="flex flex-col space-y-4">
                <Link 
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <HomeIcon className="h-5 w-5" />
                  <span>Home</span>
                </Link>

                <Link 
                  href="/resources"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <BookOpenIcon className="h-5 w-5" />
                  <span>Resources</span>
                </Link>

                <Link 
                  href="/private-resources"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <LockClosedIcon className="h-5 w-5" />
                  <span>MY Assets</span>
                </Link>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsCreatorModalOpen(true);
                  }}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Creator's Corner</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Creator Modal */}
      <CreatorModal isOpen={isCreatorModalOpen} onClose={() => setIsCreatorModalOpen(false)} />
    </>
  );
} 