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

    // Run migrations if needed
    // Note: You'll need to set up a migrations folder and generate migrations
    // await migrate(db, { migrationsFolder: './migrations' });
  }
  
  return db;
}
