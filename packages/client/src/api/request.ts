import z from 'zod'

import * as schemas from '@org/lib/schemas'
import { get, patch, post, del } from './methods'

export const authApi = {
  authGithub: (body: { code: string }) =>
    post('oauth/github/authorize', body, schemas.AUTH_RESP.parse),
  authGoogle: (body: { code: string }) =>
    post('oauth/google/authorize', body, schemas.AUTH_RESP.parse),
  logout: () => post('oauth/logout', undefined)
}

export const tasksApi = {
  list: () => get('api/tasks', z.array(schemas.STORE_TASK).parse),
  create: (body: z.infer<typeof schemas.TASK_CREATE>) =>
    post('api/tasks', body, schemas.STORE_TASK.parse),
  update: (id: string, body: z.infer<typeof schemas.TASK_UPDATE>) =>
    patch<null>(`api/tasks/${id}`, body),
  delete: (id: string) => del<null>(`api/tasks/${id}`)
}
