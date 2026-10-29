// Single source of copy and data for both routes.
// Entries marked SAMPLE are placeholders until the LinkedIn export is in hand.

export const person = {
  name: 'Mashiur Khan',
  credentials: ['Founder', 'Ex-Oracle', 'Vanderbilt'],
  intro:
    'I build software that gives people their time back. I grew up in Bangladesh, studied computer science at Vanderbilt, shipped at Oracle, and now I am building Khanflow in San Francisco.',
  mission: 'Mission: make every calendar work for the person who owns it.',
}

export const story = [
  'In 2022, I had yet to take a plane. I was in Bangladesh.',
  '4 years later, I launched my first startup in SF.',
]

export const startup = {
  name: 'khanflow.com',
  url: 'https://khanflow.com',
  tagline: 'The AI planner that makes room for your life.',
  about:
    'Khanflow pulls Google, Outlook and iPhone calendars and to-do lists into one place. You talk or type to its assistant to find time for what matters, and nothing moves until you approve it. It ships on iPhone and Apple Watch, with booking links, syllabus import, and an MCP server for Claude, ChatGPT, Cursor and VS Code.',
  cofounder: { name: 'Tausif Samin', photo: '/img/tausif.jpg', linkedin: 'https://www.linkedin.com/in/tausifsamin/' },
}

export type Place = { id: string; name: string; coords: [number, number] }

export const places: Place[] = [
  { id: 'dhaka', name: 'Dhaka, Bangladesh', coords: [90.41, 23.81] },
  { id: 'nashville', name: 'Nashville, TN', coords: [-86.78, 36.16] },
  { id: 'nyc', name: 'New York, NY', coords: [-74.0, 40.71] }, // SAMPLE
  { id: 'austin', name: 'Austin, TX', coords: [-97.74, 30.27] }, // SAMPLE
  { id: 'sf', name: 'San Francisco, CA', coords: [-122.42, 37.77] },
]

export type TimelineEntry = {
  id: string
  year: string
  place: string // Place id
  title: string
  description: string
  link?: string
}

// SAMPLE: replace with LinkedIn history (https://www.linkedin.com/in/mashter/)
export const timeline: TimelineEntry[] = [
  { id: 'bd', year: '2022', place: 'dhaka', title: 'Where it started', description: 'Self-taught programmer. Had yet to take a plane.' },
  { id: 'vu', year: '2022', place: 'nashville', title: 'Vanderbilt University', description: 'B.S. Computer Science. First flight, first hackathon.' },
  { id: 'js', year: '2024', place: 'nyc', title: 'Jane Street program', description: 'Selected for a Jane Street early-talent program.' },
  { id: 'or', year: '2025', place: 'austin', title: 'Oracle, Software Engineer Intern', description: 'Shipped production features on a cloud infrastructure team.' },
  { id: 'kf', year: '2026', place: 'sf', title: 'Founder, Khanflow', description: 'Launched the AI planner for iPhone and Apple Watch.', link: 'https://khanflow.com' },
]

export const contacts = {
  email: 'hello@khanflow.com', // SAMPLE
  phone: '+1 (000) 000-0000', // SAMPLE
  linkedin: 'https://www.linkedin.com/in/mashter/',
  github: 'https://github.com/', // SAMPLE: add handle
}

export const whoIAm = [
  { label: 'Jane Street', detail: 'Early-talent program, 2024', href: '#' }, // SAMPLE
  { label: 'Oracle', detail: 'Software engineering intern, 2025', href: '#' }, // SAMPLE
  { label: 'Vanderbilt', detail: 'Computer science', href: '#' }, // SAMPLE
]

export const faq = { q: 'Favorite city?', a: 'SF.' }

export const robbitGreeting = 'Hi! I’m Robbit, your furry friend. Ask me anything!'
