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
  // const session = {
  //   oauth: {
  //     id: githubUser.id.toString(),
  //     avatar_url: githubUser.avatar_url,
  //     author: githubUser.login,
  //     origin: 'github'
  //   },
  //   access_token: result.access_token
  // }
  // await db.session.up
  // await event.platform.env.SESSIONS_KV.put(jwt, JSON.stringify(session), {
  //   expirationTtl: monthExpiry
  // })
  event.cookies.set('session', jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
    secure: !dev,
    expires: new Date(exp * 1000)
  })
  const resp: z.infer<typeof AUTH_RESP> = {
    user: dbUser,
    expiryInSeconds: exp
  }
  return json(resp)
}
