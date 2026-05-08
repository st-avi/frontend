import type { FetchOptions } from 'ofetch'

type ApiFetch = <T>(url: string, options?: FetchOptions<'json'>) => Promise<T>

declare module '#app' {
  interface NuxtApp {
    $api: ApiFetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: ApiFetch
  }
}

export {}
