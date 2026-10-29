import { useState } from 'react'
import Rabbit from '../components/Rabbit'
import Chat from '../components/Chat'
import { ArrowUpRight } from '../components/Icons'
import { contacts, faq, person, startup, whoIAm } from '../content'
import './sf.css'

const YEAR = new Date().getFullYear()
const initials = (name: string) => name.split(' ').map((w) => w[0]).join('')

export default function Sf() {
  const [chatOpen, setChatOpen] = useState(false)
  const links = [
    { label: 'GitHub', href: contacts.github },
    { label: 'LinkedIn', href: contacts.linkedin },
    { label: 'Email', href: `mailto:${contacts.email}` },
    { label: 'Phone', href: `tel:${contacts.phone.replace(/[^+\d]/g, '')}` },
  ]

  return (
    <main className="sf">
      <section className="sf-intro">
        <div className="sf-intro-text">
          <h1 className="metal">{person.name}</h1>
          <p className="sf-role">Founder, <a href={startup.url} target="_blank" rel="noreferrer">Khanflow</a></p>
          <p>{person.intro}</p>
          <p className="sf-mission">{person.mission}</p>
          <ul className="sf-links">
            {links.map((l) => (
              <li key={l.label}><a href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">{l.label}</a></li>
            ))}
          </ul>
        </div>
        <div className="sf-photo" aria-label={`Photo of ${person.name} (placeholder)`}>{initials(person.name)}</div>
      </section>

      <section>
        <h2><a href={startup.url} target="_blank" rel="noreferrer">khanflow.com <ArrowUpRight size={16} /></a></h2>
        <p className="sf-lede">{startup.tagline}</p>
        <p>{startup.about}</p>
        <div className="sf-cofounder">
          <span>Meet my cofounder</span>
          <svg className="sf-arrow" viewBox="0 0 60 14" aria-hidden="true"><path d="M1 7h56M51 1l6 6-6 6" /></svg>
          <a className="sf-mate" href={startup.cofounder.linkedin} target="_blank" rel="noreferrer" aria-label={`${startup.cofounder.name} on LinkedIn`}>
            <img className="sf-photo sf-photo-sm" src={startup.cofounder.photo} alt="" />
            <span className="sf-tip" aria-hidden="true">{startup.cofounder.name}</span>
          </a>
        </div>
      </section>

      <section>
        <h2>Who I am</h2>
        <ul className="sf-list">
          {whoIAm.map((w) => (
            <li key={w.label}>
              <a href={w.href}>{w.label}</a>
              <span>{w.detail}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>FAQ</h2>
        <dl className="sf-faq">
          <dt>{faq.q}</dt>
          <dd>{faq.a}</dd>
        </dl>
      </section>

      <footer className="sf-foot">© {YEAR} {person.name} · San Francisco</footer>

      <div className="sf-robbit">
        {chatOpen && <Chat open onClose={() => setChatOpen(false)} />}
        <button type="button" onClick={() => setChatOpen((o) => !o)} aria-label={chatOpen ? 'Close chat with Robbit' : 'Chat with Robbit'}>
          <Rabbit size={46} landed excited={chatOpen} />
        </button>
      </div>
    </main>
  )
}
