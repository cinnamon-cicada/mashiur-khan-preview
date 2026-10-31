import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import Rabbit from '../components/Rabbit'
import Chat from '../components/Chat'
import { GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon } from '../components/Icons'
import { getTimeline } from '../api/mock'
import { contacts, person, places, startup, story, type TimelineEntry } from '../content'
import './sf.css'

// Everything animates inside this band of the screen. It's inset so blocks leave while still visible.
const BAND = '-10% 0px -10% 0px'
const EASE = [0.2, 0.8, 0.2, 1] as const

// Slides in from the side one letter at a time as it enters the band, with the letter nearest the
// incoming side leading, and back out as it leaves.
// Words stay unbroken so lines wrap normally, and a long line takes no longer than about a second to arrive.
function Letters({ from, text }: { from: 'left' | 'right'; text: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { margin: BAND })
  const reduced = useReducedMotion()
  const count = text.replaceAll(' ', '').length
  const stagger = Math.min(0.045, 1 / count)
  let n = 0
  return (
    <span ref={ref} className="sf-letters">
      <span className="sf-sr">{text}</span>
      <span aria-hidden="true">
        {text.split(' ').map((word, w) => (
          <Fragment key={w}>
            {w > 0 && ' '}
            <span className="sf-word">
              {[...word].map((ch, j) => {
                const i = n++
                const show = reduced || inView
                return (
                  <motion.span
                    key={j}
                    className="sf-letter"
                    initial={false}
                    animate={{ x: show ? 0 : from === 'left' ? '-100vw' : '100vw' }}
                    transition={reduced ? { duration: 0 } : { duration: show ? 0.7 : 0.5, ease: EASE, delay: show ? (from === 'left' ? count - 1 - i : i) * stagger : 0 }}
                  >
                    {ch}
                  </motion.span>
                )
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  )
}

// KHANFLOW.COM arrives spread wide and closes up into the word, as on the homepage, reopening as it leaves.
// Padding-left matches the trailing letter-space so the word stays centred throughout.
function Closing() {
  const ref = useRef<HTMLParagraphElement>(null)
  const inView = useInView(ref, { margin: BAND })
  const reduced = useReducedMotion()
  const closed = reduced || inView
  return (
    <p ref={ref} className="sf-big sf-closing">
      <motion.a
        className="no-glow"
        href={startup.url}
        target="_blank"
        rel="noreferrer"
        initial={false}
        animate={{ letterSpacing: closed ? '-0.01em' : '0.9em', paddingLeft: closed ? '0em' : '0.9em' }}
        transition={reduced ? { duration: 0 } : { duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        KHANFLOW.COM
      </motion.a>
    </p>
  )
}

// Quieter lines fade in and out with the same band instead of sliding.
function useFade<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const inView = useInView(ref, { margin: BAND })
  const reduced = useReducedMotion()
  return {
    ref,
    initial: false,
    animate: { opacity: reduced || inView ? 1 : 0 },
    transition: reduced ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' as const },
  }
}

function Fade({ children }: { children: ReactNode }) {
  return <motion.div {...useFade<HTMLDivElement>()}>{children}</motion.div>
}

// On the <li> itself so the bullet fades with its line.
function FadeItem({ children }: { children: ReactNode }) {
  return <motion.li className="sf-item" {...useFade<HTMLLIElement>()}>{children}</motion.li>
}

export default function Sf() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [chatOpen, setChatOpen] = useState(false)
  useEffect(() => { getTimeline().then(setEntries) }, [])

  // on the root because the theme also reaches the stars, header and cursor glow, which live outside this page
  useLayoutEffect(() => {
    document.documentElement.classList.add('sf-light')
    return () => document.documentElement.classList.remove('sf-light')
  }, [])

  const links = [
    { label: 'Email', href: `mailto:${contacts.email}`, icon: <MailIcon /> },
    { label: 'Phone', href: `tel:${contacts.phone.replace(/[^+\d]/g, '')}`, icon: <PhoneIcon /> },
    { label: 'LinkedIn', href: contacts.linkedin, icon: <LinkedInIcon /> },
    { label: 'GitHub', href: contacts.github, icon: <GitHubIcon /> },
  ]

  return (
    <main className="sf">
      <h1 className="sf-big sf-right"><Letters from="left" text={`${person.name.toUpperCase()}.`} /></h1>

      <p className="sf-creds sf-right">
        {person.credentials.map((c) => <span key={c}>{c.toUpperCase()}</span>)}
      </p>

      <Fade><p>{story[0]}</p></Fade>
      <Fade><p>{story[1]}</p></Fade>

      <ul className="sf-timeline">
        {entries.map((e) => (
          <FadeItem key={e.id}>
            {/* the first entry only gives the year and place here; the story line above already tells it */}
            {e.id === 'bd' ? (
              <>{e.year} — {places.find((p) => p.id === e.place)?.name}</>
            ) : (
              <>
                {e.year} —{' '}
                <strong>{e.link ? <a className="no-glow" href={e.link} target="_blank" rel="noreferrer">{e.title}</a> : e.title}</strong>{' '}
                — {places.find((p) => p.id === e.place)?.name} — {e.description}
              </>
            )}
          </FadeItem>
        ))}
      </ul>
      {/* held until the timeline loads, or these would start sliding in high up and then get pushed down */}
      {entries.length > 0 && (
        <>
          <Fade><p className="sf-center sf-gap">Check it out:</p></Fade>
          <Closing />
          <Fade><p className="sf-center">{startup.tagline}</p></Fade>

          <Fade>
            <ul className="sf-icons">
              {links.map((l) => (
                <li key={l.label}>
                  <a className="no-glow" href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" aria-label={l.label}>{l.icon}</a>
                </li>
              ))}
            </ul>
          </Fade>
        </>
      )}

      <div className="sf-robbit">
        {chatOpen && <Chat open onClose={() => setChatOpen(false)} />}
        <button type="button" className="no-glow" onClick={() => setChatOpen((o) => !o)} aria-label={chatOpen ? 'Close chat with Robbit' : 'Chat with Robbit'}>
          <Rabbit size={64} landed excited={chatOpen} />
        </button>
      </div>
    </main>
  )
}
