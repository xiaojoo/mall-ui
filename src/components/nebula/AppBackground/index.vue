<template>
  <!-- 星空粒子 + 网格 + 扫描线 背景（全站固定层） -->
  <div class="nebula-bg">
    <canvas ref="starsRef" id="stars"></canvas>
    <div class="glow-grid"></div>
    <div class="scanlines"></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const starsRef = ref<HTMLCanvasElement | null>(null)
let rafId = 0

interface Star {
  x: number
  y: number
  r: number
  v: number
  ph: number
  c: string
}
interface Shoot {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

onMounted(() => {
  const cv = starsRef.value as HTMLCanvasElement
  const ctx = cv.getContext('2d') as CanvasRenderingContext2D

  let W = 0
  let H = 0
  let stars: Star[] = []
  let shoot: Shoot | null = null
  let t = 0

  const COLORS = ['0,240,255', '168,85,247', '255,46,196', '143,163,200']

  function size() {
    W = cv.width = window.innerWidth
    H = cv.height = window.innerHeight
    const n = Math.min(220, Math.floor((W * H) / 9000))
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.3,
      v: Math.random() * 0.4 + 0.08,
      ph: Math.random() * Math.PI * 2,
      c: COLORS[Math.floor(Math.random() * COLORS.length)],
    }))
  }

  function draw() {
    ctx.clearRect(0, 0, W, H)
    t += 0.016
    stars.forEach((s) => {
      s.y += s.v
      s.x += Math.sin(t * 0.6 + s.ph) * 0.12
      if (s.y > H + 4) {
        s.y = -4
        s.x = Math.random() * W
      }
      const tw = 0.45 + Math.abs(Math.sin(t * 1.6 + s.ph)) * 0.55
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.r, 0, 7)
      ctx.fillStyle = `rgba(${s.c},${tw * 0.85})`
      ctx.fill()
      if (s.r > 1.1) {
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r * 3.2, 0, 7)
        ctx.fillStyle = `rgba(${s.c},${tw * 0.1})`
        ctx.fill()
      }
    })
    if (Math.random() < 0.012 && !shoot) {
      shoot = {
        x: Math.random() * W * 0.7 + W * 0.15,
        y: Math.random() * H * 0.3,
        vx: -(7 + Math.random() * 5),
        vy: 3 + Math.random() * 2.5,
        life: 1,
      }
    }
    if (shoot) {
      shoot.x += shoot.vx
      shoot.y += shoot.vy
      shoot.life -= 0.02
      const g = ctx.createLinearGradient(
        shoot.x,
        shoot.y,
        shoot.x - shoot.vx * 9,
        shoot.y - shoot.vy * 9,
      )
      g.addColorStop(0, `rgba(255,255,255,${shoot.life})`)
      g.addColorStop(1, 'rgba(0,240,255,0)')
      ctx.strokeStyle = g
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(shoot.x, shoot.y)
      ctx.lineTo(shoot.x - shoot.vx * 9, shoot.y - shoot.vy * 9)
      ctx.stroke()
      if (shoot.life <= 0) shoot = null
    }
    rafId = requestAnimationFrame(draw)
  }

  size()
  window.addEventListener('resize', size)
  rafId = requestAnimationFrame(draw)

  // 标签页隐藏时暂停动画循环，避免后台白跑 rAF 烧 CPU/掉帧
  const onVisibility = () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId)
      rafId = 0
    } else if (!rafId) {
      rafId = requestAnimationFrame(draw)
    }
  }
  document.addEventListener('visibilitychange', onVisibility)

  onBeforeUnmount(() => {
    cancelAnimationFrame(rafId)
    window.removeEventListener('resize', size)
    document.removeEventListener('visibilitychange', onVisibility)
  })
})
</script>

<style scoped>
.nebula-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
</style>
