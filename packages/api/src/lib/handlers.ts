import { z } from 'zod'
import { error, type RequestEvent } from '@sveltejs/kit'
import { routes } from '@org/lib/schemas'

type InferBody<K extends keyof typeof routes> = (typeof routes)[K] extends { body: z.ZodTypeAny }
  ? z.infer<(typeof routes)[K]['body']>
  : undefined

type InferQuery<K extends keyof typeof routes> = (typeof routes)[K] extends { query: z.ZodTypeAny }
  ? z.infer<(typeof routes)[K]['query']>
  : undefined

export const handle =
  (event: RequestEvent) =>
  async <K extends keyof typeof routes>(
    key: K
  ): Promise<{ body: InferBody<K>; query: InferQuery<K> }> => {
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

    return { body, query }
  }
