import { db } from './db'

import type { Result } from '@org/lib'

type Jwt = string
type Session = {
  expires_at: number
  user_id: string
  oauthToken: string | null
  jwt: Jwt
}

/**
 * Use in-memory SessionMap to avoid constant bombarding of session table & faster auth.
 *
 * This works great with single server setup but with multiple servers sessions will get out-of-sync.
 * I've used Postgres triggers to keep these auth services in-sync before, but they might become a
 * a bottleneck at some point (way later down the road). Redis (or Cloudflare KV) might be then a better choice.
 */
export class SessionMap {
  map = new Map<Jwt, Session>()
  time = Date.now()

  get(jwt: Jwt): Result<Session> {
    const found = this.map.get(jwt)
    this.time = Date.now()
    if (!found) {
      return { err: 'Session not found', code: 404 }
    } else if (found.expires_at < this.time) {
      return { err: 'Session expired', code: 403 }
    }
    return { data: found }
  }

  async dbGet(jwt: Jwt) {
    const session = await db.session.findUnique({
      where: {
        jwt
      }
    })
    if (session) {
      this.map.set(session.jwt, {
        ...session,
        expires_at: session.expires_at.getTime()
      })
    }
    return session
  }

  async upsert(userId: string, jwt: Jwt, expires_at: Date, oauthToken?: string) {
    const session = await db.session.upsert({
      where: { user_id: userId },
      create: {
        oauthToken,
        jwt,
        user_id: userId,
        expires_at
      },
      update: {
        oauthToken,
        jwt,
        expires_at
      }
    })
    this.map.set(session.jwt, {
      ...session,
      expires_at: session.expires_at.getTime()
    })
    return session
  }

  async delete(jwt: Jwt) {
    const res = await db.session.deleteMany({
      where: {
        jwt
      }
    })
    this.map.delete(jwt)
    return res.count > 0
  }
}

export const sessionMap = new SessionMap()
