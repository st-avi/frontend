// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt(eslintPluginPrettierRecommended, {
  files: [
    '**/components/**/*.{js,ts,vue}',
    '**/pages/**/*.{js,ts,vue}',
    '**/layouts/**/*.{js,ts,vue}',
    '**/app.{js,ts,vue}',
    '**/error.{js,ts,vue}',
  ],
  rules: {
    'vue/no-multiple-template-root': 'off',
  },
})
