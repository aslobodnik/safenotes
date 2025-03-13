import { useState, useEffect } from 'react'

import { Layout } from '@/components/Layout'
import { api } from '@/utils/trpc'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, CheckCircle2 } from 'lucide-react'

// New component for displaying addresses in a mobile-friendly way
function AddressDisplay({ address, chain }: { address: string; chain: string }) {
  const [copied, setCopied] = useState(false)

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-x-2 sm:space-y-0">
      <div className="flex items-center">
        <span className="mr-2 rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
          {chain}
        </span>
        <span className="font-mono text-sm">{formatAddress(address)}</span>
      </div>
      <button
        onClick={copyToClipboard}
        className="inline-flex items-center text-blue-500 hover:text-blue-700"
        title="Copy address"
      >
        {copied ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
        <span className="ml-1 text-xs sm:hidden">Copy</span>
      </button>
    </div>
  )
}

export default function Admin() {
  const [newSafe, setNewSafe] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [chain, setChain] = useState<'ETH' | 'ARB' | 'UNI'>('ETH')
  const [selectedOrganizationId, setSelectedOrganizationId] = useState('')

  const utils = api.useUtils()

  // Fetch all organizations
  const { data: organizations, isLoading: orgsLoading } = api.organizations.getAll.useQuery()

  // Fetch safes for the selected organization
  const { data: safes, isLoading: safesLoading } = api.safes.getByOrganization.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId }
  )

  // Fetch categories for the selected organization
  const { data: categories, isLoading: categoriesLoading } = api.categories.getCategoriesByOrganization.useQuery(
    { organizationId: selectedOrganizationId },
    { enabled: !!selectedOrganizationId }
  )

  // Set the first organization as default when data loads
  useEffect(() => {
    if (organizations && organizations.length > 0 && !selectedOrganizationId) {
      setSelectedOrganizationId(organizations[0].id)
    }
  }, [organizations, selectedOrganizationId])

  // Mutations
  const { mutate: createCategory } = api.categories.create.useMutation({
    onSuccess: () => {
      setNewCategory('')
      void utils.categories.getCategoriesByOrganization.invalidate({ organizationId: selectedOrganizationId })
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: deleteCategory } = api.categories.delete.useMutation({
    onSuccess: () => {
      void utils.categories.getCategoriesByOrganization.invalidate({ organizationId: selectedOrganizationId })
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: createSafe, isPending: createSafeLoading } = api.safes.create.useMutation({
    onSuccess: () => {
      setNewSafe('')
      void utils.safes.getByOrganization.invalidate({ organizationId: selectedOrganizationId })
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: deleteSafe } = api.safes.delete.useMutation({
    onSuccess: () => {
      void utils.safes.getByOrganization.invalidate({ organizationId: selectedOrganizationId })
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

    if (!selectedOrganizationId) {
      alert('Please select an organization')
      return
    }

    createSafe({ 
      address: newSafe, 
      chain, 
      organizationId: selectedOrganizationId 
    })
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCategory.trim()) {
      alert('Category name cannot be empty')
      return
    }

    if (!selectedOrganizationId) {
      alert('Please select an organization')
      return
    }

    createCategory({ 
      name: newCategory,
      organizationId: selectedOrganizationId
    })
  }

  const handleDeleteSafe = (address: string) => {
    if (confirm('Are you sure you want to delete this safe?')) {
      deleteSafe({ address })
    }
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory({ id })
    }
  }

  const isLoading = orgsLoading || (!!selectedOrganizationId && (safesLoading || categoriesLoading))

  return (
    <Layout>
      <div>
        <h1 className="mb-4 text-2xl font-bold">Admin</h1>
        <div className="container mx-auto p-4 sm:p-8">
          <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>

          {/* Organization Selector */}
          <div className="mb-8 rounded-lg border p-4 sm:p-6">
            <h2 className="mb-4 text-xl font-semibold">Select Organization</h2>
            <div className="max-w-md">
              {orgsLoading ? (
                <div className="h-10 w-full animate-pulse rounded bg-gray-200"></div>
              ) : !organizations || organizations.length === 0 ? (
                <p className="text-gray-500">No organizations available</p>
              ) : (
                <Select
                  value={selectedOrganizationId}
                  onValueChange={setSelectedOrganizationId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
              <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
          ) : !selectedOrganizationId ? (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-gray-500">Please select an organization to manage</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Safes Section */}
              <div>
                <div className="mb-4 rounded-lg border p-4 sm:p-6">
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

                    <Button
                      type="submit"
                      disabled={createSafeLoading}
                      className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {createSafeLoading ? 'Adding...' : 'Add Safe'}
                    </Button>
                  </form>
                </div>

                {/* List of Current Safes */}
                <div className="rounded-lg border p-4 sm:p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    Safes for {organizations?.find(org => org.id === selectedOrganizationId)?.name}
                  </h2>
                  <div className="space-y-2">
                    {safesLoading ? (
                      <p className="text-gray-500">Loading safes...</p>
                    ) : !safes || safes.length === 0 ? (
                      <p className="text-gray-500">No safes added yet</p>
                    ) : (
                      <div className="divide-y rounded-md border">
                        {safes.map((safe) => (
                          <div 
                            key={safe.address}
                            className="flex flex-col justify-between p-3 sm:flex-row sm:items-center"
                          >
                            <AddressDisplay address={safe.address} chain={safe.chain} />
                            <button
                              onClick={() => handleDeleteSafe(safe.address)}
                              className="mt-2 text-red-500 hover:text-red-700 sm:mt-0"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories Section */}
              <div>
                <div className="mb-4 rounded-lg border p-4 sm:p-6">
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
                    <Button
                      type="submit"
                      className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                      Add Category
                    </Button>
                  </form>
                </div>

                {/* List of Current Categories */}
                <div className="rounded-lg border p-4 sm:p-6">
                  <h2 className="mb-4 text-xl font-semibold">
                    Categories for {organizations?.find(org => org.id === selectedOrganizationId)?.name}
                  </h2>
                  <div className="space-y-2">
                    {categoriesLoading ? (
                      <p className="text-gray-500">Loading categories...</p>
                    ) : !categories || categories.length === 0 ? (
                      <p className="text-gray-500">No categories added yet</p>
                    ) : (
                      <div className="divide-y rounded-md border">
                        {categories.map((category) => (
                          <div
                            key={category.id}
                            className="flex items-center justify-between p-3"
                          >
                            <span>{category.name}</span>
                            <button
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteCategory(category.id)}
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
