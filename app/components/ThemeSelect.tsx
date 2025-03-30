'use client'

import { Fragment, useState, useEffect } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTheme } from './ThemeProvider'

export default function ThemeSelect() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  // If not mounted yet, show a placeholder
  if (!mounted) {
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded-full">
        <SunIcon className="h-6 w-6 text-gray-400" />
      </div>
    )
  }
  
  // Safe to use the theme context after mounting
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      name: 'Light',
      value: 'light' as const,
      icon: SunIcon,
      current: theme === 'light',
    },
    {
      name: 'Dark',
      value: 'dark' as const,
      icon: MoonIcon,
      current: theme === 'dark',
    },
    {
      name: 'System',
      value: 'system' as const,
      icon: ComputerDesktopIcon,
      current: theme === 'system',
    },
  ]

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
        {theme === 'dark' ? (
          <MoonIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
        ) : theme === 'system' ? (
          <ComputerDesktopIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
        ) : (
          <SunIcon className="h-6 w-6 text-gray-900 dark:text-gray-100" />
        )}
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800 dark:ring-gray-700">
          {themes.map((item) => (
            <Menu.Item key={item.value}>
              {({ active }) => (
                <button
                  onClick={() => setTheme(item.value)}
                  className={`${
                    active
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  } ${
                    item.current
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-900 dark:text-gray-100'
                  } group flex w-full items-center px-4 py-2 text-sm`}
                >
                  <item.icon
                    className={`${
                      item.current ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                    } mr-3 h-5 w-5`}
                    aria-hidden="true"
                  />
                  {item.name}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
} 