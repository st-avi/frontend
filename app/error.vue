<script setup lang="ts">
import { useEventListener, useRafFn, useWindowSize } from '@vueuse/core'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError | null
}>()

type Vector2 = { x: number; y: number }

const is404 = computed(() => props.error?.status === 404)
const handleGoHome = () => clearError({ redirect: '/' })

const { width, height } = useWindowSize()

const catSize = computed(() => (width.value <= 640 ? 90 : 140))
// Speeds below are tuned per animation frame at TARGET_FPS.
// The raf loop scales them by elapsed time so movement stays consistent across refresh rates.
const CAT_MS_PER_FRAME = 1000 / 60 // MS_PER_SECOND / TARGET_FPS

const CAT_ROTATION_SPEED = 0.4
const CAT_DRAG_ROTATION_SPEED = 2.5
const CAT_MAX_THROW_SPEED = 20
const CAT_VELOCITY_SAMPLES = 5
// Caps the per-tick delta so resuming a backgrounder tab doesn't teleport the cat.
const CAT_MAX_FRAME_DELTA_MS = 100
const CAT_INITIAL_X = 200
const CAT_INITIAL_Y = 200
const CAT_INITIAL_VX = 1.5
const CAT_INITIAL_VY = 1.05
// Fraction of speed kept after each wall bounce (energy loss on collision).
const CAT_BOUNCE_DAMPING = 0.92
// Speed never decays below the page's initial speed (minimum velocity threshold), no matter how many bounces happen.
const CAT_MIN_SPEED = Math.hypot(CAT_INITIAL_VX, CAT_INITIAL_VY)

const position = reactive<Vector2>({ x: CAT_INITIAL_X, y: CAT_INITIAL_Y })
const velocity = reactive<Vector2>({ x: CAT_INITIAL_VX, y: CAT_INITIAL_VY })
const rotation = ref(0)
const isDragging = ref(false)

type PositionSample = Vector2 & { t: number }
const samples: PositionSample[] = []

const catStyle = computed(() => ({
  width: `${catSize.value}px`,
  height: `${catSize.value}px`,
  transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation.value}deg)`,
  top: '0',
  left: '0',
  cursor: isDragging.value ? 'grabbing' : 'grab',
}))

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const getBounds = () => ({
  x: Math.max(width.value - catSize.value, 0),
  y: Math.max(height.value - catSize.value, 0),
})

const applyBounceDamping = () => {
  const speed = Math.hypot(velocity.x, velocity.y)
  if (speed === 0) return

  const dampedSpeed = Math.max(speed * CAT_BOUNCE_DAMPING, CAT_MIN_SPEED)
  const scale = dampedSpeed / speed
  velocity.x *= scale
  velocity.y *= scale
}

useRafFn(({ delta }) => {
  if (!is404.value || isDragging.value) return

  const frames = Math.min(delta, CAT_MAX_FRAME_DELTA_MS) / CAT_MS_PER_FRAME
  const bounds = getBounds()

  position.x += velocity.x * frames
  position.y += velocity.y * frames
  rotation.value += CAT_ROTATION_SPEED * frames

  if (position.x <= 0) {
    position.x = 0
    velocity.x = Math.abs(velocity.x)
    applyBounceDamping()
  } else if (position.x >= bounds.x) {
    position.x = bounds.x
    velocity.x = -Math.abs(velocity.x)
    applyBounceDamping()
  }

  if (position.y <= 0) {
    position.y = 0
    velocity.y = Math.abs(velocity.y)
    applyBounceDamping()
  } else if (position.y >= bounds.y) {
    position.y = bounds.y
    velocity.y = -Math.abs(velocity.y)
    applyBounceDamping()
  }
})

const recordSample = (clientX: number, clientY: number) => {
  samples.push({ x: clientX, y: clientY, t: performance.now() })
  if (samples.length > CAT_VELOCITY_SAMPLES) samples.shift()
}

const computeThrowVelocity = () => {
  if (samples.length < 2) return { x: CAT_INITIAL_VX, y: CAT_INITIAL_VY }

  const first = samples[0]!
  const last = samples[samples.length - 1]!
  const dt = (last.t - first.t) / CAT_MS_PER_FRAME // normalize to ~60fps frames

  if (dt === 0) return { x: 0, y: 0 }

  return {
    x: clamp((last.x - first.x) / dt, -CAT_MAX_THROW_SPEED, CAT_MAX_THROW_SPEED),
    y: clamp((last.y - first.y) / dt, -CAT_MAX_THROW_SPEED, CAT_MAX_THROW_SPEED),
  }
}

const dragOffset = reactive<Vector2>({ x: 0, y: 0 })
let stopDragListeners: (() => void) | null = null

const clearDragListeners = () => {
  stopDragListeners?.()
  stopDragListeners = null
}

const handleDragMove = (clientX: number, clientY: number) => {
  const bounds = getBounds()

  recordSample(clientX, clientY)
  position.x = clamp(clientX - dragOffset.x, 0, bounds.x)
  position.y = clamp(clientY - dragOffset.y, 0, bounds.y)
  rotation.value += CAT_DRAG_ROTATION_SPEED
}

const handleDragEnd = () => {
  isDragging.value = false

  const thrown = computeThrowVelocity()
  velocity.x = thrown.x
  velocity.y = thrown.y
  samples.length = 0

  clearDragListeners()
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

const registerMouseDragListeners = () => {
  clearDragListeners()
  const stopMouseMove = useEventListener(window, 'mousemove', onMouseMove)
  const stopMouseUp = useEventListener(window, 'mouseup', onMouseUp)
  stopDragListeners = () => {
    stopMouseMove()
    stopMouseUp()
  }
}

const registerTouchDragListeners = () => {
  clearDragListeners()
  const stopTouchMove = useEventListener(window, 'touchmove', onTouchMove, { passive: false })
  const stopTouchEnd = useEventListener(window, 'touchend', onTouchEnd)
  stopDragListeners = () => {
    stopTouchMove()
    stopTouchEnd()
  }
}

const handleDragStart = (e: MouseEvent) => {
  isDragging.value = true
  dragOffset.x = e.clientX - position.x
  dragOffset.y = e.clientY - position.y
  samples.length = 0
  recordSample(e.clientX, e.clientY)

  registerMouseDragListeners()
}

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches[0]
  if (!touch) return

  isDragging.value = true
  dragOffset.x = touch.clientX - position.x
  dragOffset.y = touch.clientY - position.y
  samples.length = 0
  recordSample(touch.clientX, touch.clientY)

  registerTouchDragListeners()
}

onUnmounted(() => {
  clearDragListeners()
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
          <template v-if="is404">
            <h1 class="text-highlighted mb-4 text-center text-[3.375rem] font-bold max-sm:text-4xl">404 找不到頁面</h1>
            <div class="flex flex-col items-center justify-center gap-6 max-sm:gap-3">
              <p class="text-muted text-center text-base leading-relaxed max-sm:text-sm">
                您要找的頁面可能已經被移除或暫時無法使用。
              </p>
              <UButton size="xl" color="primary" class="cursor-pointer" @click="handleGoHome"> 返回首頁 </UButton>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center gap-4">
              <h1 class="text-error text-6xl font-bold">{{ error?.status }}</h1>
              <p class="text-muted text-center text-lg">{{ error?.message }}</p>
              <UButton size="xl" color="primary" class="cursor-pointer" @click="handleGoHome"> 返回首頁 </UButton>
            </div>
          </template>
        </div>
      </div>
      <img
        v-if="is404"
        src="~/assets/image/404_cat.webp"
        alt=""
        aria-hidden="true"
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
