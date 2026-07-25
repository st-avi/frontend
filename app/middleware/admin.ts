import type { AuthUser } from '~~/types/api/auth'

export default defineNuxtRouteMiddleware(async () => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  if (!user.value) return navigateTo('/login', { replace: true })
  if (user.value.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: '權限不足，無法訪問此頁面', fatal: true })
  }
})
