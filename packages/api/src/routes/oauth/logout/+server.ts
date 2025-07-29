import { error } from '@sveltejs/kit'

import { verifyJwt } from '$lib/auth/jwt'
import { sessionMap } from '$lib/SessionMap'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async event => {
  const cookie = event.cookies.get('session')
  if (!cookie) return error(400, 'Already logged out')
  const jwt = await verifyJwt(cookie)
  await sessionMap.delete(cookie)
  event.cookies.delete('session', {
    path: '/'
  })
  return new Response(null, {
    status: 200
  })
}
