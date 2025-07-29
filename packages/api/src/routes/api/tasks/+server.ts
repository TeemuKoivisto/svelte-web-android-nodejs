import { error, json } from '@sveltejs/kit'

import { db } from '$lib/db'
import { handle } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const GET: RequestHandler = async event => {
  const todos = await db.task.findMany({
    where: {
      user_id: event.locals.user.user_id
    }
  })
  return json(todos)
}

export const POST: RequestHandler = async event => {
  const { body } = await handle(event)('POST /api/tasks')
  const created = await db.task.create({
    data: {
      ...body,
      user_id: event.locals.user.user_id
    }
  })
  return json(created, {
    status: 201
  })
}
