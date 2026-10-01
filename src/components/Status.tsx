import { Icon } from './Icon'

/** Polite inline confirmation (no popups). Keeps its space so layout doesn't jump. */
export function Status({ message }: { message: string }) {
  return (
    <p className="status" role="status" aria-live="polite">
      {message && (
        <>
          <Icon name="check" />
          <span>{message}</span>
        </>
      )}
    </p>
  )
}
