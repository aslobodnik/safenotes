import db from "@/db/index";
import { eq } from 'drizzle-orm';
import { safes } from '@/db/schema';

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const safesList = await db.select().from(safes).where(eq(safes.removed, false));
      return res.status(200).json(safesList);
    } catch (error) {
      console.error("Error fetching safes:", error);
      return res.status(500).json({ error: "Failed to fetch safes" });
    }
  }

  if (req.method === "POST") {
    try {
      const { address } = req.body;

      if (!address || typeof address !== "string") {
        return res.status(400).json({ error: "Invalid safe address" });
      }

      // Validate address format
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        return res.status(400).json({ error: "Invalid Ethereum address format" });
      }

      // Insert new safe using Drizzle
      await db.insert(safes).values({
        address,
        removed: false,
        removedAt: null
      });

      return res.status(201).json({ message: "Safe added successfully" });
    } catch (error) {
      console.error("Error adding safe:", error);
      return res.status(500).json({ error: "Failed to add safe" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
