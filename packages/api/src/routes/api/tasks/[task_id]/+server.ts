import { error, json } from '@sveltejs/kit'

import { db } from '$lib/db'
import { handle } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = async event => {
  const { body } = await handle(event)('PATCH /api/tasks/:taskId')
  const updated = await db.task.update({
    where: { id: event.params.task_id },
    data: {
      ...body
    }
  })
  return new Response(null, {
    status: 204
  })
}

export const DELETE: RequestHandler = async event => {
  await db.task.delete({
    where: { id: event.params.task_id }
  })
  return new Response(null, {
    status: 204
  })
}
