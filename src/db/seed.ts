import 'dotenv/config';
import { db } from '@/db';
import { organizations, safes } from '@/db/schema';

async function seed() {
  // Create ENS organization
  const [ensOrg] = await db
    .insert(organizations)
    .values({
      name: 'ENS',
      slug: 'ens',
      description: 'View transactions and annotations of ENS DAO Working Group Safes.',
      bannerImage: '/img/ens-banner.png', // You'll need to add these images
      logoImage: '/img/ens-logo.svg',
    })
    .returning();

  // Create Uniswap organization
  await db
    .insert(organizations)
    .values({
      name: 'Uniswap (UAC)',
      slug: 'uniswap',
      description: 'Uniswap Accountability Committee Safes',
      bannerImage: '/img/uniswap-banner.png',
      logoImage: '/img/uniswap-logo.svg',
    });

  // Update existing safes to belong to ENS org
  await db
    .update(safes)
    .set({
      organizationId: ensOrg.id,
    });
}

seed().catch(console.error); 