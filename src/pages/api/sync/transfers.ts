import { getDb } from "@/lib/db";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDb();
    let totalNewRecords = 0;

    // Get list of safes from database
    const safes = await db.all("SELECT address FROM safes");
    console.log("Found safes:", safes); // Debug log

    if (!safes || safes.length === 0) {
      return res.status(400).json({ error: "No safes found in database" });
    }

    for (const safe of safes) {
      console.log("Processing safe:", safe.address); // Debug log

      // Fetch latest transfer for this safe
      const lastTransfer = await db.get(
        "SELECT block_number FROM transfers WHERE safe_address = ? ORDER BY block_number DESC LIMIT 1",
        [safe.address]
      );
      console.log("Last transfer:", lastTransfer); // Debug log

      // Fetch new transfers from API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/safes/${safe.address}/transfers`;
      console.log("Fetching from:", apiUrl); // Debug log

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(
          `API request failed with status ${
            response.status
          }: ${await response.text()}`
        );
      }

      const data = await response.json();
      let safeNewRecords = 0;

      // Insert only new transfers
      for (const transfer of data.results) {
        if (!lastTransfer || transfer.blockNumber > lastTransfer.block_number) {
          await db.run(
            `INSERT OR REPLACE INTO transfers (
              transfer_id,
              safe_address,
              type,
              execution_date,
              block_number,
              transaction_hash,
              from_address,
              to_address,
              value,
              token_address,
              token_name,
              token_symbol,
              token_decimals,
              token_logo_uri
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              transfer.transferId,
              safe.address,
              transfer.type,
              transfer.executionDate,
              transfer.blockNumber,
              transfer.transactionHash,
              transfer.from,
              transfer.to,
              transfer.value,
              transfer.tokenInfo?.address || null,
              transfer.tokenInfo?.name || null,
              transfer.tokenInfo?.symbol || null,
              transfer.tokenInfo?.decimals || null,
              transfer.tokenInfo?.logoUri || null,
            ]
          );
          safeNewRecords++;
          totalNewRecords++;
        }
      }
      console.log(
        `Added ${safeNewRecords} new records for safe ${safe.address}`
      );
    }

    console.log(`Sync complete. Total new records added: ${totalNewRecords}`);
    return res.status(200).json({
      success: true,
      newRecords: totalNewRecords,
    });
  } catch (error) {
    console.error("Detailed error:", error);
    return res.status(500).json({
      error: "Failed to sync transfers",
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
