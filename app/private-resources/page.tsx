'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PlusIcon, LockClosedIcon, LockOpenIcon, TrashIcon, PencilIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'

interface Locker {
  _id: string
  name: string
  createdAt: string
}

export default function PrivateResourcesPage() {
  const router = useRouter()
  const [lockers, setLockers] = useState<Locker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLocker, setSelectedLocker] = useState<Locker | null>(null)
  const [newLockerName, setNewLockerName] = useState('')
  const [newLockerPassword, setNewLockerPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [editLockerName, setEditLockerName] = useState('')
  const [editLockerPassword, setEditLockerPassword] = useState('')
  const [actionType, setActionType] = useState<'unlock' | 'edit' | 'delete'>('unlock')

  // Fetch all lockers
  useEffect(() => {
    const fetchLockers = async () => {
      try {
        const response = await fetch('/api/lockers')
        if (!response.ok) {
          throw new Error('Failed to fetch lockers')
        }
        const data = await response.json()
        setLockers(data)
      } catch (error) {
        console.error('Error fetching lockers:', error)
        setError('Failed to load lockers. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    
    fetchLockers()
  }, [])

  // Handle creating a new locker
  const handleCreateLocker = async () => {
    try {
      const response = await fetch('/api/lockers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newLockerName,
          password: newLockerPassword,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create locker')
      }

      const data = await response.json()
      setLockers([data, ...lockers])
      setShowCreateModal(false)
      setNewLockerName('')
      setNewLockerPassword('')
    } catch (error) {
      console.error('Error creating locker:', error)
      setError('Failed to create locker. Please try again.')
    }
  }

  // Handle unlocking a locker
  const handleUnlockLocker = async () => {
    if (!selectedLocker) return

    try {
      // First verify the password with the locker API
      const verifyResponse = await fetch(`/api/lockers?id=${selectedLocker._id}&password=${password}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!verifyResponse.ok) {
        if (verifyResponse.status === 401) {
          setPasswordError('Invalid password')
          return
        }
        throw new Error('Failed to verify locker access')
      }

      // If password is correct, store it and navigate
      localStorage.setItem(`locker-${selectedLocker._id}`, password)
      setShowPasswordModal(false)
      setPassword('')
      setPasswordError(null)
      
      // Navigate to the locker's resources page
      router.push(`/private-resources/${selectedLocker._id}`)
    } catch (error) {
      console.error('Error accessing locker:', error)
      setPasswordError('Failed to access locker. Please try again.')
    }
  }

  // Handle editing a locker
  const handleEditLocker = async () => {
    if (!selectedLocker) return

    try {
      const response = await fetch(`/api/lockers?id=${selectedLocker._id}&currentPassword=${password}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editLockerName,
          newPassword: editLockerPassword || undefined,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Invalid password')
          return
        }
        throw new Error('Failed to update locker')
      }

      // Update the locker in the UI
      setLockers(prevLockers =>
        prevLockers.map(locker =>
          locker._id === selectedLocker._id
            ? { ...locker, name: editLockerName }
            : locker
        )
      )

      // If password was changed, update it in localStorage
      if (editLockerPassword) {
        localStorage.setItem(`locker-${selectedLocker._id}`, editLockerPassword)
      }

      setShowEditModal(false)
      setShowPasswordModal(false)
      setPassword('')
      setEditLockerName('')
      setEditLockerPassword('')
      setPasswordError(null)
    } catch (error) {
      console.error('Error updating locker:', error)
      setPasswordError('Failed to update locker. Please try again.')
    }
  }

  // Handle deleting a locker
  const handleDeleteLocker = async () => {
    if (!selectedLocker) return

    try {
      const response = await fetch(`/api/lockers?id=${selectedLocker._id}&password=${password}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        if (response.status === 401) {
          setPasswordError('Invalid password')
          return
        }
        throw new Error('Failed to delete locker')
      }

      setLockers(prevLockers => prevLockers.filter(locker => locker._id !== selectedLocker._id))
      localStorage.removeItem(`locker-${selectedLocker._id}`)
      setShowPasswordModal(false)
      setPassword('')
      setPasswordError(null)
    } catch (error) {
      console.error('Error deleting locker:', error)
      setPasswordError('Failed to delete locker. Please try again.')
    }
  }

  // Handle password verification for different actions
  const handlePasswordVerification = () => {
    switch (actionType) {
      case 'unlock':
        handleUnlockLocker()
        break
      case 'edit':
        if (!passwordError) {
          setShowEditModal(true)
          setEditLockerName(selectedLocker?.name || '')
        }
        break
      case 'delete':
        handleDeleteLocker()
        break
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Loading lockers...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold animated-heading-main">Private Resources</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <PlusIcon className="mr-2 h-5 w-5" />
          Create New Locker
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {lockers.map((locker, index) => (
          <div
            key={locker._id}
            className="locker-card fade-in"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="locker-content">
              <span className="locker-number">#{index + 1}</span>
              <div className="locker-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocker(locker);
                    setActionType('edit');
                    setShowPasswordModal(true);
                  }}
                  className="locker-action-btn"
                  title="Edit locker"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedLocker(locker);
                    setActionType('delete');
                    setShowPasswordModal(true);
                  }}
                  className="locker-action-btn delete"
                  title="Delete locker"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              <div 
                className="mt-4 cursor-pointer"
                onClick={() => {
                  setSelectedLocker(locker);
                  setActionType('unlock');
                  setShowPasswordModal(true);
                }}
              >
                <h3 className="text-lg font-semibold text-white">
                  {locker.name}
                </h3>
                <p className="mt-2 text-sm text-gray-300">
                  Created on {new Date(locker.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Password Modal */}
      {showPasswordModal && selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              {actionType === 'unlock' && `Enter Password for ${selectedLocker.name}`}
              {actionType === 'edit' && `Verify Password to Edit ${selectedLocker.name}`}
              {actionType === 'delete' && `Verify Password to Delete ${selectedLocker.name}`}
            </h2>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter locker password"
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handlePasswordVerification();
                  }
                }}
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordVerification}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {actionType === 'unlock' ? 'Unlock' : 'Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Locker Modal */}
      {showEditModal && selectedLocker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              Edit {selectedLocker.name}
            </h2>
            <div className="mb-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Locker Name
                </label>
                <input
                  type="text"
                  value={editLockerName}
                  onChange={(e) => setEditLockerName(e.target.value)}
                  placeholder="Enter new name"
                  className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password (optional)
                </label>
                <input
                  type="password"
                  value={editLockerPassword}
                  onChange={(e) => setEditLockerPassword(e.target.value)}
                  placeholder="Enter new password (leave empty to keep current)"
                  className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditLockerName('')
                  setEditLockerPassword('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleEditLocker}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                disabled={!editLockerName}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Locker Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">Create New Locker</h2>
            <div className="mb-4">
              <input
                type="text"
                value={newLockerName}
                onChange={(e) => setNewLockerName(e.target.value)}
                placeholder="Locker name"
                className="mb-2 w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="password"
                value={newLockerPassword}
                onChange={(e) => setNewLockerPassword(e.target.value)}
                placeholder="Set a password"
                className="w-full rounded-lg border border-gray-300 p-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewLockerName('')
                  setNewLockerPassword('')
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLocker}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                disabled={!newLockerName || !newLockerPassword}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 