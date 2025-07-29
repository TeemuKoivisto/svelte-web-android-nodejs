import { get, type Writable } from 'svelte/store'
import type { Result } from '@org/lib'

interface Options<T, P> {
  /** Key by which the data is persisted */
  key: string
  /** local or sessionStorage */
  storage?: 'local' | 'session'
  /** For more granular erasure of data than localStorage.clear(). If unspecified, 'default' is used */
  namespace?: string
  /** To print errors and warnings */
  debug?: boolean
  /** Function, eg zod `safeParse`, to parse the hydrated data with */
  parse?(val: any): { success: true; data: T } | { success: false; error: any }
  serialize?: (val: T) => P
  deserialize?: (val: P) => T
}

interface Registered {
  key: string
  storage: 'local' | 'session'
  defaultValue: any
  value: Writable<any>
  unsubscribe: () => void
}

const registered = new Map<string, Registered[]>()

function hydrate(key: string, storage: 'local' | 'session'): Result<any> {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage
    return { data: JSON.parse(store.getItem(key) || '') }
  } catch (err) {
    return { err: `Failed to retrieve value from storage: ${err}`, code: 400 }
  }
}

function cache(val: any, key: string, storage: 'local' | 'session'): Result<undefined> {
  try {
    const store = storage === 'local' ? window.localStorage : window.sessionStorage
    store.setItem(key, JSON.stringify(val))
    return { data: undefined }
  } catch (err) {
    return { err: `Failed to store the value: ${err}`, code: 400 }
  }
}

export function deserialize<T, P>(
  json: any,
  defaultValue: T,
  opts: Pick<Options<T, P>, 'deserialize' | 'parse'>
): any {
  try {
    if (opts.deserialize) {
      return opts.deserialize(json)
    }
    if (defaultValue instanceof Map) {
      return new Map(json.map(([key, val]: any) => [key, opts.parse ? opts.parse(val) : val]))
    } else if (opts.parse) {
      return opts.parse(json)
    } else {
      return json
    }
  } catch (err) {
    console.error(err)
    return defaultValue
  }
}

export function serialize<T, P>(data: any, opts: Pick<Options<T, P>, 'serialize'>): any {
  try {
    if (opts.serialize) {
      return opts.serialize(data)
    } else if (data instanceof Map) {
      return Array.from(data.entries()).map(([key, val]) => [key, val])
    } else {
      return data
    }
  } catch (err) {
    console.error(err)
    return ''
  }
}

// https://github.com/joshnuss/svelte-local-storage-store
export function persist<T, P = any>(w: Writable<T>, opts: Options<T, P>) {
  const { key, storage = 'local', namespace = 'default' } = opts
  const defaultValue = get(w)
  const hydrated = hydrate(key, storage)
  if ('data' in hydrated) {
    w.set(deserialize(hydrated.data, defaultValue, opts))
  } else if ('err' in hydrated && opts?.debug) {
    console.info(hydrated.err)
  }
  const unsubscribe = w.subscribe(val => {
    const cached = cache(serialize(val, opts), key, storage)
    if ('err' in cached && opts?.debug) {
      console.error(cached.err)
    }
  })
  const ns = registered.get(namespace)
  if (ns) {
    ns.push({ key, storage, value: w, defaultValue, unsubscribe })
  } else {
    registered.set(namespace, [{ key, storage, value: w, defaultValue, unsubscribe }])
  }
  return w
}

type PersistMapOptions<T, P = any> = Options<T, P> & {
  merge?: (values: ({ id: string } & Partial<T>)[]) => void
}

export function persistedMap<T, P = any>(
  w: Writable<Map<string, T>>,
  opts: PersistMapOptions<T, P>
) {
  persist(w as Writable<T>, opts)
  return {
    ...w,
    remove(ids: string | string[]) {
      w.update(map => {
        if (typeof ids === 'string') {
          map.delete(ids)
        } else {
          ids.forEach(id => map.delete(id))
        }
        return map
      })
    },
    merge:
      opts.merge ??
      function (values) {
        w.update(map => {
          values.forEach(item => {
            const found = map.get(item.id)
            const merged = found ? { ...found, ...item } : item
            const parsed = opts.parse?.(merged)
            if ((found && !parsed) || parsed?.success) {
              map.set(item.id, parsed?.success ? (parsed.data as any) : merged)
            } else if (parsed?.error) {
              console.error('zod schema parse failed within merge:', parsed.error)
            } else if (!found) {
              console.warn('Failed to merge value with no previous value in map', item)
            }
          })
          return map
        })
      }
  }
}

interface ResetOptions {
  unsubscribe?: boolean
  cb?: (val: Registered) => void
}

export function reset(namespaces: string[] = ['default'], opts?: ResetOptions) {
  namespaces.forEach(ns => {
    registered.get(ns)?.forEach(persisted => {
      if (opts?.cb) {
        opts?.cb(persisted)
      } else {
        try {
          if (opts?.unsubscribe) {
            persisted.unsubscribe()
          }
          persisted.value.set(persisted.defaultValue)
          const store = persisted.storage === 'local' ? window.localStorage : window.sessionStorage
          store.removeItem(persisted.key)
        } catch (err) {}
      }
    })
  })
}
