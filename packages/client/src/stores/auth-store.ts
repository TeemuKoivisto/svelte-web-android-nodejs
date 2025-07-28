import { goto } from '$app/navigation'
import { derived, get, writable } from 'svelte/store'

import { persist, reset } from './persist'
import { authApi } from '$api/request'
import type { User } from '@/lib/schemas'

type ClientUser = Omit<User, 'password'>

export const currentUser = persist(writable<ClientUser | null>(null), {
  key: 'current-user'
})
export const tokenExpires = persist(writable<number | null>(null), {
  key: 'token-expiry'
})
export const isLoggedIn = derived(currentUser, c => c !== null)

tokenExpires.subscribe(exp => {
  if (exp !== null) {
    setTimeout(() => {
      if (Date.now() > exp) {
        authActions.logout()
      }
    }, exp - Date.now())
  }
})

export const authActions = {
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
      currentUser.set(resp.data.user)
      tokenExpires.set(resp.data.expires)
    }
    return resp
  },
  logout() {
    reset()
    goto('/')
  }
}
