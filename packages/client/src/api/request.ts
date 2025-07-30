import z from 'zod'

import { routes } from '@org/lib/schemas'
import { get, patch, post, del } from './methods'

export const authApi = {
  authGithub: (body: { code: string }) =>
    post('oauth/github/authorize', body, routes['POST /oauth/github/authorize'].client.parse),
  authGoogle: (body: { code: string }) =>
    post('oauth/google/authorize', body, routes['POST /oauth/github/authorize'].client.parse),
  logout: () => post('oauth/logout', undefined)
}

export const tasksApi = {
  list: () => get('api/tasks', routes['GET /api/tasks'].client.parse),
  create: (body: z.infer<(typeof routes)['POST /api/tasks']['body']>) =>
    post('api/tasks', body, routes['POST /api/tasks'].client.parse),
  update: (id: string, body: z.infer<(typeof routes)['PATCH /api/tasks/:taskId']['body']>) =>
    patch<null>(`api/tasks/${id}`, body),
  delete: (id: string) => del<null>(`api/tasks/${id}`)
}
