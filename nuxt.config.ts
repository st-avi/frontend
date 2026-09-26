import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    host: 'local.stavi.tw',
    https: true,
  },
  typescript: { typeCheck: true },
  css: ['~/assets/css/main.css'],
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
    optimizeDeps: {
      include: ['zod', 'zod/locales'],
    },
  },
  modules: ['@nuxt/eslint', '@nuxt/ui', '@comark/nuxt', '@nuxt/content'],
  icon: {
    serverBundle: 'remote',
  },
  ui: {
    prose: true,
  },
  content: {
    experimental: { sqliteConnector: 'native' },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
    },
  },
})
