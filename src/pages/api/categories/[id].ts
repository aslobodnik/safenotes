import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const id = parseInt(req.query.id as string, 10);

  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid category ID" });
  }

  try {
    const db = await getDb();

    // First check if there are any transfers using this category
    const usedInTransfers = await db.get(
      "SELECT COUNT(*) as count FROM transfer_categories WHERE category_id = ?",
      id
    );

    if (usedInTransfers.count > 0) {
      return res.status(400).json({
        error: "Cannot delete category that is being used by transfers",
      });
    }

    // Check if the category exists
    const category = await db.get("SELECT * FROM categories WHERE id = ?", id);

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete the category
    await db.run("DELETE FROM categories WHERE id = ?", id);

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return res.status(500).json({
      error: "Failed to delete category",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
