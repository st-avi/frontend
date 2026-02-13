<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const menuItems = computed<NavigationMenuItem[]>(() => [
  { label: '首頁', to: '/' },
  { label: '文章', to: '/articles', active: route.path.startsWith('/articles') },
])
</script>

<template>
  <div>
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
      <slot />
    </UMain>

    <UFooter class="border-default border-t">
      <template #left>
        <p class="text-muted text-sm">Copyright &copy; {{ new Date().getFullYear() }} Stavi. 保留一切權利。</p>
      </template>
      <template #right>
        <div class="flex">
          <ULink class="text-sm">使用條款</ULink>
        </div>
      </template>
    </UFooter>
  </div>
</template>
