<script setup lang="ts">
import { useRafFn, useWindowSize } from '@vueuse/core'
import type { NuxtError } from '#app'
import {
  BREAKPOINT_MOBILE,
  CAT_SIZE_MOBILE,
  CAT_SIZE_DESKTOP,
  CAT_ROTATION_SPEED,
  CAT_DRAG_ROTATION_SPEED,
  CAT_MAX_THROW_SPEED,
  CAT_MAX_FRAME_DELTA_MS,
  CAT_MS_PER_FRAME,
  CAT_VELOCITY_SAMPLES,
  CAT_INITIAL_X,
  CAT_INITIAL_Y,
  CAT_INITIAL_VX,
  CAT_INITIAL_VY,
  CAT_BOUNCE_DAMPING,
  CAT_MIN_SPEED,
} from '~/config/error-page'

defineProps({
  error: {
    type: Object as () => NuxtError,
    default: null,
  },
})

const handleGoHome = () => clearError({ redirect: '/' })

const { width, height } = useWindowSize()
const catSize = computed(() => (width.value <= BREAKPOINT_MOBILE ? CAT_SIZE_MOBILE : CAT_SIZE_DESKTOP))

const x = ref(CAT_INITIAL_X)
const y = ref(CAT_INITIAL_Y)
const vx = ref(CAT_INITIAL_VX)
const vy = ref(CAT_INITIAL_VY)
const rotation = ref(0)
const isDragging = ref(false)

type PositionSample = { x: number; y: number; t: number }
const samples: PositionSample[] = []

const catStyle = computed(() => ({
  width: `${catSize.value}px`,
  height: `${catSize.value}px`,
  transform: `translate(${x.value}px, ${y.value}px) rotate(${rotation.value}deg)`,
  top: '0',
  left: '0',
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const applyBounceDamping = () => {
  const speed = Math.hypot(vx.value, vy.value)
  if (speed === 0) return

  const dampedSpeed = Math.max(speed * CAT_BOUNCE_DAMPING, CAT_MIN_SPEED)
  const scale = dampedSpeed / speed
  vx.value *= scale
  vy.value *= scale
}

useRafFn(({ delta }) => {
  if (isDragging.value) return

  const frames = Math.min(delta, CAT_MAX_FRAME_DELTA_MS) / CAT_MS_PER_FRAME

  const maxX = width.value - catSize.value
  const maxY = height.value - catSize.value

  x.value += vx.value * frames
  y.value += vy.value * frames
  rotation.value += CAT_ROTATION_SPEED * frames

  if (x.value <= 0) {
    x.value = 0
    vx.value = Math.abs(vx.value)
    applyBounceDamping()
  } else if (x.value >= maxX) {
    x.value = maxX
    vx.value = -Math.abs(vx.value)
    applyBounceDamping()
  }

  if (y.value <= 0) {
    y.value = 0
    vy.value = Math.abs(vy.value)
    applyBounceDamping()
  } else if (y.value >= maxY) {
    y.value = maxY
    vy.value = -Math.abs(vy.value)
    applyBounceDamping()
  }
})

const recordSample = (clientX: number, clientY: number) => {
  samples.push({ x: clientX, y: clientY, t: performance.now() })
  if (samples.length > CAT_VELOCITY_SAMPLES) samples.shift()
}

const computeThrowVelocity = () => {
  if (samples.length < 2) return { vx: 1.5, vy: 1.05 }

  const first = samples[0]!
  const last = samples[samples.length - 1]!
  const dt = (last.t - first.t) / 16 // normalize to ~60fps frames

  if (dt === 0) return { vx: 0, vy: 0 }

  return {
    vx: clamp((last.x - first.x) / dt, -CAT_MAX_THROW_SPEED, CAT_MAX_THROW_SPEED),
    vy: clamp((last.y - first.y) / dt, -CAT_MAX_THROW_SPEED, CAT_MAX_THROW_SPEED),
  }
}

let dragOffsetX = 0
let dragOffsetY = 0

const handleDragMove = (clientX: number, clientY: number) => {
  recordSample(clientX, clientY)
  x.value = clamp(clientX - dragOffsetX, 0, width.value - catSize.value)
  y.value = clamp(clientY - dragOffsetY, 0, height.value - catSize.value)
  rotation.value += CAT_DRAG_ROTATION_SPEED
}

const handleDragEnd = () => {
  isDragging.value = false

  const thrown = computeThrowVelocity()
  vx.value = thrown.vx
  vy.value = thrown.vy
  samples.length = 0

  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
}

const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY)
const onMouseUp = () => handleDragEnd()
const onTouchMove = (e: TouchEvent) => {
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) return
  handleDragMove(touch.clientX, touch.clientY)
}
const onTouchEnd = () => handleDragEnd()

const handleDragStart = (e: MouseEvent) => {
  isDragging.value = true
  dragOffsetX = e.clientX - x.value
  dragOffsetY = e.clientY - y.value
  samples.length = 0
  recordSample(e.clientX, e.clientY)

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (!touch) return

  isDragging.value = true
  dragOffsetX = touch.clientX - x.value
  dragOffsetY = touch.clientY - y.value
  samples.length = 0
  recordSample(touch.clientX, touch.clientY)

  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
}

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <UApp>
    <div class="relative h-screen w-screen overflow-hidden">
      <img src="~/assets/image/404_bg.webp" alt="404 background" class="absolute inset-0 h-full w-full object-cover" />
      <div class="relative z-10 flex h-full w-full items-center justify-center px-6">
        <div
          class="bg-default/70 ring-default max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl px-6 py-10 shadow-xl ring-1 backdrop-blur-sm"
        >
          <template v-if="error?.status === 404">
            <h1 class="text-highlighted mb-4 text-center text-[3.375rem] font-bold max-sm:text-4xl">404 找不到頁面</h1>
            <div class="flex flex-col items-center justify-center gap-6 max-sm:gap-3">
              <p class="text-muted text-center text-base leading-relaxed max-sm:text-sm">
                您要找的頁面可能已經被移除或暫時無法使用。
              </p>
              <UButton color="primary" class="cursor-pointer" @click="handleGoHome"> 返回首頁 </UButton>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center gap-4">
              <h1 class="text-error text-6xl font-bold">{{ error?.status }}</h1>
              <p class="text-muted text-center text-lg">{{ error?.message }}</p>
              <UButton color="primary" class="cursor-pointer" @click="handleGoHome"> 返回首頁 </UButton>
            </div>
          </template>
        </div>
      </div>
      <img
        v-if="error?.status === 404"
        src="~/assets/image/404_cat.webp"
        alt="floating cat"
        draggable="false"
        class="fixed z-20 select-none"
        :style="catStyle"
        @dragstart.prevent
        @mousedown="handleDragStart"
        @touchstart.prevent="handleTouchStart"
      />
    </div>
  </UApp>
</template>
