'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from './Logo'
import CreatorModal from './CreatorModal'
import ThemeSelect from './ThemeSelect'
import { Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, LockClosedIcon, UserIcon, GlobeAltIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const pathname = usePathname();
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <header className="fixed top-0 left-0 right-0 w-full bg-white dark:bg-gray-800 shadow-sm" style={{ zIndex: 40 }}>
        <div className="w-full">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
            {/* Left section - Logo and Navigation */}
            <div className="flex items-center lg:space-x-8">
              <Link href="/" className="text-xl font-bold text-gray-900 transition-colors duration-300 dark:text-white">
                <Logo />
              </Link>
              <nav className="hidden lg:flex lg:space-x-8">
                <Link 
                  href="/resources" 
                  className="nav-link relative inline-block"
                >
                  Resources
                </Link>
                <Link 
                  href="/private-resources" 
                  className="nav-link relative inline-block"
                >
                  MY Assets
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreatorModalOpen(true)}
                    className="nav-link relative inline-block"
                  >
                    Creator&apos;s Corner
                  </button>
                </div>
              </nav>
            </div>
            
            {/* Right section - Theme, Admin, Logout */}
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <ThemeSelect />
                {/* Only show hamburger on mobile */}
                <button
                  id="hamburger-button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="ml-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
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
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`fixed inset-0 z-50 lg:hidden ${
            isMobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {/* Overlay */}
          <div 
            className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Menu Panel */}
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
                    setIsCreatorModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <UserIcon className="h-5 w-5" />
                  <span>Creator&apos;s Corner</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <CreatorModal isOpen={isCreatorModalOpen} onClose={() => setIsCreatorModalOpen(false)} />
      {/* Spacer for fixed header */}
      <div className="h-[56px]"></div>
    </>
  );
} 