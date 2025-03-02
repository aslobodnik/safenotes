import 'dotenv/config';
import { db } from '@/db'
import { safes, transfers, organizations, categories, transferCategories } from '@/db/schema'
import fs from 'fs/promises'
import path from 'path'

async function backupDatabase() {
  console.log('🔄 Starting database backup...')
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(process.cwd(), 'backups', timestamp)
    
    // Create backup directory
    await fs.mkdir(backupDir, { recursive: true })
    
    // Backup each table
    const tables = {
      organizations: await db.select().from(organizations),
      safes: await db.select().from(safes),
      transfers: await db.select().from(transfers),
      categories: await db.select().from(categories),
      transferCategories: await db.select().from(transferCategories),
    }

    // Save each table to a JSON file
    for (const [tableName, data] of Object.entries(tables)) {
      const filePath = path.join(backupDir, `${tableName}.json`)
      await fs.writeFile(filePath, JSON.stringify(data, null, 2))
      console.log(`✅ Backed up ${tableName} to ${filePath}`)
    }

    console.log(`\n🎉 Database backup completed successfully!`)
    console.log(`📁 Backup location: ${backupDir}`)

  } catch (error) {
    console.error('❌ Backup failed:', error)
    process.exit(1)
  }
}

backupDatabase().catch(console.error) 