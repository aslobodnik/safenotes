import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/utils/trpc'
import { AdminContainer } from '@/components/AdminPage/AdminContainer'
import { OrgHeader } from '@/components/OrgHeader'

import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Loading skeleton component
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
    <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
    <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
    <div className="h-64 animate-pulse rounded-lg bg-gray-200"></div>
  </div>
)

// No orgs available component
const NoOrgsMessage = () => (
  <div className="rounded-lg border p-6 text-center">
    <p className="text-gray-500">No organizations available</p>
  </div>
)

// Component to display when no org is selected but multiple exist
const SelectOrgPrompt = () => (
  <div className="rounded-lg border p-6 text-center">
    <p className="text-gray-500">Please select an organization to manage</p>
  </div>
)

export default function AdminDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

  // Fetch all organizations
  const { data: allOrgs, isLoading: orgsLoading } = api.organizations.getAll.useQuery()

  const { data: organization } = api.organizations.getById.useQuery(
    { id: selectedOrgId || '' },
    { enabled: !!selectedOrgId }
  )

  // Auto-select the 'ens' organization or the first one if only one exists
  useEffect(() => {
    if (!orgsLoading && allOrgs) {
      setIsLoading(false)
      
      // Try to find the ENS organization first
      const ensOrg = allOrgs.find(org => org.slug === 'ens')
      
      if (ensOrg) {
        // If ENS org found, select it
        setSelectedOrgId(ensOrg.id)
      } else if (allOrgs.length === 1) {
        // If only one org and not ENS, select it
        setSelectedOrgId(allOrgs[0].id)
      } else if (allOrgs.length > 0) {
        // If multiple orgs but no ENS, select the first one
        setSelectedOrgId(allOrgs[0].id)
      }
    }
  }, [allOrgs, orgsLoading])

  // Handle organization selection from dropdown
  const handleOrgChange = (orgId: string) => {
    setSelectedOrgId(orgId)
  }

  // Render organization selector
  const renderOrgSelector = () => {
    if (!allOrgs || allOrgs.length <= 1) return null
    
    // Find the currently selected organization
    // const selectedOrg = allOrgs.find(org => org.id === selectedOrgId)
    
    return (
      <Select 
        value={selectedOrgId || undefined} 
        onValueChange={handleOrgChange}
      >
        <SelectTrigger className="w-full sm:w-[220px] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <SelectValue placeholder="Select an organization" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {allOrgs.map((org) => (
            <SelectItem key={org.id} value={org.id} className="focus:bg-gray-100">
              <div className="flex items-center gap-2">
                <img 
                  src={org.logoImage} 
                  alt={`${org.name} logo`}
                  className="h-5 w-5 rounded-full object-contain"
                />
                <span>{org.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return <LoadingSkeleton />
    }
    
    // No organizations
    if (!allOrgs || allOrgs.length === 0) {
      return <NoOrgsMessage />
    }
    
    // Has organizations
    return (
      <div>
        {organization && <OrgHeader organization={organization} />}
        
        {/* Admin Container - Only show when an org is selected */}
        {selectedOrgId ? (
          <AdminContainer orgId={selectedOrgId} />
        ) : (
          <SelectOrgPrompt />
        )}
      </div>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage organizations, safes, and categories.</p>
          </div>
          <div className="w-full sm:w-auto sm:self-center">
            {renderOrgSelector()}
          </div>
        </div>
        
        {renderContent()}
      </div>
    </Layout>
  )
}
