<script setup lang="ts">
import type { ApiResp } from '~~/types/api/common'
import type { AdminUser, AdminUsers } from '~~/types/api/admin'

definePageMeta({
  middleware: ['admin'],
})

const { $api } = useNuxtApp()

const {
  data: users,
  status,
  error,
} = await useAsyncData<AdminUser[]>('admin-users', async () => {
  const resp = await $api<ApiResp<AdminUsers>>('/admin/users')
  return resp.data.users
})

const table = useTemplateRef('table')
</script>

<template>
  <div class="mx-auto my-4 w-full max-w-7xl flex-1 px-4 sm:px-6 lg:px-8">
    <div class="mb-4 text-2xl font-semibold">使用者管理</div>

    <div v-if="status === 'pending'" class="mt-4 text-gray-500">載入中…</div>
    <div v-else-if="error" class="mt-4 text-red-500">{{ error.message }}</div>
    <div v-else>
      <UInput
        :model-value="table?.tableApi?.getColumn('email')?.getFilterValue() as string"
        placeholder="Filter emails..."
        class="mb-4"
        @update:model-value="table?.tableApi?.getColumn('email')?.setFilterValue($event)"
      />

      <UTable ref="table" sticky :data="users" class="max-h-150 flex-1 rounded-lg border" />
    </div>
  </div>
</template>
