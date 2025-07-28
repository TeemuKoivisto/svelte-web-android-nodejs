import { env } from '$env/dynamic/private'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async event => {
  return Response.redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      env.GITHUB_OAUTH_CLIENT_ID
    }&${event.url.search.slice(1)}`,
    302
  )
}
