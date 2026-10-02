import type { CSSProperties } from 'react'

const COLORS = ['#A3243B', '#C9952B', '#2E7D4F', '#1F4E79']
const COUNT = 18

const prefersReducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/** A small, tasteful burst of carpet-style diamonds. Purely decorative. */
export function Celebration() {
  if (prefersReducedMotion()) return null
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: COUNT }, (_, i) => {
        const angle = (360 / COUNT) * i + (i % 2 ? 8 : -8)
        const distance = 90 + (i % 3) * 35
        const style = {
          '--angle': `${angle}deg`,
          '--distance': `${distance}px`,
          '--delay': `${(i % 4) * 30}ms`,
          background: COLORS[i % COLORS.length],
        } as CSSProperties
        return <span key={i} className="celebration-piece" style={style} />
      })}
    </div>
  )
}
