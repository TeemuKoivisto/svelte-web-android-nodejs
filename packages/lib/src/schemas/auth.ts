import z from 'zod'
import { UserSchema } from './prisma'

export const AUTH_RESP = z.object({
  user: UserSchema,
  expires: z.number().int()
})

export const GOOGLE_OAUTH_RESP = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  id_token: z.string(),
  expires_in: z.number().int().optional()
})

/**
 * @example
{
  sub: '903610001273234138199',
  name: 'Teemu K',
  given_name: 'Teemu',
  family_name: 'K',
  picture: 'https://lh3.googleusercontent.com/a/ACg8ocIAbxcvfsdfMy3-_yzr--hERk7WPpzFm3D7EDH1M04TNfOg=s96-c',
  email: 'user@example.com',
  email_verified: true,
  local: 'en-GB'
}
 */
export type GoogleProfile = z.infer<typeof GOOGLE_PROFILE>
export const GOOGLE_PROFILE = z.object({
  sub: z.string(),
  name: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  picture: z.string(),
  email: z.string().email(),
  email_verified: z.boolean(),
  locale: z.string().optional()
})
