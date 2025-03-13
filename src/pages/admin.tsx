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
import { Trash2 } from 'lucide-react'
import { AddressDisplay } from '@/components/AddressDisplay'


export default function Admin() {
  const [newSafe, setNewSafe] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [newAdmin, setNewAdmin] = useState('')
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

  // Fetch admins for the selected organization
  const { data: admins, isLoading: adminsLoading } = api.admin.getOrgAdmins.useQuery(
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

  // Admin mutations
  const { mutate: addAdmin, isPending: addAdminLoading } = api.admin.addAdminToOrg.useMutation({
    onSuccess: () => {
      setNewAdmin('')
      void utils.admin.getOrgAdmins.invalidate({ organizationId: selectedOrganizationId })
    },
    onError: (error) => {
      alert(error.message)
    },
  })

  const { mutate: removeAdmin } = api.admin.removeAdminFromOrg.useMutation({
    onSuccess: () => {
      void utils.admin.getOrgAdmins.invalidate({ organizationId: selectedOrganizationId })
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

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newAdmin.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert('Invalid wallet address format')
      return
    }

    if (!selectedOrganizationId) {
      alert('Please select an organization')
      return
    }

    addAdmin({
      organizationId: selectedOrganizationId,
      walletAddress: newAdmin
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

  const handleRemoveAdmin = (walletAddress: string) => {
    if (confirm('Are you sure you want to remove this admin?')) {
      removeAdmin({
        organizationId: selectedOrganizationId,
        walletAddress
      })
    }
  }

  const isLoading = orgsLoading || (!!selectedOrganizationId && (safesLoading || categoriesLoading || adminsLoading))
  const orgName = organizations?.find(org => org.id === selectedOrganizationId)?.name

  return (
    <Layout>
      <div className="pb-12">
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
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
              <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
              <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
          ) : !selectedOrganizationId ? (
            <div className="rounded-lg border p-6 text-center">
              <p className="text-gray-500">Please select an organization to manage</p>
            </div>
          ) : (
            <div>
              {/* Section Headers */}
              <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                <h2 className="text-xl font-semibold">Safes</h2>
                <h2 className="text-xl font-semibold">Categories</h2>
                <h2 className="text-xl font-semibold">Admins</h2>
              </div>

              {/* Input Forms */}
              <div className="mb-6 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Add Safe Form */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">Add New Safe</h3>
                  <form onSubmit={handleAddSafe} className="space-y-4">
                    <div>
                      <label htmlFor="address" className="mb-1 block text-sm">
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
                    
                    <div>
                      <label htmlFor="chain" className="mb-1 block text-sm">
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
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      {createSafeLoading ? 'Adding...' : 'Add Safe'}
                    </Button>
                  </form>
                </div>

                {/* Add Category Form */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">Add New Category</h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label htmlFor="category" className="mb-1 block text-sm">
                        Category Name
                      </label>
                      <input
                        type="text"
                        id="category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        placeholder="Enter category name"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                    >
                      Add Category
                    </Button>
                  </form>
                </div>

                {/* Add Admin Form */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">Add Organization Admin</h3>
                  <form onSubmit={handleAddAdmin} className="space-y-4">
                    <div>
                      <label htmlFor="adminAddress" className="mb-1 block text-sm">
                        Wallet Address
                      </label>
                      <input
                        id="adminAddress"
                        type="text"
                        value={newAdmin}
                        onChange={(e) => setNewAdmin(e.target.value)}
                        placeholder="0x..."
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={addAdminLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {addAdminLoading ? 'Adding...' : 'Add Admin'}
                    </Button>
                  </form>
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Safes List */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">
                    Safes for {orgName}
                  </h3>
                  <div className="h-[300px] overflow-y-auto">
                    {safesLoading ? (
                      <p className="text-gray-500">Loading safes...</p>
                    ) : !safes || safes.length === 0 ? (
                      <p className="text-gray-500">No safes added yet</p>
                    ) : (
                      <div className="divide-y rounded-md border">
                        {safes.map((safe) => (
                          <div 
                            key={safe.address}
                            className="flex items-center justify-between p-3"
                          >
                            <AddressDisplay address={safe.address} chain={safe.chain} />
                            <button
                              onClick={() => handleDeleteSafe(safe.address)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Categories List */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">
                    Categories for {orgName}
                  </h3>
                  <div className="h-[300px] overflow-y-auto">
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

                {/* Admins List */}
                <div className="rounded-lg border p-4">
                  <h3 className="mb-4 font-medium">
                    Admins for {orgName}
                  </h3>
                  <div className="h-[300px] overflow-y-auto">
                    {adminsLoading ? (
                      <p className="text-gray-500">Loading admins...</p>
                    ) : !admins || admins.length === 0 ? (
                      <p className="text-gray-500">No admins added yet</p>
                    ) : (
                      <div className="divide-y rounded-md border">
                        {admins.map((admin) => (
                          <div
                            key={admin.id}
                            className="flex items-center justify-between p-3"
                          >
                            <AddressDisplay address={admin.walletAddress} />
                            <button
                              onClick={() => handleRemoveAdmin(admin.walletAddress)}
                              className="flex items-center text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              <span>Remove</span>
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
