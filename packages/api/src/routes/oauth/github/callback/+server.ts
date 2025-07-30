import { json } from '@sveltejs/kit'
import { searchIntoObject } from '$lib/handlers'

import type { RequestHandler } from './$types'
import { oauth } from '@org/lib/schemas'

export const GET: RequestHandler = async event => {
  const query = oauth['GET /oauth/github/callback'].query.safeParse(
    searchIntoObject(event.url.searchParams)
  )
  if (query.error) {
    return json(query.error, {
      status: 400
    })
  }
  return Response.redirect(`${query.data.redirect_uri}?location=${query.data.location}`, 301)
}
