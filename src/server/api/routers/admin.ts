import { and, asc, eq, inArray } from 'drizzle-orm'
import { z } from 'zod'
import { publicClient } from '@/lib/web3'
import { Address } from 'viem'

import { organizationAdmins, organizations } from '@/db/schema'
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '@/server/api/trpc'
import { TRPCError } from '@trpc/server'
import { getAddress } from 'viem'

export const adminRouter = createTRPCRouter({
  // Add a new admin to an organization (super admin only)
  addAdminToOrg: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        walletAddress: z.string().refine(
          (address) => {
            try {
              // Validate and normalize the Ethereum address
              getAddress(address);
              return true;
            } catch (error) {
              console.error('Error validating address:', error)
              return false;
            }
          },
          {
            message: 'Invalid Ethereum address format',
          }
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the organization exists
        const organization = await ctx.db
          .select()
          .from(organizations)
          .where(eq(organizations.id, input.organizationId))
          .then((rows) => rows[0]);

        if (!organization) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Organization not found',
          });
        }

        // Normalize the wallet address
        const normalizedAddress = getAddress(input.walletAddress);

        // Check if this admin already exists for this organization
        const existingAdmin = await ctx.db
          .select()
          .from(organizationAdmins)
          .where(
            and(
              eq(organizationAdmins.organizationId, input.organizationId),
              eq(organizationAdmins.walletAddress, normalizedAddress)
            )
          )
          .then((rows) => rows[0]);
        
        if (existingAdmin) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This wallet is already an admin for this organization',
          });
        }

        // Add the new admin
        await ctx.db.insert(organizationAdmins).values({
          organizationId: input.organizationId,
          walletAddress: normalizedAddress,
          createdAt: new Date(),
        });

        // Return all admins for this organization
        return ctx.db
          .select()
          .from(organizationAdmins)
          .where(eq(organizationAdmins.organizationId, input.organizationId))
          .orderBy(asc(organizationAdmins.createdAt));
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        
        // Handle unique constraint violation
        if (error instanceof Error && error.message.includes('duplicate key')) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'This wallet is already an admin for this organization',
          });
        }
        
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add admin',
          cause: error,
        });
      }
    }),

  // Get all admins for an organization (super admin only)
  getOrgAdmins: publicProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.db
        .select()
        .from(organizationAdmins)
        .where(eq(organizationAdmins.organizationId, input.organizationId))
        .orderBy(asc(organizationAdmins.createdAt));
    }),

  // Remove an admin from an organization (super admin only)
  removeAdminFromOrg: protectedProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
        walletAddress: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        // Normalize the wallet address
        const normalizedAddress = getAddress(input.walletAddress);
        // Check if this is the last admin in the organization
        const admins = await ctx.db
          .select()
          .from(organizationAdmins)
          .where(eq(organizationAdmins.organizationId, input.organizationId));
          
        if (admins.length <= 1) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot remove the last admin from an organization',
          });
        }

        // Remove the admin
        await ctx.db
          .delete(organizationAdmins)
          .where(
            and(
              eq(organizationAdmins.organizationId, input.organizationId),
              eq(organizationAdmins.walletAddress, normalizedAddress)
            )
          );

        // Return all remaining admins for this organization
        return ctx.db
          .select()
          .from(organizationAdmins)
          .where(eq(organizationAdmins.organizationId, input.organizationId))
          .orderBy(asc(organizationAdmins.createdAt));
    }),

  // Get all organizations where a wallet address is an admin
  getOrgsByAdmin: publicProcedure
    .input(
      z.object({
        walletAddress: z.string().refine(
          (address) => {
            try {
              // Validate and normalize the Ethereum address
              getAddress(address);
              return true;
            } catch (error) {
              console.error('Error validating address:', error)
              return false;
            }
          },
          {
            message: 'Invalid Ethereum address format',
          }
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        // Normalize the wallet address
        const normalizedAddress = getAddress(input.walletAddress);
        
        // Find all organization IDs where this wallet is an admin
        const adminOrgs = await ctx.db
          .select({
            organizationId: organizationAdmins.organizationId
          })
          .from(organizationAdmins)
          .where(eq(organizationAdmins.walletAddress, normalizedAddress));
        
        if (adminOrgs.length === 0) {
          return [];
        }
        
        // Get the organization IDs
        const orgIds = adminOrgs.map(org => org.organizationId);
        
        // Fetch the complete organization details
        const orgs = await ctx.db
          .select()
          .from(organizations)
          .where(
            // Using inArray operator for Drizzle ORM
            inArray(organizations.id, orgIds)
          );
          
        return orgs;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get organizations for admin',
          cause: error,
        });
      }
    }),
    getOrgAdminsWithEnsName: publicProcedure
    .input(
      z.object({
        organizationId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const admins = await ctx.db
        .select()
        .from(organizationAdmins)
        .where(eq(organizationAdmins.organizationId, input.organizationId));
    
        const adminsWithEnsName = await Promise.all(admins.map(async (admin) => {
          const ensName = await publicClient.getEnsName({
            address: admin.walletAddress as Address,
          })
          return { ...admin, ensName }
        }))
        return adminsWithEnsName
    }),
});