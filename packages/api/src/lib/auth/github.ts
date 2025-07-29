import { error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

import { UserStatus, type PrismaClient } from '@org/db/client'
import type { Endpoints } from '@octokit/types'
import type { Result } from '@org/lib'

export type GitHubUserData = Endpoints['GET /user']['response']['data']

export async function fetchGithubUser(code: string): Promise<
  Result<{
    accessToken: string
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
      'User-Agent': 'svelte-web-android-nodejs'
    }
  })
  const githubUser = await user.json()
  return {
    data: {
      accessToken: result.access_token,
      githubUser
    }
  }
}

export async function findOrCreateGithubUser(data: GitHubUserData, db: PrismaClient) {
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
  } else if (!data.email) {
    return error(400, `No valid email address for GitHub account: ${JSON.stringify(data)}`)
  }
  const created = await db.user.create({
    data: {
      name: data.name || '',
      email: data.email,
      image: data.avatar_url,
      status: UserStatus.ACTIVE,
      accounts: {
        create: {
          type: 'oauth',
          provider: 'github',
          providerAccountId: data.id.toString()
        }
      }
    }
  })
  return created
}
