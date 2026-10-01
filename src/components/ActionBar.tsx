import type { ReactNode } from 'react'

/** Main actions, pinned to the bottom of the screen (thumb zone). */
export function ActionBar({ children }: { children: ReactNode }) {
  return <div className="action-bar">{children}</div>
}
