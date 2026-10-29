import './rabbit.css'

type Props = {
  flying?: boolean
  landed?: boolean
  excited?: boolean
  size?: number
}

// Robbit's head. Ears flutter in flight, flop sideways at rest, perk up when excited.
// The detached paw only appears (and waves) when excited.
export default function Rabbit({ flying, landed, excited, size = 112 }: Props) {
  const cls = ['rabbit', flying && 'is-flying', landed && 'is-landed', excited && 'is-excited'].filter(Boolean).join(' ')
  return (
    <svg className={cls} width={size} height={size * 1.2} viewBox="0 0 120 144" aria-hidden="true">
      <defs>
        <radialGradient id="fur" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#e3e6ea" />
          <stop offset="1" stopColor="#b4bac2" />
        </radialGradient>
        <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2c879" />
          <stop offset="1" stopColor="#ee9a5c" />
        </linearGradient>
      </defs>

      <g className="ear ear-l">
        <ellipse cx="44" cy="30" rx="11" ry="29" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" />
        <ellipse cx="44" cy="32" rx="5" ry="20" fill="url(#inner)" />
      </g>
      <g className="ear ear-r">
        <ellipse cx="76" cy="30" rx="11" ry="29" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" />
        <ellipse cx="76" cy="32" rx="5" ry="20" fill="url(#inner)" />
      </g>

      <g className="arm arm-l"><path d="M36 112 q-12 10 -6 22 q8 4 12 -8 z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" /></g>
      <g className="arm arm-r"><path d="M84 112 q12 10 6 22 q-8 4 -12 -8 z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" /></g>

      <circle cx="60" cy="86" r="40" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" />
      <circle cx="38" cy="96" r="7" fill="#ee7b3a" opacity=".18" />
      <circle cx="82" cy="96" r="7" fill="#ee7b3a" opacity=".18" />
      <g className="eyes">
        <circle cx="46" cy="82" r="5" fill="#16171a" />
        <circle cx="74" cy="82" r="5" fill="#16171a" />
        <circle cx="47.6" cy="80.2" r="1.6" fill="#fff" />
        <circle cx="75.6" cy="80.2" r="1.6" fill="#fff" />
      </g>
      <path d="M56 91 h8 l-4 4.5 z" fill="#ee7b3a" />
      <path d="M60 95.5 q-3 5 -7 3 M60 95.5 q3 5 7 3" fill="none" stroke="#16171a" strokeWidth="1.6" strokeLinecap="round" />

      <g className="paw">
        <ellipse cx="112" cy="68" rx="11" ry="10" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" />
        <circle cx="112" cy="71" r="3.2" fill="#ee9a5c" />
        <circle cx="106.5" cy="64.5" r="2" fill="#ee9a5c" />
        <circle cx="112" cy="62.5" r="2" fill="#ee9a5c" />
        <circle cx="117.5" cy="64.5" r="2" fill="#ee9a5c" />
      </g>
    </svg>
  )
}
