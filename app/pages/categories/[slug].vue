<script setup lang="ts">
import type { ApiResp } from '~~/types/api/common.ts'
import type { CategoryArticles, Categories } from '~~/types/api/article.ts'

const config = useRuntimeConfig()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: articlesResp, error: articlesError } = await useFetch<ApiResp<CategoryArticles>>(
  `${config.public.apiBase}/category`,
  {
    method: 'GET',
    params: { slug },
    key: `category-articles-${slug.value}`,
  },
)

if (articlesError.value) {
  const statusCode = articlesError.value.status ?? 500
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? '系列文章不存在' : (articlesError.value.message ?? '系列文章載入失敗'),
    fatal: true,
  })
}

const { data: categoriesResp } = await useFetch<ApiResp<Categories>>(`${config.public.apiBase}/categories`, {
  method: 'GET',
})

const articleList = computed(() => articlesResp.value?.data?.list || [])
const categoryName = computed(
  () => categoriesResp.value?.data?.categories?.find((c) => c.slug === slug.value)?.name ?? slug.value,
)

useSeoMeta({ title: () => `${categoryName.value} - 系列文章` })
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
          <UIcon name="i-lucide-folder" class="text-primary size-8" />
          <h1 class="text-highlighted text-3xl font-bold">{{ categoryName }}</h1>
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

      <UAlert v-else color="neutral" variant="soft" icon="i-lucide-inbox" title="這個系列目前還沒有文章" />
    </div>
  </div>
</template>
