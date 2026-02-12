<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'minimal',
})

const schema = z.object({
  email: z.string().email('請輸入有效的信箱'),
  password: z.string().min(1, '請輸入密碼').min(8, '密碼至少需要 8 個字元'),
})

type Schema = z.output<typeof schema>

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: '信箱',
    placeholder: '請輸入您的信箱',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: '密碼',
    placeholder: '請輸入您的密碼',
    required: true,
  },
]

const handleGoogleLogin = () => {
  // TODO: 串接 Google OAuth API
}

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: handleGoogleLogin,
  },
]

const handleSubmit = (payload: FormSubmitEvent<Schema>) => {
  // TODO: 串接登入 API
  console.log('Submitted', payload)
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <UAuthForm
      :schema="schema"
      title="登入"
      description="輸入您的帳號憑證以存取您的帳戶。"
      icon="i-lucide-user"
      :fields="fields"
      :providers="providers"
      :submit="{ label: '登入', block: true }"
      @submit="handleSubmit"
    />
  </UPageCard>
</template>
