import { PrismaClient } from '@org/db/client'
import { env } from '$env/dynamic/private'

declare global {
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient({
    datasourceUrl: env.DATABASE_URL
  })
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      datasourceUrl: env.DATABASE_URL
      // log: ["query"],
    })
  }
  prisma = global.cachedPrisma
}

export const db = prisma
