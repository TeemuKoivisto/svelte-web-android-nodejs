import { error, json } from '@sveltejs/kit'

import { db } from '$lib/db'
import { handler } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = handler('GET /api/tasks', async event => {
  const tasks = await db.task.findMany({
    where: {
      user_id: event.locals.user.user_id
    }
  })
  return { data: tasks }
})

export const POST: RequestHandler = handler('POST /api/tasks', async (event, body) => {
  const created = await db.task.create({
    data: {
      ...body,
      user_id: event.locals.user.user_id
    }
  })
  return { data: created }
})
