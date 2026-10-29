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
const touch = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches
const FLIGHT_MS = 2400
const RABBIT = 124 // rendered head width; the head's centre sits at (0.5w, 0.6w)
const ARC_TEXT = 'building khanflow.com ↗'
const ARC_TEXT_OFFSET = 150 // px from the landing spot along the arc

type Pt = { x: number; y: number }
type Geom = { d: string; dRev: string; end: Pt }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Home() {
  // ---- hero choreography ----
  const [phase, setPhase] = useState<'intro' | 'flight' | 'landed'>(reduced ? 'landed' : 'intro')
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [shown, setShown] = useState(reduced ? 1 : 0) // credentials revealed
  const [geom, setGeom] = useState<Geom | null>(null)
  const [len, setLen] = useState(0)
  const [unlockAt, setUnlockAt] = useState<number[]>([])
  const [pos, setPos] = useState<Pt | null>(null) // rabbit top-left once landed
  const [flightPt, setFlightPt] = useState<Pt>({ x: -200, y: -200 })
  const [chatOpen, setChatOpen] = useState(false)
  const [excited, setExcited] = useState(false)
  const scrolled = useRef(false)
  const [nearTop, setNearTop] = useState(true) // greeting bubble only shows on the hero

  const heroRef = useRef<HTMLElement>(null)
  const founderRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const textRef = useRef<SVGTextElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const shake = useAnimationControls()

  // Arc: from just right of FOUNDER, up and over to the left, down to the bottom-left corner.
  const measure = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight
    const r = founderRef.current?.getBoundingClientRect()
    const n = nameRef.current?.getBoundingClientRect()
    if (!r || !n) return
    const narrow = w < 720
    const start = { x: Math.min(r.right + (narrow ? 10 : 70), w - 60), y: r.top + window.scrollY - (narrow ? 40 : 10) }
    const end = { x: Math.max(70, w * 0.075), y: h - (narrow ? 110 : 130) }
    // apex clears the name: the curve peaks ~3/4 of the way to its control points
    const top = n.bottom + window.scrollY + 24
    const cy = start.y - (start.y - top) / 0.75
    const c1 = { x: start.x - w * 0.04, y: cy }
    const c2 = { x: Math.max(30, w * 0.06), y: cy }
    setGeom({
      d: `M${start.x} ${start.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${end.x} ${end.y}`,
      dRev: `M${end.x} ${end.y} C${c2.x} ${c2.y} ${c1.x} ${c1.y} ${start.x} ${start.y}`,
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

  // Path length + the forward distance at which each arc letter unlocks.
  useLayoutEffect(() => {
    if (!geom || !pathRef.current) return
    const L = pathRef.current.getTotalLength()
    setLen(L)
    const compute = () => {
      const t = textRef.current
      if (!t) return
      setUnlockAt([...ARC_TEXT].map((_, i) => L - (ARC_TEXT_OFFSET + t.getSubStringLength(0, i + 1)) + 20))
    }
    compute()
    document.fonts?.ready.then(compute)
  }, [geom])

  // Name fades in, then the flight.
  useEffect(() => {
    if (reduced) return
    const t = setTimeout(() => setPhase('flight'), 900)
    return () => clearTimeout(t)
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
    const t = setTimeout(() => setShown(scrolled.current ? 3 : 1), 450)
    return () => clearTimeout(t)
  }, [phase])

  useEffect(() => {
    if (shown > 0 && !reduced) shake.start({ x: [0, -7, 6, -3, 0], y: [0, 4, -3, 1, 0], transition: { duration: 0.32, delay: 0.12 } })
  }, [shown, shake])

  // Any key → next credential. Scrolling → all of them.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target
      if ((el instanceof Element && el.closest('input, textarea, [contenteditable]')) || e.metaKey || e.ctrlKey || e.altKey) return
      if (['Tab', 'Shift', 'Meta', 'Control', 'Alt'].includes(e.key)) return
      setShown((s) => (s >= 1 && s < 3 ? s + 1 : s))
    }
    const onScroll = () => {
      setNearTop(window.scrollY < window.innerHeight * 0.4)
      if (window.scrollY < 40) return
      scrolled.current = true
      setShown((s) => (s >= 1 ? 3 : s))
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('scroll', onScroll) }
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
  const rabbitXY: Pt = phase === 'landed' ? (pos ?? landedXY) : flightPt
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
        onClick={(e) => { if (!(e.target as HTMLElement).closest('a, button')) setShown((s) => (s >= 1 && s < 3 ? s + 1 : s)) }}
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
                {c.toUpperCase()}
              </motion.span>
              <svg className="check" viewBox="0 0 40 64" aria-hidden="true">
                <motion.path
                  d="M4 40 L13 58 L36 4"
                  initial={false}
                  animate={{ pathLength: shown > i ? 1 : 0, opacity: shown > i ? 1 : 0 }}
                  transition={{ duration: 0.28, delay: shown > i ? 0.3 : 0, ease: 'easeIn' }}
                />
              </svg>
              {shown === i + 1 && i < 2 && (
                <motion.p className="press-key" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i === 0 ? 1.1 : 0.4 }}>
                  {touch ? 'Tap or scroll' : 'Press any key'}
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
            <defs>
              <mask id="travelled" maskUnits="userSpaceOnUse">
                <path d={geom.d} stroke="#fff" strokeWidth="14" fill="none" strokeDasharray={`${len} ${len}`} strokeDashoffset={len - travelled} />
              </mask>
              <marker id="arrowhead" viewBox="0 0 12 12" refX="8" refY="6" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                <path d="M1 1 L9 6 L1 11" fill="none" stroke="var(--silver-deep)" strokeWidth="1.6" strokeLinecap="round" />
              </marker>
            </defs>
            <path ref={pathRef} d={geom.d} className="arc-line" mask="url(#travelled)" markerEnd="url(#arrowhead)" />
            <path id="arc-rev" d={geom.dRev} fill="none" />
          </svg>
        )}
        {geom && (
          <a className="arc-link" href={startup.url} target="_blank" rel="noreferrer" aria-label="khanflow.com">
            <svg className="arc arc-text-layer" aria-hidden="true">
              <text ref={textRef} className="arc-text" dy="-12">
                <textPath href="#arc-rev" startOffset={ARC_TEXT_OFFSET}>
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
        className={`robbit ${phase === 'landed' ? 'is-landed' : ''} ${phase === 'landed' && !pos ? 'hop' : ''}`}
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
        <Globe places={places} active={active} onActive={setActive} blurred={!inView} />
        <p className="globe-hint">Drag to spin · hover a pin</p>
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
