import { error } from '@sveltejs/kit'
import { handle } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async event => {
  const { query } = await handle(event)('GET /oauth/github/callback')
  return Response.redirect(`${query.redirect_uri}?location=${query.location}`, 301)
}
