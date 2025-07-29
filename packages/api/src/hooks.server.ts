import type { Handle } from '@sveltejs/kit'
import { authenticate } from '$lib/auth'

// export function getClient(locals: App.Locals, env: App.Platform['env']) {
//   if (locals.prisma) {
//     return locals.prisma
//   } else {
//     locals.prisma = new PrismaClient()
//   }
//   return locals.prisma
// }

export const handle = (async ({ event, resolve }) => {
  // if (!event.locals.prisma) {
  // event.platform.env.prisma = () => getClient(event.locals, event.platform!.env)
  // }
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
