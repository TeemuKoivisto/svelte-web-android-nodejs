import { error, json } from '@sveltejs/kit'
import { dev } from '$app/environment'

import { fetchGithubUser, findOrCreateGithubUser } from '$lib/auth'
import { signJwt } from '$lib/auth/jwt'
import { db } from '$lib/db'
import { handle } from '$lib/handlers'
import { sessionMap } from '$lib/SessionMap'
import { oauth } from '@org/lib/schemas'

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
  await sessionMap.upsert(dbUser.id, jwt, expires_at, github.data.accessToken)
  event.cookies.set('session', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    expires: expires_at
  })
  const resp: z.infer<(typeof oauth)['POST /oauth/github/authorize']['response']> = {
    user: dbUser,
    expiryInSeconds: exp
  }
  return json(resp)
}
