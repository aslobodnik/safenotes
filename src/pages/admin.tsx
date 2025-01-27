import { useState } from 'react'

import { Layout } from '@/components/Layout'
import { SafeListItem } from '@/components/SafeListItem'
import { api } from '@/utils/trpc'

export default function Admin() {
  const [newSafe, setNewSafe] = useState('')
  const [newCategory, setNewCategory] = useState('')

  const utils = api.useUtils()

  // Queries
  const { data: categories } = api.categories.getAll.useQuery()
  const { data: safes } = api.safes.getAllSafes.useQuery()

  // Mutations
  const { mutate: createCategory } = api.categories.create.useMutation({
    onSuccess: () => {
      setNewCategory('')
      void utils.categories.getAll.invalidate()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: deleteCategory } = api.categories.delete.useMutation({
    onSuccess: () => {
      void utils.categories.getAll.invalidate()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: createSafe } = api.safes.create.useMutation({
    onSuccess: () => {
      setNewSafe('')
      void utils.safes.getAllSafes.invalidate()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: deleteSafe } = api.safes.delete.useMutation({
    onSuccess: () => {
      void utils.safes.getAllSafes.invalidate()
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const handleAddSafe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSafe.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid safe address format')
      return
    }

    createSafe({ address: newSafe })
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.trim()) {
      alert('Category name cannot be empty')
      return
    }

    createCategory({ name: newCategory })
  }

  const handleDeleteSafe = (address: string) => {
    deleteSafe({ address })
  }

  const handleDeleteCategory = (id: string) => {
    deleteCategory({ id })
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
                  {!safes ? (
                    <p className="text-gray-500">Loading safes...</p>
                  ) : safes.length === 0 ? (
                    <p className="text-gray-500">No safes added yet</p>
                  ) : (
                    safes.map((safe) => (
                      <SafeListItem
                        key={safe.address}
                        safe={safe}
                        onDelete={handleDeleteSafe}
                      />
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
                  {!categories ? (
                    <p className="text-gray-500">Loading categories...</p>
                  ) : categories.length === 0 ? (
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
