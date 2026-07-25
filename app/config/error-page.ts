export const BREAKPOINT_MOBILE = 640

export const CAT_SIZE_MOBILE = 90
export const CAT_SIZE_DESKTOP = 140

const MS_PER_SECOND = 1000
const TARGET_FPS = 60

// Speeds below are tuned per animation frame at TARGET_FPS; the raf loop scales
// them by elapsed time so movement stays consistent across refresh rates.
export const CAT_MS_PER_FRAME = MS_PER_SECOND / TARGET_FPS

export const CAT_ROTATION_SPEED = 0.4
export const CAT_DRAG_ROTATION_SPEED = 2.5
export const CAT_MAX_THROW_SPEED = 20
export const CAT_VELOCITY_SAMPLES = 5

// Caps the per-tick delta so resuming a backgrounded tab doesn't teleport the cat.
export const CAT_MAX_FRAME_DELTA_MS = 100

export const CAT_INITIAL_X = 200
export const CAT_INITIAL_Y = 200
export const CAT_INITIAL_VX = 1.5
export const CAT_INITIAL_VY = 1.05

// Fraction of speed kept after each wall bounce (energy loss on collision).
export const CAT_BOUNCE_DAMPING = 0.92

// Speed never decays below the page's initial speed(min velocity threshold), no matter how many bounces happen.
export const CAT_MIN_SPEED = Math.hypot(CAT_INITIAL_VX, CAT_INITIAL_VY)
