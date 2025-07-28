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
  if (event.platform && event.url.pathname.startsWith('/api/')) {
    event.locals.user = await authenticate(event)
  }
  return resolve(event)
}) satisfies Handle
