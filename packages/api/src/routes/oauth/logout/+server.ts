import { error } from '@sveltejs/kit'

import { verifyJwt } from '$lib/auth/jwt'
import { sessionMap } from '$lib/SessionMap'
import { handler } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const POST: RequestHandler = handler('POST /oauth/logout', async event => {
  const cookie = event.cookies.get('session')
  if (!cookie) return { err: 'Already logged out', code: 400 }
  const jwt = await verifyJwt(cookie)
  await sessionMap.delete(cookie)
  event.cookies.delete('session', {
    path: '/'
  })
  return { data: null }
})
