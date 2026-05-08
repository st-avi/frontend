<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { ApiResp } from '~~/types/api/common'
import type { LoginData } from '~~/types/api/auth'

definePageMeta({
  layout: 'minimal',
  middleware: ['guest'],
})

const config = useRuntimeConfig()
const toast = useToast()

const schema = z.object({
  email: z.email('請輸入有效的電子郵件地址'),
  password: z.string().min(1, '請輸入密碼').min(12, '密碼至少需要 12 個字元'),
  otp: z.array(z.string().regex(/^\d$/, '每一格都必須是數字')).length(6, 'TOTP 必須是 6 位數字'),
})

type Schema = z.output<typeof schema>

const fields: AuthFormField[] = [
  { name: 'email', type: 'email', label: '電子郵件地址', placeholder: '請輸入您的電子郵件地址' },
  { name: 'password', type: 'password', label: '密碼', placeholder: '請輸入您的密碼' },
  { name: 'otp', type: 'otp', label: 'TOTP', length: 6 },
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

const isSubmitting = ref(false)

const handleSubmit = async (payload: FormSubmitEvent<Schema>) => {
  const { email, password, otp } = payload.data
  const otpStr = otp.join('')
  isSubmitting.value = true

  try {
    const resp = await $fetch<ApiResp<LoginData>>('/login', {
      baseURL: config.public.apiBase,
      method: 'POST',
      credentials: 'include',
      body: {
        email: email,
        password: password,
        totp: otpStr,
      },
    })
    if (resp.code === 0 && resp.message === 'OK') {
      const fetched = useState<boolean>('auth-user-fetched', () => false)
      fetched.value = false
      await useAuthUser()
      await navigateTo('/', { replace: true })
      return
    }
    toast.add({
      title: '登入失敗',
      description: '請稍後再試',
      color: 'error',
    })
  } catch (error) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? (error as { status: number }).status
        : undefined

    if (status === 401) {
      toast.add({
        title: '登入失敗',
        description: '電子郵件地址 / 密碼 / TOTP 錯誤',
        color: 'error',
      })
    } else {
      toast.add({
        title: '系統忙碌中',
        description: '目前無法登入，請稍後再試',
        color: 'warning',
      })
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <UPageCard class="w-full max-w-md">
    <div class="flex w-full justify-center">
      <img src="/logo2.webp" class="h-20" alt="Logo" aria-label="Logo" />
    </div>
    <UAuthForm
      :schema="schema"
      title="登入"
      description="輸入您的電子郵件地址和密碼以登入您的帳戶。"
      :fields="fields"
      :providers="providers"
      :submit="{ label: isSubmitting ? '登入中...' : '登入', block: true, loading: isSubmitting }"
      :ui="{
        otp: 'w-full flex justify-around',
      }"
      @submit="handleSubmit"
    />
  </UPageCard>
</template>
