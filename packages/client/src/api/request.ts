import z from 'zod'

import { routes } from '@org/lib/schemas'
import { DEFAULT_HEADERS } from './methods'
import { API_URL } from '$config'
import { wrappedFetch, type Result } from '@org/lib'

export const authApi = {
  authGithub: (body: ApiOptions<'POST /oauth/github/authorize'>['body']) =>
    api('POST /oauth/github/authorize', { body }),
  logout: () => api('POST /oauth/logout')
}

export const tasksApi = {
  list: () => api('GET /api/tasks'),
  create: (body: ApiOptions<'POST /api/tasks'>['body']) => api('POST /api/tasks', { body }),
  update: (id: string, body: ApiOptions<'PATCH /api/tasks/{taskId}'>['body']) =>
    api('PATCH /api/tasks/{taskId}', { taskId: id, body }),
  delete: (id: string) => api('DELETE /api/tasks/{taskId}', { taskId: id })
}

type RouteKey = keyof typeof routes

/**
 * Extracts path parameter names from a route string
 * Example: ExtractPathParams<'PATCH /api/tasks/{taskId}'> = 'taskId'
 */
type ExtractPathParams<T extends string> = T extends `${string}{${infer Param}}${infer Rest}`
  ? Param | ExtractPathParams<Rest>
  : never

/**
 * Creates a type for path parameters based on the route string
 * Example: PathParams<'PATCH /api/tasks/{taskId}'> = { taskId: string }
 */
type PathParams<T extends string> = {
  [K in ExtractPathParams<T>]: string
}

/**
 * Creates the options type with proper constraints for body, query, headers, and path parameters
 * Similar to Simplify<ToOctokitParameters<paths[Url][Method]> from @octokit/types
 */
type ApiOptions<T extends RouteKey> = {
  body?: (typeof routes)[T] extends { body: z.ZodTypeAny }
    ? z.infer<(typeof routes)[T]['body']>
    : never
  query?: (typeof routes)[T] extends { query: z.ZodTypeAny }
    ? z.infer<(typeof routes)[T]['query']>
    : never
  headers?: Record<string, string>
} & PathParams<Extract<RouteKey, T>>

type ApiResponse<T extends RouteKey> = Promise<
  Result<
    (typeof routes)[T] extends { client: z.ZodTypeAny }
      ? z.infer<(typeof routes)[T]['client']>
      : unknown
  >
>

/**
 * Generic API function that works similarly to octokit.request()
 * Takes a route string (e.g. 'GET /api/tasks') and infers types from the routes schema
 * Supports path parameter replacement like @octokit/request
 *
 * @example
 * // Get tasks
 * const response = await api('GET /api/tasks')
 *
 * // Create a task
 * const response = await api('POST /api/tasks', {
 *   body: { status: 'TODO', title: 'New task' }
 * })
 *
 * // Update a task with path parameter
 * const response = await api('PATCH /api/tasks/{taskId}', {
 *   taskId: '123',
 *   body: { title: 'Updated title' }
 * })
 *
 * // With query parameters
 * const response = await api('GET /oauth/github/callback', {
 *   query: { redirect_uri: 'http://localhost:3000', location: 'dashboard' }
 * })
 */
export async function api<T extends RouteKey>(route: T, options?: ApiOptions<T>): ApiResponse<T> {
  const routeSchema = routes[route]
  const [method, ...urlParts] = route.split(' ')
  const { body, query, headers = DEFAULT_HEADERS, ...pathParams } = options || {}
  let url = urlParts.join('')
  url = url.startsWith('/') ? url.slice(1) : url

  // Replace path parameters in the URL
  if (pathParams && Object.keys(pathParams).length > 0) {
    url = url.replace(/\{([^}]+)\}/g, (match, paramName) => {
      const value = (pathParams as Record<string, any>)[paramName]
      if (value === undefined) {
        throw new Error(`Missing required path parameter: ${paramName}`)
      }
      return String(value)
    })
  }

  if (query) {
    const parsedQuery = 'query' in routeSchema ? routeSchema.query.parse(query) : query
    const searchParams = new URLSearchParams(parsedQuery)
    url += `?${searchParams.toString()}`
  }

  const parseResponse =
    'client' in routeSchema && routeSchema.client ? routeSchema.client.parse : (v: unknown) => v

  const resp = await wrappedFetch(`${API_URL}/${url}`, {
    method,
    headers,
    ...(body && { body: JSON.stringify(body) })
  })
  return 'data' in resp && parseResponse ? { data: parseResponse(resp.data) } : resp
}
