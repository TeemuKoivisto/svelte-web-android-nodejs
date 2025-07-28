import type { PrismaClient } from '@org/db'

declare global {
  namespace App {
    interface SessionUser {
      user_id: string
      email: string
      superUser: boolean
    }
    interface Platform {
      env: {
        // SESSIONS_KV: KVNamespace
        // USERS_KV: KVNamespace
        GITHUB_OAUTH_CLIENT_ID: string
        GITHUB_OAUTH_CLIENT_SECRET: string
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        JWT_SECRET: string
        DATABASE_URL: string
        API_URL: string
        // prisma: () => PrismaClient
      }
    }
    interface Locals {
      // prisma: PrismaClient
      user?: SessionUser
    }
  }
}

export {}
