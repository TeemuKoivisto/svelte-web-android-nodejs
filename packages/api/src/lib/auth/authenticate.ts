import { error, type RequestEvent } from '@sveltejs/kit'
import { base64url, jwtVerify } from 'jose'
import { db } from '$lib/db'

export const ISSUER = 'svelte-web-android-nodejs.pages.dev'
export const AUDIENCE = 'svelte-web-android-nodejs.pages.dev:oauth'

export async function authenticate(event: RequestEvent) {
  const cookie = event.cookies.get('session')
  if (!cookie) {
    return error(403, 'You must be logged in')
  }
  if (!event.platform) {
    return error(500, 'No event platform defined')
  }
  // const session = await event.platform.env.SESSIONS_KV.get(cookie)
  // if (!session) {
  //   return error(403, 'Your session has expired — login again')
  // }
  const secret = base64url.decode(event.platform.env.JWT_SECRET || '')
  const decoded = await jwtVerify(cookie, secret, {
    audience: [AUDIENCE]
  })
  return decoded.payload as unknown as App.SessionUser
}
