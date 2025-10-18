import { error, json } from '@sveltejs/kit'
import { dev } from '$app/environment'

import { fetchGithubUser, findOrCreateGithubUser } from '$lib/auth'
import { signJwt } from '$lib/auth/jwt'
import { db } from '$lib/db'
import { handler } from '$lib/handlers'
import { sessionMap } from '$lib/SessionMap'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = handler('POST /oauth/github/authorize', async (event, body) => {
  const github = await fetchGithubUser(body.code)
  if ('err' in github) {
    return github
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
  return { data: { user: dbUser, expiryInSeconds: exp } }
})
