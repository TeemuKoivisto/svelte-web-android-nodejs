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
  list: () => get('api/tasks', z.array(schemas.STORE_TASK).parse)
}
