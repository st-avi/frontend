import type { AuthUser } from '~~/types/api/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useState<AuthUser | null>('auth-user', () => null)
  if (!user.value) return navigateTo({ path: '/login', query: { redirect: to.fullPath } }, { replace: true })
  if (user.value.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: '權限不足，無法訪問此頁面', fatal: true })
  }
})
