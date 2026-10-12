<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'
import type { ApiResp } from '~~/types/api/common.ts'
import type { LatestArticles } from '~~/types/api/article.ts'

const config = useRuntimeConfig()

const {
  data: latest,
  pending: latestPending,
  error: latestError,
} = await useFetch<ApiResp<LatestArticles>>(`${config.public.apiBase}/articles/10`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})

const allPosts = computed(() =>
  (latest.value?.data?.list || []).map((article) => ({
    title: article.title,
    description: article.summary,
    image: article.cover_image,
    badge: {
      label: article.category,
      color: 'primary' as const,
      variant: 'soft' as const,
      icon: 'i-lucide-folder',
      class: 'rounded-full px-3 py-1 font-medium',
    },
    to: `/articles/${article.slug}`,
  })),
)

const PREVIEW_COUNT = 6
const previewPosts = computed(() => allPosts.value.slice(0, PREVIEW_COUNT))
const extraPosts = computed(() => allPosts.value.slice(PREVIEW_COUNT))
const hasMore = computed(() => allPosts.value.length > PREVIEW_COUNT)
const expanded = ref(false)

const ctaLinks = ref<ButtonProps[]>([
  {
    label: '看文章',
    to: '/articles',
    color: 'primary',
    variant: 'solid',
    size: 'xl',
    trailingIcon: 'i-lucide-arrow-right',
    class: 'rounded-full px-6 hover:bg-primary',
  },
])
</script>

<template>
  <UPage class="flex flex-1 flex-col">
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

    <UContainer class="py-12">
      <h2 class="mb-6 text-2xl font-semibold">最新文章</h2>

      <div v-if="latestPending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="index in 3" :key="index" class="h-64 w-full rounded-xl" />
      </div>

      <UAlert
        v-else-if="latestError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="文章載入失敗"
        description="目前無法取得最新文章，請稍後再試。"
      />

      <template v-else-if="previewPosts.length">
        <UBlogPosts>
          <UBlogPost v-for="post in previewPosts" :key="post.to" orientation="vertical" v-bind="post" />
          <NuxtLink
            v-if="!hasMore"
            to="/articles"
            class="group bg-elevated/50 ring-default hover:bg-elevated hover:ring-accented focus-visible:outline-primary flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg p-6 text-center ring transition focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <UIcon
              name="i-lucide-arrow-right"
              class="text-primary size-10 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            />
            <span class="text-highlighted text-xl font-semibold">查看所有文章</span>
            <span class="text-muted">探索更多學習內容</span>
          </NuxtLink>
        </UBlogPosts>

        <div
          v-if="hasMore"
          class="grid transition-[grid-template-rows,opacity] duration-500 ease-in-out motion-reduce:transition-none"
          :class="expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          :inert="!expanded"
        >
          <div class="-m-1 overflow-hidden p-1">
            <UBlogPosts class="pt-8 lg:pt-16">
              <UBlogPost v-for="post in extraPosts" :key="post.to" orientation="vertical" v-bind="post" />
              <NuxtLink
                to="/articles"
                class="group bg-elevated/50 ring-default hover:bg-elevated hover:ring-accented focus-visible:outline-primary flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg p-6 text-center ring transition focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <UIcon
                  name="i-lucide-arrow-right"
                  class="text-primary size-10 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
                />
                <span class="text-highlighted text-xl font-semibold">查看所有文章</span>
                <span class="text-muted">探索更多學習內容</span>
              </NuxtLink>
            </UBlogPosts>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <UButton
            v-if="hasMore"
            :label="expanded ? '收合' : '查看更多'"
            trailing-icon="i-lucide-chevron-down"
            color="neutral"
            variant="outline"
            size="lg"
            class="rounded-full px-6 backdrop-blur transition hover:-translate-y-0.5 motion-reduce:transition-none"
            :ui="{
              trailingIcon: [
                'transition-transform duration-500 motion-reduce:transition-none',
                expanded && 'rotate-180',
              ],
            }"
            :aria-expanded="expanded"
            @click="expanded = !expanded"
          />
        </div>
      </template>

      <p v-else class="text-muted">目前還沒有文章。</p>
    </UContainer>
  </UPage>
</template>
