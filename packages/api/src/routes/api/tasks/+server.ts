import { error, json } from '@sveltejs/kit'

import type { RequestHandler } from './$types'
import { db } from '$lib/db'

export const GET: RequestHandler = async event => {
  const todos = await db.task.findMany({
    where: {
      user_id: event.locals.user.user_id
    }
  })
  return json(todos)
}
