import './rabbit.css'

type Props = {
  flying?: boolean
  landed?: boolean
  excited?: boolean
  size?: number
}

// Robbit's head. Ears flutter in flight, flop sideways at rest, perk up when excited.
// When excited, the right arm lifts and waves.
const rightArm = <path d="M83.7 121.1 C89.5 113.6 96.2 105.8 104.1 104.1 C113.8 101.6 120.3 119.4 111.3 123.8 C104.1 127.5 93.6 124.9 84.3 122.9 Z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" />

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
          {/* cool periwinkle inner ears, to sit with the blue palette */}
          <stop offset="0" stopColor="#b9c8f2" />
          <stop offset="1" stopColor="#9fb2e6" />
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
      <g className="arm arm-l"><path d="M36.3 121.1 C30.5 113.6 23.8 105.8 15.9 104.1 C6.2 101.6 -0.3 119.4 8.7 123.8 C15.9 127.5 26.4 124.9 35.7 122.9 Z" fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5" /></g>
      <g className="arm arm-r">{rightArm}</g>

      {/* bun-shaped head: narrower crown, full cheeks, soft flat chin */}
      <path
        d="M60 49 C80 48 95 60 98 78 C102 98 94 118 76 123 C68 125 52 125 44 123 C26 118 18 98 22 78 C25 60 40 50 60 49 Z"
        fill="url(#fur)" stroke="#9aa0a8" strokeWidth="1.5"
      />
      <circle cx="38" cy="96" r="7" fill="#7f9fe6" opacity=".22" />
      <circle cx="82" cy="96" r="7" fill="#7f9fe6" opacity=".22" />
      <g className="eyes">
        <circle cx="46" cy="81.5" r="6.4" fill="#16171a" />
        <circle cx="74" cy="81.5" r="6.4" fill="#16171a" />
        <circle cx="48" cy="79.2" r="2.1" fill="#fff" />
        <circle cx="76" cy="79.2" r="2.1" fill="#fff" />
      </g>
      <path d="M56 91 h8 l-4 4.5 z" fill="#8a9fd8" />
      <path d="M60 95.5 q-3 5 -7 3 M60 95.5 q3 5 7 3" fill="none" stroke="#16171a" strokeWidth="1.6" strokeLinecap="round" />

      {/* the same right arm drawn over the face, swapped in while it waves */}
      <g className="arm arm-r arm-front">{rightArm}</g>
    </svg>
  )
}
