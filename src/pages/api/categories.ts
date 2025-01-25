import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const db = await getDb();
      const categories = await db.all("SELECT * FROM categories ORDER BY name");
      return res.status(200).json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name } = req.body;

      if (!name || typeof name !== "string") {
        return res.status(400).json({ error: "Category name is required" });
      }

      const db = await getDb();
      await db.run("INSERT INTO categories (name) VALUES (?)", [name.trim()]);

      const categories = await db.all("SELECT * FROM categories ORDER BY name");
      return res.status(200).json(categories);
    } catch (error: Error | unknown) {
      // Handle SQLite unique constraint violation
      if (
        error instanceof Error &&
        error.message.includes("UNIQUE constraint failed")
      ) {
        return res.status(400).json({ error: "Category already exists" });
      }

      console.error("Error adding category:", error);
      return res.status(500).json({ error: "Failed to add category" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
