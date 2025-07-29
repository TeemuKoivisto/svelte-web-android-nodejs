import z from 'zod'

import { TaskSchema, TaskStatusSchema } from './prisma'
import { zAnyDateTime } from './utils'

export type StoreTask = z.infer<typeof STORE_TASK>
export const STORE_TASK = TaskSchema.omit({
  created_at: true,
  updated_at: true,
  archived_at: true,
  trashed_at: true
}).extend({
  created_at: zAnyDateTime,
  updated_at: zAnyDateTime,
  archived_at: z.union([z.null(), zAnyDateTime]),
  trashed_at: z.union([z.null(), zAnyDateTime])
})

export const TASK_CREATE = z.object({
  status: TaskStatusSchema,
  title: z.string()
})
export const TASK_UPDATE = TASK_CREATE.partial()
