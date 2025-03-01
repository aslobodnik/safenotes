import 'dotenv/config';
import { db } from '@/db'
import { organizations, safes } from '@/db/schema'
/**
 * This migration is used to initialize the organization table.
 * It creates the ENS organization and updates all existing safes to use it.
 */
async function seed() {
  console.log('Starting seed with DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    // Create ENS organization
    const [ensOrg] = await db
      .insert(organizations)
      .values({
        name: 'ENS',
        slug: 'ens',
      })
      .returning();

    console.log('Created ENS organization:', ensOrg);

    // Update existing safes
    await db
      .update(safes)
      .set({
        organizationId: ensOrg.id,
      });

    console.log('Updated safes with ENS organization');
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

seed().catch((error) => {
  console.error('Seed script failed:', error);
  process.exit(1);
}); 