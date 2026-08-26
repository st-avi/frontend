<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AuthUser } from '~~/types/api/auth'

const toast = useToast()
const { $api } = useNuxtApp()

const user = useState<AuthUser | null>('auth-user', () => null)
const authFetched = useState<boolean>('auth-user-fetched', () => false)

const handleLogout = async () => {
  try {
    await $api('/logout', { method: 'POST' })
    toast.add({
      title: '登出成功',
      color: 'success',
    })
  } catch {
    toast.add({
      title: '登出時發生錯誤',
      description: '已在本機清除登入狀態',
      color: 'warning',
    })
  }

  user.value = null
  authFetched.value = false
  await navigateTo('/', { replace: true })
}

const items = computed<DropdownMenuItem[][]>(() => {
  const groups: DropdownMenuItem[][] = [
    [{ label: user.value?.username ?? '', type: 'label', ui: { itemLabel: 'truncate' } }],
  ]

  if (user.value?.role === 'admin') {
    groups.push([{ label: '使用者管理', icon: 'i-lucide-users', to: '/admin/users' }])
  }

  groups.push([{ label: '登出', icon: 'i-lucide-log-out', color: 'error', onSelect: handleLogout }])

  return groups
})
</script>

<template>
  <UDropdownMenu
    v-if="user"
    class="cursor-pointer"
    :items="items"
    :content="{ align: 'end' }"
    :ui="{ content: 'w-56' }"
  >
    <UButton class="cursor-pointer" color="neutral" variant="ghost" size="xl" square aria-label="使用者選單">
      <UAvatar icon="i-lucide-user" size="sm" />
    </UButton>
  </UDropdownMenu>
</template>
