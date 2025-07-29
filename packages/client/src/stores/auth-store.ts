import { goto } from '$app/navigation'
import { derived, get, writable } from 'svelte/store'

import { persist, reset } from './persist'
import { authApi } from '$api/request'
import { type StoreUser, STORE_USER } from '@org/lib/schemas'

export const currentUser = persist(writable<StoreUser | null>(null), {
  key: 'current-user',
  serialize: v => JSON.stringify(v),
  deserialize: v => STORE_USER.nullable().parse(JSON.parse(v))
})
export const tokenExpires = persist(writable<number | null>(null), {
  key: 'token-expiry'
})
export const isLoggedIn = derived(currentUser, c => c !== null)

tokenExpires.subscribe(exp => {
  if (exp !== null) {
    setTimeout(() => {
      if (Date.now() > exp) {
        authStore.logout()
      }
    }, exp - Date.now())
  }
})

type AuthStore = {
  githubCallback(): Promise<ReturnType<typeof authApi.authGithub>>
  logout: typeof authApi.logout
}

export const authStore: AuthStore = {
  async githubCallback(): Promise<ReturnType<typeof authApi.authGithub>> {
    const url = new URL(location.href)
    const code = url.searchParams.get('code')
    const redirect = url.searchParams.get('redirect')
    goto(redirect || '/')
    if (!code || !redirect) {
      return { err: `No code or redirect found ${redirect} ${code}`, code: 400 }
    }
    const resp = await authApi.authGithub({ code })
    if ('data' in resp) {
      currentUser.set(STORE_USER.parse(resp.data.user))
      tokenExpires.set(resp.data.expiryInSeconds)
    }
    return resp
  },
  async logout() {
    reset()
    goto('/')
    const res = await authApi.logout()
    if ('err' in res) {
      console.error(res)
    }
    return res
  }
}
