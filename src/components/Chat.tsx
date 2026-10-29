import { useEffect, useRef, useState } from 'react'
import { sendChat, type ChatMessage } from '../api/mock'
import { robbitGreeting } from '../content'
import './chat.css'

type Props = { open: boolean; onClose: () => void; onPeek?: () => void }

// Robbit's speech bubble. Collapsed it shows the greeting; open it becomes a chat.
export default function Chat({ open, onClose, onPeek }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'robbit', text: robbitGreeting }])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const list = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: 'smooth' }) }, [messages, busy])
  useEffect(() => { if (open) input.current?.focus() }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user' as const, text }]
    setMessages(next)
    setDraft('')
    setBusy(true)
    const reply = await sendChat(next)
    setMessages((m) => [...m, reply])
    setBusy(false)
  }

  if (!open) return <button type="button" className="bubble bubble-peek" onClick={onPeek}>{robbitGreeting}</button>

  return (
    <div className="bubble bubble-chat" role="dialog" aria-label="Chat with Robbit" onPointerDown={(e) => e.stopPropagation()}>
      <div className="chat-head">
        <span>Robbit</span>
        <button type="button" onClick={onClose} aria-label="Close chat">×</button>
      </div>
      <div className="chat-list" ref={list}>
        {messages.map((m, i) => <p key={i} className={`msg msg-${m.role}`}>{m.text}</p>)}
        {busy && <p className="msg msg-robbit typing"><i /><i /><i /></p>}
      </div>
      <form className="chat-form" onSubmit={submit}>
        <input ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask about Khanflow…" aria-label="Message" />
        <button type="submit" disabled={!draft.trim() || busy}>Send</button>
      </form>
    </div>
  )
}
