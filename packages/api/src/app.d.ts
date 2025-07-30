import type { PrismaClient } from '@org/db/client'
import type { JwtPayload } from './lib/auth/jwt'

declare global {
  namespace App {
    interface SessionUser {
      user_id: string
      email: string
      superUser: boolean
    }
    interface Platform {
      env: {
        GITHUB_OAUTH_CLIENT_ID: string
        GITHUB_OAUTH_CLIENT_SECRET: string
        GOOGLE_CLIENT_ID: string
        GOOGLE_CLIENT_SECRET: string
        JWT_SECRET: string
        DATABASE_URL: string
      }
    }
    interface Locals {
      user: JwtPayload
    }
  }
}

export {}
