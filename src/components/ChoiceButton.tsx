import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean
  children: ReactNode
}

export function ChoiceButton({ selected = false, children, ...rest }: Props) {
  return (
    <button type="button" className="btn btn-choice" aria-pressed={selected} {...rest}>
      {children}
    </button>
  )
}
