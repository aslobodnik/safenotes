import { getDb } from "@/lib/db";

async function initDb() {
  try {
    await getDb();
    console.log("Database initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}

initDb();
