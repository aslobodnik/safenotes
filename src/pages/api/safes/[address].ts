import { NextApiRequest, NextApiResponse } from "next";
import { getDb } from "@/lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { address } = req.query;

  if (req.method === "DELETE") {
    try {
      const db = await getDb();
      await db.run(
        "UPDATE safes SET removed = 1, removed_at = DATETIME('now') WHERE address = ?",
        [address]
      );
      return res.status(200).json({ message: "Safe removed successfully" });
    } catch (error) {
      console.error("Error removing safe:", error);
      return res.status(500).json({ error: "Failed to remove safe" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
