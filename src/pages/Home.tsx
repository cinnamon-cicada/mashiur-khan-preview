import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import Rabbit from '../components/Rabbit'
import Chat from '../components/Chat'
import Globe from '../components/Globe'
import StarTrail, { type StarTrailHandle } from '../components/StarTrail'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from '../components/Icons'
import { getTimeline } from '../api/mock'
import { contacts, person, places, startup, story, type TimelineEntry } from '../content'
import './home.css'

const reduced = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
const FLIGHT_MS = 2400
// rendered head width (smaller on phones so it clears the credential stack); the head's centre sits at (0.5w, 0.6w)
const RABBIT = typeof window !== 'undefined' && window.innerWidth < 720 ? 96 : 124
// credential slide-in: seconds between letters, between words' first letters, and per-letter duration
const LETTER_STAGGER = 0.045
const WORD_STAGGER = 0.32
const LETTER_MS = 750
// name slide-in: letters emerge from behind a soft, invisible curtain about halfway across the screen,
// the period first and the M last
const CURTAIN_FADE = 50 // px over which the curtain fades from hidden to fully shown
const NAME_STAGGER = 0.055
const NAME_MS = 900

type Pt = { x: number; y: number }
type Geom = { d: string; start: Pt; end: Pt }

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Home() {
  // ---- hero choreography ----
  const [phase, setPhase] = useState<'intro' | 'appear' | 'flight' | 'landed'>(reduced ? 'landed' : 'intro')
  const [progress, setProgress] = useState(reduced ? 1 : 0)
  const [shown, setShown] = useState(reduced) // credentials revealed
  const [geom, setGeom] = useState<Geom | null>(null)
  const [pos, setPos] = useState<Pt | null>(null) // rabbit top-left once landed
  const [flightPt, setFlightPt] = useState<Pt>({ x: -200, y: -200 })
  const [chatOpen, setChatOpen] = useState(false)
  const [excited, setExcited] = useState(false)
  const [nearTop, setNearTop] = useState(true) // greeting bubble only shows on the hero

  const heroRef = useRef<HTMLElement>(null)
  const founderRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  // pad: how far the name's mask box reaches left to the curtain; dist: how far each letter starts behind it
  const [nameGeo, setNameGeo] = useState<{ pad: number; dist: number } | null>(null)
  const [nameIn, setNameIn] = useState(reduced)
  const pathRef = useRef<SVGPathElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const trail = useRef<StarTrailHandle>(null)

  // Scrolling away from the hero pushes the name (and bridge) off to the right and the credentials off
  // to the left, in step with the page position: fully gone once the hero has scrolled 80% out of view.
  const { scrollY } = useScroll()
  const exit = (v: number) => Math.min(1, Math.max(0, v / (window.innerHeight * 0.8)))
  const nameX = useTransform(scrollY, (v) => `${exit(v) * 100}vw`)
  const credsX = useTransform(scrollY, (v) => `${-exit(v) * 100}vw`)

  // Parabolic leap: from low on the left (where the credentials will appear), high up over the page,
  // down to the bottom-right corner.
  const measure = useCallback(() => {
    const w = window.innerWidth, h = window.innerHeight
    const r = founderRef.current?.getBoundingClientRect()
    if (!r) return
    const narrow = w < 720
    const start = { x: narrow ? 70 : Math.max(70, w * 0.15), y: r.bottom + window.scrollY + (narrow ? 30 : 50) }
    const end = { x: w - Math.max(70, w * 0.075), y: h - (narrow ? 96 : 130) }
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

  // The curtain sits at 50vw, or just left of the name when the name is wider than half the screen (phones).
  useLayoutEffect(() => {
    const place = () => {
      const h = nameRef.current
      if (!h) return
      const pad = parseFloat(h.style.paddingLeft) || 0
      const r = h.getBoundingClientRect()
      const left = r.left + pad, right = r.right
      const curtain = Math.min(window.innerWidth * 0.5, left - 24)
      setNameGeo({ pad: left - curtain + CURTAIN_FADE, dist: right - curtain + CURTAIN_FADE })
    }
    place()
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [])

  useEffect(() => {
    if (!nameGeo || nameIn) return
    const t = setTimeout(() => setNameIn(true), 250)
    return () => clearTimeout(t)
  }, [nameGeo, nameIn])

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
        trail.current?.push(p.x, p.y - window.scrollY)
      }
      setProgress(e)
      if (t < 1) raf = requestAnimationFrame(tick)
      else setPhase('landed')
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // As soon as the rabbit takes off, the credentials slide in letter by letter, bottom word first.
  useEffect(() => {
    if (phase === 'flight') setShown(true)
  }, [phase])

  useEffect(() => {
    const onScroll = () => setNearTop(window.scrollY < window.innerHeight * 0.4)
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
    trail.current?.push(x + RABBIT * 0.5, y + RABBIT * 0.6)
  }
  const onRabbitUp = (e: React.PointerEvent) => {
    const d = dragState.current
    dragState.current = null
    if (d && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) < 5) setChatOpen((o) => !o)
  }

  return (
    <main className="home">
      <section className="hero" ref={heroRef}>
        <motion.div
          className="name-wrap"
          style={{ x: nameX }}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <img className="bridge" src="/img/bridge-gold.png" alt="" aria-hidden="true" />
          <h1
            className="name metal-letters"
            ref={nameRef}
            aria-label={`${person.name}.`}
            style={nameGeo ? ({ paddingLeft: nameGeo.pad, marginLeft: -nameGeo.pad, '--curtain': `${CURTAIN_FADE}px` } as React.CSSProperties) : undefined}
          >
            {[...`${person.name.toUpperCase()}.`].map((ch, j) => (
              <span key={j} className="name-slot" style={{ '--i': j } as React.CSSProperties} aria-hidden="true">
                <motion.span
                  className="m-letter"
                  initial={false}
                  animate={nameIn ? { x: 0, opacity: 1 } : { x: -(nameGeo?.dist ?? 2000), opacity: 0 }}
                  transition={nameIn ? { duration: NAME_MS / 1000, ease: [0.2, 0.8, 0.2, 1], delay: (person.name.length - j) * NAME_STAGGER } : { duration: 0 }}
                >
                  {ch === ' ' ? '\u00a0' : ch}
                </motion.span>
              </span>
            ))}
          </h1>
        </motion.div>

        <motion.div className="creds" style={{ x: credsX }}>
          {person.credentials.map((c, i) => {
            // letters fly in from the right edge of the screen, leading letter first, like a train pulling in.
            // bottom word starts first; each word's lead letter lags the one below it
            const t0 = (person.credentials.length - 1 - i) * WORD_STAGGER
            const letters = [...c.toUpperCase()]
            const done = t0 + (letters.length - 1) * LETTER_STAGGER + LETTER_MS / 1000
            return (
              <div key={c} className="cred" ref={i === 0 ? founderRef : undefined} aria-label={c}>
                <span className="cred-word metal-letters" aria-hidden="true">
                  <span className="cred-tall">
                    {letters.map((ch, j) => (
                      // --i lives on a plain wrapper: framer won't animate an element whose style carries a CSS variable
                      <span key={j} className="cred-slot" style={{ '--i': j } as React.CSSProperties}>
                      <motion.span
                        className="cred-letter m-letter"
                        initial={false}
                        animate={shown ? { opacity: 1, x: 0 } : { opacity: 0, x: '100vw' }}
                        transition={shown ? { duration: LETTER_MS / 1000, ease: [0.2, 0.8, 0.2, 1], delay: t0 + j * LETTER_STAGGER } : { duration: 0 }}
                      >
                        {ch}
                      </motion.span>
                      </span>
                    ))}
                  </span>
                </span>
                {/* tapered dash: heavy at the foot, hairline at the tip, drawn bottom-up once the word is in */}
                <motion.svg
                  className="dash"
                  viewBox="0 0 40 64"
                  aria-hidden="true"
                  initial={false}
                  animate={{ clipPath: shown ? 'inset(0% 0% 0% 0%)' : 'inset(100% 0% 0% 0%)' }}
                  transition={{ duration: 0.26, delay: shown ? done : 0, ease: 'easeOut' }}
                >
                  <path d="M2.5 58.5 C1.6 61.6 3.4 63.5 6.6 63.5 L13.4 63.5 C16.2 63.5 17.4 62 18.2 59.6 L37.6 3.2 C38 1.8 36.6 1.2 35.9 2.4 Z" />
                </motion.svg>
                {shown && i === person.credentials.length - 1 && (
                  <motion.a
                    href="#story"
                    className="chevron"
                    aria-label="Scroll to story"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 * WORD_STAGGER + 1.2 }}
                  >
                    <svg viewBox="0 0 24 14" aria-hidden="true"><path d="M2 2l10 10L22 2" /></svg>
                  </motion.a>
                )}
              </div>
            )
          })}
        </motion.div>

        {/* shared brushed-gold fill for the dashes */}
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
          <defs>
            <linearGradient id="gold-metal" x1="0" y1="1" x2="0.4" y2="0">
              <stop offset="0" stopColor="#9a7023" />
              <stop offset=".35" stopColor="#f8dd95" />
              <stop offset=".6" stopColor="#c8963a" />
              <stop offset="1" stopColor="#ffecb0" />
            </linearGradient>
          </defs>
        </svg>

        {geom && (
          <svg className="arc" aria-hidden="true">
            <path ref={pathRef} d={geom.d} fill="none" />
          </svg>
        )}
      </section>

      <Story />
      <Cta linkRef={linkRef} onNear={setExcited} />

      <StarTrail ref={trail} />
      <div
        className={`robbit ${rabbitXY.x + RABBIT / 2 > window.innerWidth / 2 ? 'on-right' : ''} ${phase === 'intro' ? 'is-hidden' : ''} ${phase === 'landed' ? 'is-landed' : ''} ${phase === 'landed' && !pos ? 'hop' : ''}`}
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
        <motion.p className="story-punch metal" initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.25 }}>
          {story[1].replace(/SF\.$/, '')}<em className="metal-gold">SF.</em>
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
      <p className="cta-kicker">Check it out:</p>
      <a
        ref={linkRef}
        className="cta-link metal-gold"
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
