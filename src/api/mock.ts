// Mock backend. Swap each function body for a real fetch when the services exist.
import { contacts, person, startup, timeline, type TimelineEntry } from '../content'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Real version: GET /api/linkedin/timeline. LinkedIn answers scrapers with HTTP 999,
// so this needs an official data export or a profile-data provider.
export async function getTimeline(): Promise<TimelineEntry[]> {
  await delay(250)
  return timeline
}

export type ChatMessage = { role: 'user' | 'robbit'; text: string }

const answers: [RegExp, string][] = [
  [/khanflow|startup|product|app/i, `${startup.tagline} ${startup.about}`],
  [/invest|raise|round|fund|pitch|deck/i, `Mashiur would love to talk. Email ${contacts.email} and he'll send the deck.`],
  [/oracle/i, 'Mashiur shipped production features at Oracle before founding Khanflow.'],
  [/vanderbilt|school|study|college/i, 'He studied computer science at Vanderbilt in Nashville.'],
  [/jane street/i, 'He was selected for a Jane Street early-talent program.'],
  [/tausif|cofounder|co-founder|team/i, 'Tausif is his cofounder. They build Khanflow together in SF.'],
  [/bangladesh|where.*from|grew up/i, 'He grew up in Bangladesh. In 2022 he had never been on a plane.'],
  [/city|sf|san francisco/i, 'Favorite city in the world? SF, obviously.'],
  [/contact|email|reach|phone/i, `Email ${contacts.email}, or find him on LinkedIn.`],
  [/hi|hello|hey/i, 'Hi hi! Ask me about Khanflow, Mashiur, or his favorite city.'],
]

// Real version: POST /api/chat → server route calling the Claude API with content.ts as context.
export async function sendChat(history: ChatMessage[]): Promise<ChatMessage> {
  await delay(500 + Math.random() * 400)
  const last = history[history.length - 1]?.text ?? ''
  const hit = answers.find(([re]) => re.test(last))
  return { role: 'robbit', text: hit ? hit[1] : `Good question! I'm a small rabbit, so try asking about ${person.name.split(' ')[0]}, Khanflow, or SF.` }
}
