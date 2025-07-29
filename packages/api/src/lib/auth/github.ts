import type { Endpoints } from '@octokit/types'
import { UserStatus, type PrismaClient } from '@org/db/client'
import { env } from '$env/dynamic/private'
import type { Result } from '@org/lib'

export type GitHubUserData = Endpoints['GET /user']['response']['data']

export async function fetchGithubUser(code: string): Promise<
  Result<{
    access_token: string
    githubUser: GitHubUserData
  }>
> {
  const oauth = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code: code
    })
  })
  const result: { access_token?: string; error?: string } = await oauth.json()
  if (result.error || !result.access_token) {
    return { err: result.error || 'GitHub oauth login failed', code: 401 }
  }
  const user = await fetch('https://api.github.com/user', {
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${result.access_token}`,
      'User-Agent': 'teemukoivisto-xyz-cf-worker'
    }
  })
  const githubUser = await user.json()
  return {
    data: {
      access_token: result.access_token,
      githubUser
    }
  }
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
