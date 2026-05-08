import type { AuthUser } from '~~/types/api/auth'

export default defineNuxtRouteMiddleware(async () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  if (!user.value) return navigateTo('/login', { replace: true })
  if (user.value.role !== 'admin') return navigateTo('/', { replace: true })
})
