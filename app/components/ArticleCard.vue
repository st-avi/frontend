<script setup lang="ts">
defineProps<{
  to: string
  title: string
  summary?: string
  category?: string
  categorySlug?: string
}>()
</script>

<template>
  <UCard variant="subtle" class="hover:bg-elevated relative transition-colors">
    <div class="flex items-center gap-4">
      <div class="flex min-w-0 flex-1 flex-col items-start gap-3">
        <NuxtLink v-if="category && categorySlug" :to="`/categories/${categorySlug}`" class="relative z-10 inline-flex">
          <UBadge
            color="primary"
            variant="soft"
            icon="i-lucide-folder"
            :label="category"
            class="rounded-full px-3 py-1 text-sm font-medium"
          />
        </NuxtLink>
        <div class="space-y-1">
          <!-- 透過 after 擴展點擊範圍，讓整張卡片都能點擊 -->
          <NuxtLink :to="to" class="text-highlighted text-xl font-semibold after:absolute after:inset-0">
            {{ title }}
          </NuxtLink>
          <p v-if="summary" class="text-muted">{{ summary }}</p>
        </div>
      </div>
      <UIcon name="i-lucide-chevron-right" class="text-muted size-5 shrink-0" />
    </div>
  </UCard>
</template>
