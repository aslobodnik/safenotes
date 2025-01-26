import { asc, eq } from 'drizzle-orm'
import { NextApiRequest, NextApiResponse } from 'next'

import { db } from '@/db'
import { categories } from '@/db/schema'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.name))

      return res.status(200).json(categoryList)
    } catch (error) {
      console.error('Error fetching categories:', error)
      return res.status(500).json({ error: 'Failed to fetch categories' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { name } = req.body

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Category name is required' })
      }

      await db.insert(categories).values({
        name: name.trim(),
      })

      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.name))

      return res.status(200).json(categoryList)
    } catch (error) {
      // Handle Postgres unique constraint violation
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === '23505'
      ) {
        return res.status(400).json({ error: 'Category already exists' })
      }

      console.error('Error adding category:', error)
      return res.status(500).json({ error: 'Failed to add category' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body

      if (!id || typeof id !== 'string') {
        return res
          .status(400)
          .json({ error: 'Category ID must be a valid UUID' })
      }

      await db.delete(categories).where(eq(categories.id, id))

      const categoryList = await db
        .select()
        .from(categories)
        .orderBy(asc(categories.name))

      return res.status(200).json(categoryList)
    } catch (error) {
      console.error('Error deleting category:', error)
      return res.status(500).json({ error: 'Failed to delete category' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
