import { z } from 'zod'
import { TaskSchema, TaskStatusSchema, UserSchema } from './prisma'
import { STORE_TASK } from './task'
import { STORE_USER } from './user'

type Handler = {
  body?: z.ZodTypeAny
  query?: z.ZodTypeAny
  response?: z.ZodTypeAny
  client?: z.ZodTypeAny
}

export const oauth = {
  'POST /oauth/github/authorize': {
    body: z.object({
      code: z.string()
    }),
    response: z.object({
      user: UserSchema,
      expiryInSeconds: z.number().int()
    }),
    client: z.object({
      user: STORE_USER,
      expiryInSeconds: z.number().int()
    })
  },
  'GET /oauth/github/callback': {
    query: z.object({
      redirect_uri: z.string().url(),
      location: z.string()
    })
  }
}

export const tasks = {
  'GET /api/tasks': {
    response: z.array(TaskSchema),
    client: z.array(STORE_TASK)
  },
  'POST /api/tasks': {
    body: z.object({
      status: TaskStatusSchema,
      title: z.string()
    }),
    response: TaskSchema,
    client: STORE_TASK
  },
  'PATCH /api/tasks/{taskId}': {
    body: z
      .object({
        status: TaskStatusSchema,
        title: z.string()
      })
      .partial(),
    response: z.null(),
    client: z.null()
  },
  'DELETE /api/tasks/{taskId}': {
    response: z.null(),
    client: z.null()
  }
}

export const routes = {
  ...oauth,
  ...tasks
} satisfies Record<string, Handler>
