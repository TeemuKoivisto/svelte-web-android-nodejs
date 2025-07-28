import type { Err, Result } from './utils'

export type JSONValue =
  | string
  | number
  | boolean
  | { [x: string | number]: JSONValue }
  | Array<JSONValue>

/**
 * Finds the string value from "error" or "message" key from an unknown JSON response
 *
 * This is useful when calling external APIs since we can never be certain how the error messages
 * are nested (eg Cloudinary with { error: { message: <string> } } ).
 * @returns
 */
function findErrorMessage(data: JSONValue): string | undefined {
  if (Array.isArray(data)) {
    let found: string | undefined
    data.forEach(val => {
      if (!found) {
        found = findErrorMessage(val)
      }
    })
    return found
  } else if (typeof data === 'object') {
    for (const key in data) {
      const val = data[key]
      const wasErrorMsg = key === 'error' || key === 'message'
      if (wasErrorMsg && typeof val === 'string') {
        return val
      } else if (wasErrorMsg) {
        return findErrorMessage(val)
      }
    }
  }
  return undefined
}

/**
 * Wraps fetch into Result type and auto-parses based on its content-type
 *
 * @param uri URI
 * @param options fetch options
 * @param defaultError Returned error message to show above eg form fields or in snack bar
 * @returns
 */
export async function wrappedFetch<T>(
  uri: string,
  options?: RequestInit,
  errHandler?: (err: Err) => Err | undefined
): Promise<Result<T>> {
  let resp: Response
  try {
    resp = await fetch(uri, options)
  } catch (error: any) {
    const obj: Err = {
      err: ((error.toString() as string).split('\n')[0] || '').trim(),
      code: 500
    }
    if (error instanceof DOMException) {
      obj.err = 'Fetch request aborted'
      obj.code = 540
    } else if (error instanceof TypeError) {
      // Most common error type, could be a Connection Error thrown by client when the server has
      // already been closed. Most of the time fetch does not implode but when it does, like here,
      // it's some unrecoverable error
    } else if (obj.err === '[object Object]') {
      console.error('wrappedFetch: unknown error', error)
      obj.err = 'Request failed'
    } else {
      console.warn('Unknown error within wrappedFetch:', error)
    }
    if ('cause' in error) obj.cause = error.cause.toString()
    if ('stack' in error) obj.stack = error.stack.toString()
    return errHandler?.(obj) || obj
  }
  let data
  const contentType = resp.headers.get('content-type')
  if (contentType?.startsWith('application/json')) {
    data = await resp.json()
  } else if (
    contentType?.startsWith('application/octet-stream') ||
    contentType?.startsWith('image/') ||
    contentType?.startsWith('video/') ||
    contentType?.startsWith('audio/')
  ) {
    data = await resp.arrayBuffer()
  } else {
    data = (await resp.text()) || resp.statusText
  }
  // By default fetch only treats codes between 200-299 as "ok", showing eg a redirect 308 as an error
  if (resp.status >= 400) {
    const obj = {
      err:
        typeof data === 'string'
          ? data
          : findErrorMessage(data) || `Fetch failed with code ${resp.status}`,
      code: resp.status
    }
    return errHandler?.(obj) || obj
  }
  return { data }
}
