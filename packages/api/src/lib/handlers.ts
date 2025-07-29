import { z } from 'zod'
import { error, type RequestEvent } from '@sveltejs/kit'
import { UserSchema } from '@org/lib/schemas'

type Handler = {
  body?: z.ZodTypeAny
  query?: z.ZodTypeAny
  response?: z.ZodTypeAny
}

export const api = {
  'POST /oauth/github/authorize': {
    body: z.object({
      code: z.string()
    }),
    response: z.object({
      user: UserSchema,
      expires: z.number().int()
    })
  },
  'GET /oauth/github/callback': {
    query: z.object({
      redirect_uri: z.string().url(),
      location: z.string()
    })
  }
} satisfies Record<string, Handler>

type InferBody<K extends keyof typeof api> = (typeof api)[K] extends { body: z.ZodTypeAny }
  ? z.infer<(typeof api)[K]['body']>
  : undefined

type InferQuery<K extends keyof typeof api> = (typeof api)[K] extends { query: z.ZodTypeAny }
  ? z.infer<(typeof api)[K]['query']>
  : undefined

export const handle =
  (event: RequestEvent) =>
  async <K extends keyof typeof api>(
    key: K
  ): Promise<{ body: InferBody<K>; query: InferQuery<K> }> => {
    const handler = api[key]

    let body: InferBody<K> = undefined

    // Handle body if it exists
    if ('body' in handler) {
      const jsonBody = await event.request.json()
      const parsed = handler.body.safeParse(jsonBody)
      if (parsed.error) {
        return error(400, parsed.error.issues.join('\n'))
      }
      body = parsed.data as InferBody<K>
    }

    let query: InferQuery<K> = undefined

    // Handle query if it exists
    if ('query' in handler) {
      const intoObject = event.url.searchParams
        .entries()
        .reduce<Record<string, any>>((acc, cur) => {
          acc[cur[0]] = cur[1]
          return acc
        }, {})
      const parsed = handler.query.safeParse(intoObject)
      if (parsed.error) {
        return error(400, parsed.error.issues.join('\n'))
      }
      query = parsed.data as InferQuery<K>
    }

    return { body, query }
  }
