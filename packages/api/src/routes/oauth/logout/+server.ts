import { error } from '@sveltejs/kit'

import { verifyJwt } from '$lib/auth/jwt'
import { db } from '$lib/db'
import type { RequestHandler } from './$types'

export const POST: RequestHandler = async event => {
  const cookie = event.cookies.get('session')
  if (!cookie) return error(400, 'Already logged out')
  const jwt = await verifyJwt(cookie)
  await db.session.delete({
    where: {
      user_id: jwt.user_id
    }
  })
  event.cookies.delete('session', {
    path: '/'
  })
  return new Response(null, {
    status: 200
  })
}
