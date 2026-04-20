import * as z from 'zod'
import { zhTW } from 'zod/locales'

export default defineNuxtPlugin(() => {
  z.config(zhTW())
})
