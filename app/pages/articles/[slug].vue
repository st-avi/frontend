<script setup lang="ts">
import type { ApiResp } from '~~/types/api/common.ts'
import type { Article } from '~~/types/api/article.ts'
import { parseMarkdown } from '@comark/nuxt/parse'
import shiki from '@comark/nuxt/plugins/shiki/core'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import bash from '@shikijs/langs/bash'
import c from '@shikijs/langs/c'
import cpp from '@shikijs/langs/cpp'
import go from '@shikijs/langs/go'
import python from '@shikijs/langs/python'
import emoji from '@comark/nuxt/plugins/emoji'
import math, { Math } from '@comark/nuxt/plugins/math'
import toc from '@comark/nuxt/plugins/toc'

const config = useRuntimeConfig()
const route = useRoute()
const plugins = [
  shiki({
    languages: [bash, c, cpp, go, python],
    themes: { light: githubLight, dark: githubDark },
  }),
  emoji(),
  math(),
]
const components = { math: Math }

const { data: articleResp, error: articleError } = await useFetch<ApiResp<Article>>(
  `${config.public.apiBase}/article`,
  {
    method: 'GET',
    params: {
      slug: route.params.slug,
    },
  },
)

if (articleError.value) {
  const statusCode = articleError.value.status ?? 500
  throw createError({
    statusCode,
    statusMessage: statusCode === 404 ? '文章不存在' : (articleError.value.message ?? '文章載入失敗'),
    fatal: true,
  })
}

const article = computed<Article>(() => articleResp.value?.data || ({} as Article))
const tocResult = await parseMarkdown(article.value.content, { plugins: [toc()] })
const publishedAt = computed(() => {
  if (!article.value.published_at) return ''
  const date = new Date(article.value.published_at)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>

<template>
  <div class="flex flex-1 justify-center py-8">
    <div class="flex w-full max-w-6xl gap-8">
      <div class="w-6/7 rounded-lg border border-slate-300 p-4">
        <div class="space-y-6">
          <div class="aspect-video w-full overflow-hidden rounded-lg">
            <img :src="article.cover_image" alt="Article Cover Image" class="h-full w-full object-cover" />
          </div>
          <div class="text-highlighted text-4xl font-bold">{{ article.title }}</div>
          <div>{{ article.summary }}</div>
          <div class="flex items-center">
            <UIcon name="i-lucide-calendar-clock" class="mr-2 h-4 w-4" />
            <div>{{ publishedAt }}</div>
          </div>
          <USeparator />
        </div>
        <div class="article-content">
          <Markdown :value="article.content" :plugins="plugins" :components="components" />
        </div>
      </div>

      <div class="w-1/7">
        <UContentToc
          highlight
          highlight-color="primary"
          highlight-variant="circuit"
          :title="article.title"
          :links="tocResult.meta.toc.links"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-content :deep(pre.shiki code) {
  counter-reset: line;
}

.article-content :deep(pre.shiki code .line::before) {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1.5rem;
  padding-right: 0.75rem;
  margin-right: 0.75rem;
  border-right: 1px solid var(--ui-text-dimmed);
  text-align: right;
  color: var(--ui-text-dimmed);
  user-select: none;
}

:global(.dark .article-content pre.shiki span) {
  color: var(--shiki-dark, inherit) !important;
}
</style>
