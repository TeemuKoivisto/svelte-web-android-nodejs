import z from 'zod'

import { routes } from '@org/lib/schemas'
import { get, patch, post, del } from './methods'
import { API_URL } from '$config'
import type { Result } from '@org/lib'

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
}

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
  update: (id: string, body: z.infer<(typeof routes)['PATCH /api/tasks/{taskId}']['body']>) =>
    patch<null>(`api/tasks/${id}`, body),
  delete: (id: string) => del<null>(`api/tasks/${id}`)
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
 * Example: PathParams<'PATCH /api/tasks/{taskId}'> = { taskId: string | number }
 */
type PathParams<T extends string> = {
  [K in ExtractPathParams<T>]: string | number
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
export function api<T extends RouteKey>(route: T, options?: ApiOptions<T>): ApiResponse<T> {
  const [method, ...urlParts] = route.split(' ')
  let url = urlParts.join('')
  const { body, query, headers = DEFAULT_HEADERS, ...pathParams } = options || {}

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

  // Get the route schema for parsing
  const routeSchema = routes[route]

  // Construct the full URL with query parameters
  let fullUrl = url.slice(1)
  if (query) {
    // Parse and validate query parameters using the route's query schema
    const parsedQuery =
      'query' in routeSchema && routeSchema.query ? routeSchema.query.parse(query) : query

    const searchParams = new URLSearchParams(parsedQuery)
    fullUrl += `?${searchParams.toString()}`
  }
  const parseResponse =
    'client' in routeSchema && routeSchema.client ? routeSchema.client.parse : (v: unknown) => v

  switch (method) {
    case 'GET':
      return get(fullUrl, parseResponse, headers)
    case 'POST':
      return post(fullUrl, body, parseResponse, headers)
    case 'PATCH':
      return patch(fullUrl, body, parseResponse, headers)
    case 'DELETE':
      return del(fullUrl, parseResponse, headers)
    default:
      throw new Error(`Unsupported HTTP method: ${method}`)
  }
}
