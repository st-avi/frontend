<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const menuItems = computed<NavigationMenuItem[]>(() => [
  { label: '首頁', to: '/' },
  { label: '文章', to: '/articles', active: route.path.startsWith('/articles') },
])
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <img src="/logo2.webp" class="h-12" alt="Logo" aria-label="Logo" />
      </template>

      <UNavigationMenu
        :items="menuItems"
        variant="link"
        :ui="{
          link: 'text-lg',
        }"
      />

      <template #right>
        <UColorModeButton size="xl" />
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/st-avi"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
          size="xl"
        />
      </template>

      <template #body>
        <UNavigationMenu
          :items="menuItems"
          orientation="vertical"
          class="-mx-2.5"
          :ui="{
            link: 'text-lg',
          }"
        />
      </template>
    </UHeader>

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <UFooter />
  </UApp>
</template>
