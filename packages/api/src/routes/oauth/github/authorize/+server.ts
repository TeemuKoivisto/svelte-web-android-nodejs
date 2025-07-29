import { error, json } from '@sveltejs/kit'
import { dev } from '$app/environment'

import { fetchGithubUser, findOrCreateGithubUser } from '$lib/auth'
import { signJwt } from '$lib/auth/jwt'
import { db } from '$lib/db'
import { handle } from '$lib/handlers'
import { AUTH_RESP } from '@org/lib/schemas'

import type { RequestHandler } from './$types'
import type { z } from 'zod'

export const POST: RequestHandler = async event => {
  const { body } = await handle(event)('POST /oauth/github/authorize')
  const github = await fetchGithubUser(body.code)
  if ('err' in github) {
    return error(github.code, github.err)
  }
  const dbUser = await findOrCreateGithubUser(github.data.githubUser, db)
  const { jwt, exp } = await signJwt(dbUser)
  const expires_at = new Date(exp * 1000)
  const _session = await db.session.upsert({
    where: { user_id: dbUser.id },
    create: {
      oauthToken: github.data.access_token,
      jwt,
      user_id: dbUser.id,
      expires_at
    },
    update: {
      oauthToken: github.data.access_token,
      jwt,
      expires_at
    }
  })
  event.cookies.set('session', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    expires: expires_at
  })
  const resp: z.infer<typeof AUTH_RESP> = {
    user: dbUser,
    expiryInSeconds: exp
  }
  return json(resp)
}
