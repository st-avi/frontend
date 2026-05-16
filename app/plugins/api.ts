import type { FetchError, FetchOptions } from 'ofetch'
import { $fetch } from 'ofetch'
import { appendResponseHeader } from 'h3'

type ApiFetch = <T>(url: string, options?: FetchOptions<'json'>) => Promise<T>

type RetryableOptions = FetchOptions<'json'> & {
  _retried?: boolean
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authUser = useState('auth-user', () => null)
  const authFetched = useState<boolean>('auth-user-fetched', () => false)

  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
  const requestEvent = import.meta.server ? useRequestEvent() : null

  let ssrCookieOverride: string | null = null
  let refreshPromise: Promise<void> | null = null

  const resetAuthCache = () => {
    authUser.value = null
    authFetched.value = false
  }

  const withSSRHeaders = (options: FetchOptions<'json'>): FetchOptions<'json'> => {
    if (!import.meta.server) return options

    const headers = new Headers(options.headers as HeadersInit | undefined)
    const cookieToUse = ssrCookieOverride ?? requestHeaders.cookie
    if (cookieToUse && !headers.has('cookie')) {
      headers.set('cookie', cookieToUse)
    }
    return {
      ...options,
      headers,
    }
  }

  const refresh = async (): Promise<void> => {
    if (!refreshPromise) {
      refreshPromise = $fetch
        .raw(
          '/refresh',
          withSSRHeaders({
            baseURL: config.public.apiBase,
            method: 'POST',
            credentials: 'include',
          }),
        )
        .then((response) => {
          if (import.meta.server && requestEvent) {
            const newCookies = response.headers.getSetCookie()
            if (newCookies.length > 0) {
              ssrCookieOverride = newCookies.map((c) => c.split(';')[0]).join('; ')
            }
            for (const cookie of newCookies) {
              appendResponseHeader(requestEvent, 'set-cookie', cookie)
            }
          }
        })
        .catch((err) => {
          resetAuthCache()
          throw err
        })
        .finally(() => {
          refreshPromise = null
        })
    }
    return refreshPromise
  }

  const api: ApiFetch = async <T>(url: string, options: FetchOptions<'json'> = {}): Promise<T> => {
    const { _retried, ...cleanOptions } = options as RetryableOptions
    const mergedOptions: FetchOptions<'json'> = withSSRHeaders({
      baseURL: config.public.apiBase,
      credentials: 'include',
      ...cleanOptions,
    })

    try {
      return await $fetch<T>(url, mergedOptions)
    } catch (error) {
      const err = error as FetchError
      const status = err.statusCode ?? err.response?.status

      if (status === 401 && !_retried) {
        await refresh()
        return await api<T>(url, {
          ...cleanOptions,
          _retried: true,
        } as RetryableOptions)
      }
      throw error
    }
  }

  return {
    provide: {
      api,
    },
  }
})
