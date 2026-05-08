import type { AuthUser } from '~~/types/api/auth'

export default defineNuxtPlugin(async () => {
  if (import.meta.client) return

  const aToken = useCookie('aToken')
  if (!aToken.value) return

  const user = useState<AuthUser | null>('auth-user', () => null)
  const fetched = useState<boolean>('auth-user-fetched', () => false)
  if (!user.value) fetched.value = false

  await useAuthUser()
})
