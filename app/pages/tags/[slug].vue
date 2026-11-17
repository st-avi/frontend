<script setup lang="ts">
import type { ApiResp } from '~~/types/api/common.ts'
import type { TagArticles, Tags } from '~~/types/api/article.ts'

const config = useRuntimeConfig()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: articlesResp, error: articlesError } = await useFetch<ApiResp<TagArticles>>(
  `${config.public.apiBase}/tag`,
  {
    method: 'GET',
    params: { slug },
    key: `tag-articles-${slug.value}`,
  },
)

if (articlesError.value) {
  const statusCode = articlesError.value.status ?? 500
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? '標籤不存在' : (articlesError.value.message ?? '標籤文章載入失敗'),
    fatal: true,
  })
}

const { data: tagsResp } = await useFetch<ApiResp<Tags>>(`${config.public.apiBase}/tags`, {
  method: 'GET',
})

const articleList = computed(() => articlesResp.value?.data?.list || [])
const tagName = computed(() => tagsResp.value?.data?.tags?.find((t) => t.slug === slug.value)?.name ?? slug.value)

useSeoMeta({ title: () => `${tagName.value} - 標籤文章` })
</script>

<template>
  <div class="flex flex-1 justify-center py-8">
    <div class="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div class="mb-8 space-y-3">
        <UButton
          to="/articles"
          label="所有文章"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="link"
          class="px-0"
        />
        <div class="flex items-center gap-3">
          <UIcon name="i-lucide-tag" class="text-primary size-8" />
          <h1 class="text-highlighted text-3xl font-bold">{{ tagName }}</h1>
          <UBadge :label="`${articleList.length} 篇`" color="primary" variant="soft" class="rounded-full px-3 py-1" />
        </div>
      </div>

      <div v-if="articleList.length" class="space-y-4">
        <ArticleCard
          v-for="article in articleList"
          :key="article.slug"
          :to="`/articles/${article.slug}`"
          :title="article.title"
          :summary="article.summary"
        />
      </div>

      <UAlert v-else color="neutral" variant="soft" icon="i-lucide-inbox" title="這個標籤目前還沒有文章" />
    </div>
  </div>
</template>
