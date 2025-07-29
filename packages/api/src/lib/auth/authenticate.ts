import { error, type RequestEvent } from '@sveltejs/kit'
import { base64url, jwtVerify } from 'jose'
import { db } from '$lib/db'
import { env } from '$env/dynamic/private'
import { verifyJwt } from './jwt'

export const ISSUER = 'svelte-web-android-nodejs.pages.dev'
export const AUDIENCE = 'svelte-web-android-nodejs.pages.dev:oauth'

export async function authenticate(event: RequestEvent) {
  const cookie = event.cookies.get('session')
  if (!cookie) {
    return error(403, 'You must be logged in')
  }
  // const inmemory = sessionMap.get(cookie)
  // const session = await event.platform.env.SESSIONS_KV.get(cookie)
  // if (!session) {
  //   return error(403, 'Your session has expired — login again')
  // }
  const decoded = await verifyJwt(cookie)
  return decoded
}
