import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useAnimationControls, useInView } from 'framer-motion'
import Rabbit from '../components/Rabbit'
import Chat from '../components/Chat'
import Globe from '../components/Globe'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from '../components/Icons'
import { getTimeline } from '../api/mock'
import { contacts, person, places, startup, story, type TimelineEntry } from '../content'
import './home.css'

const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const FLIGHT_MS = 2400
// rendered head width (smaller on phones so it clears the credential stack); the head's centre sits at (0.5w, 0.6w)
const RABBIT = typeof window !== 'undefined' && window.innerWidth < 720 ? 96 : 124
const ARC_TEXT = 'building khanflow.com ↗'
const ARC_TEXT_OFFSET = 170 // px from the landing spot along the arc (desktop)
const ARC_TEXT_RISE_NARROW = -13 // phones: negative = rotated 13° clockwise (slopes down as it reads), top-right of the band between name and FOUNDER
const NARROW_UNLOCK = [0.06, 0.4] // phones: share of the flight over which letters unlock
const ARC_TEXT_TILT = 15 // degrees clockwise, to sit closer to the leap's line

type Pt = { x: number; y: number }
type Geom = { d: string; start: Pt; end: Pt }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Home() {
  // ---- hero choreography ----
  const [phase, setPhase] = useState<'intro' | 'appear' | 'flight' | 'landed'>(reduced ? 'landed' : 'intro')
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [shown, setShown] = useState(reduced ? 1 : 0) // credentials revealed
  const [geom, setGeom] = useState<Geom | null>(null)
  const [len, setLen] = useState(0)
  const [unlockAt, setUnlockAt] = useState<number[]>([])
  const [textArc, setTextArc] = useState<{ d: string; seg: number; mid: Pt; offset: number; tilt: number; narrow: boolean } | null>(null)
  const [pos, setPos] = useState<Pt | null>(null) // rabbit top-left once landed
  const [flightPt, setFlightPt] = useState<Pt>({ x: -200, y: -200 })
  const [chatOpen, setChatOpen] = useState(false)
  const [excited, setExcited] = useState(false)
  const scrolled = useRef(false)
  const [cascade, setCascade] = useState(false) // scrolling reveals the rest one after another
  const [nearTop, setNearTop] = useState(true) // greeting bubble only shows on the hero

  const heroRef = useRef<HTMLElement>(null)
  const founderRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const shake = useAnimationControls()

  // Parabolic leap: from low beside FOUNDER, high up over the page, down to the bottom-left corner.
  const measure = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight
    const r = founderRef.current?.getBoundingClientRect()
    if (!r) return
    const narrow = w < 720
    const start = { x: Math.min(r.right + (narrow ? 10 : 60), w - 70), y: r.bottom + window.scrollY + (narrow ? 30 : 50) }
    const end = { x: Math.max(70, w * 0.075), y: h - (narrow ? 96 : 130) }
    // Quadratic Bézier = true parabola. Pick the control point so the apex sits at `apex`.
    const apex = Math.max(70, h * 0.09)
    const c = { x: (start.x + end.x) / 2, y: apex - Math.sqrt((apex - start.y) * (apex - end.y)) }
    setGeom({
      d: `M${start.x} ${start.y} Q${c.x} ${c.y} ${end.x} ${end.y}`,
      start,
      end,
    })
  }, [])

  useLayoutEffect(() => {
    history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    measure()
    const onResize = () => { measure(); setPos(null) }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [measure])

  // Desktop: the arc text gets its own, more bowed path — a chord across the landing leg of the
  // flight, pushed further out in the direction the flight path already bulges, then tilted.
  // Phones: there's no room beside the credentials, so it rides a gentle, nearly level bow above them.
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!geom || !path) return
    const L = path.getTotalLength()
    setLen(L)
    const narrow = window.innerWidth < 720
    const fs = narrow ? 15 : Math.min(28, Math.max(20, window.innerWidth * 0.019)) // matches .arc-text
    const seg = ARC_TEXT.length * fs * 0.66

    if (narrow) {
      const r = founderRef.current?.getBoundingClientRect()
      const n = nameRef.current?.getBoundingClientRect()
      if (!r || !n) return
      const rad = (ARC_TEXT_RISE_NARROW * Math.PI) / 180
      const chord = seg * 0.97
      const bow = chord * 0.1 // arches outward: the middle bulges up, away from the credentials
      // centre the lettering in the band between the name and FOUNDER; glyphs sit ~20px above the
      // path (dy + ascent) and the arch lifts the middle by about half its height
      const band = (n.bottom + r.top) / 2 + window.scrollY
      const dx = (chord / 2) * Math.cos(rad), dy = (chord / 2) * Math.sin(rad)
      // pushed right: the text's end sits just inside the right edge
      const mid = { x: window.innerWidth - 36 - dx, y: band + 20 + bow / 2 }
      const a = { x: mid.x - dx, y: mid.y + dy }
      const b = { x: mid.x + dx, y: mid.y - dy }
      const c = { x: mid.x - Math.sin(rad) * bow * 2, y: mid.y - Math.cos(rad) * bow * 2 }
      setTextArc({ d: `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`, seg, mid, offset: 0, tilt: 0, narrow })
      return
    }

    const a = path.getPointAtLength(L - ARC_TEXT_OFFSET)
    const b = path.getPointAtLength(L - ARC_TEXT_OFFSET - seg)
    const m = path.getPointAtLength(L - ARC_TEXT_OFFSET - seg / 2)
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    const chord = Math.hypot(b.x - a.x, b.y - a.y)
    let nx = m.x - mid.x, ny = m.y - mid.y
    const n = Math.hypot(nx, ny)
    if (n < 1) { nx = b.y - a.y; ny = a.x - b.x } // fallback: left of the reading direction
    const k = (0.5 * chord) / (n < 1 ? chord : n)
    const c = { x: mid.x + nx * k, y: mid.y + ny * k }
    setTextArc({ d: `M${a.x} ${a.y} Q${c.x} ${c.y} ${b.x} ${b.y}`, seg, mid, offset: ARC_TEXT_OFFSET, tilt: ARC_TEXT_TILT, narrow })
  }, [geom])

  // Forward flight distance at which each letter unlocks (mapped from its spot on the text arc).
  useLayoutEffect(() => {
    if (!textArc || !len) return
    const compute = () => {
      const t = textRef.current
      const arc = document.getElementById('arc-text-path') as SVGPathElement | null
      if (!t || !arc) return
      const arcLen = arc.getTotalLength()
      const [p0, p1] = NARROW_UNLOCK
      setUnlockAt([...ARC_TEXT].map((_, i) => {
        // phones right-align the lettering to the path's end, so it starts after the slack
        const lead = textArc.narrow ? arcLen - t.getComputedTextLength() : 0
        const f = (lead + t.getSubStringLength(0, i + 1)) / arcLen
        // phones: the rabbit crosses the text right-to-left on its way up, so the end unlocks first
        return textArc.narrow ? len * (p0 + (1 - f) * (p1 - p0)) : len - textArc.offset - f * textArc.seg + 20
      }))
    }
    compute()
    document.fonts?.ready.then(compute)
  }, [textArc, len])

  // Name fades in, the rabbit fades in at the launch spot, then it leaps.
  useEffect(() => {
    if (reduced) return
    const a = setTimeout(() => setPhase('appear'), 500)
    const b = setTimeout(() => setPhase('flight'), 1200)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [])

  useEffect(() => {
    if (phase !== 'flight') return
    let raf = 0
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / FLIGHT_MS)
      const e = easeInOut(t)
      const path = pathRef.current
      if (path) {
        const p = path.getPointAtLength(e * path.getTotalLength())
        setFlightPt({ x: p.x - RABBIT * 0.5, y: p.y - RABBIT * 0.6 })
      }
      setProgress(e)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setPhase('landed')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // After the hop: FOUNDER slams in (or everything, if they already scrolled).
  useEffect(() => {
    if (phase !== 'landed' || reduced) return
    const t = setTimeout(() => { setShown(1); if (scrolled.current) setCascade(true) }, 450)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (!cascade || shown < 1 || shown >= 3) return
    const t = setTimeout(() => setShown((s) => Math.min(3, s + 1)), 550)
    return () => clearTimeout(t)
  }, [cascade, shown])

  useEffect(() => {
    if (shown > 0 && !reduced) shake.start({ x: [0, -7, 6, -3, 0], y: [0, 4, -3, 1, 0], transition: { duration: 0.32, delay: 0.12 } })
  }, [shown, shake])

  // A nudge of scroll reveals the rest of the credentials, one after another.
  useEffect(() => {
    const onScroll = () => {
      setNearTop(window.scrollY < window.innerHeight * 0.4)
      if (window.scrollY < 8) return
      scrolled.current = true
      setCascade(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Rabbit gets excited when the pointer is on or near the khanflow link.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const r = linkRef.current?.getBoundingClientRect()
      if (!r) return
      const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right)
      const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom)
      setExcited(Math.hypot(dx, dy) < 140)
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  // ---- rabbit placement: on the arc while flying, then fixed + draggable ----
  const landedXY = geom ? { x: geom.end.x - RABBIT * 0.5, y: geom.end.y - RABBIT * 0.6 } : flightPt
  const launchXY = geom ? { x: geom.start.x - RABBIT * 0.5, y: geom.start.y - RABBIT * 0.6 } : flightPt
  const rabbitXY: Pt = phase === 'landed' ? (pos ?? landedXY) : phase === 'flight' && progress > 0 ? flightPt : launchXY
  const spin = phase === 'landed' ? 0 : progress * 1800

  const dragState = useRef<{ dx: number; dy: number; sx: number; sy: number } | null>(null)
  const onRabbitDown = (e: React.PointerEvent) => {
    if (phase !== 'landed') return
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    dragState.current = { dx: e.clientX - rabbitXY.x, dy: e.clientY - rabbitXY.y, sx: e.clientX, sy: e.clientY }
  }
  const onRabbitMove = (e: React.PointerEvent) => {
    const d = dragState.current
    if (!d) return
    const x = Math.min(Math.max(e.clientX - d.dx, -20), window.innerWidth - RABBIT + 20)
    const y = Math.min(Math.max(e.clientY - d.dy, 0), window.innerHeight - RABBIT)
    setPos({ x, y })
  }
  const onRabbitUp = (e: React.PointerEvent) => {
    const d = dragState.current
    dragState.current = null
    if (d && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) setChatOpen((o) => !o)
  }

  const travelled = progress * len

  return (
    <main className="home">
      <motion.section
        className="hero"
        ref={heroRef}
        animate={shake}
      >
        <motion.div
          className="name-wrap"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <img className="bridge" src="/img/bridge-gold.png" alt="" aria-hidden="true" />
          <h1 className="name" ref={nameRef}>{person.name.toUpperCase()}.</h1>
        </motion.div>

        <div className="creds">
          {person.credentials.map((c, i) => (
            <div key={c} className="cred" ref={i === 0 ? founderRef : undefined} aria-hidden={shown <= i}>
              <motion.span
                className="cred-word"
                initial={false}
                animate={shown > i ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 2.4, y: -40 }}
                transition={shown > i ? { type: 'spring', stiffness: 700, damping: 22, mass: 0.9 } : { duration: 0 }}
              >
                <span className="cred-tall">{c.toUpperCase()}</span>
              </motion.span>
              {/* tapered dash: heavy at the foot, hairline at the tip, drawn bottom-up */}
              <motion.svg
                className="dash"
                viewBox="0 0 40 64"
                aria-hidden="true"
                initial={false}
                animate={{ clipPath: shown > i ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
                transition={{ duration: 0.26, delay: shown > i ? 0.3 : 0, ease: 'easeOut' }}
              >
                <path d="M2.5 58.5 C1.6 61.6 3.4 63.5 6.6 63.5 L13.4 63.5 C16.2 63.5 17.4 62 18.2 59.6 L37.6 3.2 C38 1.8 36.6 1.2 35.9 2.4 Z" />
              </motion.svg>
              {shown === i + 1 && i < 2 && (
                <motion.p className="press-key" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i === 0 ? 1.1 : 0.4 }}>
                  Scroll
                </motion.p>
              )}
              {shown === i + 1 && (
                <motion.a
                  href="#story"
                  className="chevron"
                  aria-label="Scroll to story"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <svg viewBox="0 0 24 14" aria-hidden="true"><path d="M2 2l10 10L22 2" /></svg>
                </motion.a>
              )}
            </div>
          ))}
        </div>

        {geom && (
          <svg className="arc" aria-hidden="true">
            <path ref={pathRef} d={geom.d} fill="none" />
            {textArc && <path id="arc-text-path" d={textArc.d} fill="none" transform={`rotate(${textArc.tilt} ${textArc.mid.x} ${textArc.mid.y})`} />}
          </svg>
        )}
        {textArc && (
          <a className="arc-link" href={startup.url} target="_blank" rel="noreferrer" aria-label="khanflow.com">
            <svg className="arc arc-text-layer" aria-hidden="true">
              <text ref={textRef} className="arc-text" dy="-16">
                <textPath href="#arc-text-path" {...(textArc.narrow ? { startOffset: '100%', textAnchor: 'end' } : {})}>
                  {[...ARC_TEXT].map((ch, i) => (
                    <tspan key={i} className={travelled >= (unlockAt[i] ?? Infinity) ? 'on' : ''}>{ch}</tspan>
                  ))}
                </textPath>
              </text>
            </svg>
          </a>
        )}
      </motion.section>

      <Story />
      <Cta linkRef={linkRef} onNear={setExcited} />

      <div
        className={`robbit ${phase === 'intro' ? 'is-hidden' : ''} ${phase === 'landed' ? 'is-landed' : ''} ${phase === 'landed' && !pos ? 'hop' : ''}`}
        style={{ left: rabbitXY.x, top: rabbitXY.y, width: RABBIT }}
      >
        {phase === 'landed' && (chatOpen || nearTop) && <Chat open={chatOpen} onClose={() => setChatOpen(false)} onPeek={() => setChatOpen(true)} />}
        <div
          className="robbit-handle"
          style={{ transform: `rotate(${spin}deg)` }}
          onPointerDown={onRabbitDown}
          onPointerMove={onRabbitMove}
          onPointerUp={onRabbitUp}
          role={phase === 'landed' ? 'button' : undefined}
          tabIndex={phase === 'landed' ? 0 : -1}
          aria-label="Robbit. Drag me around, or click to chat."
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setChatOpen((o) => !o) } }}
        >
          <Rabbit size={RABBIT} flying={phase === 'flight'} landed={phase === 'landed'} excited={excited} />
        </div>
      </div>
    </main>
  )
}

function Story() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.3, once: true })
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => { getTimeline().then(setEntries) }, [])

  return (
    <section className="story" id="story" ref={ref}>
      <div className="story-left">
        <motion.p className="story-lead" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}>
          {story[0]}
        </motion.p>
        <motion.p className="story-punch" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.25 }}>
          {story[1].replace(/SF\.$/, '')}<em>SF.</em>
        </motion.p>

        <ol className="timeline">
          {entries.map((e, i) => {
            const place = places.find((p) => p.id === e.place)
            const state = active ? (active === e.place ? 'is-hit' : 'is-dim') : ''
            return (
              <motion.li
                key={e.id}
                className={state}
                initial={{ opacity: 0, x: -10 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.7 + i * 0.35 }}
                onPointerEnter={() => setActive(e.place)}
                onPointerLeave={() => setActive(null)}
              >
                <span className="tl-year">{e.year}</span>
                <span className="tl-place">{place?.name}</span>
                <span className="tl-title">{e.link ? <a href={e.link} target="_blank" rel="noreferrer">{e.title}</a> : e.title}</span>
                <span className="tl-desc">{e.description}</span>
              </motion.li>
            )
          })}
        </ol>
        <p className="tl-source">Timeline: sample data, pending LinkedIn sync</p>
      </div>

      <div className="story-right">
        <div className="globe-wrap">
          <Globe places={places} active={active} onActive={setActive} blurred={!inView} />
          <p className="globe-hint">Drag to spin · hover a pin</p>
        </div>
      </div>
    </section>
  )
}

function Cta({ linkRef, onNear }: { linkRef: React.RefObject<HTMLAnchorElement | null>; onNear: (v: boolean) => void }) {
  const links = [
    { label: 'Email', href: `mailto:${contacts.email}`, icon: <MailIcon /> },
    { label: 'Phone', href: `tel:${contacts.phone.replace(/[^+\d]/g, '')}`, icon: <PhoneIcon /> },
    { label: 'LinkedIn', href: contacts.linkedin, icon: <LinkedInIcon /> },
    { label: 'GitHub', href: contacts.github, icon: <GitHubIcon /> },
  ]
  return (
    <section className="cta">
      <p className="cta-kicker">Check out the startup here:</p>
      <a
        ref={linkRef}
        className="cta-link"
        href={startup.url}
        target="_blank"
        rel="noreferrer"
        onFocus={() => onNear(true)}
        onBlur={() => onNear(false)}
      >
        KHANFLOW.COM
      </a>
      <p className="cta-tagline">{startup.tagline}</p>

      <ul className="contacts">
        {links.map((l) => (
          <li key={l.label}>
            <a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label}>
              {l.icon}
              <span>{l.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
