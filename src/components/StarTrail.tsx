import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export type StarTrailHandle = { push: (x: number, y: number) => void }

const LIFE_MS = 3200 // how long a spark lingers before it has fully faded

type Spark = { x: number; y: number; t: number; r: number }

// A shooting-star tail: every point the rabbit passes leaves a soft gold-silver glow that
// hangs in the air for a few seconds and then slowly fades. Drawn on a fixed canvas behind the rabbit.
const StarTrail = forwardRef<StarTrailHandle>(function StarTrail(_, ref) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const sparks = useRef<Spark[]>([])
  const raf = useRef(0)
  const last = useRef<{ x: number; y: number } | null>(null)

  const draw = () => {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    const now = performance.now()
    sparks.current = sparks.current.filter((s) => now - s.t < LIFE_MS)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.globalCompositeOperation = 'lighter'
    const dpr = window.devicePixelRatio || 1
    for (const s of sparks.current) {
      const life = 1 - (now - s.t) / LIFE_MS
      const a = life * life // eases out slowly
      const r = s.r * (0.35 + 0.65 * life) * dpr
      const g = ctx.createRadialGradient(s.x * dpr, s.y * dpr, 0, s.x * dpr, s.y * dpr, r)
      g.addColorStop(0, `rgba(255, 244, 214, ${0.55 * a})`)
      g.addColorStop(0.35, `rgba(240, 200, 110, ${0.28 * a})`)
      g.addColorStop(1, 'rgba(201, 206, 214, 0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(s.x * dpr, s.y * dpr, r, 0, Math.PI * 2)
      ctx.fill()
    }
    raf.current = sparks.current.length ? requestAnimationFrame(draw) : 0
  }

  useImperativeHandle(ref, () => ({
    push(x, y) {
      // fill gaps between frames so fast movement still leaves a continuous tail
      const p = last.current
      const now = performance.now()
      const steps = p ? Math.max(1, Math.ceil(Math.hypot(x - p.x, y - p.y) / 8)) : 1
      for (let i = 1; i <= steps; i++) {
        const k = i / steps
        sparks.current.push({ x: p ? p.x + (x - p.x) * k : x, y: p ? p.y + (y - p.y) * k : y, t: now, r: 26 + Math.random() * 10 })
      }
      last.current = { x, y }
      if (!raf.current) raf.current = requestAnimationFrame(draw)
    },
  }))

  // a pause in movement starts a fresh tail instead of bridging the gap
  useEffect(() => {
    const id = setInterval(() => { last.current = null }, 400)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const size = () => {
      const c = canvas.current
      if (!c) return
      const dpr = window.devicePixelRatio || 1
      c.width = window.innerWidth * dpr
      c.height = window.innerHeight * dpr
    }
    size()
    window.addEventListener('resize', size)
    return () => { window.removeEventListener('resize', size); cancelAnimationFrame(raf.current) }
  }, [])

  return <canvas className="star-trail" ref={canvas} aria-hidden="true" />
})

export default StarTrail
