const s = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }

export const MailIcon = () => (
  <svg {...s}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></svg>
)
export const PhoneIcon = () => (
  <svg {...s}><path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z" /></svg>
)
export const LinkedInIcon = () => (
  <svg {...s}><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M8 10.5V16M8 7.6v.1M12 16v-3.2a2.3 2.3 0 0 1 4.6 0V16M12 10.5V16" /></svg>
)
export const GitHubIcon = () => (
  <svg {...s}><path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.2a2.8 2.8 0 0 0-.8-2.2c2.7-.3 5.5-1.3 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.6 2.9 5.6 3.2 5.6 3.2a4.3 4.3 0 0 0-.1 3.2A4.6 4.6 0 0 0 4.2 9.6c0 4.6 2.8 5.7 5.5 6a2.8 2.8 0 0 0-.8 2.2V21" /></svg>
)
export const ArrowUpRight = ({ size = 18 }: { size?: number }) => (
  <svg {...s} width={size} height={size}><path d="M7 17 17 7M8 7h9v9" /></svg>
)
