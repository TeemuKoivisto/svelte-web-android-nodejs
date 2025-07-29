import { base64url, jwtVerify, SignJWT, type JWTPayload } from 'jose'
import { env } from '$env/dynamic/private'
import type { User } from '@org/lib/schemas'

const ISSUER = 'svelte-web-android-nodejs.pages.dev'
const AUDIENCE = 'svelte-web-android-nodejs.pages.dev:oauth'
const EXPIRY = 60 * 60 * 24 * 30 // 30 days
const SECRET = base64url.decode(env.JWT_SECRET as string)

export type JwtPayload = {
  user_id: string
  email: string
  superUser: boolean
} & JWTPayload

export async function signJwt(user: User) {
  const timeNow = Math.floor(Date.now() / 1000)
  const payload: JwtPayload = {
    user_id: user.id,
    email: user.email,
    superUser: false
  }
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS512' })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(timeNow + EXPIRY)
    .setIssuedAt(timeNow)
    .sign(SECRET)
  return {
    jwt,
    exp: timeNow + EXPIRY
  }
}

export async function verifyJwt(jwt: string) {
  const decoded = await jwtVerify(jwt, SECRET, {
    audience: [AUDIENCE]
  })
  return decoded.payload as JwtPayload
}
