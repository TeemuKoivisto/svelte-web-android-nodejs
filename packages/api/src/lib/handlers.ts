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

// export const parseQuery = <T extends z.ZodTypeAny>(searchParams: URLSearchParams, schema: T) => {
//   const intoObject = searchParams.entries().reduce<Record<string, string>>((acc, cur) => {
//     acc[cur[0]] = cur[1]
//     return acc
//   }, {})
//   return schema.safeParse(intoObject) as z.SafeParseReturnType<z.infer<T>, z.infer<T>>
// }

type ParsedBody<K extends keyof typeof routes> =
  | z.SafeParseReturnType<any, InferBody<K>>
  | undefined
type ParsedQuery<K extends keyof typeof routes> =
  | z.SafeParseReturnType<any, InferQuery<K>>
  | undefined

const searchIntoObject = (params: URLSearchParams) =>
  params.entries().reduce<Record<string, string>>((acc, cur) => {
    acc[cur[0]] = cur[1]
    return acc
  }, {})

export const handle =
  (event: RequestEvent) =>
  async <K extends keyof typeof routes>(
    key: K
  ): Promise<[ParsedBody<K>, z.SafeParseReturnType<any, InferQuery<K>> | undefined]> => {
    const handler = routes[key]
    return [
      'body' in handler
        ? (handler.body.safeParse(await event.request.json()) as ParsedBody<K>)
        : undefined,
      'query' in handler
        ? (handler.query.safeParse(searchIntoObject(event.url.searchParams)) as ParsedQuery<K>)
        : undefined
    ]
  }

export const handler =
  <K extends keyof typeof routes>(
    key: K,
    fn: (
      event: RequestEvent,
      body: InferBody<K>,
      query: InferQuery<K>
    ) => Promise<Result<InferResponse<K>>>
  ) =>
  async (event: RequestEvent): Promise<Response> => {
    const [body, query] = await handle(event)(key)
    if (body?.error || query?.error) {
      // @TODO show generic errors in prod?
      return json(body?.error || query?.error, {
        status: 400
      })
    }
    const result = await fn(event, body?.data, query?.data)
    if ('err' in result) {
      return error(result.code, result.err)
    }
    return json(result.data)
  }
