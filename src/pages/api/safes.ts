import { getDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const includeRemoved = req.query.includeRemoved === "true";
      const db = await getDb();

      const safes = await db.all(
        `SELECT address, removed, removed_at 
         FROM safes 
         WHERE ${!includeRemoved ? "removed = 0" : "1=1"}
         ORDER BY address`
      );

      return res.status(200).json(safes);
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
        return res
          .status(400)
          .json({ error: "Invalid Ethereum address format" });
      }

      const db = await getDb();

      // Insert new safe
      await db.run(
        "INSERT INTO safes (address, removed, removed_at) VALUES (?, 0, NULL)",
        [address]
      );

      return res.status(201).json({ message: "Safe added successfully" });
    } catch (error) {
      console.error("Error adding safe:", error);
      return res.status(500).json({ error: "Failed to add safe" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
