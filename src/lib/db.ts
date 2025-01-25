import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

// Helper type for our DB
type DB = Database<sqlite3.Database, sqlite3.Statement>;

let db: DB | null = null;

export async function getDb(): Promise<DB> {
  if (!db) {
    db = await open({
      filename: "./db.db",
      driver: sqlite3.Database,
    });

    // Enable foreign key constraints
    await db.run("PRAGMA foreign_keys = ON");

    // Create necessary tables
    await db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS safes (
        address TEXT PRIMARY KEY,
        removed BOOLEAN DEFAULT 0,
        removed_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS transfers (
        transfer_id TEXT PRIMARY KEY,            -- Unique identifier from API
        safe_address TEXT NOT NULL,              -- Associated safe address
        type TEXT NOT NULL,                      -- ETHER_TRANSFER or ERC20_TRANSFER
        execution_date TEXT NOT NULL,            -- Timestamp of execution
        block_number INTEGER NOT NULL,           -- Block number
        transaction_hash TEXT NOT NULL,          -- Transaction hash
        from_address TEXT NOT NULL,              -- Sender address
        to_address TEXT NOT NULL,                -- Recipient address
        value TEXT,                              -- Amount transferred (in base units)
        token_address TEXT,                      -- NULL for ETH, token contract for ERC20
        token_name TEXT,                         -- NULL for ETH, token name for ERC20
        token_symbol TEXT,                       -- NULL for ETH, token symbol for ERC20
        token_decimals INTEGER,                  -- NULL for ETH, decimals for ERC20
        token_logo_uri TEXT,                     -- NULL for ETH, logo URL for ERC20
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (safe_address) REFERENCES safes(address)
      );

      CREATE TABLE IF NOT EXISTS transfer_categories (
        transfer_id TEXT,
        category_id INTEGER,
        FOREIGN KEY (transfer_id) REFERENCES transfers(transfer_id),
        FOREIGN KEY (category_id) REFERENCES categories(id),
        PRIMARY KEY (transfer_id, category_id)
      );
    `);
  }
  return db;
}
