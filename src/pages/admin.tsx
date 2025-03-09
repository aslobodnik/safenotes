import { useState } from 'react'

import { Layout } from '@/components/Layout'
import { SafeListItem } from '@/components/SafeListItem'
import { api } from '@/utils/trpc'

export default function Admin() {
  const [newSafe, setNewSafe] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [chain, setChain] = useState<'ETH' | 'ARB' | 'UNI'>('ETH')
  const [organizationId, setOrganizationId] = useState('')
  const [secretMessage, setSecretMessage] = useState<string | null>(null)

  const utils = api.useUtils()

  // Queries
  const { data: categories } = api.categories.getAll.useQuery()
  const { data: safes } = api.safes.getAllSafes.useQuery()
  const { data: organizations } = api.organizations.getAll.useQuery()

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

  const { mutate: createSafe, isPending: createSafeLoading } = api.safes.create.useMutation({
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

    if (!organizationId) {
      alert('Please select an organization')
      return
    }

    createSafe({ address: newSafe, chain, organizationId })
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

  // Function to test the silly admin route
  const testSillyAdminRoute = async () => {
    try {
      const result = await utils.safes.sillySuperSecretAdminRoute.fetch()
      setSecretMessage(`${result.message} Secret code: ${result.secretCode}`)
    } catch (error) {
      setSecretMessage("Access denied! You're not an admin or something went wrong.")
      console.error(error)
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
                <form onSubmit={handleAddSafe} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-medium">
                      Safe Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={newSafe}
                      onChange={(e) => setNewSafe(e.target.value)}
                      placeholder="0x..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="organization" className="block text-sm font-medium">
                      Organization
                    </label>
                    <select
                      id="organization"
                      value={organizationId}
                      onChange={(e) => setOrganizationId(e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="">Select an organization</option>
                      {organizations?.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="chain" className="block text-sm font-medium">
                      Chain
                    </label>
                    <select
                      id="chain"
                      value={chain}
                      onChange={(e) => setChain(e.target.value as 'ETH' | 'ARB' | 'UNI')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <option value="ETH">Ethereum</option>
                      <option value="ARB">Arbitrum</option>
                      <option value="UNI">Uniswap</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={createSafeLoading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {createSafeLoading ? 'Adding...' : 'Add Safe'}
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

          {/* Test Admin Route Section */}
          <div className="mt-8 rounded-lg border p-6">
            <h2 className="mb-4 text-xl font-semibold">Test Admin Access</h2>
            <div className="flex flex-col items-start space-y-4">
              <button
                onClick={testSillyAdminRoute}
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Test Super Secret Admin Route
              </button>
              
              {secretMessage && (
                <div className="mt-4 rounded-md bg-gray-100 p-4">
                  <p className="text-md font-medium">{secretMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
