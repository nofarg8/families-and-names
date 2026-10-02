/**
 * App updates are applied only on the home screen, so a new version never
 * reloads the page while someone is typing a story or in the middle of a game.
 */
let pending: (() => void) | null = null
let currentPath = window.location.pathname

function maybeApply() {
  if (pending && currentPath === '/') {
    const apply = pending
    pending = null
    apply()
  }
}

export function setUpdateReady(apply: () => void) {
  pending = apply
  maybeApply()
}

export function notifyRoute(pathname: string) {
  currentPath = pathname
  maybeApply()
}
