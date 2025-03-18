import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { api } from '@/utils/trpc'
import { CategoriesRow } from '@/components/AdminPage/Categories/CategoriesRow'
import { NewCategoryDialog } from '@/components/AdminPage/Categories/NewCategoryDialog'

interface CategoriesContainerProps {
    organizationId: string
    categories: Array<{
        id: string
        name: string
    }>
    isLoading: boolean
    isAdmin: boolean
}

export function CategoriesContainer({ organizationId, categories, isLoading, isAdmin }: CategoriesContainerProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const utils = api.useUtils()

    // Create category mutation
    const { mutate: createCategory, isPending: createLoading } = api.categories.create.useMutation({
        onSuccess: () => {
            utils.categories.getCategoriesByOrganization.invalidate({ organizationId })
        }
    })

    // Filter categories based on search term
    const filteredCategories = categories?.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    const handleAddCategory = (name: string) => {
        if (!name.trim()) return

        createCategory({
            name: name.trim(),
            organizationId
        })
    }

    const invalidateCategories = () => {
        utils.categories.getCategoriesByOrganization.invalidate({ organizationId })
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left side - Description */}
            <div className="md:col-span-1">
                <h3 className="text-xl font-semibold mb-4">Categories</h3>
                <p className="text-gray-500">
                    Edit, add or remove current categories. This impacts all safes.
                </p>
            </div>

            {/* Right side - Categories Table */}
            <div className="md:col-span-2">


                {/* Categories List */}
                <div className="border rounded-md overflow-hidden">
                    {/* Search and Add section */}
                    <div className="bg-gray-50 px-4 py-3 border-b">
                        <div className="flex justify-between items-center gap-2">
                            <div className="relative w-full max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <Input
                                    placeholder="Search categories..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            {isAdmin && (
                                <NewCategoryDialog
                                    onAddCategory={handleAddCategory}
                                    isLoading={createLoading}
                                />
                            )}
                        </div>
                    </div>
                    <div className="p-4">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                                <div className="h-10 bg-gray-200 animate-pulse rounded-md"></div>
                            </div>
                        ) : filteredCategories.length > 0 ? (
                            <div>
                                {filteredCategories.map(category => (
                                    <CategoriesRow
                                        key={category.id}
                                        category={category}
                                        canEditOrDelete={isAdmin}
                                        onDeleteSuccess={invalidateCategories}
                                        onUpdateSuccess={invalidateCategories}
                                    />
                                ))}
                            </div>
                        ) : searchTerm ? (
                            <div className="text-gray-500 py-4 text-center">
                                No categories found matching &quot;{searchTerm}&quot;
                            </div>
                        ) : (
                            <div className="text-gray-500 py-4 text-center">
                                No categories found. Add your first category.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
