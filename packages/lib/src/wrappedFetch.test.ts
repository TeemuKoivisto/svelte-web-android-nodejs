import { wrappedFetch } from './wrappedFetch'

describe('wrappedFetch', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns JSON data when content-type is application/json', async () => {
    const jsonBody = { ok: true, value: 123 }
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(jsonBody), {
            status: 200,
            headers: { 'content-type': 'application/json' }
          })
      )
    )
    const result = await wrappedFetch<typeof jsonBody>('https://api.test/json')
    expect(result).toEqual({ data: jsonBody })
  })

  it('returns text when content-type is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('hello world', {
            status: 200,
            headers: { 'content-type': 'text/plain' }
          })
      )
    )
    const result = await wrappedFetch<string>('https://api.test/text')
    expect(result).toEqual({ data: 'hello world' })
  })

  it('returns ArrayBuffer for binary content-types', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4])
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(bytes, {
            status: 200,
            headers: { 'content-type': 'application/octet-stream' }
          })
      )
    )
    const result = await wrappedFetch<ArrayBuffer>('https://api.test/bin')
    expect('data' in result).toBe(true)
    if ('data' in result) {
      const arr = new Uint8Array(result.data)
      expect(Array.from(arr)).toEqual([1, 2, 3, 4])
    }
  })

  it('returns Err with string body for 4xx response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('Not found', {
            status: 404,
            headers: { 'content-type': 'text/plain' }
          })
      )
    )
    const result = await wrappedFetch('https://api.test/404')
    expect(result).toEqual({ err: 'Not found', code: 404 })
  })

  it('extracts nested error.message from JSON error bodies', async () => {
    const body = { error: { message: 'Bad request: invalid input' } }
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify(body), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          })
      )
    )
    const result = await wrappedFetch('https://api.test/400')
    expect(result).toEqual({ err: 'Bad request: invalid input', code: 400 })
  })

  it('handles thrown TypeError from fetch as 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch: connection error')
      })
    )
    const result = await wrappedFetch<any>('https://api.test/error')
    if ('err' in result) {
      expect(result).toMatchObject({
        err: 'TypeError: Failed to fetch: connection error',
        code: 500
      })
      expect(result).toHaveProperty('stack')
      expect(result.stack?.startsWith('TypeError: Failed to fetch: connection error')).toBe(true)
    } else {
      throw new Error('Expected an error result for thrown TypeError')
    }
  })

  it('handles DOMException (AbortError) as 540 with specific message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new DOMException('The operation was aborted.', 'AbortError')
      })
    )
    const result = await wrappedFetch('https://api.test/aborted')
    expect(result).toMatchObject({ err: 'Fetch request aborted', code: 540 })
  })

  it('applies custom errHandler transformation when provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response('nope', {
            status: 418,
            headers: { 'content-type': 'text/plain' }
          })
      )
    )
    const transformed = await wrappedFetch('https://api.test/teapot', undefined, err => ({
      ...err,
      err: 'Custom: ' + err.err,
      code: 999
    }))

    expect(transformed).toEqual({ err: 'Custom: nope', code: 999 })
  })
})
