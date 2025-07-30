import { z } from 'zod'
import { error, json, type RequestEvent } from '@sveltejs/kit'
import { routes } from '@org/lib/schemas'
import type { Result } from '@org/lib'

type InferBody<K extends keyof typeof routes> = (typeof routes)[K] extends { body: z.ZodTypeAny }
  ? z.infer<(typeof routes)[K]['body']>
  : undefined

type InferQuery<K extends keyof typeof routes> = (typeof routes)[K] extends { query: z.ZodTypeAny }
  ? z.infer<(typeof routes)[K]['query']>
  : undefined

type InferResponse<K extends keyof typeof routes> = (typeof routes)[K] extends {
  response: z.ZodTypeAny
}
  ? z.infer<(typeof routes)[K]['response']>
  : any

export const handle =
  (event: RequestEvent) =>
  async <K extends keyof typeof routes>(
    key: K
  ): Promise<{ body: InferBody<K>; query: InferQuery<K>; response: InferResponse<K> }> => {
    const handler = routes[key]

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
        .reduce<Record<string, string>>((acc, cur) => {
          acc[cur[0]] = cur[1]
          return acc
        }, {})
      const parsed = handler.query.safeParse(intoObject)
      if (parsed.error) {
        return error(400, parsed.error.issues.join('\n'))
      }
      query = parsed.data as InferQuery<K>
    }

    return { body, query, response: 'response' in handler ? handler.response : undefined } as {
      body: InferBody<K>
      query: InferQuery<K>
      response: InferResponse<K>
    }
  }

export const handler = <K extends keyof typeof routes>(
  key: K,
  fn: (
    event: RequestEvent,
    body: InferBody<K>,
    query: InferQuery<K>
  ) => Promise<Result<InferResponse<K>>>
) => {
  return async (event: RequestEvent): Promise<Response> => {
    const parsed = await handle(event)(key)
    const result = await fn(event, parsed.body, parsed.query)
    if ('err' in result) {
      return error(result.code, result.err)
    }
    return json(result.data)
  }
}
