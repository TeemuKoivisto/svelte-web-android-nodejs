import type { Handle } from '@sveltejs/kit'
import { authenticate } from '$lib/auth'

export const handle = (async ({ event, resolve }) => {
  if (event.url.pathname.startsWith('/api/')) {
    event.locals.user = await authenticate(event)
  }
  return resolve(event)
}) satisfies Handle
