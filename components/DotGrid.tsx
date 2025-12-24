'use client'

import React, { useRef, useEffect, useCallback, useMemo } from 'react'
import { gsap } from 'gsap'

interface Dot {
  cx: number
  cy: number
  xOffset: number
  yOffset: number
  _animating: boolean
}

export interface DotGridProps {
  dotSize?: number
  gap?: number
  baseColor?: string
  activeColor?: string
  proximity?: number
  speedTrigger?: number
  shockRadius?: number
  shockStrength?: number
  returnDuration?: number
  className?: string
}

function hexToRgb(hex: string) {
  // Handle both 6 and 8 character hex (with alpha)
  hex = hex.replace(/^#/, '')
  if (hex.length === 8) hex = hex.slice(0, 6) // Remove alpha channel
  const m = hex.match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 10,
  gap = 24,
  baseColor = '#d1d5db',
  activeColor = '#111111',
  proximity = 120,
  speedTrigger = 80,
  shockRadius = 200,
  shockStrength = 3,
  returnDuration = 1.2,
  className = ''
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dotsRef = useRef<Dot[]>([])
  const pointerRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 })

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor])

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const { width, height } = wrap.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')
    if (ctx) ctx.scale(dpr, dpr)

    const cols = Math.floor((width + gap) / (dotSize + gap))
    const rows = Math.floor((height + gap) / (dotSize + gap))
    const cell = dotSize + gap
    const gridW = cell * cols - gap
    const gridH = cell * rows - gap
    const startX = (width - gridW) / 2 + dotSize / 2
    const startY = (height - gridH) / 2 + dotSize / 2

    const dots: Dot[] = []
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        dots.push({ cx: startX + x * cell, cy: startY + y * cell, xOffset: 0, yOffset: 0, _animating: false })
      }
    }
    dotsRef.current = dots
  }, [dotSize, gap])

  useEffect(() => {
    let rafId: number
    const proxSq = proximity * proximity

    const draw = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const { x: px, y: py } = pointerRef.current

      for (const dot of dotsRef.current) {
        const ox = dot.cx + dot.xOffset
        const oy = dot.cy + dot.yOffset
        const dx = dot.cx - px
        const dy = dot.cy - py
        const dsq = dx * dx + dy * dy

        let r = baseRgb.r, g = baseRgb.g, b = baseRgb.b
        if (dsq <= proxSq) {
          const t = 1 - Math.sqrt(dsq) / proximity
          r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t)
          g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t)
          b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t)
        }

        ctx.beginPath()
        ctx.arc(ox, oy, dotSize / 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fill()
      }
      rafId = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafId)
  }, [proximity, baseRgb, activeRgb, dotSize])

  useEffect(() => {
    buildGrid()
    const ro = new ResizeObserver(buildGrid)
    wrapperRef.current && ro.observe(wrapperRef.current)
    return () => ro.disconnect()
  }, [buildGrid])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      const pr = pointerRef.current
      const dt = pr.lastTime ? now - pr.lastTime : 16
      const vx = ((e.clientX - pr.lastX) / dt) * 1000
      const vy = ((e.clientY - pr.lastY) / dt) * 1000
      pr.speed = Math.hypot(vx, vy)
      pr.vx = vx
      pr.vy = vy
      pr.lastTime = now
      pr.lastX = e.clientX
      pr.lastY = e.clientY

      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      pr.x = e.clientX - rect.left
      pr.y = e.clientY - rect.top

      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y)
        if (pr.speed > speedTrigger && dist < proximity && !dot._animating) {
          dot._animating = true
          const pushX = (dot.cx - pr.x) * 0.3 + vx * 0.003
          const pushY = (dot.cy - pr.y) * 0.3 + vy * 0.003
          gsap.to(dot, {
            xOffset: pushX, yOffset: pushY, duration: 0.15, ease: 'power2.out',
            onComplete: () => {
              gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.5)', onComplete: () => { dot._animating = false } })
            }
          })
        }
      }
    }

    const onClick = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      for (const dot of dotsRef.current) {
        const dist = Math.hypot(dot.cx - cx, dot.cy - cy)
        if (dist < shockRadius && !dot._animating) {
          dot._animating = true
          const falloff = Math.max(0, 1 - dist / shockRadius)
          const pushX = (dot.cx - cx) * shockStrength * falloff
          const pushY = (dot.cy - cy) * shockStrength * falloff
          gsap.to(dot, {
            xOffset: pushX, yOffset: pushY, duration: 0.15, ease: 'power2.out',
            onComplete: () => {
              gsap.to(dot, { xOffset: 0, yOffset: 0, duration: returnDuration, ease: 'elastic.out(1,0.5)', onComplete: () => { dot._animating = false } })
            }
          })
        }
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click', onClick)
    }
  }, [speedTrigger, proximity, returnDuration, shockRadius, shockStrength])

  return (
    <div ref={wrapperRef} className={`absolute inset-0 ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}

export default DotGrid
