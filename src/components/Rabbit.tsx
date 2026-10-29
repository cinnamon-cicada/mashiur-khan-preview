import './rabbit.css'

type Props = {
  flying?: boolean
  landed?: boolean
  excited?: boolean
  size?: number
}

// Robbit's head. Ears flutter in flight, flop sideways at rest, perk up when excited.
// When excited, the right arm lifts and waves.
export default function Rabbit({ flying, landed, excited, size = 112 }: Props) {
  const cls = ['rabbit', flying && 'is-flying', landed && 'is-landed', excited && 'is-excited'].filter(Boolean).join(' ')
  return (
    <svg className={cls} width={size} height={size * 1.2} viewBox="0 0 120 144" aria-hidden="true">
      <defs>
        <radialGradient id="fur" cx="40%" cy="35%" r="75%">
          {/* soft moonlit silver-white rather than paper white, so it sits quietly on the night background */}
          <stop offset="0" stopColor="#e3e6ec" />
          <stop offset=".75" stopColor="#d3d8e0" />
          <stop offset="1" stopColor="#bcc3ce" />
        </radialGradient>
        <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f1bd78" />
          <stop offset="1" stopColor="#eeac6c" />
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

      {/* arms pop out sideways near the chin: pinched where they meet the body, round paws at the tips */}
      <g className="arm arm-l"><path d="M36 121 C28 119 19 115 11 117 C4 119 4 128 11 129 C18 130 27 125 36 123 Z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" /></g>
      <g className="arm arm-r"><path d="M84 121 C92 119 101 115 109 117 C116 119 116 128 109 129 C102 130 93 125 84 123 Z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" /></g>

      {/* bun-shaped head: narrower crown, full cheeks, soft flat chin */}
      <path
        d="M60 49 C80 48 95 60 98 78 C102 98 94 118 76 123 C68 125 52 125 44 123 C26 118 18 98 22 78 C25 60 40 50 60 49 Z"
        fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5"
      />
      <circle cx="38" cy="96" r="7" fill="#ee7b3a" opacity=".18" />
      <circle cx="82" cy="96" r="7" fill="#ee7b3a" opacity=".18" />
      <g className="eyes">
        <circle cx="46" cy="81.5" r="6.4" fill="#16171a" />
        <circle cx="74" cy="81.5" r="6.4" fill="#16171a" />
        <circle cx="48" cy="79.2" r="2.1" fill="#fff" />
        <circle cx="76" cy="79.2" r="2.1" fill="#fff" />
      </g>
      <path d="M56 91 h8 l-4 4.5 z" fill="#ee7b3a" />
      <path d="M60 95.5 q-3 5 -7 3 M60 95.5 q3 5 7 3" fill="none" stroke="#16171a" strokeWidth="1.6" strokeLinecap="round" />

    </svg>
  )
}
