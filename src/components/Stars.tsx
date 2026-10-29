import { useMemo } from 'react'

const COUNT = 16 // very sparse on purpose

// A handful of faint stars fixed behind the whole site, each pulsing on its own slow rhythm.
export default function Stars() {
  const stars = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: 2.5 + Math.random() * 2.5,
        dur: 3 + Math.random() * 4,
        delay: -Math.random() * 7,
        blue: Math.random() < 0.3,
      })),
    [],
  )
  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s, i) => (
        <i
          key={i}
          className={s.blue ? 'is-blue' : undefined}
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDuration: `${s.dur}s`, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  )
}
