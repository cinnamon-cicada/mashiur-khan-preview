import { useEffect, useRef } from 'react'

const HOT = 'a, button, [role="button"], input, textarea'

// A soft gold light that follows the pointer and swells over anything interactive. Mouse/pen only.
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches) return
    const el = ref.current!
    const onMove = (e: PointerEvent) => {
      el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      el.classList.add('is-on')
      el.classList.toggle('is-hot', !!(e.target as Element | null)?.closest?.(HOT))
    }
    const onLeave = () => el.classList.remove('is-on')
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
    }
  }, [])
  return <div className="cursor-glow" ref={ref} aria-hidden="true" />
}
