import { error, json } from '@sveltejs/kit'

import { db } from '$lib/db'
import { handler } from '$lib/handlers'

import type { RequestHandler } from './$types'

export const PATCH: RequestHandler = handler('PATCH /api/tasks/{taskId}', async (event, body) => {
  const updated = await db.task.update({
    where: { id: event.params.task_id },
    data: {
      ...body
    }
  })
  return { data: null }
})

export const DELETE: RequestHandler = handler('DELETE /api/tasks/{taskId}', async event => {
  await db.task.delete({
    where: { id: event.params.task_id }
  })
  return { data: null }
})
