import { error, type RequestEvent } from '@sveltejs/kit'
import { base64url, jwtVerify } from 'jose'
import { db } from '$lib/db'

import type { Endpoints } from '@octokit/types'
import type { GoogleProfile } from '@org/lib/schemas'
import { UserStatus, type PrismaClient } from '@org/db/client'

export type GitHubUserData = Endpoints['GET /user']['response']['data']

interface KVUser {
  p: 'github' | 'google'
  user_id: string
}

// @TODO should save DB user to USERS_KV for quick fetching..?
// or just use db...
const getUser = (val: string | null): KVUser | undefined => {
  try {
    return val ? JSON.parse(val) : undefined
  } catch (err) {
    return undefined
  }
}

export const ISSUER = 'svelte-web-android-nodejs.pages.dev'
export const AUDIENCE = 'svelte-web-android-nodejs.pages.dev:oauth'

export async function authenticate(event: RequestEvent) {
  const cookie = event.cookies.get('session')
  if (!cookie) {
    return error(403, 'You must be logged in')
  }
  if (!event.platform) {
    return error(500, 'No event platform defined')
  }
  // const session = await event.platform.env.SESSIONS_KV.get(cookie)
  // if (!session) {
  //   return error(403, 'Your session has expired — login again')
  // }
  const secret = base64url.decode(event.platform.env.JWT_SECRET || '')
  const decoded = await jwtVerify(cookie, secret, {
    audience: [AUDIENCE]
  })
  return decoded.payload as unknown as App.SessionUser
}

export async function findOrCreateGithubUser(data: GitHubUserData, db: PrismaClient) {
  // const key = await env.USERS_KV.get(data.id.toString())
  // const user = getUser(key)
  // const prisma = env.prisma()
  // if (user?.p === 'github' && user.user_id) {
  //   return prisma.user.findUnique({
  //     where: { id: user.user_id }
  //   })
  // }
  const acc = await db.account.findFirst({
    where: {
      provider: 'github',
      providerAccountId: data.id.toString()
    },
    include: {
      user: true
    }
  })
  if (acc) {
    return acc.user
  }
  const created = await db.user.create({
    data: {
      name: data.name || '',
      email: data.email || '',
      image: data.avatar_url,
      status: UserStatus.ACTIVE
    }
    // select: {
    //   id: true,
    //   email: true,
    //   name: true,
    // }
  })
  const _account = await db.account.create({
    data: {
      user_id: created.id,
      type: 'oauth',
      provider: 'github',
      providerAccountId: data.id.toString()
    }
  })
  // const kvUser: KVUser = {
  //   p: 'github',
  //   user_id: created.id
  // }
  // await env.USERS_KV.put(data.id.toString(), JSON.stringify(kvUser))
  return created
}

export async function findOrCreateGoogleUser(data: GoogleProfile, prisma: PrismaClient) {
  // const key = await env.USERS_KV.get(data.sub)
  // const user = getUser(key)
  // const prisma = env.prisma()
  // if (user?.p === 'google' && user.user_id) {
  //   return prisma.user.findUnique({
  //     where: { id: user.user_id }
  //   })
  // }
  const acc = await prisma.account.findFirst({
    where: {
      provider: 'google',
      providerAccountId: data.sub
    },
    include: {
      user: true
    }
  })
  if (acc) {
    return acc.user
  }
  const created = await prisma.user.create({
    data: {
      name: `${data.given_name} ${data.family_name}`,
      email: data.email,
      image: data.picture,
      status: UserStatus.ACTIVE
    },
    select: {
      id: true,
      email: true,
      name: true,
      image: true
    }
  })
  const _account = await prisma.account.create({
    data: {
      user_id: created.id,
      type: 'oauth',
      provider: 'google',
      providerAccountId: data.sub
    }
  })
  // const kvUser: KVUser = {
  //   p: 'google',
  //   user_id: created.id
  // }
  // await env.USERS_KV.put(data.sub, JSON.stringify(kvUser))
  return created
}
