import z from 'zod'

import * as schemas from '@/lib/schemas'
import { get, patch, post, del } from './methods'

export const authApi = {
  authGithub: (body: { code: string }) =>
    post('oauth/github/authorize', body, schemas.AUTH_RESP.parse),
  authGoogle: (body: { code: string }) =>
    post('oauth/google/authorize', body, schemas.AUTH_RESP.parse)
}
