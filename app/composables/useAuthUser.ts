import type { AuthUser } from '~~/types/api/auth'
import type { ApiResp } from '~~/types/api/common'

export async function useAuthUser(): Promise<AuthUser | null> {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const fetched = useState<boolean>('auth-user-fetched', () => false)
  const { $api } = useNuxtApp()

  if (fetched.value) return user.value

  try {
    const resp = await $api<ApiResp<AuthUser>>('/auth/me', {
      method: 'GET',
    })
    user.value = resp.code === 0 && resp.message === 'OK' ? resp.data : null
  } catch {
    user.value = null
  } finally {
    fetched.value = true
  }
  return user.value
}
