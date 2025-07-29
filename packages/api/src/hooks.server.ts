import type { Handle } from '@sveltejs/kit'
import { authenticate } from '$lib/auth'

export const handle = (async ({ event, resolve }) => {
  if (event.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      }
    })
  }
  if (event.platform && event.url.pathname.startsWith('/api/')) {
    event.locals.user = await authenticate(event)
  }
  const resp = await resolve(event)
  resp.headers.append('Access-Control-Allow-Origin', `*`)
  return resp
}) satisfies Handle
