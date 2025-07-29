import { base64url, SignJWT } from 'jose'
import { error } from '@sveltejs/kit'
import { dev } from '$app/environment'
import { env } from '$env/dynamic/private'

import { AUDIENCE, findOrCreateGithubUser, ISSUER } from '$lib/auth'
import { db } from '$lib/db'
import { handle } from '$lib/handlers'
import { AUTH_RESP } from '@org/lib/schemas'

import type { RequestHandler } from './$types'
import type { z } from 'zod'
import type { Endpoints } from '@octokit/types'

type GitHubUserData = Endpoints['GET /user']['response']['data']

export const POST: RequestHandler = async event => {
  const { body } = await handle(event)('POST /oauth/github/authorize')
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_CLIENT_ID,
      client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
      code: body.code
    })
  })
  const result: { access_token?: string; error?: string } = await response.json()
  if (result.error || !result.access_token) {
    return new Response(JSON.stringify(result), {
      status: 401,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
  const githubUser: GitHubUserData = await (
    await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `token ${result.access_token}`,
        'User-Agent': 'teemukoivisto-xyz-cf-worker'
      }
    })
  ).json()
  const dbUser = await findOrCreateGithubUser(githubUser, db)
  if (!dbUser) return error(500, 'Failed to find or create db user')
  const payload = {
    user_id: dbUser.id,
    email: dbUser.email,
    superUser: dbUser.email === 'teemu.koivisto@alumni.helsinki.fi'
  }
  const monthExpiry = 60 * 60 * 24 * 30 // 30 days
  const timeNow = Math.floor(Date.now() / 1000)
  const secret = base64url.decode(env.JWT_SECRET as string)
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(timeNow + monthExpiry)
    .setIssuedAt(timeNow)
    .sign(secret)
  const session = {
    oauth: {
      id: githubUser.id.toString(),
      avatar_url: githubUser.avatar_url,
      author: githubUser.login,
      origin: 'github'
    },
    access_token: result.access_token
  }
  // await db.session.up
  // await event.platform.env.SESSIONS_KV.put(jwt, JSON.stringify(session), {
  //   expirationTtl: monthExpiry
  // })
  event.cookies.set('session', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    maxAge: monthExpiry
  })
  const resp: z.infer<typeof AUTH_RESP> = {
    user: dbUser,
    expires: Date.now() + monthExpiry * 1000
  }
  return new Response(JSON.stringify(resp), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  })
}
