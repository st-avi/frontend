<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const ctaLinks = ref<ButtonProps[]>([
  { label: '看文章', color: 'neutral', variant: 'subtle', trailingIcon: 'i-lucide-arrow-right' },
])
</script>

<template>
  <UPage>
    <UPageCTA
      title="夢想起飛的學習基地"
      description="知識起航，未來翱翔"
      variant="soft"
      orientation="horizontal"
      reverse
      :links="ctaLinks"
      class="justify-center"
      :ui="{
        container: 'lg:grid-cols-3',
        wrapper: 'lg:col-span-2',
        title: 'text-center',
        description: 'text-center',
        footer: 'flex justify-around',
      }"
    >
      <div class="flex w-full justify-center lg:justify-end">
        <img src="/logo1.webp" class="size-30 sm:size-40" alt="logo" aria-label="logo" />
      </div>
    </UPageCTA>
  </UPage>
</template>
