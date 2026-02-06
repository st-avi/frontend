import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  devtools: { enabled: true },
  typescript: { typeCheck: true },
  css: ['~/assets/css/main.css'],
  vite: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    plugins: [tailwindcss() as any],
  },
  modules: ['@nuxt/eslint', '@nuxt/ui'],
})
