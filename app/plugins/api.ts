import type { FetchError, FetchOptions } from 'ofetch'
import { $fetch } from 'ofetch'

type ApiFetch = <T>(url: string, options?: FetchOptions<'json'>) => Promise<T>

type RetryableOptions = FetchOptions<'json'> & {
  _retried?: boolean
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const authUser = useState('auth-user', () => null)
  const authFetched = useState<boolean>('auth-user-fetched', () => false)
  const requestHeaders = import.meta.server ? useRequestHeaders(['cookie']) : {}
  let refreshPromise: Promise<void> | null = null

  const resetAuthCache = () => {
    authUser.value = null
    authFetched.value = false
  }

  const withSSRHeaders = (options: FetchOptions<'json'>): FetchOptions<'json'> => {
    if (!import.meta.server) return options

    const headers = new Headers(options.headers as HeadersInit | undefined)
    if (requestHeaders.cookie && !headers.has('cookie')) {
      headers.set('cookie', requestHeaders.cookie)
    }
    return {
      ...options,
      headers,
    }
  }

  const refresh = async (): Promise<void> => {
    if (!refreshPromise) {
      refreshPromise = $fetch(
        '/refresh',
        withSSRHeaders({
          baseURL: config.public.apiBase,
          method: 'POST',
          credentials: 'include',
        }),
      )
        .then(() => {})
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
    const isRefreshEndpoint = url === '/refresh'
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

      if (isRefreshEndpoint) {
        resetAuthCache()
        throw error
      }
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
