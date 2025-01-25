import { NextApiRequest, NextApiResponse } from "next";
import db from "@/db/index";
import { categories } from "@/db/schema";
import { asc } from "drizzle-orm";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.name));
        
      return res.status(200).json(categoryList);
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

      await db.insert(categories).values({
        name: name.trim(),
      });

      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.name));

      return res.status(200).json(categoryList);
    } catch (error) {
      // Handle Postgres unique constraint violation
      if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
        return res.status(400).json({ error: "Category already exists" });
      }

      console.error("Error adding category:", error);
      return res.status(500).json({ error: "Failed to add category" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
