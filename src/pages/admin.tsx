"use client";

import { useState, useEffect } from "react";

type Category = {
  id: number;
  name: string;
};

type Safe = {
  address: string;
};

export default function AdminPage() {
  const [newSafe, setNewSafe] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [safes, setSafes] = useState<Safe[]>([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    };

    // Fetch safes
    const fetchSafes = async () => {
      const response = await fetch("/api/safes");
      if (response.ok) {
        const data = await response.json();
        setSafes(data);
      }
    };

    fetchCategories();
    fetchSafes();
  }, []);

  const handleAddSafe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate address format
    if (!newSafe.match(/^0x[a-fA-F0-9]{40}$/)) {
      alert("Invalid safe address format");
      return;
    }

    try {
      const response = await fetch("/api/safes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: newSafe }),
      });

      if (!response.ok) {
        throw new Error("Failed to add safe");
      }

      // Refresh the safes list
      const updatedSafesResponse = await fetch("/api/safes");
      if (updatedSafesResponse.ok) {
        const data = await updatedSafesResponse.json();
        setSafes(data);
      }

      setNewSafe("");
    } catch (error) {
      console.error("Error adding safe:", error);
      alert("Failed to add safe");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!newCategory.trim()) {
      alert("Category name cannot be empty");
      return;
    }

    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCategory.trim() }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add category");
      }

      // Refresh the categories list
      const updatedCategoriesResponse = await fetch("/api/categories");
      if (updatedCategoriesResponse.ok) {
        const data = await updatedCategoriesResponse.json();
        setCategories(data);
      }

      setNewCategory("");
    } catch (error) {
      console.error("Error adding category:", error);
      alert(error instanceof Error ? error.message : "Failed to add category");
    }
  };

  const handleDeleteSafe = async (address: string) => {
    try {
      const response = await fetch(`/api/safes/${address}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete safe");
      }

      // Update the local state to remove the deleted safe
      setSafes(safes.filter((safe) => safe.address !== address));
    } catch (error) {
      console.error("Error deleting safe:", error);
      alert("Failed to delete safe");
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          throw new Error(data.error || "Failed to delete category");
        } else {
          throw new Error("Failed to delete category");
        }
      }

      // Update the local state to remove the deleted category
      setCategories(categories.filter((category) => category.id !== id));
    } catch (error) {
      console.error("Error deleting category:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Safes Section */}
        <div>
          <div className="p-6 border rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-4">Add New Safe</h2>
            <form onSubmit={handleAddSafe}>
              <div className="mb-4">
                <label htmlFor="safeAddress" className="block mb-2">
                  Safe Address
                </label>
                <input
                  type="text"
                  id="safeAddress"
                  value={newSafe}
                  onChange={(e) => setNewSafe(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0x..."
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Safe
              </button>
            </form>
          </div>

          {/* List of Current Safes */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Safes</h2>
            <div className="space-y-2">
              {safes.length === 0 ? (
                <p className="text-gray-500">No safes added yet</p>
              ) : (
                safes.map((safe) => (
                  <div
                    key={safe.address}
                    className="flex items-center justify-between p-2 border rounded"
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
          <div className="p-6 border rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label htmlFor="category" className="block mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Category
              </button>
            </form>
          </div>

          {/* List of Current Categories */}
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Current Categories</h2>
            <div className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500">No categories added yet</p>
              ) : (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-2 border rounded"
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
  );
}
