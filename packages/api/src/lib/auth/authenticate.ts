import { error, type RequestEvent } from '@sveltejs/kit'
import { verifyJwt } from './jwt'
import { sessionMap } from '$lib/SessionMap'

export async function authenticate(event: RequestEvent) {
  const cookie = event.cookies.get('session')
  if (!cookie) {
    return error(403, 'You must be logged in')
  }
  const inmemory = sessionMap.get(cookie)
  if ('data' in inmemory) {
    return verifyJwt(cookie)
  } else if (inmemory.code !== 404) {
    return error(inmemory.code, inmemory.err)
  }
  // Decode first incase invalid token. This also throws if the jwt has expired
  const decoded = await verifyJwt(cookie)
  const session = await sessionMap.dbGet(cookie)
  if (!session) {
    return error(403, 'Your session has expired — sign in again')
  }
  return decoded
}
