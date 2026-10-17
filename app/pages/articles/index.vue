<script setup lang="ts">
import type { ApiResp } from '~~/types/api/common.ts'
import type { Articles, Categories, Tags } from '~~/types/api/article.ts'

const config = useRuntimeConfig()

const {
  data: articles,
  pending: articlesPending,
  error: articlesError,
} = await useFetch<ApiResp<Articles>>(`${config.public.apiBase}/articles`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
const articleList = computed(() => articles.value?.data?.list || [])

const { data: tags, error: tagsError } = await useFetch<ApiResp<Tags>>(`${config.public.apiBase}/tags`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
})
const tagList = computed(() => tags.value?.data?.tags || [])
const tagColors = ['primary', 'secondary', 'success', 'warning', 'neutral'] as const
const getTagColor = (index: number) => tagColors[index % tagColors.length]

const { data: categories, error: categoriesError } = await useFetch<ApiResp<Categories>>(
  `${config.public.apiBase}/categories`,
  {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  },
)
const categoryList = computed(() => categories.value?.data?.categories || [])
const categoryScroller = ref<HTMLElement | null>(null)
const canScrollDown = ref(false)
const updateCanScrollDown = () => {
  const el = categoryScroller.value
  canScrollDown.value = !!el && el.scrollTop + el.clientHeight < el.scrollHeight - 1
}

onMounted(updateCanScrollDown)
watch(categoryList, () => nextTick(updateCanScrollDown))

const navigateToArticle = (slug: string) => navigateTo(`/articles/${slug}`)
</script>

<template>
  <div class="flex flex-1 justify-center py-8">
    <div class="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <div v-if="articlesPending" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div class="space-y-4">
          <USkeleton v-for="index in 4" :key="index" class="h-36 w-full rounded-xl" />
        </div>
        <USkeleton class="hidden h-72 w-full rounded-xl lg:block" />
      </div>

      <UAlert
        v-else-if="articlesError"
        color="error"
        variant="soft"
        icon="i-lucide-circle-alert"
        title="文章載入失敗"
        description="目前無法取得文章列表，請稍後再試。"
        :ui="{
          icon: 'size-10',
        }"
      />

      <UPage
        v-else
        :ui="{
          center: 'lg:col-span-7',
          right: 'lg:col-span-3',
        }"
      >
        <div class="space-y-4">
          <UCard
            v-for="article in articleList"
            :key="article.slug"
            variant="subtle"
            class="cursor-pointer"
            @click="navigateToArticle(article.slug)"
          >
            <div class="flex flex-col items-start justify-between gap-4">
              <NuxtLink :to="`/categories/${article.category_slug}`" class="inline-flex" @click.stop>
                <UBadge
                  color="primary"
                  variant="soft"
                  icon="i-lucide-folder"
                  :label="article.category"
                  class="rounded-full px-3 py-1 text-sm font-medium"
                />
              </NuxtLink>
              <div class="space-y-1">
                <div class="text-xl font-semibold">
                  {{ article.title }}
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <template #right>
          <div class="flex flex-col gap-8">
            <UCard variant="subtle" class="h-fit">
              <template #header>
                <div class="flex items-center gap-2 text-lg font-semibold">
                  <UIcon name="i-lucide-library" class="size-5" />
                  <span>系列文</span>
                </div>
              </template>

              <UAlert
                v-if="categoriesError"
                color="warning"
                variant="soft"
                title="系列文章暫時無法載入"
                description="稍後重新整理頁面，再試一次。"
              />

              <div
                v-else
                ref="categoryScroller"
                class="flex max-h-64 scrollbar-thin flex-col gap-2 overflow-y-auto pr-1"
                :class="{
                  'mask-[linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]': canScrollDown,
                }"
                @scroll.passive="updateCanScrollDown"
              >
                <NuxtLink
                  v-for="category in categoryList"
                  :key="category.slug"
                  :to="`/categories/${category.slug}`"
                  class="hover:bg-elevated flex items-center gap-2 rounded-lg py-1.5 font-medium transition-colors"
                >
                  <UIcon name="i-lucide-folder" class="size-4" />
                  <span>{{ category.name }}</span>
                </NuxtLink>
              </div>
            </UCard>

            <UCard variant="subtle" class="h-fit">
              <template #header>
                <div class="flex items-center gap-2 text-lg font-semibold">
                  <UIcon name="i-lucide-tag" class="size-5" />
                  <span>TAGS</span>
                </div>
              </template>

              <UAlert
                v-if="tagsError"
                color="warning"
                variant="soft"
                title="標籤暫時無法載入"
                description="稍後重新整理頁面，再試一次。"
              />

              <div v-else class="flex flex-wrap gap-3">
                <UBadge
                  v-for="(tag, index) in tagList"
                  :key="tag.slug"
                  :color="getTagColor(index)"
                  variant="soft"
                  class="rounded-full px-3 py-1 text-base font-medium transition-transform hover:-translate-y-0.5"
                >
                  <NuxtLink :to="`/tags/${tag.slug}`">{{ tag.name }}</NuxtLink>
                </UBadge>
              </div>
            </UCard>
          </div>
        </template>
      </UPage>
    </div>
  </div>
</template>
