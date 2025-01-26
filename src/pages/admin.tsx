import { useEffect, useState } from 'react'

import { Layout } from '@/components/Layout'

type Category = {
  id: string
  name: string
}

type Safe = {
  address: string
}

export default function Admin() {
  const [newSafe, setNewSafe] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [safes, setSafes] = useState<Safe[]>([])

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    }

    // Fetch safes
    const fetchSafes = async () => {
      const response = await fetch('/api/safes')
      if (response.ok) {
        const data = await response.json()
        setSafes(data)
      }
    }

    fetchCategories()
    fetchSafes()
  }, [])

  const handleAddSafe = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate address format
    if (!newSafe.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid safe address format')
      return
    }

    try {
      const response = await fetch('/api/safes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address: newSafe }),
      })

      if (!response.ok) {
        throw new Error('Failed to add safe')
      }

      // Refresh the safes list
      const updatedSafesResponse = await fetch('/api/safes')
      if (updatedSafesResponse.ok) {
        const data = await updatedSafesResponse.json()
        setSafes(data)
      }

      setNewSafe('')
    } catch (error) {
      console.error('Error adding safe:', error)
      alert('Failed to add safe')
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!newCategory.trim()) {
      alert('Category name cannot be empty')
      return
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(error || 'Failed to add category')
      }

      // Refresh the categories list
      const updatedCategoriesResponse = await fetch('/api/categories')
      if (updatedCategoriesResponse.ok) {
        const data = await updatedCategoriesResponse.json()
        setCategories(data)
      }

      setNewCategory('')
    } catch (error) {
      console.error('Error adding category:', error)
      alert(error instanceof Error ? error.message : 'Failed to add category')
    }
  }

  const handleDeleteSafe = async (address: string) => {
    try {
      const response = await fetch(`/api/safes/${address}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete safe')
      }

      // Update the local state to remove the deleted safe
      setSafes(safes.filter((safe) => safe.address !== address))
    } catch (error) {
      console.error('Error deleting safe:', error)
      alert('Failed to delete safe')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to delete category')
        } else {
          throw new Error('Failed to delete category')
        }
      }

      // Update the local state to remove the deleted category
      setCategories(categories.filter((category) => category.id !== id))
    } catch (error) {
      console.error('Error deleting category:', error)
      alert(
        error instanceof Error ? error.message : 'Failed to delete category'
      )
    }
  }

  return (
    <Layout>
      <div>
        <h1 className="mb-4 text-2xl font-bold">Admin</h1>
        <div className="container mx-auto p-8">
          <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Safes Section */}
            <div>
              <div className="mb-4 rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">Add New Safe</h2>
                <form onSubmit={handleAddSafe}>
                  <div className="mb-4">
                    <label htmlFor="safeAddress" className="mb-2 block">
                      Safe Address
                    </label>
                    <input
                      type="text"
                      id="safeAddress"
                      value={newSafe}
                      onChange={(e) => setNewSafe(e.target.value)}
                      className="w-full rounded border p-2"
                      placeholder="0x..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Add Safe
                  </button>
                </form>
              </div>

              {/* List of Current Safes */}
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">Current Safes</h2>
                <div className="space-y-2">
                  {safes.length === 0 ? (
                    <p className="text-gray-500">No safes added yet</p>
                  ) : (
                    safes.map((safe) => (
                      <div
                        key={safe.address}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <span className="font-mono">{safe.address}</span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteSafe(safe.address)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div>
              <div className="mb-4 rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">Add New Category</h2>
                <form onSubmit={handleAddCategory}>
                  <div className="mb-4">
                    <label htmlFor="category" className="mb-2 block">
                      Category Name
                    </label>
                    <input
                      type="text"
                      id="category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full rounded border p-2"
                      placeholder="Enter category name"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* List of Current Categories */}
              <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                  Current Categories
                </h2>
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-gray-500">No categories added yet</p>
                  ) : (
                    categories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between rounded border p-2"
                      >
                        <span>{category.name}</span>
                        <button
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
