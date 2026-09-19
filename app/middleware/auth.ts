import type { AuthUser } from '~~/types/api/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  if (!user.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } }, { replace: true })
})
