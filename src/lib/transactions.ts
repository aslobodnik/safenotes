// lib/transactions.ts

import { getDb } from "./db";

export async function syncTransactions(safeAddress: string): Promise<void> {
  const db = await getDb();

  try {
    // Get the last synced block number for this specific safe
    const lastSyncedTransaction = await db.get(
      "SELECT block_number FROM transactions WHERE safe_address = ? ORDER BY block_number DESC LIMIT 1",
      safeAddress
    );
    const lastBlockNumber = lastSyncedTransaction?.block_number || 0;

    // Build the URL based on the incoming safe address
    let nextUrl = `https://safe-transaction-mainnet.safe.global/api/v1/safes/${safeAddress}/all-transactions/?limit=100&executed=true&queued=true&blockNumber__gt=${lastBlockNumber}`;

    while (nextUrl) {
      const response = await fetch(nextUrl);
      const data = await response.json();

      const transactions = data.results || [];
      nextUrl = data.next; // Next page (if any) from the Safe Transaction Service

      // Prepare a statement for inserting into "transactions"
      const txStmt = await db.prepare(`
        INSERT OR IGNORE INTO transactions (
          transaction_hash,
          safe_address,
          to_address,
          value,
          data,
          nonce,
          execution_date,
          submission_date,
          block_number,
          is_executed,
          is_successful,
          tx_type,
          raw_tx
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const tx of transactions) {
        // Convert the entire transaction object to JSON:
        const rawTxJson = JSON.stringify(tx);

        await txStmt.run(
          tx.transactionHash, // transaction_hash
          safeAddress, // safe_address
          tx.to, // to_address
          tx.value, // value
          tx.data, // data
          tx.nonce, // nonce
          tx.executionDate, // execution_date
          tx.submissionDate, // submission_date
          tx.blockNumber, // block_number
          tx.isExecuted ? 1 : 0, // is_executed
          tx.isSuccessful ? 1 : 0, // is_successful
          tx.txType, // tx_type
          rawTxJson // raw_tx (the entire transaction as JSON)
        );
      }

      await txStmt.finalize();

      console.log(
        `Synced ${transactions.length} transactions from Safe ${safeAddress}`
      );
    }
  } catch (error) {
    console.error("Failed to sync transactions:", error);
  }
}
