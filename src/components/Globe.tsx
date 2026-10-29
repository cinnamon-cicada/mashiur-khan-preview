import { useEffect, useMemo, useRef, useState } from 'react'
import { geoDistance, geoGraticule10, geoOrthographic, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology, GeometryCollection } from 'topojson-specification'
import world from 'world-atlas/countries-110m.json'
import type { Place } from '../content'

const land = feature(world as unknown as Topology, (world as unknown as Topology).objects.countries as GeometryCollection)
const graticule = geoGraticule10()

type Props = {
  places: Place[]
  active: string | null
  onActive: (id: string | null) => void
  blurred: boolean
  size?: number
}

// Drag-to-rotate orthographic globe. Idles with a slow spin until touched or hovered.
export default function Globe({ places, active, onActive, blurred, size = 900 }: Props) {
  const [rotate, setRotate] = useState<[number, number]>([60, -22])
  const drag = useRef<{ x: number; y: number; r: [number, number] } | null>(null)
  const idle = useRef(true)

  const projection = useMemo(
    () => geoOrthographic().scale(size / 2 - 8).translate([size / 2, size / 2]).rotate(rotate).clipAngle(90),
    [rotate, size],
  )
  const path = geoPath(projection)

  useEffect(() => {
    if (blurred || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const tick = () => {
      if (idle.current && !active) setRotate(([l, p]) => [l + 0.08, p])
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [blurred, active])

  const onDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, r: rotate }
    idle.current = false
  }
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d) return
    const k = 180 / size
    setRotate([d.r[0] + (e.clientX - d.x) * k, Math.max(-85, Math.min(85, d.r[1] - (e.clientY - d.y) * k))])
  }
  const onUp = () => { drag.current = null; setTimeout(() => (idle.current = true), 2500) }

  const center: [number, number] = [-rotate[0], -rotate[1]]

  return (
    <div className={`globe ${blurred ? 'is-blurred' : ''}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Globe with pins for each city in the timeline. Drag to rotate."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <defs>
          <filter id="rim-glow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <radialGradient id="ocean" cx="38%" cy="32%" r="75%">
            <stop offset="0" stopColor="#14213d" />
            <stop offset="1" stopColor="#070c18" />
          </radialGradient>
          {/* brushed silver continents, lit from the upper left */}
          <linearGradient id="land-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2f4f8" />
            <stop offset=".3" stopColor="#aab1be" />
            <stop offset=".55" stopColor="#e3e7ee" />
            <stop offset="1" stopColor="#6f7787" />
          </linearGradient>
        </defs>
        <path d={path({ type: 'Sphere' }) ?? ''} fill="url(#ocean)" stroke="#c9ced6" strokeWidth="2.5" filter="url(#rim-glow)" />
        <path d={path(graticule) ?? ''} fill="none" stroke="#1d2a44" strokeWidth=".7" />
        <path d={path(land) ?? ''} fill="url(#land-metal)" stroke="#0a1122" strokeWidth=".5" />
        {places.map((p) => {
          if (geoDistance(p.coords, center) > Math.PI / 2 - 0.08) return null
          const [x, y] = projection(p.coords) ?? [0, 0]
          const on = active === p.id
          return (
            <g
              key={p.id}
              className={`pin ${on ? 'is-on' : ''}`}
              transform={`translate(${x} ${y})`}
              onPointerEnter={() => onActive(p.id)}
              onPointerLeave={() => onActive(null)}
              onFocus={() => onActive(p.id)}
              onBlur={() => onActive(null)}
              tabIndex={0}
              role="button"
              aria-label={p.name}
            >
              <circle className="pin-pulse" r="14" />
              <circle r="16" fill="transparent" />
              <circle className="pin-dot" r={on ? 7 : 5.5} />
              {on && <text className="pin-label" x="12" y="-10">{p.name}</text>}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
