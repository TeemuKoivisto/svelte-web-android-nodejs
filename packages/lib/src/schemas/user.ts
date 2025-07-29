import z from 'zod'

import { UserSchema } from './prisma'
import { zAnyDateTime } from './utils'

const USER_SETTINGS = z.object({})

export type StoreUser = z.infer<typeof STORE_USER>
export const STORE_USER = UserSchema.omit({
  created_at: true,
  updated_at: true,
  settings: true
}).extend({
  created_at: zAnyDateTime,
  updated_at: zAnyDateTime,
  settings: USER_SETTINGS
})
